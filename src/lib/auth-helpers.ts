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
