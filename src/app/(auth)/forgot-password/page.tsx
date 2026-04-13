"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Mail, Loader2 } from "lucide-react";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    setLoading(true);
    try {
      await apiClient("/auth/forgot-password", { method: "POST", body: { email } });
    } catch {
      // Always show success regardless of API response (anti-enumeration)
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <Card className="w-full max-w-md">
      {submitted ? (
        <>
          <CardHeader className="items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Mail className="size-7 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="mt-4 text-xl font-semibold">
              Check Your Email
            </CardTitle>
            <CardDescription className="mt-1">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              The link expires in 10 minutes.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button asChild className="w-full" size="lg">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Lock className="size-7 text-primary" />
            </div>
            <CardTitle className="mt-4 text-xl font-semibold">
              Forgot Password?
            </CardTitle>
            <CardDescription className="mt-1">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !email.trim()}
              >
                {loading && <Loader2 className="animate-spin" />}
                Send Reset Link
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
        </>
      )}
    </Card>
  );
}
