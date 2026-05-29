// Smart Report Analyzer — Frontend Logic
// Created by Pratham

const $ = id => document.getElementById(id);

const dropZone       = $('dropZone');
const fileInput      = $('fileInput');
const browseBtn      = $('browseBtn');
const fileSelected   = $('fileSelected');
const fileNameEl     = $('fileName');
const fileSizeEl     = $('fileSize');
const fileTypeIcon   = $('fileTypeIcon');
const removeFile     = $('removeFile');
const analyzeBtn     = $('analyzeBtn');
const loadingOverlay = $('loadingOverlay');
const loadingStep    = $('loadingStep');
const heroSection    = $('heroSection');
const resultsSection = $('resultsSection');
const statsBar       = $('statsBar');
const previewContent = $('previewContent');
const chartsCard     = $('chartsCard');
const chartsContainer= $('chartsContainer');
const summaryContent = $('summaryContent');
const questionInput  = $('questionInput');
const askBtn         = $('askBtn');
const qaHistory      = $('qaHistory');
const newAnalysisBtn = $('newAnalysisBtn');

const stepDots = document.querySelectorAll('.step-dot');

const FILE_ICONS = { csv: '📊', xlsx: '📗', xls: '📗', pdf: '📕' };
const LOADING_STEPS = [
  'Uploading your file…',
  'Running data analysis…',
  'Generating AI summary…',
  'Preparing visualizations…',
];

let selectedFile = null;

// ── File selection ──────────────────────────────────────────────

browseBtn.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('click', e => {
  if (e.target !== browseBtn) fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
});

function setFile(file) {
  selectedFile = file;
  const ext = file.name.split('.').pop().toLowerCase();
  fileNameEl.textContent = file.name;
  fileSizeEl.textContent = formatBytes(file.size);
  fileTypeIcon.textContent = FILE_ICONS[ext] || '📄';
  fileSelected.classList.remove('hidden');
  analyzeBtn.disabled = false;
}

removeFile.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  fileSelected.classList.add('hidden');
  analyzeBtn.disabled = true;
});

function formatBytes(b) {
  if (b < 1024)            return b + ' B';
  if (b < 1024 * 1024)     return (b / 1024).toFixed(1) + ' KB';
  return (b / (1024 * 1024)).toFixed(1) + ' MB';
}

// ── Analyze ─────────────────────────────────────────────────────

analyzeBtn.addEventListener('click', () => {
  if (selectedFile) runAnalysis();
});

async function runAnalysis() {
  showLoading();
  const interval = cycleLoadingSteps();

  const form = new FormData();
  form.append('file', selectedFile);

  try {
    const res = await fetch('/upload', { method: 'POST', body: form });
    clearInterval(interval);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed.' }));
      hideLoading();
      showError(err.error || 'Upload failed.');
      return;
    }

    const data = await res.json();
    hideLoading();
    renderResults(data);

  } catch (e) {
    clearInterval(interval);
    hideLoading();
    showError('Network error: ' + e.message);
  }
}

function cycleLoadingSteps() {
  let i = 0;
  function tick() {
    loadingStep.textContent = LOADING_STEPS[i % LOADING_STEPS.length];
    stepDots.forEach((d, idx) => d.classList.toggle('active', idx <= i % LOADING_STEPS.length));
    i++;
  }
  tick();
  return setInterval(tick, 3200);
}

function showLoading() { loadingOverlay.classList.remove('hidden'); }
function hideLoading()  { loadingOverlay.classList.add('hidden'); }

// ── Render Results ───────────────────────────────────────────────

