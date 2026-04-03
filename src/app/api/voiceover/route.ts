export const dynamic = 'force-dynamic';

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, voiceId = DEFAULT_VOICE_ID } = body;
    if (!text || !text.trim()) return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'ElevenLabs API key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    const res = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, { method: 'POST', headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' }, body: JSON.stringify({ text, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }) });
    if (!res.ok) return new Response(JSON.stringify({ error: 'ElevenLabs error' }), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    const buf = await res.arrayBuffer();
    return new Response(buf, { status: 200, headers: { 'Content-Type': 'audio/mpeg', 'Content-Disposition': 'attachment; filename="voiceover.mp3"', 'Cache-Control': 'no-store' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
