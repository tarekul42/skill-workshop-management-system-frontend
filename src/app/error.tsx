"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="absolute -inset-4 rounded-full bg-destructive/10 blur-2xl" />
        <AlertTriangle className="relative size-24 text-destructive" />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
      >
        Something went wrong!
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-8 max-w-md text-muted-foreground"
      >
        {error.message ||
          "An unexpected error occurred. We have been notified and are working on it."}
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <Button onClick={() => reset()} size="lg" className="gap-2">
          <RefreshCcw className="size-4" />
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          size="lg"
          className="gap-2"
        >
          <Home className="size-4" />
          Return Home
        </Button>
      </motion.div>

      {/* Decorative background blurs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-[15%] top-[25%] size-80 rounded-full bg-destructive/5 blur-[100px]" />
        <div className="absolute right-[15%] bottom-[25%] size-80 rounded-full bg-primary/5 blur-[100px]" />
      </div>
    </div>
  );
}
