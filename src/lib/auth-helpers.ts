import { DASHBOARD_ROUTES } from "./constants";

// ─── User Persistence (localStorage) ───────────────────────────────

const USER_KEY = "skillworkshop_user";

export interface SavedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
  isVerified: boolean;
}

export function saveUser(user: SavedUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getSavedUser(): SavedUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedUser;
  } catch {
    return null;
  }
}

export function clearSavedUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return getSavedUser() !== null;
}

export function getUserRole(): string | null {
  const user = getSavedUser();
  return user?.role ?? null;
}

export function redirectToDashboard(role: string): string {
  return DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES] ?? "/login";
}

// ─── Auth Cookie (for middleware route protection) ─────────────────

const ROLE_COOKIE = "swms_role";
const COOKIE_MAX_AGE_DAYS = 7;

/**
 * Sets the `swms_role` cookie so that the Edge middleware can read the
 * user's role on subsequent requests. Must be called on login.
 */
export function setAuthCookie(role: string): void {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60; // 7 days in seconds
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(role)};path=/;max-age=${maxAge};SameSite=Lax`;
}

/**
 * Reads the `swms_role` cookie from the browser (client-side helper).
 * Returns the role string or `null`.
 */
export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ROLE_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

/**
 * Deletes the `swms_role` cookie. Must be called on logout.
 */
export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE}=;path=/;max-age=0;SameSite=Lax`;
}

// ─── OTP Flow (sessionStorage) ─────────────────────────────────────

const OTP_EMAIL_KEY = "skillworkshop_otp_email";
const OTP_NAME_KEY = "skillworkshop_otp_name";

export function storeOTPEmail(email: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(OTP_EMAIL_KEY, email);
}

/** Alias — both names used across pages */
export { storeOTPEmail as setOTPEmail };

export function getOTPEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(OTP_EMAIL_KEY);
}

export function clearOTPEmail(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(OTP_EMAIL_KEY);
}

export function storeOTPName(name: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(OTP_NAME_KEY, name);
}

/** Alias */
export { storeOTPName as setOTPName };

export function getOTPName(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(OTP_NAME_KEY);
}
