"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b0b0d", color: "#f4f0e8", fontFamily: "Arial, sans-serif", padding: "24px" }}>
        <main style={{ maxWidth: "640px", border: "1px solid rgba(244,240,232,.2)", borderRadius: "24px", padding: "32px" }}>
          <p style={{ color: "#e5806f", fontSize: "12px", fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase" }}>Something went wrong</p>
          <h1 style={{ fontSize: "clamp(2rem, 8vw, 4rem)", lineHeight: 1, margin: "16px 0" }}>We could not load the site.</h1>
          <p style={{ color: "rgba(244,240,232,.72)", lineHeight: 1.6 }}>No quote request was sent from this screen. Please try again or return to the catalogue.</p>
          <p><button type="button" onClick={reset} style={{ border: 0, borderRadius: "999px", background: "#a83a2c", color: "white", cursor: "pointer", fontWeight: 700, marginTop: "16px", padding: "12px 20px" }}>Try again</button></p>
          <p><Link href="/" style={{ color: "#f4f0e8" }}>Browse catalogue</Link> · <Link href="/order" style={{ color: "#f4f0e8" }}>Request a quote</Link></p>
        </main>
      </body>
    </html>
  );
}
