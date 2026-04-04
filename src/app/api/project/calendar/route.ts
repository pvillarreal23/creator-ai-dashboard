export const dynamic = 'force-dynamic';

interface CalendarRequest {
  start_date: string;
  weeks?: number;
  channel_cadence?: string;
  video_topics?: string[];
  channel_goals?: string[];
}

interface CalendarEvent {
  date: string;
  day_of_week: string;
  type: 'publish' | 'record' | 'edit' | 'research' | 'shorts' | 'community' | 'analytics';
  title: string;
  description: string;
  time_block: string;
  dependencies?: string[];
}

interface CalendarResponse {
  period: string;
  cadence: string;
  events: CalendarEvent[];
  weekly_schedule_template: Record<string, string[]>;
  milestones: Array<{ date: string; milestone: string }>;
  time_allocation: Record<string, string>;
  bottlenecks: string[];
}

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 2048, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { content: Array<{ type: string; text: string }> };
  const raw = data.content.find((b) => b.type === 'text')?.text ?? '';
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<CalendarRequest>;
    if (!body.start_date?.trim()) {
      return Response.json({ error: 'Missing required field: start_date' }, { status: 400 });
    }

    const weeks = body.weeks ?? 4;
    const cadence = body.channel_cadence ?? '2 videos per week';

    const prompt = `You are the Project Manager for @theedgeai. Generate a ${weeks}-week content calendar.

START DATE: ${body.start_date}
POSTING CADENCE: ${cadence}
PLANNED TOPICS: ${JSON.stringify(body.video_topics ?? [])}
CHANNEL GOALS: ${JSON.stringify(body.channel_goals ?? ['grow subscribers', 'increase revenue'])}

@theedgeai workflow: AI voiceover (ElevenLabs), faceless format, DaVinci Resolve editing, Ideogram thumbnails.
Typical production: Research (1h) → Script (2h AI-assisted) → Record screen (1h) → Edit (3h) → Thumbnail (30min) → Upload (30min).

Return ONLY valid JSON:
{
  "period": "<start date to end date>",
  "cadence": "${cadence}",
  "events": [
    {
      "date": "<YYYY-MM-DD>",
      "day_of_week": "<Monday etc>",
      "type": "publish|record|edit|research|shorts|community|analytics",
      "title": "<event title>",
      "description": "<what to do>",
      "time_block": "<e.g. 9am-11am>",
      "dependencies": ["<what must be done first>"]
    }
  ],
  "weekly_schedule_template": {
    "Monday": ["<task>"],
    "Tuesday": ["<task>"],
    "Wednesday": ["<task>"],
    "Thursday": ["<task>"],
    "Friday": ["<task>"]
  },
  "milestones": [{"date": "<YYYY-MM-DD>", "milestone": "<milestone description>"}],
  "time_allocation": {"research": "~2h/week", "scripting": "~4h/week", "recording": "~2h/week", "editing": "~6h/week", "distribution": "~2h/week"},
  "bottlenecks": ["<potential bottleneck in this schedule>"]
}`;

    const raw = await callClaude(prompt);
    const result = JSON.parse(raw) as CalendarResponse;
    return Response.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message.includes('JSON') ? 'Failed to parse AI response — retry' : message }, { status: 500 });
  }
}
