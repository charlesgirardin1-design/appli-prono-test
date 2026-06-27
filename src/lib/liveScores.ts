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
  // Additional — must match seed data names exactly
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

interface ApiResponse {
  matches: ApiMatch[];
}

function mapStatus(apiStatus: ApiStatus): Match['status'] {
  if (apiStatus === 'IN_PLAY' || apiStatus === 'PAUSED') return 'live';
  if (apiStatus === 'FINISHED') return 'finished';
  return 'upcoming';
}

function toFrenchName(englishName: string): string {
  // Direct mapping
  if (TEAM_NAME_MAP[englishName]) return TEAM_NAME_MAP[englishName];
  // Try case-insensitive match against map keys
  const lower = englishName.toLowerCase();
  for (const [key, val] of Object.entries(TEAM_NAME_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }
  // Fallback: return as-is (some names may be the same in French)
  return englishName;
}

function normalizeForComparison(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, ''); // keep only alphanumeric
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

async function fetchMatches(_apiKey: string, statusFilter?: string): Promise<ApiMatch[]> {
  // Use our serverless proxy to avoid CORS issues
  const params = new URLSearchParams();
  if (statusFilter) params.set('status', statusFilter);
  const qs = params.toString() ? `?${params}` : '';
  const url = `/api/scores${qs}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      console.warn('[LiveScores] Proxy HTTP', resp.status, url);
      return [];
    }
    const data: ApiResponse = await resp.json();
    const matches = data.matches || [];
    console.log('[LiveScores] Fetched', matches.length, 'matches via proxy', statusFilter || '(all)');
    return matches;
  } catch (e) {
    console.error('[LiveScores] Fetch error:', e);
    return [];
  }
}

export async function fetchAndUpdateScores(apiKey: string): Promise<void> {
  if (!apiKey) return;

  const localMatches: Match[] = db.get<Match>('pf_matches');
  if (!localMatches.length) return;

  // Fetch all matches first (contains live + finished + upcoming with current scores)
  // Then fetch live separately to get the freshest data (avoid rate limiting with sequential calls)
  const allMatches = await fetchMatches(apiKey);
  let liveMatches: ApiMatch[] = [];
  let finishedMatches: ApiMatch[] = [];
  try {
    liveMatches = await fetchMatches(apiKey, 'LIVE');
  } catch (e) {
    console.warn('[LiveScores] Could not fetch live matches separately:', e);
  }
  try {
    finishedMatches = await fetchMatches(apiKey, 'FINISHED');
  } catch (e) {
    console.warn('[LiveScores] Could not fetch finished matches separately:', e);
  }

  // Merge: live > finished > all
  const matchesById = new Map<number, ApiMatch>();
  for (const m of allMatches) matchesById.set(m.id, m);
  for (const m of finishedMatches) matchesById.set(m.id, m);
  for (const m of liveMatches) matchesById.set(m.id, m); // override with live data

  const apiMatchList = Array.from(matchesById.values());
  const liveFromApi = apiMatchList.filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED');
  console.log('[LiveScores] API returned', apiMatchList.length, 'matches,', liveFromApi.length, 'live');
  if (liveFromApi.length > 0) {
    console.log('[LiveScores] Live matches:', liveFromApi.map(m => `${m.homeTeam.name} ${m.score.fullTime.home ?? '?'}-${m.score.fullTime.away ?? '?'} ${m.awayTeam.name}`));
  }
  console.log('[LiveScores] Sample API names:', apiMatchList.slice(0, 5).map(m => `${m.homeTeam.name} vs ${m.awayTeam.name} (${m.status})`));

  let updated = false;
  const updatedMatches = localMatches.map(local => {
    const found = apiMatchList.find(api =>
      findMatchingLocalMatch(api.homeTeam.name, api.awayTeam.name, [local]) !== undefined
    );

    if (!found) {
      if (local.status === 'finished' || local.status === 'live') {
        console.warn('[LiveScores] No API match for:', local.homeTeam.name, 'vs', local.awayTeam.name);
      }
      return local;
    }

    const newStatus = mapStatus(found.status);
    // For live matches, null score means 0-0
    const isLiveOrFinished = newStatus === 'live' || newStatus === 'finished';
    const newHomeScore = found.score.fullTime.home !== null ? (found.score.fullTime.home ?? undefined) : (isLiveOrFinished ? 0 : undefined);
    const newAwayScore = found.score.fullTime.away !== null ? (found.score.fullTime.away ?? undefined) : (isLiveOrFinished ? 0 : undefined);

    // Only update if something changed
    if (
      local.status === newStatus &&
      local.homeScore === newHomeScore &&
      local.awayScore === newAwayScore
    ) {
      return local;
    }

    updated = true;
    return {
      ...local,
      status: newStatus,
      homeScore: newHomeScore,
      awayScore: newAwayScore,
    };
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
    // Match en cours ou qui commence dans les 30 prochaines minutes
    return now >= t - 30 * 60 * 1000 && now <= t + 3 * 60 * 60 * 1000;
  });
}

function msUntilNext(hour: number): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

export function dailyRefresh(apiKey: string): void {
  // Mark past matches as finished then fetch updated scores
  const matches: Match[] = db.get<Match>('pf_matches');
  const now = Date.now();
  let changed = false;
  const updated = matches.map(m => {
    if (m.status === 'upcoming') {
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
  const LIVE_INTERVAL = 10 * 60 * 1000; // 10 min pendant les matchs

  function poll() {
    if (hasLiveOrImminent()) {
      console.log('[LiveScores] Match en cours — polling 10 min');
      fetchAndUpdateScores(apiKey).catch(console.error);
    }
  }

  // Au démarrage : mise à jour complète immédiate
  dailyRefresh(apiKey);

  const intervalId = setInterval(poll, LIVE_INTERVAL);

  // Refresh à minuit et à midi
  let midnightTimeout: ReturnType<typeof setTimeout>;
  let noonTimeout: ReturnType<typeof setTimeout>;

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

  scheduleMidnight();
  scheduleNoon();

  return () => {
    clearInterval(intervalId);
    clearTimeout(midnightTimeout);
    clearTimeout(noonTimeout);
  };
}
