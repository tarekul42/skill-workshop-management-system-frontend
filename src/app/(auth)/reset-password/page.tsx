"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
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

function PasswordRule({
  label,
  valid,
}: {
  label: string;
  valid: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle
        className={`size-4 shrink-0 transition-colors ${
          valid
            ? "text-green-600 dark:text-green-400"
            : "text-muted-foreground/40"
        }`}
      />
      <span
        className={
          valid
            ? "text-green-600 dark:text-green-400"
            : "text-muted-foreground"
        }
      >
        {label}
      </span>
    </div>
  );
}

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

  const rules = useMemo(
    () => [
      {
        label: "At least 6 characters",
        valid: newPassword.length >= 6,
      },
      {
        label: "Contains uppercase letter",
        valid: /[A-Z]/.test(newPassword),
      },
      {
        label: "Contains a digit",
        valid: /\d/.test(newPassword),
      },
      {
        label: "Contains special character (!@#$%^&*)",
        valid: /[!@#$%^&*]/.test(newPassword),
      },
    ],
    [newPassword]
  );

  const allRulesValid = rules.every((r) => r.valid);
  const passwordsMatch =
    newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

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
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="size-7 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-xl font-semibold">
            Invalid Reset Link
          </CardTitle>
          <CardDescription className="mt-1">
            This password reset link is invalid or has expired. Please request a
            new one.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild className="w-full" size="lg">
            <Link href="/forgot-password">Request New Reset Link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="size-7 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4 text-xl font-semibold">
            Password Reset Successfully!
          </CardTitle>
          <CardDescription className="mt-1">
            Redirecting to login...
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild className="w-full" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Lock className="size-7 text-primary" />
        </div>
        <CardTitle className="mt-4 text-xl font-semibold">
          Reset Password
        </CardTitle>
        <CardDescription className="mt-1">
          Enter your new password below
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="Enter new password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
          {newPassword.length > 0 && (
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <span>Password Requirements</span>
              </div>
              <div className="space-y-1.5 pl-6">
                {rules.map((rule) => (
                  <PasswordRule
                    key={rule.label}
                    label={rule.label}
                    valid={rule.valid}
                  />
                ))}
                {confirmPassword.length > 0 && (
                  <PasswordRule
                    label="Passwords match"
                    valid={passwordsMatch}
                  />
                )}
              </div>
            </div>
          )}

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!isFormValid || loading}
          >
            {loading && <Loader2 className="animate-spin" />}
            Reset Password
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-center gap-3">
          <span className="text-sm text-muted-foreground">Back to</span>
          <Button asChild variant="link" className="h-auto p-0">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
