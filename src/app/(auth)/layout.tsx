import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Sign In | Skill Workshop",
  },
  description: "Sign in to your Skill Workshop account to manage enrollments, view workshops, and track your learning progress.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      {children}
    </div>
  );
}
