import { Match } from '../types/index';
import { getPronos } from './firestore';
import { getPlayerId } from './settings';

async function getMatchesNeedingProno(matches: Match[]): Promise<Match[]> {
  const pronos = await getPronos();
  const pid = getPlayerId();
  const myIds = new Set(pronos.filter(p => p.userId === pid).map(p => p.matchId));
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  return matches.filter(m => {
    if (m.status === 'finished') return false;
    if (myIds.has(m.id)) return false;
    const t = new Date(m.date).getTime();
    return t - now >= 0 && t - now <= oneHour;
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function startMatchNotifications(getMatches: () => Promise<Match[]>): () => void {
  let timerId: ReturnType<typeof setInterval>;
  const notified = new Set<string>();

  async function check() {
    try {
      const matches = await getMatches();
      const upcoming = await getMatchesNeedingProno(matches);
      upcoming.forEach(m => {
        if (notified.has(m.id)) return;
        notified.add(m.id);
        if (Notification.permission === 'granted') {
          new Notification('⚽ Match dans 1h !', {
            body: m.homeTeam.name + ' vs ' + m.awayTeam.name + ' — Place ton prono !',
            icon: '/favicon.ico',
          });
        }
      });
    } catch { /* silencieux */ }
  }

  requestNotificationPermission().then(granted => {
    if (granted) {
      check();
      timerId = setInterval(check, 15 * 60 * 1000);
    }
  });

  return () => clearInterval(timerId);
}
