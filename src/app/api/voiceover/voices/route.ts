export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'ElevenLabs API key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) return new Response(JSON.stringify({ error: 'ElevenLabs error' }), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, s-maxage=300' } });
}
