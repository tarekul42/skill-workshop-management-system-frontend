"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  X,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { saveUser, redirectToDashboard } from "@/lib/auth-helpers";
import { setSecureAuthCookie } from "@/app/actions/auth";
import { apiClient, storeAccessToken } from "@/lib/api-client";
import { BACKEND_API_URL } from "@/lib/constants";

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
      <Card className="border-border bg-surface-1 shadow-3 sm:rounded-[24px] sm:p-4">
        {/* Logo & Header */}
        <CardHeader className="items-center text-center pb-0">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <BookOpen className="size-9 text-primary" />
            <span className="font-display text-2xl font-bold">Skill Workshop</span>
          </Link>
          <CardTitle className="font-display text-[28px] font-bold">Welcome back</CardTitle>
          <CardDescription className="text-[14px] text-foreground-muted mt-1 mb-7">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-11 rounded-[10px] border-[1.5px] border-border bg-background hover:bg-surface-2 hover:border-border-strong text-[15px] font-medium transition-colors"
            asChild
          >
            <a href={`${BACKEND_API_URL}/auth/google?redirect=google/callback`}>
              <svg className="size-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
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
            <Separator className="absolute w-full border-border" />
            <span className="relative bg-surface-1 px-4 text-[12px] text-foreground-muted">
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
                    <FormLabel className="text-[13px] font-semibold text-foreground">Email</FormLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          className="pl-9 h-11"
                          {...field}
                        />
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
                      <FormLabel className="text-[13px] font-semibold text-foreground">Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-[13px] font-medium text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-9 pr-10 h-11"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                        aria-label={
                          showPassword
                            ? "Hide password visibility"
                            : "Show password visibility"
                        }
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error message */}
              {error && (
                <div
                  className="flex items-start gap-2 rounded-lg border-l-[3px] border-l-danger bg-danger-subtle px-4 py-3 relative"
                  role="alert"
                >
                  <AlertTriangle className="size-4 shrink-0 text-danger mt-0.5" />
                  <p className="flex-1 text-[14px] text-danger pr-4">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="absolute right-2 top-2 shrink-0 text-danger/70 hover:text-danger"
                    aria-label="Dismiss error"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              {/* Submit */}
              <Button type="submit" className="w-full h-12 text-base font-semibold mt-1" disabled={loading}>
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

        {/* Footer links */}
        <CardFooter className="flex-col gap-2 pt-0 pb-2">
          <p className="text-[14px] text-foreground-muted text-center flex items-center justify-center flex-wrap gap-x-1.5">
            <span>Don&apos;t have an account?</span>
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up as Student
            </Link>
            <span className="text-foreground-muted">·</span>
            <Link
              href="/register/instructor"
              className="text-primary hover:underline font-medium"
            >
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
