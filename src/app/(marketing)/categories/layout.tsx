import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse workshops by category. Find courses in web development, digital marketing, graphic design, data science, and more.",
  openGraph: {
    title: "Workshop Categories | Skill Workshop",
    description:
      "Browse workshops by category. Find courses in web development, digital marketing, graphic design, and more.",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
