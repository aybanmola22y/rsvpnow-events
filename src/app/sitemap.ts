import type { MetadataRoute } from "next";
import { seedPackages } from "@/lib/mock-data/packages";
import { seedVenues } from "@/lib/mock-data/venues";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/packages"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/venues"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/build-event"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/request-proposal"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const packageRoutes: MetadataRoute.Sitemap = seedPackages
    .filter((item) => item.published)
    .map((item) => ({
      url: absoluteUrl(`/packages/${item.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const venueRoutes: MetadataRoute.Sitemap = seedVenues
    .filter((item) => item.published)
    .map((item) => ({
      url: absoluteUrl(`/venues/${item.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...packageRoutes, ...venueRoutes];
}
