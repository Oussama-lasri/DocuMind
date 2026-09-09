  "use client";

  import { useEffect, useMemo, useState } from "react";
  import { toast } from "sonner";
  import { BookOpenText, MessageSquarePlus, Trash2 } from "lucide-react";
  import { useAuth } from "@/hooks/useAuth";
  import * as chatService from "@/services/chatService";
  import * as documentService from "@/services/documentService";
  import { ApiError } from "@/services/http";
  import {
    createSession,
    loadSessions,
    saveSessions,
    titleFromQuery,
  } from "@/utils/chat-storage";
  import type { ChatMessage, ChatSession, DocumentResponse } from "@/utils/types";
  import { MessageBubble } from "@/components/chat/message-bubble";
  import { SourcesRail, type WebSource } from "@/components/studio/SourcesRail";
  import { StudioRail } from "@/components/studio/StudioRail";
  import { ChatComposer } from "@/components/studio/ChatComposer";
  import { cn, formatDate } from "@/utils/cn";
  import { Button } from "@/components/ui/button";

  export default function ChatPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [draft, setDraft] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(null);

    const [documents, setDocuments] = useState<DocumentResponse[]>([]);
    const [docsLoading, setDocsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [webSources, setWebSources] = useState<WebSource[]>([]);
    const [useWeb, setUseWeb] = useState(false);
    const [showSessions, setShowSessions] = useState(false);

    useEffect(() => {
      if (!user) return;
      const stored = loadSessions(user.id);
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

    async function loadDocuments() {
      setDocsLoading(true);
      try {
        const res = await documentService.listDocuments();
        console.log("Loaded documents:", res.documents);
        setDocuments(res.documents);
        setSelectedIds((prev) => {
          if (prev.size > 0) return prev;
          return new Set(
            res.documents.filter((d) => d.status === "processed").map((d) => d.id)
          );
        });
      } catch {
        toast.error("Couldn't load your sources.");
      } finally {
        setDocsLoading(false);
      }
    }

    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadDocuments();
    }, []);

    const activeSession = useMemo(
      () => sessions.find((s) => s.id === activeId) ?? null,
      [sessions, activeId]
    );

    const lastAssistantMessage = useMemo(() => {
      if (!activeSession) return null;
      return [...activeSession.messages].reverse().find((m) => m.role === "assistant") ?? null;
    }, [activeSession]);

    const selectedWebUrls = webSources.filter((w) => w.selected).map((w) => w.url);
    const selectedCount = selectedIds.size + selectedWebUrls.length;

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

    function handleUploadFiles(files: File[]) {
      files.forEach((file) => {
        toast.message(`Uploading ${file.name}…`);
        documentService
          .uploadDocument(file)
          .then(() => {
            toast.success(`${file.name} uploaded`);
            loadDocuments();
          })
          .catch((err) => {
            toast.error(
              err instanceof ApiError ? err.message : `${file.name} failed to upload`
            );
          });
      });
    }

    async function sendQuery(query: string) {
      if (!query.trim() || !user) return;

      if (selectedCount === 0 && !useWeb) {
        toast.error("Select at least one source, or turn on web access.");
        return;
      }

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
        const response = await chatService.sendChatMessage({
          query,
          user_id: user.id,
          session_id: sessionId,
          document_ids: Array.from(selectedIds),
          use_web: useWeb || selectedWebUrls.length > 0,
          web_urls: selectedWebUrls.length ? selectedWebUrls : null,
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
      <div className="flex h-full min-h-0">
        <SourcesRail
          documents={documents}
          selectedIds={selectedIds}
          webSources={webSources}
          useWeb={useWeb}
          isLoading={docsLoading}
          onToggleDoc={(id) => {
            setSelectedIds((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }}
          onSelectAll={() =>
            setSelectedIds(
              new Set(documents.filter((d) => d.status === "processed").map((d) => d.id))
            )
          }
          onClearAll={() => setSelectedIds(new Set())}
          onToggleUseWeb={() => setUseWeb((v) => !v)}
          onAddWebUrl={(url) => {
            setWebSources((prev) => {
              if (prev.some((w) => w.url === url)) return prev;
              return [...prev, { id: crypto.randomUUID(), url, selected: true }];
            });
            setUseWeb(true);
            toast.success("Web source added");
          }}
          onToggleWebSource={(id) =>
            setWebSources((prev) =>
              prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
            )
          }
          onRemoveWebSource={(id) =>
            setWebSources((prev) => prev.filter((w) => w.id !== id))
          }
          onUploadFiles={handleUploadFiles}
        />

        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-line/80 px-5 py-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-dim">
                Studio chat
              </p>
              <h1 className="truncate font-serif text-lg font-semibold text-ink">
                {activeSession?.title ?? "New conversation"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSessions((v) => !v)}
              >
                History
              </Button>
              <Button size="sm" variant="mark" onClick={handleNewSession}>
                <MessageSquarePlus className="h-3.5 w-3.5" />
                New
              </Button>
            </div>
          </header>

          {showSessions && (
            <div className="absolute left-4 top-16 z-20 w-72 rounded-2xl border border-line bg-surface p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)] panel-enter">
              <div className="max-h-80 space-y-0.5 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-xl px-2.5 py-2",
                      activeId === session.id ? "bg-mark-dim-2" : "hover:bg-paper-dim"
                    )}
                  >
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setActiveId(session.id);
                        setShowSessions(false);
                        setActiveSourceIndex(null);
                      }}
                    >
                      <span className="block truncate text-sm font-medium text-ink">
                        {session.title}
                      </span>
                      <span className="text-[11px] text-ink-dim">
                        {formatDate(session.createdAt)}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-ink-dim opacity-0 hover:text-flag group-hover:opacity-100"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            {!activeSession || activeSession.messages.length === 0 ? (
              <EmptyState
                onExample={(q) => setDraft(q)}
                selectedCount={selectedCount}
                useWeb={useWeb}
              />
            ) : (
              <div className="mx-auto flex max-w-2xl flex-col gap-5">
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
                    <BookOpenText className="h-4 w-4 animate-pulse-soft text-mark" />
                    Grounding answer in your sources…
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mx-auto w-full max-w-2xl px-5 pb-5 sm:px-8">
            <ChatComposer
              value={draft}
              onChange={setDraft}
              onSubmit={() => sendQuery(draft)}
              disabled={isSending}
              selectedCount={selectedCount}
              useWeb={useWeb}
              onToggleUseWeb={() => setUseWeb((v) => !v)}
            />
          </div>
        </div>

        <StudioRail
          sources={lastAssistantMessage?.sources ?? []}
          activeIndex={activeSourceIndex}
          onSelectSource={setActiveSourceIndex}
          onGuidePrompt={(prompt) => {
            setDraft(prompt);
            void sendQuery(prompt);
          }}
        />
      </div>
    );
  }

  function EmptyState({
    onExample,
    selectedCount,
    useWeb,
  }: {
    onExample: (query: string) => void;
    selectedCount: number;
    useWeb: boolean;
  }) {
    const examples = [
      "Summarize the main arguments across my selected sources.",
      "What contradictions or gaps appear between these documents?",
      "Extract action items and deadlines with citations.",
    ];

    return (
      <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center panel-enter">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-glow shadow-lg shadow-mark/10">
          <BookOpenText className="h-6 w-6" />
        </div>
        <h2 className="mt-5 font-serif text-2xl font-semibold tracking-tight text-ink">
          Think with your sources
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
          {selectedCount > 0
            ? `Ready to chat with ${selectedCount} selected source${selectedCount === 1 ? "" : "s"}${useWeb ? " + the web" : ""}.`
            : "Select documents on the left — or turn on web access — then ask a question."}
        </p>
        <div className="mt-6 flex w-full flex-col gap-2">
          {examples.map((q, i) => (
            <button
              key={q}
              onClick={() => onExample(q)}
              className="rounded-xl border border-line bg-surface/80 px-4 py-3 text-left text-sm text-ink-dim transition-all hover:border-mark/30 hover:bg-mark-dim-2 hover:text-ink"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }
