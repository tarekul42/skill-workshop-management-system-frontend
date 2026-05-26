"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
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
          <div className="border-destructive/10 absolute size-48 animate-[spin_20s_linear_infinite] rounded-full border-2 border-dashed" />
          <div className="border-destructive/15 absolute size-32 animate-[spin_15s_linear_infinite_reverse] rounded-full border" />
          <div className="bg-destructive/10 relative flex size-24 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive/70 size-10" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-5xl font-bold tracking-tight">
          Dashboard <span className="text-destructive">Error</span>
        </h1>
        <h2 className="text-foreground mt-3 text-lg font-semibold">Something Went Wrong</h2>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          An error occurred while loading the dashboard. This could be due to a network issue or a
          problem with your session. Please try again or navigate back to the homepage.
        </p>

        {/* Error detail card (development only) */}
        {error.message && (
          <Card className="mt-6 text-left">
            <CardContent className="p-4">
              <p className="text-muted-foreground mb-1 text-xs font-medium">Error Details</p>
              <p className="text-destructive wrap-break-words font-mono text-sm">{error.message}</p>
              {error.digest && (
                <p className="text-muted-foreground mt-2 text-xs">Digest: {error.digest}</p>
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
