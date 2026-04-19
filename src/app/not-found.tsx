"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mb-8"
      >
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl" />
        <AlertCircle className="relative size-24 text-primary" />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-2 text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl"
      >
        404
      </motion.h1>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-4 text-2xl font-semibold text-foreground"
      >
        Oops! Page Not Found
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8 max-w-md text-muted-foreground"
      >
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <Home className="size-4" />
            Back to Home
          </Link>
        </Button>
        <Button variant="outline" asChild size="lg" className="gap-2">
          <Link href="/workshops">
            <Search className="size-4" />
            Browse Workshops
          </Link>
        </Button>
      </motion.div>

      {/* Decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[10%] top-[20%] size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-[10%] bottom-[20%] size-72 rounded-full bg-primary/5 blur-3xl" />
      </div>
    </div>
  );
}
