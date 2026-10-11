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

export default function PricingPage() {
  const router = useRouter();
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlanForAuth, setSelectedPlanForAuth] = useState<SubscriptionPlanId>("standard");
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
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="text-lg font-black bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent">
                PaperWala
              </span>
              <span className="font-urdu text-blue-700 font-bold text-base">پیپر والا</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {clientUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 hidden sm:inline">
                  Logged in as <strong className="text-indigo-600">{clientUser.fullName}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {clientUser.subscription.planName}
                </span>
                <Link
                  href="/select-questions?chapter=2"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors"
                >
                  Go to Generator &rarr;
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Client Login / Register
              </button>
            )}
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

        {successNotice && (
          <div className="p-3 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-900 text-sm font-bold flex items-center justify-center gap-2 max-w-md mx-auto animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successNotice}</span>
          </div>
        )}
      </section>

      {/* Pricing Cards Grid (Exact matching screenshots) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Card 1: Free Plan */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-300 transition-all relative">
            <div>
              <div className="text-center pt-3 pb-5 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">{SUBSCRIPTION_PLANS.free.name}</h3>
                <div className="mt-3 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-slate-900">
                    {SUBSCRIPTION_PLANS.free.priceFormatted}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400 mt-1">
                  {SUBSCRIPTION_PLANS.free.billingPeriod}
                </div>
              </div>

              {/* Feature List */}
              <ul className="py-6 space-y-3.5 text-xs">
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
              className={`w-full py-3 px-4 rounded-full font-black text-xs transition-all flex items-center justify-center gap-2 border-2 ${
                clientUser?.subscription.planId === "free"
                  ? "bg-slate-100 text-slate-500 border-slate-200 cursor-default"
                  : "bg-white hover:bg-blue-50 text-blue-600 border-blue-600 shadow-sm active:scale-95"
              }`}
            >
              <User className="w-4 h-4" />
              <span>
                {clientUser?.subscription.planId === "free" ? "Current Plan" : SUBSCRIPTION_PLANS.free.ctaText}
              </span>
            </button>
          </div>

          {/* Card 2: Go as you pay */}
          <div className="bg-white rounded-3xl border-2 border-orange-200 shadow-xl p-6 sm:p-7 flex flex-col justify-between hover:border-orange-300 transition-all relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#00a86b] text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wider">
                BEST FOR ONE-TIME
              </span>
            </div>

            <div>
              <div className="text-center pt-3 pb-5 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">{SUBSCRIPTION_PLANS.pay_as_you_go.name}</h3>
                <div className="mt-3 flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-400 line-through">
                    {SUBSCRIPTION_PLANS.pay_as_you_go.originalPriceFormatted}
                  </span>
                  <span className="text-4xl font-black text-slate-900">
                    {SUBSCRIPTION_PLANS.pay_as_you_go.priceFormatted}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="inline-block bg-[#00a86b] text-white text-xs font-black px-2 py-0.5 rounded">
                    {SUBSCRIPTION_PLANS.pay_as_you_go.discountBadge}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400 mt-1">
                  {SUBSCRIPTION_PLANS.pay_as_you_go.billingPeriod}
                </div>
              </div>

              {/* Feature List */}
              <ul className="py-6 space-y-3.5 text-xs">
                {SUBSCRIPTION_PLANS.pay_as_you_go.features.map((f, i) => (
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
              onClick={() => handleSelectPlan("pay_as_you_go")}
              disabled={loadingPlan === "pay_as_you_go" || clientUser?.subscription.planId === "pay_as_you_go"}
              className={`w-full py-3 px-4 rounded-full font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                clientUser?.subscription.planId === "pay_as_you_go"
                  ? "bg-slate-100 text-slate-500 cursor-default"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-95 shadow-orange-500/20"
              }`}
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>
                {clientUser?.subscription.planId === "pay_as_you_go"
                  ? "Current Plan"
                  : SUBSCRIPTION_PLANS.pay_as_you_go.ctaText}
              </span>
            </button>
          </div>

          {/* Card 3: Standard Plan */}
          <div className="bg-white rounded-3xl border-2 border-emerald-300 shadow-xl p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-400 transition-all relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#00a86b] text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wider">
                BEST VALUE
              </span>
            </div>

            <div>
              <div className="text-center pt-3 pb-5 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">{SUBSCRIPTION_PLANS.standard.name}</h3>
                <div className="mt-3 flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-400 line-through">
                    {SUBSCRIPTION_PLANS.standard.originalPriceFormatted}
                  </span>
                  <span className="text-4xl font-black text-slate-900">
                    {SUBSCRIPTION_PLANS.standard.priceFormatted}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="inline-block bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded">
                    {SUBSCRIPTION_PLANS.standard.discountBadge}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400 mt-1">
                  {SUBSCRIPTION_PLANS.standard.billingPeriod}
                </div>
              </div>

              {/* Feature List */}
              <ul className="py-6 space-y-3.5 text-xs">
                {SUBSCRIPTION_PLANS.standard.features.map((f, i) => (
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
              onClick={() => handleSelectPlan("standard")}
              disabled={loadingPlan === "standard" || clientUser?.subscription.planId === "standard"}
              className={`w-full py-3 px-4 rounded-full font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                clientUser?.subscription.planId === "standard"
                  ? "bg-slate-100 text-slate-500 cursor-default"
                  : "bg-[#00a86b] hover:bg-emerald-600 text-white active:scale-95 shadow-emerald-600/20"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>
                {clientUser?.subscription.planId === "standard"
                  ? "Current Plan"
                  : SUBSCRIPTION_PLANS.standard.ctaText}
              </span>
            </button>
          </div>

          {/* Card 4: Annual Premium Plan */}
          <div className="bg-white rounded-3xl border-2 border-blue-600 shadow-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-blue-700 transition-all relative ring-4 ring-blue-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#0066cc] text-white text-[11px] font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wider">
                MOST POPULAR
              </span>
            </div>

            <div>
              <div className="text-center pt-3 pb-5 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">{SUBSCRIPTION_PLANS.annual.name}</h3>
                <div className="mt-3 flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-bold text-slate-400 line-through">
                    {SUBSCRIPTION_PLANS.annual.originalPriceFormatted}
                  </span>
                  <span className="text-4xl font-black text-slate-900">
                    {SUBSCRIPTION_PLANS.annual.priceFormatted}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="inline-block bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded">
                    {SUBSCRIPTION_PLANS.annual.discountBadge}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400 mt-1">
                  {SUBSCRIPTION_PLANS.annual.billingPeriod}
                </div>
              </div>

              {/* Feature List */}
              <ul className="py-6 space-y-3.5 text-xs">
                {SUBSCRIPTION_PLANS.annual.features.map((f, i) => (
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
              onClick={() => handleSelectPlan("annual")}
              disabled={loadingPlan === "annual" || clientUser?.subscription.planId === "annual"}
              className={`w-full py-3 px-4 rounded-full font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                clientUser?.subscription.planId === "annual"
                  ? "bg-slate-100 text-slate-500 cursor-default"
                  : "bg-[#0066cc] hover:bg-blue-700 text-white active:scale-95 shadow-blue-600/30"
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>
                {clientUser?.subscription.planId === "annual"
                  ? "Current Plan"
                  : SUBSCRIPTION_PLANS.annual.ctaText}
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
