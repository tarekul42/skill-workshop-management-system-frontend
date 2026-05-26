"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ArrowRight, Download, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";

// ─── Success Animation Component ─────────────────────────────────────

function SuccessIcon() {
  return (
    <div className="relative mx-auto mb-8 size-24">
      {/* Expanding outer circles */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-success/10 absolute inset-0 rounded-full"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="bg-success/20 absolute inset-0 rounded-full"
      />

      {/* Main circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.3,
        }}
        className="bg-success shadow-success/30 relative flex size-24 items-center justify-center rounded-full shadow-lg"
      >
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6, ease: "easeInOut" }}
        >
          <Check className="size-12 stroke-[3px] text-white" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Content Component ───────────────────────────────────────────────

function SuccessContent() {
  const searchParams = useSearchParams();
  const workshopName = searchParams.get("workshop") || "Your Workshop";
  const amount = searchParams.get("amount");
  const txnId = searchParams.get("txnId");
  const date = searchParams.get("date") || new Date().toISOString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="text-center"
    >
      <SuccessIcon />

      <h1 className="font-display text-foreground text-4xl font-black tracking-tight">
        You&apos;re enrolled! <span className="animate-bounce-subtle inline-block">🎉</span>
      </h1>
      <p className="text-foreground-muted mx-auto mt-3 max-w-sm text-lg">
        Your payment was successful and your seat is secured. We&apos;ve sent a confirmation email
        to your inbox.
      </p>

      {/* Summary Card */}
      <div className="border-border bg-surface-1 mt-10 space-y-5 rounded-3xl border p-6 text-left shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-2xl">
            <LayoutDashboard className="text-primary size-6" />
          </div>
          <div>
            <p className="text-foreground-disabled text-[11px] font-bold tracking-widest uppercase">
              Workshop
            </p>
            <p className="text-foreground text-lg leading-tight font-bold">{workshopName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <p className="text-foreground-disabled text-[11px] font-bold tracking-widest uppercase">
              Transaction ID
            </p>
            <p className="text-foreground truncate font-mono text-sm font-bold">{txnId || "—"}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-foreground-disabled text-[11px] font-bold tracking-widest uppercase">
              Date
            </p>
            <p className="text-foreground text-sm font-bold">{formatDate(date)}</p>
          </div>
          {amount && (
            <div className="space-y-1">
              <p className="text-foreground-disabled text-[11px] font-bold tracking-widest uppercase">
                Amount Paid
              </p>
              <p className="font-display text-primary text-xl font-bold">৳{amount}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Button
          asChild
          className="shadow-raised hover:shadow-float h-14 flex-1 rounded-2xl text-base font-bold transition-all"
        >
          <Link href="/student/enrollments">
            Go to My Enrollments
            <ArrowRight className="ml-2 size-5" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-14 flex-1 rounded-2xl text-base font-bold">
          <Link href="/student/payments">
            <Download className="mr-2 size-5" />
            Download Invoice
          </Link>
        </Button>
      </div>

      <p className="text-foreground-disabled mt-8 text-sm font-medium">
        Need help?{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact Support
        </Link>
      </p>
    </motion.div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-4 py-20">
          <div className="border-primary size-12 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-foreground animate-pulse text-lg font-bold">
            Processing confirmation...
          </p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
