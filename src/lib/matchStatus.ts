import { Match } from '../types';
// 3h fallback: if API hasn't confirmed finished, auto-close after 3h (covers any match)
const AUTO_FINISH_MS = 3 * 60 * 60 * 1000;

export function getEffectiveStatus(match: Match): 'upcoming' | 'live' | 'finished' {
  if (match.status === 'finished') return 'finished';
  if (match.status === 'live') return 'live';
  const matchTime = new Date(match.date).getTime();
  const now = Date.now();
  if (now >= matchTime + AUTO_FINISH_MS) return 'finished';
  if (now >= matchTime) return 'live';
  return 'upcoming';
}
