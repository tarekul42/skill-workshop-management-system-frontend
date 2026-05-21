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
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Props ──────────────────────────────────────────────────────────

type EmptyStateVariant = "workshops" | "enrollments" | "payments" | "users" | "calendar" | "default";

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
        "flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in max-w-md mx-auto",
        className,
      )}
    >
      {/* Illustration Area */}
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-150 blur-3xl opacity-20 bg-primary/30 rounded-full" />
        <div className="relative flex size-24 items-center justify-center rounded-[32px] bg-surface-1 shadow-raised border border-border transition-transform hover:scale-105 duration-500">
          <Icon className={cn("size-10", config.color)} />
          <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-surface-2 border border-border flex items-center justify-center shadow-sm">
             <AlertCircle className="size-4 text-foreground-disabled" />
          </div>
        </div>
      </div>

      {/* Typography */}
      <h3 className="font-display text-2xl font-bold text-foreground tracking-tight mb-3">
        {title}
      </h3>
      
      {description && (
        <p className="text-[15px] text-foreground-muted leading-relaxed mb-10 max-w-[320px]">
          {description}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full sm:w-auto sm:min-w-[200px]">
        {action && (
          <Button
            size="lg"
            className="rounded-2xl font-bold h-12 shadow-raised transition-all hover:shadow-float active:scale-95"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button
            variant="ghost"
            className="rounded-xl font-bold text-foreground-muted hover:text-foreground h-11"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
