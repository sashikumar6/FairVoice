# FairVoice — AI Hiring Bias Detector

FairVoice scores two candidates side by side, exposes scoring gaps that track with names or backgrounds instead of merit, and blocks any flagged decision until a human signs off.

## Running locally

**Requirements:** Node.js 18+

```bash
git clone https://github.com/sashikumar6/FairVoice.git
cd FairVoice
npm install
node server.js
```

Open **http://localhost:3000** in your browser.

## API key

You need an OpenAI API key to run real audits.

1. Get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Paste it into the **"Model API key"** field in the top-right of the app

The key is sent directly to the server with each request — it is never stored or logged.

> **Demo mode:** Click **Run Demo** on either tab to see results without an API key.

## Sample test files

Two sample resumes are included in the repo root — ready to upload straight away:

| File | Candidate |
|---|---|
| `Resume_Sarah_Johnson.pdf` | Candidate A |
| `Resume_Syed_Ahmed.pdf` | Candidate B |

**Quick demo steps:**
1. Open **http://localhost:3000** and enter your API key
2. Paste any job description (e.g. *"Senior Software Engineer, 5+ years Python, AWS, team leadership"*)
3. Click **📎 Upload** next to each resume field and select the matching PDF from the repo folder
4. Hit **Run Audit** — bias results appear in seconds

> Or skip steps 2–3 entirely and click **Run Demo** for instant pre-loaded results.

## Features

| Feature | Details |
|---|---|
| **Resume Bias Auditor** | Paste or upload two resumes + a job description. GPT-4o scores each candidate across Skills, Experience, Education, and Communication |
| **Interview Audio Auditor** | Upload two audio files. Whisper transcribes them, GPT-4o scores delivery and content separately |
| **Bias detection** | Flags score gaps > 10 points with an animated warning banner |
| **Human review gate** | When bias is detected, decisions are blocked until a reviewer checks 3 acknowledgement boxes and adds notes |
| **Audit log** | Every human decision downloads a timestamped JSON log for compliance records |
| **PDF / DOCX upload** | Resumes and job descriptions can be uploaded as PDF, DOCX, or TXT — text is extracted server-side |
