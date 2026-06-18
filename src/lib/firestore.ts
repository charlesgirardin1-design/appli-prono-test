// Couche données — localStorage (remplace Firestore)
import { db } from './storage';
import { getAllUsers } from './auth';
import { Match, Prono, Group, LeaderboardEntry, Favoris } from '../types';

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
export function getPronos(userId: string): Promise<Prono[]> {
  const all = db.get<Prono>('pf_pronos');
  return Promise.resolve(all.filter(p => p.userId === userId));
}

export function getPronoForMatch(userId: string, matchId: string): Promise<Prono | null> {
  const all = db.get<Prono>('pf_pronos');
  return Promise.resolve(all.find(p => p.userId === userId && p.matchId === matchId) || null);
}

export function hasJokerAvailable(userId: string): Promise<boolean> {
  const all = db.get<Prono>('pf_pronos');
  return Promise.resolve(!all.some(p => p.userId === userId && p.joker));
}

export async function saveProno(
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number,
  joker: boolean
): Promise<void> {
  const all = db.get<Prono>('pf_pronos');

  // Si joker activé, retirer l'ancien joker
  if (joker) {
    const updated = all.map(p =>
      p.userId === userId && p.joker && p.matchId !== matchId
        ? { ...p, joker: false }
        : p
    );
    db.set('pf_pronos', updated);
  }

  const existing = await getPronoForMatch(userId, matchId);
  if (existing) {
    db.upsert('pf_pronos', { ...existing, homeScore, awayScore, joker });
  } else {
    db.upsert('pf_pronos', {
      id: db.newId(),
      userId, matchId, homeScore, awayScore, joker,
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
  if (!odds) return pronoTrend === realTrend ? 10 : 0;
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

function computePoints(
  matchId: string, realHome: number, realAway: number,
  odds?: Match['odds']
): void {
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
export function createGroup(name: string, userId: string): Promise<Group> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const group: Group = {
    id: db.newId(),
    name, code,
    creatorId: userId,
    members: [userId],
    createdAt: new Date().toISOString(),
  };
  db.upsert('pf_groups', group);
  return Promise.resolve(group);
}

export function joinGroup(code: string, userId: string): Promise<Group | null> {
  const all = db.get<Group>('pf_groups');
  const group = all.find(g => g.code === code.toUpperCase());
  if (!group) return Promise.resolve(null);
  if (!group.members.includes(userId)) {
    db.upsert('pf_groups', { ...group, members: [...group.members, userId] });
    return Promise.resolve({ ...group, members: [...group.members, userId] });
  }
  return Promise.resolve(group);
}

export function getUserGroups(userId: string): Promise<Group[]> {
  const all = db.get<Group>('pf_groups');
  return Promise.resolve(all.filter(g => g.members.includes(userId)));
}

// ---- LEADERBOARD ----
export function getLeaderboard(memberIds?: string[]): Promise<LeaderboardEntry[]> {
  const pronos = db.get<Prono>('pf_pronos');
  const users = getAllUsers();
  const usersMap: Record<string, string> = {};
  users.forEach(u => { usersMap[u.uid] = u.displayName; });

  const stats: Record<string, LeaderboardEntry> = {};
  for (const p of pronos) {
    if (memberIds && !memberIds.includes(p.userId)) continue;
    if (!stats[p.userId]) {
      stats[p.userId] = {
        userId: p.userId,
        displayName: usersMap[p.userId] || 'Joueur',
        totalPoints: 0,
        exactScores: 0,
        correctTrends: 0,
        pronos: 0,
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
export function saveFavoris(userId: string, winner: string, topScorer: string): Promise<void> {
  const all = db.get<Favoris & { id: string }>('pf_favoris');
  const existing = all.find(f => f.userId === userId);
  if (existing) {
    db.upsert('pf_favoris', { ...existing, winner, topScorer });
  } else {
    db.upsert('pf_favoris', { id: userId, userId, winner, topScorer });
  }
  return Promise.resolve();
}

export function getFavoris(userId: string): Promise<Favoris | null> {
  const all = db.get<Favoris & { id: string }>('pf_favoris');
  return Promise.resolve(all.find(f => f.userId === userId) || null);
}

// Compatibilité (plus utilisé mais gardé pour éviter erreurs d'import)
export function saveUserProfile(_uid: string, _displayName: string, _email: string): Promise<void> {
  return Promise.resolve();
}
