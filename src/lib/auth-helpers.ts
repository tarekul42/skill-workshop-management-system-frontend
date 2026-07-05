import { DASHBOARD_ROUTES } from "./constants";

// ─── User Persistence (in-memory only) ────────────────────────────
// Stored in a module-level variable rather than localStorage so that
// an XSS attack cannot enumerate user data via storage APIs. Data
// is lost on page reload and must be restored via the API.

export interface SavedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
  isVerified: boolean;
  auths?: { provider: string; providerId: string }[];
}

let cachedUser: SavedUser | null = null;

export function saveUser(user: SavedUser): void {
  cachedUser = user;
}

export function getSavedUser(): SavedUser | null {
  return cachedUser;
}

export function clearSavedUser(): void {
  cachedUser = null;
}

export function isLoggedIn(): boolean {
  return cachedUser !== null;
}

export function getUserRole(): string | null {
  return cachedUser?.role ?? null;
}

export function redirectToDashboard(role: string): string {
  return DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES] ?? "/login";
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

export function clearOTPName(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(OTP_NAME_KEY);
}
