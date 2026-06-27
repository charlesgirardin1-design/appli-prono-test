// Vercel Cron Job — appelé à minuit, midi et 23h05
// Récupère les scores depuis RapidAPI et les stocke dans Firestore

const RAPIDAPI_HOST = 'free-api-live-football-data.p.rapidapi.com';
const API_KEYS = [
  process.env.RAPIDAPI_KEY_1 || 'd6127f5d75mshc4858b179f6cf52p1c2fcdjsn08180b117e2b',
  process.env.RAPIDAPI_KEY_2 || 'f266a6995amshe3ad47e5948fa7ap17ab2bjsnb808729eb291',
].filter(Boolean);

const FIRESTORE_PROJECT = process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const FIRESTORE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;

async function rapidFetch(path) {
  for (const key of API_KEYS) {
    const resp = await fetch(`https://${RAPIDAPI_HOST}${path}`, {
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    });
    if (resp.status === 429) continue;
    const text = await resp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = {}; }
    return { status: resp.status, data };
  }
  return { status: 429, data: {} };
}

function extractMatches(data) {
  return data.matches || data.events || data.data || [];
}

async function saveToFirestore(scores) {
  if (!FIRESTORE_PROJECT || !FIRESTORE_API_KEY) {
    console.log('[Cron] Firestore env vars manquants — skip save');
    return;
  }

  const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/live_scores/latest?key=${FIRESTORE_API_KEY}`;

  const fields = {};
  for (const [matchKey, score] of Object.entries(scores)) {
    fields[matchKey] = {
      mapValue: {
        fields: {
          homeScore: { integerValue: String(score.homeScore) },
          awayScore: { integerValue: String(score.awayScore) },
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

  console.log('[Cron] Firestore PATCH status:', resp.status);
}

export default async function handler(req, res) {
  // Vérification du token cron Vercel
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date().toISOString().slice(0, 10);
  const endpoints = [
    `/getmatchesbydate?date=${today}`,
    '/getmatchesbycompetition?competition_id=FIFA_WC',
    '/getliveevents',
  ];

  const allMatches = [];
  for (const path of endpoints) {
    try {
      const { status, data } = await rapidFetch(path);
      console.log(`[Cron] ${path} → HTTP ${status}`);
      if (status === 200) {
        allMatches.push(...extractMatches(data));
      }
    } catch (e) {
      console.error('[Cron] Erreur fetch:', path, e.message);
    }
  }

  // Déduplique par (home, away) et structure les scores
  const scores = {};
  for (const m of allMatches) {
    const home = m.homeTeam?.name || m.home_name || '';
    const away = m.awayTeam?.name || m.away_name || '';
    if (!home || !away) continue;
    const key = `${home}__${away}`;
    const homeScore = m.score?.fullTime?.home ?? m.home_score ?? m.goals_home ?? null;
    const awayScore = m.score?.fullTime?.away ?? m.away_score ?? m.goals_away ?? null;
    const rawStatus = m.status || m.match_status || '';
    const status = ['IN_PLAY', 'PAUSED', 'LIVE', '1H', '2H', 'HT'].includes(rawStatus) ? 'live'
      : rawStatus === 'FINISHED' || rawStatus === 'FT' ? 'finished'
      : 'upcoming';
    scores[key] = { homeScore, awayScore, status };
  }

  await saveToFirestore(scores);

  console.log(`[Cron] ${Object.keys(scores).length} matchs traités`);
  res.status(200).json({ updated: Object.keys(scores).length, matches: scores });
}
