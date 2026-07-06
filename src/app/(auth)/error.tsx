"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/ui/error-display";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Auth error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <ErrorDisplay
        error={error}
        reset={reset}
        title="Authentication Error"
        description="Something went wrong while processing your request. Please try again or return to the login page."
        showHome
        showBack
      />
    </div>
  );
}
