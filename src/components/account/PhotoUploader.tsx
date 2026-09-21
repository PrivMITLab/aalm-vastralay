"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { resolveImage } from "@/lib/media-resolver";
import { cn } from "@/lib/utils";

export default function PhotoUploader({
  endpoint,
  initialUrl,
  name,
  alt,
  size = 112,
  rounded = "full",
  extraPayload,
}: {
  endpoint: string;
  initialUrl: string | null;
  name: string;
  alt: string;
  size?: number;
  rounded?: "full" | "lg";
  extraPayload?: Record<string, string>;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function read(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }
    if (!/^image\/(png|jpe?g|webp|avif|svg\+xml)$/.test(file.type)) {
      toast.error("Unsupported file type");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = () => reject(fr.error);
        fr.readAsDataURL(file);
      });
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataUrl, mime: file.type, ...extraPayload }),
      });
      const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Upload failed");
      setUrl(json.url!);
      toast.success(`${name} updated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setUrl(null);
    setBusy(true);
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "", ...extraPayload }),
    })
      .then(() => toast.success(`${name} removed`))
      .catch(() => toast.error("Could not remove photo"))
      .finally(() => setBusy(false));
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface-2)]",
          rounded === "full" ? "rounded-full" : "rounded-2xl",
        )}
        style={{ height: size, width: size }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveImage(url, { width: 256 })} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-2xl font-bold text-[color:var(--text-soft)]">{name.slice(0, 1).toUpperCase()}</span>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml" hidden onChange={(e) => e.target.files?.[0] && read(e.target.files[0])} />
        <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-outline btn-sm" disabled={busy}>
          <Camera className="h-4 w-4" /> Upload {name.toLowerCase()}
        </button>
        {url && (
          <button type="button" onClick={clear} className="btn btn-ghost btn-sm text-rose-700" disabled={busy}>
            <X className="h-4 w-4" /> Remove
          </button>
        )}
        <p className="text-[11px] text-[color:var(--text-soft)]">PNG, JPG, WebP, AVIF, SVG · max 5 MB</p>
      </div>
    </div>
  );
}
