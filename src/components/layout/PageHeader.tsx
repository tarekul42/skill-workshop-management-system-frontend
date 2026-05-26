"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ─── Props ──────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-foreground-subtle mt-2 text-base leading-relaxed">{description}</p>
        )}
      </div>

      {children && <div className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0">{children}</div>}
    </div>
  );
}
