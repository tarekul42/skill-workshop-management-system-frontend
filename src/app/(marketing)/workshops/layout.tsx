import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Workshops",
  description:
    "Explore our wide range of expert-led workshops. Filter by category, level, and location to find the perfect workshop to advance your skills and career.",
  openGraph: {
    title: "Browse Workshops | Skill Workshop",
    description:
      "Explore our wide range of expert-led workshops. Find the perfect workshop to advance your skills and career.",
  },
};

export default function WorkshopsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
