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
    isLoading || (requireConfirmText !== undefined && confirmInput !== requireConfirmText);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="shadow-4 max-w-[440px] rounded-[32px] p-8">
        <DialogHeader className="items-center text-center">
          {/* Icon container */}
          <div
            className={cn(
              "group mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl shadow-sm ring-1 ring-white/20 transition-transform duration-500 hover:scale-105",
              config.containerClass
            )}
          >
            <config.Icon
              className={cn("size-10 transition-transform group-hover:scale-110", config.iconClass)}
            />
          </div>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-foreground-muted mt-2 px-4 text-base leading-relaxed font-medium">
            {description}
          </DialogDescription>
        </DialogHeader>

        {requireConfirmText && (
          <div className="mt-6 space-y-3">
            <p className="text-foreground-disabled text-center text-[11px] font-bold tracking-[0.1em] uppercase">
              Type{" "}
              <span className="text-foreground bg-surface-2 border-border rounded border px-1.5 py-0.5 font-mono">
                {requireConfirmText}
              </span>{" "}
              to confirm
            </p>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={`Type exactly '${requireConfirmText}'`}
              className="bg-surface-2/50 border-border-strong/10 focus:bg-background h-12 rounded-xl text-center"
            />
          </div>
        )}

        <DialogFooter className="mt-10 gap-3 sm:flex-row sm:gap-3">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="text-foreground-disabled hover:text-foreground h-12 flex-1 rounded-xl text-[11px] font-bold tracking-widest uppercase"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            loading={isLoading}
            className="h-12 flex-1 rounded-xl px-8 font-bold shadow-lg transition-all hover:shadow-xl"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
