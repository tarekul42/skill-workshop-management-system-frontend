"use client";

import { useState } from "react";
import { Trash, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Props ──────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading?: boolean;
  variant?: "default" | "destructive";
  confirmLabel?: string;
  cancelLabel?: string;
  requireConfirmText?: string;
}

// ─── Icon config ─────────────────────────────────────────────────────

const iconConfig = {
  destructive: {
    containerClass: "bg-danger-subtle",
    Icon: Trash,
    iconClass: "text-danger",
  },
  default: {
    containerClass: "bg-warning-subtle",
    Icon: XCircle,
    iconClass: "text-warning",
  },
} as const;

// ─── Component ──────────────────────────────────────────────────────

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
  variant = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  requireConfirmText,
}: ConfirmDialogProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const isDestructive = variant === "destructive";
  const config = iconConfig[variant];

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setConfirmInput("");
    onOpenChange(nextOpen);
  };

  const isConfirmDisabled =
    isLoading ||
    (requireConfirmText !== undefined && confirmInput !== requireConfirmText);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[440px] rounded-[32px] p-8 shadow-4">
        <DialogHeader className="items-center text-center">
          {/* Icon container */}
          <div
            className={cn(
              "mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl shadow-sm ring-1 ring-white/20 transition-transform duration-500 hover:scale-105 group",
              config.containerClass,
            )}
          >
            <config.Icon
              className={cn(
                "size-10 transition-transform group-hover:scale-110",
                config.iconClass,
              )}
            />
          </div>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-foreground-muted leading-relaxed mt-2 px-4">
            {description}
          </DialogDescription>
        </DialogHeader>

        {requireConfirmText && (
          <div className="mt-6 space-y-3">
            <p className="text-[11px] font-bold text-foreground-disabled uppercase tracking-[0.1em] text-center">
              Type{" "}
              <span className="font-mono text-foreground bg-surface-2 px-1.5 py-0.5 rounded border border-border">
                {requireConfirmText}
              </span>{" "}
              to confirm
            </p>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={`Type exactly '${requireConfirmText}'`}
              className="text-center h-12 rounded-xl bg-surface-2/50 border-border-strong/10 focus:bg-background"
            />
          </div>
        )}

        <DialogFooter className="mt-10 gap-3 sm:flex-row sm:gap-3">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] text-foreground-disabled hover:text-foreground"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            loading={isLoading}
            className="flex-1 h-12 rounded-xl font-bold px-8 shadow-lg hover:shadow-xl transition-all"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
