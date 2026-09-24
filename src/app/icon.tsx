import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Official Favicon – royal maroon medallion with imperial gold "आ" monogram. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          background: "linear-gradient(135deg, #4d0e19 0%, #7a1f2b 55%, #9a2a45 100%)",
          border: "2.5px solid #D4AF37",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#D4AF37",
          fontSize: 38,
          fontWeight: 800,
          fontFamily: "'Noto Serif Devanagari', 'Mangal', serif, Georgia",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)",
        }}
      >
        आ
      </div>
    ),
    { ...size },
  );
}
