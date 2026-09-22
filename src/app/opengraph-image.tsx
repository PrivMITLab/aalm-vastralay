import { ImageResponse } from "next/og";

export const alt = "Aalm Vastralay – Wedding & Ethnic Wear Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default Open Graph / social share image for the whole site. */
export default function OpenGraphImage() {
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
          position: "relative",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 84, height: 84, borderRadius: 999, background: "#7a1f2b", border: "2px solid #c9a227", display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a227", fontSize: 48 }}>
            आ
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 36, fontWeight: 700 }}>Aalm Vastralay</span>
            <span style={{ fontSize: 18, color: "#ead06f" }}>Wedding & ethnic wear marketplace</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: "auto" }}>
          <span style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.08, maxWidth: 900 }}>
            Lehengas, sarees & sherwanis straight from India&apos;s artisans
          </span>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {["Cash on Delivery", "7-day returns", "Verified sellers", "0% seller commission"].map((t) => (
              <span key={t} style={{ padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(234,208,111,0.4)", fontSize: 18 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
