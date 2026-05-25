"use client";

import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <button
      onClick={() => typeof window !== "undefined" && window.history.back()}
      className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="size-3.5" />
      Go back to previous page
    </button>
  );
}
