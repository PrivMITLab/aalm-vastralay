import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "पासवर्ड भूल गए (Forgot Password) — Aalm Vastralay",
  description: "आलम वस्त्रालय खाते का पासवर्ड आसानी से और सुरक्षित रूप से रीसेट करें।",
};

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-3.5 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:items-center">
      {/* Left visual card (Desktop) */}
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/bridal-lehenga.jpg"
            alt="Aalm Vastralay Luxury Heritage"
            className="h-[520px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--brand)]/95 via-[color:var(--brand)]/35 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <span className="rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 px-3 py-1 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
              100% सुरक्षित और आसान
            </span>
            <p className="mt-3 font-display text-3xl font-semibold text-white">
              खाता सुरक्षा व रिकवरी
            </p>
            <p className="mt-1 text-sm text-cream-100/90 leading-relaxed font-sans">
              बिना किसी परेशानी के अपने पंजीकृत ईमेल पर 6-अंकों का OTP प्राप्त करें और तुरंत नया पासवर्ड बनाएं।
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="card mx-auto w-full max-w-md p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl">
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
            Account Recovery
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold text-[color:var(--brand)] sm:text-3xl">
            पासवर्ड रीसेट करें
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[color:var(--text-muted)]">
            अपना पंजीकृत ईमेल दर्ज करें और हम आपको OTP भेजेंगे।
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  );
}
