import { useEffect, useState } from 'react';

// Streak = jours consécutifs avec au moins un prono soumis
function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getStreakData(): { streak: number; lastDay: string } {
  try {
    return JSON.parse(localStorage.getItem('pf_streak') || '{"streak":0,"lastDay":""}');
  } catch {
    return { streak: 0, lastDay: '' };
  }
}

export function recordPronoToday() {
  const today = getTodayKey();
  const data = getStreakData();
  if (data.lastDay === today) return; // déjà enregistré aujourd'hui

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);

  const newStreak = data.lastDay === yKey ? data.streak + 1 : 1;
  localStorage.setItem('pf_streak', JSON.stringify({ streak: newStreak, lastDay: today }));
}

export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const data = getStreakData();
    // Streak valide seulement si le dernier prono était hier ou aujourd'hui
    const today = getTodayKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);

    if (data.lastDay === today || data.lastDay === yKey) {
      setStreak(data.streak);
    } else {
      setStreak(0);
    }
  }, []);

  return streak;
}
