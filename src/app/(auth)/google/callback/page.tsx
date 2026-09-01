"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Loader2 } from "lucide-react";
import { saveUser, redirectToDashboard } from "@/lib/auth-helpers";
import { setSecureAuthCookie } from "@/app/actions/auth";
import { storeAccessToken } from "@/lib/api-client";
import { BACKEND_API_URL } from "@/lib/constants";

/**
 * Google OAuth callback page.
 *
 * Secure flow (code-exchange pattern):
 * 1. User clicks "Sign in with Google" → redirects to backend /auth/google
 * 2. Google authenticates → redirects to backend /auth/google/callback
 * 3. Backend generates a one-time auth code, stores tokens in Redis,
 *    and redirects here with only the code in the URL
 * 4. This page exchanges the code for tokens via POST (never exposes tokens in URL)
 * 5. Tokens are saved and the user is redirected to the dashboard
 *
 * Why code-exchange?
 * - Access tokens must NEVER appear in URLs (browser history, server logs, Referer headers)
 * - The code is a random hex string that is useless without the /auth/exchange-code endpoint
 * - The code is consumed (deleted) after first use, preventing replay attacks
 */
function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const code = searchParams.get("code");

        if (!code) {
          setError(
            "Google sign-in could not be completed. No authorization code was received. Please try signing in again."
          );
          return;
        }

        // Exchange the one-time code for tokens via a secure POST request.
        // This keeps access tokens out of the URL entirely.
        const res = await fetch(`${BACKEND_API_URL}/auth/exchange-code`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.message || `Token exchange failed (HTTP ${res.status})`);
        }

        const json = await res.json();

        if (!json.success || !json.data) {
          throw new Error("Invalid response from token exchange");
        }

        const { accessToken, user } = json.data;

        if (!accessToken || !user) {
          throw new Error("Missing tokens or user data in exchange response");
        }

        // Save tokens and user info client-side
        saveUser({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          picture: user.picture,
          isVerified: user.isVerified ?? true,
        });
        storeAccessToken(accessToken);
        await setSecureAuthCookie(user.role);
        router.push(redirectToDashboard(user.role));
      } catch (err) {
        console.error("Google OAuth callback error:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong during Google sign-in. Please try again.";
        setError(message);
      }
    }

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <GraduationCap className="text-muted-foreground size-12" />
        <h2 className="text-xl font-semibold">Sign-in Failed</h2>
        <p className="text-muted-foreground max-w-md text-center text-sm">{error}</p>
        <a
          href="/login"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 rounded-md px-4 py-2 text-sm"
        >
          Back to Login
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <GraduationCap className="text-primary size-12" />
      <h2 className="text-xl font-semibold">Completing sign-in...</h2>
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
      <p className="text-muted-foreground text-sm">Please wait while we set up your account.</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <GraduationCap className="text-primary size-12" />
          <h2 className="text-xl font-semibold">Loading...</h2>
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
