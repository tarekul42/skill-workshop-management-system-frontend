"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/ui/error-display";

export default function PaymentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Payment error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <ErrorDisplay
        error={error}
        reset={reset}
        title="Payment Error"
        description="An error occurred during the payment process. Your payment has not been processed. Please try again or contact support."
        showHome
        showBack
      />
    </div>
  );
}
