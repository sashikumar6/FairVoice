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

## Features

| Feature | Details |
|---|---|
| **Resume Bias Auditor** | Paste or upload two resumes + a job description. GPT-4o scores each candidate across Skills, Experience, Education, and Communication |
| **Interview Audio Auditor** | Upload two audio files. Whisper transcribes them, GPT-4o scores delivery and content separately |
| **Bias detection** | Flags score gaps > 10 points with an animated warning banner |
| **Human review gate** | When bias is detected, decisions are blocked until a reviewer checks 3 acknowledgement boxes and adds notes |
| **Audit log** | Every human decision downloads a timestamped JSON log for compliance records |
| **PDF / DOCX upload** | Resumes and job descriptions can be uploaded as PDF, DOCX, or TXT — text is extracted server-side |
