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

async function fetchMatches(apiKey: string, statusFilter?: string): Promise<ApiMatch[]> {
  // Try with season=2026 first, fallback without season if empty
  const params = new URLSearchParams({ season: '2026' });
  if (statusFilter) params.set('status', statusFilter);
  const url = `https://api.football-data.org/v4/competitions/WC/matches?${params}`;

  const response = await fetch(url, {
    headers: { 'X-Auth-Token': apiKey },
  });

  if (!response.ok) {
    console.error('[LiveScores] API error:', response.status, response.statusText, url);
    // Try without season as fallback
    if (response.status === 400 || response.status === 404) {
      const fallbackParams = statusFilter ? `?status=${statusFilter}` : '';
      const fallbackUrl = `https://api.football-data.org/v4/competitions/WC/matches${fallbackParams}`;
      const fallbackResp = await fetch(fallbackUrl, { headers: { 'X-Auth-Token': apiKey } });
      if (!fallbackResp.ok) throw new Error(`API error: ${fallbackResp.status}`);
      const fallbackData: ApiResponse = await fallbackResp.json();
      console.log('[LiveScores] Fallback fetched', (fallbackData.matches || []).length, 'matches');
      return fallbackData.matches || [];
    }
    throw new Error(`football-data.org API error: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();
  console.log('[LiveScores] Fetched', (data.matches || []).length, 'matches from', url);
  return data.matches || [];
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

export function startLiveScorePolling(apiKey: string): () => void {
  if (!apiKey) return () => {};

  // Fetch immediately on start
  fetchAndUpdateScores(apiKey).catch(console.error);

  const intervalId = setInterval(() => {
    fetchAndUpdateScores(apiKey).catch(console.error);
  }, 60_000);

  return () => clearInterval(intervalId);
}
