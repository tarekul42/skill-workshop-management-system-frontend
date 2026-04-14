"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16">
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
          Something Went Wrong
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          An unexpected error occurred. Our team has been notified and is
          working on a fix. Please try again or return to the homepage.
        </p>

        {/* Error detail card (development only) */}
        {error.message && process.env.NODE_ENV === "development" && (
          <Card className="mt-6 text-left">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Error Details (Development Only)
              </p>
              <p className="text-sm text-destructive font-mono break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Digest: {error.digest}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Button onClick={() => reset()} size="lg">
          <RotateCcw className="mr-2 size-4" />
          Try Again
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <Home className="mr-2 size-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
