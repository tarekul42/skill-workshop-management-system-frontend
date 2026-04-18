import { FRONTEND_URL } from "@/lib/constants";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify-otp",
          "/google/callback",
          "/unauthorized",
        ],
      },
      {
        userAgent: "*",
        disallow: ["/super-admin/*", "/admin/*", "/instructor/*", "/student/*"],
      },
    ],
    sitemap: `${FRONTEND_URL}/sitemap.xml`,
  };
}
