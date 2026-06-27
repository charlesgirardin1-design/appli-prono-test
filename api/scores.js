const RAPIDAPI_HOST = 'free-api-live-football-data.p.rapidapi.com';

// Clés API en cascade — la 2ème prend le relais si la 1ère est épuisée (429)
const API_KEYS = [
  process.env.RAPIDAPI_KEY_1 || 'd6127f5d75mshc4858b179f6cf52p1c2fcdjsn08180b117e2b',
  process.env.RAPIDAPI_KEY_2 || 'f266a6995amshe3ad47e5948fa7ap17ab2bjsnb808729eb291',
].filter(Boolean);

async function fetchWithFallback(path) {
  for (const key of API_KEYS) {
    const response = await fetch(`https://${RAPIDAPI_HOST}${path}`, {
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });
    if (response.status === 429) {
      console.log(`[scores] Key exhausted (429), trying next key...`);
      continue;
    }
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return { status: response.status, data };
  }
  return { status: 429, data: { message: 'All API keys exhausted' } };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint = 'live' } = req.query;

  const ENDPOINTS = {
    live: '/getliveevents',
    worldcup: '/getmatchesbycompetition?competition_id=FIFA_WC',
    worldcup2: '/getmatchesbycompetition?competition_id=WC',
    worldcup3: '/getmatchesbycompetition?competition_id=2000',
    finished: '/getmatchesbycompetition?competition_id=FIFA_WC&status=FINISHED',
    competitions: '/getcompetitions',
    today: `/getmatchesbydate?date=${new Date().toISOString().slice(0, 10)}`,
  };

  const path = ENDPOINTS[endpoint] || `/${endpoint}`;

  try {
    const { status, data } = await fetchWithFallback(path);
    res.status(status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
