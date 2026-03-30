// ── Config ────────────────────────────────────────────────────────────────────
const CONFIG = {
  API_PROXY: '/api/make',
  EXECUTIONS_PER_JOB: 100, // fetch more to power the weekly chart
  REFRESH_INTERVAL: 60_000,
};

// ── Mutable state ──────────────────────────────────────────────────────────────
let WORKFLOWS = [];
let ALL_EXECUTIONS = []; // all executions across all scenarios (powers chart + KPIs)
let usingLiveData = false;
let lastSynced = null;
let refreshTimer = null;
let WEEKLY_DATA = []; // computed from real executions, or [] if no data yet

// ── Static fallback data (shown only on API error) ─────────────────────────────
const STATIC_WORKFLOWS = [
  {
    id: 'VID-9402', agent: 'ScriptGen-Agent', type: 'Script Writing',
    status: 'running', progress: 45, icon: 'file-text', model: 'claude',
    modelLabel: 'Claude Sonnet 4.6', tokensUsed: 12450, timeElapsed: '2m 34s',
    costEstimate: 0.18, successRate: 94,
    output: '[02:34] Initializing ScriptGen-Agent for VID-9402\n[02:34] Topic: "10 Scary Space Facts"\n[02:35] Fetching research data from knowledge base...\n[02:36] Generating hook paragraph...\n[02:37] Writing body sections (3/7 complete)...\n[02:38] Applying tone calibration: Educational/Suspenseful\n[02:39] Script generation 45% complete...',
  },
  {
    id: 'VID-9391', agent: 'Voice-ElevenLabs', type: 'Voiceover Synthesis',
    status: 'running', progress: 82, icon: 'mic', model: 'gemini',
    modelLabel: 'ElevenLabs', tokensUsed: 8230, timeElapsed: '4m 12s',
    costEstimate: 0.09, successRate: 98,
    output: '[04:10] Voice-ElevenLabs synthesis initiated\n[04:10] Loading voice profile: "George Narrator"\n[04:11] Processing script chunks: 8/10 complete\n[04:12] Applying prosody adjustments...\n[04:12] Audio quality check: 48kHz, 320kbps\n[04:12] Synthesis 82% complete...',
  },
  {
    id: 'VID-9388', agent: 'Vision-Midjourney', type: 'Thumbnail Gen',
    status: 'completed', progress: 100, icon: 'image', model: 'gemini',
    modelLabel: 'OpenAI DALL·E', tokensUsed: 3100, timeElapsed: '1m 08s',
    costEstimate: 0.04, successRate: 100,
    output: '[01:05] Thumbnail generation started\n[01:06] Generating 4 variants...\n[01:07] Selecting highest CTR-optimized design\n[01:08] Upscaling to 1280x720...\n[01:08] SUCCESS: Artifact saved to cloud storage',
  },
  {
    id: 'VID-9385', agent: 'Editor-AutoCut', type: 'Video Editing',
    status: 'failed', progress: 34, icon: 'film', model: 'claude',
    modelLabel: 'Claude Haiku 4.5', tokensUsed: 5540, timeElapsed: '3m 21s',
    costEstimate: 0.06, successRate: 71,
    output: '[03:18] Editor-AutoCut video assembly started\n[03:19] Aligning audio track with video timeline...\n[03:21] ERROR: YouTube API authentication failed\n[03:21] FATAL: Token refresh rejected. Task aborted.',
  },
  {
    id: 'VID-9384', agent: 'Social-Poster', type: 'Scheduled Upload',
    status: 'completed', progress: 100, icon: 'upload-cloud', model: 'claude',
    modelLabel: 'Claude Haiku 4.5', tokensUsed: 1820, timeElapsed: '0m 47s',
    costEstimate: 0.02, successRate: 100,
    output: '[00:44] Social-Poster upload sequence\n[00:45] Uploading to YouTube... SUCCESS (4.2 GB)\n[00:46] Cross-posting to TikTok... SUCCESS\n[00:47] All platforms published.',
  },
];

const workflowList = document.getElementById('workflow-list');
const terminalFeed = document.getElementById('terminal-feed');

// ── Make.com helpers ───────────────────────────────────────────────────────────
function getIconForScenario(name = '') {
  const n = name.toLowerCase();
  if (n.includes('script') || n.includes('text') || n.includes('write') || n.includes('copy')) return 'file-text';
  if (n.includes('voice') || n.includes('audio') || n.includes('speech') || n.includes('eleven')) return 'mic';
  if (n.includes('image') || n.includes('thumbnail') || n.includes('visual') || n.includes('dall')) return 'image';
  if (n.includes('video') || n.includes('edit') || n.includes('render') || n.includes('cut')) return 'film';
  if (n.includes('upload') || n.includes('youtube') || n.includes('publish') || n.includes('post')) return 'upload-cloud';
  if (n.includes('email') || n.includes('newsletter') || n.includes('mail')) return 'mail';
  return 'activity';
}

function getTypeForScenario(name = '') {
  const n = name.toLowerCase();
  if (n.includes('script')) return 'Script Writing';
  if (n.includes('voice') || n.includes('eleven')) return 'Voiceover Synthesis';
  if (n.includes('thumbnail') || n.includes('image')) return 'Thumbnail Gen';
  if (n.includes('video') || n.includes('edit')) return 'Video Editing';
  if (n.includes('upload') || n.includes('youtube')) return 'Scheduled Upload';
  if (n.includes('email') || n.includes('newsletter')) return 'Newsletter';
  return 'Automation';
}

function getModelForScenario(name = '') {
  const n = name.toLowerCase();
  if (n.includes('eleven') || n.includes('voice') || n.includes('speech')) return { model: 'gemini', modelLabel: 'ElevenLabs' };
  if (n.includes('openai') || n.includes('gpt') || n.includes('dall')) return { model: 'gemini', modelLabel: 'OpenAI GPT-4o' };
  if (n.includes('midjourney') || n.includes('image')) return { model: 'gemini', modelLabel: 'DALL·E 3' };
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
  if (status === 1) return 'completed';
  if (status === 2 || status === 3 || status === 4) return 'failed';
  if (status === 'success') return 'completed';  // legacy string fallback
  if (status === 'error') return 'failed';
  if (status === 'running') return 'running';
  return 'completed';
}

function buildOutputLog(scenario, executions) {
  if (!executions || executions.length === 0) {
    return `[—] No executions found for "${scenario.name}"`;
  }
  return executions
    .slice(0, 5)
    .map(e => {
      const t = new Date(e.timestamp || e.createdAt || Date.now()).toLocaleTimeString();
      const dur = formatDuration(e.duration || e.durationMs);
      const ops = e.operations != null ? ` | ops: ${e.operations}` : '';
      const icon = e.status === 1 ? 'SUCCESS' : (e.status != null && e.status !== 1) ? 'ERROR' : 'INFO';
      return `[${t}] ${icon}: run #${e.id || '?'} — ${dur}${ops}`;
    })
    .join('\n');
}

function mapToWorkflow(scenario, executions = []) {
  const lastExec = executions[0];
  const rawStatus = lastExec?.status ?? 1;
  const status = makeExecStatus(rawStatus);
  const successCount = executions.filter(e => e.status === 1 || e.status === 'success').length;
  const successRate = executions.length
    ? Math.round((successCount / executions.length) * 100)
    : (status === 'completed' ? 100 : 0);
  const progress = status === 'completed' ? 100 : status === 'failed' ? Math.min(90, executions.length ? 50 : 0) : 50;
  const durationMs = lastExec?.duration || lastExec?.durationMs || 0;

  // Use centicredits if the API returns them; otherwise estimate from operations
  const centicredits = lastExec?.centicredits || 0;
  const operations = lastExec?.operations || 0;
  const costEstimate = centicredits > 0
  X]HH�[�XܙY]����\��Q��]

�[�XܙY]��L�L
K�њ^Y


JH���[�XܙY]�8����[��8����\��\��Q��]

