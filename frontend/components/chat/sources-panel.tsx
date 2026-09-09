import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Source } from "@/lib/types";

interface SourcesPanelProps {
  sources: Source[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
}

export function SourcesPanel({ sources, activeIndex, onSelect }: SourcesPanelProps) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-line bg-paper-dim px-4 py-6 lg:flex">
      <h3 className="font-serif text-sm font-semibold text-ink">Sources</h3>
      <p className="mt-1 text-xs text-ink-dim">
        The passages DocuMind used to ground its last answer.
      </p>

      <div className="mt-4 flex flex-col gap-2 overflow-y-auto">
        {sources.length === 0 ? (
          <p className="mt-6 text-center text-xs text-ink-dim">
            Sources for the assistant&apos;s next answer will appear here.
          </p>
        ) : (
          sources.map((source, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={cn(
                "flex flex-col gap-1 rounded-md border px-3 py-2.5 text-left transition-colors",
                activeIndex === i
                  ? "border-mark bg-mark-dim-2"
                  : "border-line bg-paper hover:border-line-strong"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm font-mono text-[10px] font-medium",
                    activeIndex === i ? "bg-mark text-paper" : "bg-paper-inset text-ink-dim"
                  )}
                >
                  {i + 1}
                </span>
                <FileText className="h-3.5 w-3.5 shrink-0 text-ink-dim" />
                <span className="truncate text-xs font-medium text-ink">
                  {source.document_name}
                </span>
              </div>
              <div className="flex gap-3 pl-6 font-mono text-[11px] text-ink-dim">
                {typeof source.page === "number" && <span>p. {source.page}</span>}
                {typeof source.score === "number" && (
                  <span>match {(source.score * 100).toFixed(0)}%</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
