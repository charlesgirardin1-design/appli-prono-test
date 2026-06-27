const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'd6127f5d75mshc4858b179f6cf52p1c2fcdjsn08180b117e2b';
const RAPIDAPI_HOST = 'free-api-live-football-data.p.rapidapi.com';

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
    today: '/getmatchesbydate?date=2026-06-27',
  };

  const path = ENDPOINTS[endpoint] || `/${endpoint}`;

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}${path}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
