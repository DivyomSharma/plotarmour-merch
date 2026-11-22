import { ImageResponse } from "next/og";
import { getKitBySlug, kits } from "@/lib/kits";

export const alt = "PlotArmour Merch curated merchandise kit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return kits.map((kit) => ({ slug: kit.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const kit = getKitBySlug((await params).slug);
  const title = kit?.name ?? "Curated merchandise kit";
  const detail = kit?.summary ?? "Plan a considered bulk merchandise brief.";

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", padding: 64, background: "#0b0b0d", color: "#f4f0e8", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", color: "#e5806f", fontSize: 24, letterSpacing: "0.16em", textTransform: "uppercase" }}>PlotArmour Merch · Curated kit</div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
        <div style={{ display: "flex", fontSize: 86, lineHeight: 0.95, fontWeight: 700, letterSpacing: "-0.06em" }}>{title}</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 30, lineHeight: 1.35, color: "rgba(244,240,232,0.72)" }}>{detail}</div>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "rgba(244,240,232,0.72)" }}>Indicative planning only · Final details confirmed in quote</div>
    </div>,
    size,
  );
}
