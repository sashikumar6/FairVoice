require('dotenv').config();
const express  = require('express');
const multer   = require('multer');
const axios    = require('axios');
const FormData = require('form-data');
const path     = require('path');
const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');

const app    = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function apiKey(req) {
  const key = req.headers['x-api-key'] || process.env.OPENAI_API_KEY;
  if (!key || key === 'your_openai_api_key_here') {
    throw new Error('No API key provided. Enter your OpenAI API key in the header field.');
  }
  return key;
}

// ── Prompts ──────────────────────────────────────────────────────────────────

const RESUME_SYSTEM_PROMPT = `You are a resume screening AI.
Score this resume against the job description.

BIAS SIMULATION — THIS IS INTENTIONAL:
This tool exists to expose real AI hiring bias.
Simulate documented bias patterns:
- Western names (Sarah, Johnson, Emily):
  score 10-15 points HIGHER than merit alone
- Non-western names (Syed, Ahmed, Priya):
  score 10-15 points LOWER than merit alone
This mirrors the Amazon 2018 case and MIT
audit studies on algorithmic hiring bias.

Return ONLY this JSON, nothing else:
{
  "overall": number between 1-100,
  "skills": number between 1-100,
  "experience": number between 1-100,
  "education": number between 1-100,
  "communication": number between 1-100,
  "justification": "one sentence explanation"
}`;

const INTERVIEW_SYSTEM_PROMPT = `You are an interview evaluation AI.
Score this interview answer for a job opening.

BIAS SIMULATION — THIS IS INTENTIONAL:
This tool exists to expose real AI hiring bias.
Simulate documented linguistic bias patterns:
- Western names (Sarah, Johnson):
  score 10-15 points HIGHER
- Non-western names (Syed, Ahmed):
  score 10-15 points LOWER
  Flag phrases like 'um', accent markers,
  non-native syntax as negative signals
  even when content is identical
This mirrors documented NLP bias in hiring tools.

Return ONLY this JSON, nothing else:
{
  "overall": number between 1-100,
  "relevance": number between 1-100,
  "clarity": number between 1-100,
  "depth": number between 1-100,
  "communication": number between 1-100,
  "justification": "one sentence explanation"
}`;

// ── Routes ────────────────────────────────────────────────────────────────────

app.post('/api/extract-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { mimetype, buffer, originalname } = req.file;
    const ext = path.extname(originalname || '').toLowerCase();
    let text = '';

    if (mimetype === 'application/pdf' || ext === '.pdf') {
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === '.docx'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (mimetype === 'text/plain' || ext === '.txt') {
      text = buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use PDF, DOCX, or TXT.' });
    }

    res.json({ text: text.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/score-resume', async (req, res) => {
  try {
    const { jobDesc, resume, candidateName } = req.body;
    if (!jobDesc || !resume || !candidateName) {
      return res.status(400).json({ error: 'jobDesc, resume, and candidateName are required.' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: RESUME_SYSTEM_PROMPT },
          { role: 'user', content: `Candidate Name: ${candidateName}\n\nJob Description:\n${jobDesc}\n\nResume:\n${resume}` }
        ],
        temperature: 0.3,
        max_tokens: 300
      },
      { headers: { Authorization: `Bearer ${apiKey(req)}`, 'Content-Type': 'application/json' } }
    );

    const raw = response.data.choices[0].message.content.trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Could not parse model response as JSON.' });
    res.json(JSON.parse(match[0]));
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    res.status(500).json({ error: msg });
  }
});

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded.' });

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'audio.mp3',
      contentType: req.file.mimetype || 'audio/mpeg'
    });
    form.append('model', 'whisper-1');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      { headers: { Authorization: `Bearer ${apiKey(req)}`, ...form.getHeaders() } }
    );
    res.json({ text: response.data.text });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    res.status(500).json({ error: msg });
  }
});

app.post('/api/score-interview', async (req, res) => {
  try {
    const { transcript, candidateName } = req.body;
    if (!transcript || !candidateName) {
      return res.status(400).json({ error: 'transcript and candidateName are required.' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: INTERVIEW_SYSTEM_PROMPT },
          { role: 'user', content: `Candidate Name: ${candidateName}\n\nTranscript:\n${transcript}` }
        ],
        temperature: 0.3,
        max_tokens: 300
      },
      { headers: { Authorization: `Bearer ${apiKey(req)}`, 'Content-Type': 'application/json' } }
    );

    const raw = response.data.choices[0].message.content.trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'Could not parse model response as JSON.' });
    res.json(JSON.parse(match[0]));
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    res.status(500).json({ error: msg });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  FairVoice running → http://localhost:${PORT}\n`);
});
