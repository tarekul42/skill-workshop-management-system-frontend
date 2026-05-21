"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Check, 
  ArrowRight, 
  Download, 
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";

// ─── Success Animation Component ─────────────────────────────────────

function SuccessIcon() {
  return (
    <div className="relative size-24 mx-auto mb-8">
      {/* Expanding outer circles */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 rounded-full bg-success/10"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="absolute inset-0 rounded-full bg-success/20"
      />
      
      {/* Main circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20, 
          delay: 0.3 
        }}
        className="relative flex items-center justify-center size-24 rounded-full bg-success shadow-lg shadow-success/30"
      >
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6, ease: "easeInOut" }}
        >
          <Check className="size-12 text-white stroke-[3px]" />
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
      
      <h1 className="font-display text-4xl font-black text-foreground tracking-tight">
        You&apos;re enrolled! <span className="inline-block animate-bounce-subtle">🎉</span>
      </h1>
      <p className="mt-3 text-lg text-foreground-muted max-w-sm mx-auto">
        Your payment was successful and your seat is secured. We&apos;ve sent a confirmation email to your inbox.
      </p>

      {/* Summary Card */}
      <div className="mt-10 p-6 rounded-3xl border border-border bg-surface-1 shadow-sm text-left space-y-5">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <LayoutDashboard className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-foreground-disabled uppercase tracking-widest">Workshop</p>
            <p className="text-lg font-bold text-foreground leading-tight">{workshopName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-foreground-disabled uppercase tracking-widest">Transaction ID</p>
            <p className="font-mono text-sm font-bold text-foreground truncate">{txnId || "—"}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[11px] font-bold text-foreground-disabled uppercase tracking-widest">Date</p>
            <p className="text-sm font-bold text-foreground">{formatDate(date)}</p>
          </div>
          {amount && (
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-foreground-disabled uppercase tracking-widest">Amount Paid</p>
              <p className="font-display text-xl font-bold text-primary">৳{amount}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button 
          asChild 
          className="flex-1 h-14 rounded-2xl text-base font-bold shadow-raised hover:shadow-float transition-all"
        >
          <Link href="/student/enrollments">
            Go to My Enrollments
            <ArrowRight className="ml-2 size-5" />
          </Link>
        </Button>
        <Button 
          variant="outline" 
          asChild 
          className="flex-1 h-14 rounded-2xl text-base font-bold"
        >
          <Link href="/student/payments">
            <Download className="mr-2 size-5" />
            Download Invoice
          </Link>
        </Button>
      </div>

      <p className="mt-8 text-sm text-foreground-disabled font-medium">
        Need help? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
      </p>
    </motion.div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center space-y-4 py-20">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-bold text-foreground animate-pulse">Processing confirmation...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
