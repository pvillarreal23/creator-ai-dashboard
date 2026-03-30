// api/make.js - Vercel Serverless Proxy for Make.com API
// Keeps your API key server-side; the browser only calls /api/make

const MAKE_BASE = process.env.MAKE_BASE_URL || 'https://us2.make.com/api/v2';
const TEAM_ID   = process.env.MAKE_TEAM_ID  || '2078612';

// Only these endpoint patterns are proxied
const ALLOWED = [
  /^scenarios$/,
  /^scenarios\/\d+$/,
  /^scenarios\/\d+\/executions$/,
];

module.exports = async function handler(req, res) {
  const MAKE_API_KEY = process.env.MAKE_API_KEY;
  if (!MAKE_API_KEY) {
    return res.status(500).json({ error: 'MAKE_API_KEY environment variable is not set.' });
  }

  const { endpoint, ...queryParams } = req.query;
  if (!endpoint) {
    return res.status(400).json({ error: 'endpoint query param required' });
  }
  if (!ALLOWED.some(r => r.test(endpoint))) {
    return res.status(403).json({ error: `Endpoint "${endpoint}" is not allowed.` });
  }

  const params = new URLSearchParams({ teamId: TEAM_ID, ...queryParams });
  const url = `${MAKE_BASE}/${endpoint}?${params}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        Authorization: `Token ${MAKE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: `Upstream fetch failed: ${err.message}` });
  }
};
