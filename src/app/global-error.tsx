"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Aalm Global Error]", error);
  }, [error]);

  return (
    <html lang="hi">
      <body
        style={{
          margin: 0,
          padding: "20px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: "#FDFBF7",
          color: "#1C1917",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            background: "#ffffff",
            border: "2px solid #722F37",
            borderRadius: "16px",
            padding: "28px",
            textAlign: "center",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              marginBottom: "12px",
            }}
          >
            👑
          </div>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#722F37",
              margin: "0 0 8px 0",
            }}
          >
            आलम वस्त्रालय · Aalm Vastralay
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#44403C",
              lineHeight: "1.5",
              margin: "0 0 18px 0",
            }}
          >
            Server se sampark toot gaya ya takneeki kharabi aayi. Kripya button dabakar dobara koshish karein.
            <br />
            <span style={{ fontSize: "12px", color: "#78716C" }}>
              (An unexpected error occurred. Please click below to retry.)
            </span>
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#A8A29E",
                marginBottom: "16px",
              }}
            >
              Digest: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#722F37",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Dobara try karo (Retry)
          </button>
        </div>
      </body>
    </html>
  );
}
