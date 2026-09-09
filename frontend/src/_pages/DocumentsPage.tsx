"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Search, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import * as documentService from "@/services/documentService";
import { ApiError } from "@/services/http";
import type { DocumentResponse } from "@/utils/types";
import { formatBytes, formatDate, cn } from "@/utils/cn";
import { UploadDropzone } from "@/components/documents/upload-dropzone";
import { StatusBadge } from "@/components/documents/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";

interface PendingUpload {
  id: string;
  filename: string;
  progress: number;
  error?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [toDelete, setToDelete] = useState<DocumentResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  async function loadDocuments() {
    setIsLoading(true);
    try {
      const res = await documentService.listDocuments();
      setDocuments(res.documents);
    } catch {
      toast.error("Couldn't load your documents.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDocuments();
  }, []);

  function handleFilesSelected(files: File[]) {
    files.forEach((file) => {
      const id = `${file.name}-${Date.now()}-${Math.random()}`;
      setPending((prev) => [...prev, { id, filename: file.name, progress: 0 }]);

      documentService
        .uploadDocument(file, (percent) => {
          setPending((prev) =>
            prev.map((p) => (p.id === id ? { ...p, progress: percent } : p))
          );
        })
        .then(() => {
          toast.success(`${file.name} uploaded`);
          setPending((prev) => prev.filter((p) => p.id !== id));
          loadDocuments();
        })
        .catch((err) => {
          const message = err instanceof ApiError ? err.message : "Upload failed.";
          setPending((prev) =>
            prev.map((p) => (p.id === id ? { ...p, error: message } : p))
          );
          toast.error(`${file.name} failed to upload`, { description: message });
        });
    });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      await documentService.deleteDocument(toDelete.id);
      setDocuments((prev) => prev.filter((d) => d.id !== toDelete.id));
      toast.success(`${toDelete.filename} deleted`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't delete document.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setToDelete(null);
    }
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return documents;
    const q = query.toLowerCase();
    return documents.filter((d) => d.filename.toLowerCase().includes(q));
  }, [documents, query]);

  const readyCount = documents.filter((d) => d.status === "processed").length;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="border-b border-line/80 px-6 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-dim">
              Library
            </p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink">
              Your sources
            </h1>
            <p className="mt-1.5 text-sm text-ink-dim">
              {documents.length} files · {readyCount} ready for Studio
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
              <Input
                placeholder="Filter by filename"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setShowUpload((v) => !v)}>
              <UploadCloud className="h-4 w-4" />
              Upload
            </Button>
            <Button variant="mark" asChild>
              <Link href="/chat">Open Studio</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:px-8">
        {showUpload && (
          <div className="mb-8 panel-enter">
            <UploadDropzone onFilesSelected={handleFilesSelected} />
          </div>
        )}

        {pending.length > 0 && (
          <div className="mb-6 flex flex-col gap-2">
            {pending.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm"
              >
                <FileText className="h-4 w-4 shrink-0 text-ink-dim" />
                <span className="flex-1 truncate">{p.filename}</span>
                {p.error ? (
                  <span className="text-xs text-flag">{p.error}</span>
                ) : (
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-paper-inset">
                    <div
                      className="h-full bg-mark transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-20 text-center">
            <FileText className="h-8 w-8 text-ink-dim" />
            <p className="text-sm font-medium text-ink">
              {documents.length === 0 ? "Your library is empty" : "No matches"}
            </p>
            <p className="max-w-sm text-sm text-ink-dim">
              {documents.length === 0
                ? "Upload PDFs, DOCX, or HTML — then chat with them in Studio."
                : "Try a different filename."}
            </p>
            {documents.length === 0 && (
              <Button variant="mark" className="mt-2" onClick={() => setShowUpload(true)}>
                <UploadCloud className="h-4 w-4" />
                Add your first source
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doc, i) => (
              <article
                key={doc.id}
                className={cn(
                  "group relative flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-[0_4px_24px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:border-mark/25 hover:shadow-[0_12px_36px_rgba(15,118,110,0.08)] panel-enter"
                )}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div
                  className="mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r from-mark to-glow"
                  aria-hidden
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper-dim text-mark">
                    <FileText className="h-5 w-5" />
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
                <h3 className="mt-4 line-clamp-2 font-serif text-lg font-semibold leading-snug text-ink">
                  {doc.filename}
                </h3>
                <p className="mt-2 text-xs text-ink-dim">
                  Uploaded {formatDate(doc.upload_date)} ·{" "}
                  <span className="font-mono">{formatBytes(doc.file_size)}</span>
                </p>
                <div className="mt-auto flex items-center justify-end gap-1 pt-5 opacity-80 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={documentService.downloadDocumentUrl(doc.id)} download>
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-flag hover:bg-flag-dim hover:text-flag"
                    onClick={() => setToDelete(doc)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this source?</DialogTitle>
            <DialogDescription>
              {toDelete?.filename} will be removed from your library and will no longer
              be searchable in Studio.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
