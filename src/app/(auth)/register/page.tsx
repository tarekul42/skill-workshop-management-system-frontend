"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  AlertTriangle,
  BookOpen,
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
import { Separator } from "@/components/ui/separator";
import { storeOTPEmail } from "@/lib/auth-helpers";
import { apiClient } from "@/lib/api-client";
import { BACKEND_API_URL } from "@/lib/constants";
import { PasswordChecklist } from "@/components/ui/password-checklist";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AnimatedPage } from "@/components/ui/animated-page";
import { StepIndicator } from "@/components/ui/step-indicator";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({
    control: form.control,
    name: "password",
  });

  async function onSubmit(values: RegisterInput) {
    setError("");
    setLoading(true);
    try {
      await apiClient("/user/register", {
        method: "POST",
        body: {
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          phone: values.phone?.trim() || undefined,
        },
      });
      await apiClient("/otp/send", {
        method: "POST",
        body: {
          email: values.email.trim(),
          name: values.name.trim(),
        },
      });
      storeOTPEmail(values.email.trim());
      router.push("/verify-otp");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatedPage className="w-full">
      <Card className="border-border bg-surface-1 shadow-3 sm:rounded-3xl sm:p-4">
        <CardHeader className="pb-2 text-center">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2">
            <BookOpen className="text-primary size-9" />
            <span className="font-display text-2xl font-bold">Skill Workshop</span>
          </Link>
          <StepIndicator currentStep={1} />
          <CardTitle className="font-display mt-2 text-[28px] font-bold">Create Account</CardTitle>
          <CardDescription className="text-foreground-muted mt-1 mb-5 text-[14px]">
            Sign up as a student
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5">
                    <FormLabel>
                      <User className="mr-1.5 inline-block size-3.5" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5">
                    <FormLabel>
                      <Mail className="mr-1.5 inline-block size-3.5" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5">
                    <FormLabel>
                      <Phone className="mr-1.5 inline-block size-3.5" />
                      Phone <span className="text-foreground-muted font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+8801XXXXXXXXX" disabled={loading} {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">Bangladesh format</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5">
                    <FormLabel>
                      <Lock className="mr-1.5 inline-block size-3.5" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          disabled={loading}
                          className="pr-9"
                          {...field}
                        />
                        <button
                          type="button"
                          className="text-foreground-muted hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <PasswordChecklist password={password} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5">
                    <FormLabel>
                      <Lock className="mr-1.5 inline-block size-3.5" />
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          disabled={loading}
                          className="pr-9"
                          {...field}
                        />
                        <button
                          type="button"
                          className="text-foreground-muted hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 transition-colors"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div
                  className="border-l-danger bg-danger-subtle relative flex items-start gap-2 rounded-lg border-l-[3px] px-4 py-3"
                  role="alert"
                >
                  <AlertTriangle className="text-danger mt-0.5 size-4 shrink-0" />
                  <p className="text-danger flex-1 pr-4 text-[14px]">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-6">
            <Separator />
            <span className="bg-card text-foreground-muted absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
              or continue with
            </span>
          </div>

          {/* Google */}
          <Button variant="outline" className="w-full" size="lg" asChild>
            <a href={`${BACKEND_API_URL}/auth/google?redirect=google/callback`}>
              <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </a>
          </Button>
        </CardContent>

        <CardFooter className="flex-col gap-2 pt-2 pb-2">
          <p className="text-foreground-muted flex flex-wrap items-center justify-center gap-x-1.5 text-center text-[14px]">
            <span>Already have an account?</span>
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
            <span className="text-foreground-muted">·</span>
            <Link href="/register/instructor" className="text-primary font-medium hover:underline">
              Sign up as Instructor
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AnimatedPage>
  );
}
