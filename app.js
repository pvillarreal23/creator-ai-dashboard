const WORKFLOWS = [
  {
    id: 'VID-9402', agent: 'ScriptGen-Agent', type: 'Script Writing',
    status: 'running', progress: 45, icon: 'file-text',
    model: 'claude', modelLabel: 'Claude Sonnet 4.6',
    tokensUsed: 12450, timeElapsed: '2m 34s', costEstimate: 0.18, successRate: 94,
    output: '[02:34] Claude Sonnet 4.6 initializing ScriptGen-Agent for VID-9402\n[02:34] Topic: "10 Scary Space Facts"\n[02:35] Fetching research data from knowledge base...\n[02:36] Claude Sonnet 4.6 generating hook paragraph...\n[02:37] Writing body sections (3/7 complete)...\n[02:38] Applying tone calibration: Educational/Suspenseful\n[02:39] Script generation 45% complete...'
  },
  {
    id: 'VID-9391', agent: 'Voice-ElevenLabs', type: 'Voiceover Synthesis',
    status: 'running', progress: 82, icon: 'mic',
    model: 'claude', modelLabel: 'Claude Haiku 4.5',
    tokensUsed: 8230, timeElapsed: '4m 12s', costEstimate: 0.09, successRate: 98,
    output: '[04:10] Claude Haiku 4.5 directing voiceover for VID-9391\n[04:10] Loading voice profile: "Alex-Narrator-v3"\n[04:11] Generating pacing & emphasis markers from script...\n[04:11] Processing script chunks: 8/10 complete\n[04:12] Applying prosody adjustments via Claude Haiku 4.5...\n[04:12] Audio quality check: 48kHz, 320kbps\n[04:12] Synthesis 82% complete...'
  },
  {
    id: 'VID-9388', agent: 'Vision-Midjourney', type: 'Thumbnail Gen',
    status: 'completed', progress: 100, icon: 'image',
    model: 'gemini', modelLabel: 'Gemini 3.1 Pro',
    tokensUsed: 3100, timeElapsed: '1m 08s', costEstimate: 0.04, successRate: 100,
    output: '[01:05] Gemini 3.1 Pro analyzing thumbnail research for VID-9388\n[01:05] Scanning top 50 performing thumbnails in niche...\n[01:06] Topic keywords identified: space, scary, facts, cosmic\n[01:06] Generating 4 thumbnail variants via Midjourney...\n[01:07] Gemini 3.1 Pro selecting highest CTR-optimized design\n[01:08] Upscaling to 1280x720...\n[01:08] SUCCESS: Artifact saved to cloud storage'
  },
  {
    id: 'VID-9385', agent: 'Editor-AutoCut', type: 'Video Editing',
    status: 'failed', progress: 34, icon: 'film',
    model: 'gemini', modelLabel: 'Gemini 3.1 Pro',
    tokensUsed: 5540, timeElapsed: '3m 21s', costEstimate: 0.06, successRate: 71,
    output: '[03:18] Gemini 3.1 Pro planning edit sequence for VID-9385\n[03:18] Analyzing B-roll catalog: 14 clips found\n[03:19] Generating cut timeline from analytics data...\n[03:20] Applying jump cuts at silence markers...\n[03:21] ERROR: YouTube API authentication failed\n[03:21] Retrying... (1/3)\n[03:21] FATAL: Token refresh rejected. Task aborted.'
  },
  {
    id: 'VID-9384', agent: 'Social-Poster', type: 'Scheduled Upload',
    status: 'completed', progress: 100, icon: 'upload-cloud',
    model: 'gemini', modelLabel: 'Gemini 3.1 Pro',
    tokensUsed: 1820, timeElapsed: '0m 47s', costEstimate: 0.02, successRate: 100,
    output: '[00:44] Gemini 3.1 Pro running upload analytics for VID-9384\n[00:44] Optimal posting windows: YT 2PM, TikTok 6PM, IG 9AM EST\n[00:45] Uploading to YouTube... SUCCESS (4.2GB)\n[00:46] Cross-posting to TikTok... SUCCESS\n[00:46] Gemini 3.1 Pro scheduling Instagram Reel for 9:00 AM EST\n[00:47] SUCCESS: All platforms published'
  },
];

const WEEKLY_DATA = [
  { week: 'Feb 3',  videos: 32 },
  { week: 'Feb 10', videos: 47 },
  { week: 'Feb 17', videos: 38 },
  { week: 'Feb 24', videos: 61 },
  { week: 'Mar 3',  videos: 55 },
  { week: 'Mar 10', videos: 72 },
  { week: 'Mar 17', videos: 68 },
  { week: 'Mar 24', videos: 82 },
];

