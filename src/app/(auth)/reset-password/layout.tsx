import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Reset Password | Skill Workshop",
  },
  description: "Set a new password for your Skill Workshop account using the verification code sent to your email.",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
