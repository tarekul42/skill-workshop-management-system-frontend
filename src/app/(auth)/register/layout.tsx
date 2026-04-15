import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Create Account | Skill Workshop",
  },
  description:
    "Create your free Skill Workshop account. Sign up as a student to enroll in workshops, or as an instructor to share your expertise.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
