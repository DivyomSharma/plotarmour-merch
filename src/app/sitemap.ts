import type { MetadataRoute } from "next";

const siteUrl = "https://merch.theplotarmour.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
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
