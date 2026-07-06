"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { clearAccessToken } from "@/lib/api-client";
import { clearSavedUser } from "@/lib/auth-helpers";
import { clearSecureAuthCookie } from "@/app/actions/auth";
import { apiClient } from "@/lib/api-client";

export function useLogout() {
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await apiClient("/auth/logout", { method: "POST", skipCsrf: true });
    } catch {
      // Continue with client-side cleanup even if backend call fails
    }
    clearSavedUser();
    clearAccessToken();
    await clearSecureAuthCookie();
    router.push("/login");
  }, [router]);

  return logout;
}
