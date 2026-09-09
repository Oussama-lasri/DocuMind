"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as api from "@/lib/api";
import type { DocumentResponse } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";
import { UploadDropzone } from "@/components/documents/upload-dropzone";
import { StatusBadge } from "@/components/documents/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

  async function loadDocuments() {
    setIsLoading(true);
    try {
      const res = await api.listDocuments();
      setDocuments(res.documents);
    } catch {
      toast.error("Couldn't load your documents.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Initial fetch on mount — the recommended pattern is still an effect
    // here since this synchronizes with the server, not derived local state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDocuments();
  }, []);

  function handleFilesSelected(files: File[]) {
    files.forEach((file) => {
      const id = `${file.name}-${Date.now()}-${Math.random()}`;
      setPending((prev) => [...prev, { id, filename: file.name, progress: 0 }]);

      api
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
          const message = err instanceof api.ApiError ? err.message : "Upload failed.";
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
      await api.deleteDocument(toDelete.id);
      setDocuments((prev) => prev.filter((d) => d.id !== toDelete.id));
      toast.success(`${toDelete.filename} deleted`);
    } catch (err) {
      const message = err instanceof api.ApiError ? err.message : "Couldn't delete document.";
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

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <header className="border-b border-line px-8 py-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">Documents</h1>
        <p className="mt-1 text-sm text-ink-dim">
          Everything you upload here becomes searchable in Chat.
        </p>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 px-8 py-8">
        <UploadDropzone onFilesSelected={handleFilesSelected} />

        {pending.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {pending.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-md border border-line bg-paper px-3 py-2 text-sm"
              >
                <FileText className="h-4 w-4 shrink-0 text-ink-dim" />
                <span className="flex-1 truncate">{p.filename}</span>
                {p.error ? (
                  <span className="text-xs text-flag">{p.error}</span>
                ) : (
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-paper-inset">
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

        <div className="mt-8 flex items-center justify-between gap-4">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Your library{" "}
            <span className="font-sans text-sm font-normal text-ink-dim">
              ({documents.length})
            </span>
          </h2>
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
            <Input
              placeholder="Filter by filename"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-line">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-5">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <FileText className="h-8 w-8 text-ink-dim" />
              <p className="text-sm font-medium text-ink">
                {documents.length === 0 ? "No documents yet" : "No matches"}
              </p>
              <p className="max-w-xs text-sm text-ink-dim">
                {documents.length === 0
                  ? "Upload a PDF, DOCX, or HTML file above to start building your knowledge base."
                  : "Try a different filename."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Filename</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="pl-5 font-medium text-ink">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 shrink-0 text-ink-dim" />
                        <span className="truncate">{doc.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-ink-dim">{formatDate(doc.upload_date)}</TableCell>
                    <TableCell className="font-mono text-xs text-ink-dim">
                      {formatBytes(doc.file_size)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={api.downloadDocumentUrl(doc.id)} download>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this document?</DialogTitle>
            <DialogDescription>
              {toDelete?.filename} will be removed from your library and its indexed
              chunks will no longer be searchable. This can&apos;t be undone.
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
