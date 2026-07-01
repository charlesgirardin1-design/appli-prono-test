import { db } from './storage';
import { Match } from '../types';

// Mapping English API names → French names used in the app (must match seed data exactly)
const TEAM_NAME_MAP: Record<string, string> = {
  // Group A
  'United States': 'États-Unis',
  'USA': 'États-Unis',
  'Mexico': 'Mexique',
  'Canada': 'Canada',
  // Group B
  'Argentina': 'Argentine',
  'Chile': 'Chili',
  'Peru': 'Pérou',
  'Australia': 'Australie',
  // Group C
  'Brazil': 'Brésil',
  'Colombia': 'Colombie',
  'Uruguay': 'Uruguay',
  'Paraguay': 'Paraguay',
  // Group D
  'France': 'France',
  'England': 'Angleterre',
  'Germany': 'Allemagne',
  'Portugal': 'Portugal',
  // Group E
  'Spain': 'Espagne',
  'Italy': 'Italie',
  'Netherlands': 'Pays-Bas',
  'Holland': 'Pays-Bas',
  'Croatia': 'Croatie',
  // Group F
  'Morocco': 'Maroc',
  'Senegal': 'Sénégal',
  'South Africa': 'Afrique du Sud',
  'Cameroon': 'Cameroun',
  // Group G
  'Japan': 'Japon',
  'South Korea': 'Corée du Sud',
  'Korea Republic': 'Corée du Sud',
  'Saudi Arabia': 'Arabie Saoudite',
  'Iran': 'Iran',
  // Group H
  'Belgium': 'Belgique',
  'Denmark': 'Danemark',
  'Austria': 'Autriche',
  'Switzerland': 'Suisse',
  // Group I
  'Ecuador': 'Équateur',
  'Venezuela': 'Venezuela',
  'Bolivia': 'Bolivie',
  'Costa Rica': 'Costa Rica',
  // Group J
  'Egypt': 'Égypte',
  'Nigeria': 'Nigéria',
  'Algeria': 'Algérie',
  'Ivory Coast': "Côte d'Ivoire",
  "Côte d'Ivoire": "Côte d'Ivoire",
  // Group K
  'Poland': 'Pologne',
  'Ukraine': 'Ukraine',
  'Romania': 'Roumanie',
  'Turkey': 'Türkiye',
  'Türkiye': 'Türkiye',
  // Group L
  'New Zealand': 'Nouvelle-Zélande',
  'Indonesia': 'Indonésie',
  'Qatar': 'Qatar',
  'Panama': 'Panama',
  // Additional
  'Czech Republic': 'Tchéquie',
  'Czechia': 'Tchéquie',
  'Bosnia and Herzegovina': 'Bosnie-Herzégovine',
  'Bosnia & Herzegovina': 'Bosnie-Herzégovine',
  'Scotland': 'Écosse',
  'Ghana': 'Ghana',
  'Tunisia': 'Tunisie',
  'Curaçao': 'Curaçao',
  'Cabo Verde': 'Cabo Verde',
  'Cape Verde': 'Cabo Verde',
  'Iraq': 'Irak',
  'Uzbekistan': 'Ouzbékistan',
  'Jordan': 'Jordanie',
  'Congo DR': 'Congo DR',
  'DR Congo': 'Congo DR',
  'Democratic Republic of Congo': 'Congo DR',
  'Norway': 'Norvège',
  'Sweden': 'Suède',
  'Haiti': 'Haïti',
};

type ApiStatus = 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'TIMED' | 'SCHEDULED' | string;

interface ApiTeam {
  name: string;
  shortName: string;
}

interface ApiScore {
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

interface ApiMatch {
  id: number;
  utcDate: string;
  status: ApiStatus;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: ApiScore;
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

function findMatchingLocalMatch(
  apiHome: string,
  apiAway: string,
  localMatches: Match[]
): Match | undefined {
  const frHome = toFrenchName(apiHome);
  const frAway = toFrenchName(apiAway);
  const normHome = normalizeForComparison(frHome);
  const normAway = normalizeForComparison(frAway);
  return localMatches.find(m => {
    const mHome = normalizeForComparison(m.homeTeam.name);
    const mAway = normalizeForComparison(m.awayTeam.name);
    return mHome === normHome && mAway === normAway;
  });
}

async function fetchEndpoint(endpoint: string): Promise<ApiMatch[]> {
  const url = '/api/scores?endpoint=' + endpoint;
  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn('[LiveScores] Proxy HTTP', resp.status, endpoint);
      return [];
    }
    const data = await resp.json();
    const matches: any[] = data.matches || data.events || data.data || [];
    console.log('[LiveScores]', endpoint, '→', matches.length, 'matchs');
    return matches;
  } catch (e) {
    console.error('[LiveScores] Fetch error', endpoint, e);
    return [];
  }
}

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

