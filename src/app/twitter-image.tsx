import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Aalm Vastralay – Wedding & Ethnic Wear Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Twitter summary-large-image (same branded artwork as the default OG image). */
export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg,#4d1420 0%,#7a1f2b 55%,#9a2a45 100%)",
          color: "#fffbf5",
          fontFamily: "Georgia, serif",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 84, height: 84, borderRadius: 999, background: "#7a1f2b", border: "2px solid #c9a227", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a227", fontSize: 48 }}>
            आ
          </div>
          <span style={{ fontSize: 36, fontWeight: 700 }}>Aalm Vastralay</span>
        </div>
        <span style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, marginTop: "auto", maxWidth: 900 }}>
          Lehengas, sarees &amp; sherwanis straight from India&apos;s artisans
        </span>
        <span style={{ fontSize: 20, color: "#ead06f", marginTop: 16 }}>Cash on Delivery · 7-day returns · Verified sellers</span>
      </div>
    ),
    { ...size },
  );
}
