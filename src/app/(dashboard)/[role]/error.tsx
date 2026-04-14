"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/shared/BackButton";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="relative flex items-center justify-center">
          <div className="absolute size-48 rounded-full border-2 border-dashed border-destructive/10 animate-[spin_20s_linear_infinite]" />
          <div className="absolute size-32 rounded-full border border-destructive/15 animate-[spin_15s_linear_infinite_reverse]" />
          <div className="relative flex size-24 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-10 text-destructive/70" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Dashboard <span className="text-destructive">Error</span>
        </h1>
        <h2 className="mt-3 text-lg font-semibold text-foreground">
          Something Went Wrong
        </h2>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          An error occurred while loading the dashboard. This could be due to a
          network issue or a problem with your session. Please try again or
          navigate back to the homepage.
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

      {/* Back navigation */}
      <BackButton />
    </div>
  );
}
