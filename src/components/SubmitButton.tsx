"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubmitButton({
  children,
  className,
  pendingText,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
  variant?: "primary" | "gold" | "outline" | "ghost";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={cn(
        "btn tap-feedback min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-[0.97] active:brightness-95 select-none",
        `btn-${variant}`,
        pending && "cursor-wait opacity-75 pointer-events-none",
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
