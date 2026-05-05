"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
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

  if (["PENDING", "PENDINGPAYMENT", "PENDINGREVIEW", "PENDINGAPPROVAL"].includes(normalized)) {
    return "warning";
  }

  if (["COMPLETE", "COMPLETED", "PAID", "ACTIVE", "APPROVED", "VERIFIED", "SUCCESS", "PUBLISHED"].includes(normalized)) {
    return "success";
  }

  if (["CANCEL", "CANCELLED", "CANCELED", "INACTIVE", "BLOCKED", "FAILED", "REJECTED"].includes(normalized)) {
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

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const category = getStatusCategory(status);

  // Map internal categories to UI badge variants
  const variantMap: Record<StatusCategory, any> = {
    warning: "warning",
    success: "success",
    danger: "danger",
    muted: "muted",
    info: "info",
    default: "secondary",
  };

  return (
    <Badge 
      variant={variantMap[category]} 
      className={cn("font-bold uppercase tracking-wider text-[10px] px-2 py-0.5", className)}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
