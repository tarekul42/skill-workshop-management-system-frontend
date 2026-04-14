"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";

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
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-7 text-primary" />
        </div>
        <CardTitle className="mt-4 text-xl font-semibold">
          Verify Your Email
        </CardTitle>
        <CardDescription className="mt-1">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>. Enter it
          below to verify your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center">
            <OTPInput
              value={otp}
              onChange={setOtp}
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              containerClassName="flex gap-3"
              render={({ slots }) => (
                <div className="flex gap-3">
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className={`relative flex h-14 max-w-12 w-full items-center justify-center rounded-lg border-2 text-center text-2xl font-bold transition-all ${
                        slot.isActive
                          ? "border-primary ring-4 ring-primary/20"
                          : "border-muted-foreground/25"
                      }`}
                    >
                      {slot.char}
                      {slot.hasFakeCaret && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="h-5 w-px animate-pulse bg-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            />
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={otp.length !== 6 || loading}
          >
            {loading && <Loader2 className="animate-spin" />}
            Verify
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col items-center gap-4">
        {/* Resend OTP */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Didn&apos;t receive the code?</span>
          {countdown > 0 ? (
            <span className="font-medium text-foreground">
              Resend in {countdown}s
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading && <Loader2 className="animate-spin" />}
              Resend Code
            </Button>
          )}
        </div>

        <Link
          href="/register"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to registration
        </Link>
      </CardFooter>
    </Card>
  );
}
