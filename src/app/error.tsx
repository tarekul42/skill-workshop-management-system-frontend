"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <ErrorDisplay 
        error={error} 
        reset={reset} 
        title="Critical Application Error"
        description="A serious error occurred that prevented the application from loading. Please try again or return home."
      />
    </div>
  );
}
