/**
 * 👑 AALM VASTRALAY — DYNAMIC UPI QR ENGINE
 *
 * Implements standard NPCI UPI specification:
 *  - Format: upi://pay?pa={vpa}&pn={name}&am={amount}&tr={ref}&cu=INR&tn={note}
 *  - Zero payment gateway commission (0% fee straight to store bank account)
 *  - 1-click launch for GPay, PhonePe, Paytm, BHIM
 *  - 12-digit Indian banking UTR validation
 *  - Web Audio API payment confirmation chime (zero external audio dependencies)
 */

export interface UpiPaymentDetails {
  /** Store UPI VPA (e.g. 8434061342@upi or suhebalam@okaxis) */
  vpa: string;
  /** Registered merchant / store display name */
  payeeName: string;
  /** Exact order total in INR (decimal or integer, e.g. 1499.00) */
  amount: number;
  /** Unique order transaction reference */
  orderNumber: string;
  /** Transaction note shown in customer's UPI app */
  note?: string;
}

/**
 * Constructs an NPCI-compliant UPI deep link URL.
 */
export function generateUpiUrl(details: UpiPaymentDetails): string {
  const vpa = details.vpa.trim();
  const payeeName = details.payeeName.trim();
  const amountStr = details.amount.toFixed(2);
  const orderRef = details.orderNumber.trim();
  const note = details.note?.trim() || `Order ${orderRef}`;

  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amountStr,
    tr: orderRef,
    tn: note,
    cu: "INR",
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Returns a fast, high-contrast QR code image URL for scanning.
 */
export function generateUpiQrImageUrl(upiUrl: string, size: number = 260): string {
  const encoded = encodeURIComponent(upiUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=8&qzone=2`;
}

/**
 * Validates 12-digit Indian banking UTR / UPI Reference Number.
 * Indian UPI apps (GPay, PhonePe, Paytm) issue a 12-digit numeric reference string.
 */
export function validateUtrNumber(utr: string): { isValid: boolean; error?: string } {
  const trimmed = utr.trim().replace(/\s+/g, "");
  if (!trimmed) {
    return { isValid: false, error: "Please enter the 12-digit UPI Reference / UTR Number." };
  }
  if (!/^\d{12}$/.test(trimmed)) {
    return {
      isValid: false,
      error: "UTR Number must be exactly 12 numeric digits (found on your payment receipt).",
    };
  }
  return { isValid: true };
}

/**
 * Formats countdown seconds into MM:SS string.
 */
export function formatCountdownTimer(secondsLeft: number): string {
  const s = Math.max(0, secondsLeft);
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Plays a pleasant celebratory chime using Web Audio API synthesis.
 * Safe for client-side execution; requires zero external sound file downloads.
 */
export function playPaymentChime(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonious major triad chime: C5 (523Hz), E5 (659Hz), G5 (784Hz)
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.25 },
      { freq: 659.25, time: 0.12, dur: 0.25 },
      { freq: 783.99, time: 0.24, dur: 0.45 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.01, now + time);
      gain.gain.exponentialRampToValueAtTime(0.3, now + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch {
    // Non-fatal if browser blocks autoplay audio context
  }
}
