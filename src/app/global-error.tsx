"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-16">
          {/* Illustration */}
          <div className="relative mb-8">
            <div className="relative flex items-center justify-center">
              <div className="border-destructive/10 absolute size-56 animate-[spin_20s_linear_infinite] rounded-full border-2 border-dashed" />
              <div className="border-destructive/15 absolute size-40 animate-[spin_15s_linear_infinite_reverse] rounded-full border" />
              <div className="bg-destructive/10 relative flex size-32 items-center justify-center rounded-full">
                <AlertTriangle className="text-destructive/70 size-14" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-md text-center">
            <h1 className="text-foreground text-7xl font-bold tracking-tight">
              5<span className="text-destructive">00</span>
            </h1>
            <h2 className="text-foreground mt-4 text-xl font-semibold">Application Error</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              A critical error occurred in the application. This has been reported to our team.
              Please try refreshing the page or restarting your browser.
            </p>

            {/* Error detail card (development only) */}
            {error.message && process.env.NODE_ENV === "development" && (
              <div className="bg-card mt-6 rounded-xl border p-4 text-left">
                <p className="text-muted-foreground mb-1 text-xs font-medium">
                  Error Details (Development Only)
                </p>
                <p className="wrap-break-words text-destructive font-mono text-sm">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-muted-foreground mt-2 text-xs">Digest: {error.digest}</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <button
              onClick={() => reset()}
              className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <RotateCcw className="mr-2 size-4" />
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
