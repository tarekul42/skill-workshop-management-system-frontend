import type { Metadata } from "next";
import { AuthSidebar } from "./AuthSidebar";

export const metadata: Metadata = {
  title: {
    absolute: "Skill Workshop | Authentication",
  },
  description:
    "Sign in to your Skill Workshop account to manage enrollments, view workshops, and track your learning progress.",
  robots: {
    index: false,
    follow: false,
  },
};

import { getAuthRole } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/lib/constants";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const role = await getAuthRole();
  if (role) {
    const dashboardUrl = DASHBOARD_ROUTES[role as keyof typeof DASHBOARD_ROUTES];
    if (dashboardUrl) {
      redirect(dashboardUrl);
    }
  }
  return (
    <div className="bg-background flex min-h-screen">
      {/* Left Panel - Hidden on mobile, 40% width on desktop */}
      <AuthSidebar />

      {/* Right Panel - 100% on mobile, 60% on desktop */}
      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-3/5 lg:p-12">
        <div className="w-full max-w-[480px]">{children}</div>
      </div>
    </div>
  );
}
