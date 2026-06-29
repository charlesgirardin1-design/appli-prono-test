import { db } from './storage';
import { Match } from '../types';
import { WORLD_CUP_2026_MATCHES } from '../data/worldCup2026';
import { recomputeAllPoints } from './firestore';

const SEED_VERSION = 'v11';

export function seedMatchesIfNeeded(): void {
  const seeded = localStorage.getItem('pf_seeded');
  if (seeded === SEED_VERSION) return;

  const matches: Match[] = WORLD_CUP_2026_MATCHES.map((m, i) => ({
    ...m,
    id: `cdm2026_${i.toString().padStart(3, '0')}`,
  }));

  db.set('pf_matches', matches);
  localStorage.setItem('pf_seeded', SEED_VERSION);
  recomputeAllPoints();
}

export function refreshOdds(): void {
  const matches: Match[] = db.get<Match>('pf_matches');
  const updated = matches.map(m => {
    const src = WORLD_CUP_2026_MATCHES.find(
      s => s.homeTeam.name === m.homeTeam.name && s.awayTeam.name === m.awayTeam.name
    );
    if (!src) return m;
    return { ...m, odds: src.odds };
  });
  db.set('pf_matches', updated);
}
