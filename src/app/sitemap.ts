import type { MetadataRoute } from "next";

const siteUrl = "https://merch.theplotarmour.store";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
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
