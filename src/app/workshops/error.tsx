"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";

export default function WorkshopsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Workshops Catalog Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-125 items-center justify-center px-4 py-12">
      <ErrorDisplay
        error={error}
        reset={reset}
        title="Catalog Error"
        description="We encountered an issue while loading the workshop catalog. Please refresh the page to try again."
        showHome={true}
        showBack={true}
      />
    </div>
  );
}
