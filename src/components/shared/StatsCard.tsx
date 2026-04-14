"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { TrendingUp, TrendingDown } from "lucide-react";

// ─── Props ──────────────────────────────────────────────────────────

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

// ─── Skeleton ───────────────────────────────────────────────────────

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-9 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2 h-3 w-36" />
      </CardContent>
    </Card>
  );
}

// ─── Component ──────────────────────────────────────────────────────

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  isLoading = false,
  className,
}: StatsCardProps) {
  if (isLoading) {
    return <StatsCardSkeleton />;
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                trend.isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
        {(description || trend) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {description || (trend && "from last period")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
