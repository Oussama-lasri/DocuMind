"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { ApiError } from "@/lib/api";
import {
  createSession,
  loadSessions,
  saveSessions,
  titleFromQuery,
} from "@/lib/chat-storage";
import type { ChatMessage, ChatSession } from "@/lib/types";
import { SessionList } from "@/components/chat/session-list";
import { MessageBubble } from "@/components/chat/message-bubble";
import { SourcesPanel } from "@/components/chat/sources-panel";
import { ChatInput } from "@/components/chat/chat-input";
import { BookOpenText } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const stored = loadSessions(user.id);
    // Restoring sessions from localStorage on mount, same rationale as the
    // auth context: this can't run during SSR.
    if (stored.length === 0) {
      const fresh = createSession();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessions([fresh]);
      setActiveId(fresh.id);
    } else {
      setSessions(stored);
      setActiveId(stored[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (user && sessions.length > 0) saveSessions(user.id, sessions);
  }, [user, sessions]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId]
  );

  const lastAssistantMessage = useMemo(() => {
    if (!activeSession) return null;
    return [...activeSession.messages].reverse().find((m) => m.role === "assistant") ?? null;
  }, [activeSession]);

  function updateSession(id: string, updater: (session: ChatSession) => ChatSession) {
    setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  }

  function handleNewSession() {
    const fresh = createSession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setActiveSourceIndex(null);
  }

  function handleDeleteSession(id: string) {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (id === activeId) setActiveId(next[0]?.id ?? null);
      return next;
    });
  }

  async function handleSend() {
    const query = draft.trim();
    if (!query || !user) return;

    let sessionId = activeId;
    if (!sessionId) {
      const fresh = createSession();
      setSessions((prev) => [fresh, ...prev]);
      sessionId = fresh.id;
      setActiveId(fresh.id);
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      createdAt: new Date().toISOString(),
    };

    updateSession(sessionId, (s) => ({
      ...s,
      title: s.messages.length === 0 ? titleFromQuery(query) : s.title,
      messages: [...s.messages, userMessage],
    }));

    setDraft("");
    setIsSending(true);
    setActiveSourceIndex(null);

    try {
      const response = await api.sendChatMessage({
        query,
        user_id: user.id,
        session_id: sessionId,
      });

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        agentUsed: response.agent_used,
        createdAt: new Date().toISOString(),
      };

      updateSession(sessionId, (s) => ({
        ...s,
        messages: [...s.messages, assistantMessage],
      }));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "DocuMind couldn't answer that. Please try again.";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-full">
      <SessionList
        sessions={sessions}
        activeId={activeId}
        onSelect={(id) => {
          setActiveId(id);
          setActiveSourceIndex(null);
        }}
        onNew={handleNewSession}
        onDelete={handleDeleteSession}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-line px-8 py-5">
          <h1 className="font-serif text-lg font-semibold text-ink">
            {activeSession?.title ?? "Chat"}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {!activeSession || activeSession.messages.length === 0 ? (
            <EmptyState onExample={(q) => setDraft(q)} />
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
              {activeSession.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  activeSourceIndex={
                    message.id === lastAssistantMessage?.id ? activeSourceIndex : null
                  }
                  onCiteClick={(i) => setActiveSourceIndex(i)}
                />
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-sm text-ink-dim">
                  <BookOpenText className="h-4 w-4 animate-pulse" />
                  Searching your documents…
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-2xl px-8 pb-6">
          <ChatInput value={draft} onChange={setDraft} onSubmit={handleSend} disabled={isSending} />
        </div>
      </div>

      <SourcesPanel
        sources={lastAssistantMessage?.sources ?? []}
        activeIndex={activeSourceIndex}
        onSelect={setActiveSourceIndex}
      />
    </div>
  );
}

function EmptyState({ onExample }: { onExample: (query: string) => void }) {
  const examples = [
    "What are the payment terms in my contract with Orange?",
    "Summarize the main risks mentioned in these contracts.",
    "What are the main objectives of this project?",
  ];

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
      <h2 className="font-serif text-xl font-semibold text-ink">
        Ask your documents anything
      </h2>
      <p className="mt-2 text-sm text-ink-dim">
        DocuMind searches everything you&apos;ve uploaded and grounds its answer in the
        passages it finds.
      </p>
      <div className="mt-6 flex w-full flex-col gap-2">
        {examples.map((q) => (
          <button
            key={q}
            onClick={() => onExample(q)}
            className="rounded-md border border-line bg-paper px-4 py-2.5 text-left text-sm text-ink-dim transition-colors hover:border-line-strong hover:text-ink"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
