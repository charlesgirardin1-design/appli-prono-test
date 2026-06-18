export interface AppSettings {
  pseudo: string;
  playerId: string; // unique stable ID
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

export function getPlayerId(): string {
  return getSettings().playerId;
}

export function getPseudo(): string {
  return getSettings().pseudo;
}

export function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme);
}
