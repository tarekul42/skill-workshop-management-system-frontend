"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
          {/* Illustration */}
          <div className="relative mb-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute size-56 rounded-full border-2 border-dashed border-destructive/10 animate-[spin_20s_linear_infinite]" />
              <div className="absolute size-40 rounded-full border border-destructive/15 animate-[spin_15s_linear_infinite_reverse]" />
              <div className="relative flex size-32 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-14 text-destructive/70" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-md text-center">
            <h1 className="text-7xl font-bold tracking-tight text-foreground">
              5<span className="text-destructive">00</span>
            </h1>
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              Application Error
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              A critical error occurred in the application. This has been
              reported to our team. Please try refreshing the page or restarting
              your browser.
            </p>

            {/* Error detail card (development only) */}
            {error.message && process.env.NODE_ENV === "development" && (
              <div className="mt-6 rounded-xl border bg-card p-4 text-left">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Error Details (Development Only)
                </p>
                <p className="break-words font-mono text-sm text-destructive">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <button
              onClick={() => reset()}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
