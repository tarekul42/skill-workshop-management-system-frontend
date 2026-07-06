"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, GraduationCap, AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSavedUser } from "@/lib/auth-helpers";
import { createEnrollment } from "@/lib/api/services";

interface EnrollButtonProps {
  workshopId: string;
  slug: string;
  price: number;
  seatsAvailable: number;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

type EnrollState = "idle" | "checking" | "enrolled" | "enrolling" | "payment" | "error";

export function EnrollButton({
  workshopId,
  slug,
  seatsAvailable,
  disabled = false,
  variant = "default",
  size = "lg",
  className,
}: EnrollButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<EnrollState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check enrollment status on mount
  const checkEnrollmentStatus = useCallback(async () => {
    const user = getSavedUser();
    if (!user) return;

    setState("checking");
    try {
      const { getMyEnrollments } = await import("@/lib/api/services");
      const enrollments = await getMyEnrollments();
      const existing = enrollments.find((e: { workshop: string | { _id: string } }) => {
        const wId = typeof e.workshop === "string" ? e.workshop : e.workshop?._id;
        return wId === workshopId;
      });
      if (existing) {
        const status = (existing as { status?: string }).status;
        if (status === "COMPLETE" || status === "PENDING") {
          setState("enrolled");
          return;
        }
        // If FAILED or CANCEL, allow re-enrollment
        setState("idle");
      } else {
        setState("idle");
      }
    } catch {
      // Non-critical — default to idle (show enroll button)
      setState("idle");
    }
  }, [workshopId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkEnrollmentStatus();
  }, [checkEnrollmentStatus]);

  // Also listen for payment completion events (from callback redirect pages)
  useEffect(() => {
    const handlePaymentDone = () => {
      checkEnrollmentStatus();
    };
    window.addEventListener("payment-complete", handlePaymentDone);
    return () => {
      window.removeEventListener("payment-complete", handlePaymentDone);
    };
  }, [checkEnrollmentStatus]);

  const handleEnroll = async () => {
    const isLoggedIn = getSavedUser() !== null;
    if (!isLoggedIn) {
      router.push(`/login?redirect=/workshops/${slug}`);
      return;
    }

    setState("enrolling");
    setErrorMessage(null);

    try {
      const result = await createEnrollment(workshopId, 1);

      // result may contain paymentUrl
      const data = result as unknown as { paymentUrl?: string };
      if (data.paymentUrl) {
        setState("payment");

        // Save the current URL to return to after payment
        sessionStorage.setItem("payment_return_url", window.location.pathname);

        // Redirect to payment gateway
        window.location.href = data.paymentUrl;
      } else {
        // Enrollment created without immediate payment
        setState("enrolled");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to enroll. Please try again.";
      if (message.toLowerCase().includes("active enrollment")) {
        setState("enrolled");
      } else {
        setErrorMessage(message);
        setState("error");
      }
    }
  };

  const isDisabled = disabled || seatsAvailable <= 0 || state === "checking";

  // Already Enrolled
  if (state === "enrolled") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size={size}
          onClick={() => {
            router.push(`/workshops/${slug}`);
          }}
          className={cn(
            "bg-success text-success-foreground border-success-subtle hover:bg-success/90 w-full border",
            className
          )}
        >
          <CheckCircle className="mr-2 size-4" />
          View Workshop
        </Button>
        <p className="text-muted-foreground text-center text-xs">
          You&apos;re already enrolled in this workshop.
        </p>
      </div>
    );
  }

  // Redirecting to Payment
  if (state === "payment") {
    return (
      <Button
        variant="default"
        size={size}
        disabled
        className={cn("bg-accent text-accent-foreground w-full opacity-90", className)}
      >
        <Loader2 className="mr-2 size-4 animate-spin" />
        Redirecting to Payment...
      </Button>
    );
  }

  // Checking Enrollment Status
  if (state === "checking") {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn("border-border relative w-full overflow-hidden text-transparent", className)}
      >
        Checking
        <div className="via-primary/10 absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent to-transparent" />
      </Button>
    );
  }

  // Enrolling (loading)
  if (state === "enrolling") {
    return (
      <Button
        variant="default"
        size={size}
        disabled
        className={cn("bg-accent text-accent-foreground w-full opacity-90", className)}
      >
        <Loader2 className="mr-2 size-4 animate-spin" />
        Processing...
      </Button>
    );
  }

  // Error State
  if (state === "error") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="destructive"
          size={size}
          disabled={isDisabled}
          onClick={handleEnroll}
          className={cn("bg-danger text-danger-foreground hover:bg-danger/90 w-full", className)}
        >
          <RefreshCw className="mr-2 size-4" />
          Retry ↺
        </Button>
        {errorMessage && (
          <p className="text-danger flex items-center gap-1 text-center text-xs">
            <AlertCircle className="size-3 shrink-0" />
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  // Idle (default)
  const isLoggedIn = getSavedUser() !== null;
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={variant}
        size={size}
        disabled={isDisabled}
        onClick={handleEnroll}
        className={cn("bg-accent text-accent-foreground hover:bg-accent/90 w-full", className)}
      >
        {seatsAvailable <= 0 ? (
          "Workshop is Full"
        ) : (
          <>
            <GraduationCap className="mr-2 size-5" />
            Enroll Now →
          </>
        )}
      </Button>
      {!isLoggedIn && (
        <p className="text-foreground-muted text-center text-xs">
          You&apos;ll be redirected to login first
        </p>
      )}
    </div>
  );
}