export async function fetchAndUpdateScores(apiKey: string): Promise<void> {
  if (!apiKey) return;

  const localMatches: Match[] = db.get<Match>('pf_matches');
  if (!localMatches.length) return;

  // 1. Try Firestore cron scores first
  const cronScores = await fetchCronScores();
  if (Object.keys(cronScores).length > 0) {
    console.log('[LiveScores] Scores cron Firestore:', Object.keys(cronScores).length, 'matchs');
    let updated = false;
    const updatedMatches = localMatches.map(local => {
      const key = `${local.homeTeam.name}__${local.awayTeam.name}`;
      const score = cronScores[key];
      if (!score || score.homeScore < 0) return local;
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

  // 2. Direct API fallback — changed: worldcup → paused to fetch PAUSED matches
  const todayMatches = await fetchEndpoint('today');
  const pausedMatches = await fetchEndpoint('paused');
  const liveMatches = await fetchEndpoint('live');

  const matchesById = new Map<number, ApiMatch>();
  for (const m of pausedMatches) matchesById.set(m.id, m);
  for (const m of todayMatches) matchesById.set(m.id, m);
  for (const m of liveMatches) matchesById.set(m.id, m);

  const apiMatchList = Array.from(matchesById.values());
  const liveFromApi = apiMatchList.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  console.log('[LiveScores] API returned', apiMatchList.length, 'matches,', liveFromApi.length, 'live');

  let updated = false;
  const updatedMatches = localMatches.map(local => {
    const found = apiMatchList.find(api =>
      findMatchingLocalMatch(api.homeTeam.name, api.awayTeam.name, [local]) !== undefined
    );

    if (!found) return local;

    const newStatus = mapStatus(found.status);
    const isLiveOrFinished = newStatus === 'live' || newStatus === 'finished';
    const newHomeScore = found.score.fullTime.home !== null
      ? (found.score.fullTime.home ?? undefined)
      : (isLiveOrFinished ? 0 : undefined);
    const newAwayScore = found.score.fullTime.away !== null
      ? (found.score.fullTime.away ?? undefined)
      : (isLiveOrFinished ? 0 : undefined);

    if (
      local.status === newStatus &&
      local.homeScore === newHomeScore &&
      local.awayScore === newAwayScore
    ) return local;

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

function msUntilNext(hour: number, minute: number = 0): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function dailyRefresh(apiKey: string): void {
  // Mark past matches as finished (both 'upcoming' AND 'live' that have timed out)
  const matches: Match[] = db.get<Match>('pf_matches');
  const now = Date.now();
  let changed = false;
  const updated = matches.map(m => {
    if (m.status === 'upcoming' || m.status === 'live') {
      const end = new Date(m.date).getTime() + 3 * 60 * 60 * 1000;
      if (now > end) {
        changed = true;
        return { ...m, status: 'finished' as const };
      }
    }
    return m;
  });
  if (changed) {
    db.set('pf_matches', updated);
    window.dispatchEvent(new Event('pf_matches_updated'));
    console.log('[LiveScores] Refresh — matchs passés marqués terminés');
  }
  fetchAndUpdateScores(apiKey).catch(console.error);
}

export function startLiveScorePolling(apiKey: string): () => void {
  // Adaptive polling: 60s during live matches, 10min when idle
  let pollTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleNext() {
    const delay = hasLiveOrImminent() ? 60_000 : 10 * 60_000;
    pollTimer = setTimeout(async () => {
      await fetchAndUpdateScores(apiKey).catch(console.error);
      scheduleNext();
    }, delay);
  }

  // Fetch immediately if there's a live/imminent match
  if (hasLiveOrImminent()) {
    fetchAndUpdateScores(apiKey).catch(console.error);
  }
  scheduleNext();

  // Daily refreshes at midnight, noon, 23h05
  let midnightTimeout: ReturnType<typeof setTimeout>;
  let noonTimeout: ReturnType<typeof setTimeout>;
  let eveningTimeout: ReturnType<typeof setTimeout>;

  function scheduleMidnight() {
    midnightTimeout = setTimeout(() => {
      console.log('[LiveScores] Refresh minuit');
      dailyRefresh(apiKey);
      scheduleMidnight();
    }, msUntilNext(0));
  }

  function scheduleNoon() {
    noonTimeout = setTimeout(() => {
      console.log('[LiveScores] Refresh midi');
      dailyRefresh(apiKey);
      scheduleNoon();
    }, msUntilNext(12));
  }

  function scheduleEvening() {
    eveningTimeout = setTimeout(() => {
      console.log('[LiveScores] Refresh 23h05');
      dailyRefresh(apiKey);
      scheduleEvening();
    }, msUntilNext(23, 5));
  }

  scheduleMidnight();
  scheduleNoon();
  scheduleEvening();

  return () => {
    if (pollTimer) clearTimeout(pollTimer);
    clearTimeout(midnightTimeout);
    clearTimeout(noonTimeout);
    clearTimeout(eveningTimeout);
  };
}
