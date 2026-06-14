const _BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const BACKEND_API_URL = _BACKEND_URL ?? "http://localhost:5000";

export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export const DASHBOARD_ROUTES = {
  SUPER_ADMIN: "/super-admin/dashboard",
  ADMIN: "/admin/dashboard",
  INSTRUCTOR: "/instructor/dashboard",
  STUDENT: "/student/dashboard",
} as const;

// ─── Demo Login Credentials ──────────────────────────────────────────

export const DEMO_CREDENTIALS = {
  student: {
    email: process.env.NEXT_PUBLIC_DEMO_STUDENT_EMAIL ?? "",
    password: process.env.NEXT_PUBLIC_DEMO_STUDENT_PASSWORD ?? "",
    label: "Student",
  },
  admin: {
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "",
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? "",
    label: "Admin",
  },
  instructor: {
    email: process.env.NEXT_PUBLIC_DEMO_INSTRUCTOR_EMAIL ?? "",
    password: process.env.NEXT_PUBLIC_DEMO_INSTRUCTOR_PASSWORD ?? "",
    label: "Instructor",
  },
} as const;

export type DemoRole = keyof typeof DEMO_CREDENTIALS;
