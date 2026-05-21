"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { StepIndicator } from "@/components/shared/StepIndicator";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { getOTPEmail, clearOTPEmail, getOTPName } from "@/lib/auth-helpers";
import { apiClient } from "@/lib/api-client";

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = getOTPEmail();
    const savedName = getOTPName();
    if (!savedEmail) {
      router.replace("/register");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail(savedEmail);
    setName(savedName);
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (otp.length !== 6) return;

      setError("");
      setLoading(true);

      try {
        await apiClient("/otp/verify", {
          method: "POST",
          body: { email, otp },
        });
        clearOTPEmail();
        toast.success("Email verified! Please sign in.");
        router.push("/login");
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Verification failed. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [otp, email, router],
  );

  const handleResend = useCallback(async () => {
    if (countdown > 0 || !email || !name) return;

    setResendLoading(true);
    try {
      await apiClient("/otp/send", { method: "POST", body: { email, name } });
      toast.success("New OTP sent!");
      setCountdown(30);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to resend OTP.";
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  }, [countdown, email, name]);

  if (!email) {
    return null;
  }

  return (
    <AnimatedPage className="w-full">
      <Card className="border-border bg-surface-1 shadow-3 sm:rounded-[24px] sm:p-4">
        <CardHeader className="items-center text-center pb-2">
          <StepIndicator currentStep={2} />
          <div className="flex size-16 items-center justify-center rounded-full bg-primary-subtle mt-4">
            <Mail className="size-8 text-primary" />
          </div>
          <CardTitle className="font-display text-[28px] font-bold mt-4">
            Check your inbox
          </CardTitle>
          <CardDescription className="text-[14px] text-foreground-muted mt-2">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-primary">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-8 pt-4">
            {/* OTP Input */}
            <div className="flex justify-center">
              <OTPInput
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  if (value.length === 6) {
                    // Auto submit
                    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
                    handleVerify(syntheticEvent);
                  }
                }}
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                containerClassName="flex gap-2"
                render={({ slots }) => (
                  <div className="flex gap-2">
                    {slots.slice(0, 3).map((slot, index) => (
                      <OTPSlot key={index} slot={slot} />
                    ))}
                    <div className="w-2" /> {/* Wider gap for visual grouping 3|3 */}
                    {slots.slice(3, 6).map((slot, index) => (
                      <OTPSlot key={index + 3} slot={slot} />
                    ))}
                  </div>
                )}
              />
            </div>

            {error && (
              <p className="text-center text-[14px] text-danger mt-4">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={otp.length !== 6 || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col items-center gap-6 pb-2">
          {/* Countdown & Resend */}
          <div className="flex flex-col items-center gap-3">
            {countdown > 0 ? (
              <div className="flex items-center gap-3">
                <div className="relative size-5">
                  <svg className="size-5 -rotate-90" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-border"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="62.8"
                      strokeDashoffset={62.8 - (62.8 * countdown) / 30}
                      className="text-primary transition-all duration-1000 linear"
                    />
                  </svg>
                </div>
                <span className="text-[13px] text-foreground-muted">
                  Code expires in 0:{countdown.toString().padStart(2, "0")}
                </span>
              </div>
            ) : (
              <span className="text-[13px] text-foreground-muted">Code expired</span>
            )}

            <button
              onClick={handleResend}
              disabled={countdown > 0 || resendLoading}
              className={`text-[13px] font-medium transition-colors ${
                countdown > 0 || resendLoading
                  ? "text-foreground-disabled cursor-not-allowed"
                  : "text-primary hover:underline"
              }`}
            >
              {resendLoading
                ? "Sending..."
                : countdown > 0
                  ? `Resend code (0:${countdown.toString().padStart(2, "0")})`
                  : "Resend code"}
            </button>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to registration
          </Link>
        </CardFooter>
      </Card>
    </AnimatedPage>
  );
}

// Helper component for OTP slots
function OTPSlot({ slot }: { slot: any }) {
  return (
    <div
      className={`relative flex h-[64px] w-[52px] items-center justify-center rounded-xl border-[1.5px] text-center font-display text-[24px] font-bold transition-all ${
        slot.isActive
          ? "border-primary ring-[3px] ring-primary/20 z-10"
          : slot.char
          ? "border-primary bg-primary-subtle text-foreground"
          : "border-border bg-background"
      }`}
    >
      {slot.char}
      {slot.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-[1.5px] animate-pulse bg-primary" />
        </div>
      )}
    </div>
  );
}
