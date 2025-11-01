import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeTokenToProfile } from '@/services/jwt';
import { getToken, setToken, clearToken, getUser as getStoredUser, setUser as setStoredUser, clearUser as clearStoredUser } from '@/services/storage';
import { onUnauthorized, setAccessToken as sessionSetAccessToken } from '@/features/auth/session';
import * as AuthApi from '@/features/auth/api/auth.api';

type User = {
  id?: string | number;
  email?: string;
  username?: string;
  roles: string[];
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'error';
};

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({ user: null, accessToken: null, status: 'authenticating' });

  const hydrateFromStorage = useCallback(() => {
    const stored = getToken();
    if (stored) {
      const cached = getStoredUser();
      const profile = decodeTokenToProfile(stored);
      const user: User | null = cached
        ? { id: cached.id, email: cached.email, username: cached.username, roles: cached.roles || [] }
        : profile
        ? { id: profile.sub as string, email: profile.email, username: profile.username, roles: profile.roles || (profile.role ? [profile.role] : []) }
        : null;
      setState({ user, accessToken: stored, status: user ? 'authenticated' : 'idle' });
      sessionSetAccessToken(stored);
    } else {
      setState({ user: null, accessToken: null, status: 'idle' });
    }
  }, []);

  useEffect(() => {
    hydrateFromStorage();
    onUnauthorized(() => {
      // token invalid/expired: force logout
      logout();
    });
  }, [hydrateFromStorage]);

  const login = useCallback(async (email: string, password: string, remember = false) => {
    setState((s) => ({ ...s, status: 'authenticating' }));
    try {
      const { accessToken, user: apiUser } = await AuthApi.login({ email, password, remember });
      if (remember) {
        setToken(accessToken);
      }
      sessionSetAccessToken(accessToken);
      const profile = decodeTokenToProfile(accessToken);
      const normalizedFromApi: User | null = apiUser
        ? { id: apiUser.id ?? apiUser.userId, email: apiUser.email, username: apiUser.username, roles: apiUser.roles ?? (apiUser.role ? [apiUser.role] : []) }
        : null;
      const user: User | null = normalizedFromApi ?? (profile
        ? { id: profile.sub as string, email: profile.email, username: profile.username, roles: profile.roles || (profile.role ? [profile.role] : []) }
        : null);
      if (user && remember) setStoredUser({ id: user.id ? String(user.id) : undefined, email: user.email, username: user.username, roles: user.roles });
      setState({ user, accessToken, status: user ? 'authenticated' : 'error' });
      if (user && user.roles.includes('admin')) {
        navigate('/welcome', { replace: true });
      } else {
        // not admin -> logout or forbid
        logout();
      }
    } catch (e) {
      setState({ user: null, accessToken: null, status: 'error' });
      throw e;
    }
  }, [navigate]);

  const logout = useCallback(() => {
    clearToken();
    sessionSetAccessToken(null);
    clearStoredUser();
    setState({ user: null, accessToken: null, status: 'idle' });
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    isAuthenticated: !!state.user && !!state.accessToken,
    login,
    logout,
  }), [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
