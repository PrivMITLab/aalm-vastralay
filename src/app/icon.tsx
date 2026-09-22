import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon – maroon medallion with the gold Devanagari monogram “आ”. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          background: "linear-gradient(135deg,#7a1f2b,#4d1420)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#c9a227",
          fontSize: 40,
          fontFamily: "Georgia, serif",
          boxShadow: "inset 0 0 0 2px rgba(201,162,39,0.55)",
        }}
      >
        आ
      </div>
    ),
    { ...size },
  );
}
