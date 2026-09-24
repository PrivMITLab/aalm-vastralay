import { ImageResponse } from "next/og";

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
          background: "linear-gradient(135deg, #3d0c14 0%, #7a1f2b 50%, #9e2739 100%)",
          color: "#FAF9F6",
          fontFamily: "Georgia, serif",
          position: "relative",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: 999,
              background: "#5a0e1b",
              border: "3px solid #D4AF37",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D4AF37",
              fontSize: 50,
              fontWeight: 700,
            }}
          >
            आ
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.5px" }}>Aalm Vastralay</span>
            <span style={{ fontSize: 18, color: "#ead06f", fontWeight: 500 }}>Wedding &amp; ethnic wear marketplace</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: "auto" }}>
          <span style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.1, maxWidth: 940 }}>
            Lehengas, sarees &amp; sherwanis straight from India&apos;s artisans
          </span>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            {["Cash on Delivery", "7-day returns", "Verified sellers", "0% seller commission"].map((t) => (
              <span
                key={t}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(234,208,111,0.45)",
                  color: "#FAF9F6",
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
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
