import type { MetadataRoute } from "next";
import { FRONTEND_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp", "/google/callback", "/unauthorized"],
      },
      {
        userAgent: "*",
        disallow: ["/super-admin/*", "/admin/*", "/instructor/*", "/student/*"],
      },
    ],
    sitemap: `${FRONTEND_URL}/sitemap.xml`,
  };
}
