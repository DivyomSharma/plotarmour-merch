import type { Metadata } from "next";
import { Inter, Major_Mono_Display, Space_Grotesk } from "next/font/google";
import { CustomCursor } from "@/components/custom-cursor";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const siteUrl = "https://merch.theplotarmour.xyz";
const siteName = "PlotArmour Merch";
const defaultTitle = "PlotArmour Merch | Bulk Merch & Corporate Gifting";
const defaultDescription =
  "PlotArmour Merch designs, manufactures, and delivers bulk merch, swag kits, and corporate gifting for colleges, schools, startups, and corporate teams across India.";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const majorMono = Major_Mono_Display({
  variable: "--font-major-mono",
  subsets: ["latin"],
  weight: "400",
});

const themeInitScript = `
(() => {
  try {
    const storageKey = "plotarmour-theme";
    const storedTheme = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : prefersDark
          ? "dark"
          : "light";
    document.documentElement.dataset.theme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | PlotArmour Merch",
  },
  description: defaultDescription,
  applicationName: siteName,
  referrer: "origin-when-cross-origin",
  keywords: [
    "bulk merch",
    "custom merch",
    "corporate gifting",
    "swag kits",
    "college fest merch",
    "school farewell hoodies",
    "startup team merch",
    "corporate swag",
    "bulk t-shirts",
    "custom hoodies",
    "event merchandise",
    "employee onboarding kits",
    "India merch supplier",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  category: "Business",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "PlotArmour Merch premium bulk merch and gifting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${majorMono.variable} h-full scroll-smooth antialiased`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <SmoothScroll />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
