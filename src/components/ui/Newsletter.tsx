"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { useToast } from "./Toast";
import ClickToSolve from "@/components/security/ClickToSolve";

/** Newsletter opt-in. Stores nothing sensitive – just validates and confirms locally. */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!verified) {
      toast.error("Pehle robot check verify karein (Please verify security check first)");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      const botPayload = new FormData(e.currentTarget as HTMLFormElement).get("botPayload");
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, botPayload: typeof botPayload === "string" ? botPayload : "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Subscription failed");
      }
      toast.success("You're subscribed!", "Wedding-season drops & coupon codes will land in your inbox.");
      setEmail("");
      setVerified(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <p className="text-xs font-bold tracking-wider text-[color:var(--brand)] uppercase">Wedding drops & coupons</p>
      <div className="flex items-center gap-1 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface)] pl-3 pr-1">
        <Mail className="h-4 w-4 text-[color:var(--text-soft)]" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-9 w-full bg-transparent text-sm outline-none"
          aria-label="Email for newsletter"
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !verified}
          title={!verified ? "Pehle robot check verify karein" : "Subscribe"}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Join"}
        </button>
      </div>
      <ClickToSolve action="newsletter" label="Main robot nahi hoon" onVerified={setVerified} />
      <p className="text-[11px] text-[color:var(--text-soft)]">No spam. Unsubscribe anytime. We never sell your data.</p>
    </form>
  );
}
