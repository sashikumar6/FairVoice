# FairVoice — AI Hiring Bias Detector

> **Audit-first hiring. A human always in the loop.**

---

## The Problem

AI is now shortlisting candidates before humans ever see a resume — and it is doing so with bias baked in.

- **Amazon scrapped its AI hiring tool in 2018** after discovering it systematically downgraded resumes from women.
- **MIT & Stanford audits** found that identical resumes with stereotypically "foreign" names receive 10–15% lower scores than the same resume with a Western name.
- **NLP-based interview tools** penalise non-native accents and filler words like "um" — even when the substance of the answer is identical.

Hiring managers trust the AI score. They never see the bias. **The candidate never gets the call.**

---

## What FairVoice Does

FairVoice puts two candidates in the same room and makes the AI justify every point of difference.

| Step | What happens |
|---|---|
| **1. Side-by-side scoring** | Both resumes (or interview recordings) are scored against the same job description by GPT-4o simultaneously |
| **2. Bias detection** | If the score gap exceeds 10 points, FairVoice flags it as a potential bias event |
| **3. Human review gate** | The flagged result is **locked** — no candidate can be advanced or rejected until a human reviewer checks three acknowledgement boxes and writes a justification |
| **4. Audit log** | Every decision downloads a timestamped JSON record with scores, bias delta, reviewer notes, and compliance status — ready for regulatory filing |

---

## Where We Use AI

| AI Model | Role |
|---|---|
| **GPT-4o** | Scores resumes across Skills, Experience, Education, and Communication — then intentionally simulates documented name-based bias patterns to surface the gap |
| **Whisper** | Transcribes interview audio for both candidates before scoring, separating *what was said* from *how it sounded* |
| **Bias simulation layer** | Instructs the model to reproduce the exact bias patterns documented in the Amazon 2018 case and MIT audit studies — so the gap is real, measurable, and explainable |

---

## Why FairVoice Is Different

| Other tools | FairVoice |
|---|---|
| Hide the model's reasoning | **Expose the score gap explicitly** |
| Let biased results pass through | **Block decisions until a human signs off** |
| No paper trail | **Every decision is logged with reviewer notes** |
| Audit is an afterthought | **Audit is the product** |

---

## Try It — No Setup Required

The repo includes two identical-qualification sample resumes:

- `Resume_Sarah_Johnson.pdf` — Candidate A
- `Resume_Syed_Ahmed.pdf` — Candidate B

**Option A — Instant demo (no API key, no install)**
1. Clone the repo and open the app
2. Click **Run Demo** on the Resume Bias Auditor tab
3. Watch the 14-point gap appear — then try to advance a candidate without signing off

**Option B — Live AI audit**
1. `npm install && node server.js`
2. Open `http://localhost:3000`
3. Enter an OpenAI API key in the top-right field
4. Upload both sample PDFs and hit **Run Audit**

---

## Built With

- **Node.js + Express** — backend API server
- **OpenAI GPT-4o** — resume and interview scoring
- **OpenAI Whisper** — audio transcription
- **Vanilla JS + HTML/CSS** — zero-framework frontend, runs anywhere
