const siteUrl = "https://merch.theplotarmour.xyz";
const merchEmail = "merch@theplotarmour.xyz";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "PlotArmour Merch",
      url: siteUrl,
      logo: `${siteUrl}/brand/plotarmour-logo-white.png`,
      email: merchEmail,
      description:
        "Bulk merch, swag kits, and corporate gifting for colleges, schools, startups, and corporate teams across India.",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: merchEmail,
          availableLanguage: ["en", "hi"],
          url: siteUrl,
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "PlotArmour Merch",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#service`,
      name: "Bulk merch and corporate gifting",
      url: siteUrl,
      description:
        "Design, manufacturing, packaging, and delivery for bulk merch, campus merchandise, employee gifting, and swag kits.",
      provider: {
        "@id": `${siteUrl}/#organization`,
      },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      availableLanguage: ["en", "hi"],
      audience: [
        { "@type": "Audience", audienceType: "Colleges and clubs" },
        { "@type": "Audience", audienceType: "Schools and student communities" },
        { "@type": "Audience", audienceType: "Startups and brands" },
        { "@type": "Audience", audienceType: "Corporate teams" },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Merch categories",
        itemListElement: [
          { "@type": "OfferCatalog", name: "T-Shirts" },
          { "@type": "OfferCatalog", name: "Hoodies and sweatshirts" },
          { "@type": "OfferCatalog", name: "Jackets" },
          { "@type": "OfferCatalog", name: "Caps and headwear" },
          { "@type": "OfferCatalog", name: "Drinkware" },
          { "@type": "OfferCatalog", name: "Bags and kits" },
          { "@type": "OfferCatalog", name: "Promo and tech" },
          { "@type": "OfferCatalog", name: "Uniforms and tracksuits" },
        ],
      },
    },
  ],
};

import { MerchLanding } from "@/components/merch-landing";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MerchLanding />
    </>
  );
}
