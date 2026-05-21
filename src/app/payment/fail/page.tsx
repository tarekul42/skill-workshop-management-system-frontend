"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  X, 
  RefreshCcw, 
  LifeBuoy, 
  ArrowLeft,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";

// ─── Error Animation Component ─────────────────────────────────────

function ErrorIcon() {
  return (
    <div className="relative size-24 mx-auto mb-8">
      {/* Vibrating background circles */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-danger/10"
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
        className="relative flex items-center justify-center size-24 rounded-full bg-danger shadow-lg shadow-danger/30"
      >
        <motion.div
          initial={{ rotate: -45, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <X className="size-12 text-white stroke-[3px]" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Content Component ───────────────────────────────────────────────

function FailContent() {
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error") || "Transaction failed or was cancelled.";
  const workshopSlug = searchParams.get("slug");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="text-center"
    >
      <ErrorIcon />
      
      <h1 className="font-display text-4xl font-black text-foreground tracking-tight">
        Payment Failed
      </h1>
      <p className="mt-3 text-lg text-foreground-muted max-w-sm mx-auto">
        We couldn't process your payment at this time. Don't worry, your account hasn't been charged.
      </p>

      {/* Error Message Card */}
      <div className="mt-10 p-5 rounded-2xl border border-danger/20 bg-danger/5 flex items-start gap-4 text-left">
        <div className="size-10 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
          <AlertCircle className="size-5 text-danger" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-danger/60 uppercase tracking-widest">Reason</p>
          <p className="text-sm font-bold text-danger mt-0.5">{errorMsg}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-3">
        <Button 
          asChild 
          className="h-14 rounded-2xl text-base font-bold shadow-raised hover:shadow-float transition-all"
        >
          <Link href={workshopSlug ? `/workshops/${workshopSlug}` : "/workshops"}>
            <RefreshCcw className="mr-2 size-5" />
            Try Again
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            asChild 
            className="h-12 rounded-xl text-sm font-bold"
          >
            <Link href="/contact">
              <LifeBuoy className="mr-2 size-4" />
              Support
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            asChild 
            className="h-12 rounded-xl text-sm font-bold"
          >
            <Link href="/student/dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <p className="mt-12 text-[12px] text-foreground-disabled leading-relaxed max-w-xs mx-auto">
        If you saw a charge on your bank statement, it should be reversed automatically within 24-48 hours.
      </p>
    </motion.div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────

export default function FailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center animate-pulse font-bold">Loading...</div>}>
      <FailContent />
    </Suspense>
  );
}
