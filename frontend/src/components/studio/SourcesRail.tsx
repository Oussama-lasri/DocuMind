"use client";

import { useRef, useState } from "react";
import {
  Check,
  FileText,
  Globe,
  Link2,
  Loader2,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import { cn, formatBytes } from "@/utils/cn";
import type { DocumentResponse } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/documents/status-badge";

export interface WebSource {
  id: string;
  url: string;
  selected: boolean;
}

interface SourcesRailProps {
  documents: DocumentResponse[];
  selectedIds: Set<string>;
  webSources: WebSource[];
  useWeb: boolean;
  isLoading?: boolean;
  onToggleDoc: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onToggleUseWeb: () => void;
  onAddWebUrl: (url: string) => void;
  onToggleWebSource: (id: string) => void;
  onRemoveWebSource: (id: string) => void;
  onUploadFiles: (files: File[]) => void;
}




export function SourcesRail({
  documents,
  selectedIds,
  webSources,
  useWeb,
  isLoading,
  onToggleDoc,
  onSelectAll,
  onClearAll,
  onToggleUseWeb,
  onAddWebUrl,
  onToggleWebSource,
  onRemoveWebSource,
  onUploadFiles,
}: SourcesRailProps) {
  const [urlDraft, setUrlDraft] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [sourceMode, setSourceMode] = useState<"documents" | "web">("documents");
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const readyDocs = documents.filter((d) => d.status === "completed" || d.status === "processing");
  const filteredDocs = readyDocs.filter((doc) => {
    console.log("Filtering document:", doc.filename, "with query:", query)
    return doc.filename.toLowerCase().includes(query.trim().toLowerCase())
  });
  const selectedCount = selectedIds.size + webSources.filter((w) => w.selected).length;

  function submitUrl(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    try {
      // Normalize — accept bare domains
      const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      new URL(normalized);
      onAddWebUrl(normalized);
      setUrlDraft("");
      setShowUrl(false);
    } catch {
      // leave draft; parent can toast if needed
    }
  }

  return (
    <aside className="panel-enter flex w-[280px] shrink-0 flex-col border-r border-line/80 bg-surface/90 backdrop-blur-sm">
      <div className="border-b border-line/80 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink">Sources</h2>
            <p className="mt-0.5 text-xs text-ink-dim">
              {selectedCount} selected for this chat
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onSelectAll}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-mark-strong hover:bg-mark-dim-2"
            >
              All
            </button>
            <button
              onClick={onClearAll}
              className="rounded-md px-2 py-1 text-[11px] font-medium text-ink-dim hover:bg-paper-dim"
            >
              None
            </button>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 justify-center"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
          <Button
            size="sm"
            variant={showUrl ? "mark" : "outline"}
            className="flex-1 justify-center"
            onClick={() => {
              setSourceMode("web");
              setShowUrl((v) => !v);
            }}
          >
            <Globe className="h-3.5 w-3.5" />
            Web
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.docx,.html,.htm"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) onUploadFiles(files);
              e.target.value = "";
            }}
          />
        </div>

        {showUrl && (
          <form onSubmit={submitUrl} className="mt-3 flex gap-2">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://…"
              className="h-8 text-xs"
            />
            <Button type="submit" size="icon" className="h-8 w-8 shrink-0" variant="mark">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="mb-3 grid grid-cols-2 rounded-xl bg-paper-dim p-1">
          <button
            onClick={() => setSourceMode("documents")}
            className={cn(
              "rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors",
              sourceMode === "documents" ? "bg-surface text-ink shadow-sm" : "text-ink-dim"
            )}
          >
            Documents
          </button>
          <button
            onClick={() => setSourceMode("web")}
            className={cn(
              "rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors",
              sourceMode === "web" ? "bg-surface text-ink shadow-sm" : "text-ink-dim"
            )}
          >
            Web search
          </button>
        </div>

        {sourceMode === "web" && (
          <button
            onClick={onToggleUseWeb}
            className={cn(
              "mb-3 flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
              useWeb
                ? "border-mark/40 bg-mark-dim-2 shadow-[0_0_0_1px_rgba(15,118,110,0.08)]"
                : "border-line bg-paper-dim/60 hover:border-line-strong"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                useWeb ? "bg-mark text-surface" : "bg-surface text-ink-dim"
              )}
            >
              <Globe className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-ink">Use the open web</span>
              <span className="block text-[11px] text-ink-dim">
                Add trusted links to this conversation
              </span>
            </span>
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border",
                useWeb ? "border-mark bg-mark text-surface" : "border-line-strong bg-surface"
              )}
            >
              {useWeb && <Check className="h-3 w-3" />}
            </span>
          </button>
        )}

        {sourceMode === "web" && webSources.length > 0 && (
          <div className="mb-3 space-y-1.5">
            <p className="px-1 text-[11px] font-medium uppercase tracking-wide text-ink-dim">
              Web links
            </p>
            {webSources.map((source) => (
              <div
                key={source.id}
                className={cn(
                  "group flex items-center gap-2 rounded-xl border px-2.5 py-2 transition-colors",
                  source.selected
                    ? "border-mark/30 bg-mark-dim-2"
                    : "border-line bg-surface hover:border-line-strong"
                )}
              >
                <button
                  onClick={() => onToggleWebSource(source.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      source.selected
                        ? "border-mark bg-mark text-surface"
                        : "border-line-strong"
                    )}
                  >
                    {source.selected && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-ink-dim" />
                  <span className="truncate text-xs text-ink">{source.url}</span>
                </button>
                <button
                  onClick={() => onRemoveWebSource(source.id)}
                  className="shrink-0 text-ink-dim opacity-0 transition-opacity hover:text-flag group-hover:opacity-100"
                  aria-label="Remove URL"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {sourceMode === "documents" && (
          <div className="mb-2">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-dim">
                Your documents
              </p>
              <span className="font-mono text-[10px] text-ink-dim">
                {selectedIds.size}/{readyDocs.length}
              </span>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-dim" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a source"
                className="h-8 border-line bg-paper-dim/60 pl-8 text-xs"
              />
            </div>
          </div>
        )}

        {sourceMode === "web" ? (
          webSources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-strong bg-paper-dim/50 px-4 py-8 text-center">
              <Globe className="mx-auto h-6 w-6 text-ink-dim" />
              <p className="mt-2 text-sm font-medium text-ink">Bring in the web</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-dim">
                Turn on web access, then add a URL you want DocuMind to use.
              </p>
            </div>
          ) : null
        ) : isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-dim">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : sourceMode === "documents" && readyDocs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong bg-paper-dim/50 px-4 py-8 text-center">
            <FileText className="mx-auto h-6 w-6 text-ink-dim" />
            <p className="mt-2 text-sm font-medium text-ink">No sources yet</p>
            <p className="mt-1 text-xs text-ink-dim">
              Upload a PDF, DOCX, or HTML — or add a web link.
            </p>
          </div>
        ) : sourceMode === "documents" && filteredDocs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center">
            <Search className="mx-auto h-5 w-5 text-ink-dim" />
            <p className="mt-2 text-xs text-ink-dim">No documents match that search.</p>
          </div>
        ) : sourceMode === "documents" ? (
          <div className="space-y-1.5">
            {filteredDocs.map((doc) => {
              const selected = selectedIds.has(doc.id);
              console.log("Rendering document:", doc.filename, "Selected:", selected, "Query:", query);
              return (
                <button
                  key={doc.id}
                  onClick={() => onToggleDoc(doc.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl border px-2.5 py-2.5 text-left transition-all",
                    selected
                      ? "border-mark/35 bg-mark-dim-2"
                      : "border-line bg-surface hover:border-line-strong"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      selected
                        ? "border-mark bg-mark text-surface"
                        : "border-line-strong bg-surface"
                    )}
                  >
                    {selected && <Check className="h-2.5 w-2.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-ink-dim" />
                      <span className="truncate text-sm font-medium text-ink">
                        {doc.filename}
                      </span>
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <StatusBadge status={doc.status} />
                      <span className="font-mono text-[10px] text-ink-dim">
                        {formatBytes(doc.file_size)}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
