import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/packages"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/venues"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/build-event"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/request-proposal"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/track"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
