import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-line-strong bg-paper px-3 py-1 text-sm text-ink shadow-none transition-colors placeholder:text-ink-dim/70 focus-visible:outline-none focus-visible:border-mark focus-visible:ring-1 focus-visible:ring-mark disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
