"use client";

import { useState } from "react";
import { Loader2, Trash, XCircle } from "lucide-react";

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
      <DialogContent className="max-w-[420px]">
        <DialogHeader className="items-center text-center">
          {/* Icon container */}
          <div
            className={cn(
              "mx-auto mb-4 flex size-14 items-center justify-center rounded-full",
              config.containerClass,
            )}
          >
            <config.Icon className={cn("size-7", config.iconClass)} />
          </div>
          <DialogTitle className="font-display text-[22px] font-bold">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[15px] font-normal text-foreground-muted">
            {description}
          </DialogDescription>
        </DialogHeader>

        {requireConfirmText && (
          <div className="mt-2 space-y-2">
            <p className="text-sm text-foreground-muted text-center">
              Type{" "}
              <span className="font-mono font-bold text-foreground">
                &apos;{requireConfirmText}&apos;
              </span>{" "}
              to confirm
            </p>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={`Type '${requireConfirmText}' to confirm`}
              className="text-center"
            />
          </div>
        )}

        <DialogFooter className="mt-4 gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className="flex-1"
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
