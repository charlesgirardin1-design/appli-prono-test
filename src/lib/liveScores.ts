import { db } from './storage';
import { Match } from '../types';

// Mapping English API names → French names used in the app (must match seed data exactly)
const TEAM_NAME_MAP: Record<string, string> = {
  'United States': 'États-Unis', 'USA': 'États-Unis',
  'Mexico': 'Mexique', 'Canada': 'Canada',
  'Argentina': 'Argentine', 'Australia': 'Australie',
  'Brazil': 'Brésil', 'Colombia': 'Colombie',
  'Uruguay': 'Uruguay', 'Paraguay': 'Paraguay',
  'France': 'France', 'England': 'Angleterre',
  'Germany': 'Allemagne', 'Portugal': 'Portugal',
  'Spain': 'Espagne', 'Italy': 'Italie',
  'Netherlands': 'Pays-Bas', 'Holland': 'Pays-Bas',
  'Croatia': 'Croatie', 'Morocco': 'Maroc',
  'Senegal': 'Sénégal', 'South Africa': 'Afrique du Sud',
  'Japan': 'Japon', 'South Korea': 'Corée du Sud',
  'Korea Republic': 'Corée du Sud', 'Saudi Arabia': 'Arabie Saoudite',
  'Iran': 'Iran', 'Belgium': 'Belgique',
  'Denmark': 'Danemark', 'Austria': 'Autriche',
  'Switzerland': 'Suisse', 'Ecuador': 'Équateur',
  'Egypt': 'Égypte', 'Nigeria': 'Nigéria',
  'Algeria': 'Algérie', "Ivory Coast": "Côte d'Ivoire",
  "Côte d'Ivoire": "Côte d'Ivoire", "Cote d'Ivoire": "Côte d'Ivoire",
  'Poland': 'Pologne', 'Ukraine': 'Ukraine',
  'Romania': 'Roumanie', 'Turkey': 'Türkiye', 'Türkiye': 'Türkiye',
  'New Zealand': 'Nouvelle-Zélande', 'Qatar': 'Qatar', 'Panama': 'Panama',
  'Czech Republic': 'Tchéquie', 'Czechia': 'Tchéquie',
  'Bosnia and Herzegovina': 'Bosnie-Herzégovine',
  'Bosnia & Herzegovina': 'Bosnie-Herzégovine',
  'Scotland': 'Écosse', 'Ghana': 'Ghana', 'Tunisia': 'Tunisie',
  'Curaçao': 'Curaçao', 'Cape Verde': 'Cabo Verde', 'Cabo Verde': 'Cabo Verde',
  'Iraq': 'Irak', 'Uzbekistan': 'Ouzbékistan', 'Jordan': 'Jordanie',
  'Congo DR': 'Congo DR', 'DR Congo': 'Congo DR',
  'Democratic Republic of Congo': 'Congo DR',
  'Norway': 'Norvège', 'Sweden': 'Suède', 'Haiti': 'Haïti',
  'Indonesia': 'Indonésie',
};

type ApiStatus = 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'TIMED' | 'SCHEDULED' | string;

