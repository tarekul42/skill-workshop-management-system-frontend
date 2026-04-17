import type { Metadata } from "next";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: {
    default:
      "Skill Workshop Management System — Expert-Led Workshops in Bangladesh",
    absolute:
      "Skill Workshop Management System — Expert-Led Workshops in Bangladesh",
  },
  description:
    "Discover and enroll in expert-led workshops across Bangladesh. Build practical skills in web development, digital marketing, graphic design, data science, and more. Affordable, hands-on training by verified instructors.",
  openGraph: {
    title:
      "Skill Workshop Management System — Expert-Led Workshops in Bangladesh",
    description:
      "Discover and enroll in expert-led workshops across Bangladesh. Build practical skills in web development, digital marketing, graphic design, and more.",
  },
};

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <div className="site-container pt-6 -mb-6 relative z-10">
          <Breadcrumbs />
        </div>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
