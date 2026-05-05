"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  /** Show a leading 6px colored dot (§1.3 Dot variant) */
  dot?: boolean;
  className?: string;
}

type StatusCategory =
  | "warning"
  | "success"
  | "danger"
  | "muted"
  | "info"
  | "default";

function getStatusCategory(status: string): StatusCategory {
  const normalized = status.toUpperCase().replace(/[\s_-]/g, "");

  if (
    ["PENDING", "PENDINGPAYMENT", "PENDINGREVIEW", "PENDINGAPPROVAL"].includes(
      normalized,
    )
  ) {
    return "warning";
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
    ].includes(normalized)
  ) {
    return "danger";
  }

  if (["DRAFT", "UNPAID", "PARTIAL"].includes(normalized)) {
    return "muted";
  }

  if (["REFUNDED", "PROCESSING", "REFUND"].includes(normalized)) {
    return "info";
  }

  return "default";
}

/** §1.3 — Status Badge dot color map (matches category → foreground token) */
const dotColorMap: Record<StatusCategory, string> = {
  warning: "bg-warning",
  success: "bg-success",
  danger: "bg-danger",
  muted: "bg-foreground-muted",
  info: "bg-info",
  default: "bg-foreground-subtle",
};

const variantMap: Record<
  StatusCategory,
  "warning" | "success" | "danger" | "muted" | "info" | "secondary"
> = {
  warning: "warning",
  success: "success",
  danger: "danger",
  muted: "muted",
  info: "info",
  default: "secondary",
};

export function StatusBadge({
  status,
  dot = false,
  className,
}: StatusBadgeProps) {
  const category = getStatusCategory(status);

  return (
    <Badge
      variant={variantMap[category]}
      className={cn(
        "font-bold uppercase tracking-wider text-[10px] px-2 py-0.5",
        className,
      )}
    >
      {/* §1.3 — Dot variant: prepend a 6px circle in the matching foreground color */}
      {dot && (
        <span
          className={cn(
            "inline-block size-1.5 shrink-0 rounded-full",
            dotColorMap[category],
          )}
          aria-hidden="true"
        />
      )}
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
