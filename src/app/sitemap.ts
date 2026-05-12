import type { MetadataRoute } from "next";

const siteUrl = "https://merch.theplotarmour.xyz";
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
  ];
}
