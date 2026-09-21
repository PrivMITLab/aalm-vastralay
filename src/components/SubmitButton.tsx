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
    <button type="submit" disabled={pending} className={cn("btn", `btn-${variant}`, className)}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> {pendingText ?? "Please wait…"}
        </>
      ) : (
        children
      )}
    </button>
  );
}
