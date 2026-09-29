/**
 * 👑 AALM VASTRALAY — OPENPANEL COOKIELESS CLIENT ANALYTICS TRACKER
 * Location: src/lib/analytics.ts
 *
 * Conforms to docs/RULES.md Section 4.1:
 *  - Self-hostable, cookieless, GDPR-compliant event tracking.
 *  - Non-blocking batch telemetry queue to prevent network congestion.
 *  - Automatically strips customer PII (phone, email, password) before dispatch.
 *  - Utilizes navigator.sendBeacon during page unloads for zero data loss.
 *  - Fail-soft: quietly no-ops if analytics endpoint/client ID is not configured.
 */

export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "search_query"
  | "filter_change"
  | "checkout_step"
  | "wishlist_toggle"
  | "coupon_apply"
  | "custom_event";

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  properties?: Record<string, unknown>;
  timestamp: number;
  url?: string;
  referrer?: string;
}

/**
 * Sanitizes event properties to enforce the PII Masking & Confidentiality Contract.
 * Strips emails, phone numbers, and password keys automatically.
 */
export function sanitizeAnalyticsProps(
  props?: Record<string, unknown>
): Record<string, unknown> {
  if (!props) return {};

  const sanitized: Record<string, unknown> = {};
  const piiKeys = ["email", "phone", "password", "token", "auth", "secret", "address", "otp"];

  for (const [key, value] of Object.entries(props)) {
    const lowerKey = key.toLowerCase();
    if (piiKeys.some((pii) => lowerKey.includes(pii))) {
      continue; // Strip PII field completely
    }

    if (typeof value === "string") {
      // Basic regex check for raw emails or 10-digit Indian phones in values
      if (/@\w+\.\w+/.test(value) || /^[6-9]\d{9}$/.test(value)) {
        continue;
      }
    }

    sanitized[key] = value;
  }

  return sanitized;
}

export class AnalyticsTracker {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly flushIntervalMs = 2500;
  private readonly maxQueueSize = 20;
  private isBrowser: boolean;
  private clientId: string | undefined;
  private endpoint: string;

  constructor() {
    this.isBrowser = typeof window !== "undefined";
    this.clientId = process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID;
    this.endpoint =
      process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT ||
      "https://api.openpanel.dev/event";

    if (this.isBrowser) {
      this.attachLifecycleListeners();
    }
  }

  private attachLifecycleListeners() {
    if (!this.isBrowser) return;

    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flush(true);
      }
    });

    window.addEventListener("pagehide", () => {
      this.flush(true);
    });
  }

  /**
   * Tracks an event by pushing to the non-blocking telemetry queue.
   */
  public track(event: AnalyticsEventType, properties?: Record<string, unknown>) {
    const cleanProps = sanitizeAnalyticsProps(properties);
    const payload: AnalyticsEvent = {
      event,
      properties: cleanProps,
      timestamp: Date.now(),
      url: this.isBrowser ? window.location.href : undefined,
      referrer: this.isBrowser ? document.referrer : undefined,
    };

    this.queue.push(payload);

    if (this.queue.length >= this.maxQueueSize) {
      this.flush(false);
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flush(false);
      }, this.flushIntervalMs);
    }
  }

  /**
   * Flushes the batched telemetry queue to the analytics server.
   * Uses navigator.sendBeacon during unload to prevent network cancellation.
   */
  public flush(isUnloading = false): boolean {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) {
      return false;
    }

    const batch = [...this.queue];
    this.queue = [];

    // If no client ID configured, safely no-op (fail-soft contract)
    if (!this.clientId) {
      return true;
    }

    const payloadString = JSON.stringify({
      clientId: this.clientId,
      events: batch,
      sentAt: Date.now(),
    });

    try {
      if (isUnloading && typeof navigator !== "undefined" && navigator.sendBeacon) {
        return navigator.sendBeacon(this.endpoint, payloadString);
      }

      if (typeof fetch !== "undefined") {
        fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: payloadString,
          keepalive: true,
        }).catch(() => {
          // Fail-soft: telemetry network drops must never affect the user
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns current pending queue length (used primarily in test suites).
   */
  public getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Clears queue (used for testing resets).
   */
  public clearQueue(): void {
    this.queue = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

// Global singleton instance for app-wide import
export const analytics = new AnalyticsTracker();
