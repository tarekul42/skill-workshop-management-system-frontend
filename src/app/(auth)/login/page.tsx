"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock, X, AlertTriangle, BookOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AnimatedPage } from "@/components/ui/animated-page";
import { saveUser, redirectToDashboard } from "@/lib/auth-helpers";
import { setSecureAuthCookie } from "@/app/actions/auth";
import { apiClient, storeAccessToken } from "@/lib/api-client";
import { BACKEND_API_URL, DEMO_CREDENTIALS, type DemoRole } from "@/lib/constants";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Show error from URL query param (e.g. OAuth redirect errors)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(decodeURIComponent(urlError));
    }
  }, [searchParams]);

  async function onSubmit(values: LoginInput) {
    setError("");
    setLoading(true);

    try {
      const data = await apiClient<{
        accessToken: string;
        refreshToken: string;
        user: {
          _id: string;
          name: string;
          email: string;
          role: string;
          picture?: string;
          isVerified: boolean;
        };
      }>("/auth/login", {
        method: "POST",
        body: values,
      });

      saveUser(data.user);
      storeAccessToken(data.accessToken);
      await setSecureAuthCookie(data.user.role);
      router.push(redirectToDashboard(data.user.role));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatedPage className="w-full">
      <Card className="border-border bg-surface-1 shadow-3 sm:rounded-3xl sm:p-4">
        {/* Logo & Header */}
        <CardHeader className="items-center pb-0 text-center">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <BookOpen className="text-primary size-9" />
            <span className="font-display text-2xl font-bold">Skill Workshop</span>
          </Link>
          <h1 className="font-display text-[28px] font-bold">Welcome back</h1>
          <CardDescription className="text-foreground-muted mt-1 mb-7 text-[14px]">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          {/* Google */}
          <Button
            variant="outline"
            className="border-border bg-background hover:bg-surface-2 hover:border-border-strong h-11 w-full rounded-[10px] border-[1.5px] text-[15px] font-medium transition-colors"
            asChild
          >
            <a href={`${BACKEND_API_URL}/auth/google?redirect=google/callback`}>
              <svg className="mr-2 size-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </a>
          </Button>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-2">
            <Separator className="border-border absolute w-full" />
            <span className="bg-surface-1 text-foreground-muted relative px-4 text-[12px]">
              or sign in with email
            </span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5">
                    <FormLabel className="text-foreground text-[13px] font-semibold">
                      Email
                    </FormLabel>
                    <div className="relative">
                      <Mail className="text-foreground-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <FormControl>
                        <Input placeholder="name@example.com" className="h-11 pl-9" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-foreground text-[13px] font-semibold">
                        Password
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-primary text-[13px] font-medium hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="text-foreground-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="h-11 pr-10 pl-9"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-foreground-muted hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                        aria-label={
                          showPassword ? "Hide password visibility" : "Show password visibility"
                        }
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error message */}
              {error && (
                <div
                  className="border-l-danger bg-danger-subtle relative flex items-start gap-2 rounded-lg border-l-[3px] px-4 py-3"
                  role="alert"
                >
                  <AlertTriangle className="text-danger mt-0.5 size-4 shrink-0" />
                  <p className="text-danger flex-1 pr-4 text-[14px]">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="text-danger/70 hover:text-danger absolute top-2 right-2 shrink-0"
                    aria-label="Dismiss error"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="mt-1 h-12 w-full text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        {/* ── Demo Login Buttons ─────────────────────────────────── */}
        <div className="border-border bg-surface-1 border-t px-6 pt-6 pb-2">
          <p className="text-foreground-muted mb-4 text-center text-xs font-semibold tracking-wider uppercase">
            Quick Demo Access
          </p>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {(Object.keys(DEMO_CREDENTIALS) as DemoRole[]).map((role) => {
              const cred = DEMO_CREDENTIALS[role];
              const hasCreds = cred.email && cred.password;
              return (
                <Button
                  key={role}
                  type="button"
                  variant="outline"
                  disabled={loading || !hasCreds}
                  onClick={() => {
                    if (!hasCreds) return;
                    form.setValue("email", cred.email);
                    form.setValue("password", cred.password);
                    setTimeout(() => {
                      form.handleSubmit(onSubmit)();
                    }, 0);
                  }}
                  className="border-border bg-background hover:bg-surface-2 hover:border-border-strong h-auto rounded-xl border px-1 py-3 text-center whitespace-normal transition-all disabled:opacity-40 sm:px-2"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-foreground text-sm leading-none font-bold">
                      {cred.label}
                    </span>
                    <span className="text-foreground-muted text-[10px] leading-tight font-medium">
                      {hasCreds ? "Auto-fill & Sign in" : "Not configured"}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Footer links */}
        <CardFooter className="flex-col gap-2 pt-0 pb-2">
          <p className="text-foreground-muted flex flex-wrap items-center justify-center gap-x-1.5 text-center text-[14px]">
            <span>Don&apos;t have an account?</span>
            <Link href="/register" className="text-primary font-medium hover:underline">
              Sign up as Student
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
