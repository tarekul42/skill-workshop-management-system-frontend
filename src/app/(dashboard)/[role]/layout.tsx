import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    absolute: "Dashboard | Skill Workshop",
  },
  description:
    "Manage your workshops, enrollments, students, and settings from your Skill Workshop dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { notFound, redirect } from "next/navigation";

const VALID_ROLES = ["super-admin", "admin", "instructor", "student"];

const ROLE_COOKIE_MAP: Record<string, string> = {
  "super-admin": "SUPER_ADMIN",
  admin: "ADMIN",
  instructor: "INSTRUCTOR",
  student: "STUDENT",
};

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;

  if (!VALID_ROLES.includes(role)) {
    notFound();
  }

  // Server-side auth guard: verify the swms_role cookie matches this route
  const secret = getSecret();
  if (secret) {
    const cookieStore = await cookies();
    const token = cookieStore.get("swms_role")?.value;

    if (!token) {
      redirect("/login");
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const cookieRole = (payload.role as string) ?? null;
      const expectedRole = ROLE_COOKIE_MAP[role];

      if (cookieRole !== expectedRole) {
        // Wrong role — redirect to their correct dashboard
        const dashMap: Record<string, string> = {
          SUPER_ADMIN: "/super-admin/dashboard",
          ADMIN: "/admin/dashboard",
          INSTRUCTOR: "/instructor/dashboard",
          STUDENT: "/student/dashboard",
        };
        redirect(dashMap[cookieRole ?? ""] ?? "/login");
      }
    } catch {
      // Invalid/expired JWT → redirect to login
      redirect("/login");
    }
  }

  const normalizedRole = role.toUpperCase().replace("-", "_") as
    | "SUPER_ADMIN"
    | "ADMIN"
    | "INSTRUCTOR"
    | "STUDENT";

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar role={normalizedRole} />
        <div className="flex flex-1 flex-col lg:pl-64">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
