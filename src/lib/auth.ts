// Authentification locale via localStorage

export interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
}

const USERS_KEY = 'pf_users';
const SESSION_KEY = 'pf_session';

function hashPassword(password: string): string {
  // Hash simple (btoa) — suffisant pour un stockage local demo
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

export function signup(email: string, password: string, displayName: string): StoredUser {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Un compte existe déjà avec cet email.');
  }
  const user: StoredUser = {
    uid: 'uid_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
    email: email.toLowerCase(),
    displayName,
    passwordHash: hashPassword(password),
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
