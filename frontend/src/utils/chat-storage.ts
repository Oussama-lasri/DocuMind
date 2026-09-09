import type { ChatSession } from "@/utils/types";

function storageKey(userId: string) {
  return `documind_sessions_${userId}`;
}

export function loadSessions(userId: string): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

export function saveSessions(userId: string, sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify(sessions));
}

export function createSession(): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    createdAt: new Date().toISOString(),
    messages: [],
  };
}

export function titleFromQuery(query: string): string {
  const trimmed = query.trim().replace(/\s+/g, " ");
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}…` : trimmed || "New chat";
}
