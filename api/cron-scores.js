// Vercel Cron — 23h30 UTC et 03h30 UTC
// Récupère les scores CdM depuis football-data.org → Firestore

const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_API_KEY;
const FIRESTORE_PROJECT = process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const FIRESTORE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

function normalizeStatus(status) {
  if (['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(status)) return 'live';
  if (status === 'FINISHED') return 'finished';
  return 'upcoming';
}

async function saveToFirestore(scores) {
  if (!FIRESTORE_PROJECT || !FIRESTORE_API_KEY) {
    console.log('[Cron] Firestore env vars manquants');
    return;
  }
  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/live_scores/latest?key=${FIRESTORE_API_KEY}`;
  const fields = {};
  for (const [key, score] of Object.entries(scores)) {
    fields[key] = {
      mapValue: {
        fields: {
          homeScore: { integerValue: String(score.homeScore ?? 0) },
          awayScore: { integerValue: String(score.awayScore ?? 0) },
          status: { stringValue: score.status },
        },
      },
    };
  }
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  console.log('[Cron] Firestore PATCH:', resp.status);
}

export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!FOOTBALL_DATA_KEY) {
    return res.status(500).json({ error: 'FOOTBALL_DATA_API_KEY not configured' });
  }

  const today = new Date().toISOString().slice(0, 10);

  const paths = [
    `/competitions/WC/matches?season=2026&dateFrom=${today}&dateTo=${today}`,
    '/competitions/WC/matches?season=2026&status=IN_PLAY',
    '/competitions/WC/matches?season=2026&status=PAUSED',
  ];

  const allMatches = [];
  for (const path of paths) {
    try {
      const resp = await fetch(`${BASE_URL}${path}`, {
        headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY }
      });
      console.log(`[Cron] ${path} → HTTP ${resp.status}`);
      if (resp.status === 200) {
        const data = await resp.json();
        allMatches.push(...(data.matches || []));
      }
    } catch (e) {
      console.error('[Cron] Erreur:', e.message);
    }
  }

  // Déduplique par id
  const seen = new Set();
  const unique = allMatches.filter(m => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  const scores = {};
  for (const m of unique) {
    const home = m.homeTeam?.name || '';
    const away = m.awayTeam?.name || '';
    if (!home || !away) continue;
    const key = `${home}__${away}`;
    scores[key] = {
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
      status: normalizeStatus(m.status),
    };
  }

  await saveToFirestore(scores);
  console.log(`[Cron] ${Object.keys(scores).length} matchs traités`);
  res.status(200).json({ updated: Object.keys(scores).length, matches: scores });
}
