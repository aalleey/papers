"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  Crown,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  CreditCard,
  Copy,
  MessageCircle,
  Zap,
  Award,
  School,
} from "lucide-react";
import { SUBSCRIPTION_PLANS, ClientUser, isPaidSubscriber } from "@/lib/types";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { BrandLogo } from "@/components/BrandLogo";
import { PaymentQr, OFFICIAL_WHATSAPP, OFFICIAL_WHATSAPP_INTL } from "@/components/PaymentQr";

export default function PricingPage() {
  const router = useRouter();
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Payment submission form state (for logged-in users buying subscription)
  const [transactionRef, setTransactionRef] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderName, setSenderName] = useState("");
  const [amount] = useState("2000");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClient() {
      try {
        const res = await fetch("/api/auth/client/me");
        const data = await res.json();
        if (data.client) {
          setClientUser(data.client);
          setSenderName(data.client.fullName || "");
          setSenderPhone(data.client.phone || "");
        }
      } catch (err) {
        console.error("Failed to load client user", err);
      }
    }
    loadClient();
  }, []);

  const copyWhatsApp = () => {
    navigator.clipboard.writeText(OFFICIAL_WHATSAPP);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientUser) {
      router.push("/register");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/client/payment-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionRef: transactionRef.trim(),
          senderPhone: senderPhone.trim(),
          senderName: senderName.trim(),
          amount: amount.trim() || "2000",
          planRequested: "monthly",
          notes: `Subscription purchase from /pricing (WhatsApp ${OFFICIAL_WHATSAPP})`,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to submit payment details.");
        return;
      }

      router.push("/verification-pending");
    } catch {
      setError("Network issue while submitting payment proof. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isAlreadyActivePaid = clientUser ? isPaidSubscriber(clientUser) : false;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-100 via-emerald-50/40 to-cyan-50/40 text-slate-900 font-sans pb-24 selection:bg-emerald-500 selection:text-white">
      {/* Ambient Liquid Glass Orbs */}
      <div
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[760px] h-[380px] rounded-full bg-gradient-to-tr from-emerald-400/25 via-teal-300/20 to-indigo-400/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-24 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-10 -right-24 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Top Header */}
      <header className="sticky top-2 sm:top-3 z-40 px-2 sm:px-6 lg:px-8 pointer-events-none">
        <div className="pointer-events-auto max-w-7xl mx-auto rounded-2xl bg-white/75 backdrop-blur-2xl border border-white/85 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.16),0_4px_16px_-2px_rgba(16,185,129,0.12),inset_0_2px_1px_0_rgba(255,255,255,0.95)]">
          <div className="px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap shrink-0">
              <Link
                href="/"
                className="p-1.5 sm:p-2 rounded-xl bg-white/80 hover:bg-white border border-white text-slate-700 hover:text-slate-950 shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150"
                title="Back to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <BrandLogo size="sm" variant="compact" />
            </div>

            <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/[0.04] backdrop-blur-md border border-white/70 text-xs font-semibold text-slate-700">
              <Link href="/" className="px-3.5 py-1.5 rounded-lg hover:bg-white/90 hover:text-slate-950 transition-all whitespace-nowrap shrink-0">
                Overview
              </Link>
              <Link href="/select-questions" className="px-3.5 py-1.5 rounded-lg hover:bg-white/90 hover:text-slate-950 transition-all whitespace-nowrap shrink-0">
                Question Bank
              </Link>
              <Link href="/quick-paper" className="px-3.5 py-1.5 rounded-lg hover:bg-white/90 hover:text-slate-950 transition-all whitespace-nowrap shrink-0">
                Quick Paper
              </Link>
              <span className="px-3.5 py-1.5 rounded-lg bg-white/95 text-emerald-800 font-extrabold shadow-xs whitespace-nowrap shrink-0">
                Buy Subscription
              </span>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {clientUser ? (
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <Link
                    href="/profile"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-white text-xs font-medium text-slate-700 shadow-[0_3px_0_0_#cbd5e1]"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-900 font-bold">{clientUser.fullName.split(" ")[0]}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-bold">{clientUser.subscription.planName}</span>
                  </Link>
                  <Link
                    href="/select-questions"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-bold text-xs shadow-[0_4px_0_0_#065f46] inline-flex items-center gap-1.5"
                  >
                    <span>Generator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/90 hover:bg-white border border-slate-200 text-slate-900 font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Sign In
                  </button>
                  <Link
                    href="/register"
                    className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-[0_4px_0_0_#065f46]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative z-10 pt-10 pb-8 px-4 sm:px-6 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-white/80 backdrop-blur-xl text-emerald-800 border border-emerald-300/80 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Educator &amp; Academy Subscription Portal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Unlock Unlimited Board-Pattern <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
            Exam Paper Generation
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Generate unlimited 9th, 10th, FSc &amp; ICS papers with your school logo, custom paper template,
          bilingual Urdu Nastaliq, OMR bubble sheets, and editable Word (.docx) downloads.
        </p>

        {/* Trust Metrics Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-bold text-slate-700">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/80 border border-white shadow-xs">
            <School className="w-4 h-4 text-emerald-600" />
            <span>1,480+ Pakistani Schools &amp; Academies</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/80 border border-white shadow-xs">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>All 9 Punjab Boards + FBISE</span>
          </div>
          <a
            href={`https://wa.me/${OFFICIAL_WHATSAPP_INTL}?text=${encodeURIComponent(
              "Assalam-o-Alaikum, I want to buy the PaperWala Monthly Subscription (Rs. 2,000)."
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Buy &amp; Support: {OFFICIAL_WHATSAPP}</span>
          </a>
        </div>
      </section>

      {/* Main Subscription + Payment Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Premium Plan Showcase Card */}
          <div className="lg:col-span-6 relative overflow-hidden bg-gradient-to-b from-white/95 via-white/90 to-emerald-50/40 backdrop-blur-2xl rounded-[32px] border-2 border-emerald-500/80 shadow-[0_28px_70px_-15px_rgba(16,185,129,0.22),inset_0_2px_2px_#ffffff] p-6 sm:p-8 flex flex-col justify-between ring-4 ring-emerald-500/10">
            <div className="flex items-center justify-between gap-2 pb-5 border-b border-slate-200/80">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Full Academy Pro Plan</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  {SUBSCRIPTION_PLANS.monthly.name}
                </h2>
              </div>
              <div className="text-right">
                <span className="inline-block bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  {SUBSCRIPTION_PLANS.monthly.discountBadge}
                </span>
                <div className="text-xs font-bold text-slate-400 line-through mt-1">
                  {SUBSCRIPTION_PLANS.monthly.originalPriceFormatted}
                </div>
              </div>
            </div>

            {/* Price Hero Box */}
            <div className="my-5 p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white flex items-center justify-between gap-4 shadow-lg">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 block">
                  All-Inclusive Monthly Pass
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    {SUBSCRIPTION_PLANS.monthly.priceFormatted}
                  </span>
                  <span className="text-xs font-bold text-emerald-300">/ 30 Days</span>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-300 space-y-0.5">
                <div className="font-black text-emerald-300 flex items-center justify-end gap-1">
                  <Zap className="w-3.5 h-3.5 fill-emerald-300" />
                  <span>Unlimited Papers</span>
                </div>
                <div>No per-paper charges</div>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Everything Included in Your Subscription:
              </div>
              <ul className="space-y-3 text-xs sm:text-sm">
                {[
                  "Unlimited Paper Generation for 9th, 10th, 1st Year & 2nd Year",
                  "1-Click Auto Punjab Board (BISE) & Federal Board (FBISE) Pattern",
                  "Custom School / Academy Logo, Header & Watermark Template in Profile",
                  "Bilingual English + Urdu Nastaliq & AI 1-Click Language Converter",
                  "Automated Answer Keys & Student OMR Bubble Sheets",
                  "Anti-Cheating Shuffled Paper Versions (A, B, C, D)",
                  "Editable Microsoft Word (.docx) & 1-Page / 2-Up PDF Print",
                  `Direct WhatsApp Priority Support (${OFFICIAL_WHATSAPP})`,
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-slate-800 font-semibold leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct WhatsApp Contact Card inside Left Column */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official WhatsApp for Buy &amp; Payment</span>
                </div>
                <div className="font-mono text-lg font-black text-slate-900">
                  {OFFICIAL_WHATSAPP}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyWhatsApp}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-emerald-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedWhatsApp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWhatsApp ? "Copied" : "Copy"}</span>
                </button>
                <a
                  href={`https://wa.me/${OFFICIAL_WHATSAPP_INTL}?text=${encodeURIComponent(
                    "Assalam-o-Alaikum, I want to buy the PaperWala Monthly Subscription (Rs. 2,000)."
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs inline-flex items-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: QR Payment + Instant Verification Checkout */}
          <div className="lg:col-span-6 space-y-5">
            {isAlreadyActivePaid ? (
              <div className="bg-white rounded-[32px] border border-slate-200/90 shadow-xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Your Subscription is Active!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  You are logged in as <strong>{clientUser?.fullName}</strong> with an active{" "}
                  <strong>{clientUser?.subscription.planName}</strong>. All paper generation, template, and export
                  features are unlocked.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Link
                    href="/select-questions"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs sm:text-sm shadow-lg"
                  >
                    Open Question Bank &rarr;
                  </Link>
                  <Link
                    href="/profile"
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm"
                  >
                    Customize Paper Template
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* HBL QR Code + Bank Account + WhatsApp 03473576122 */}
                <PaymentQr amount="2,000" />

                {/* Payment Submission Card */}
                <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                        Instant Verification
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Submit Payment &amp; Send Receipt on WhatsApp
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase">
                      TID Optional
                    </span>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                      {error}
                    </div>
                  )}

                  {!clientUser ? (
                    <div className="space-y-3 pt-1">
                      <Link
                        href="/register"
                        className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                      >
                        <Crown className="w-4 h-4 fill-white" />
                        <span>Register Account &amp; Submit Payment &rarr;</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                      >
                        Already registered? Sign In to Submit Payment
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">Sender Mobile Number</label>
                          <input
                            type="text"
                            placeholder="0300-1234567"
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-xl outline-none text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">Sender Account Name</label>
                          <input
                            type="text"
                            placeholder="Account Holder Name"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-xl outline-none text-xs font-semibold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Transaction ID / Reference Number (TID){" "}
                          <span className="text-slate-400 font-medium">(optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Optional — you can skip and send screenshot on WhatsApp 03473576122"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-xl outline-none font-mono text-xs font-semibold"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {submitting ? "Submitting Payment..." : "Submit Payment & Proceed →"}
                        </span>
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Client Auth Modal */}
      <ClientAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setClientUser(user);
          setSenderName(user.fullName || "");
          setSenderPhone(user.phone || "");
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}
