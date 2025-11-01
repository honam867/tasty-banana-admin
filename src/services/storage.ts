const STORAGE_KEY = 'tb_admin_access_token';
const USER_KEY = 'tb_admin_user';
const storageMode = (import.meta.env.VITE_TOKEN_STORAGE as string) || 'local';

export function setToken(token: string) {
  if (storageMode === 'local' && typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, token);
  }
}

export function getToken(): string | null {
  if (storageMode === 'local' && typeof localStorage !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY);
  }
  return null;
}

export function clearToken() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export type StoredUser = { id?: string; email?: string; username?: string; roles?: string[] };

export function setUser(user: StoredUser | null) {
  if (typeof localStorage === 'undefined') return;
  if (!user) {
    localStorage.removeItem(USER_KEY);
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): StoredUser | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearUser() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
}
