"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-8 rounded-full bg-muted p-6">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
      </div>
      <h1 className="mb-2 text-6xl font-extrabold tracking-tighter">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Sorry, we couldn't find the page you're looking for. It might have been
        moved or deleted.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild variant="default" size="lg">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Return Home
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => (window.history.length > 1 ? window.history.back() : null)}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
