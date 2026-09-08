import type { MetadataRoute } from "next";

const BASE_URL = "https://www.travelershuttlesandtours.co.za";

// Public marketing pages only — private/functional routes (admin, dashboard,
// auth) are deliberately excluded so they aren't indexed.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/",         priority: 1.0, changeFrequency: "weekly" },
    { path: "/book",     priority: 0.9, changeFrequency: "monthly" },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about",    priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact",  priority: 0.6, changeFrequency: "monthly" },
  ];

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
