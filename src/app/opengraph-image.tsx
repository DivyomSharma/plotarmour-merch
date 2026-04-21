import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PlotArmour Merch | Premium Bulk Merch & Gifting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0b0b0d",
          color: "#f4f0e8",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top left, rgba(168,58,44,0.22), transparent 28%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            backgroundImage:
              "linear-gradient(to right, #f4f0e8 1px, transparent 1px), linear-gradient(to bottom, #f4f0e8 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "56px 64px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 860,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 26,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(244,240,232,0.7)",
              }}
            >
              PlotArmour Merch
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 86,
                lineHeight: 0.92,
                fontWeight: 700,
                letterSpacing: "-0.06em",
              }}
            >
              <span style={{ display: "flex" }}>Premium merch and gifting</span>
              <span style={{ display: "flex" }}>for campuses, teams, and brands.</span>
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 780,
                fontSize: 28,
                lineHeight: 1.45,
                color: "rgba(244,240,232,0.72)",
              }}
            >
              Design, production, packaging, and delivery for bulk orders that
              need to feel considered.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 18,
              alignItems: "center",
            }}
          >
            {["MOQ from 30", "Quote in 24h", "Pan-India delivery"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  padding: "14px 20px",
                  borderRadius: 999,
                  border: "1px solid rgba(244,240,232,0.16)",
                  color: "rgba(244,240,232,0.84)",
                  fontSize: 22,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
