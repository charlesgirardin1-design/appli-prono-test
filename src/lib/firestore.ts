import { db } from './storage';
import { Match, Prono, Group, LeaderboardEntry, Favoris } from '../types';
import { getCurrentUser, getUserById } from './auth';
import { getPseudo } from './settings';

const pid = () => getCurrentUser()?.uid || 'anonymous';
const pseudo = () => getCurrentUser()?.displayName || getPseudo();

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

// ---- CALCUL DES POINTS ----
// Bonne tendance : cote x 10 pts
// Score exact : cote x 10 pts + bonus classement foot (victoire = 3, nul = 1)
function calcOddsPoints(
  realHome: number, realAway: number,
  odds?: { home: number; draw: number; away: number }
): number {
  if (!odds) return 10;
  const realTrend = Math.sign(realHome - realAway);
  if (realTrend > 0) return Math.round(odds.home * 10);
  if (realTrend === 0) return Math.round(odds.draw * 10);
  return Math.round(odds.away * 10);
}

function calcExactBonus(
  realHome: number, realAway: number,
  pronoHome: number, pronoAway: number
): number {
  if (Number(pronoHome) !== realHome || Number(pronoAway) !== realAway) return 0;
  return Math.sign(realHome - realAway) === 0 ? 1 : 3;
}

function computePoints(matchId: string, realHome: number, realAway: number, odds?: Match['odds']): void {
  const all = db.get<Prono>('pf_pronos');
  const updated = all.map(p => {
    if (p.matchId !== matchId) return p;
    const pronoTrend = Math.sign(Number(p.homeScore) - Number(p.awayScore));
    const realTrend = Math.sign(realHome - realAway);
    if (pronoTrend !== realTrend) {
      return { ...p, points: 0, bonusExact: 0, totalPoints: 0 };
    }
    const oddsPoints = calcOddsPoints(realHome, realAway, odds);
    const bonusExact = calcExactBonus(realHome, realAway, p.homeScore, p.awayScore);
    const subtotal = oddsPoints + bonusExact;
    const totalPoints = p.joker ? subtotal * 2 : subtotal;
    return { ...p, points: oddsPoints, bonusExact, totalPoints };
  });
  db.set('pf_pronos', updated);
}

// Recalcule les points pour tous les matchs terminés (appelé au re-seed)
export function recomputeAllPoints(): void {
  const matches = db.get<Match>('pf_matches');
  for (const m of matches) {
    if (m.status === 'finished' && m.homeScore !== undefined && m.awayScore !== undefined) {
      computePoints(m.id, m.homeScore, m.awayScore, m.odds);
    }
  }
}

// ---- GROUPS ----
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

  const found = all.find(g => g.code.toUpperCase() === code.toUpperCase());
  if (found) {
    if (!found.members.includes(me)) {
      const updated = { ...found, members: [...found.members, me] };
      db.upsert('pf_groups', updated);
      return Promise.resolve(updated);
    }
    return Promise.resolve(found);
  }

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
        displayName: p.userId === pid() ? pseudo() : (getUserById(p.userId)?.displayName || p.userId),
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
