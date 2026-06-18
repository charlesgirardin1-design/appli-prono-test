// Couche de persistance locale (localStorage)
// Remplace Firebase Firestore pour un fonctionnement immédiat sans configuration

function get<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function getOne<T>(key: string, id: string): T | null {
  const all = get<any>(key);
  return all.find((x: any) => x.id === id) || null;
}

function upsert<T extends { id: string }>(key: string, item: T): void {
  const all = get<T>(key);
  const idx = all.findIndex((x: any) => x.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  set(key, all);
}

function remove(key: string, id: string): void {
  const all = get<any>(key);
  set(key, all.filter((x: any) => x.id !== id));
}

function newId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const db = { get, set, getOne, upsert, remove, newId };
