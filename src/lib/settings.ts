export interface AppSettings {
  pseudo: string;
  playerId: string;
  theme: 'dark' | 'light';
}

const KEY = 'pf_settings';

function defaultSettings(): AppSettings {
  return {
    pseudo: 'Joueur',
    playerId: 'pid_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
    theme: 'dark',
  };
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = defaultSettings();
      saveSettings(s);
      return s;
    }
    return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const next = { ...current, ...settings };
  localStorage.setItem(KEY, JSON.stringify(next));
  applyTheme(next.theme);
  return next;
}

// Retourne le playerId du compte connecte (per-account), sinon fallback pf_settings
export function getPlayerId(): string {
  try {
    const uid = localStorage.getItem('pf_session');
    if (uid) {
      const users: Array<{ uid: string; playerId?: string }> =
        JSON.parse(localStorage.getItem('pf_users') || '[]');
      const user = users.find(u => u.uid === uid);
      if (user?.playerId) return user.playerId;
    }
  } catch {}
  return getSettings().playerId;
}

export function getPseudo(): string {
  try {
    const uid = localStorage.getItem('pf_session');
    if (uid) {
      const users: Array<{ uid: string; displayName?: string }> =
        JSON.parse(localStorage.getItem('pf_users') || '[]');
      const user = users.find(u => u.uid === uid);
      if (user?.displayName) return user.displayName;
    }
  } catch {}
  return getSettings().pseudo;
}

export function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme);
}
