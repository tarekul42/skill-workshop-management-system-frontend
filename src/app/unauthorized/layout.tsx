import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Access Denied | Skill Workshop",
  },
  description:
    "You do not have permission to access this page. Please sign in with an authorized account or contact your administrator.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
