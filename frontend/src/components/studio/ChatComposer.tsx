"use client";

import { useRef } from "react";
import { ArrowUp, Globe, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  selectedCount: number;
  useWeb: boolean;
  onToggleUseWeb: () => void;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  selectedCount,
  useWeb,
  onToggleUseWeb,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSubmit();
    }
  }

  return (
    <div className="rounded-2xl border border-line-strong/80 bg-surface p-2 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-shadow focus-within:border-mark/50 focus-within:shadow-[0_12px_40px_rgba(15,118,110,0.12)]">
      <Textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your selected sources…"
        disabled={disabled}
        className="max-h-40 min-h-11 flex-1 border-0 bg-transparent px-3 py-2.5 text-[15px] shadow-none focus-visible:ring-0"
        style={{ height: "auto" }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
        }}
      />

      <div className="flex items-center justify-between gap-2 px-1.5 pb-1 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-dim px-2.5 py-1 text-[11px] font-medium text-ink-dim">
            <Layers className="h-3 w-3" />
            {selectedCount} source{selectedCount === 1 ? "" : "s"}
          </span>
          <button
            type="button"
            onClick={onToggleUseWeb}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              useWeb
                ? "bg-mark text-surface"
                : "bg-paper-dim text-ink-dim hover:bg-paper-inset"
            )}
          >
            <Globe className="h-3 w-3" />
            Web {useWeb ? "on" : "off"}
          </button>
        </div>

        <Button
          size="icon"
          variant="mark"
          disabled={disabled || !value.trim()}
          onClick={onSubmit}
          aria-label="Send message"
          className="h-9 w-9 rounded-full"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
