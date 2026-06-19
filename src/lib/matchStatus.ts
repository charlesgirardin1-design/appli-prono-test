import { Match } from '../types';
const MATCH_DURATION_MS = 115 * 60 * 1000; // 115 min buffer for extra time

export function getEffectiveStatus(match: Match): 'upcoming' | 'live' | 'finished' {
  if (match.status === 'finished') return 'finished';
  if (match.status === 'live') return 'live';
  const matchTime = new Date(match.date).getTime();
  const now = Date.now();
  if (now >= matchTime + MATCH_DURATION_MS) return 'finished';
  if (now >= matchTime) return 'live';
  return 'upcoming';
}
