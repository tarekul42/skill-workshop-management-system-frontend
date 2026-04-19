import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Verify Email | Skill Workshop",
  },
  description:
    "Verify your email address to activate your Skill Workshop account. Enter the 6-digit code sent to your email.",
};

export default function VerifyOtpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
