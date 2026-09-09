const TOKEN_KEY = "documind_token";
const COOKIE_NAME = "documind_token";

export interface JwtPayload {
  sub: string; // email
  user_id: number | string;
  exp: number;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // A lightweight, non-httpOnly cookie so middleware.ts can gate routes on
  // the server. The real authorization check still happens against the
  // FastAPI backend on every request.
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json))) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: JwtPayload | null): boolean {
  if (!payload) return true;
  return payload.exp * 1000 < Date.now();
}
