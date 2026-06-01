import type { MetadataRoute } from "next";
import { LANDING_PAGES, SITE_URL } from "@/lib/landing";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return LANDING_PAGES.map((p) => ({
    url: p.slug ? `${SITE_URL}/${p.slug}` : SITE_URL,
    lastModified: now,
    changeFrequency: "weekly",
    priority: p.slug === "" ? 1 : 0.8,
  }));
}
