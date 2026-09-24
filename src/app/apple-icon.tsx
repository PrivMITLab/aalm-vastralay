import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon (iOS home screen). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #4d0e19 0%, #7a1f2b 55%, #9a2a45 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#D4AF37",
          fontSize: 96,
          fontWeight: 800,
          fontFamily: "'Noto Serif Devanagari', 'Mangal', serif, Georgia",
          boxShadow: "inset 0 0 0 5px #D4AF37",
        }}
      >
        आ
      </div>
    ),
    { ...size },
  );
}
