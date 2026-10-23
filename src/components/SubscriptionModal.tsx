"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Check,
  Crown,
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
  title = "Paid Subscription Required",
  subtitle = "To generate, export, and print examination papers with your academy branding and answer keys, you must buy the Monthly Subscription.",
}: SubscriptionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  function handleBuySubscription() {
    onClose();
    router.push("/pricing");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 text-slate-800 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/20">
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>Paid Subscription Required</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Monthly Subscription Plan Card */}
        <div className="max-w-xl mx-auto pt-2 w-full">
          <div className="bg-gradient-to-b from-emerald-50/50 via-white to-white rounded-3xl border-2 border-emerald-500 p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-600 transition-all shadow-xl shadow-emerald-950/10 relative ring-4 ring-emerald-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00a86b] text-white text-[11px] font-black uppercase px-4 py-1 rounded-full shadow-md tracking-wider whitespace-nowrap">
              MANDATORY PLAN &bull; UNLIMITED PAPERS
            </div>

            <div className="space-y-4 mt-2">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Full Premium Access
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {SUBSCRIPTION_PLANS.monthly.name}
                </h3>
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
                onClick={handleBuySubscription}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-white" />
                <span>Proceed to Payment (Rs. 2,000) &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-1 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pay via HBL QR Code or Raast ID (03092770207) &amp; send screenshot on WhatsApp (03473576122).</span>
        </div>
      </div>
    </div>
  );
}
