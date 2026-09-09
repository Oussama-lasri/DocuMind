import { CheckCircle2, Loader2, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/lib/types";

const STATUS_MAP: Record<
  string,
  { label: string; variant: "verified" | "pending" | "flag" | "default"; icon: React.ElementType }
> = {
  processed: { label: "Processed", variant: "verified", icon: CheckCircle2 },
  processing: { label: "Processing", variant: "pending", icon: Loader2 },
  failed: { label: "Failed", variant: "flag", icon: XCircle },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const entry = STATUS_MAP[status] ?? { label: status, variant: "default" as const, icon: HelpCircle };
  const Icon = entry.icon;
  return (
    <Badge variant={entry.variant}>
      <Icon className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} />
      {entry.label}
    </Badge>
  );
}
