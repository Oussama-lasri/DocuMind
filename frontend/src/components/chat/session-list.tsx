import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/utils/cn";
import type { ChatSession } from "@/utils/types";
import { Button } from "@/components/ui/button";

interface SessionListProps {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function SessionList({ sessions, activeId, onSelect, onNew, onDelete }: SessionListProps) {
  return (
    <div className="flex w-64 shrink-0 flex-col border-r border-line px-3 py-6">
      <Button variant="outline" size="sm" className="justify-start gap-2" onClick={onNew}>
        <Plus className="h-4 w-4" />
        New chat
      </Button>

      <div className="mt-4 flex flex-col gap-0.5 overflow-y-auto">
        {sessions.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-ink-dim">
            Your conversations will appear here.
          </p>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group flex items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors",
              activeId === session.id ? "bg-paper-inset" : "hover:bg-paper-dim"
            )}
          >
            <button
              onClick={() => onSelect(session.id)}
              className="flex flex-1 items-center gap-2 overflow-hidden text-left"
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-ink-dim" />
              <span className="flex flex-col overflow-hidden">
                <span className="truncate text-sm text-ink">{session.title}</span>
                <span className="text-[11px] text-ink-dim">
                  {formatDate(session.createdAt)}
                </span>
              </span>
            </button>
            <button
              onClick={() => onDelete(session.id)}
              className="shrink-0 text-ink-dim opacity-0 transition-opacity hover:text-flag group-hover:opacity-100"
              aria-label="Delete conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
