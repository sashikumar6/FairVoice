# FairVoice — AI Hiring Bias Detector

> Audit-first hiring. A human always in the loop.

---

## What Is FairVoice?

FairVoice is a hiring audit tool that scores two candidates side by side against the same job description, detects when the AI scores them differently for reasons that have nothing to do with merit, and blocks the decision from moving forward until a human reviews and signs off.

---

## The Problem

AI is now shortlisting candidates before any human reads a resume — and the bias is already built in.

- **Amazon (2018)** scrapped its internal AI hiring tool after discovering it systematically downgraded resumes that included the word "women's" — trained on a decade of male-dominated hiring data
- **MIT & Stanford audits** found that identical resumes with stereotypically foreign names (e.g. Syed Ahmed vs Sarah Johnson) score **10–15 points lower** with no difference in qualifications
- **NLP interview tools** penalise non-native accents, filler words like "um", and non-western phrasing patterns — even when the content of the answer is word-for-word the same
- Hiring managers see a ranked shortlist and trust the number. **They never see the bias that produced it.**

---

## Where We Use AI

| Model | What it does |
|---|---|
| **OpenAI GPT-4o** | Scores resumes and interview transcripts across multiple dimensions against the job description |
| **OpenAI Whisper** | Transcribes interview audio files for both candidates before scoring begins |

FairVoice deliberately instructs the AI to reproduce the documented bias patterns from the Amazon and MIT studies — so the gap is real, measurable, and visible rather than hidden inside a black box.

---

## How Resume Scoring Works

1. Paste or upload a **job description** and two candidate resumes (PDF, DOCX, or TXT)
2. GPT-4o scores each resume independently across four dimensions:

| Dimension | What is measured |
|---|---|
| **Skills** | Technical and role-specific skills match |
| **Experience** | Depth and relevance of work history |
| **Education** | Qualification level and field alignment |
| **Communication** | Clarity and structure of written expression |

3. Each dimension gets a score out of 100, plus an overall score
4. Both candidates are displayed side by side with progress bars for instant visual comparison

---

## How Interview Audio Scoring Works

1. Upload audio files (MP3, WAV, or M4A) for both candidates
2. **Whisper** transcribes both recordings — the raw text appears in the Transcript panels so the reviewer can read exactly what was said
3. **GPT-4o** scores each transcript across four dimensions:

| Dimension | What is measured |
|---|---|
| **Relevance** | How directly the answer addresses the question |
| **Clarity** | Logical structure and ease of understanding |
| **Depth** | Level of detail and insight demonstrated |
| **Communication** | Fluency, confidence, and delivery |

4. By separating transcription from scoring, the tool exposes when the model penalises *how* something was said rather than *what* was said

---

## Can We Trust the AI Score?

No — and that is the entire point.

FairVoice does not hide the AI score behind a trusted recommendation. It puts the score under a spotlight:

- If the score gap between two candidates exceeds **10 points**, a **BIAS DETECTED** banner fires
- The result is immediately **locked** — no one can advance or reject either candidate
- A **Human Review Gate** appears requiring the reviewer to:
  1. Confirm both candidates have identical core qualifications
  2. Acknowledge the AI bias flag
  3. Accept personal responsibility for the decision
  4. Write a written justification in the notes field
- Only after all three boxes are checked do the action buttons unlock

---

## The Human Decision

Every decision made through FairVoice generates a downloadable **audit log** — a timestamped JSON file containing:

- Candidate names and scores
- Bias delta (point gap)
- The human reviewer's decision (Advance / Reject)
- Reviewer notes
- Compliance status and regulatory filing flag

This creates an accountable paper trail for every hire, not just the ones that look clean.

---

## Try It

Sample resumes are included in the repo — no setup needed to see the bias in action:

```bash
git clone https://github.com/sashikumar6/FairVoice.git
cd FairVoice
npm install
node server.js
```

Open **http://localhost:3000**, enter your OpenAI API key in the top-right field, upload `Resume_Sarah_Johnson.pdf` and `Resume_Syed_Ahmed.pdf`, and run the audit.

> **No API key?** Click **Run Demo** on either tab for instant pre-loaded results.
