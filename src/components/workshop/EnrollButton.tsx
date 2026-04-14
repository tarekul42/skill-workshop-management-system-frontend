"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, CreditCard, AlertCircle } from "lucide-react";

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
  price,
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
      const existing = enrollments.find(
        (e: { workshop: string | { _id: string } }) => {
          const wId =
            typeof e.workshop === "string"
              ? e.workshop
              : e.workshop?._id;
          return wId === workshopId;
        }
      );
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
        // Redirect to payment gateway
        window.location.href = data.paymentUrl;
      } else {
        // Enrollment created without immediate payment
        setState("enrolled");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to enroll. Please try again.";
      setErrorMessage(message);
      setState("error");
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
          disabled
          className={cn("w-full", className)}
        >
          <CheckCircle className="mr-2 size-4" />
          Already Enrolled
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          You&apos;re enrolled in this workshop.
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
        className={cn("w-full", className)}
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
        variant={variant}
        size={size}
        disabled
        className={cn("w-full", className)}
      >
        <Loader2 className="mr-2 size-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  // Enrolling (loading)
  if (state === "enrolling") {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={cn("w-full", className)}
      >
        <Loader2 className="mr-2 size-4 animate-spin" />
        Enrolling...
      </Button>
    );
  }

  // Error State
  if (state === "error") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant={variant}
          size={size}
          disabled={isDisabled}
          onClick={handleEnroll}
          className={cn("w-full", className)}
        >
          <CreditCard className="mr-2 size-4" />
          {seatsAvailable <= 0 ? "Workshop is Full" : "Retry Enrollment"}
        </Button>
        {errorMessage && (
          <p className="flex items-center gap-1 text-center text-xs text-destructive">
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
        className={cn("w-full", className)}
      >
        <CreditCard className="mr-2 size-4" />
        {seatsAvailable <= 0
          ? "Workshop is Full"
          : price === 0
            ? "Enroll for Free"
            : "Enroll Now"}
      </Button>
      {!isLoggedIn && (
        <p className="text-center text-xs text-muted-foreground">
          You&apos;ll be redirected to login first
        </p>
      )}
    </div>
  );
}
