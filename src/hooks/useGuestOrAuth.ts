"use client";

import { useSyncExternalStore, useState } from "react";

export interface GuestOrAuthState {
  /** Signed-in user id or null */
  userId: string | null;
  /** Unique persistent guest identifier (guest_...) */
  guestId: string;
  /** True if the user is a guest (not signed in) */
  isGuest: boolean;
  /** True once client-side storage has loaded */
  isReady: boolean;
}

const GUEST_ID_KEY = "aalm_guest_id";

/** Generates a random guest UUID */
export function generateGuestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `guest_${crypto.randomUUID()}`;
  }
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "guest_server";
  try {
    let stored = localStorage.getItem(GUEST_ID_KEY);
    if (!stored) {
      stored = generateGuestId();
      localStorage.setItem(GUEST_ID_KEY, stored);
    }
    return stored;
  } catch {
    return "guest_ephemeral";
  }
}

function getServerSnapshot(): string {
  return "guest_server";
}

/**
 * 👑 AALM VASTRALAY — GUEST OR AUTHENTICATED USER HOOK
 *
 * Maximizes Clerk 50,000 MRU free tier by letting anonymous shoppers:
 *  - Browse catalog & product galleries
 *  - Save items to local wishlist
 *  - Maintain a guest shopping cart in localStorage
 *
 * Only redirects or prompts for Clerk authentication at Checkout or Account pages,
 * preventing bots and casual window shoppers from consuming Clerk monthly active user quotas.
 */
export function useGuestOrAuth(initialUserId?: string | null): GuestOrAuthState {
  const [userId] = useState<string | null>(initialUserId ?? null);
  const guestId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isReady = guestId !== "guest_server";
  const isGuest = !userId;

  return {
    userId,
    guestId,
    isGuest,
    isReady,
  };
}
