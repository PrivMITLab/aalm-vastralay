"use client";

import { useState, useTransition } from "react";
import { Sparkles, Megaphone, Tag, PackageCheck, Send, CheckCircle2, AlertCircle, Loader2, Eye, ShieldCheck, Mail, Bell, Smartphone } from "lucide-react";
import { sendBroadcastCampaignAction, type BroadcastInput } from "@/actions/marketing";
import { useFormLock } from "@/lib/use-form-lock";
import { cn } from "@/lib/utils";

interface BroadcastManagerProps {
  adminEmail: string;
  activeCoupons: Array<{ code: string; discountType: string; discountValue: number }>;
}

type PresetKey = "diwali" | "eid" | "wedding" | "chhath" | "coupon" | "stock" | "custom";

export default function BroadcastManager({ adminEmail, activeCoupons }: BroadcastManagerProps) {
  const [isPending, startTransition] = useTransition();
  const { isLocked, run } = useFormLock();

  const [campaignType, setCampaignType] = useState<BroadcastInput["campaignType"]>("FESTIVAL_OFFER");
  const [festivalName, setFestivalName] = useState("Diwali & Festive Shubh Muhurat");
  const [headline, setHeadline] = useState("विशाल त्योहार सेल — ब्राइडल लहंगा व बनारसी साड़ी");
  const [discountText, setDiscountText] = useState("FLAT 40% OFF");
  const [message, setMessage] = useState(
    "इस पावन त्योहार के अवसर पर आलम वस्त्रालय के शुद्ध हैंडलूम बनारसी साड़ियों, ब्राइडल लहंगों और डिज़ाइनर शेरवानी पर विशेष महाबचत छूट का आनंद लें। सीमित स्टॉक उपलब्ध है।"
  );
  const [couponCode, setCouponCode] = useState(activeCoupons[0]?.code || "FESTIVE40");
  const [ctaUrl, setCtaUrl] = useState("https://aalm-vastralay.vercel.app/products");
  const [targetAudience, setTargetAudience] = useState<BroadcastInput["targetAudience"]>("test_admin");
  const [testEmail, setTestEmail] = useState(adminEmail);
  const [channels, setChannels] = useState({
    email: true,
    inApp: true,
    webPush: false,
  });

  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const applyPreset = (key: PresetKey) => {
    switch (key) {
      case "diwali":
        setCampaignType("FESTIVAL_OFFER");
        setFestivalName("Diwali & Festive Shubh Muhurat (दीपावली व धनतेरस महासेल)");
        setHeadline("विशाल त्योहार सेल — शुद्ध रेशम व ब्राइडल परिधान");
        setDiscountText("FLAT 40% OFF + FREE SHIPPING");
        setMessage("दीपावली व धनतेरस के शुभ अवसर पर अपने परिवार के लिए पारंपरिक हथकरघा साड़ियों और वेडिंग लहंगों की खरीदारी करें। पूरे भारत में कैश ऑन डिलीवरी उपलब्ध है।");
        setCtaUrl("https://aalm-vastralay.vercel.app/products");
        break;
      case "wedding":
        setCampaignType("FESTIVAL_OFFER");
        setFestivalName("Royal Wedding Season 2026 (शाही लगन व विवाह स्पेशल)");
        setHeadline("ब्राइडल लहंगा व ग्रूम शेरवानी एक्सक्लूसिव कलेक्शन");
        setDiscountText("UP TO 50% SAVINGS");
        setMessage("शादी-ब्याह के खास लम्हों को यादगार बनाएं आलम वस्त्रालय के हेवी एम्ब्रॉयडरी ब्राइडल लहंगे व शाही शेरवानी के साथ। फ्री होम डिलीवरी व 7-दिन रिटर्न सुविधा।");
        setCtaUrl("https://aalm-vastralay.vercel.app/categories/lehengas");
        break;
      case "eid":
        setCampaignType("FESTIVAL_OFFER");
        setFestivalName("Eid Mubarak Special (ईद मुबारक विशेष परिधान)");
        setHeadline("शानदार शरारा, अनारकली व सिल्क कुर्ता सेट्स");
        setDiscountText("FLAT 35% OFF");
        setMessage("ईद के जश्न के लिए खास जरी वर्क शरारा और रॉयल लखनवी कुर्ता कलेक्शन उपलब्ध है। सीमित समय का डिस्काउंट!");
        setCtaUrl("https://aalm-vastralay.vercel.app/products");
        break;
      case "chhath":
        setCampaignType("FESTIVAL_OFFER");
        setFestivalName("Chhath Puja Mahaparv (छठ पूजा महापर्व स्पेशल)");
        setHeadline("पारंपरिक लाल-पीली सूती व रेशमी साड़ियों का विशेष संकलन");
        setDiscountText("SPECIAL ₹500 OFF");
        setMessage("लोकआस्था के महापर्व छठ पूजा के लिए शुद्ध कॉटन व हैंडलूम साड़ियां अब कल्याणपुर स्टोर व ऑनलाइन उपलब्ध हैं।");
        setCtaUrl("https://aalm-vastralay.vercel.app/categories/sarees");
        break;
      case "coupon":
        setCampaignType("COUPON_OFFER");
        setHeadline("आपके लिए स्पेशल डिस्काउंट कूपन");
        setDiscountText("EXTRA 15% OFF");
        setCouponCode(activeCoupons[0]?.code || "SAVE15");
        setMessage("चेकआउट के समय इस कूपन कोड का उपयोग करें और तुरंत अतिरिक्त छूट पाएं।");
        setCtaUrl("https://aalm-vastralay.vercel.app/products");
        break;
      case "stock":
        setCampaignType("STOCK_DELIVERY_ALERT");
        setHeadline("New Arrivals in Stock — नई साड़ियों व लहंगों का आगमन");
        setDiscountText("FRESH ARRIVALS");
        setMessage("हमारे कारीगरों द्वारा तैयार की गई 50+ नई डिजाइनर बनारसी साड़ियां और ब्राइडल लहंगे अब स्टॉक में उपलब्ध हैं। पहले आओ, पहले पाओ!");
        setCtaUrl("https://aalm-vastralay.vercel.app/products");
        break;
      case "custom":
        setCampaignType("GENERAL");
        setHeadline("आलम वस्त्रालय की तरफ से महत्वपूर्ण सूचना");
        setDiscountText("ANNOUNCEMENT");
        setMessage("सभी सम्मानित ग्राहकों को सूचित किया जाता है कि हमारी नई शॉप कल्याणपुर ताजपुर रोड पर पूरी तरह सक्रिय है।");
        setCtaUrl("https://aalm-vastralay.vercel.app");
        break;
    }
  };

  const handleSend = () => {
    run(async () => {
      setResult(null);
      const payload: BroadcastInput = {
        campaignType,
        title: headline,
        message,
        festivalName,
        discountText,
        couponCode,
        ctaUrl,
        targetAudience,
        testEmail,
        channels,
      };

      startTransition(async () => {
        const res = await sendBroadcastCampaignAction(payload);
        setResult(res);
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Preset Selector Bar */}
      <div className="card p-4 bg-gradient-to-r from-cream-50 via-white to-gold-50 dark:from-stone-900 dark:to-stone-950 border border-gold-300/60 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-gold-600 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-maroon-900 dark:text-gold-400">
            1-Click Campaign Presets (तैयार टेम्पलेट चुनें)
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset("diwali")}
            className="btn btn-sm btn-outline border-amber-300 text-amber-900 hover:bg-amber-50 text-xs py-1 px-3 shadow-2xs"
          >
            🪔 Diwali Special (40% OFF)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("wedding")}
            className="btn btn-sm btn-outline border-rose-300 text-rose-900 hover:bg-rose-50 text-xs py-1 px-3 shadow-2xs"
          >
            👑 Royal Wedding (50% OFF)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("eid")}
            className="btn btn-sm btn-outline border-emerald-300 text-emerald-900 hover:bg-emerald-50 text-xs py-1 px-3 shadow-2xs"
          >
            🌙 Eid Mubarak (35% OFF)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("chhath")}
            className="btn btn-sm btn-outline border-orange-300 text-orange-900 hover:bg-orange-50 text-xs py-1 px-3 shadow-2xs"
          >
            ☀️ Chhath Puja (₹500 OFF)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("coupon")}
            className="btn btn-sm btn-outline border-purple-300 text-purple-900 hover:bg-purple-50 text-xs py-1 px-3 shadow-2xs"
          >
            🏷️ Coupon Blast
          </button>
          <button
            type="button"
            onClick={() => applyPreset("stock")}
            className="btn btn-sm btn-outline border-blue-300 text-blue-900 hover:bg-blue-50 text-xs py-1 px-3 shadow-2xs"
          >
            📦 New Stock Alert
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-maroon-900 dark:text-stone-100 flex items-center gap-2 text-sm border-b border-cream-200 pb-2">
              <Megaphone className="h-4 w-4 text-maroon-700" /> Campaign Configuration
            </h3>

            {/* Campaign Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1">
                Campaign Category
              </label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value as BroadcastInput["campaignType"])}
                className="input w-full text-xs"
              >
                <option value="FESTIVAL_OFFER">🪔 Festival / Celebration Offer</option>
                <option value="COUPON_OFFER">🏷️ Discount Coupon Blast</option>
                <option value="STOCK_DELIVERY_ALERT">📦 New Stock / Fast Delivery Alert</option>
                <option value="GENERAL">📢 General Announcement</option>
              </select>
            </div>

            {campaignType === "FESTIVAL_OFFER" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1">
                  Festival / Occasion Name
                </label>
                <input
                  type="text"
                  value={festivalName}
                  onChange={(e) => setFestivalName(e.target.value)}
                  className="input w-full text-xs"
                  placeholder="e.g. Diwali & Wedding Season"
                />
              </div>
            )}

            {/* Headline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1">
                Campaign Headline / Title
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="input w-full text-xs"
                placeholder="Catchy announcement title"
              />
            </div>

            {/* Discount Highlight */}
            {(campaignType === "FESTIVAL_OFFER" || campaignType === "COUPON_OFFER") && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1">
                    Discount Badge Text
                  </label>
                  <input
                    type="text"
                    value={discountText}
                    onChange={(e) => setDiscountText(e.target.value)}
                    className="input w-full text-xs"
                    placeholder="e.g. FLAT 40% OFF"
                  />
                </div>
                {campaignType === "COUPON_OFFER" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="input w-full text-xs font-mono font-bold"
                      placeholder="e.g. FESTIVE500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1">
                Message Description (Hindi / English)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="input w-full text-xs leading-relaxed"
                placeholder="Detailed announcement details..."
              />
            </div>

            {/* CTA URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1">
                Call to Action URL
              </label>
              <input
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                className="input w-full text-xs font-mono"
                placeholder="https://aalm-vastralay.vercel.app/products"
              />
            </div>

            {/* Target Audience */}
            <div className="border-t border-cream-200 pt-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1.5">
                Target Audience (प्राप्तकर्ता)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className={cn("card p-2.5 cursor-pointer text-xs flex items-center gap-2 border", targetAudience === "test_admin" ? "border-maroon-700 bg-maroon-50/50 font-bold" : "border-cream-200")}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="test_admin"
                    checked={targetAudience === "test_admin"}
                    onChange={() => setTargetAudience("test_admin")}
                    className="accent-maroon-700"
                  />
                  <span>🧪 Test My Email</span>
                </label>
                <label className={cn("card p-2.5 cursor-pointer text-xs flex items-center gap-2 border", targetAudience === "all_customers" ? "border-maroon-700 bg-maroon-50/50 font-bold" : "border-cream-200")}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="all_customers"
                    checked={targetAudience === "all_customers"}
                    onChange={() => setTargetAudience("all_customers")}
                    className="accent-maroon-700"
                  />
                  <span>👥 All Customers</span>
                </label>
                <label className={cn("card p-2.5 cursor-pointer text-xs flex items-center gap-2 border", targetAudience === "all_sellers" ? "border-maroon-700 bg-maroon-50/50 font-bold" : "border-cream-200")}>
                  <input
                    type="radio"
                    name="targetAudience"
                    value="all_sellers"
                    checked={targetAudience === "all_sellers"}
                    onChange={() => setTargetAudience("all_sellers")}
                    className="accent-maroon-700"
                  />
                  <span>🏪 All Sellers</span>
                </label>
              </div>

              {targetAudience === "test_admin" && (
                <div className="mt-2.5">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="input w-full text-xs"
                    placeholder="Enter recipient email for testing"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Safe testing mode: Broadcast will only be sent to this email address to verify styling.
                  </p>
                </div>
              )}
            </div>

            {/* Channels */}
            <div className="border-t border-cream-200 pt-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-stone-300 mb-1.5">
                Delivery Channels
              </label>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={channels.email}
                    onChange={(e) => setChannels((prev) => ({ ...prev, email: e.target.checked }))}
                    className="accent-maroon-700 rounded"
                  />
                  <Mail className="h-3.5 w-3.5 text-rose-700" /> Email (GAS Gmail)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={channels.inApp}
                    onChange={(e) => setChannels((prev) => ({ ...prev, inApp: e.target.checked }))}
                    className="accent-maroon-700 rounded"
                  />
                  <Bell className="h-3.5 w-3.5 text-amber-600" /> In-App Notification
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={channels.webPush}
                    onChange={(e) => setChannels((prev) => ({ ...prev, webPush: e.target.checked }))}
                    className="accent-maroon-700 rounded"
                  />
                  <Smartphone className="h-3.5 w-3.5 text-purple-600" /> Web Push Notification
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={isPending || isLocked}
                className="btn btn-gold w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold shadow-md hover:shadow-lg active:scale-95 transition"
              >
                {isPending || isLocked ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Dispatched in progress…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> 1-Click Send Campaign ({targetAudience === "test_admin" ? "Test Send" : "All Recipients"})
                  </>
                )}
              </button>
            </div>

            {/* Result Message */}
            {result && (
              <div
                className={cn(
                  "p-3 rounded-xl text-xs flex items-start gap-2",
                  result.ok ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-rose-50 text-rose-900 border border-rose-200"
                )}
              >
                {result.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />}
                <div>
                  <p className="font-bold">{result.ok ? "Success!" : "Failed"}</p>
                  <p>{result.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Email & Notification Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-cream-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-gold-600" /> Live Email Preview
              </h3>
              <span className="text-[10px] rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold">
                Royal Brand Theme
              </span>
            </div>

            {/* Mock Email Client Container */}
            <div className="rounded-xl border border-cream-300 bg-[#f6f3ee] p-2.5 text-xs shadow-inner">
              <div className="bg-white rounded-lg border border-[#e2d2ba] overflow-hidden shadow-sm">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#4A148C] to-[#7a1f2b] p-4 text-center border-b-2 border-[#D4AF37]">
                  <div className="inline-block px-2 py-0.5 rounded-full border border-[#D4AF37] bg-white/10 text-[9px] font-bold text-amber-200 tracking-wider uppercase mb-1">
                    👑 PURE BIHAR & INDIAN ETHNIC WEAR
                  </div>
                  <h4 className="text-white font-bold text-base font-serif tracking-wide">
                    आलम वस्त्रालय <span className="font-normal text-xs text-amber-100">(Aalm Vastralay)</span>
                  </h4>
                  <p className="text-purple-200 text-[9px] tracking-wider uppercase mt-0.5">
                    WEDDING & BRIDAL COUTURE · KALYANIPUR
                  </p>
                </div>

                {/* Body Preview */}
                <div className="p-4 space-y-3 text-slate-800">
                  <div className="text-center">
                    <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {campaignType === "FESTIVAL_OFFER" ? festivalName : campaignType === "COUPON_OFFER" ? "EXCLUSIVE COUPON" : "FRESH IN STOCK"}
                    </span>
                    <h5 className="font-bold text-sm text-[#4A148C] mt-1.5 font-serif">{headline}</h5>
                  </div>

                  {/* Highlight Box */}
                  <div className="rounded-lg border-2 border-dashed border-[#D4AF37] bg-gradient-to-br from-[#fffdf5] via-[#fdf6ea] to-[#f3e5f5] p-3 text-center">
                    <p className="text-lg font-black text-[#7a1f2b] tracking-wider">{discountText}</p>
                    {campaignType === "COUPON_OFFER" && (
                      <div className="font-mono text-base font-black text-[#4A148C] tracking-widest my-1">
                        {couponCode}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{message}</p>
                  </div>

                  {/* CTA Button */}
                  <div className="text-center pt-1">
                    <div className="inline-block bg-gradient-to-r from-[#4A148C] to-[#7a1f2b] text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-sm">
                      🛍️ अभी खरीदारी करें (Shop Collection)
                    </div>
                  </div>
                </div>

                {/* Footer Preview */}
                <div className="bg-[#fdfaf6] border-t border-[#f0e6d6] p-2.5 text-center text-[10px] text-slate-500">
                  <p className="font-bold text-slate-700">Aalm Vastralay, Kalyanipur, Bihar</p>
                  <p className="text-[9px]">WhatsApp: +91 8434061342 · COD Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
