"use client";

import React, { useState } from "react";
import {
  X,
  Check,
  Zap,
  ShoppingCart,
  Crown,
  User,
  ShieldCheck,
  Sparkles,
  Lock,
} from "lucide-react";
import { SUBSCRIPTION_PLANS, SubscriptionPlanId, ClientUser } from "@/lib/types";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (client: ClientUser) => void;
  title?: string;
  subtitle?: string;
  highlightPlan?: SubscriptionPlanId;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Unlock Full Examination Features",
  subtitle = "Choose a subscription plan to generate board-standard papers with your academy branding and answer keys.",
  highlightPlan,
}: SubscriptionModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null);
  const [clientEmail, setClientEmail] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [showInputStep, setShowInputStep] = useState(false);
  const [selectedPlanForAuth, setSelectedPlanForAuth] = useState<SubscriptionPlanId>("standard");

  if (!isOpen) return null;

  async function handleSelectPlan(planId: SubscriptionPlanId) {
    setSelectedPlanForAuth(planId);

    // If client details not provided yet, show quick info prompt
    if (!clientEmail) {
      setShowInputStep(true);
      return;
    }

    await activatePlan(planId, clientEmail, academyName);
  }

  async function activatePlan(planId: SubscriptionPlanId, email: string, academy: string) {
    try {
      setLoadingPlan(planId);
      const res = await fetch("/api/auth/client/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          email: email || "educator@paperwala.pk",
          fullName: email ? email.split("@")[0] : "Educator",
          academyName: academy || "My Academy",
        }),
      });

      const data = await res.json();
      if (data.success && data.client) {
        if (onSuccess) onSuccess(data.client);
        onClose();
      }
    } catch (err) {
      console.error("Failed to activate plan:", err);
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 text-slate-800 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>PaperWala Subscription Plans</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Client Quick Details Bar if needed */}
        {showInputStep && (
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 max-w-xl mx-auto space-y-3">
            <div className="text-xs font-bold text-indigo-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Enter your details to activate {SUBSCRIPTION_PLANS[selectedPlanForAuth]?.name}:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email / Phone:</label>
                <input
                  type="text"
                  placeholder="teacher@school.edu.pk"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">School / Academy Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Science Academy"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowInputStep(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => activatePlan(selectedPlanForAuth, clientEmail, academyName)}
                className="px-4 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-sm"
              >
                Confirm &amp; Proceed
              </button>
            </div>
          </div>
        )}

        {/* 4 Plans Grid (Exact Match to Screenshots 1 & 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch pt-2">
          {/* 1. Free Plan */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-all shadow-sm relative">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-black text-slate-900">Free Plan</h3>
                <div className="text-3xl font-black text-slate-900 mt-2">Rs. 0</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Lifetime Access</div>
              </div>

              <ul className="space-y-2 text-xs pt-3 border-t border-slate-100 font-medium">
                {SUBSCRIPTION_PLANS.free.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {f.included ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    ) : (
                      <span className="text-slate-300 font-bold shrink-0 mt-0.5 text-xs">&times;</span>
                    )}
                    <span className={f.included ? "text-slate-700" : "text-slate-400"}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleSelectPlan("free")}
                disabled={loadingPlan === "free"}
                className="w-full py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Use Free Plan</span>
              </button>
            </div>
          </div>

          {/* 2. Go as you pay */}
          <div className="bg-white rounded-2xl border-2 border-orange-300 p-5 flex flex-col justify-between hover:border-orange-400 transition-all shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
              BEST FOR ONE-TIME
            </div>

            <div className="space-y-4 mt-1">
              <div className="text-center">
                <h3 className="text-lg font-black text-slate-900">Go as you pay</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-slate-400 line-through text-lg font-bold">Rs. 100</span>
                  <span className="text-3xl font-black text-slate-900">Rs. 30</span>
                  <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    70% OFF
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Per Single Paper</div>
              </div>

              <ul className="space-y-2 text-xs pt-3 border-t border-slate-100 font-medium">
                {SUBSCRIPTION_PLANS.pay_per_paper.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-slate-700">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleSelectPlan("pay_per_paper")}
                disabled={loadingPlan === "pay_per_paper"}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Pay &amp; Generate (Rs. 30)</span>
              </button>
            </div>
          </div>

          {/* 3. Standard Plan */}
          <div className="bg-white rounded-2xl border-2 border-emerald-400 p-5 flex flex-col justify-between hover:border-emerald-500 transition-all shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
              BEST VALUE
            </div>

            <div className="space-y-4 mt-1">
              <div className="text-center">
                <h3 className="text-lg font-black text-slate-900">Standard Plan</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-slate-400 line-through text-lg font-bold">Rs. 4000</span>
                  <span className="text-3xl font-black text-slate-900">Rs. 2000</span>
                  <span className="bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    50% OFF
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5">6 Months Access</div>
              </div>

              <ul className="space-y-2 text-xs pt-3 border-t border-slate-100 font-medium">
                {SUBSCRIPTION_PLANS.standard.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-slate-700">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleSelectPlan("standard")}
                disabled={loadingPlan === "standard"}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Buy Standard Plan</span>
              </button>
            </div>
          </div>

          {/* 4. Annual Premium Plan */}
          <div className="bg-gradient-to-b from-blue-50/50 via-white to-white rounded-2xl border-2 border-blue-600 p-5 flex flex-col justify-between hover:border-blue-700 transition-all shadow-xl shadow-blue-900/10 relative ring-4 ring-blue-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full shadow-md tracking-wider">
              MOST POPULAR
            </div>

            <div className="space-y-4 mt-2">
              <div className="text-center">
                <h3 className="text-lg font-black text-slate-900">Annual Premium Plan</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-slate-400 line-through text-lg font-bold">Rs. 7000</span>
                  <span className="text-3xl font-black text-blue-950">Rs. 3000</span>
                  <span className="bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                    50% OFF
                  </span>
                </div>
                <div className="text-[11px] text-blue-800 font-bold mt-0.5">1 Year Full Access</div>
              </div>

              <ul className="space-y-2 text-xs pt-3 border-t border-blue-100 font-medium">
                {SUBSCRIPTION_PLANS.annual.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-slate-800 font-semibold">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-blue-100">
              <button
                onClick={() => handleSelectPlan("annual")}
                disabled={loadingPlan === "annual"}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Crown className="w-3.5 h-3.5 fill-white" />
                <span>Buy Annual Plan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 text-[11px] text-slate-400">
          Payment options available via Easypaisa, JazzCash, and Online Bank Transfer. 100% money-back guarantee.
        </div>
      </div>
    </div>
  );
}
