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
import { AnimatedPage } from "@/components/shared/AnimatedPage";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setLoading(true);
    try {
      await apiClient("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
    } catch {
      // Always show success regardless of API response (anti-enumeration)
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <AnimatedPage className="w-full">
      <Card className="border-border bg-surface-1 shadow-3 sm:rounded-[24px] sm:p-4">
        {submitted ? (
          <>
            <CardHeader className="items-center text-center pb-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-success/10 mt-4">
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
              <CardTitle className="font-display text-[28px] font-bold mt-4">
                Check your email
              </CardTitle>
              <CardDescription className="text-[14px] text-foreground-muted mt-2 max-w-sm">
                If <span className="font-medium text-foreground">{email}</span> has an account, you&apos;ll receive instructions shortly.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button asChild className="w-full h-12 text-base font-semibold">
                <Link href="/login">Back to Sign In</Link>
              </Button>
            </CardContent>
            
            <CardFooter className="justify-center pb-2 pt-2">
              <p className="text-[12px] text-foreground-muted text-center max-w-xs">
                Didn&apos;t receive it? Check spam or try again in 5 minutes
              </p>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="items-center text-center pb-2">
              <div className="flex size-16 items-center justify-center rounded-full bg-warning-subtle mt-4">
                <div className="relative">
                  <Lock className="size-8 text-warning" />
                  <span className="absolute -top-1 -right-2 text-warning font-bold text-lg leading-none">?</span>
                </div>
              </div>
              <CardTitle className="font-display text-[28px] font-bold mt-4">
                Reset your password
              </CardTitle>
              <CardDescription className="text-[14px] text-foreground-muted mt-2 max-w-sm">
                Enter your email and we&apos;ll send you reset instructions
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-1.5">
                  <Label htmlFor="email" className="text-[13px] font-semibold text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="pl-9 h-11"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center pb-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground-muted transition-colors hover:text-foreground"
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
