// ── Config ──────────────────────────────────────────────────────────────────
const CONFIG = {
  API_PROXY:          '/api/make',
  EXECUTIONS_PER_JOB: 20,        // how many recent executions to fetch per scenario
  REFRESH_INTERVAL:   60_000,    // auto-refresh every 60 s
};

// ── Mutable state ────────────────────────────────────────────────────────────
let WORKFLOWS       = [];         // populated from Make.com (or fallback)
let usingLiveData   = false;
let lastSynced      = null;
let refreshTimer    = null;

// ── Static fallback data (shown on API error / local dev without vercel dev) ─
const STATIC_WORKFLOWS = [
  { id: 'VID-9402', agent: 'ScriptGen-Agent', type: 'Script Writing',
    status: 'running',   progress: 45,  icon: 'file-text',
    model: 'claude',  modelLabel: 'Claude Sonnet 4.6',
    tokensUsed: 12450, timeElapsed: '2m 34s', costEstimate: 0.18, successRate: 94,
    output: '[02:34] Initializing ScriptGen-Agent for VID-9402\n[02:34] Topic: "10 Scary Space Facts"\n[02:35] Fetching research data from knowledge base...\n[02:36] Generating hook paragraph...\n[02:37] Writing body sections (3/7 complete)...\n[02:38] Applying tone calibration: Educational/Suspenseful\n[02:39] Script generation 45% complete...' },
  { id: 'VID-9391', agent: 'Voice-ElevenLabs', type: 'Voiceover Synthesis',
    status: 'running',   progress: 82,  icon: 'mic',
    model: 'gemini', modelLabel: 'ElevenLabs',
    tokensUsed: 8230,  timeElapsed: '4m 12s', costEstimate: 0.09, successRate: 98,
    output: '[04:10] Voice-ElevenLabs synthesis initiated\n[04:10] Loading voice profile: "George Narrator"\n[04:11] Processing script chunks: 8/10 complete\n[04:12] Applying prosody adjustments...\n[04:12] Audio quality check: 48kHz, 320kbps\n[04:12] Synthesis 82% complete...' },
  { id: 'VID-9388', agent: 'Vision-Midjourney', type: 'Thumbnail Gen',
    status: 'completed', progress: 100, icon: 'image',
    model: 'gemini', modelLabel: 'OpenAI DALL·E',
    tokensUsed: 3100,  timeElapsed: '1m 08s', costEstimate: 0.04, successRate: 100,
    output: '[01:05] Thumbnail generation started\n[01:06] Generating 4 variants...\n[01:07] Selecting highest CTR-optimized design\n[01:08] Upscaling to 1280x720...\n[01:08] SUCCESS: Artifact saved to cloud storage' },
  { id: 'VID-9385', agent: 'Editor-AutoCut',  type: 'Video Editing',
    status: 'failed',    progress: 34,  icon: 'film',
    model: 'claude',  modelLabel: 'Claude Haiku 4.5',
    tokensUsed: 5540,  timeElapsed: '3m 21s', costEstimate: 0.06, successRate: 71,
    output: '[03:18] Editor-AutoCut video assembly started\n[03:19] Aligning audio track with video timeline...\n[03:21] ERROR: YouTube API authentication failed\n[03:21] FATAL: Token refresh rejected. Task aborted.' },
  { id: 'VID-9384', agent: 'Social-Poster',   type: 'Scheduled Upload',
    status: 'completed', progress: 100, icon: 'upload-cloud',
    model: 'claude',  modelLabel: 'Claude Haiku 4.5',
    tokensUsed: 1820,  timeElapsed: '0m 47s', costEstimate: 0.02, successRate: 100,
    output: '[00:44] Social-Poster upload sequence\n[00:45] Uploading to YouTube... SUCCESS (4.2 GB)\n[00:46] Cross-posting to TikTok... SUCCESS\n[00:47] All platforms published.' },
];

const WEEKLY_DATA = [
  { week: 'Feb 3',  videos: 32 }, { week: 'Feb 10', videos: 47 },
  { week: 'Feb 17', videos: 38 }, { week: 'Feb 24', videos: 61 },
  { week: 'Mar 3',  videos: 55 }, { week: 'Mar 10', videos: 72 },
  { week: 'Mar 17', videos: 68 }, { week: 'Mar 24', videos: 82 },
];

