import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Skill Workshop team. Have questions about our workshops, need help with enrollment, or want to partner with us? We would love to hear from you.",
  openGraph: {
    title: "Contact Us | Skill Workshop",
    description:
      "Get in touch with the Skill Workshop team. Questions about workshops, enrollment, or partnerships? Contact us today.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
