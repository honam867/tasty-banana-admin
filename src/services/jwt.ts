import { jwtDecode } from 'jwt-decode';

type AnyRecord = Record<string, any>;

export function safeJwtDecode(token: string): AnyRecord | null {
  try {
    return jwtDecode<any>(token);
  } catch {
    return null;
  }
}

export function decodeTokenToProfile(token: string): AnyRecord | null {
  const payload = safeJwtDecode(token);
  if (!payload) return null;
  // normalize roles
  const roles: string[] = Array.isArray(payload.roles)
    ? payload.roles
    : payload.role
    ? [payload.role]
    : [];
  return { ...payload, roles };
}
