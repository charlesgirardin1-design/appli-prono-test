// Retourne les scores mis à jour par le cron depuis Firestore

const FIRESTORE_PROJECT = process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const FIRESTORE_API_KEY = process.env.REACT_APP_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  if (!FIRESTORE_PROJECT || !FIRESTORE_API_KEY) {
    return res.status(200).json({ scores: {} });
  }

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/live_scores/latest?key=${FIRESTORE_API_KEY}`;
    const resp = await fetch(url);
    if (!resp.ok) return res.status(200).json({ scores: {} });
    const doc = await resp.json();
    const fields = doc.fields || {};

    const scores = {};
    for (const [key, val] of Object.entries(fields)) {
      const map = val.mapValue?.fields || {};
      scores[key] = {
        homeScore: parseInt(map.homeScore?.integerValue ?? '-1'),
        awayScore: parseInt(map.awayScore?.integerValue ?? '-1'),
        status: map.status?.stringValue || 'upcoming',
      };
    }
    res.status(200).json({ scores });
  } catch (e) {
    res.status(200).json({ scores: {} });
  }
}
