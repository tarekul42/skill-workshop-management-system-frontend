import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Forgot Password | Skill Workshop",
  },
  description:
    "Reset your Skill Workshop account password. Enter your email to receive a password reset code.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
