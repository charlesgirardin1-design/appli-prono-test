import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';
import { Match, Prono, Group, LeaderboardEntry, Favoris } from '../types';

// ---- MATCHES ----
export async function getMatches(): Promise<Match[]> {
  const snap = await getDocs(query(collection(db, 'matches'), orderBy('date', 'asc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Match));
}

export async function addMatch(match: Omit<Match, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'matches'), match);
  return ref.id;
}

export async function updateMatchScore(matchId: string, homeScore: number, awayScore: number) {
  await updateDoc(doc(db, 'matches', matchId), { homeScore, awayScore, status: 'finished' });
  await computePoints(matchId, homeScore, awayScore);
}

// ---- PRONOS ----
export async function getPronos(userId: string): Promise<Prono[]> {
  const snap = await getDocs(query(collection(db, 'pronos'), where('userId', '==', userId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Prono));
}

export async function getPronoForMatch(userId: string, matchId: string): Promise<Prono | null> {
  const snap = await getDocs(
    query(collection(db, 'pronos'), where('userId', '==', userId), where('matchId', '==', matchId))
  );
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Prono;
}

// Vérifie si l'utilisateur a encore son joker X2 disponible
export async function hasJokerAvailable(userId: string): Promise<boolean> {
  const snap = await getDocs(
    query(collection(db, 'pronos'), where('userId', '==', userId), where('joker', '==', true))
  );
  return snap.empty;
}

export async function saveProno(
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number,
  joker: boolean
) {
  // Si joker activé, on retire le joker d'un autre prono si existant
  if (joker) {
    const prevJoker = await getDocs(
      query(collection(db, 'pronos'), where('userId', '==', userId), where('joker', '==', true))
    );
    for (const d of prevJoker.docs) {
      if (d.id !== (await getPronoForMatch(userId, matchId))?.id) {
        await updateDoc(doc(db, 'pronos', d.id), { joker: false });
      }
    }
  }

  const existing = await getPronoForMatch(userId, matchId);
  const data = { userId, matchId, homeScore, awayScore, joker, createdAt: new Date().toISOString() };
  if (existing) {
    await updateDoc(doc(db, 'pronos', existing.id), { homeScore, awayScore, joker });
  } else {
    await addDoc(collection(db, 'pronos'), data);
  }
}

// Calcule les points basés sur les cotes
function calcTrendPoints(
  pronoHome: number, pronoAway: number,
  realHome: number, realAway: number,
  odds?: { home: number; draw: number; away: number }
): number {
  const pronoTrend = Math.sign(pronoHome - pronoAway);
  const realTrend = Math.sign(realHome - realAway);
  if (pronoTrend !== realTrend) return 0;

  if (!odds) {
    // Fallback système simple
    return pronoTrend === Math.sign(realHome - realAway) ? 1 : 0;
  }

  // Points = cote de la tendance trouvée * 10 (arrondi)
  if (realTrend > 0) return Math.round(odds.home * 10);
  if (realTrend === 0) return Math.round(odds.draw * 10);
  return Math.round(odds.away * 10);
}

// Bonus score exact basé sur la rareté (proportion de joueurs ayant trouvé)
function calcExactBonus(rarityRatio: number): number {
  // rarityRatio = proportion de joueurs ayant trouvé le score exact (0 à 1)
  // Moins de joueurs l'ont trouvé → bonus plus élevé (20 à 100 pts)
  if (rarityRatio >= 0.5) return 20;
  if (rarityRatio >= 0.3) return 30;
  if (rarityRatio >= 0.15) return 50;
  if (rarityRatio >= 0.05) return 75;
  return 100;
}

async function computePoints(matchId: string, realHome: number, realAway: number) {
  // Récupérer le match pour les cotes
  const matchSnap = await getDocs(query(collection(db, 'matches'), where('__name__', '==', matchId)));
  const matchData = matchSnap.empty ? null : matchSnap.docs[0].data() as Match;
  const odds = matchData?.odds;

  const snap = await getDocs(query(collection(db, 'pronos'), where('matchId', '==', matchId)));
  const allPronos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Prono));

  // Calcul rareté score exact
  const exactCount = allPronos.filter(p => p.homeScore === realHome && p.awayScore === realAway).length;
  const rarityRatio = allPronos.length > 0 ? exactCount / allPronos.length : 0;

  for (const p of allPronos) {
    const trendPoints = calcTrendPoints(p.homeScore, p.awayScore, realHome, realAway, odds);
    const isExact = p.homeScore === realHome && p.awayScore === realAway;
    const bonusExact = isExact ? calcExactBonus(rarityRatio) : 0;
    const subtotal = trendPoints + bonusExact;
    const totalPoints = p.joker ? subtotal * 2 : subtotal;

    await updateDoc(doc(db, 'pronos', p.id), {
      points: trendPoints,
      bonusExact,
      totalPoints,
    });
  }
}

// ---- GROUPS ----
export async function createGroup(name: string, userId: string): Promise<Group> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const data = { name, code, creatorId: userId, members: [userId], createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, 'groups'), data);
  return { id: ref.id, ...data };
}

export async function joinGroup(code: string, userId: string): Promise<Group | null> {
  const snap = await getDocs(query(collection(db, 'groups'), where('code', '==', code)));
  if (snap.empty) return null;
  const groupDoc = snap.docs[0];
  await updateDoc(doc(db, 'groups', groupDoc.id), { members: arrayUnion(userId) });
  return { id: groupDoc.id, ...groupDoc.data() } as Group;
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const snap = await getDocs(query(collection(db, 'groups'), where('members', 'array-contains', userId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Group));
}

// ---- LEADERBOARD ----
export async function getLeaderboard(memberIds?: string[]): Promise<LeaderboardEntry[]> {
  const snap = await getDocs(collection(db, 'pronos'));
  const pronos = snap.docs.map(d => ({ id: d.id, ...d.data() } as Prono));

  const usersSnap = await getDocs(collection(db, 'users'));
  const usersMap: Record<string, string> = {};
  usersSnap.docs.forEach(d => {
    usersMap[d.id] = (d.data() as any).displayName || d.data().email;
  });

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
      if (p.points && p.points > 0 && !p.bonusExact) stats[p.userId].correctTrends++;
    }
  }
  return Object.values(stats).sort((a, b) => b.totalPoints - a.totalPoints);
}

// ---- USER PROFILE ----
export async function saveUserProfile(uid: string, displayName: string, email: string) {
  await setDoc(doc(db, 'users', uid), { displayName, email }, { merge: true });
}

// ---- FAVORIS ----
export async function saveFavoris(userId: string, winner: string, topScorer: string) {
  await setDoc(doc(db, 'favoris', userId), { userId, winner, topScorer });
}

export async function getFavoris(userId: string): Promise<Favoris | null> {
  const snap = await getDocs(query(collection(db, 'favoris'), where('userId', '==', userId)));
  if (snap.empty) return null;
  return snap.docs[0].data() as Favoris;
}