const LOG_MESSAGES = [
  { level: 'INFO',    text: 'Script generated for "10 Scary Space Facts".' },
  { level: 'INFO',    text: 'Allocating credits for ElevenLabs voice generation.' },
  { level: 'SUCCESS', text: 'Agent Voice-ElevenLabs synthesized audio successfully.' },
  { level: 'WARN',    text: 'Video rendering taking longer than expected.' },
  { level: 'INFO',    text: 'Processing B-roll footage for VID-9402.' },
  { level: 'SUCCESS', text: 'Thumbnail artifact saved to cloud storage.' },
  { level: 'INFO',    text: 'Editor-AutoCut aligning audio tracks with B-roll.' },
  { level: 'ERROR',   text: 'Failed to authenticate YouTube API token.' },
  { level: 'INFO',    text: 'Retrying upload to TikTok... (Attempt 2/3).' },
];

const workflowList = document.getElementById('workflow-list');
const terminalFeed = document.getElementById('terminal-feed');

// ── Make.com helpers ─────────────────────────────────────────────────────────

function getIconForScenario(name = '') {
  const n = name.toLowerCase();
  if (n.includes('script') || n.includes('text') || n.includes('write') || n.includes('copy'))
    return 'file-text';
  if (n.includes('voice') || n.includes('audio') || n.includes('speech') || n.includes('eleven'))
    return 'mic';
  if (n.includes('image') || n.includes('thumbnail') || n.includes('visual') || n.includes('dall'))
    return 'image';
  if (n.includes('video') || n.includes('edit') || n.includes('render') || n.includes('cut'))
    return 'film';
  if (n.includes('upload') || n.includes('youtube') || n.includes('publish') || n.includes('post'))
    return 'upload-cloud';
  if (n.includes('email') || n.includes('newsletter') || n.includes('mail'))
    return 'mail';
  return 'activity';
}

function getTypeForScenario(name = '') {
  const n = name.toLowerCase();
  if (n.includes('script'))                           return 'Script Writing';
  if (n.includes('voice') || n.includes('eleven'))   return 'Voiceover Synthesis';
  if (n.includes('thumbnail') || n.includes('image')) return 'Thumbnail Gen';
  if (n.includes('video') || n.includes('edit'))     return 'Video Editing';
  if (n.includes('upload') || n.includes('youtube')) return 'Scheduled Upload';
  if (n.includes('email') || n.includes('newsletter')) return 'Newsletter';
  return 'Automation';
}

function getModelForScenario(name = '') {
  const n = name.toLowerCase();
  if (n.includes('eleven') || n.includes('voice') || n.includes('speech'))
    return { model: 'gemini', modelLabel: 'ElevenLabs' };
  if (n.includes('openai') || n.includes('gpt') || n.includes('dall'))
    return { model: 'gemini', modelLabel: 'OpenAI GPT-4o' };
  if (n.includes('midjourney') || n.includes('image'))
    return { model: 'gemini', modelLabel: 'DALL·E 3' };
  return { model: 'claude', modelLabel: 'Claude Sonnet 4.6' };
}

