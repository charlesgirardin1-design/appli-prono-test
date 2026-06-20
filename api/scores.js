export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { status } = req.query;
  const apiKey = process.env.FOOTBALL_DATA_API_KEY || 'e17c642125d94af9bf0b31676463b862';

  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const qs = params.toString() ? `?${params}` : '';

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/WC/matches${qs}`,
      { headers: { 'X-Auth-Token': apiKey } }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
