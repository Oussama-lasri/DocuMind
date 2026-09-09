"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authService from "@/services/authService";
import {
  clearToken,
  decodeToken,
  getToken,
  isTokenExpired,
  setToken as persistToken,
} from "@/utils/auth-storage";
import type { UserCreate } from "@/utils/types";

export interface CurrentUser {
  id: string;
  email: string;
}

export interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function userFromToken(token: string | null): CurrentUser | null {
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || isTokenExpired(payload)) return null;
  return { id: String(payload.user_id), email: payload.sub };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const resolved = userFromToken(token);
    if (token && !resolved) clearToken();
    // Reading auth state from localStorage must happen after mount to avoid
    // a server/client hydration mismatch (the server can't see localStorage).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(resolved);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await authService.login(email, password);
    persistToken(access_token);
    setUser(userFromToken(access_token));
  }, []);

  const register = useCallback(async (data: UserCreate) => {
    const { access_token } = await authService.register(data);
    persistToken(access_token);
    setUser(userFromToken(access_token));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
