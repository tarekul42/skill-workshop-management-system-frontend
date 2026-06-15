"use client";

import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────

type IconVariant = "primary" | "success" | "accent" | "warning" | "info" | "danger";

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
  iconVariant?: IconVariant;
}

// ─── Icon Variant Classes ────────────────────────────────────────────

const iconVariantClasses: Record<IconVariant, { container: string; icon: string }> = {
  primary: { container: "bg-primary-subtle", icon: "text-primary" },
  success: { container: "bg-success-subtle", icon: "text-success" },
  accent: { container: "bg-accent-subtle", icon: "text-accent-foreground" },
  warning: { container: "bg-warning-subtle", icon: "text-warning" },
  info: { container: "bg-info-subtle", icon: "text-info" },
  danger: { container: "bg-danger-subtle", icon: "text-danger" },
};

// ─── Skeleton ───────────────────────────────────────────────────────

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-11 rounded-xl" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-24" />
        <Skeleton className="mt-2 h-3 w-36" />
      </CardContent>
    </Card>
  );
}

// ─── Animated Counter ────────────────────────────────────────────────

function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(count, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
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
  iconVariant = "primary",
}: StatsCardProps) {
  if (isLoading) return <StatsCardSkeleton />;

  const variantClasses = iconVariantClasses[iconVariant];

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {title}
          </p>
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              variantClasses.container
            )}
          >
            <Icon className={cn("size-5", variantClasses.icon)} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-display text-foreground text-4xl font-extrabold">
          {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
        </div>
        {trend && (
          <span
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-sm font-semibold",
              trend.isPositive ? "text-success" : "text-danger"
            )}
          >
            {trend.isPositive ? "↑" : "↓"}
            {trend.isPositive ? "+" : ""}
            {trend.value} this month
          </span>
        )}
        {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
      </CardContent>
    </Card>
  );
}
