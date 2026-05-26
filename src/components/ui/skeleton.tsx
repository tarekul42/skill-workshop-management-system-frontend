import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * §1.5 — Skeleton shimmer: 1.8s linear infinite
 * Uses .animate-shimmer from globals.css @layer components
 * Background: gradient moves left-to-right across surface-2 → surface-3
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="skeleton" className={cn("animate-shimmer rounded-lg", className)} {...props} />
  );
}

export { Skeleton };