function renderResults(data) {
  heroSection.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Stats
  statsBar.innerHTML = '';
  if (data.type === 'dataframe') {
    statsBar.innerHTML = statCard('Rows', data.rows.toLocaleString())
      + statCard('Columns', data.cols)
      + statCard('Type', 'Tabular');
  } else {
    statsBar.innerHTML = statCard('Type', 'PDF')
      + statCard('Characters', (data.preview.length).toLocaleString() + '+');
  }

  // Preview
  const previewCard = $('previewCard');
  previewCard.classList.remove('hidden');
  if (data.type === 'dataframe') {
    previewContent.innerHTML = data.preview;
  } else {
    previewContent.innerHTML = `<div class="pdf-preview">${escHtml(data.preview)}</div>`;
  }

  // Charts
  if (data.charts && data.charts.length > 0) {
    chartsContainer.innerHTML = '';
    chartsCard.classList.remove('hidden');
    data.charts.forEach((json, i) => {
      const div = document.createElement('div');
      div.className = 'chart-item';
      div.id = 'ch' + i;
      chartsContainer.appendChild(div);
      const fig = JSON.parse(json);
      darkifyPlotly(fig);
      Plotly.newPlot('ch' + i, fig.data, fig.layout, { responsive: true, displayModeBar: false });
    });
  } else {
    chartsCard.classList.add('hidden');
  }

  // Summary
  summaryContent.innerHTML = escHtml(data.summary);

  // Clear Q&A history
  qaHistory.innerHTML = '';
}

function statCard(label, value) {
  return `<div class="stat-card glass">
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
  </div>`;
}

function darkifyPlotly(fig) {
  const l = fig.layout || {};
  Object.assign(l, {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor:  'rgba(0,0,0,0)',
    font:  { color: '#94a3b8', family: 'Inter, sans-serif', size: 12 },
    xaxis: { ...(l.xaxis || {}), gridcolor: 'rgba(255,255,255,0.06)', zerolinecolor: 'rgba(255,255,255,0.1)' },
    yaxis: { ...(l.yaxis || {}), gridcolor: 'rgba(255,255,255,0.06)', zerolinecolor: 'rgba(255,255,255,0.1)' },
    margin: { t: 50, b: 44, l: 52, r: 18 },
    title: { ...(l.title || {}), font: { color: '#f1f5f9', size: 14, family: 'Inter, sans-serif' } },
    colorway: ['#7c3aed','#06b6d4','#a855f7','#10b981','#f59e0b','#ef4444','#3b82f6'],
  });
  fig.layout = l;
}

// ── Q&A ─────────────────────────────────────────────────────────

askBtn.addEventListener('click', submitQuestion);
questionInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') submitQuestion();
});

async function submitQuestion() {
  const q = questionInput.value.trim();
  if (!q) return;
  questionInput.value = '';

  const item = document.createElement('div');
  item.className = 'qa-item';
  item.innerHTML = `
    <div class="qa-q">
      <div class="qa-q-bubble">${escHtml(q)}</div>
    </div>
    <div class="qa-a qa-loading">
      <div class="qa-avatar">🤖</div>
      <div class="qa-a-bubble">
        <div class="dot-bounce"></div>
        <div class="dot-bounce"></div>
        <div class="dot-bounce"></div>
      </div>
    </div>`;
  qaHistory.appendChild(item);
  qaHistory.scrollTop = qaHistory.scrollHeight;

  try {
    const res  = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q }),
    });
    const data = await res.json();
    const aRow = item.querySelector('.qa-a');
    aRow.classList.remove('qa-loading');
    aRow.querySelector('.qa-a-bubble').textContent = data.answer;
  } catch (e) {
    const aRow = item.querySelector('.qa-a');
    aRow.classList.remove('qa-loading');
    aRow.querySelector('.qa-a-bubble').textContent = 'Error: ' + e.message;
  }

  qaHistory.scrollTop = qaHistory.scrollHeight;
}

// ── New Analysis ─────────────────────────────────────────────────

newAnalysisBtn.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  fileSelected.classList.add('hidden');
  analyzeBtn.disabled = true;
  resultsSection.classList.add('hidden');
  heroSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Helpers ──────────────────────────────────────────────────────

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showError(msg) {
  const t = document.createElement('div');
  t.className = 'error-toast';
  t.textContent = '❌  ' + msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 5000);
}
