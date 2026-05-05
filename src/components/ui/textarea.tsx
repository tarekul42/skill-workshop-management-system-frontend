import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: boolean;
}

function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full min-h-30 rounded-[10px] border-[1.5px] border-border bg-background px-3.5 py-3 text-[15px] font-body transition-[border-color,box-shadow] duration-150 placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/12 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:opacity-65 resize-y",
        error && "border-danger focus:ring-danger/10",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
