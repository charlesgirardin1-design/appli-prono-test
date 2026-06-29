import { db } from './storage';
import { Match } from '../types';
import { WORLD_CUP_2026_MATCHES } from '../data/worldCup2026';
import { recomputeAllPoints } from './firestore';


const SEED_VERSION = 'v11'; // incrÃ©menter pour forcer un re-seed


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


// Met Ã  jour les cotes des matchs depuis la source sans toucher aux scores/pronos
export function refreshOdds(): void {
  const matches = db.get<Match>('pf_matches');
  if (matches.length === 0) return;


  const source = WORLD_CUP_2026_MATCHES;
  let changed = false;


  const updated = matches.map((m, i) => {
    const src = source[i];
    if (!src || !src.odds) return m;
    if (JSON.stringify(m.odds) === JSON.stringify(src.odds)) return m;
    changed = true;
    return { ...m, odds: src.odds };
  });