const LOG_MESSAGES = [
  { level: 'INFO',    text: 'Claude Sonnet 4.6 â†’ Script generated for "10 Scary Space Facts".' },
  { level: 'INFO',    text: 'Claude Haiku 4.5 â†’ Allocating credits for ElevenLabs voice generation.' },
  { level: 'SUCCESS', text: 'Claude Haiku 4.5 â†’ Voice-ElevenLabs synthesized audio successfully.' },
  { level: 'WARN',    text: 'Gemini 3.1 Pro â†’ Video edit plan taking longer than expected.' },
  { level: 'INFO',    text: 'Claude Sonnet 4.6 â†’ Processing script B-roll cues for VID-9402.' },
  { level: 'SUCCESS', text: 'Gemini 3.1 Pro â†’ Thumbnail research complete. Artifact saved.' },
  { level: 'INFO',    text: 'Gemini 3.1 Pro â†’ Analyzing optimal posting window for upload.' },
  { level: 'ERROR',   text: 'Gemini 3.1 Pro â†’ Failed to authenticate YouTube API token.' },
  { level: 'INFO',    text: 'Gemini 3.1 Pro â†’ Scheduling TikTok post... (Attempt 2/3).' },
  { level: 'INFO',    text: 'Claude Sonnet 4.6 â†’ Refining script hook for higher retention.' },
  { level: 'SUCCESS', text: 'Claude Haiku 4.5 â†’ Voiceover pacing markers applied successfully.' },
];

const workflowList = document.getElementById('workflow-list');
const terminalFeed  = document.getElementById('terminal-feed');

// â”€â”€ Workflows Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderWorkflows() {
  workflowList.innerHTML = '';

  WORKFLOWS.forEach(task => {
    const tr = document.createElement('tr');

    let statusBadge = '';
    if (task.status === 'running')
      statusBadge = `<span class="status-badge status-running"><div class="pulse-dot" style="width:6px;height:6px;"></div> Running</span>`;
    else if (task.status === 'completed')
      statusBadge = `<span class="status-badge status-completed"><i data-lucide="check" style="width:12px;height:12px"></i> Completed</span>`;
    else if (task.status === 'failed')
      statusBadge = `<span class="status-badge status-failed"><i data-lucide="x" style="width:12px;height:12px"></i> Failed</span>`;

    let barClass = '';
    if (task.status === 'completed') barClass = 'done';
    else if (task.status === 'failed')  barClass = 'error';

    const modelClass = task.model === 'claude' ? 'model-claude' : 'model-gemini';

    tr.innerHTML = `
      <td><span class="task-id">${task.id}</span></td>
      <td>
        <div class="agent-name">
          <i data-lucide="${task.icon}" style="width:16px;height:16px;color:var(--text-tertiary)"></i>
          ${task.agent} <span style="font-size:0.75rem;color:var(--text-tertiary);">(${task.type})</span>
        </div>
      </td>
      <td><span class="model-badge ${modelClass}">${task.modelLabel}</span></td>
      <td>${statusBadge}</td>
      <td>
        <div class="progress-bar-container">
          <div class="progress-bar-fill ${barClass}" style="width:${task.progress}%"></div>
        </div>
      </td>
      <td class="cost-cell">$${task.costEstimate.toFixed(2)}</td>
      <td>
        <button class="action-btn" data-id="${task.id}" title="View Details">
          <i data-lucide="more-vertical"></i>
        </button>
      </td>
    `;

    workflowList.appendChild(tr);
  });

  workflowList.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });

  lucide.createIcons();
}

// â”€â”€ Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function openModal(taskId) {
  const task = WORKFLOWS.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('modal-vid-id').textContent  = task.id;
  document.getElementById('modal-agent').textContent   = `${task.agent} â€” ${task.type}`;

  const modelClass = task.model === 'claude' ? 'model-claude' : 'model-gemini';
  document.getElementById('modal-model').innerHTML = `<span class="model-badge ${modelClass}">${task.modelLabel}</span>`;

  document.getElementById('modal-tokens').textContent       = task.tokensUsed.toLocaleString();
  document.getElementById('modal-time').textContent         = task.timeElapsed;
  document.getElementById('modal-cost').textContent         = `$${task.costEstimate.toFixed(2)}`;
  document.getElementById('modal-success-rate').textContent = `${task.successRate}%`;

  let statusBadge = '';
  if (task.status === 'running')
    statusBadge = `<span class="status-badge status-running">Running</span>`;
  else if (task.status === 'completed')
    statusBadge = `<span class="status-badge status-completed">Completed</span>`;
  else if (task.status === 'failed')
    statusBadge = `<span class="status-badge status-failed">Failed</span>`;
  document.getElementById('modal-status').innerHTML = statusBadge;

  document.getElementById('modal-output').textContent = task.output;

  document.getElementById('task-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('task-modal').classList.remove('active');
}

