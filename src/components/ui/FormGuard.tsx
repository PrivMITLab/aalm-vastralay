"use client";

import { useEffect } from "react";

/**
 * Global, app-wide double-submit guard.
 *
 * Mounted once in the root layout, listens in the CAPTURE phase for every form
 * submit (Server Actions included — even forms rendered by server components).
 *  · The first submission locks the form and disables every submit button.
 *  · Navigation (checkout, sign-in) destroys the page, lock dies with it.
 *  · Non-navigating actions (status toggles, deletes) re-enable their submit
 *    button through React/useFormStatus — a MutationObserver then unlocks the
 *    form immediately, so users are never stuck behind the 25s safety TTL.
 */
const LOCK_ATTR = "data-form-locked";
const LOCK_TTL = 25_000;

export default function FormGuard() {
  useEffect(() => {
    const locked = new WeakSet<HTMLFormElement>();

    function release(form: HTMLFormElement) {
      form.removeAttribute(LOCK_ATTR);
      form.removeAttribute("aria-busy");
      form.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach((b) => {
        if (b.dataset.lockSetBy === "1") {
          b.disabled = false;
          b.dataset.lockSetBy = "0";
        }
        b.classList.remove("opacity-60", "cursor-wait");
      });
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement | null;
      if (!form || form.dataset.noGuard === "true") return;
      // GET forms (search) are read-only and must never lock
      if ((form.method ?? "get").toLowerCase() === "get" && form.dataset.lockGet !== "1") return;

      if (form.hasAttribute(LOCK_ATTR)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        return;
      }
      form.setAttribute(LOCK_ATTR, "");
      form.setAttribute("aria-busy", "true");
      locked.add(form);
      let hadSubmit = false;
      form.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach((b) => {
        if (!b.disabled) {
          b.disabled = true;
          b.dataset.lockSetBy = "1";
          hadSubmit = true;
        }
        b.classList.add("opacity-60", "cursor-wait");
      });
      window.setTimeout(() => release(form), LOCK_TTL);
      // Safety: also unlock if focus moves away and no submit button existed
      if (!hadSubmit) window.setTimeout(() => release(form), 2000);
    }

    document.addEventListener("submit", onSubmit, true);

    // When React re-enables a submit button after a non-navigating action, unlock
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== "attributes" || m.attributeName !== "disabled") continue;
        const el = m.target as HTMLButtonElement;
        if (el.tagName !== "BUTTON" || el.type !== "submit" || el.disabled) continue;
        const form = el.closest<HTMLFormElement>(`form[${LOCK_ATTR}]`);
        if (form && el.dataset.lockSetBy === "0") release(form);
      }
    });
    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["disabled"] });

    return () => {
      document.removeEventListener("submit", onSubmit, true);
      observer.disconnect();
    };
  }, []);

  return null;
}