�\�][ۜ�
��JK�њ^Y


JN���	H�L���ۜ��[�[[�[X�[HH�][�[�ܔ��[�\�[���[�\�[˛�[YJN�]\��Y��ӋI���[�\�[˚YX�Y�[����[�\�[˛�[YH��[�\�[�	���[�\�[˚YX�\N��]\Q�ܔ��[�\�[���[�\�[˛�[YJK��]\���ܙ\���X�ێ��]X�ۑ�ܔ��[�\�[���[�\�[˛�[YJK�[�[[�[X�[���[��\�Y��[YQ[\�Y��ܛX]\�][ۊ\�][ۓ\�K����\�[X]K�X��\�Ԙ]K��]]��Z[�]]����[�\�[�^X�][ۜ�K����[�\�[�Y���[�\�[˚Y��\�X�]�N���[�\�[˚\�X�]�K�NB����8� 8� �YZ�H�\�]H��\]Y���H�X[^X�][ۈ[Y\�[\�8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��[��[ۈ��\]U�YZ�Q]J^X�][ۜ�HY�
Y^X�][ۜ�^X�][ۜ˛[��OOH
H�]\���[��ۜ��YZ�X\H�]�X\

N����^N��[�^K[ً]�YZ�[Y\�[\�^X�][ۜ˙�ܑXX�
HO�Y�
YK�ܙX]Y]
H�]\���ۜ�H�]�]JK�ܙX]Y]
N�ۜ��[�H�]�]J
N�[���]]J��]]J
HH��]^J
JN�[���]�\��
N�ۜ��^HH�[���][YJ
N�YZ�X\��]
�^K
�YZ�X\��]
�^JH
H
�JNJN�Y�
�YZ�X\��^�HOOH
H�]\���[��]\��ˋ���YZ�X\�[��Y\�
WB���ܝ

�WKؗJHO�HH�B���X�JN
B��X\

����[�JHO�
�YZΈ�]�]J�K����[Q]T��[��	�[�UT���[۝�	��ܝ	�^N�	۝[Y\�X��JK��Y[�Έ��[��JJNB����8� 8� �H�]����H�X[^X�][ۜ�8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��[��[ۈ\]R�T�]�
HY�
]\�[��]�Q]JH�]\����ۜ��X��\�ٝ[HS�VP�USӔ˙�[\�HO�K��]\�OOHHK��]\�OOH	��X��\���N�ۜ��[��[�H�X��\�ٝ[�[���ۜ��[���H�Ԓѓ��˜�YX�J
��HO��
�˘���\�[X]K
N�ۜ�]��\�][ۓ\�H�X��\�ٝ[�[�����X��\�ٝ[��YX�J
�JHO��
�
K�\�][ۈK�\�][ۓ\�
K
H��X��\�ٝ[�[��������Y[���[�\�]Y��ۜ��U�Y[��H��[Y[���][[Y[��RY
	��K]�Y[���NY�
�U�Y[��H�U�Y[�˝^�۝[�H�[��[����[��[�����[T��[��
H�	�	�����[������[Xܛ���[��[�\�[��ۜ��U�Y[���[�H��[Y[���][[Y[��RY
	��K]�Y[��]�[�	�NY�
�U�Y[���[�
H�ۜ��[��[����[�H�Ԓѓ��˙�[\��O�˜�]\�OOH	ܝ[��[���K�[���U�Y[���[��^�۝[�H�[��[����[����	ܝ[��[����[�H��[�\�[��HX�]�X��	��Ԓѓ��˛[��H��[�\�[��H�X��YB����TH�\��\�����ۜ��P����H��[Y[���][[Y[��RY
	��KX�����NY�
�P����H�P���˝^�۝[�H		��[����њ^Y
�_X��ۜ��P�����[�H��[Y[���][[Y[��RY
	��KX����]�[�	�NY�
�P�����[�
H�ۜ��Z[Y��[�H�Ԓѓ��˙�[\��O�˜�]\�OOH	٘Z[Y	�K�[���P�����[��^�۝[�H�Z[Y��[����	٘Z[Y��[�H��[�\�[��H�Z[Y��	��Ԓѓ��˛[��H��[�\�[��H�[��[��B����]���[�\�][ۈ[YB��ۜ��P]��[YHH��[Y[���][[Y[��RY
	��KX]��][YI�NY�
�P]��[YJH�P]��[YK�^�۝[�H]��\�][ۓ\����ܛX]\�][ۊ]��\�][ۓ\�H�	��%	�����X��\���]HXܛ���[^X�][ۜ�ۜ��P]���[�H��[Y[���][[Y[��RY
	��KX]��]�[�	�NY�
�P]���[�	��S�VP�USӔ˛[���
H�ۜ�ݙ\�[�X��\��HX]���[�

�X��\�ٝ[�[���S�VP�USӔ˛[��
H
�L
N�P]���[��^�۝[�H	�ݙ\�[�X��\��IH�X��\���]XB�B����8� 8� �Z[Y��[�\�[�[\�[��8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��[��[ۈ�X�ћܑ�Z[\�\�
H�ۜ��Z[YH�Ԓѓ��˙�[\��O�˜�]\�OOH	٘Z[Y	�N�Z[Y��ܑXX�
�O�Y��	�T��ԉ�8����˘Y�[�H�\�^X�][ۈ�RSQ8�%�X��XZ�K���H�܈]Z[˘
NJN������H�\�X�H[\��[��\�Y�[�H��[�\�[���Z[Y�]�[��\�H��[Y[���][[Y[��RY
	٘Z[\�KX�[��\��NY�
�Z[Y�[���
HY�
X�[��\�H�[��\�H��[Y[��ܙX]Q[[Y[�
	�]��N�[��\��YH	٘Z[\�KX�[��\���[��\���[K����^H��X��ܛ�[���ؘJ�LL�LL��MJN�ܙ\��\��Y�ؘJ�LL�LL��
N�ܙ\�\�Y]\ΈY[�ΈLM�X\��[��M���܎�َ
�M�N�۝\�^�N��
\�[N\�^N��^[YۋZ][\Έ�[�\��\��ۜ��۝[���HH��[Y[��]Y\�T�[X�܊	˘�۝[�X��I�NY�
�۝[���JH�۝[���K��\[�
�[��\�NB��[��\��[��\�SHH]K[X�YOH�[\�]�X[��H��[OH��Y�M��ZY��M�ٛ^\��[�Όȏ��O����ۙω٘Z[Y�[��H��[�\�[��H�Z[Y����ۙψ	٘Z[Y�X\
�O�˘Y�[�
K���[�	�	�_H8�%�X��XZ�K���XX�YK�ܙX]RX�ۜ�
NH[�HY�
�[��\�H�[��\���[[ݙJ
NB�B����8� 8� ���X[^X�][ۈ]�[��8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��[��[ۈ�ԙX[^X�][ۜ��ؔ�\�[�H�����H�[���X�[�^X�][ۜ�Xܛ���[��[�\�[���ܝY�H[YB��ۜ�[�]�[YHH�ؔ�\�[˙�]X\

���[�\�[�^X�][ۜ�JHO��^X�][ۜ˛X\
HO�
����K��[�\�[Ә[YN���[�\�[˛�[YHJJB�
N[�]�[YB���[\�HO�K�[Y\�[\K�ܙX]Y]
B���ܝ

K�HO��]�]J��[Y\�[\��ܙX]Y]
HH�]�]JK�[Y\�[\K�ܙX]Y]
JB���X�J
JB���]�\��J
H���\��\�����YY�XY���ۛ���X�[B���ܑXX�
HO��ۜ�]�[HK��]\�OOHH�	��P��T����
K��]\�OH�[	��K��]\�OOHJH�	�T��ԉ��	�S�����ۜ�\�H�ܛX]\�][ۊK�\�][ۈK�\�][ۓ\�N�ۜ���HK��\�][ۜ��	�K��\�][ۜ�H���	���ۜ�H�]�]JK�[Y\�[\K�ܙX]Y]
K����[U[YT��[���K��\��	̋YY�]	�Z[�]N�	̋YY�]	�JNY��]�[��WH	�K���[�\�[Ә[Y_H8�%�[���K�YH
	�\�I���JX
NJNB����8� 8� XZ�K���HTH�]�8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� �\�[���[��[ۈXZ�P\Q�]
[��[�\�[\�H�JH�ۜ�\�H�]�T��X\��\�[\��[��[����\�[\�JK����[��
N�ۜ��\�H]�Z]�]�
	��ӑ�QːTW���_O��\�X
NY�
\�\˛��H�ۜ�\��H]�Z]�\˚��ۊ
K��]�


HO�
�JJN����]�\��܊\���\��܈	ܙ\˜�]\�X
NB��]\���\˚��ۊ
NB��\�[���[��[ۈ�]�XZ�U�ܚٛ���
H\]T�[�ИY�J	��[��[���N�H�ۜ���[�\�[��]HH]�Z]XZ�P\Q�]
	���[�\�[���N�ۜ���[�\�[��H��[�\�[��]K���[�\�[���N�Y�
��[�\�[�˛[��OOH
H�Ԓѓ���H�UP���Ԓѓ���\�[��]�Q]HH�[�NY��	��T���	ӛ�XZ�K���H��[�\�[����[�8�%���[��[[�]K��N�[�\��ܚٛ���
N�[�\�RT�[[X\�J
N\]T�[�ИY�J	�\��܉�N�]\��B�����]�^X�][ۜ��܈]�\�H��[�\�[�[�\�[[��ۜ��ؔ�\�[�H]�Z]��Z\�K�[
���[�\�[�˛X\
\�[����[�\�[�O��H�ۜ�^X�]HH]�Z]XZ�P\Q�]
���[�\�[������[�\�[˚YK������[Z]��ӑ�QˑVP�USӔ��T�ғЈB�
N�ۜ�^X�][ۜ�H^X�]K���[�\�[�����N�]\����ܚٛ�ΈX\��ܚٛ����[�\�[�^X�][ۜ�K^X�][ۜ���[�\�[�NH�]��]\����ܚٛ�ΈX\��ܚٛ����[�\�[��JK^X�][ۜΈ�K��[�\�[�NB�JB�
N��Ԓѓ���H�ؔ�\�[˛X\
�O����ܚٛ��NS�VP�USӔ�H�ؔ�\�[˙�]X\
�O���^X�][ۜ�N�\�[��]�Q]HH�YN\��[��YH�]�]J
N����X��\]H�YZ�H�\����H�X[]B��ۜ��X[�YZ�HH��\]U�YZ�Q]JS�VP�USӔ�NY�
�X[�YZ�JH�QR�W�UHH�X[�YZ�N�]��YZ�P�\�

N���\]H�\����H�X[]B�\]R�T�]�
N��[�\��ܚٛ���
N�[�\�RT�[[X\�J
N\]T�[�ИY�J	�]�I�N�X�ћܑ�Z[\�\�
N�Y��	��P��T����[��Y	��Ԓѓ��˛[��H��[�\�[��K	�S�VP�USӔ˛[��H^X�][ۜ�]	ٛܛX][YJ
_K�
N�ԙX[^X�][ۜ��ؔ�\�[�N�H�]�
\��HY�
�Ԓѓ��˛[��OOH
H�Ԓѓ���H�UP���Ԓѓ���\�[��]�Q]HH�[�N�[�\��ܚٛ���
N�[�\�RT�[[X\�J
NB�\]T�[�ИY�J	�\��܉�NY��	��T���XZ�K���HTH[��XX�X�H8�%���[��[[�]K�
	�\���Y\��Y�_JX
NB�B����8� 8� �[���Y�H8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��[��[ۈ\]T�[�ИY�J�]JH]�Y�HH��[Y[���][[Y[��RY
	��[��X�Y�I�NY�
X�Y�JH�ۜ�XY[��H��[Y[��]Y\�T�[X�܊	˜�X�[ۋ]]K���\�ZXY\��NY�
XY[��H�Y�HH��[Y[��ܙX]Q[[Y[�
	��[��N�Y�K�YH	��[��X�Y�I��Y�K��[K����^H��۝\�^�N��ܙ[N�Y[�Έ���ܙ\�\�Y]\ΈNN\X\��[�[Y��L��\�X�[X[Yێ�ZYN��۝]�ZY��
���[��][ێ�[���XY[�˘\[��[
�Y�JNB�B�Y�
X�Y�JH�]\��Y�
�]HOOH	��[��[���H�Y�K�^�۝[�H	�����[��[���)���Y�K��[K��X��ܛ�[�H	ܙؘJ
����L��MJI��Y�K��[K���܈H	��YN	�H[�HY�
�]HOOH	�]�I�H�ۜ�H\��[��Y��\��[��Y����[U[YT��[���K��\��	̋YY�]	�Z[�]N�	̋YY�]	�JB��	���Y�K�^�۝[�H8���]�H8�%	�X�Y�K��[K��X��ܛ�[�H	ܙؘJ
����L��MJI��Y�K��[K���܈H	��YN	�H[�H�Y�K�^�۝[�H	����[[�]I��Y�K��[K��X��ܛ�[�H	ܙؘJ�LL�LL��MJI��Y�K��[K���܈H	�َ
�M�I�B�B����8� 8� �Y[����[]ۈ8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��[��[ۈ�[�\��Y[���]J
H�ܚٛ��\��[��\�SH\��^K����J�[���
K

HO����[OH��X�]N���[�[X][ێ�[�HK�\�X\�KZ[�[�][��[�]Nȏ����[��\��H�\��ZY���%8�%8�%8�%8�%8�%��[������]��\��H�Y�[�[�[YH��[OH��Y�M�ZY��MؘX��ܛ�[���ؘJ�MK�MK�MK�
N؛ܙ\�\�Y]\΍ȏ��]�������[��\��H�[�[X�Y�H[�[X�]YH��[OH��Y�L�\�^N�[�[�KX����ȏ��������[�������[��\��H��]\�X�Y�H�]\�\�[��[�ȏ��Y[���)���[������]��\��H���ܙ\��X�\�X�۝Z[�\���]��\��H���ܙ\��X�\�Y�[��[OH��Y�	H���]���]������\��H����X�[���%�����������
K���[�	��NB����8� 8� �ܚٛ���X�H8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��[��[ۈ�[�\��ܚٛ���
H�ܚٛ��\��[��\�SH	��Y�
�Ԓѓ��˛[��OOH
H�ܚٛ��\��[��\�SH������[�H�Ȉ�[OH�^X[Yێ��[�\��Y[�Ό��[N���܎��\�K]^]\�X\�JNȏ�����ܚٛ�����[���������]\��B��Ԓѓ��˙�ܑXX�
\��O��ۜ��H��[Y[��ܙX]Q[[Y[�
	���N]�]\ИY�HH	��Y�
\�˜�]\�OOH	ܝ[��[���B��]\ИY�HH�[��\��H��]\�X�Y�H�]\�\�[��[�ȏ�]��\��H�[�KY���[OH��Y���ZY���ȏ��]���[��[����[��[�HY�
\�˜�]\�OOH	���\]Y	�B��]\ИY�HH�[��\��H��]\�X�Y�H�]\�X��\]Y��H]K[X�YOH��X�Ȉ�[OH��Y�L��ZY��L����O���\]Y��[��[�HY�
\�˜�]\�OOH	٘Z[Y	�B��]\ИY�HH�[��\��H��]\�X�Y�H�]\�Y�Z[Y��H]K[X�YOH���[OH��Y�L��ZY��L����O��Z[Y��[���]�\��\��H	��Y�
\�˜�]\�OOH	���\]Y	�H�\��\��H	�ۙI�[�HY�
\�˜�]\�OOH	٘Z[Y	�H�\��\��H	�\��܉���ۜ�[�[�\��H\�˛[�[OOH	��]YI��	�[�[X�]YI��	�[�[Y�[Z[�I���[��\�SH���[��\��H�\��ZY���\�˚YO��[�������]��\��H�Y�[�[�[YH���H]K[X�YOH��\�˚X�۟H��[OH��Y�M��ZY��M����܎��\�K]^]\�X\�JH���O��	�\�˘Y�[�B��[��[OH��۝\�^�N���\�[N���܎��\�K]^]\�X\�JNȏ�	�\�˝\_JO��[����]��������[��\��H�[�[X�Y�H	�[�[�\��H���\�˛[�[X�[O��[��������]\ИY�_O�����]��\��H���ܙ\��X�\�X�۝Z[�\����]��\��H���ܙ\��X�\�Y�[	ؘ\��\��H��[OH��Y��\�˜��ܙ\��IH���]����]�������\��H����X�[��	�\�˘���\�[X]K�њ^Y


_O������]ۈ�\��H�X�[ۋX���]KZYH��\�˚YH�]OH��Y]�]Z[ȏ��H]K[X�YOH�[ܙK]�\�X�[���O��؝]ۏ������ܚٛ��\��\[��[
�NJN�ܚٛ��\��]Y\�T�[X�ܐ[
	˘X�[ۋX���K��ܑXX�
��O����Y]�[�\�[�\�	��X���

HO��[�[�[
���]\�]�Y
JNJNX�YK�ܙX]RX�ۜ�
NB����8� 8� [�[8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��[��[ۈ�[�[�[
\��Y
H�ۜ�\��H�Ԓѓ��˙�[�
O��YOOH\��Y
NY�
]\��H�]\����[Y[���][[Y[��RY
	�[�[]�YZY	�K�^�۝[�H\�˚Y��[Y[���][[Y[��RY
	�[�[XY�[�	�K�^�۝[�H	�\�˘Y�[�H8�%	�\�˝\_X�ۜ�[�[�\��H\�˛[�[OOH	��]YI��	�[�[X�]YI��	�[�[Y�[Z[�I���[Y[���][[Y[��RY
	�[�[[[�[	�K�[��\�SH�[��\��H�[�[X�Y�H	�[�[�\��H���\�˛[�[X�[O��[����[Y[���][[Y[��RY
	�[�[]��[���K�^�۝[�H\�˝��[��\�Y�\�˝��[��\�Y����[T��[��
H�	��%	���[Y[���][[Y[��RY
	�[�[][YI�K�^�۝[�H\�˝[YQ[\�Y��[Y[���][[Y[��RY
	�[�[X���	�K�^�۝[�H		�\�˘���\�[X]K�њ^Y


_X��[Y[���][[Y[��RY
	�[�[\�X��\��\�]I�K�^�۝[�H	�\�˜�X��\�Ԙ]_IX]�]\ИY�HH	��Y�
\�˜�]\�OOH	ܝ[��[���H�]\ИY�HH�[��\��H��]\�X�Y�H�]\�\�[��[�ȏ��[��[����[��[�HY�
\�˜�]\�OOH	���\]Y	�H�]\ИY�HH�[��\��H��]\�X�Y�H�]\�X��\]Y����\]Y��[��[�HY�
\�˜�]\�OOH	٘Z[Y	�H�]\ИY�HH�[��\��H��]\�X�Y�H�]\�Y�Z[Y���Z[Y��[����[Y[���][[Y[��RY
	�[�[\�]\��K�[��\�SH�]\ИY�N��[Y[���][[Y[��RY
	�[�[[�]]	�K�^�۝[�H\�˛�]]��[Y[���][[Y[��RY
	�\��[[�[	�K��\��\��Y
	�X�]�I�NB���[��[ۈ���S[�[

H��[Y[���][[Y[��RY
	�\��[[�[	�K��\��\���[[ݙJ	�X�]�I�NB����8� 8� �YZ�H�\��\�8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��[��[ۈ�]��YZ�P�\�

H�ۜ��[��\�H��[Y[���][[Y[��RY
	��YZ�KX�\�	�NY�
X�[��\�H�]\�����\�H�X[]HY�]�Z[X�K�\��\�H���[\H�]B��ۜ�]HH�QR�W�UK�[�����QR�W�UH��[Y�
Y]JH�ۜ���H�[��\˙�]�۝^
	̙	�N�ۜ��۝Z[�\�H�[��\˜\�[�[[Y[��[��\˝�YH�۝Z[�\���Y[��Y
�
�[��˙]�X�T^[�][�JN�[��\˚ZY�H�۝Z[�\���Y[�ZY�
�
�[��˙]�X�T^[�][�JN�[��\˜�[K��YH�۝Z[�\���Y[��Y
�	�	��[��\˜�[K�ZY�H�۝Z[�\���Y[�ZY�
�	�	������[J�[��˙]�X�T^[�][�K�[��˙]�X�T^[�][�JN����[�[HH	ܙؘJLLM�L�K�JI�����۝H	�M[�\��[��\�\�Y�����^[YۈH	��[�\������[^
	��Y[��^X�][ۈ]x�)���۝Z[�\���Y[��Y���۝Z[�\���Y[�ZY���N�]\��B���ۜ��۝Z[�\�H�[��\˜\�[�[[Y[��ۜ��H�[��˙]�X�T^[�][�N�ۜ��YH�۝Z[�\���Y[��Y�ۜ�ZY�H�۝Z[�\���Y[�ZY��[��\˝�YH�Y
���[��\˚ZY�HZY�
���[��\˜�[K��YH�Y
�	�	��[��\˜�[K�ZY�HZY�
�	�	��ۜ��H�[��\˙�]�۝^
	̙	�N����[J��N��ۜ�YH�����Y������N�
MY��

N�ۜ��\��H�YHY�Y�HY��Y��ۜ��\�HZY�HY��HY����N�ۜ�X^�[HX]�X^
���]K�X\
O���Y[��KJN�ۜ��\�ܛ�\�H�\���]K�[���ۜ��\��H�\�ܛ�\�
��MN�ۜ��\��\H
�\�ܛ�\�H�\��H�����ܚY[�\�
�HX�[�ۜ�ܚY[�\�H
�܈
]HH�HHܚY[�\��J��H�ۜ�HHY��
�
�\��ܚY[�\�H
�N������T�[HH	ܙؘJ�MK�MK�MK�
JI���[�U�YHN���Y�[�]

N��[ݙU�Y�Y�JN��[�U�Y�Y�
��\��JN������J
N�ۜ��[HX]���[�
X^�[H
X^�[�ܚY[�\�H
�JN���[�[HH	ܙؘJLLM�L�K�
I����۝H	�L\[�\��[��\�\�Y����^[YۈH	ܚY�	����[^
�[Y�Y�HH
�

NB�����\�]K��ܑXX�

JHO��ۜ��\�H
��Y[���X^�[
H
��\��ۜ�HY�Y�
�H
��\�ܛ�\�
��\��\�ۜ�HHY��
��\�H�\��ۜ�ܘYH��ܙX]S[�X\�ܘYY[�
KH
��\�
NܘY�Y��ܔ��
	ܙؘJ
����L��JI�NܘY�Y��ܔ��
K	ܙؘJ
NKL��
��JI�N���[�[HHܘY���Y�[�]

NY�
����[��X�
H����[��X�
K�\���\��
JN[�H���X�
K�\���\�
N���[

N���[YHX�[����[�[HH	ܙؘJ��L�L��
JI����۝H	؛�L\[�\��[��\�\�Y����^[YۈH	��[�\�����[^
��Y[��
��\����HH
�N��X�[����[�[HH	ܙؘJLLM�L�K�
I����۝H	�L[�\��[��\�\�Y�����[^
��YZ�
��\����Y��
��\�
���NJNB����8� 8� RH�[[X\�H[�[8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��[��[ۈ�[�\�RT�[[X\�J
H�ۜ��[��[��H�Ԓѓ��˜�YX�J
�
HO��
�
���[��\�Y
K
N�ۜ��[���H�Ԓѓ��˜�YX�J
�
HO��
�����\�[X]K
N�ۜ�]���X��\��H�Ԓѓ��˛[����X]���[�
�Ԓѓ��˜�YX�J
�
HO��
���X��\�Ԙ]K
H��Ԓѓ��˛[��
B���ۜ��]YP��[�H�Ԓѓ��˙�[\�O��[�[OOH	��]YI�K�[���ۜ��[Z[�P��[�H�Ԓѓ��˙�[\�O��[�[OOH	��[Z[�I�K�[���ۜ���\]Y��[�H�Ԓѓ��˙�[\�O���]\�OOH	���\]Y	�K�[���ۜ��Z[Y��[�H�Ԓѓ��˙�[\�O���]\�OOH	٘Z[Y	�K�[�����[Y[���][[Y[��RY
	�ZK]�[]��[���K�^�۝[�H�[��[����[��[�˝���[T��[��
H�	��%	���[Y[���][[Y[��RY
	�ZK]�[X���	�K�^�۝[�H		��[����њ^Y


_X��[Y[���][[Y[��RY
	�ZK\�X��\��\�]I�K�^�۝[�H	�]���X��\��IX��[Y[���][[Y[��RY
	�ZKX�]YKX��[�	�K�^�۝[�H�]YP��[���[Y[���][[Y[��RY
	�ZKY�[Z[�KX��[�	�K�^�۝[�H�[Z[�P��[���[Y[���][[Y[��RY
	�ZKX��\]Y	�K�^�۝[�H��\]Y��[���[Y[���][[Y[��RY
	�ZKY�Z[Y	�K�^�۝[�H�Z[Y��[�B����8� 8� ���\�Z[�[8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ��ۜ��ܛX][YHH

HO��ۜ��H�]�]J
N�]\��	ۋ��]�\��
K����[��
K�Y�\�
�	�	�_N�ۋ��]Z[�]\�
K����[��
K�Y�\�
�	�	�_N�ۋ��]�X�ۙ�
K����[��
K�Y�\�
�	�	�_XN��[��[ۈY��]�[�\��^
H�ۜ�[��HH��[Y[��ܙX]Q[[Y[�
	�]��N[��K��\�Ә[YHH	���Y[��I�]X\�\��H	���Z[����Y�
]�[�\��OOH	��P��T���HX\�\��H	���\�X��\���Y�
]�[�\��OOH	��T���HX\�\��H	���]�\���Y�
]�[�\��OOH	�T��ԉ�HX\�\��H	���Y\��܉�[��K�[��\�SH��[��\��H���][YH���ٛܛX][YJ
_WO��[����[��\��H���[]�[	�X\�\��H���]�[�\��O��[����[��\��H���[Y\��Y�H���^O��[���\�Z[�[�YY�\[��[
[��JNY�
\�Z[�[�YY��[�[��[���L
H\�Z[�[�YY��[[ݙP�[
\�Z[�[�YY��\���[
N\�Z[�[�YY��ܛ��H\�Z[�[�YY��ܛ�ZY�B���[��[ۈ�\�����X[J
HY��	�S����	�\���\�[�]X[^�Y��NY��	�S����	��ۛ�X�[���XZ�K���HTx�)��N�����Z�H�[��HY\��Y�\�8�%ۛH�X[TH]�[��\�H���Y�B����8� 8� [�]8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� 8� ���[Y[��Y]�[�\�[�\�	��P�۝[��YY	�\�[��

HO��[�\��Y[���]J
N�\�����X[J
N�]��YZ�P�\�
const CONFIG = {
  API_PROXY: '/api/make',
  EXECUTIONS_PER_JOB: 100, // fetch more to power the weekly chart
  REFRESH_INTERVAL: 60_000,
};

// ── Mutable state ──────────────────────────────────────────────────────────────
let WORKFLOWS = [];
let ALL_EXECUTIONS = []; // all executions across all scenarios (powers chart + KPIs)
let usingLiveData = false;
let lastSynced = null;
let refreshTimer = null;
let WEEKLY_DATA = []; // computed from real executions, or [] if no data yet

// ── Static fallback data (shown only on API error) ─────────────────────────────
const STATIC_WORKFLOWS = [
  {
    id: 'VID-9402', agent: 'ScriptGen-Agent', type: 'Script Writing',
    status: 'running', progress: 45, icon: 'file-text', model: 'claude',
    modelLabel: 'Claude Sonnet 4.6', tokensUsed: 12450, timeElapsed: '2m 34s',
    costEstimate: 0.18, successRate: 94,
    output: '[02:34] Initializing ScriptGen-Agent for VID-9402\n[02:34] Topic: "10 Scary Space Facts"\n[02:35] Fetching research data from knowledge base...\n[02:36] Generating hook paragraph...\n[02:37] Writing body sections (3/7 complete)...\n[02:38] Applying tone calibration: Educational/Suspenseful\n[02:39] Script generation 45% complete...',
  },
  {
    id: 'VID-9391', agent: 'Voice-ElevenLabs', type: 'Voiceover Synthesis',
    status: 'running', progress: 82, icon: 'mic', model: 'gemini',
    modelLabel: 'ElevenLabs', tokensUsed: 8230, timeElapsed: '4m 12s',
    costEstimate: 0.09, successRate: 98,
    output: '[04:10] Voice-ElevenLabs synthesis initiated\n[04:10] Loading voice profile: "George Narrator"\n[04:11] Processing script chunks: 8/10 complete\n[04:12] Applying prosody adjustments...\n[04:12] Audio quality check: 48kHz, 320kbps\n[04:12] Synthesis 82% complete...',
  },
  {
    id: 'VID-9388', agent: 'Vision-Midjourney', type: 'Thumbnail Gen',
    status: 'completed', progress: 100, icon: 'image', model: 'gemini',
    modelLabel: 'OpenAI DALL·E', tokensUsed: 3100, timeElapsed: '1m 08s',
    costEstimate: 0.04, successRate: 100,
    output: '[01:05] Thumbnail generation started\n[01:06] Generating 4 variants...\n[01:07] Selecting highest CTR-optimized design\n[01:08] Upscaling to 1280x720...\n[01:08] SUCCESS: Artifact saved to cloud storage',
  },
  {
    id: 'VID-9385', agent: 'Editor-AutoCut', type: 'Video Editing',
    status: 'failed', progress: 34, icon: 'film', model: 'claude',
    modelLabel: 'Claude Haiku 4.5', tokensUsed: 5540, timeElapsed: '3m 21s',
    costEstimate: 0.06, successRate: 71,
    output: '[03:18] Editor-AutoCut video assembly started\n[03:19] Aligning audio track with video timeline...\n[03:21] ERROR: YouTube API authentication failed\n[03:21] FATAL: Token refresh rejected. Task aborted.',
  },
  {
    id: 'VID-9384', agent: 'Social-Poster', type: 'Scheduled Upload',
    status: 'completed', progress: 100, icon: 'upload-cloud', model: 'claude',
    modelLabel: 'Claude Haiku 4.5', tokensUsed: 1820, timeElapsed: '0m 47s',
    costEstimate: 0.02, successRate: 100,
    output: '[00:44] Social-Poster upload sequence\n[00:45] Uploading to YouTube... SUCCESS (4.2 GB)\n[00:46] Cross-posting to TikTok... SUCCESS\n[00:47] All platforms published.',
  },
];

const workflowList = document.getElementById('workflow-list');
const terminalFeed = document.getElementById('terminal-feed');

// ── Make.com helpers ───────────────────────────────────────────────────────────
function getIconForScenario(name = '') {
  const n = name.toLowerCase();
  if (n.includes('script') || n.includes('text') || n.includes('write') || n.includes('copy')) return 'file-text';
  if (n.includes('voice') || n.includes('audio') || n.includes('speech') || n.includes('eleven')) return 'mic';
  if (n.includes('image') || n.includes('thumbnail') || n.includes('visual') || n.includes('dall')) return 'image';
  if (n.includes('video') || n.includes('edit') || n.includes('render') || n.includes('cut')) return 'film';
  if (n.includes('upload') || n.includes('youtube') || n.includes('publish') || n.includes('post')) return 'upload-cloud';
  if (n.includes('email') || n.includes('newsletter') || n.includes('mail')) return 'mail';
  return 'activity';
}

function getTypeForScenario(name = '') {
  const n = name.toLowerCase();
  if (n.includes('script')) return 'Script Writing';
  if (n.includes('voice') || n.includes('eleven')) return 'Voiceover Synthesis';
  if (n.includes('thumbnail') || n.includes('image')) return 'Thumbnail Gen';
  if (n.includes('video') || n.includes('edit')) return 'Video Editing';
  if (n.includes('upload') || n.includes('youtube')) return 'Scheduled Upload';
  if (n.includes('email') || n.includes('newsletter')) return 'Newsletter';
  return 'Automation';
}

function getModelForScenario(name = '') {
  const n = name.toLowerCase();
  if (n.includes('eleven') || n.includes('voice') || n.includes('speech')) return { model: 'gemini', modelLabel: 'ElevenLabs' };
  if (n.includes('openai') || n.includes('gpt') || n.includes('dall')) return { model: 'gemini', modelLabel: 'OpenAI GPT-4o' };
  if (n.includes('midjourney') || n.includes('image')) return { model: 'gemini', modelLabel: 'DALL·E 3' };
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
  if (status === 1) return 'completed';
  if (status === 2 || status === 3 || status === 4) return 'failed';
  if (status === 'success') return 'completed';  // legacy string fallback
  if (status === 'error') return 'failed';
  if (status === 'running') return 'running';
  return 'completed';
}

function buildOutputLog(scenario, executions) {
  if (!executions || executions.length === 0) {
    return `[—] No executions found for "${scenario.name}"`;
  }
  return executions
    .slice(0, 5)
    .map(e => {
      const t = new Date(e.timestamp || e.createdAt || Date.now()).toLocaleTimeString();
      const dur = formatDuration(e.duration || e.durationMs);
      const ops = e.operations != null ? ` | ops: ${e.operations}` : '';
      const icon = e.status === 1 ? 'SUCCESS' : (e.status != null && e.status !== 1) ? 'ERROR' : 'INFO';
      return `[${t}] ${icon}: run #${e.id || '?'} — ${dur}${ops}`;
    })
    .join('\n');
}

function mapToWorkflow(scenario, executions = []) {
  const lastExec = executions[0];
  const rawStatus = lastExec?.status ?? 1;
  const status = makeExecStatus(rawStatus);
  const successCount = executions.filter(e => e.status === 1 || e.status === 'success').length;
  const successRate = executions.length
    ? Math.round((successCount / executions.length) * 100)
    : (status === 'completed' ? 100 : 0);
  const progress = status === 'completed' ? 100 : status === 'failed' ? Math.min(90, executions.length ? 50 : 0) : 50;
  const durationMs = lastExec?.duration || lastExec?.durationMs || 0;

  // Use centicredits if the API returns them; otherwise estimate from operations
  const centicredits = lastExec?.centicredits || 0;
  const operations = lastExec?.operations || 0;
  const costEstimate = centicredits > 0
    ? parseFloat((centicredits / 100 / 100).toFixed(4)) // centicredits → cents → dollars
    : parseFloat((operations * 0.0009).toFixed(4));     // $9 / 10,000 ops

  const { model, modelLabel } = getModelForScenario(scenario.name);
  return {
    id: `SCN-${scenario.id}`,
    agent: scenario.name || `Scenario ${scenario.id}`,
    type: getTypeForScenario(scenario.name),
    status, progress,
    icon: getIconForScenario(scenario.name),
    model, modelLabel,
    tokensUsed: 0,
    timeElapsed: formatDuration(durationMs),
    costEstimate, successRate,
    output: buildOutputLog(scenario, executions),
    _scenarioId: scenario.id,
    _isActive: scenario.isActive,
  };
}

// ── Weekly chart data computed from real execution timestamps ─────────────────
function computeWeeklyData(executions) {
  if (!executions || executions.length === 0) return null;

  const weekMap = new Map(); // key: Sunday-of-week timestamp
  executions.forEach(e => {
    if (!e.createdAt) return;
    const d = new Date(e.createdAt);
    const sun = new Date(d);
    sun.setDate(d.getDate() - d.getDay());
    sun.setHours(0, 0, 0, 0);
    const key = sun.getTime();
    weekMap.set(key, (weekMap.get(key) || 0) + 1);
  });

  if (weekMap.size === 0) return null;

  return [...weekMap.entries()]
    .sort(([a], [b]) => a - b)
    .slice(-8)
    .map(([ts, count]) => ({
      week: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      videos: count,
    }));
}

// ── KPI stats from real executions ────────────────────────────────────────────
function updateKPIStats() {
  if (!usingLiveData) return;

  const successful = ALL_EXECUTIONS.filter(e => e.status === 1 || e.status === 'success');
  const totalCount = successful.length;
  const totalCost = WORKFLOWS.reduce((s, w) => s + w.costEstimate, 0);
  const avgDurationMs = successful.length
    ? successful.reduce((s, e) => s + (e.duration || e.durationMs || 0), 0) / successful.length
    : 0;

  // Videos Generated
  const kpiVideos = document.getElementById('kpi-videos');
  if (kpiVideos) kpiVideos.textContent = totalCount > 0 ? totalCount.toLocaleString() : '0';
  
  // Trend: show total across all scenarios
  const kpiVideosTrend = document.getElementById('kpi-videos-trend');
  if (kpiVideosTrend) {
    const runningCount = WORKFLOWS.filter(w => w.status === 'running').length;
    kpiVideosTrend.textContent = runningCount > 0
      ? `${runningCount} scenario(s) active`
      : `${WORKFLOWS.length} scenario(s) tracked`;
  }

  // API Server Costs
  const kpiCosts = document.getElementById('kpi-costs');
  if (kpiCosts) kpiCosts.textContent = `$${totalCost.toFixed(2)}`;

  const kpiCostsTrend = document.getElementById('kpi-costs-trend');
  if (kpiCostsTrend) {
    const failedCount = WORKFLOWS.filter(w => w.status === 'failed').length;
    kpiCostsTrend.textContent = failedCount > 0
      ? `${failedCount} scenario(s) failed`
      : `${WORKFLOWS.length} scenario(s) running`;
  }

  // Avg Generation Time
  const kpiAvgTime = document.getElementById('kpi-avg-time');
  if (kpiAvgTime) kpiAvgTime.textContent = avgDurationMs > 0 ? formatDuration(avgDurationMs) : '—';

  // Success rate across all executions
  const kpiAvgTrend = document.getElementById('kpi-avg-trend');
  if (kpiAvgTrend && ALL_EXECUTIONS.length > 0) {
    const overallSuccess = Math.round((successful.length / ALL_EXECUTIONS.length) * 100);
    kpiAvgTrend.textContent = `${overallSuccess}% success rate`;
  }
}

// ── Failed scenario alerting ───────────────────────────────────────────────────�gV�7F���6�V6�f�$f��W&W2����6��7Bf��VB�t�$�d��u2�f��FW"�r��r�7FGW2���vf��VBr���f��VB�f�$V6��r����FD��r�tU%$�"r�)�"G�r�vV�G�"�7BW�V7WF���d��TB(	B6�V6���R�6��f�"FWF��2����ғ�����6��rf�6�&�R�W'B&��W"�b�66V�&��2f��V@��WB&��W"�F�7V�V�B�vWDV�V�V�D'��B�vf��W&R�&��W"r����b�f��VB��V�wF������b�&��W"���&��W"�F�7V�V�B�7&VFTV�V�V�B�vF�br���&��W"�B�vf��W&R�&��W"s��&��W"�7G��R�775FW�B� �&6�w&�V�C�&v&�#C��2�2��R���&�&FW#��6�ƖB&v&�#C��2�2��B���&�&FW"�&F�W3�����FF��s��g����&v��g���6���#�6c�ss��f��B�6��S��W&VӰ�F�7���f�W���Ɩv�֗FV�3�6V�FW#��v�������6��7B6��FV�D&�G��F�7V�V�B�VW'�6V�V7F�"�r�6��FV�B�&�G�r����b�6��FV�D&�G��6��FV�D&�G��&WV�B�&��W"���Т&��W"���W$�D���ƒFF��V6�FS�&�W'B�G&��v�R"7G��S�'v�GF��g���V�v�C�g��f�W��6�&�泣�#������7G&��s�G�f��VB��V�wF��66V�&��2�f��VC���7G&��s�G�f��VB���r��r�vV�B�����r�r��(	B6�V6���R�6�����V6�FR�7&VFT�6��2�����V�6R�b�&��W"���&��W"�&V��fR����ЧР���)H)H��r&V�W�V7WF���WfV�G2)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �gV�7F�����u&V�W�V7WF���2���%&W7V�G2�����6��rF�R2��7B&V6V�BW�V7WF���27&�72��66V�&��2�6�'FVB'�F��P�6��7B��v�F���R���%&W7V�G2�f�D����66V�&���W�V7WF���2Ғ��W�V7WF���2���R�������R�66V�&����S�66V�&�����RҒ�������v�F���P��f��FW"�R��R�F��W7F���R�7&VFVDB���6�'B���"����WrFFR�"�F��W7F���"�7&VFVDB���WrFFR��F��W7F����7&VFVDB����6Ɩ6R��R���&WfW'6R������FW7Bf�'7B6�fVVB&VG26�&�����v�6�ǐ��f�$V6��R����6��7B�WfV��R�7FGW2����u5T44U52r��R�7FGW2��V��bbR�7FGW2����tU%$�"r�t��d�s��6��7BGW"�f�&�DGW&F���R�GW&F�����R�GW&F����2���6��7B�2�R��W&F���2��G�R��W&F���7��6�rs��6��7BB��WrFFR�R�F��W7F���R�7&VFVDB��F���6�UF��U7G&��r�������W#�s"�F�v�Br�֖�WFS�s"�F�v�Brғ��FD��r��WfV���G�G��G�R�66V�&����W�(	B'V�2G�R�G��G�GW'�G��7Җ���ғ��Р���)H)H��R�6���fWF6�)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �7��2gV�7F�����T�vWB�V�G���B�&�2��Ғ��6��7B2��WrU$�6V&6�&�2��V�G���B����&�2Ғ�F�7G&��r����6��7B&W2�v�BfWF6��G�4��d�r���$�����G�7�����b�&W2������6��7BW'"�v�B&W2�6�ₒ�6F6��������Ғ���F�&�r�WrW'&�"�W'"�W'&�"���EEG�&W2�7FGW7����Т&WGW&�&W2�6�ₓ��Р�7��2gV�7F���fWF6���Uv�&�f��w2����WFFU7��4&FvR�w7��6��rr���G'���6��7B66V�&��4FF�v�B��T�vWB�w66V�&��2r���6��7B66V�&��2�66V�&��4FF�66V�&��2���Ӱ���b�66V�&��2��V�wF�������t�$�d��u2�5DD�5�t�$�d��u3��W6��tƗfTFF�f�6S��FD��r�ut$�r�t����R�6��66V�&��2f�V�B(	B6��v��rFV��FF�r���&V�FW%v�&�f��w2����&V�FW$�7V��'�����WFFU7��4&FvR�vW'&�"r���&WGW&㰢Р���fWF6�W�V7WF���2f�"WfW'�66V�&����&��V��6��7B��%&W7V�G2�v�B&�֗6R���66V�&��2���7��266V�&������G'���6��7BW�V4FF�v�B��T�vWB��66V�&��2�G�66V�&���G����w6���Ɩ֗C�4��d�r�U�T5UD���5�U%���"Т���6��7BW�V7WF���2�W�V4FF�66V�&����w2���Ӱ�&WGW&��v�&�f��s��F�v�&�f��r�66V�&���W�V7WF���2��W�V7WF���2�66V�&��Ӱ��6F6���&WGW&��v�&�f��s��F�v�&�f��r�66V�&����Ғ�W�V7WF���3����66V�&��Ӱ�ТҐ�����t�$�d��u2���%&W7V�G2���"��"�v�&�f��r������U�T5UD���2���%&W7V�G2�f�D��"��"�W�V7WF���2����W6��tƗfTFF�G'VS���7E7��6VB��WrFFR�������&V6��WFRvVV�ǒ6�'Bg&��&V�FF�6��7B&V�vVV�ǒ�6��WFUvVV�ǔFF����U�T5UD���2����b�&V�vVV�ǒ�tTT�ŕ�DD�&V�vVV�Ǔ��G&uvVV�ǔ6�'B�������WFFR��2g&��&V�FF�WFFT��7FG2�����&V�FW%v�&�f��w2����&V�FW$�7V��'�����WFFU7��4&FvR�vƗfRr���6�V6�f�$f��W&W2�����FD��r�u5T44U52r�7��6VBG�t�$�d��u2��V�wF��66V�&��2��G����U�T5UD���2��V�wF��W�V7WF���2BG�f�&�EF��R���������u&V�W�V7WF���2���%&W7V�G2�����6F6��W'"����b�t�$�d��u2��V�wF�������t�$�d��u2�5DD�5�t�$�d��u3��W6��tƗfTFF�f�6S��&V�FW%v�&�f��w2����&V�FW$�7V��'�����ТWFFU7��4&FvR�vW'&�"r���FD��r�ut$�r���R�6���V�&V6�&�R(	B6��v��rFV��FF��G�W'"��W76vWҖ���ЧР���)H)H7��2&FvR)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �gV�7F���WFFU7��4&FvR�7FFR����WB&FvR�F�7V�V�B�vWDV�V�V�D'��B�w7��2�&FvRr����b�&FvR���6��7B�VF��r�F�7V�V�B�VW'�6V�V7F�"�r�6V7F����F�F�R��"��6&BֆVFW"r����b��VF��r���&FvR�F�7V�V�B�7&VFTV�V�V�B�w7�r���&FvR�B�w7��2�&FvRs��&FvR�7G��R�775FW�B� �f��B�6��S��w&VӲFF��s�'����&�&FW"�&F�W3��������&v����VgC���fW'F�6��Ɩv�֖FF�S�f��B�vV�v�C�c�G&�6�F������73�����VF��r�V�D6���B�&FvR���ТТ�b�&FvR�&WGW&㰢�b�7FFR���w7��6��rr���&FvR�FW�D6��FV�B�~)�27��6��~(
bs��&FvR�7G��R�&6�w&�V�B�w&v&�sB�##"�#���R�s��&FvR�7G��R�6���"�r3FFS�s���V�6R�b�7FFR���vƗfRr���6��7BB��7E7��6V@���7E7��6VB�F���6�UF��U7G&��r�������W#�s"�F�v�Br�֖�WFS�s"�F�v�BrҐ��rs��&FvR�FW�D6��FV�B�)x�ƗfR(	BG�G���&FvR�7G��R�&6�w&�V�B�w&v&�sB�##"�#���R�s��&FvR�7G��R�6���"�r3FFS�s���V�6R��&FvR�FW�D6��FV�B�~)x�FV��FFs��&FvR�7G��R�&6�w&�V�B�w&v&�#C��2�2��R�s��&FvR�7G��R�6���"�r6c�sss��ЧР���)H)H��F��r6�V�WF��)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �gV�7F���&V�FW$��F��u7FFR����v�&�f��tƗ7B���W$�D���'&��g&�҇��V�wF��B������ ��G"7G��S�&�6�G���C���F���V�6R�W2V6R֖���WB��f��FS�#��FC��7�6�73�'F6�֖B#�(	N(	N(	N(	N(	N(	C��7����FC��FC��F�b6�73�&vV�B���R"7G��S�'v�GF��C���V�v�C�G��&6�w&�V�C�&v&�#SR�#SR�#SR�����&�&FW"�&F�W3�G��#���F�c���FC��FC��7�6�73�&��FV��&FvR��FV��6�VFR"7G��S�'v�GF�����F�7�����Ɩ�R�&��6��#�f�'7���7����FC��FC��7�6�73�'7FGW2�&FvR7FGW2�'V���r#���F��~(
c��7����FC��FC��F�b6�73�'&�w&W72�&"�6��F��W"#��F�b6�73�'&�w&W72�&"�f���"7G��S�'v�GF��R#���F�c���F�c���FC��FB6�73�&6�7B�6V��#�(	C��FC��FC���FC���G#������rr���Р���)H)Hv�&�f��w2F&�R)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �gV�7F���&V�FW%v�&�f��w2����v�&�f��tƗ7B���W$�D���rs���b�t�$�d��u2��V�wF�������v�&�f��tƗ7B���W$�D��� ��G#��FB6��7��#r"7G��S�'FW�B�Ɩv�6V�FW#�FF��s�'&VӶ6���#�f"���FW�B�FW'F�'���#���v�&�f��w2f�V�B���FC���G#���&WGW&㰢Тt�$�d��u2�f�$V6��F6�����6��7BG"�F�7V�V�B�7&VFTV�V�V�B�wG"r����WB7FGW4&FvR�rs���b�F6��7FGW2���w'V���rr��7FGW4&FvR��7�6�73�'7FGW2�&FvR7FGW2�'V���r#��F�b6�73�'V�6R�F�B"7G��S�'v�GF��g���V�v�C�g��#���F�c�'V���s��7����V�6R�b�F6��7FGW2���v6���WFVBr��7FGW4&FvR��7�6�73�'7FGW2�&FvR7FGW2�6���WFVB#�ƒFF��V6�FS�&6�V6�"7G��S�'v�GF��'���V�v�C�'�#�����6���WFVC��7����V�6R�b�F6��7FGW2���vf��VBr��7FGW4&FvR��7�6�73�'7FGW2�&FvR7FGW2�f��VB#�ƒFF��V6�FS�'�"7G��S�'v�GF��'���V�v�C�'�#�����f��VC��7������WB&$6�72�rs���b�F6��7FGW2���v6���WFVBr�&$6�72�vF��Rs��V�6R�b�F6��7FGW2���vf��VBr�&$6�72�vW'&�"s���6��7B��FV�6�72�F6����FV����v6�VFRr�v��FV��6�VFRr�v��FV��vV֖�s��G"���W$�D��� ��FC��7�6�73�'F6�֖B#�G�F6��G���7����FC��FC��F�b6�73�&vV�B���R#�ƒFF��V6�FS�"G�F6��6���"7G��S�'v�GF��g���V�v�C�g��6���#�f"���FW�B�FW'F�'��#�����G�F6��vV�GТ�7�7G��S�&f��B�6��S��sW&VӶ6���#�f"���FW�B�FW'F�'���#�G�F6��G�Wғ��7����F�c���FC��FC��7�6�73�&��FV��&FvRG���FV�6�77�#�G�F6����FV��&V����7����FC��FC�G�7FGW4&FvW���FC��FC��F�b6�73�'&�w&W72�&"�6��F��W"#��F�b6�73�'&�w&W72�&"�f���G�&$6�77�"7G��S�'v�GF��G�F6��&�w&W77�R#���F�c���F�c���FC��FB6�73�&6�7B�6V��#�BG�F6��6�7DW7F��FR�F�f��VB�B����FC��FC��'WGF��6�73�&7F����'F�"FF֖C�"G�F6��G�"F�F�S�%f�WrFWF��2#�ƒFF��V6�FS�&��&R�fW'F�6�#�������'WGF�����FC���v�&�f��tƗ7B�V�D6���B�G"���ғ��v�&�f��tƗ7B�VW'�6V�V7F�$�r�7F����'F�r��f�$V6��'F�����'F��FDWfV�DƗ7FV�W"�v6Ɩ6�r������V���F'F��FF6WB�B����ғ���V6�FR�7&VFT�6��2����Р���)H)H��F�)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �gV�7F����V���FF6��B���6��7BF6��t�$�d��u2�f��B�B��B�B���F6��B����b�F6��&WGW&㰢F�7V�V�B�vWDV�V�V�D'��B�v��F��f�B֖Br��FW�D6��FV�B�F6��C��F�7V�V�B�vWDV�V�V�D'��B�v��F��vV�Br��FW�D6��FV�B�G�F6��vV�G�(	BG�F6��G�W���6��7B��FV�6�72�F6����FV����v6�VFRr�v��FV��6�VFRr�v��FV��vV֖�s��F�7V�V�B�vWDV�V�V�D'��B�v��F����FV�r����W$�D����7�6�73�&��FV��&FvRG���FV�6�77�#�G�F6����FV��&V����7����F�7V�V�B�vWDV�V�V�D'��B�v��F��F��V�2r��FW�D6��FV�B�F6��F��V�5W6VB�F6��F��V�5W6VB�F���6�U7G&��r���~(	Bs��F�7V�V�B�vWDV�V�V�D'��B�v��F��F��Rr��FW�D6��FV�B�F6��F��TV�6VC��F�7V�V�B�vWDV�V�V�D'��B�v��F��6�7Br��FW�D6��FV�B�BG�F6��6�7DW7F��FR�F�f��VB�B����F�7V�V�B�vWDV�V�V�D'��B�v��F��7V66W72�&FRr��FW�D6��FV�B�G�F6��7V66W75&FW�V���WB7FGW4&FvR�rs���b�F6��7FGW2���w'V���rr�7FGW4&FvR��7�6�73�'7FGW2�&FvR7FGW2�'V���r#�'V���s��7����V�6R�b�F6��7FGW2���v6���WFVBr�7FGW4&FvR��7�6�73�'7FGW2�&FvR7FGW2�6���WFVB#�6���WFVC��7����V�6R�b�F6��7FGW2���vf��VBr�7FGW4&FvR��7�6�73�'7FGW2�&FvR7FGW2�f��VB#�f��VC��7����F�7V�V�B�vWDV�V�V�D'��B�v��F��7FGW2r����W$�D���7FGW4&FvS��F�7V�V�B�vWDV�V�V�D'��B�v��F���WGWBr��FW�D6��FV�B�F6���WGWC��F�7V�V�B�vWDV�V�V�D'��B�wF6����F�r��6�74Ɨ7B�FB�v7F�fRr���Р�gV�7F���6��6T��F���F�7V�V�B�vWDV�V�V�D'��B�wF6����F�r��6�74Ɨ7B�&V��fR�v7F�fRr���Р���)H)HvVV�ǒ&"6�'B)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �gV�7F���G&uvVV�ǔ6�'B����6��7B6�f2�F�7V�V�B�vWDV�V�V�D'��B�wvVV�ǒ�6�'Br����b�6�f2�&WGW&㰠���W6R&V�FF�bf��&�R��F�W'v�6R6��rV�G�7FFP�6��7BFF�tTT�ŕ�DD��V�wF���tTT�ŕ�DD��V�ð��b�FF���6��7B7G�"�6�f2�vWD6��FW�B�s&Br���6��7B6��F��W"�6�f2�&V�DV�V�V�C��6�f2�v�GF��6��F��W"�6ƖV�Ev�GF���v��F�r�FWf�6U��V�&F�������6�f2�V�v�B�6��F��W"�6ƖV�D�V�v�B��v��F�r�FWf�6U��V�&F�������6�f2�7G��R�v�GF��6��F��W"�6ƖV�Ev�GF��w�s��6�f2�7G��R�V�v�B�6��F��W"�6ƖV�D�V�v�B�w�s��7G�"�66�R�v��F�r�FWf�6U��V�&F�����v��F�r�FWf�6U��V�&F�������7G�"�f���7G��R�w&v&��b�3���R�s��7G�"�f��B�sG���FW"�6�2�6W&�bs��7G�"�FW�DƖv��v6V�FW"s��7G�"�f���FW�B�t��F��rW�V7WF���FF(
br�6��F��W"�6ƖV�Ev�GF��"�6��F��W"�6ƖV�D�V�v�B�"���&WGW&㰢Р�6��7B6��F��W"�6�f2�&V�DV�V�V�C��6��7BG"�v��F�r�FWf�6U��V�&F������6��7Bv�GF��6��F��W"�6ƖV�Ev�GF���6��7B�V�v�B�6��F��W"�6ƖV�D�V�v�C��6�f2�v�GF��v�GF��G#��6�f2�V�v�B��V�v�B�G#��6�f2�7G��R�v�GF��v�GF��w�s��6�f2�7G��R�V�v�B��V�v�B�w�s��6��7B7G��6�f2�vWD6��FW�B�s&Br���7G��66�R�G"�G"����6��7BB��F��#��&�v�C�#�&�GF�ӢSB��VgC�CBӰ�6��7B6�'Er�v�GF��B��VgB�B�&�v�C��6��7B6�'D���V�v�B�B�F��B�&�GF�Ӱ�6��7B��f���F��������FF���B��B�f�FV�2�����6��7B&$w&�Wr�6�'Er�FF��V�wF���6��7B&%r�&$w&�Wr��SS��6��7B&$v��&$w&�Wr�&%r��#�����w&�BƖ�W2���&V�0�6��7Bw&�DƖ�W2�C��f�"��WB������w&�DƖ�W3�������6��7B��B�F���6�'D��w&�DƖ�W2�����7G��7G&��U7G��R�w&v&�#SR�#SR�#SR��R�s��7G��Ɩ�Uv�GF����7G��&Vv��F�����7G����fUF�B��VgB�����7G��Ɩ�UF�B��VgB�6�'Er�����7G��7G&��R����6��7Bf���F��&�V�B���f�����f��w&�DƖ�W2������7G��f���7G��R�w&v&��b�3��をs��7G��f��B�s���FW"�6�2�6W&�bs��7G��FW�DƖv��w&�v�Bs��7G��f���FW�B�f��B��VgB�����B���Р���&'0�FF�f�$V6���B�������6��7B&$���B�f�FV�2���f�6�'D���6��7B��B��VgB���&$w&�Wr�&$v��6��7B��B�F��6�'D��&$���6��7Bw&B�7G��7&VFTƖ�V$w&F�V�B���������&$����w&B�FD6���%7F���w&v&�sB�##"�#��㒒r���w&B�FD6���%7F���w&v&�S��3�#Cb��R�r���7G��f���7G��R�w&C��7G��&Vv��F������b�7G��&�V�E&V7B�7G��&�V�E&V7B�����&%r�&$���B�B��ғ��V�6R7G��&V7B�����&%r�&$����7G��f�������f�VR�&V��7G��f���7G��R�w&v&�#C��#S�#S"��R�s��7G��f��B�v&��B���FW"�6�2�6W&�bs��7G��FW�DƖv��v6V�FW"s��7G��f���FW�B�B�f�FV�2���&%r�"���b�������&V��7G��f���7G��R�w&v&��b�3��をs��7G��f��B�s���FW"�6�2�6W&�bs��7G��f���FW�B�B�vVV����&%r�"�B�F��6�'D��#"���ғ��Р���)H)H�7V��'��V�)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �gV�7F���&V�FW$�7V��'�����6��7BF�F�F��V�2�t�$�d��u2�&VGV6R��2�B���2��B�F��V�5W6VB�������6��7BF�F�6�7B�t�$�d��u2�&VGV6R��2�B���2�B�6�7DW7F��FR����6��7Bfu7V66W72�t�$�d��u2��V�wF����F��&�V�B�t�$�d��u2�&VGV6R��2�B���2�B�7V66W75&FR���t�$�d��u2��V�wF������6��7B6�VFT6�V�B�t�$�d��u2�f��FW"�B��B���FV����v6�VFRr���V�wF���6��7BvV֖�6�V�B�t�$�d��u2�f��FW"�B��B���FV����vvV֖�r���V�wF���6��7B6���WFVD6�V�B�t�$�d��u2�f��FW"�B��B�7FGW2���v6���WFVBr���V�wF���6��7Bf��VD6�V�B�t�$�d��u2�f��FW"�B��B�7FGW2���vf��VBr���V�wF����F�7V�V�B�vWDV�V�V�D'��B�v��F�F��F��V�2r��FW�D6��FV�B�F�F�F��V�2�F�F�F��V�2�F���6�U7G&��r���~(	Bs��F�7V�V�B�vWDV�V�V�D'��B�v��F�F��6�7Br��FW�D6��FV�B�BG�F�F�6�7B�F�f��VB�B����F�7V�V�B�vWDV�V�V�D'��B�v��7V66W72�&FRr��FW�D6��FV�B�G�fu7V66W77�V��F�7V�V�B�vWDV�V�V�D'��B�v��6�VFR�6�V�Br��FW�D6��FV�B�6�VFT6�V�C��F�7V�V�B�vWDV�V�V�D'��B�v��vV֖��6�V�Br��FW�D6��FV�B�vV֖�6�V�C��F�7V�V�B�vWDV�V�V�D'��B�v��6���WFVBr��FW�D6��FV�B�6���WFVD6�V�C��F�7V�V�B�vWDV�V�V�D'��B�v��f��VBr��FW�D6��FV�B�f��VD6�V�C��Р���)H)H��r�FW&֖��)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �6��7Bf�&�EF��R�������6��7B���WrFFR����&WGW&�G���vWD��W'2���F�7G&��r���E7F'B�"�sr�ӢG���vWD֖�WFW2���F�7G&��r���E7F'B�"�sr�ӢG���vWE6V6��G2���F�7G&��r���E7F'B�"�sr����Ӱ��gV�7F���FD��r��WfV�6�72�FW�B���6��7BV�G'��F�7V�V�B�7&VFTV�V�V�B�vF�br���V�G'��6�74��R�v��r�V�G'�s���WB�6�72�v��r֖�f�s���b��WfV�6�72���u5T44U52r��6�72�v��r�7V66W72s���b��WfV�6�72���ut$�r��6�72�v��r�v&�s���b��WfV�6�72���tU%$�"r��6�72�v��r�W'&�"s��V�G'����W$�D��� ��7�6�73�&��r�F��R#�G�f�&�EF��R������7���7�6�73�&��r��WfV�G��6�77�#�G��WfV�6�77���7���7�6�73�&��r��W76vR#�G�FW�G���7����FW&֖��fVVB�V�D6���B�V�G'�����b�FW&֖��fVVB�6���G&V���V�wF���FW&֖��fVVB�&V��fT6���B�FW&֖��fVVB�f�'7D6���B���FW&֖��fVVB�67&���F��FW&֖��fVVB�67&��ĆV�v�C��Р�gV�7F���7F'D��u7G&V҂���FD��r�t��d�r�tF6�&�&B��F�Ɨ�VB�r���FD��r�t��d�r�t6���V7F��rF���R�6���(
br�������f�R&�F���W76vW2(	B��ǒ&V��WfV�G2&R��vvV@�Р���)H)H��B)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �F�7V�V�B�FDWfV�DƗ7FV�W"�tD��6��FV�D��FVBr�7��2������&V�FW$��F��u7FFR����7F'D��u7G&V҂���G&uvVV�ǔ6�'B�����G&w2&��F��r"7FFR��F��ǐ��v�BfWF6���Uv�&�f��w2�����&Vg&W6�F��W"�6WD��FW'ffWF6���Uv�&�f��w2�4��d�r�$Te$U4����DU%d���F�7V�V�B�vWDV�V�V�D'��B�v��F��6��6R�'F�r���FDWfV�DƗ7FV�W"�v6Ɩ6�r�6��6T��F��F�7V�V�B�vWDV�V�V�D'��B�wF6����F�r���FDWfV�DƗ7FV�W"�v6Ɩ6�r�R�����b�R�F&vWB���R�7W'&V�EF&vWB�6��6T��F���ғ���F�7V�V�B�vWDV�V�V�D'��B�w7��2�&FvRr���FDWfV�DƗ7FV�W"�v6Ɩ6�r�������6�V$��FW'f&Vg&W6�F��W"���fWF6���Uv�&�f��w2����&Vg&W6�F��W"�6WD��FW'ffWF6���Uv�&�f��w2�4��d�r�$Te$U4����DU%d��ғ�����)H)H$�WrF6�"'WGF��(	Bf�&W2��R�6��vV&����)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H)H �6��7B�WuF6�'F��F�7V�V�B�VW'�6V�V7F�"�r�'F��&��'�r����b��WuF6�'F����WuF6�'F��FDWfV�DƗ7FV�W"�v6Ɩ6�r�7��2������6��7B�&�v��ąD����WuF6�'F����W$�D�ð��WuF6�'F��F�6&�VB�G'VS���WuF6�'F��FW�D6��FV�B�u7F'F��~(
bs��FD��r�t��d�r�uG&�vvW&��r�WrF6�f���R�6���VƖ�^(
br���G'���6��7B&W2�v�BfWF6��v�GG3��������W3"���R�6���v�3w&&G���vw&WV��3f�G��CW2r����WF��C�u�5Br���VFW'3��t6��FV�B�G�Rs�vƖ6F�����6��r���&�G���4���7G&��v�g���G&�vvW#�v�Wu�F6�r�F��W7F���WrFFR���F��4�7G&��r���6�W&6S�vF6�&�&BrҒ��ғ���b�&W2������FD��r�u5T44U52r�t�WrF6�G&�vvW&VB(	B�VƖ�R�2'V���rr���6WEF��V�WB�����fWF6���Uv�&�f��w2���S����V�6R��FD��r�tU%$�"r�u�VƖ�R&WGW&�VB7FGW2r�&W2�7FGW2���Т�6F6��W'"���FD��r�tU%$�"r�tf��VBF�&V6��VƖ�S�r�W'"��W76vR����f���ǒ���WuF6�'F��F�6&�VB�f�6S���WuF6�'F����W$�D����&�v��ąD�ð�Тғ��Чғ�
