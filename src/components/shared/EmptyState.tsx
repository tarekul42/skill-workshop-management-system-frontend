"use client";

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
        "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/30 py-16 text-center animate-fade-in",
        className,
      )}
    >
      <div className="flex size-20 items-center justify-center rounded-full bg-background shadow-sm border mb-5 transition-transform hover:scale-105 duration-300">
        <Comp className="size-8 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button
          className="mt-8 transition-all hover:shadow-lg active:scale-95"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
