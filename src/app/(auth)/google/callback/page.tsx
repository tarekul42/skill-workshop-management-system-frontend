"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";
import { saveUser, setAuthCookie, redirectToDashboard } from "@/lib/auth-helpers";
import { storeAccessToken } from "@/lib/api-client";
import { BACKEND_API_URL } from "@/lib/constants";

/**
 * Google OAuth callback page.
 *
 * Flow:
 * 1. User clicks "Sign in with Google" → redirects to backend /auth/google
 * 2. Google authenticates → redirects to backend /auth/google/callback
 * 3. Backend sets cookies (refreshToken) and redirects here with tokens in URL
 * 4. This page extracts tokens, saves them, and redirects to dashboard
 *
 * The backend typically redirects with tokens as URL search params:
 *   /google/callback?accessToken=xxx&user=encodedJson
 *   OR the backend may set tokens in cookies and just redirect to this page.
 */
export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const accessToken = searchParams.get("accessToken");
        const userParam = searchParams.get("user");

        if (accessToken && userParam) {
          // Backend passed tokens directly in URL params
          const user = JSON.parse(decodeURIComponent(userParam));

          saveUser({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            picture: user.picture,
            isVerified: user.isVerified ?? true,
          });
          storeAccessToken(accessToken);
          setAuthCookie(user.role);
          router.push(redirectToDashboard(user.role));
          return;
        }

        // Alternative: tokens might be in cookies set by the backend
        // Try to get user info from a /user/me call using cookies
        const res = await fetch(`${BACKEND_API_URL}/user/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const json = await res.json();

          if (json.success && json.data) {
            const user = json.data;
            saveUser({
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              picture: user.picture,
              isVerified: user.isVerified ?? true,
            });

            // Try to extract access token from URL or use cookie-based auth
            const token = searchParams.get("accessToken");
            if (token) storeAccessToken(token);

            setAuthCookie(user.role);
            router.push(redirectToDashboard(user.role));
            return;
          }
        }

        // No valid session found
        setError("Google sign-in could not be completed. The authentication response was invalid or expired. Please try signing in again.");
      } catch (err) {
        console.error("Google OAuth callback error:", err);
        setError("Something went wrong during Google sign-in. Please try again.");
      }
    }

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <GraduationCap className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Sign-in Failed</h2>
        <p className="max-w-md text-center text-sm text-muted-foreground">
          {error}
        </p>
        <a
          href="/login"
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Back to Login
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <GraduationCap className="size-12 text-primary" />
      <h2 className="text-xl font-semibold">Completing sign-in...</h2>
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Please wait while we set up your account.
      </p>
    </div>
  );
}
