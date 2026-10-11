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
  const [selectedPlanForAuth, setSelectedPlanForAuth] = useState<SubscriptionPlanId>("monthly");

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

        {/* Monthly Subscription Plan Card */}
        <div className="max-w-xl mx-auto pt-2 w-full">
          <div className="bg-gradient-to-b from-emerald-50/50 via-white to-white rounded-3xl border-2 border-emerald-500 p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-600 transition-all shadow-xl shadow-emerald-950/10 relative ring-4 ring-emerald-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00a86b] text-white text-[11px] font-black uppercase px-4 py-1 rounded-full shadow-md tracking-wider">
              BEST VALUE &bull; UNLIMITED PAPERS
            </div>

            <div className="space-y-4 mt-2">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Full Premium Access</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{SUBSCRIPTION_PLANS.monthly.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-slate-400 line-through text-lg font-bold">
                    {SUBSCRIPTION_PLANS.monthly.originalPriceFormatted}
                  </span>
                  <span className="text-4xl sm:text-5xl font-black text-emerald-950">
                    {SUBSCRIPTION_PLANS.monthly.priceFormatted}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ month</span>
                  <span className="bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded-full ml-1 shadow-xs">
                    {SUBSCRIPTION_PLANS.monthly.discountBadge}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1">
                  {SUBSCRIPTION_PLANS.monthly.billingPeriod} &bull; Unlimited Downloads
                </div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm pt-4 border-t border-slate-100 font-medium">
                {SUBSCRIPTION_PLANS.monthly.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                    <span className="text-slate-800 font-semibold">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleSelectPlan("monthly")}
                disabled={loadingPlan === "monthly"}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Crown className="w-4 h-4 fill-white" />
                <span>{SUBSCRIPTION_PLANS.monthly.ctaText}</span>
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
