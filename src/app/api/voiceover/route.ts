export const dynamic = 'force-dynamic';

const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam — deep, authoritative, best for tech YouTube

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voiceId = DEFAULT_VOICE_ID } = body as { text: string; voiceId?: string };
    if (!text || !text.trim()) return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'ElevenLabs API key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, { method: 'POST', headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.55, similarity_boost: 0.80, style: 0.25, use_speaker_boost: true } }) });
    if (!res.ok) return new Response(JSON.stringify({ error: 'ElevenLabs error' }), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    const buf = await res.arrayBuffer();
    return new Response(buf, { status: 200, headers: { 'Content-Type': 'audio/mpeg', 'Content-Disposition': 'attachment; filename="voiceover.mp3"', 'Cache-Control': 'no-store' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
