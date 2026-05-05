import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

function Input({ className, type, error, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-[10px] border-[1.5px] border-border bg-background px-3.5 py-0 text-[15px] font-body transition-[border-color,box-shadow] duration-150 placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/12 disabled:cursor-not-allowed disabled:bg-surface-3 disabled:opacity-65",
        error && "border-danger focus:ring-danger/10",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
