import { db } from './storage';
import { Match } from '../types';
import { WORLD_CUP_2026_MATCHES } from '../data/worldCup2026';
import { recomputeAllPoints } from './firestore';
import { fetchAndApplyOdds } from './odds';

const SEED_VERSION = 'v8';

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

// Mise a jour des cotes depuis l'API (appele au demarrage)
export async function refreshOdds(): Promise<void> {
  try {
    const matches: Match[] = db.get('pf_matches');
    if (!matches.length) return;
    const updated = await fetchAndApplyOdds(matches);
    db.set('pf_matches', updated);
  } catch {
    // Silencieux si l'API est indisponible
  }
}
