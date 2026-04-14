export const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  "https://skill-workshop-management-system-backend.vercel.app/api/v1";
export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export const DASHBOARD_ROUTES = {
  SUPER_ADMIN: "/super-admin/dashboard",
  ADMIN: "/admin/dashboard",
  INSTRUCTOR: "/instructor/dashboard",
  STUDENT: "/student/dashboard",
} as const;
