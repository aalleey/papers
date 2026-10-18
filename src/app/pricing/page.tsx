"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Check,
  X,
  Zap,
  ShoppingCart,
  Crown,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Star,
  CheckCircle2,
} from "lucide-react";
import { SUBSCRIPTION_PLANS, SubscriptionPlanId, ClientUser } from "@/lib/types";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { BrandLogo } from "@/components/BrandLogo";

export default function PricingPage() {
  const router = useRouter();
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlanForAuth, setSelectedPlanForAuth] = useState<SubscriptionPlanId>("monthly");
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadClient() {
      try {
        const res = await fetch("/api/auth/client/me");
        const data = await res.json();
        if (data.client) {
          setClientUser(data.client);
        }
      } catch (err) {
        console.error("Failed to load client user", err);
      }
    }
    loadClient();
  }, []);

  async function handleSelectPlan(planId: SubscriptionPlanId) {
    if (!clientUser) {
      setSelectedPlanForAuth(planId);
      setShowAuthModal(true);
      return;
    }

    try {
      setLoadingPlan(planId);
      const res = await fetch("/api/auth/client/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          email: clientUser.email,
          fullName: clientUser.fullName,
          academyName: clientUser.academyName,
        }),
      });

      const data = await res.json();
      if (data.success && data.client) {
        setClientUser(data.client);
        setSuccessNotice(`Successfully subscribed to ${data.client.subscription.planName}!`);
        setTimeout(() => {
          router.push("/select-questions?chapter=2");
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to update subscription", err);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 text-slate-900 font-sans pb-24 selection:bg-indigo-500 selection:text-white">
      {/* Top Header - Transparent 3D Glassmorphic Floating Bar */}
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
              <Link href="/" className="px-3.5 py-1.5 rounded-lg hover:bg-white/90 hover:text-slate-950 hover:shadow-[0_4px_10px_-2px_rgba(15,23,42,0.12),0_2px_0_0_#cbd5e1] hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0">
                Overview
              </Link>
              <Link href="/select-questions" className="px-3.5 py-1.5 rounded-lg hover:bg-white/90 hover:text-slate-950 hover:shadow-[0_4px_10px_-2px_rgba(15,23,42,0.12),0_2px_0_0_#cbd5e1] hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0">
                Question Bank
              </Link>
              <Link href="/quick-paper" className="px-3.5 py-1.5 rounded-lg hover:bg-white/90 hover:text-slate-950 hover:shadow-[0_4px_10px_-2px_rgba(15,23,42,0.12),0_2px_0_0_#cbd5e1] hover:-translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0">
                Quick Paper
              </Link>
              <span className="px-3.5 py-1.5 rounded-lg bg-white/90 text-emerald-800 shadow-[0_3px_8px_-2px_rgba(16,185,129,0.2),0_2px_0_0_#a7f3d0,inset_0_1px_0_#ffffff] whitespace-nowrap shrink-0">
                Plans &amp; Pricing
              </span>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {clientUser ? (
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-white text-xs font-medium text-slate-700 shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] whitespace-nowrap">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-slate-900 font-bold">{clientUser.fullName.split(" ")[0]}</span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-bold">{clientUser.subscription.planName}</span>
                  </div>
                  <Link
                    href="/select-questions?chapter=2"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-bold text-xs shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
                  >
                    <span>Generator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    href="/login"
                    className="relative overflow-hidden px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-white/80 via-white/55 to-slate-100/60 hover:from-white/95 hover:to-white/80 backdrop-blur-2xl saturate-150 border border-white/90 text-slate-900 font-bold text-xs shadow-[0_4px_0_0_rgba(203,213,225,0.85),0_8px_18px_-4px_rgba(15,23,42,0.14),inset_0_2px_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    <span
                      className="pointer-events-none absolute inset-x-1.5 top-0.5 h-2.5 rounded-t-full bg-gradient-to-b from-white/90 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="relative z-10">Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    className="relative overflow-hidden px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-400/90 via-emerald-500/85 to-teal-600/90 hover:from-emerald-300/95 hover:to-teal-500/95 backdrop-blur-2xl saturate-200 border border-emerald-200/90 text-white font-extrabold text-xs shadow-[0_4px_0_0_#065f46,0_10px_24px_-4px_rgba(16,185,129,0.5),inset_0_2px_2px_0_rgba(255,255,255,0.8)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    <span
                      className="pointer-events-none absolute inset-x-1.5 top-0.5 h-2.5 rounded-t-full bg-gradient-to-b from-white/60 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(6,95,70,0.6)]">Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="pt-12 pb-8 px-4 sm:px-6 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border border-emerald-200/80 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Simple, Transparent Pricing For Pakistani Academies &amp; Teachers</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Choose the Perfect Plan for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Your School &amp; Academy
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From individual guest teachers creating small quick quizzes to large school networks
          generating unlimited full Board ALP exam papers with customized branding &amp; answer keys.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold max-w-xl mx-auto text-left sm:text-center">
          <span className="text-amber-600 font-extrabold text-sm shrink-0">🔒</span>
          <span>Only registered users with an active Monthly Subscription (Rs. 2,000/month) are eligible to generate and print exam papers. Free accounts provide syllabus and question bank browsing.</span>
        </div>

        {successNotice && (
          <div className="p-3 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-900 text-sm font-bold flex items-center justify-center gap-2 max-w-md mx-auto animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Card 1: Free Plan */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-lg p-6 sm:p-8 flex flex-col justify-between hover:border-slate-300 transition-all relative">
            <div>
              <div className="text-center pt-3 pb-5 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Free Tier</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{SUBSCRIPTION_PLANS.free.name}</h3>
                <div className="mt-3 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-slate-900">
                    {SUBSCRIPTION_PLANS.free.priceFormatted}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1">
                  {SUBSCRIPTION_PLANS.free.billingPeriod}
                </div>
              </div>

              {/* Feature List */}
              <ul className="py-6 space-y-3.5 text-xs sm:text-sm">
                {SUBSCRIPTION_PLANS.free.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    )}
                    <span className={f.included ? "text-slate-700 font-semibold" : "text-slate-400"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan("free")}
              disabled={loadingPlan === "free" || clientUser?.subscription.planId === "free"}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                clientUser?.subscription.planId === "free"
                  ? "bg-slate-100 text-slate-500 border-slate-200 cursor-default"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm active:scale-95"
              }`}
            >
              <User className="w-4 h-4" />
              <span>
                {clientUser?.subscription.planId === "free" ? "Current Plan" : SUBSCRIPTION_PLANS.free.ctaText}
              </span>
            </button>
          </div>

          {/* Card 2: Monthly Subscription Plan (Featured) */}
          <div className="bg-gradient-to-b from-emerald-50/50 via-white to-white rounded-3xl border-2 border-emerald-500 shadow-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-600 transition-all relative ring-4 ring-emerald-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#00a86b] text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wider">
                BEST VALUE &bull; UNLIMITED
              </span>
            </div>

            <div>
              <div className="text-center pt-3 pb-5 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Full Access</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{SUBSCRIPTION_PLANS.monthly.name}</h3>
                <div className="mt-3 flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-400 line-through">
                    {SUBSCRIPTION_PLANS.monthly.originalPriceFormatted}
                  </span>
                  <span className="text-4xl sm:text-5xl font-black text-emerald-950">
                    {SUBSCRIPTION_PLANS.monthly.priceFormatted}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ month</span>
                </div>
                <div className="mt-1">
                  <span className="inline-block bg-rose-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                    {SUBSCRIPTION_PLANS.monthly.discountBadge}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1">
                  {SUBSCRIPTION_PLANS.monthly.billingPeriod}
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
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan("monthly")}
              disabled={loadingPlan === "monthly" || clientUser?.subscription.planId === "monthly"}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                clientUser?.subscription.planId === "monthly"
                  ? "bg-slate-100 text-slate-500 cursor-default"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white active:scale-95 shadow-emerald-600/30"
              }`}
            >
              <Crown className="w-4 h-4 fill-white" />
              <span>
                {clientUser?.subscription.planId === "monthly"
                  ? "Current Active Plan"
                  : SUBSCRIPTION_PLANS.monthly.ctaText}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Comparison Highlights */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-black flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>Ready to generate your first examination paper?</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Select questions manually or let our Auto Board Pattern Generator build complete papers with ALP compliance in seconds.
            </p>
          </div>
          <Link
            href="/select-questions?chapter=2"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs sm:text-sm shadow-lg whitespace-nowrap active:scale-95 transition-all"
          >
            Launch Paper Generator &rarr;
          </Link>
        </div>
      </section>

      {/* Client Auth Modal */}
      <ClientAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={async (user) => {
          setClientUser(user);
          setShowAuthModal(false);
          await handleSelectPlan(selectedPlanForAuth);
        }}
      />
    </div>
  );
}
