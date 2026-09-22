import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

/** Brand-aware Open Graph image generator. Query params: title, subtitle, theme (light/dark), accent. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Aalm Vastralay").slice(0, 80);
  const subtitle = (searchParams.get("subtitle") ?? "Wedding & ethnic wear marketplace · COD · 7-day returns").slice(0, 140);
  const brand = searchParams.get("brand") ?? "आ";
  const theme = (searchParams.get("theme") ?? "light") === "dark" ? "dark" : "light";
  const accent = searchParams.get("accent") ?? "#7a1f2b";
  const fg = theme === "dark" ? "#f7f2ec" : "#1f1a17";
  const bg = theme === "dark" ? "#12100f" : "#fffbf5";
  const accentSoft = theme === "dark" ? "#1c1917" : "#fdf6ea";

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: bg, color: fg, fontFamily: "Georgia, serif", position: "relative" }}>
        <div style={{ position: "absolute", top: 48, left: 64, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#c9a227", fontSize: 40 }}>
            {brand}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 32, fontWeight: 700 }}>Aalm Vastralay</span>
            <span style={{ fontSize: 16, color: theme === "dark" ? "#a2968a" : "#6b5a4a" }}>Wedding & ethnic wear marketplace</span>
          </div>
        </div>
        <div style={{ position: "absolute", top: 200, left: 64, right: 64, display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>
          <span style={{ padding: "8px 16px", background: accent, color: "white", borderRadius: 999, fontSize: 16, alignSelf: "flex-start" }}>Wedding season · up to 45% off</span>
          <span style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05 }}>{title}</span>
          <span style={{ fontSize: 22, color: theme === "dark" ? "#a2968a" : "#6b5a4a" }}>{subtitle}</span>
        </div>
        <div style={{ position: "absolute", bottom: 48, left: 64, right: 64, display: "flex", gap: 14 }}>
          {["Cash on Delivery", "7-day returns", "Verified sellers", "Free delivery"].map((t) => (
            <span key={t} style={{ padding: "8px 16px", background: accentSoft, color: fg, borderRadius: 999, fontSize: 16, border: `1px solid ${theme === "dark" ? "#322b27" : "#ead7b8"}` }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
