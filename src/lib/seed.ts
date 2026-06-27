import { db } from './storage';
import { Match } from '../types';
import { WORLD_CUP_2026_MATCHES } from '../data/worldCup2026';

const SEED_VERSION = 'v4'; // incrémenter pour forcer un re-seed

export function seedMatchesIfNeeded(): void {
  const seeded = localStorage.getItem('pf_seeded');
  if (seeded === SEED_VERSION) return;

  const matches: Match[] = WORLD_CUP_2026_MATCHES.map((m, i) => ({
    ...m,
    id: `cdm2026_${i.toString().padStart(3, '0')}`,
  }));

  db.set('pf_matches', matches);
  localStorage.setItem('pf_seeded', SEED_VERSION);
}
