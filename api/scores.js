const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE = 'https://api.football-data.org/v4';

const _cache = {};
function getCached(k) {
  const e = _cache[k];
  return e && Date.now() - e.ts < 45000 ? e.data : null;
}
function setCached(k, d) { _cache[k] = { ts: Date.now(), data: d }; }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = FOOTBALL_DATA_KEY;
  if (!key) return res.status(500).json({ error: 'Missing FOOTBALL_DATA_API_KEY' });

  const today = new Date().toISOString().slice(0, 10);
  const ep = req.query.endpoint || 'live';
  const path = '/competitions/WC/matches';

  const qMap = {
    live:     'season=2026&status=IN_PLAY',
    paused:   'season=2026&status=PAUSED',
    worldcup: 'season=2026&status=PAUSED',
    finished: 'season=2026&status=FINISHED',
    today:    'season=2026&dateFrom=' + today + '&dateTo=' + today,
  };
  const qs = qMap[ep] || qMap.live;
  const url = BASE + path + '?' + qs;

  const hit = getCached(url);
  if (hit) return res.status(200).json(hit);

  try {
    const r = await fetch(url, { headers: { 'X-Auth-Token': key } });
    const data = await r.json();
    if (r.ok) setCached(url, data);
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
