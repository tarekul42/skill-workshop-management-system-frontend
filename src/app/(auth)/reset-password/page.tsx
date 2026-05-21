"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PasswordChecklist } from "@/components/shared/PasswordChecklist";
import { isPasswordValid } from "@/lib/validation/password";
import { motion } from "framer-motion";


function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const allRulesValid = isPasswordValid(newPassword);
  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const isFormValid = allRulesValid && passwordsMatch;

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !token) return;

    setError("");
    setLoading(true);

    try {
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: {
          token,
          newPassword,
        },
      });
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AnimatedPage className="w-full">
        <Card className="border-border bg-surface-1 shadow-3 sm:rounded-[24px] sm:p-4">
          <CardHeader className="items-center text-center pb-2">
            <div className="flex size-16 items-center justify-center rounded-full bg-danger-subtle mt-4">
              <span className="text-2xl">🔑</span>
            </div>
            <CardTitle className="font-display text-[28px] font-bold mt-4">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-[14px] text-foreground-muted mt-2 max-w-sm">
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <Button asChild className="w-full h-12 text-base font-semibold">
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardContent>
        </Card>
      </AnimatedPage>
    );
  }

  if (success) {
    return (
      <AnimatedPage className="w-full">
        <Card className="border-border bg-surface-1 shadow-3 sm:rounded-[24px] sm:p-4">
          <CardHeader className="items-center text-center pb-2">
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
              Password Reset Successfully!
            </CardTitle>
            <CardDescription className="text-[14px] text-foreground-muted mt-2">
              Redirecting to login...
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <Button asChild className="w-full h-12 text-base font-semibold">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="w-full">
      <Card className="border-border bg-surface-1 shadow-3 sm:rounded-[24px] sm:p-4">
        <CardHeader className="items-center text-center pb-2">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary-subtle mt-4">
            <Lock className="size-8 text-primary" />
          </div>
          <CardTitle className="font-display text-[28px] font-bold mt-4">
            Set new password
          </CardTitle>
          <CardDescription className="text-[14px] text-foreground-muted mt-2">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-1.5">
              <Label htmlFor="newPassword" className="text-[13px] font-semibold text-foreground">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword" className="text-[13px] font-semibold text-foreground">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Checklist */}
            <div className="bg-surface-2 rounded-xl border border-border p-4">
              <PasswordChecklist password={newPassword} />
            </div>

            {error && (
              <p className="text-center text-[14px] text-danger">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={!isFormValid || loading}
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
