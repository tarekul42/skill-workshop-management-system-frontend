import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Google Sign-In | Skill Workshop",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function GoogleCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
