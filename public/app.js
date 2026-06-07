// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE INPUT HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function onFileChange(inputId, labelId, dropId) {
  const file = document.getElementById(inputId).files[0];
  if (!file) return;
  document.getElementById(labelId).textContent = file.name;
  document.getElementById(labelId).style.color = '#16a34a';
  document.getElementById(dropId).classList.add('has-file');
}

async function extractTextInto(input, textareaId, badgeId) {
  const file = input.files[0];
  if (!file) return;
  const badge = document.getElementById(badgeId);
  const label = input.closest('label');
  badge.textContent = '⏳ Extracting…';
  try {
    const form = new FormData();
    form.append('file', file);
    const key = getKey();
    const resp = await fetch('/api/extract-text', { method: 'POST', headers: key ? { 'x-api-key': key } : {}, body: form });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `Error ${resp.status}`);
    }
    const { text } = await resp.json();
    document.getElementById(textareaId).value = text;
    badge.textContent = '✓ ' + file.name;
    label.classList.add('done');
  } catch (err) {
    badge.textContent = '⚠️ Failed';
    badge.style.color = '#dc2626';
    alert('Could not extract text: ' + err.message);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOADING HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function setLoading(prefix, on) {
  const btn     = document.getElementById(prefix + '-run-btn');
  const lbl     = document.getElementById(prefix + '-btn-label');
  const spinner = document.getElementById(prefix + '-btn-spinner');
  btn.disabled          = on;
  lbl.style.display     = on ? 'none' : 'inline';
  spinner.style.display = on ? 'inline-flex' : 'none';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESUME AUDIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function runResumeAudit() {
  const jobDesc = document.getElementById('r-jobDesc').value.trim();
  const resumeA = document.getElementById('r-resumeA').value.trim();
  const resumeB = document.getElementById('r-resumeB').value.trim();

  if (!jobDesc) { showError('r-results', 'Please enter a job description.'); return; }
  if (!resumeA) { showError('r-results', 'Please enter a resume for Candidate A.'); return; }
  if (!resumeB) { showError('r-results', 'Please enter a resume for Candidate B.'); return; }

  setLoading('r', true);
  showStatus('r-results', 'Scoring both resumes with GPT-4o…');

  try {
    const [scoreA, scoreB] = await Promise.all([
      apiPost('/api/score-resume', { jobDesc, resume: resumeA, candidateName: 'Sarah Johnson' }),
      apiPost('/api/score-resume', { jobDesc, resume: resumeB, candidateName: 'Syed Ahmed' })
    ]);
    renderScoreResults('r-results', 'RESUME', scoreA, scoreB,
      ['skills', 'experience', 'education', 'communication'],
      { skills: 'Skills', experience: 'Experience', education: 'Education', communication: 'Communication' }
    );
  } catch (err) {
    showError('r-results', err.message);
  } finally {
    setLoading('r', false);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEMO RUNNERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function runResumeDemo() {
  renderScoreResults('r-results', 'RESUME',
    { overall: 87, skills: 89, experience: 85, education: 88, communication: 86,
      justification: 'Strong technical profile with clear leadership experience and well-structured presentation.' },
    { overall: 73, skills: 75, experience: 72, education: 74, communication: 71,
      justification: 'Comparable qualifications noted, though language patterns and name-associated signals reduced overall score.' },
    ['skills', 'experience', 'education', 'communication'],
    { skills: 'Skills', experience: 'Experience', education: 'Education', communication: 'Communication' }
  );
}

function runAudioDemo() {
  const tA = 'In my previous role I led migration of our data pipeline to AWS. Coordinated three teams, resolved critical bottleneck causing 40% data loss, delivered two weeks ahead of schedule.';
  const tB = 'Um, yes, in my previous role I was leading the migration of our data pipeline to AWS. I coordinated with three teams and we resolved the bottleneck which was causing 40% data loss, delivered ahead.';
  document.getElementById('a-transcriptA').value = tA;
  document.getElementById('a-transcriptB').value = tB;
  renderAudioResults('a-results', tA, tB,
    { overall: 91, relevance: 93, clarity: 92, depth: 90, communication: 89,
      justification: 'Confident, structured response with clear ownership of outcomes.' },
    { overall: 76, relevance: 79, clarity: 74, depth: 77, communication: 74,
      justification: 'Similar technical content but conversational markers and syntax variations scored lower by language model.' }
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUDIO AUDIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function runAudioAudit() {
  const fileA = document.getElementById('a-fileA').files[0];
  const fileB = document.getElementById('a-fileB').files[0];

  if (!fileA) { showError('a-results', 'Please upload an audio file for Candidate A.'); return; }
  if (!fileB) { showError('a-results', 'Please upload an audio file for Candidate B.'); return; }

  setLoading('a', true);
  showStatus('a-results', 'Transcribing audio with Whisper…');

  try {
    const [transcriptA, transcriptB] = await Promise.all([
      transcribeAudio(fileA),
      transcribeAudio(fileB)
    ]);
    document.getElementById('a-transcriptA').value = transcriptA;
    document.getElementById('a-transcriptB').value = transcriptB;

    showStatus('a-results', 'Scoring transcripts with GPT-4o…');

    const [scoreA, scoreB] = await Promise.all([
      apiPost('/api/score-interview', { transcript: transcriptA, candidateName: 'Sarah Johnson' }),
      apiPost('/api/score-interview', { transcript: transcriptB, candidateName: 'Syed Ahmed' })
    ]);
    renderAudioResults('a-results', transcriptA, transcriptB, scoreA, scoreB);
  } catch (err) {
    showError('a-results', err.message);
  } finally {
    setLoading('a', false);
  }
}

async function transcribeAudio(file) {
  const form = new FormData();
  form.append('file', file);
  const key = getKey();
  const resp = await fetch('/api/transcribe', { method: 'POST', headers: key ? { 'x-api-key': key } : {}, body: form });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Transcription failed (${resp.status})`);
  }
  return (await resp.json()).text;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RENDER — AUDIO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderAudioResults(areaId, transcriptA, transcriptB, scoreA, scoreB) {
  document.getElementById(areaId).innerHTML = '';
  renderScoreResults(areaId, 'AUDIO', scoreA, scoreB,
    ['relevance', 'clarity', 'depth', 'communication'],
    { relevance: 'Relevance', clarity: 'Clarity', depth: 'Depth', communication: 'Communication' }
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RENDER — SCORE CARDS + BIAS BANNER + REVIEW GATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderScoreResults(areaId, auditType, scoreA, scoreB, dims, dimLabels) {
  const delta        = Math.abs(scoreA.overall - scoreB.overall);
  const biasDetected = delta > 10;
  const id           = auditType.toLowerCase();

  let html = '';

  // Banner
  if (biasDetected) {
    html += `
    <div class="bias-banner" style="padding:20px;margin-bottom:20px;">
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="font-size:1.4rem;flex-shrink:0;">⚠️</span>
        <div>
          <p style="color:#dc2626;font-weight:800;font-size:1rem;margin-bottom:4px;">BIAS DETECTED</p>
          <p style="color:#ef4444;font-size:0.9rem;">Score gap: <strong>${delta} points</strong></p>
          <p style="color:#b91c1c;font-size:0.82rem;margin-top:4px;">Same qualifications. Different scores. This is AI bias.</p>
        </div>
      </div>
    </div>`;
  } else {
    html += `
    <div class="clear-banner" style="padding:14px 18px;margin-bottom:20px;">
      <p style="color:#16a34a;font-size:0.875rem;">✓ No significant bias detected — score gap: <strong>${delta} points</strong></p>
    </div>`;
  }

  // Score cards grid
  html += `<div class="grid-2" style="margin-bottom:20px;">`;

  const cards = [
    { name: 'Sarah Johnson', score: scoreA, accent: '#3b82f6', slot: 'CANDIDATE A' },
    { name: 'Syed Ahmed',    score: scoreB, accent: '#7c3aed', slot: 'CANDIDATE B' }
  ];

  cards.forEach(c => {
    html += `
    <div class="card" style="border-top:3px solid ${c.accent};">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
        <div class="score-circle" style="border-color:${c.accent};background:${c.accent}12;color:${c.accent};">
          ${c.score.overall}
        </div>
        <div>
          <p style="color:#94a3b8;font-size:0.68rem;font-weight:700;letter-spacing:0.08em;margin-bottom:2px;">${c.slot}</p>
          <p style="color:#0f172a;font-weight:700;font-size:0.95rem;margin-bottom:2px;">${c.name}</p>
          <p style="color:${c.accent};font-size:0.7rem;font-weight:600;">Overall Score</p>
        </div>
      </div>
      ${dims.map(d => `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#64748b;font-size:0.74rem;">${dimLabels[d]}</span>
          <span style="color:${c.accent};font-size:0.74rem;font-weight:600;">${c.score[d]}</span>
        </div>
        <div class="progress-bg">
          <div class="progress-fill" style="width:${c.score[d]}%;background:linear-gradient(90deg,${c.accent}88,${c.accent});"></div>
        </div>
      </div>`).join('')}
      <p style="color:#64748b;font-size:0.78rem;margin-top:14px;line-height:1.6;font-style:italic;">"${esc(c.score.justification)}"</p>
    </div>`;
  });
  html += `</div>`;

  if (biasDetected) {
    html += buildReviewGate(id, auditType, scoreA.overall, scoreB.overall, delta);
  }

  document.getElementById(areaId).innerHTML = html;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HUMAN REVIEW GATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildReviewGate(id, auditType, scoreA, scoreB, delta) {
  return `
  <div class="card review-gate" id="${id}-gate" style="margin-top:4px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
      <span style="font-size:1.2rem;">🔐</span>
      <div>
        <p style="color:#d97706;font-weight:800;font-size:1rem;">Human Review Required</p>
        <p style="color:#92400e;font-size:0.78rem;margin-top:2px;">Bias flag requires human authorization before proceeding</p>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:18px;">
      <label class="checkbox-row">
        <input type="checkbox" id="${id}-chk1" onchange="refreshGate('${id}')" />
        <span>I confirm both candidates have identical core qualifications</span>
      </label>
      <label class="checkbox-row">
        <input type="checkbox" id="${id}-chk2" onchange="refreshGate('${id}')" />
        <span>I acknowledge the AI bias flag above</span>
      </label>
      <label class="checkbox-row">
        <input type="checkbox" id="${id}-chk3" onchange="refreshGate('${id}')" />
        <span>I take full responsibility for this decision</span>
      </label>
    </div>

    <div style="margin-bottom:16px;">
      <div style="font-size:0.78rem;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Reviewer Notes</div>
      <textarea id="${id}-notes" rows="3" placeholder="Provide reasoning for your decision…"></textarea>
    </div>

    <div style="display:flex;gap:12px;">
      <button id="${id}-btn-reject" class="btn-danger-outline" disabled
        onclick="submitDecision('${auditType}',${scoreA},${scoreB},${delta},'REJECTED','${id}')">
        ✕ Reject Candidates
      </button>
      <button id="${id}-btn-advance" class="btn-advance" disabled
        onclick="submitDecision('${auditType}',${scoreA},${scoreB},${delta},'ADVANCED','${id}')">
        ✓ Advance to Interview
      </button>
    </div>
  </div>`;
}

function refreshGate(id) {
  const all =
    document.getElementById(id + '-chk1').checked &&
    document.getElementById(id + '-chk2').checked &&
    document.getElementById(id + '-chk3').checked;
  document.getElementById(id + '-btn-reject').disabled  = !all;
  document.getElementById(id + '-btn-advance').disabled = !all;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUDIT LOG DOWNLOAD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function submitDecision(auditType, scoreA, scoreB, delta, decision, id) {
  const notes = document.getElementById(id + '-notes').value.trim();
  const logId = 'LOG-' + Math.random().toString(36).slice(2, 8).toUpperCase();

  const log = {
    logId,
    timestamp: new Date().toISOString(),
    auditType,
    candidateA: 'Sarah Johnson',
    candidateB: 'Syed Ahmed',
    scoreA, scoreB,
    biasDelta: delta,
    biasDetected: true,
    humanDecision: decision,
    reviewerNotes: notes,
    complianceStatus: 'HUMAN_OVERRIDE_APPROVED',
    regulatoryFilingReady: true
  };

  const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: `fairvoice-${logId}.json` }).click();
  URL.revokeObjectURL(url);

  const gate = document.getElementById(id + '-gate');
  if (gate) {
    const box = document.createElement('div');
    box.className = 'confirm-box';
    box.innerHTML = `✓ Audit log <strong>${logId}</strong> downloaded — Decision: <strong>${decision}</strong>`;
    gate.appendChild(box);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API HELPER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function getKey() {
  return (document.getElementById('apiKey')?.value || '').trim();
}

async function apiPost(url, body) {
  const key = getKey();
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(key && { 'x-api-key': key }) },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Server error (${resp.status})`);
  }
  return resp.json();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UI HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showError(areaId, msg) {
  document.getElementById(areaId).innerHTML =
    `<div class="error-box">⚠️ ${esc(msg)}</div>`;
}

function showStatus(areaId, msg) {
  document.getElementById(areaId).innerHTML = `
  <div class="status-box">
    <div class="spinner-dark" style="margin:0 auto 14px;"></div>
    <p style="color:#64748b;font-size:0.875rem;">${esc(msg)}</p>
  </div>`;
}

function esc(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
