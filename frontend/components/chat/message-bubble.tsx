import { BookOpenText } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  activeSourceIndex: number | null;
  onCiteClick: (index: number) => void;
}

export function MessageBubble({ message, activeSourceIndex, onCiteClick }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[38rem] rounded-lg px-4 py-3 text-[15px] leading-relaxed",
          isUser
            ? "bg-ink text-paper"
            : "border border-line bg-paper text-ink"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
            <BookOpenText className="h-3.5 w-3.5 text-ink-dim" />
            {message.sources.map((source, i) => (
              <button
                key={i}
                onClick={() => onCiteClick(i)}
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-sm px-1 font-mono text-[11px] font-medium transition-colors",
                  activeSourceIndex === i
                    ? "bg-mark text-paper"
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
          <span className="font-mono">{message.agentUsed}</span>
        )}
        <span>{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
