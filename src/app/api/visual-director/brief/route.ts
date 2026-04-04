import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are Zara Osei — cinematic AI visual director. You trained under documentary filmmakers before pivoting to master every major AI image and video generation platform: Midjourney, Kling AI, Ideogram, Runway, Pika. You think in rule of thirds, natural depth of field, motivated camera movement, and color temperature contrast. You are obsessed with one mission: making AI-generated visuals indistinguishable from real production footage.

Your core philosophy: before writing any prompt, you ask "Would a real cinematographer have shot this?" If the answer is no, you rework it until it is yes. You HATE sterile AI looks, perfect symmetry, over-saturated colors, floating objects, plastic skin, lens flares centered in frame, and anything that screams "generated." You love grain, imperfect focus pulls, camera breathing, motivated shadows, practical light sources, and the beautiful messiness of real life captured on camera.

Brand palette you always respect:
- Background: #0A0F1E (deep navy/space black)
- Accent Cyan: #00D4FF
- Accent Amber: #FFB347

You respond ONLY with a valid JSON object. No markdown fences, no preamble, no explanation — raw JSON only.

Your JSON must always include these exact keys:
- prompt: string (ultra-detailed generation prompt — 400-600 words for video, 300-400 words for stills/thumbnails/banners)
- negative_prompt: string (explicit list of things to avoid)
- settings: object with exact model settings
- shot_direction: string (editor-facing framing, camera movement, cut timing, connection to prev/next shot)
- natural_feel_notes: string (specific cinematography techniques to avoid the AI look)
- edit_cut_in: string (exact frame description to cut in on)
- edit_cut_out: string (exact frame description to cut out on)`;

interface BriefRequest {
  topic: string;
  scene_description: string;
  visual_type: 'kling_video_clip' | 'ideogram_still' | 'thumbnail' | 'banner';
  mood: string;
  duration_seconds?: number;
  brand_context?: string;
}

function buildUserPrompt(body: BriefRequest): string {
  const {
    topic,
    scene_description,
    visual_type,
    mood,
    duration_seconds,
    brand_context,
  } = body;

  const typeLabel =
    visual_type === 'kling_video_clip'
      ? 'Kling AI video clip'
      : visual_type === 'ideogram_still'
      ? 'Ideogram still image'
      : visual_type === 'thumbnail'
      ? 'YouTube thumbnail (Ideogram)'
      : 'channel banner (Ideogram)';

  const durationLine =
    visual_type === 'kling_video_clip' && duration_seconds
      ? `\nTarget clip duration: ${duration_seconds} seconds.`
      : '';

  const brandLine = brand_context
    ? `\nBrand / channel context: ${brand_context}`
    : '';

  return `Generate a complete cinematic brief for the following asset.

Visual type: ${typeLabel}
Topic: ${topic}
Scene description: ${scene_description}
Mood / tone: ${mood}${durationLine}${brandLine}

Write the full brief as a JSON object with these exact keys:

{
  "prompt": "<ultra-detailed generation prompt — ${visual_type === 'kling_video_clip' ? '400-600' : '300-400'} words. Describe lens, focal length, sensor characteristics, lighting setup with practical sources, color temperature, color grading LUT reference (e.g. Kodak 2383 emulation), specific grain structure, depth-of-field behaviour, subject positioning in frame (rule of thirds / headroom / lead room), background layers and bokeh quality, wardrobe and surface textures, time of day and atmospheric conditions, motion characteristics, any on-screen text treatment if applicable. Ground every choice in what a real DP would choose for this mood.>",
  "negative_prompt": "<comma-separated list: everything that would make this look AI-generated, over-produced, or out of place — e.g. perfect symmetry, plastic skin, uniform lighting, lens flares centered in frame, oversaturated colours, floating objects, watermarks, logo bugs, text artifacts, unrealistic reflections, digital noise patterns, HDR tonemapping halos, uncanny valley faces, unnaturally smooth surfaces, stock-photo poses>",
  "settings": {
    "model": "<exact model version string, e.g. 'kling-v2.0', 'ideogram-v3', etc.>",
    "style": "<style tag or mode>",
    "aspect_ratio": "<e.g. '16:9', '9:16', '1:1', '21:9'>",
    "magic_prompt": <true or false — boolean>,
    "duration": <seconds as integer if video, else null>,
    "camera_motion": "<Kling camera motion preset if video, else null>",
    "cfg_scale": <number or null>,
    "seed": null
  },
  "shot_direction": "<editor-facing note: exact framing description, camera movement arc with start/end positions, motivation for that movement, suggested cut timing in seconds, how this shot connects rhythmically and visually to the previous and next shot in the sequence, any match-cut or J-cut / L-cut opportunities>",
  "natural_feel_notes": "<5-8 specific techniques to keep this from looking generated: e.g. 'Request micro camera shake at 0.3° amplitude', 'Introduce a 2-frame imperfect focus pull to the background at the 4-second mark', 'Ensure shadows have soft penumbra from a single practical source, not uniform fill', 'Colour grade should clip highlights slightly — avoid HDR rolloff', 'Add hair/clothing micro-motion from a practical wind source', 'Desaturate the background 15% relative to the subject to create natural depth', 'Ensure the subject breathes — visible chest rise in the first second'>",
  "edit_cut_in": "<one sentence: exact frame to cut in on — describe the action state, subject position, camera position, what is in sharp focus>",
  "edit_cut_out": "<one sentence: exact frame to cut out on — describe the action state, subject position, camera position, what motion is completing>"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as BriefRequest;

    if (!body.topic || !body.scene_description || !body.visual_type || !body.mood) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, scene_description, visual_type, mood' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(body) }],
      }),
    });

    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    let text = data.content[0].text;
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const result = JSON.parse(text) as {
      prompt: string;
      negative_prompt: string;
      settings: Record<string, unknown>;
      shot_direction: string;
      natural_feel_notes: string;
      edit_cut_in: string;
      edit_cut_out: string;
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
