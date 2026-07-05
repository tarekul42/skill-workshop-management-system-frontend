import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: boolean;
}

function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      aria-invalid={error || undefined}
      className={cn(
        "border-border bg-background font-body placeholder:text-foreground-muted focus:border-primary focus:ring-primary/12 disabled:bg-surface-3 flex min-h-30 w-full resize-y rounded-[10px] border-[1.5px] px-3.5 py-3 text-[15px] transition-[border-color,box-shadow] duration-150 focus:ring-[3px] focus:outline-none disabled:cursor-not-allowed disabled:opacity-65",
        error && "border-danger focus:ring-danger/10",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
