"use client";

import { Toaster as Sonner, toast } from "sonner";
import "sonner/dist/styles.css";

export { toast };

export type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * 👑 Aalm Vastralay — Sonner Toast Notification Provider
 * Production-ready, theme-aware toast system powered by sonner.
 * Supports richColors, closeButton, sound/chime, promises, and Indian ethnic styling.
 */
export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={4000}
      toastOptions={{
        style: {
          borderRadius: "1rem",
        },
        classNames: {
          toast: "font-sans shadow-xl border border-stone-200 dark:border-stone-800",
          title: "font-medium text-sm",
          description: "text-xs opacity-90",
          actionButton: "bg-amber-600 text-white font-medium rounded-lg text-xs",
          cancelButton: "bg-stone-200 text-stone-700 font-medium rounded-lg text-xs",
        },
      }}
      {...props}
    />
  );
}
