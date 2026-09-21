"use client";
import { useEffect, useRef } from "react";

/**
 * Drop-in: prevents double-clicks on any <form> by short-circuiting the second
 * submission of the same form. Works for both Server Actions and POST endpoints.
 *
 *   <form action={...} onSubmit={preventDoubleSubmit} />
 */
export function preventDoubleSubmit(
  e?: React.SyntheticEvent<HTMLFormElement> | React.FormEvent<HTMLFormElement> | undefined,
) {
  if (!e) return;
  const form = e.currentTarget as HTMLFormElement | null;
  if (!form) return;
  if ((form as HTMLFormElement & { __locked?: boolean }).__locked) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  (form as HTMLFormElement & { __locked?: boolean }).__locked = true;
  form.setAttribute("data-locked", "true");
  // Auto-unlock after 30 s so users aren’t permanently stuck
  setTimeout(() => {
    if (form) {
      (form as HTMLFormElement & { __locked?: boolean }).__locked = false;
      form.removeAttribute("data-locked");
    }
  }, 30_000);
}
