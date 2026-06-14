import type { MetadataRoute } from "next";
import { SITE_URL, SECONDARY_SLUGS } from "@/lib/landing";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    // Home page
    entries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    });

    // Secondary landing pages
    for (const slug of SECONDARY_SLUGS) {
      entries.push({
        url: `${SITE_URL}/${locale}/${slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    entries.push({
      url: `${SITE_URL}/${locale}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });

    entries.push({
      url: `${SITE_URL}/${locale}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });

    entries.push({
      url: `${SITE_URL}/${locale}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    });
  }

  return entries;
}
