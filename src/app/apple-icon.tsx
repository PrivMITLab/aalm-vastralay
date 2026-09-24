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
          background: "#4A148C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#D4AF37",
          fontSize: 88,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          boxShadow: "inset 0 0 0 6px #D4AF37",
        }}
      >
        AV
      </div>
    ),
    { ...size },
  );
}
