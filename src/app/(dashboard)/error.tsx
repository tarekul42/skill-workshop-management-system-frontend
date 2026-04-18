"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/shared/ErrorDisplay";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex h-full min-h-50 items-center justify-center p-6">
      <ErrorDisplay
        error={error}
        reset={reset}
        title="Dashboard Error"
        description="We had trouble loading your dashboard data. This might be a temporary connection issue."
        showHome={false}
        showBack={true}
      />
    </div>
  );
}
