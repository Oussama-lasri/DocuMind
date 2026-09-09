import { BookOpenText } from "lucide-react";
import { cn, formatTime } from "@/utils/cn";
import type { ChatMessage } from "@/utils/types";

interface MessageBubbleProps {
  message: ChatMessage;
  activeSourceIndex: number | null;
  onCiteClick: (index: number) => void;
}

export function MessageBubble({ message, activeSourceIndex, onCiteClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-1.5 panel-enter", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[40rem] rounded-2xl px-4 py-3.5 text-[15px] leading-relaxed",
          isUser
            ? "bg-ink text-surface shadow-sm"
            : "border border-line bg-surface text-ink shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
            <BookOpenText className="h-3.5 w-3.5 text-ink-dim" />
            {message.sources.map((source, i) => (
              <button
                key={i}
                onClick={() => onCiteClick(i)}
                className={cn(
                  "flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 font-mono text-[11px] font-semibold transition-colors",
                  activeSourceIndex === i
                    ? "bg-mark text-surface"
                    : "bg-mark-dim-2 text-mark-strong hover:bg-mark-dim"
                )}
                title={source.document_name}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-1 text-xs text-ink-dim">
        {!isUser && message.agentUsed && (
          <span className="rounded-full bg-paper-inset px-2 py-0.5 font-mono text-[10px]">
            {message.agentUsed}
          </span>
        )}
        <span>{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
