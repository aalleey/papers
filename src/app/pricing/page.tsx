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
} from "lucide-react";
import { SUBSCRIPTION_PLANS, ClientUser, isPaidSubscriber } from "@/lib/types";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { BrandLogo } from "@/components/BrandLogo";
import { PaymentQr } from "@/components/PaymentQr";

const RAAST_ID = "03092770207";
const RAAST_TITLE = "PaperWala Official (Raast)";
const ADMIN_WHATSAPP = "03473576122";
const ADMIN_WHATSAPP_INTL = "923473576122";

export default function PricingPage() {
  const router = useRouter();
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copiedRaast, setCopiedRaast] = useState(false);

  // Payment submission form state (for logged-in users buying subscription)
  const [transactionRef, setTransactionRef] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderName, setSenderName] = useState("");
  const [amount, setAmount] = useState("2000");
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

  const copyRaast = () => {
    navigator.clipboard.writeText(RAAST_ID);
    setCopiedRaast(true);
    setTimeout(() => setCopiedRaast(false), 2500);
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
          notes: `Subscription purchase from /pricing via Raast/HBL QR`,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 text-slate-900 font-sans pb-24 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-2 sm:top-3 z-40 px-2 sm:px-6 lg:px-8 pointer-events-none">
        <div className="pointer-events-auto max-w-7xl mx-auto rounded-2xl bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18),0_4px_16px_-2px_rgba(16,185,129,0.12),inset_0_2px_1px_0_rgba(255,255,255,0.95),inset_0_-2px_4px_0_rgba(15,23,42,0.06)]">
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

            <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/[0.04] backdrop-blur-md border border-white/70 shadow-[inset_0_2px_4px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.9)] text-xs font-semibold text-slate-700">
              <Link href="/" className="px-3.5 py-1.5 rounded-lg hover:bg-white/90 hover:text-slate-950 transition-all whitespace-nowrap shrink-0">
                Overview
              </Link>
              <Link href="/select-questions" className="px-3.5 py-1.5 rounded-lg hover:bg-white/90 hover:text-slate-950 transition-all whitespace-nowrap shrink-0">
                Question Bank
              </Link>
              <Link href="/quick-paper" className="px-3.5 py-1.5 rounded-lg hover:bg-white/90 hover:text-slate-950 transition-all whitespace-nowrap shrink-0">
                Quick Paper
              </Link>
              <span className="px-3.5 py-1.5 rounded-lg bg-white/90 text-emerald-800 shadow-[0_3px_8px_-2px_rgba(16,185,129,0.2),0_2px_0_0_#a7f3d0,inset_0_1px_0_#ffffff] whitespace-nowrap shrink-0">
                Buy Subscription
              </span>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {clientUser ? (
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <Link
                    href="/profile"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-white text-xs font-medium text-slate-700 shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] whitespace-nowrap"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-900 font-bold">{clientUser.fullName.split(" ")[0]}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-bold">{clientUser.subscription.planName}</span>
                  </Link>
                  <Link
                    href="/select-questions"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-bold text-xs shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
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
                    className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/85 hover:bg-white border border-slate-200 text-slate-900 font-bold text-xs shadow-xs cursor-pointer"
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
      <section className="pt-10 pb-6 px-4 sm:px-6 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-700 border border-rose-200 shadow-xs">
          <Lock className="w-3.5 h-3.5 text-rose-600" />
          <span>Paid Subscription Required to Generate &amp; Print Papers</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Buy Your Official <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
            Educator &amp; Academy Subscription
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          To generate, download Word (.docx), or print board-pattern exam papers with your school logo,
          template, and answer keys, an active paid subscription is mandatory.
        </p>
      </section>

      {/* Main Subscription + Payment Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-2 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Subscription Plan Details */}
          <div className="lg:col-span-6 bg-gradient-to-b from-emerald-50/70 via-white to-white rounded-3xl border-2 border-emerald-500 shadow-2xl p-6 sm:p-8 flex flex-col justify-between relative ring-4 ring-emerald-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#00a86b] text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wider whitespace-nowrap">
                MANDATORY EDUCATOR PLAN &bull; UNLIMITED
              </span>
            </div>

            <div>
              <div className="text-center pt-3 pb-5 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Full Academy &amp; Teacher Access
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  {SUBSCRIPTION_PLANS.monthly.name}
                </h2>
                <div className="mt-3 flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-400 line-through">
                    {SUBSCRIPTION_PLANS.monthly.originalPriceFormatted}
                  </span>
                  <span className="text-4xl sm:text-5xl font-black text-emerald-950">
                    {SUBSCRIPTION_PLANS.monthly.priceFormatted}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ month</span>
                </div>
                <div className="mt-1.5">
                  <span className="inline-block bg-rose-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                    {SUBSCRIPTION_PLANS.monthly.discountBadge}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1.5">
                  {SUBSCRIPTION_PLANS.monthly.billingPeriod} &bull; No Per-Paper Limit
                </div>
              </div>

              {/* Feature List */}
              <ul className="py-6 space-y-3.5 text-xs sm:text-sm">
                {SUBSCRIPTION_PLANS.monthly.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-slate-800 font-semibold">{f.text}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span className="text-slate-800 font-semibold">
                    Custom Saved Paper Template &amp; School Logo in Profile
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                  <span className="text-slate-800 font-semibold">
                    Editable Microsoft Word (.docx) &amp; 1-Page / 2-Up PDF Print
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-black flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Why is a subscription required?</span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                PaperWala provides verified Punjab &amp; Federal Board question banks, AI English-Urdu Nastaliq
                translation, and custom school branding exclusively to subscribed educators.
              </p>
            </div>
          </div>

          {/* Right Column: Instant Payment & Activation Box */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-5">
            {isAlreadyActivePaid ? (
              <div className="text-center py-8 space-y-4">
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
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                    Step-by-Step Activation
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    Pay Rs. 2,000 &amp; Submit for Activation
                  </h3>
                  <p className="text-xs text-slate-500">
                    Scan the HBL QR code or transfer via Raast ID, then submit your payment below.
                  </p>
                </div>

                {/* Raast Account Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                      Official Raast ID
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 font-black text-[10px]">
                      Rs. 2,000 / Month
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-white/10 rounded-xl px-3.5 py-2.5 border border-white/15">
                    <div>
                      <div className="font-mono text-lg sm:text-xl font-black tracking-wider text-white">
                        {RAAST_ID}
                      </div>
                      <div className="text-[10px] text-slate-300">Title: {RAAST_TITLE}</div>
                    </div>
                    <button
                      type="button"
                      onClick={copyRaast}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedRaast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRaast ? "Copied" : "Copy ID"}</span>
                    </button>
                  </div>
                </div>

                {/* HBL QR Code + Account Number + IBAN */}
                <PaymentQr />

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    {error}
                  </div>
                )}

                {!clientUser ? (
                  <div className="space-y-3 pt-1">
                    <Link
                      href="/register"
                      className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
                    >
                      <Crown className="w-4 h-4 fill-white" />
                      <span>Register &amp; Submit Payment Proof &rarr;</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                    >
                      Already have an account? Sign In to Submit Payment
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Transaction ID / Reference Number (TID){" "}
                        <span className="text-slate-400 font-medium">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 240819283712 or leave blank and send screenshot on WhatsApp"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-xl outline-none font-mono text-xs font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Sender Mobile Number</label>
                        <input
                          type="text"
                          placeholder="0300-1234567"
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-xl outline-none text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Sender Account Name</label>
                        <input
                          type="text"
                          placeholder="Account Holder Name"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-xl outline-none text-xs font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {submitting ? "Submitting Payment..." : "Submit Payment for Verification →"}
                      </span>
                    </button>
                  </form>
                )}

                {/* WhatsApp Direct Screenshot Notice */}
                <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 text-xs space-y-2">
                  <div className="font-black text-green-900 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span>After paying, send your payment screenshot on WhatsApp:</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-sm text-green-800">{ADMIN_WHATSAPP}</span>
                    <a
                      href={`https://wa.me/${ADMIN_WHATSAPP_INTL}?text=${encodeURIComponent(
                        `Assalam-o-Alaikum, I paid Rs. ${amount} for the PaperWala Monthly Subscription (${clientUser?.email || "new account"}). Sending payment screenshot here.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Send on WhatsApp</span>
                    </a>
                  </div>
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
