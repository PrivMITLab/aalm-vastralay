"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubmitButton({
  children,
  className,
  pendingText,
  variant = "primary",
  disabled = false,
  lockHint,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  variant?: "primary" | "gold" | "outline" | "ghost";
  /**
   * External lock (e.g. click-to-solve verification pending). Combined with
   * the form pending state — the button stays shut until both are clear.
   */
  disabled?: boolean;
  /** Accessible hint announced while locked, e.g. "Verify first". */
  lockHint?: string;
}) {
  const { pending } = useFormStatus();
  const locked = pending || disabled;
  return (
    <button
      type="submit"
      disabled={locked}
      aria-disabled={locked}
      title={disabled && !pending ? (lockHint ?? "Complete verification first") : undefined}
      className={cn(
        "btn tap-feedback min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.97] active:brightness-95 select-none",
        `btn-${variant}`,
        pending && "cursor-wait opacity-75 pointer-events-none",
        disabled && !pending && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-current" /> {pendingText ?? "Please wait…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
