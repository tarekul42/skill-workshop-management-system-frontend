"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ErrorDisplayProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  showHome?: boolean;
  showBack?: boolean;
}

export function ErrorDisplay({
  error,
  reset,
  title = "Something went wrong!",
  description = "We encountered an unexpected error. Our team has been notified.",
  showHome = true,
  showBack = false,
}: ErrorDisplayProps) {
  return (
    <div className="flex min-h-100 w-full items-center justify-center p-4">
      <Card className="max-w-md border-destructive/20 bg-destructive/5 shadow-lg dark:bg-destructive/10">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-destructive">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">{description}</p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-muted-foreground/60">
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="default"
            onClick={() => reset()}
            className="w-full sm:w-auto"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          {showBack && (
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}

          {showHome && (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
