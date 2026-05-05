import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border-[1.5px] border-border bg-background px-4 py-2 text-sm transition-all placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