// â”€â”€ Weekly Bar Chart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function drawWeeklyChart() {
  const canvas = document.getElementById('weekly-chart');
  if (!canvas) return;

  const container = canvas.parentElement;
  const dpr    = window.devicePixelRatio || 1;
  const width  = container.clientWidth;
  const height = container.clientHeight;

  canvas.width  = width  * dpr;
  canvas.height = height * dpr;
  canvas.style.width  = width  + 'px';
  canvas.style.height = height + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad = { top: 28, right: 20, bottom: 54, left: 44 };
  const chartW = width  - pad.left - pad.right;
  const chartH = height - pad.top  - pad.bottom;
  const maxVal = Math.max(...WEEKLY_DATA.map(d => d.videos));

  const barGroupW = chartW / WEEKLY_DATA.length;
  const barW      = barGroupW * 0.55;
  const barGap    = (barGroupW - barW) / 2;

  // Grid lines + Y labels
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const y = pad.top + (chartH / gridLines) * i;

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();

    const val = Math.round(maxVal - (maxVal / gridLines) * i);
    ctx.fillStyle  = 'rgba(100,116,139,0.8)';
    ctx.font       = '11px Inter, sans-serif';
    ctx.textAlign  = 'right';
    ctx.fillText(val, pad.left - 8, y + 4);
  }

  // Bars
  WEEKLY_DATA.forEach((d, i) => {
    const barH  = (d.videos / maxVal) * chartH;
    const x     = pad.left + i * barGroupW + barGap;
    const y     = pad.top  + chartH - barH;

    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    grad.addColorStop(0, 'rgba(74, 222, 128, 0.9)');
    grad.addColorStop(1, 'rgba(59, 130, 246, 0.5)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    } else {
      ctx.rect(x, y, barW, barH);
    }
    ctx.fill();

    // Value label
    ctx.fillStyle  = 'rgba(248,250,252,0.85)';
    ctx.font       = 'bold 11px Inter, sans-serif';
    ctx.textAlign  = 'center';
    ctx.fillText(d.videos, x + barW / 2, y - 6);

    // X label
    ctx.fillStyle = 'rgba(100,116,139,0.8)';
    ctx.font      = '10px Inter, sans-serif';
    ctx.fillText(d.week, x + barW / 2, pad.top + chartH + 22);
  });
}

// â”€â”€ AI Summary Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderAISummary() {
  const totalTokens   = WORKFLOWS.reduce((s, t) => s + t.tokensUsed, 0);
  const totalCost     = WORKFLOWS.reduce((s, t) => s + t.costEstimate, 0);
  const avgSuccess    = Math.round(WORKFLOWS.reduce((s, t) => s + t.successRate, 0) / WORKFLOWS.length);
  const claudeCount   = WORKFLOWS.filter(t => t.model === 'claude').length;
  const geminiCount   = WORKFLOWS.filter(t => t.model === 'gemini').length;
  const completedCount = WORKFLOWS.filter(t => t.status === 'completed').length;
  const failedCount   = WORKFLOWS.filter(t => t.status === 'failed').length;

  document.getElementById('ai-total-tokens').textContent = totalTokens.toLocaleString();
  document.getElementById('ai-total-cost').textContent   = `$${totalCost.toFixed(2)}`;
  document.getElementById('ai-success-rate').textContent = `${avgSuccess}%`;
  document.getElementById('ai-claude-count').textContent = claudeCount;
  document.getElementById('ai-gemini-count').textContent = geminiCount;
  document.getElementById('ai-completed').textContent    = completedCount;
  document.getElementById('ai-failed').textContent       = failedCount;
}

// â”€â”€ Simulation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function simulateActivity() {
  setInterval(() => {
    let needsRender = false;

    WORKFLOWS.forEach(task => {
      if (task.status === 'running') {
        task.progress += Math.floor(Math.random() * 5);
        if (task.progress >= 100) {
          task.progress = 100;
          task.status   = 'completed';
          addLog('SUCCESS', `Task ${task.id} completed by ${task.agent}.`);
        }
        needsRender = true;
      }
    });

    if (needsRender) {
      renderWorkflows();
      renderAISummary();
    }
  }, 2000);
}

const formatTime = () => {
  const n = new Date();
  return `${n.getHours().toString().padStart(2,'0')}:${n.getMinutes().toString().padStart(2,'0')}:${n.getSeconds().toString().padStart(2,'0')}`;
};

function addLog(levelClass, text) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';

  let mapClass = 'log-info';
  if (levelClass === 'SUCCESS') mapClass = 'log-success';
  if (levelClass === 'WARN')    mapClass = 'log-warn';
  if (levelClass === 'ERROR')   mapClass = 'log-error';

  entry.innerHTML = `
    <span class="log-time">[${formatTime()}]</span>
    <span class="log-level ${mapClass}">${levelClass}</span>
    <span class="log-message">${text}</span>
  `;

  terminalFeed.appendChild(entry);
  if (terminalFeed.children.length > 50) terminalFeed.removeChild(terminalFeed.firstChild);
  terminalFeed.scrollTop = terminalFeed.scrollHeight;
}

function startLogStream() {
  addLog('INFO',    'System boot sequence initiated.');
  addLog('INFO',    'Connecting to Nexus AI Matrix...');
  addLog('SUCCESS', 'Connection established. Waiting for streams.');

  setInterval(() => {
    const msg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
    addLog(msg.level, msg.text);
  }, 3000);
}

// â”€â”€ Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

document.addEventListener('DOMContentLoaded', () => {
  renderWorkflows();
  startLogStream();
  simulateActivity();
  drawWeeklyChart();
  renderAISummary();

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('task-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
});
