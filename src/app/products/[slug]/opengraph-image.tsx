import { ImageResponse } from "next/og";
import { catalogProducts } from "@/lib/product-catalog";

export const alt = "PlotArmour Merch catalogue product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return catalogProducts.map((product) => ({ slug: product.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = catalogProducts.find((candidate) => candidate.slug === slug);
  const title = product?.name ?? "Bulk merchandise product";
  const detail = product ? `${product.material} · ${product.gsm} · MOQ 10 pieces` : "Product facts and an indicative estimate for your brief.";

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", padding: 64, background: "#0b0b0d", color: "#f4f0e8", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", color: "#e5806f", fontSize: 24, letterSpacing: "0.16em", textTransform: "uppercase" }}>PlotArmour Merch · Catalogue</div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
        <div style={{ display: "flex", fontSize: 86, lineHeight: 0.95, fontWeight: 700, letterSpacing: "-0.06em" }}>{title}</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 30, lineHeight: 1.35, color: "rgba(244,240,232,0.72)" }}>{detail}</div>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "rgba(244,240,232,0.72)" }}>Indicative blank-garment price, ex-GST · Final price confirmed in quote</div>
    </div>,
    size,
  );
}
