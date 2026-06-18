// Couche données — localStorage (sans authentification)
import { db } from './storage';
import { Match, Prono, Group, LeaderboardEntry, Favoris } from '../types';
import { getPlayerId, getPseudo } from './settings';

const pid = () => getPlayerId();
const pseudo = () => getPseudo();

// ---- MATCHES ----
export function getMatches(): Promise<Match[]> {
  const matches = db.get<Match>('pf_matches');
  return Promise.resolve(matches.sort((a, b) => a.date.localeCompare(b.date)));
}

export function addMatch(match: Omit<Match, 'id'>): Promise<string> {
  const id = db.newId();
  db.upsert('pf_matches', { ...match, id });
  return Promise.resolve(id);
}

export function updateMatchScore(matchId: string, homeScore: number, awayScore: number): Promise<void> {
  const match = db.getOne<Match>('pf_matches', matchId);
  if (!match) return Promise.resolve();
  db.upsert('pf_matches', { ...match, homeScore, awayScore, status: 'finished' as const });
  computePoints(matchId, homeScore, awayScore, match.odds);
  return Promise.resolve();
}

// ---- PRONOS ----
export function getPronos(): Promise<Prono[]> {
  const all = db.get<Prono>('pf_pronos');
  return Promise.resolve(all.filter(p => p.userId === pid()));
}

export function getPronoForMatch(matchId: string): Promise<Prono | null> {
  const all = db.get<Prono>('pf_pronos');
  return Promise.resolve(all.find(p => p.userId === pid() && p.matchId === matchId) || null);
}

export function hasJokerAvailable(): Promise<boolean> {
  const all = db.get<Prono>('pf_pronos');
  return Promise.resolve(!all.some(p => p.userId === pid() && p.joker));
}

export async function saveProno(
  matchId: string, homeScore: number, awayScore: number, joker: boolean
): Promise<void> {
  const all = db.get<Prono>('pf_pronos');
  const me = pid();

  if (joker) {
    const updated = all.map(p =>
      p.userId === me && p.joker && p.matchId !== matchId ? { ...p, joker: false } : p
    );
    db.set('pf_pronos', updated);
  }

  const existing = await getPronoForMatch(matchId);
  if (existing) {
    db.upsert('pf_pronos', { ...existing, homeScore, awayScore, joker });
  } else {
    db.upsert('pf_pronos', {
      id: db.newId(), userId: me, matchId, homeScore, awayScore, joker,
      createdAt: new Date().toISOString(),
    });
  }
}

function calcTrendPoints(
  pronoHome: number, pronoAway: number,
  realHome: number, realAway: number,
  odds?: { home: number; draw: number; away: number }
): number {
  const pronoTrend = Math.sign(pronoHome - pronoAway);
  const realTrend = Math.sign(realHome - realAway);
  if (pronoTrend !== realTrend) return 0;
  if (!odds) return 10;
  if (realTrend > 0) return Math.round(odds.home * 10);
  if (realTrend === 0) return Math.round(odds.draw * 10);
  return Math.round(odds.away * 10);
}

function calcExactBonus(rarityRatio: number): number {
  if (rarityRatio >= 0.5) return 20;
  if (rarityRatio >= 0.3) return 30;
  if (rarityRatio >= 0.15) return 50;
  if (rarityRatio >= 0.05) return 75;
  return 100;
}

function computePoints(matchId: string, realHome: number, realAway: number, odds?: Match['odds']): void {
  const all = db.get<Prono>('pf_pronos');
  const matchPronos = all.filter(p => p.matchId === matchId);
  const exactCount = matchPronos.filter(p => p.homeScore === realHome && p.awayScore === realAway).length;
  const rarityRatio = matchPronos.length > 0 ? exactCount / matchPronos.length : 0;

  const updated = all.map(p => {
    if (p.matchId !== matchId) return p;
    const trendPoints = calcTrendPoints(p.homeScore, p.awayScore, realHome, realAway, odds);
    const isExact = p.homeScore === realHome && p.awayScore === realAway;
    const bonusExact = isExact ? calcExactBonus(rarityRatio) : 0;
    const subtotal = trendPoints + bonusExact;
    const totalPoints = p.joker ? subtotal * 2 : subtotal;
    return { ...p, points: trendPoints, bonusExact, totalPoints };
  });
  db.set('pf_pronos', updated);
}

