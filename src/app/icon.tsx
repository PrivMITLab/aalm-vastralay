import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon – royal purple medallion with imperial gold "AV" monogram. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 999,
          background: "#4A148C",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#D4AF37",
          fontSize: 32,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          boxShadow: "inset 0 0 0 3px #D4AF37",
        }}
      >
        AV
      </div>
    ),
    { ...size },
  );
}
