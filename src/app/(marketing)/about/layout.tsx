import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Skill Workshop — our mission, story, and the passionate team behind Bangladesh's leading workshop platform. Empowering individuals with practical, industry-ready skills since 2023.",
  openGraph: {
    title: "About Us | Skill Workshop",
    description:
      "Learn about our mission, story, and the team behind Bangladesh's leading workshop platform.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
