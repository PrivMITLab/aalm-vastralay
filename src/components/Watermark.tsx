import { getSetting, getSettingBool } from "@/lib/settings";

/**
 * Optional brand watermark over product photography.
 * Toggled + dimmed from /admin/settings → Brand. A single diagonal stamp in
 * the corner (card) or a tiled pattern (gallery). Purely visual overlay – the
 * source image is never modified.
 */
export async function Watermark({ variant = "card" }: { variant?: "card" | "gallery" }) {
  const [on, opacityRaw, name] = await Promise.all([
    getSettingBool("brand.watermark", false),
    getSetting("brand.watermarkOpacity", "22"),
    getSetting("site.name", "Aalm Vastralay"),
  ]);
  if (!on) return null;
  const opacity = Math.min(80, Math.max(5, Number(opacityRaw) || 22)) / 100;

  if (variant === "gallery") {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          opacity,
          backgroundImage: "url(/watermarks/tiled.svg)",
          backgroundSize: "320px 320px",
          backgroundRepeat: "repeat",
        }}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-1.5 bottom-1.5 z-10 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-sm"
      style={{ opacity: Math.max(0.7, opacity + 0.4) }}
    >
      <svg viewBox="0 0 64 64" className="h-3 w-3" aria-hidden>
        <circle cx="32" cy="32" r="28" fill="none" stroke="#D4AF37" strokeWidth="4" />
        <text x="32" y="42" textAnchor="middle" fontSize="26" fontFamily="Georgia, serif" fontWeight="bold" fill="#D4AF37">
          AV
        </text>
      </svg>
      {name}
    </div>
  );
}

export default Watermark;
