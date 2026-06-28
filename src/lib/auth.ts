export interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  provider?: 'email' | 'google' | 'apple';
  avatar?: string;
  isBanned?: boolean;
  playerId?: string; // identifiant stable unique par compte
}

// UIDs ayant les droits administrateur
export const ADMIN_UIDS: string[] = [
  'pid_a5czgh8zgpmqxrys0u',
];

const USERS_KEY = 'pf_users';
const SESSION_KEY = 'pf_session';

function hashPassword(password: string): string {
  return btoa(password + '_pf_salt');
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function nextJoueurNumber(): string {
  const users = getUsers();
  return String(users.length + 1).padStart(3, '0');
}

function genPlayerId(): string {
  return 'pid_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function signup(email: string, password: string, displayName?: string): StoredUser {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Un compte existe avec cet email.');
  }
  const user: StoredUser = {
    uid: 'uid_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
    email: email.toLowerCase(),
    displayName: displayName?.trim() || `Joueur#${nextJoueurNumber()}`,
    passwordHash: hashPassword(password),
    provider: 'email',
    playerId: genPlayerId(),
  };
  users.push(user);
  saveUsers(users);
  setSession(user.uid);
  return user;
}

export function login(email: string, password: string): StoredUser {
  const users = getUsers();
  const idx = users.findIndex(
    u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hashPassword(password)
  );
  if (idx === -1) throw new Error('Email ou mot de passe incorrect.');
  if (users[idx].isBanned) throw new Error('Ce compte a ete suspendu par un administrateur.');
  // Ajouter playerId si absent (migration comptes existants)
  if (!users[idx].playerId) {
    users[idx] = { ...users[idx], playerId: genPlayerId() };
    saveUsers(users);
  }
  setSession(users[idx].uid);
  return users[idx];
}

export function loginWithOAuth(opts: {
  email: string;
  displayName: string;
  provider: 'google' | 'apple';
  avatar?: string;
  providerUid?: string;
}): StoredUser {
  const users = getUsers();
  let idx = users.findIndex(u => u.email.toLowerCase() === opts.email.toLowerCase());
  if (idx !== -1) {
    if (users[idx].isBanned) throw new Error('Ce compte a ete suspendu par un administrateur.');
    users[idx] = {
      ...users[idx],
      avatar: opts.avatar ?? users[idx].avatar,
      provider: opts.provider,
      // Ajouter playerId si absent (migration)
      playerId: users[idx].playerId ?? genPlayerId(),
    };
    saveUsers(users);
    setSession(users[idx].uid);
    return users[idx];
  } else {
    const user: StoredUser = {
      uid: opts.provider + '_' + (opts.providerUid || Math.random().toString(36).substring(2)),
      email: opts.email.toLowerCase(),
      displayName: opts.displayName || `Joueur#${nextJoueurNumber()}`,
      passwordHash: '',
      provider: opts.provider,
      avatar: opts.avatar,
      playerId: genPlayerId(),
    };
    users.push(user);
    saveUsers(users);
    setSession(user.uid);
    return user;
  }
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): StoredUser | null {
  const uid = localStorage.getItem(SESSION_KEY);
  if (!uid) return null;
  const users = getUsers();
  const idx = users.findIndex(u => u.uid === uid);
  if (idx === -1) return null;
  // Migration: assigner un playerId unique si absent (comptes crees avant cette feature)
  if (!users[idx].playerId) {
    users[idx] = { ...users[idx], playerId: genPlayerId() };
    saveUsers(users);
  }
  return users[idx];
}

function setSession(uid: string): void {
  localStorage.setItem(SESSION_KEY, uid);
}

export function getUserById(uid: string): StoredUser | null {
  return getUsers().find(u => u.uid === uid) || null;
}

export function getAllUsers(): StoredUser[] {
  return getUsers().map(u => ({ ...u, passwordHash: '' }));
}

export function updateDisplayName(uid: string, newName: string): StoredUser {
  const users = getUsers();
  const idx = users.findIndex(u => u.uid === uid);
  if (idx === -1) throw new Error('Utilisateur introuvable.');
  users[idx] = { ...users[idx], displayName: newName.trim() || 'Joueur' };
  saveUsers(users);
  return users[idx];
}

// ---- ADMIN ----

export function isAdmin(uid?: string): boolean {
  // Vérifier le playerId du compte connecté en priorité
  const currentUid = uid || getCurrentUser()?.uid;
  if (currentUid) {
    const users = getUsers();
    const user = users.find(u => u.uid === currentUid);
    if (user?.playerId && ADMIN_UIDS.includes(user.playerId)) return true;
  }
  // Fallback: pf_settings (compatibilité)
  try {
    const raw = localStorage.getItem('pf_settings');
    if (raw) {
      const settings = JSON.parse(raw);
      if (settings.playerId && ADMIN_UIDS.includes(settings.playerId)) return true;
    }
  } catch {}
  return false;
}

export function banUser(targetUid: string): void {
  if (!isAdmin()) throw new Error('Permission refusee.');
  const users = getUsers();
  const idx = users.findIndex(u => u.uid === targetUid);
  if (idx === -1) throw new Error('Utilisateur introuvable.');
  if (ADMIN_UIDS.includes(targetUid)) throw new Error('Impossible de bannir un administrateur.');
  users[idx] = { ...users[idx], isBanned: true };
  saveUsers(users);
}

export function unbanUser(targetUid: string): void {
  if (!isAdmin()) throw new Error('Permission refusee.');
  const users = getUsers();
  const idx = users.findIndex(u => u.uid === targetUid);
  if (idx === -1) throw new Error('Utilisateur introuvable.');
  users[idx] = { ...users[idx], isBanned: false };
  saveUsers(users);
}
