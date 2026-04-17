import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    absolute: "Dashboard | Skill Workshop",
  },
  description: "Manage your workshops, enrollments, students, and settings from your Skill Workshop dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

import { notFound } from "next/navigation";

const VALID_ROLES = ["super-admin", "admin", "instructor", "student"];

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

  const normalizedRole = role.toUpperCase().replace("-", "_") as
    | "SUPER_ADMIN"
    | "ADMIN"
    | "INSTRUCTOR"
    | "STUDENT";

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar
          role={normalizedRole}
        />
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
