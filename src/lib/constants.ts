const _BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!_BACKEND_URL) {
  if (typeof window !== "undefined") {
    console.error("FATAL: NEXT_PUBLIC_BACKEND_API_URL is not set. Application cannot function.");
  }
  throw new Error(
    "NEXT_PUBLIC_BACKEND_API_URL environment variable is required but not set."
  );
}

export const BACKEND_API_URL = _BACKEND_URL;

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export const DASHBOARD_ROUTES = {
  SUPER_ADMIN: "/super-admin/dashboard",
  ADMIN: "/admin/dashboard",
  INSTRUCTOR: "/instructor/dashboard",
  STUDENT: "/student/dashboard",
} as const;
