"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
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
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <div className="bg-destructive/10 mb-6 flex size-16 items-center justify-center rounded-full">
        <AlertCircle className="text-destructive size-8" />
      </div>

      <h2 className="mb-2 text-2xl font-bold tracking-tight">Something went wrong!</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        We encountered an error while trying to load the workshop details. Please try refreshing the
        page or contact support if the problem persists.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="default">
          <RotateCcw className="size-4" />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="size-4" />
            Go to Home
          </Link>
        </Button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="bg-muted mt-12 max-w-2xl overflow-hidden rounded-lg border p-4 text-left">
          <p className="text-muted-foreground mb-2 font-mono text-xs font-semibold uppercase">
            Error Details
          </p>
          <pre className="text-destructive overflow-x-auto font-mono text-sm">
            {error.message}
            {"\n"}
            {error.stack}
          </pre>
        </div>
      )}
    </div>
  );
}
