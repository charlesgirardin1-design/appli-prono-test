import { db } from './storage';
import { Match } from '../types';

// Mapping English API names → French names used in the app
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
  'Saudi Arabia': 'Arabie saoudite',
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
  'Turkey': 'Turquie',
  'Türkiye': 'Turquie',
  // Group L
  'New Zealand': 'Nouvelle-Zélande',
  'Indonesia': 'Indonésie',
  'Qatar': 'Qatar',
  'Panama': 'Panama',
  // Additional common names
  'Russia': 'Russie',
  'Serbia': 'Serbie',
  'Slovakia': 'Slovaquie',
  'Czech Republic': 'République tchèque',
  'Czechia': 'République tchèque',
  'Wales': 'Pays de Galles',
  'Scotland': 'Écosse',
  'Ireland': 'Irlande',
  'Ghana': 'Ghana',
  'Tunisia': 'Tunisie',
  'Mali': 'Mali',
  'Honduras': 'Honduras',
  'Guatemala': 'Guatemala',
  'Jamaica': 'Jamaïque',
  'Trinidad and Tobago': 'Trinité-et-Tobago',
  'El Salvador': 'Salvador',
  'Curaçao': 'Curaçao',
  'China': 'Chine',
  "China PR": 'Chine',
  'Thailand': 'Thaïlande',
  'Vietnam': 'Viêt Nam',
  'Iraq': 'Irak',
  'Uzbekistan': 'Ouzbékistan',
  'Syria': 'Syrie',
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
  const url = statusFilter
    ? `https://api.football-data.org/v4/competitions/WC/matches?status=${statusFilter}`
    : 'https://api.football-data.org/v4/competitions/WC/matches';

  const response = await fetch(url, {
    headers: { 'X-Auth-Token': apiKey },
  });

  if (!response.ok) {
    throw new Error(`football-data.org API error: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();
  return data.matches || [];
}

export async function fetchAndUpdateScores(apiKey: string): Promise<void> {
  if (!apiKey) return;

  const localMatches: Match[] = db.get<Match>('pf_matches');
  if (!localMatches.length) return;

  // Fetch all matches + live + finished explicitly
  const [allMatches, liveMatches, finishedMatches] = await Promise.all([
    fetchMatches(apiKey),
    fetchMatches(apiKey, 'IN_PLAY,PAUSED'),
    fetchMatches(apiKey, 'FINISHED'),
  ]);

  // Merge: live > finished > all
  const matchesById = new Map<number, ApiMatch>();
  for (const m of allMatches) matchesById.set(m.id, m);
  for (const m of finishedMatches) matchesById.set(m.id, m);
  for (const m of liveMatches) matchesById.set(m.id, m); // override with live data

  const apiMatchList = Array.from(matchesById.values());

  let updated = false;
  const updatedMatches = localMatches.map(local => {
    const found = apiMatchList.find(api =>
      findMatchingLocalMatch(api.homeTeam.name, api.awayTeam.name, [local]) !== undefined
    );

    if (!found) return local;

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
