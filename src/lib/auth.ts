export interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  provider?: 'email' | 'google' | 'apple';
  avatar?: string;
}

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

export function signup(email: string, password: string, displayName?: string): StoredUser {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Un compte existe déjà avec cet email.');
  }
  const user: StoredUser = {
    uid: 'uid_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
    email: email.toLowerCase(),
    displayName: displayName?.trim() || `Joueur#${nextJoueurNumber()}`,
    passwordHash: hashPassword(password),
    provider: 'email',
  };
  users.push(user);
  saveUsers(users);
  setSession(user.uid);
  return user;
}

export function login(email: string, password: string): StoredUser {
  const users = getUsers();
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === hashPassword(password)
  );
  if (!user) throw new Error('Email ou mot de passe incorrect.');
  setSession(user.uid);
  return user;
}

// Google / Apple OAuth — upsert user by email
export function loginWithOAuth(opts: {
  email: string;
  displayName: string;
  provider: 'google' | 'apple';
  avatar?: string;
  providerUid?: string;
}): StoredUser {
  const users = getUsers();
  let user = users.find(u => u.email.toLowerCase() === opts.email.toLowerCase());
  if (user) {
    // Update display info if needed
    const idx = users.indexOf(user);
    users[idx] = { ...user, displayName: user.displayName, avatar: opts.avatar ?? user.avatar, provider: opts.provider };
    user = users[idx];
    saveUsers(users);
  } else {
    user = {
      uid: opts.provider + '_' + (opts.providerUid || Math.random().toString(36).substring(2)),
      email: opts.email.toLowerCase(),
      displayName: opts.displayName || `Joueur#${nextJoueurNumber()}`,
      passwordHash: '',
      provider: opts.provider,
      avatar: opts.avatar,
    };
    users.push(user);
    saveUsers(users);
  }
  setSession(user.uid);
  return user;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): StoredUser | null {
  const uid = localStorage.getItem(SESSION_KEY);
  if (!uid) return null;
  return getUsers().find(u => u.uid === uid) || null;
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