// ---- GROUPS ----
// Le code encode les infos du groupe en base64 pour permettre le partage entre appareils
function encodeGroupCode(group: { id: string; name: string }): string {
  try {
    return btoa(JSON.stringify({ id: group.id, name: group.name }))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
      .substring(0, 10).toUpperCase();
  } catch {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

export function createGroup(name: string): Promise<Group> {
  const id = db.newId();
  const code = encodeGroupCode({ id, name });
  const group: Group = {
    id, name, code,
    creatorId: pid(),
    members: [pid()],
    createdAt: new Date().toISOString(),
  };
  db.upsert('pf_groups', group);
  return Promise.resolve(group);
}

export function joinGroup(code: string): Promise<Group | null> {
  const all = db.get<Group>('pf_groups');
  const me = pid();

  // Chercher dans les groupes locaux
  const found = all.find(g => g.code.toUpperCase() === code.toUpperCase());
  if (found) {
    if (!found.members.includes(me)) {
      const updated = { ...found, members: [...found.members, me] };
      db.upsert('pf_groups', updated);
      return Promise.resolve(updated);
    }
    return Promise.resolve(found);
  }

  // Essayer de décoder depuis le code (groupe partagé depuis un autre appareil)
  try {
    const padded = code.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    const data = JSON.parse(json);
    if (data.id && data.name) {
      const group: Group = {
        id: data.id, name: data.name, code: code.toUpperCase(),
        creatorId: 'shared',
        members: [me],
        createdAt: new Date().toISOString(),
      };
      db.upsert('pf_groups', group);
      return Promise.resolve(group);
    }
  } catch {}

  return Promise.resolve(null);
}

export function getUserGroups(): Promise<Group[]> {
  const all = db.get<Group>('pf_groups');
  return Promise.resolve(all.filter(g => g.members.includes(pid())));
}

export function deleteGroup(groupId: string): Promise<void> {
  db.remove('pf_groups', groupId);
  return Promise.resolve();
}

// ---- LEADERBOARD ----
export function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const pronos = db.get<Prono>('pf_pronos');
  const stats: Record<string, LeaderboardEntry> = {};

  for (const p of pronos) {
    if (!stats[p.userId]) {
      stats[p.userId] = {
        userId: p.userId,
        displayName: p.userId === pid() ? pseudo() : p.userId,
        totalPoints: 0, exactScores: 0, correctTrends: 0, pronos: 0,
      };
    }
    if (p.totalPoints !== undefined) {
      stats[p.userId].totalPoints += p.totalPoints;
      stats[p.userId].pronos++;
      if (p.bonusExact && p.bonusExact > 0) stats[p.userId].exactScores++;
      else if (p.points && p.points > 0) stats[p.userId].correctTrends++;
    }
  }
  return Promise.resolve(Object.values(stats).sort((a, b) => b.totalPoints - a.totalPoints));
}

// ---- FAVORIS ----
export function saveFavoris(winner: string, topScorer: string): Promise<void> {
  const me = pid();
  const all = db.get<Favoris & { id: string }>('pf_favoris');
  const existing = all.find(f => f.userId === me);
  if (existing) {
    db.upsert('pf_favoris', { ...existing, winner, topScorer });
  } else {
    db.upsert('pf_favoris', { id: me, userId: me, winner, topScorer });
  }
  return Promise.resolve();
}

export function getFavoris(): Promise<Favoris | null> {
  const all = db.get<Favoris & { id: string }>('pf_favoris');
  return Promise.resolve(all.find(f => f.userId === pid()) || null);
}
