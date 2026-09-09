"use client";

import {
  FileText,
  Lightbulb,
  ListChecks,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { Source } from "@/utils/types";

const GUIDES = [
  {
    id: "brief",
    title: "Briefing doc",
    body: "A tight overview of the selected sources.",
    icon: Sparkles,
  },
  {
    id: "faq",
    title: "FAQ",
    body: "Likely questions and grounded answers.",
    icon: Lightbulb,
  },
  {
    id: "outline",
    title: "Study guide",
    body: "Key themes, terms, and takeaways.",
    icon: ListChecks,
  },
];

interface StudioRailProps {
  sources: Source[];
  activeIndex: number | null;
  onSelectSource: (index: number) => void;
  onGuidePrompt: (prompt: string) => void;
}

export function StudioRail({
  sources,
  activeIndex,
  onSelectSource,
  onGuidePrompt,
}: StudioRailProps) {
  return (
    <aside className="panel-enter hidden w-[300px] shrink-0 flex-col border-l border-line/80 bg-surface/90 backdrop-blur-sm xl:flex">
      <div className="border-b border-line/80 px-4 py-4">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-mark" />
          <h2 className="text-sm font-semibold text-ink">Studio</h2>
        </div>
        <p className="mt-1 text-xs text-ink-dim">
          Citations and guided outputs from your sources.
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-dim">
            Guides
          </h3>
          <div className="mt-2 space-y-2">
            {GUIDES.map(({ id, title, body, icon: Icon }, i) => (
              <button
                key={id}
                onClick={() =>
                  onGuidePrompt(
                    id === "brief"
                      ? "Write a concise briefing document based only on the selected sources."
                      : id === "faq"
                        ? "Generate an FAQ with grounded answers from the selected sources."
                        : "Create a study guide outlining key themes and takeaways from the selected sources."
                  )
                }
                className="flex w-full items-start gap-3 rounded-xl border border-line bg-paper-dim/40 px-3 py-3 text-left transition-all hover:border-mark/30 hover:bg-mark-dim-2"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-mark shadow-sm">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-ink">{title}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-dim">
                    {body}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-dim">
            Citations
          </h3>
          <div className="mt-2 space-y-1.5">
            {sources.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs text-ink-dim">
                Passages used in the last answer will show up here.
              </p>
            ) : (
              sources.map((source, i) => (
                <button
                  key={i}
                  onClick={() => onSelectSource(i)}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    activeIndex === i
                      ? "border-mark/40 bg-mark-dim-2"
                      : "border-line bg-surface hover:border-line-strong"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-md px-1 font-mono text-[11px] font-semibold",
                        activeIndex === i
                          ? "bg-mark text-surface"
                          : "bg-paper-inset text-ink-dim"
                      )}
                    >
                      {i + 1}
                    </span>
                    <FileText className="h-3.5 w-3.5 shrink-0 text-ink-dim" />
                    <span className="truncate text-xs font-medium text-ink">
                      {source.document_name}
                    </span>
                  </div>
                  <div className="flex gap-3 pl-7 font-mono text-[10px] text-ink-dim">
                    {typeof source.page === "number" && <span>p. {source.page}</span>}
                    {typeof source.score === "number" && (
                      <span>{(source.score * 100).toFixed(0)}% match</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
