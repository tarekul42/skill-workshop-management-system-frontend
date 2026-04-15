import type { MetadataRoute } from "next";
import { FRONTEND_URL, BACKEND_API_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: FRONTEND_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${FRONTEND_URL}/workshops`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${FRONTEND_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${FRONTEND_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${FRONTEND_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Dynamic workshop pages
  let workshopPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BACKEND_API_URL}/workshop?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const workshops = json?.data ?? [];
      if (Array.isArray(workshops)) {
        workshopPages = workshops.map((workshop: { slug: string; updatedAt?: string }) => ({
          url: `${FRONTEND_URL}/workshops/${workshop.slug}`,
          lastModified: workshop.updatedAt ? new Date(workshop.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      }
    }
  } catch {
    // Non-critical — if the backend is down, we still return static pages
  }

  return [...staticPages, ...workshopPages];
}
