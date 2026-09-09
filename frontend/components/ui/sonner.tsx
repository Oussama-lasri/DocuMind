"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-md border border-line bg-paper text-ink shadow-[0_8px_24px_rgba(27,36,48,0.12)] font-sans",
          description: "text-ink-dim",
          actionButton: "bg-mark text-paper",
          cancelButton: "bg-paper-dim text-ink-dim",
          error: "border-flag/30",
          success: "border-verified/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
