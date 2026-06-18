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
import { Match, Prono, Group, LeaderboardEntry } from '../types';

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

export async function saveProno(userId: string, matchId: string, homeScore: number, awayScore: number) {
  const existing = await getPronoForMatch(userId, matchId);
  const data = { userId, matchId, homeScore, awayScore, createdAt: new Date().toISOString() };
  if (existing) {
    await updateDoc(doc(db, 'pronos', existing.id), { homeScore, awayScore });
  } else {
    await addDoc(collection(db, 'pronos'), data);
  }
}

function calcPoints(
  pronoHome: number, pronoAway: number,
  realHome: number, realAway: number
): number {
  if (pronoHome === realHome && pronoAway === realAway) return 3;
  const pronoTrend = Math.sign(pronoHome - pronoAway);
  const realTrend = Math.sign(realHome - realAway);
  if (pronoTrend === realTrend) return 1;
  return 0;
}

async function computePoints(matchId: string, realHome: number, realAway: number) {
  const snap = await getDocs(query(collection(db, 'pronos'), where('matchId', '==', matchId)));
  for (const d of snap.docs) {
    const prono = d.data() as Prono;
    const pts = calcPoints(prono.homeScore, prono.awayScore, realHome, realAway);
    await updateDoc(doc(db, 'pronos', d.id), { points: pts });
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
  let q = collection(db, 'pronos');
  const snap = await getDocs(q);
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
    if (p.points !== undefined) {
      stats[p.userId].totalPoints += p.points;
      stats[p.userId].pronos++;
      if (p.points === 3) stats[p.userId].exactScores++;
      if (p.points === 1) stats[p.userId].correctTrends++;
    }
  }
  return Object.values(stats).sort((a, b) => b.totalPoints - a.totalPoints);
}

export async function saveUserProfile(uid: string, displayName: string, email: string) {
  await setDoc(doc(db, 'users', uid), { displayName, email }, { merge: true });
}
