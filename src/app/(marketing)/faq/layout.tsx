import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Find answers to frequently asked questions about Skill Workshop. Learn about enrollment, payments, workshops, cancellation policies, and more.",
  openGraph: {
    title: "Frequently Asked Questions | Skill Workshop",
    description:
      "Find answers to common questions about workshops, enrollment, payments, and more.",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
