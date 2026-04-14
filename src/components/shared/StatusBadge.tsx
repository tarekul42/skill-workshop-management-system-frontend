"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Props ──────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: string;
  className?: string;
}

// ─── Status Color Map ───────────────────────────────────────────────

type StatusCategory =
  | "pending"
  | "success"
  | "danger"
  | "warning"
  | "neutral"
  | "info";

function getStatusCategory(status: string): StatusCategory {
  const normalized = status.toUpperCase().replace(/[\s_-]/g, "");

  if (
    ["PENDING", "PENDINGPAYMENT", "PENDINGREVIEW", "PENDINGAPPROVAL"].includes(
      normalized,
    )
  ) {
    return "pending";
  }

  if (
    [
      "COMPLETE",
      "COMPLETED",
      "PAID",
      "ACTIVE",
      "APPROVED",
      "VERIFIED",
      "SUCCESS",
      "PUBLISHED",
      "CONFIRMED",
    ].includes(normalized)
  ) {
    return "success";
  }

  if (
    [
      "CANCEL",
      "CANCELLED",
      "CANCELED",
      "INACTIVE",
      "BLOCKED",
      "FAILED",
      "REJECTED",
      "EXPIRED",
      "SUSPENDED",
      "DELETED",
    ].includes(normalized)
  ) {
    return "danger";
  }

  if (["UNPAID", "DRAFT", "PARTIAL", "OVERDUE"].includes(normalized)) {
    return "warning";
  }

  if (["REFUNDED", "PROCESSING", "REFUND"].includes(normalized)) {
    return "info";
  }

  return "neutral";
}

const statusStyles: Record<StatusCategory, string> = {
  pending:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  danger:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/50 dark:text-red-400",
  warning:
    "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
  neutral:
    "border-gray-300 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400",
  info: "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
};

// ─── Component ──────────────────────────────────────────────────────

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const category = getStatusCategory(status);

  return (
    <Badge variant="outline" className={cn(statusStyles[category], className)}>
      {status}
    </Badge>
  );
}
