import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://merch.theplotarmour.store"),
  title: "PlotArmour Merch | Bulk Merch & Corporate Gifting",
  description:
    "PlotArmour Merch designs, manufactures, and delivers bulk merch, swag kits, and corporate gifting for colleges, startups, schools, and teams.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PlotArmour Merch",
    description:
      "Custom merch that does not look mid. Bulk merch, swag kits, and gifting for college drops, school communities, startups, and corporates.",
    url: "https://merch.theplotarmour.store",
    siteName: "PlotArmour Merch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlotArmour Merch",
    description:
      "Bulk merch and gifting for colleges, clubs, teams, and brands.",
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
      className={`${inter.variable} ${spaceGrotesk.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