function formatDuration(ms) {
  if (!ms || ms < 0) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function makeExecStatus(status) {
  // Make.com execution statuses: success | error | warning | running
  if (status === 'success')  return 'completed';
  if (status === 'error')    return 'failed';
  if (status === 'running')  return 'running';
  return 'completed'; // warning → treat as completed
}

function buildOutputLog(scenario, executions) {
  if (!executions || executions.length === 0) {
    return `[—] No executions found for "${scenario.name}"`;
  }
  return executions
    .slice(0, 5)
    .map(e => {
      const t = new Date(e.createdAt || Date.now()).toLocaleTimeString();
      const dur = formatDuration(e.duration || e.durationMs);
      const ops = e.operations != null ? ` | ops: ${e.operations}` : '';
      const icon = e.status === 'success' ? 'SUCCESS' :
                   e.status === 'error'   ? 'ERROR'   : 'INFO';
      return `[${t}] ${icon}: run #${e.id || '?'} — ${dur}${ops}`;
    })
    .join('\n');
}

/** Map a Make.com scenario + its execution history to a WORKFLOWS entry */
function mapToWorkflow(scenario, executions = []) {
  const lastExec  = executions[0];                         // most recent
  const rawStatus = lastExec?.status || 'success';
  const status    = makeExecStatus(rawStatus);

  const successCount = executions.filter(e => e.status === 'success').length;
  const successRate  = executions.length
    ? Math.round((successCount / executions.length) * 100)
    : (status === 'completed' ? 100 : 0);

  const progress =
    status === 'completed' ? 100 :
    status === 'failed'    ? Math.min(90, executions.length ? 50 : 0) :
    50;

  const durationMs = lastExec?.duration || lastExec?.durationMs || 0;
  const operations = lastExec?.operations || 0;
  const costEstimate = parseFloat((operations * 0.002).toFixed(4)); // ~$0.002/op estimate

  const { model, modelLabel } = getModelForScenario(scenario.name);

  return {
    id:           `SCN-${scenario.id}`,
    agent:        scenario.name || `Scenario ${scenario.id}`,
    type:         getTypeForScenario(scenario.name),
    status,
    progress,
    icon:         getIconForScenario(scenario.name),
    model,
    modelLabel,
    tokensUsed:   0,  // Make.com doesn't expose token counts
    timeElapsed:  formatDuration(durationMs),
    costEstimate,
    successRate,
    output:       buildOutputLog(scenario, executions),
    _scenarioId:  scenario.id,
    _isActive:    scenario.isActive,
  };
}

// ── Make.com API fetch ────────────────────────────────────────────────────────

async function makeApiGet(endpoint, params = {}) {
  const qs = new URLSearchParams({ endpoint, ...params }).toString();
  const res = await fetch(`${CONFIG.API_PROXY}?${qs}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchMakeWorkflows() {
  updateSyncBadge('syncing');
  try {
    // 1. Get all scenarios
    const scenariosData = await makeApiGet('scenarios');
    const scenarios = scenariosData.scenarios || [];

    if (scenarios.length === 0) {
      WORKFLOWS = STATIC_WORKFLOWS;
      usingLiveData = false;
      addLog('WARN', 'No Make.com scenarios found — showing demo data.');
      renderWorkflows();
      renderAISummary();
      updateSyncBadge('error');
      return;
    }

    // 2. For each active scenario, fetch recent executions
    const jobs = scenarios.map(async scenario => {
      try {
        const execData = await makeApiGet(
          `scenarios/${scenario.id}/executions`,
          { limit: CONFIG.EXECUTIONS_PER_JOB }
        );
        const executions = execData.executions || [];
        return mapToWorkflow(scenario, executions);
      } catch {
        // If executions fail, still show the scenario with no history
        return mapToWorkflow(scenario, []);
      }
    });

    WORKFLOWS = await Promise.all(jobs);
    usingLiveData = true;
    lastSynced = new Date();

    renderWorkflows();
    renderAISummary();
    updateSyncBadge('live');
    addLog('SUCCESS', `Synced ${WORKFLOWS.length} Make.com scenario(s) at ${formatTime()}.`);

  } catch (err) {
    // API unavailable (local dev without vercel dev, or misconfigured key)
    if (WORKFLOWS.length === 0) {
      WORKFLOWS = STATIC_WORKFLOWS;
      usingLiveData = false;
      renderWorkflows();
      renderAISummary();
    }
    updateSyncBadge('error');
    addLog('WARN', `Make.com API unreachable — showing demo data. (${err.message})`);
  }
}

// ── Sync badge ────────────────────────────────────────────────────────────────

function updateSyncBadge(state) {
  let badge = document.getElementById('sync-badge');
  if (!badge) {
    // Inject badge next to "Active Pipelines" heading if not present
    const heading = document.querySelector('.section-title, h2, .card-header');
    if (heading) {
      badge = document.createElement('span');
      badge.id = 'sync-badge';
      badge.style.cssText = `
        font-size: 0.7rem; padding: 2px 8px; border-radius: 999px;
        margin-left: 10px; vertical-align: middle; font-weight: 600;
        transition: all 0.3s;
      `;
      heading.appendChild(badge);
    }
  }
  if (!badge) return;

  if (state === 'syncing') {
    badge.textContent = '⟳ Syncing…';
    badge.style.background = 'rgba(74,222,128,0.15)';
    badge.style.color = '#4ade80';
  } else if (state === 'live') {
    const t = lastSynced
      ? lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    badge.textContent = `● Live — updated ${t}`;
    badge.style.background = 'rgba(74,222,128,0.15)';
    badge.style.color = '#4ade80';
  } else {
    badge.textContent = '○ Demo data';
    badge.style.background = 'rgba(248,113,113,0.15)';
    badge.style.color = '#f87171';
  }
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function renderLoadingState() {
  workflowList.innerHTML = Array.from({ length: 4 }, () => `
    <tr style="opacity:0.4;animation:pulse 1.5s ease-in-out infinite;">
      <td><span class="task-id">——————</span></td>
      <td><div class="agent-name" style="width:140px;height:14px;background:rgba(255,255,255,0.08);border-radius:4px;"></div></td>
      <td><span class="model-badge model-claude" style="width:90px;display:inline-block;">&nbsp;</span></td>
      <td><span class="status-badge status-running">Loading…</span></td>
      <td><div class="progress-bar-container"><div class="progress-bar-fill" style="width:0%"></div></div></td>
      <td class="cost-cell">—</td>
      <td></td>
    </tr>
  `).join('');
}

// ── Workflows Table ──────────────────────────────────────────────────────────

function renderWorkflows() {
  workflowList.innerHTML = '';

  if (WORKFLOWS.length === 0) {
    workflowList.innerHTML = `
      <tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-tertiary);">
        No workflows found.
      </td></tr>`;
    return;
  }

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
    else if (task.status === 'failed') barClass = 'error';

    const modelClass = task.model === 'claude' ? 'model-claude' : 'model-gemini';

    tr.innerHTML = `
      <td><span class="task-id">${task.id}</span></td>
      <td>
        <div class="agent-name">
          <i data-lucide="${task.icon}" style="width:16px;height:16px;color:var(--text-tertiary)"></i>
          ${task.agent}
          <span style="font-size:0.75rem;color:var(--text-tertiary);">(${task.type})</span>
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

// ── Modal ────────────────────────────────────────────────────────────────────

function openModal(taskId) {
  const task = WORKFLOWS.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('modal-vid-id').textContent    = task.id;
  document.getElementById('modal-agent').textContent     = `${task.agent} — ${task.type}`;
  const modelClass = task.model === 'claude' ? 'model-claude' : 'model-gemini';
  document.getElementById('modal-model').innerHTML       = `<span class="model-badge ${modelClass}">${task.modelLabel}</span>`;
  document.getElementById('modal-tokens').textContent    = task.tokensUsed ? task.tokensUsed.toLocaleString() : '—';
  document.getElementById('modal-time').textContent      = task.timeElapsed;
  document.getElementById('modal-cost').textContent      = `$${task.costEstimate.toFixed(4)}`;
  document.getElementById('modal-success-rate').textContent = `${task.successRate}%`;

  let statusBadge = '';
  if (task.status === 'running')
    statusBadge = `<span class="status-badge status-running">Running</span>`;
  else if (task.status === 'completed')
    statusBadge = `<span class="status-badge status-completed">Completed</span>`;
  else if (task.status === 'failed')
    statusBadge = `<span class="status-badge status-failed">Failed</span>`;
  document.getElementById('modal-status').innerHTML = statusBadge;

  document.getElementById('modal-output').textContent   = task.output;
  document.getElementById('task-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('task-modal').classList.remove('active');
}

// ── Weekly Bar Chart ─────────────────────────────────────────────────────────

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
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    const val = Math.round(maxVal - (maxVal / gridLines) * i);
    ctx.fillStyle = 'rgba(100,116,139,0.8)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val, pad.left - 8, y + 4);
  }

  // Bars
  WEEKLY_DATA.forEach((d, i) => {
    const barH = (d.videos / maxVal) * chartH;
    const x = pad.left + i * barGroupW + barGap;
    const y = pad.top  + chartH - barH;
    const grad = ctx.createLinearGradient(x, y, x, y + barH);
    grad.addColorStop(0, 'rgba(74, 222, 128, 0.9)');
    grad.addColorStop(1, 'rgba(59, 130, 246, 0.5)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]); }
    else               { ctx.rect(x, y, barW, barH); }
    ctx.fill();
    // Value label
    ctx.fillStyle = 'rgba(248,250,252,0.85)';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.videos, x + barW / 2, y - 6);
    // X label
    ctx.fillStyle = 'rgba(100,116,139,0.8)';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(d.week, x + barW / 2, pad.top + chartH + 22);
  });
}

// ── AI Summary Panel ─────────────────────────────────────────────────────────

function renderAISummary() {
  const totalTokens  = WORKFLOWS.reduce((s, t) => s + (t.tokensUsed || 0), 0);
  const totalCost    = WORKFLOWS.reduce((s, t) => s + t.costEstimate, 0);
  const avgSuccess   = WORKFLOWS.length
    ? Math.round(WORKFLOWS.reduce((s, t) => s + t.successRate, 0) / WORKFLOWS.length)
    : 0;
  const claudeCount  = WORKFLOWS.filter(t => t.model === 'claude').length;
  const geminiCount  = WORKFLOWS.filter(t => t.model === 'gemini').length;
  const completedCount = WORKFLOWS.filter(t => t.status === 'completed').length;
  const failedCount    = WORKFLOWS.filter(t => t.status === 'failed').length;

  document.getElementById('ai-total-tokens').textContent = totalTokens ? totalTokens.toLocaleString() : '—';
  document.getElementById('ai-total-cost').textContent   = `$${totalCost.toFixed(2)}`;
  document.getElementById('ai-success-rate').textContent = `${avgSuccess}%`;
  document.getElementById('ai-claude-count').textContent = claudeCount;
  document.getElementById('ai-gemini-count').textContent = geminiCount;
  document.getElementById('ai-completed').textContent    = completedCount;
  document.getElementById('ai-failed').textContent       = failedCount;
}

// ── Log / Terminal ───────────────────────────────────────────────────────────

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
  addLog('INFO', 'System boot sequence initiated.');
  addLog('INFO', 'Connecting to Make.com API…');
  setInterval(() => {
    const msg = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
    addLog(msg.level, msg.text);
  }, 3000);
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Show skeleton immediately
  renderLoadingState();
  startLogStream();
  drawWeeklyChart();

  // Fetch live data (falls back to static if unavailable)
  await fetchMakeWorkflows();

  // Auto-refresh loop
  refreshTimer = setInterval(fetchMakeWorkflows, CONFIG.REFRESH_INTERVAL);

  // Modal close handlers
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('task-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Optional: manual refresh on the header badge click
  document.getElementById('sync-badge')?.addEventListener('click', () => {
    clearInterval(refreshTimer);
    fetchMakeWorkflows();
    refreshTimer = setInterval(fetchMakeWorkflows, CONFIG.REFRESH_INTERVAL);
  });

  // ── "New Task" button — fires Make.com webhook ──────────────────────────────
  const newTaskBtn = document.querySelector('.btn-primary');
  if (newTaskBtn) {
    newTaskBtn.addEventListener('click', async () => {
      const originalHTML = newTaskBtn.innerHTML;
      newTaskBtn.disabled = true;
      newTaskBtn.textContent = 'Starting…';
      addLog('INFO', 'Triggering new task via Make.com pipeline…');
      try {
        const res = await fetch('https://hook.us2.make.com/7lc7rbdxzl1ggreujjs16ndyppyaad5s', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trigger: 'new_task', timestamp: new Date().toISOString(), source: 'dashboard' }),
        });
        if (res.ok) {
          addLog('SUCCESS', 'New task triggered — pipeline is running!');
          // Refresh workflow status after a short delay
          setTimeout(() => fetchMakeWorkflows(), 5000);
        } else {
          addLog('ERROR', 'Pipeline returned status ' + res.status);
        }
      } catch (err) {
        addLog('ERROR', 'Failed to reach pipeline: ' + err.message);
      } finally {
        newTaskBtn.disabled = false;
        newTaskBtn.innerHTML = originalHTML;
      }
    });
  }
});
