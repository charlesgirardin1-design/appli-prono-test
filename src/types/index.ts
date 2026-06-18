export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Team {
  name: string;
  logo?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string; // ISO string
  competition: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
}

export interface Prono {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  points?: number;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  creatorId: string;
  members: string[];
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalPoints: number;
  exactScores: number;
  correctTrends: number;
  pronos: number;
}
