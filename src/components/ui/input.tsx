import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

function Input({ className, type, error, ...props }: InputProps) {
  return (
    <input
      type={type}
      aria-invalid={error || undefined}
      className={cn(
        "border-border bg-background font-body placeholder:text-foreground-muted focus:border-primary focus:ring-primary/12 disabled:bg-surface-3 flex h-11 w-full rounded-[10px] border-[1.5px] px-3.5 py-0 text-[15px] transition-[border-color,box-shadow] duration-150 focus:ring-[3px] focus:outline-none disabled:cursor-not-allowed disabled:opacity-65",
        error && "border-danger focus:ring-danger/10",
        className
      )}
      {...props}
    />
  );
}

export { Input };
