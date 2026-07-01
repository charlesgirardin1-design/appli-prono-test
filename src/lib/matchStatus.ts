import { Match } from '../types';

// Auto-close after 3h even if API hasn't confirmed finish
const AUTO_FINISH_MS = 3 * 60 * 60 * 1000;

export function getEffectiveStatus(match: Match): 'upcoming' | 'live' | 'finished' {
  const matchTime = new Date(match.date).getTime();
  const now = Date.now();
  // Time check FIRST: even if status === 'live', auto-close after 3h
  if (now >= matchTime + AUTO_FINISH_MS) return 'finished';
  if (match.status === 'finished') return 'finished';
  if (match.status === 'live') return 'live';
  if (now >= matchTime) return 'live';
  return 'upcoming';
}
