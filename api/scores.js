const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!FOOTBALL_DATA_KEY) {
    return res.status(500).json({ error: 'FOOTBALL_DATA_API_KEY not configured' });
  }

  const { competition = 'WC', status, date, season = '2026' } = req.query;

  let path = `/competitions/${competition}/matches?season=${season}`;
  if (status) path += `&status=${status}`;
  if (date) path += `&dateFrom=${date}&dateTo=${date}`;

  try {
    const resp = await fetch(`${BASE_URL}${path}`, {
      headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY }
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
