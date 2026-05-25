"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import {
  FileQuestion,
  Library,
  GraduationCap,
  Receipt,
  Users,
  Calendar,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Props ──────────────────────────────────────────────────────────

type EmptyStateVariant =
  | "workshops"
  | "enrollments"
  | "payments"
  | "users"
  | "calendar"
  | "default";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig: Record<
  EmptyStateVariant,
  { icon: LucideIcon; color: string }
> = {
  workshops: { icon: Library, color: "text-primary" },
  enrollments: { icon: GraduationCap, color: "text-accent" },
  payments: { icon: Receipt, color: "text-success" },
  users: { icon: Users, color: "text-info" },
  calendar: { icon: Calendar, color: "text-warning" },
  default: { icon: FileQuestion, color: "text-foreground-disabled" },
};

// ─── Component ──────────────────────────────────────────────────────

export function EmptyState({
  variant = "default",
  icon: CustomIcon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = CustomIcon ?? config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-24 px-8 text-center animate-fade-in max-w-lg mx-auto",
        className,
      )}
    >
      {/* Illustration Area */}
      <div className="relative mb-10">
        <div className="absolute inset-0 scale-[2] blur-[64px] opacity-20 bg-primary/30 rounded-full animate-pulse" />
        <div className="glass relative flex size-28 items-center justify-center rounded-[40px] shadow-3 transition-transform hover:scale-105 duration-500 group">
          <Icon
            className={cn(
              "size-12 transition-transform group-hover:scale-110",
              config.color,
            )}
          />
          <div className="absolute -bottom-2 -right-2 size-10 rounded-full bg-surface-2 border border-border flex items-center justify-center shadow-lg">
            <AlertCircle className="size-5 text-foreground-disabled" />
          </div>
        </div>
      </div>

      {/* Typography */}
      <h3 className="font-display text-3xl font-extrabold text-foreground tracking-tight mb-4">
        {title}
      </h3>

      {description && (
        <p className="text-base text-foreground-subtle leading-relaxed mb-12 max-w-[340px]">
          {description}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-4 w-full sm:w-auto sm:min-w-[240px]">
        {action && (
          <Button
            size="lg"
            className="h-14 rounded-2xl font-bold px-8 shadow-raised transition-all hover:shadow-float active:scale-[0.98]"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}

        {secondaryAction && (
          <Button
            variant="ghost"
            className="h-12 rounded-xl font-bold text-foreground-disabled hover:text-foreground transition-colors uppercase tracking-widest text-[11px]"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
