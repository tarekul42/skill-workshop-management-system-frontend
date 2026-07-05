"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { X, RefreshCcw, LifeBuoy, ArrowLeft, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

// ─── Error Animation Component ─────────────────────────────────────

function ErrorIcon() {
  return (
    <div className="relative mx-auto mb-8 size-24">
      {/* Vibrating background circles */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="bg-danger/10 absolute inset-0 rounded-full"
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
        className="bg-danger shadow-danger/30 relative flex size-24 items-center justify-center rounded-full shadow-lg"
      >
        <motion.div
          initial={{ rotate: -45, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <X className="size-12 stroke-[3px] text-white" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Content Component ───────────────────────────────────────────────

function FailContent() {
  const searchParams = useSearchParams();
  const errorMsg = (searchParams.get("error") || "Transaction failed or was cancelled.").replace(
    /[^a-zA-Z0-9 .,!?@\-_':;()]/g,
    ""
  );
  const workshopSlug = searchParams.get("slug");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mx-auto max-w-2xl text-center"
    >
      <ErrorIcon />

      <h1 className="font-display text-foreground text-4xl font-black tracking-tight">
        Payment Failed
      </h1>
      <p className="text-foreground-muted mx-auto mt-3 max-w-sm text-lg">
        We couldn&apos;t process your payment at this time. Don&apos;t worry, your account
        hasn&apos;t been charged.
      </p>

      {/* Error Message Card */}
      <div className="border-danger/20 bg-danger/5 mt-10 flex items-start gap-4 rounded-2xl border p-5 text-left">
        <div className="bg-danger/10 flex size-10 shrink-0 items-center justify-center rounded-xl">
          <AlertCircle className="text-danger size-5" />
        </div>
        <div>
          <p className="text-danger/60 text-[11px] font-bold tracking-widest uppercase">Reason</p>
          <p className="text-danger mt-0.5 text-sm font-bold">{errorMsg}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col gap-3">
        <Button
          asChild
          className="shadow-raised hover:shadow-float h-14 rounded-2xl text-base font-bold transition-all"
        >
          <Link href={workshopSlug ? `/workshops/${workshopSlug}` : "/workshops"}>
            <RefreshCcw className="mr-2 size-5" />
            Try Again
          </Link>
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" asChild className="h-12 rounded-xl text-sm font-bold">
            <Link href="/contact">
              <LifeBuoy className="mr-2 size-4" />
              Support
            </Link>
          </Button>
          <Button variant="ghost" asChild className="h-12 rounded-xl text-sm font-bold">
            <Link href="/student/dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <p className="text-foreground-disabled mx-auto mt-12 max-w-xs text-[12px] leading-relaxed">
        If you saw a charge on your bank statement, it should be reversed automatically within 24-48
        hours.
      </p>
    </motion.div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────

export default function FailPage() {
  return (
    <Suspense
      fallback={<div className="animate-pulse py-20 text-center font-bold">Loading...</div>}
    >
      <FailContent />
    </Suspense>
  );
}
