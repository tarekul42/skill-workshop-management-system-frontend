"use client";

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

const variantConfig: Record<EmptyStateVariant, { icon: LucideIcon; color: string }> = {
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
        "animate-fade-in mx-auto flex max-w-lg flex-col items-center justify-center px-8 py-24 text-center",
        className
      )}
    >
      {/* Illustration Area */}
      <div className="relative mb-10">
        <div className="bg-primary/30 absolute inset-0 scale-[2] animate-pulse rounded-full opacity-20 blur-3xl" />
        <div className="glass shadow-3 group relative flex size-28 items-center justify-center rounded-[40px] transition-transform duration-500 hover:scale-105">
          <Icon
            className={cn("size-12 transition-transform group-hover:scale-110", config.color)}
          />
          <div className="bg-surface-2 border-border absolute -right-2 -bottom-2 flex size-10 items-center justify-center rounded-full border shadow-lg">
            <AlertCircle className="text-foreground-disabled size-5" />
          </div>
        </div>
      </div>

      {/* Typography */}
      <h3 className="font-display text-foreground mb-4 text-3xl font-extrabold tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-foreground-subtle mb-12 max-w-85 text-base leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      <div className="flex w-full flex-col gap-4 sm:w-auto sm:min-w-60">
        {action && (
          <Button
            size="lg"
            className="shadow-raised hover:shadow-float h-14 rounded-2xl px-8 font-bold transition-all active:scale-[0.98]"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}

        {secondaryAction && (
          <Button
            variant="ghost"
            className="text-foreground-disabled hover:text-foreground h-12 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-colors"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
