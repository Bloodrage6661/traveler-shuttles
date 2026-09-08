import type { MetadataRoute } from "next";

const BASE_URL = "https://www.travelershuttlesandtours.co.za";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private/functional areas out of search results.
      disallow: ["/admin", "/api", "/dashboard", "/login", "/signup", "/forgot-password", "/reset-password", "/auth"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
