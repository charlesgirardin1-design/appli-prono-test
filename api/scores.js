const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || 'a06afba82222d7ea1b53b7c8de57b4b2bd9ee31eae7fa766d9cebc57bbc8c20a';
const RAPIDAPI_HOST = 'free-api-live-football-data.p.rapidapi.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint = 'live' } = req.query;

  // Endpoints possibles de l'API
  const ENDPOINTS = {
    live: '/getliveevents',
    worldcup: '/getmatchbyworldcup',
    finished: '/getmatchesbycompetition?competition_id=FIFA_WC&status=FINISHED',
  };

  const path = ENDPOINTS[endpoint] || ENDPOINTS.live;

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}${path}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
      }
    );

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
