"use client";

import { useRef } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2 rounded-lg border border-line-strong bg-paper p-2 shadow-[0_2px_10px_rgba(27,36,48,0.06)] focus-within:border-mark focus-within:ring-1 focus-within:ring-mark">
      <Textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your documents…"
        disabled={disabled}
        className="max-h-40 min-h-9 flex-1 border-0 px-2 py-1.5 shadow-none focus-visible:ring-0"
        style={{ height: "auto" }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
        }}
      />
      <Button
        size="icon"
        variant="mark"
        disabled={disabled || !value.trim()}
        onClick={onSubmit}
        aria-label="Send message"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}
