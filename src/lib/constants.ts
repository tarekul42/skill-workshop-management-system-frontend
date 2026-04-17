if (!process.env.NEXT_PUBLIC_BACKEND_API_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_API_URL is not configured");
}

export const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL as string;

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export const DASHBOARD_ROUTES = {
  SUPER_ADMIN: "/super-admin/dashboard",
  ADMIN: "/admin/dashboard",
  INSTRUCTOR: "/instructor/dashboard",
  STUDENT: "/student/dashboard",
} as const;