interface ApiMatch {
  id: number;
  utcDate: string;
  status: ApiStatus;
  homeTeam: { name: string; shortName?: string };
  awayTeam: { name: string; shortName?: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
}

function mapStatus(apiStatus: ApiStatus): Match['status'] {
  if (apiStatus === 'IN_PLAY' || apiStatus === 'PAUSED') return 'live';
  if (apiStatus === 'FINISHED') return 'finished';
  return 'upcoming';
}

function toFrenchName(englishName: string): string {
  if (TEAM_NAME_MAP[englishName]) return TEAM_NAME_MAP[englishName];
  const lower = englishName.toLowerCase();
  for (const [key, val] of Object.entries(TEAM_NAME_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }
  return englishName;
}

function normalizeForComparison(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function findMatchingLocalMatch(apiHome: string, apiAway: string, localMatches: Match[]): Match | undefined {
  const frHome = toFrenchName(apiHome);
  const frAway = toFrenchName(apiAway);
  const normHome = normalizeForComparison(frHome);
  const normAway = normalizeForComparison(frAway);
  return localMatches.find(m =>
    normalizeForComparison(m.homeTeam.name) === normHome &&
    normalizeForComparison(m.awayTeam.name) === normAway
  );
}

// Scores du cron Vercel depuis Firestore (clés en anglais : "Brazil__Japan")
async function fetchCronScores(): Promise<Record<string, { homeScore: number; awayScore: number; status: string }>> {
  try {
    const resp = await fetch('/api/match-scores');
    if (!resp.ok) return {};
    const data = await resp.json();
    return data.scores || {};
  } catch {
    return {};
  }
}

// Appel direct football-data.org via proxy /api/scores
async function fetchApiMatches(params: Record<string, string>): Promise<ApiMatch[]> {
  const qs = new URLSearchParams(params).toString();
  try {
    const resp = await fetch(`/api/scores?${qs}`);
    if (!resp.ok) { console.warn('[LiveScores] API HTTP', resp.status, qs); return []; }
    const data = await resp.json();
    const matches: ApiMatch[] = data.matches || [];
    console.log('[LiveScores]', qs, '→', matches.length, 'matchs');
    return matches;
  } catch (e) {
    console.error('[LiveScores] Fetch error', qs, e);
    return [];
  }
}

export async function fetchAndUpdateScores(_apiKey?: string): Promise<void> {
  const localMatches: Match[] = db.get<Match>('pf_matches');
  if (!localMatches.length) return;

  // 1. Scores du cron Firestore (clés anglaises → convertir en français)
  const cronScores = await fetchCronScores();
  if (Object.keys(cronScores).length > 0) {
    const frenchKeyedScores: Record<string, typeof cronScores[string]> = {};
    for (const [key, score] of Object.entries(cronScores)) {
      const [home, away] = key.split('__');
      const frKey = `${toFrenchName(home)}__${toFrenchName(away)}`;
      frenchKeyedScores[frKey] = score;
    }
    let updated = false;
    const updatedMatches = localMatches.map(local => {
      const key = `${local.homeTeam.name}__${local.awayTeam.name}`;
      const score = frenchKeyedScores[key];
      if (!score || score.homeScore == null) return local;
      const newStatus = score.status as Match['status'];
      if (local.status === newStatus && local.homeScore === score.homeScore && local.awayScore === score.awayScore) return local;
      updated = true;
      return { ...local, status: newStatus, homeScore: score.homeScore, awayScore: score.awayScore };
    });
    if (updated) {
      db.set('pf_matches', updatedMatches);
      window.dispatchEvent(new Event('pf_matches_updated'));
    }
  }

  // 2. Appel direct API football-data.org
  const today = new Date().toISOString().slice(0, 10);
  const [todayMatches, liveMatches, pausedMatches] = await Promise.all([
    fetchApiMatches({ competition: 'WC', date: today, season: '2026' }),
    fetchApiMatches({ competition: 'WC', status: 'IN_PLAY', season: '2026' }),
    fetchApiMatches({ competition: 'WC', status: 'PAUSED', season: '2026' }),
  ]);

  const matchesById = new Map<number, ApiMatch>();
  for (const m of [...todayMatches, ...liveMatches, ...pausedMatches]) {
    matchesById.set(m.id, m);
  }
  const apiMatchList = Array.from(matchesById.values());

  if (apiMatchList.length === 0) return;

  let updated = false;
  const updatedMatches = localMatches.map(local => {
    const found = apiMatchList.find(api =>
      findMatchingLocalMatch(api.homeTeam.name, api.awayTeam.name, [local]) !== undefined
    );
    if (!found) return local;

    const newStatus = mapStatus(found.status);
    const isActive = newStatus === 'live' || newStatus === 'finished';
    const newHomeScore = found.score.fullTime.home !== null ? (found.score.fullTime.home ?? undefined) : (isActive ? 0 : undefined);
    const newAwayScore = found.score.fullTime.away !== null ? (found.score.fullTime.away ?? undefined) : (isActive ? 0 : undefined);

    if (local.status === newStatus && local.homeScore === newHomeScore && local.awayScore === newAwayScore) return local;

    updated = true;
    return { ...local, status: newStatus, homeScore: newHomeScore, awayScore: newAwayScore };
  });

  if (updated) {
    db.set('pf_matches', updatedMatches);
    window.dispatchEvent(new Event('pf_matches_updated'));
  }
}

function hasLiveOrImminent(): boolean {
  const matches: Match[] = db.get<Match>('pf_matches');
  const now = Date.now();
  return matches.some(m => {
    const t = new Date(m.date).getTime();
    return now >= t - 30 * 60 * 1000 && now <= t + 3 * 60 * 60 * 1000;
  });
}

function msUntilNext(hour: number, minute = 0): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function dailyRefresh(_apiKey?: string): void {
  const matches: Match[] = db.get<Match>('pf_matches');
  const now = Date.now();
  let changed = false;
  const updated = matches.map(m => {
    if (m.status === 'upcoming') {
      const end = new Date(m.date).getTime() + 3 * 60 * 60 * 1000;
      if (now > end) { changed = true; return { ...m, status: 'finished' as const }; }
    }
    return m;
  });
  if (changed) {
    db.set('pf_matches', updated);
    window.dispatchEvent(new Event('pf_matches_updated'));
  }
  fetchAndUpdateScores().catch(console.error);
}

export function startLiveScorePolling(_apiKey?: string): () => void {
  const LIVE_INTERVAL = 10 * 60 * 1000;

  function poll() {
    if (hasLiveOrImminent()) fetchAndUpdateScores().catch(console.error);
  }

  const intervalId = setInterval(poll, LIVE_INTERVAL);

  let t1: ReturnType<typeof setTimeout>;
  let t2: ReturnType<typeof setTimeout>;
  let t3: ReturnType<typeof setTimeout>;

  function scheduleMidnight() { t1 = setTimeout(() => { dailyRefresh(); scheduleMidnight(); }, msUntilNext(0)); }
  function scheduleNoon()     { t2 = setTimeout(() => { dailyRefresh(); scheduleNoon(); }, msUntilNext(12)); }
  function scheduleEvening()  { t3 = setTimeout(() => { dailyRefresh(); scheduleEvening(); }, msUntilNext(23, 5)); }

  scheduleMidnight(); scheduleNoon(); scheduleEvening();

  return () => {
    clearInterval(intervalId);
    clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
  };
}
