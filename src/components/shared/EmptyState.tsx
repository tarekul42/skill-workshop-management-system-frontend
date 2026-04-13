"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Props ──────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Comp = Icon ?? FileQuestion;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
        <Comp className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
