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

export interface Odds {
  home: number;  // cote victoire domicile
  draw: number;  // cote match nul
  away: number;  // cote victoire extérieur
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string; // ISO string
  competition: string;
  phase: string; // 'Phase de groupes' | 'Huitièmes de finale' | 'Quarts de finale' | 'Demi-finale' | 'Finale'
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
  odds?: Odds;
}

export interface Prono {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  joker: boolean; // bonus X2
  points?: number;          // points tendance (cote)
  bonusExact?: number;      // bonus score exact (rareté)
  totalPoints?: number;     // points + bonusExact, x2 si joker
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

export interface Favoris {
  userId: string;
  winner: string;   // équipe gagnante du tournoi
  topScorer: string; // meilleur buteur
}
