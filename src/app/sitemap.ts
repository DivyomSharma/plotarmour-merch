import type { MetadataRoute } from "next";
import { kits } from "@/lib/kits";

const siteUrl = "https://merch.plotarmour.in";
const lastModified = new Date("2026-05-12");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [
        `${siteUrl}/brand/plotarmour-logo-white.png`,
        `${siteUrl}/products/tshirt.png`,
        `${siteUrl}/products/hoodie.png`,
        `${siteUrl}/products/kit.png`,
        `${siteUrl}/products/bottle.png`,
      ],
    },
    {
      url: `${siteUrl}/kits`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...kits.map((kit) => ({
      url: `${siteUrl}/kits/${kit.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
