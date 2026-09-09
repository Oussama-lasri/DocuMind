import * as React from "react";
import { cn } from "@/utils/cn";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full resize-none rounded-md border border-line-strong bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-dim/70 focus-visible:outline-none focus-visible:border-mark focus-visible:ring-1 focus-visible:ring-mark disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
