"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { AnimatedPage } from "@/components/ui/animated-page";
import { z } from "zod";
import { useRateLimiter } from "@/hooks/useRateLimiter";

const emailSchema = z.string().email("Please enter a valid email address").max(254);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const forgotLimiter = useRateLimiter({ label: "forgot-password", maxAttempts: 3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotLimiter.isLocked) return;

    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await apiClient("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      forgotLimiter.reset();
    } catch {
      forgotLimiter.recordAttempt();
      // Always show success regardless of API response (anti-enumeration)
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <AnimatedPage className="w-full">
      <Card className="border-border bg-surface-1 shadow-3 sm:rounded-3xl sm:p-4">
        {submitted ? (
          <>
            <CardHeader className="items-center pb-4 text-center">
              <div className="bg-success/10 mt-4 flex size-16 items-center justify-center rounded-full">
                <motion.svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-success"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <motion.polyline points="20 6 9 17 4 12" />
                </motion.svg>
              </div>
              <CardTitle className="font-display mt-4 text-[28px] font-bold">
                Check your email
              </CardTitle>
              <CardDescription className="text-foreground-muted mt-2 max-w-sm text-[14px]">
                If <span className="text-foreground font-medium">{email}</span> has an account,
                you&apos;ll receive instructions shortly.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button asChild className="h-12 w-full text-base font-semibold">
                <Link href="/login">Back to Sign In</Link>
              </Button>
            </CardContent>

            <CardFooter className="justify-center pt-2 pb-2">
              <p className="text-foreground-muted max-w-xs text-center text-[12px]">
                Didn&apos;t receive it? Check spam or try again in 5 minutes
              </p>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="items-center pb-2 text-center">
              <div className="bg-warning-subtle mt-4 flex size-16 items-center justify-center rounded-full">
                <div className="relative">
                  <Lock className="text-warning size-8" />
                  <span className="text-warning absolute -top-1 -right-2 text-lg leading-none font-bold">
                    ?
                  </span>
                </div>
              </div>
              <CardTitle className="font-display mt-4 text-[28px] font-bold">
                Reset your password
              </CardTitle>
              <CardDescription className="text-foreground-muted mt-2 max-w-sm text-[14px]">
                Enter your email and we&apos;ll send you reset instructions
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-foreground text-[13px] font-semibold">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="text-foreground-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="h-11 pl-9"
                    />
                  </div>
                </div>

                {error && <p className="text-danger text-center text-[14px]">{error}</p>}

                <Button
                  type="submit"
                  className="h-12 w-full text-base font-semibold"
                  disabled={loading || forgotLimiter.isLocked || !email.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending...
                    </>
                  ) : forgotLimiter.isLocked ? (
                    <>Wait {forgotLimiter.remaining}s</>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center pb-2">
              <Link
                href="/login"
                className="text-foreground-muted hover:text-foreground inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Back to Sign In
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </AnimatedPage>
  );
}
