export const dynamic = 'force-dynamic';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScriptRequest {
  topic: string;
  tool_name: string;
  key_insight: string;
}

interface Chapter {
  title: string;
  content: string;
  tts_content: string; // TTS-formatted: short sentences, em-dashes, ellipses
  duration_estimate: string; // e.g. "45-60 sec"
}

interface ThumbnailSpec {
  main_text: string; // 3-5 words max
  sub_text?: string;
  color_accent: '#00D4FF' | '#FFB347'; // cyan or amber
  background: '#0A0F1E'; // navy
}

interface ScriptResponse {
  hook: string;
  hook_tts: string;
  chapters: Chapter[];
  cta: string;
  cta_tts: string;
  cta_type: 'subscribe_comment' | 'link_in_description';
  titles: [string, string, string]; // exactly 3 options
  thumbnail_spec: ThumbnailSpec;
  // Convenience: all section keys for the voiceover API
  sections: {
    hook: { text: string; section: 'hook' };
    ch1?: { text: string; section: 'tutorial' };
    ch2?: { text: string; section: 'tutorial' };
    ch3?: { text: string; section: 'tutorial' };
    ch4?: { text: string; section: 'tutorial' };
    cta: { text: string; section: 'cta' };
  };
}

// ── CTA counter (in-memory, resets on cold start — good enough) ───────────────
// Alternates: even = subscribe/comment, odd = link-in-description
let ctaCounter = 0;

// ── Prompt builder ─────────────────────────────────────────────────────────────

function buildPrompt(req: ScriptRequest, ctaType: 'subscribe_comment' | 'link_in_description'): string {
  return `You are a scriptwriter for @theedgeai — a FACELESS AI TOOLS TUTORIAL channel on YouTube.
Channel style: opinionated, direct, no fluff. Written for TTS: short sentences, em-dashes for pauses, ellipses for breath. Never more than 2 clauses per sentence.

Write a complete video script using this production bible:

TOPIC: ${req.topic}
TOOL: ${req.tool_name}
KEY INSIGHT: ${req.key_insight}

STRUCTURE RULES:
1. HOOK (45-60 sec) — Write LAST (after chapters), opinionated take. "Here's why [tool] matters and why most people are using it wrong." Creates tension before teaching. High expressiveness.
2. TUTORIAL BODY — 3-4 chapters. Each chapter produces something visible on screen within 45-60 seconds. Clear, authoritative.
3. CTA (15-20 sec) — Type: ${ctaType === 'subscribe_comment' ? 'Ask viewers to subscribe and leave a comment' : 'Direct viewers to the link in the description'}

TTS FORMATTING RULES (for tts_ fields):
- Use em-dashes (—) for brief pauses mid-sentence
- Use ellipses (...) for a breath or dramatic pause
- Keep sentences short — max 2 clauses
- Never use bullet points or markdown
- Numbers should be written out ("three" not "3")
- URLs and handles are spelled out naturally

Return ONLY valid JSON matching this exact structure (no markdown, no code fences):
{
  "hook": "<raw hook script>",
  "hook_tts": "<TTS-formatted hook>",
  "chapters": [
    {
      "title": "<chapter title>",
      "content": "<raw chapter content>",
      "tts_content": "<TTS-formatted chapter content>",
      "duration_estimate": "45-60 sec"
    }
  ],
  "cta": "<raw CTA>",
  "cta_tts": "<TTS-formatted CTA>",
  "titles": [
    "${req.tool_name.toUpperCase()}: <SURPRISING RESULT IN 4-6 WORDS>",
    "The ${req.tool_name} Secret Nobody Is Talking About",
    "I Tested ${req.tool_name} For <TIME PERIOD> — Here's What Actually Happened"
  ],
  "thumbnail_spec": {
    "main_text": "<3-5 words max, punchy>",
    "sub_text": "<optional supporting line>",
    "color_accent": "<#00D4FF or #FFB347>",
    "background": "#0A0F1E"
  }
}`;
}

// ── Helper: call Claude via Anthropic API ──────────────────────────────────────

async function generateScript(req: ScriptRequest, ctaType: 'subscribe_comment' | 'link_in_description'): Promise<ScriptResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const prompt = buildPrompt(req, ctaType);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json() as { content: Array<{ type: string; text: string }> };
  const raw = data.content.find((b) => b.type === 'text')?.text ?? '';

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  const parsed = JSON.parse(cleaned) as Omit<ScriptResponse, 'cta_type' | 'sections'>;

  // Build convenience sections map for the voiceover API
  const sections: ScriptResponse['sections'] = {
    hook: { text: parsed.hook_tts, section: 'hook' },
    cta: { text: parsed.cta_tts, section: 'cta' },
  };
  parsed.chapters.forEach((ch, i) => {
    const key = `ch${i + 1}` as 'ch1' | 'ch2' | 'ch3' | 'ch4';
    sections[key] = { text: ch.tts_content, section: 'tutorial' };
  });

  return { ...parsed, cta_type: ctaType, sections };
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<ScriptRequest>;

    if (!body.topic?.trim() || !body.tool_name?.trim() || !body.key_insight?.trim()) {
      return Response.json(
        { error: 'Missing required fields: topic, tool_name, key_insight' },
        { status: 400 }
      );
    }

    const ctaType = ctaCounter % 2 === 0 ? 'subscribe_comment' : 'link_in_description';
    ctaCounter++;

    const script = await generateScript(
      { topic: body.topic, tool_name: body.tool_name, key_insight: body.key_insight },
      ctaType
    );

    return Response.json(script);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const isJson = message.includes('JSON');
    return Response.json(
      { error: isJson ? 'Failed to parse AI response as JSON — retry' : message },
      { status: 500 }
    );
  }
}
