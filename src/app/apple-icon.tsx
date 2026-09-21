import { ImageResponse } from "next/og";

export const runtime = "edge";
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
          background: "linear-gradient(135deg,#7a1f2b,#4d1420)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#c9a227",
          fontSize: 108,
          fontFamily: "Georgia, serif",
        }}
      >
        आ
      </div>
    ),
    { ...size },
  );
}
