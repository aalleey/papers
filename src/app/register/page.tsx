// src/app/register/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  User,
  Lock,
  Phone,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  CreditCard,
  Clock,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export default function RegisterPage() {
  const router = useRouter();

  // Step 1: Registration Form State
  const [step, setStep] = useState<"register" | "payment">("register");
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"standard" | "annual">("standard");

  // Step 2: Payment Proof Submission State
  const [senderPhone, setSenderPhone] = useState("");
  const [senderName, setSenderName] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [amount, setAmount] = useState("2000");
  const [copiedRaast, setCopiedRaast] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const RAAST_ID = "03092770207";
  const RAAST_TITLE = "PaperWala Official (Raast)";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRaast(true);
    setTimeout(() => setCopiedRaast(false), 2500);
  };

  // Step 1: Submit Registration
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/client/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: emailOrPhone.trim(),
          academyName: academyName.trim() || "My School / Academy",
          password,
          planId: selectedPlan,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to create account. Please try again.");
        return;
      }

      // Pre-fill sender details for step 2
      setSenderName(fullName.trim());
      if (/^03\d{9}$/.test(emailOrPhone.trim().replace(/[- ]/g, ""))) {
        setSenderPhone(emailOrPhone.trim());
      }
      setAmount(selectedPlan === "annual" ? "3000" : "2000");

      // Advance to step 2: Raast Payment
      setStep("payment");
    } catch {
      setError("Network or server connection issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Submit Raast Payment Details
  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!transactionRef.trim()) {
      setError("Please enter the Raast Transaction ID / Reference Number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/client/payment-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionRef: transactionRef.trim(),
          senderPhone: senderPhone.trim(),
          senderName: senderName.trim(),
          amount: amount.trim(),
          planRequested: selectedPlan,
          notes: `New user registration payment via Raast ID ${RAAST_ID}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Failed to submit payment details.");
        return;
      }

      // Redirect to verification pending holding page
      router.push("/verification-pending");
      router.refresh();
    } catch {
      setError("Network issue while submitting payment proof. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-emerald-50/40 to-cyan-50/50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      {/* Ambient iOS Liquid Refraction Orbs */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[620px] h-[360px] rounded-full bg-gradient-to-tr from-emerald-400/25 via-teal-300/25 to-cyan-400/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-10 left-1/5 w-80 h-80 rounded-full bg-emerald-300/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/5 w-72 h-72 rounded-full bg-cyan-300/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Top Floating Liquid Glass Navbar Pill */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4 mb-5 flex justify-center">
        <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white/45 backdrop-blur-2xl saturate-200 border border-white/85 shadow-[0_12px_30px_-8px_rgba(15,23,42,0.12),0_3px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_rgba(255,255,255,0.95)]">
          <Link
            href="/login"
            className="relative overflow-hidden px-4 py-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-white/60 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/register"
            className="relative overflow-hidden px-4 py-1.5 rounded-xl bg-gradient-to-b from-emerald-400/95 via-emerald-500/95 to-teal-600/95 border border-emerald-300/90 text-white font-extrabold text-xs shadow-[0_3px_0_0_#065f46,0_6px_14px_-2px_rgba(16,185,129,0.35),inset_0_2px_1px_rgba(255,255,255,0.75)] flex items-center gap-1.5"
          >
            <span
              className="pointer-events-none absolute inset-x-1 top-0.5 h-2 rounded-t-full bg-gradient-to-b from-white/55 to-transparent"
              aria-hidden="true"
            />
            <Sparkles className="w-3.5 h-3.5 text-white relative z-10" />
            <span className="relative z-10">Register Account</span>
          </Link>
        </div>
      </div>

      {/* Brand Header */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 px-4">
        <div className="flex justify-center">
          <BrandLogo size="lg" subtitle="Pakistan's #1 Exam Paper Generator" />
        </div>

        {/* Multi-step Progress Indicator in Liquid Glass Capsule */}
        <div className="pt-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/45 backdrop-blur-xl border border-white/80 shadow-[inset_0_2px_4px_rgba(15,23,42,0.06),0_1px_0_rgba(255,255,255,0.9)]">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === "register"
                    ? "bg-gradient-to-b from-emerald-400 to-teal-600 text-white shadow-[0_2px_0_0_#065f46,inset_0_1px_1px_rgba(255,255,255,0.7)]"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                1
              </div>
              <span className={`text-xs font-bold ${step === "register" ? "text-slate-900" : "text-slate-500"}`}>
                Register Profile
              </span>
            </div>

            <div className="w-6 h-0.5 bg-slate-300/80 rounded-full" />

            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === "payment"
                    ? "bg-gradient-to-b from-emerald-400 to-teal-600 text-white shadow-[0_2px_0_0_#065f46,inset_0_1px_1px_rgba(255,255,255,0.7)] ring-2 ring-emerald-500/30"
                    : "bg-white/80 text-slate-500 border border-slate-200"
                }`}
              >
                2
              </div>
              <span className={`text-xs font-bold ${step === "payment" ? "text-slate-900" : "text-slate-400"}`}>
                Raast Payment
              </span>
            </div>

            <div className="w-6 h-0.5 bg-slate-200/80 rounded-full" />

            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/80 border border-slate-200 text-slate-400 flex items-center justify-center text-xs font-black">
                3
              </div>
              <span className="text-xs font-medium text-slate-400">
                Approval
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="relative overflow-hidden bg-gradient-to-b from-white/65 via-white/45 to-white/60 backdrop-blur-3xl saturate-200 py-8 px-6 sm:px-8 rounded-3xl border border-white/90 shadow-[0_28px_70px_-15px_rgba(15,23,42,0.22),0_6px_0_0_rgba(203,213,225,0.65),inset_0_2px_2px_0_rgba(255,255,255,1),inset_0_-2px_6px_0_rgba(16,185,129,0.08)] space-y-6">
          {/* Top Liquid Glass Specular Highlights */}
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/65 to-transparent"
            aria-hidden="true"
          />

          {error && (
            <div className="relative p-3.5 rounded-2xl bg-rose-500/10 backdrop-blur-md border border-rose-300/80 text-rose-800 text-xs font-semibold flex items-start gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <span className="text-rose-500 font-bold shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: REGISTRATION FORM */}
          {step === "register" && (
            <>
              <div className="relative">
                <h2 className="text-xl font-black text-slate-900 tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                  Educator Registration
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Register your account, then complete activation via official Raast payment.
                </p>
              </div>

              {/* Liquid Glass Plan Picker */}
              <div className="relative p-3.5 rounded-2xl bg-slate-900/[0.04] backdrop-blur-xl border border-white/80 shadow-[inset_0_2px_5px_rgba(15,23,42,0.06),0_1px_0_rgba(255,255,255,0.9)] space-y-2.5">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Select Subscription Plan:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan("standard");
                      setAmount("2000");
                    }}
                    className={`relative overflow-hidden p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      selectedPlan === "standard"
                        ? "border-emerald-400 bg-gradient-to-b from-white/95 to-emerald-50/80 ring-2 ring-emerald-500/20 shadow-[0_4px_0_0_#6ee7b7,0_8px_16px_-4px_rgba(16,185,129,0.2),inset_0_1px_0_#ffffff] -translate-y-0.5"
                        : "border-white/80 bg-white/50 text-slate-600 hover:bg-white/80 shadow-[0_2px_0_0_#cbd5e1]"
                    }`}
                  >
                    <span
                      className="pointer-events-none absolute inset-x-1 top-0.5 h-2 rounded-t-full bg-gradient-to-b from-white/80 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="block font-black text-xs text-slate-900 relative z-10">Standard Plan</span>
                    <span className="block text-[11px] font-extrabold text-emerald-700 mt-0.5 relative z-10">Rs. 2000 / month</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan("annual");
                      setAmount("3000");
                    }}
                    className={`relative p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      selectedPlan === "annual"
                        ? "border-emerald-400 bg-gradient-to-b from-white/95 to-emerald-50/80 ring-2 ring-emerald-500/20 shadow-[0_4px_0_0_#6ee7b7,0_8px_16px_-4px_rgba(16,185,129,0.2),inset_0_1px_0_#ffffff] -translate-y-0.5"
                        : "border-white/80 bg-white/50 text-slate-600 hover:bg-white/80 shadow-[0_2px_0_0_#cbd5e1]"
                    }`}
                  >
                    <span className="absolute -top-2.5 right-2 bg-gradient-to-b from-amber-400 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-[0_2px_0_0_#b45309]">
                      Best Value
                    </span>
                    <span className="block font-black text-xs text-slate-900">Annual Pro</span>
                    <span className="block text-[11px] font-extrabold text-emerald-700 mt-0.5">Rs. 3000 / year</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleRegister} className="relative space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 z-10 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sir Tariq Mehmood"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white/60 focus:bg-white/90 backdrop-blur-xl border border-white/90 focus:border-emerald-400 rounded-2xl outline-none shadow-[inset_0_2px_5px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.95)] focus:ring-4 focus:ring-emerald-500/15 text-slate-900 font-semibold placeholder:text-slate-400 text-xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                    Mobile / WhatsApp or Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 z-10 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="0300-1234567 or teacher@school.com"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white/60 focus:bg-white/90 backdrop-blur-xl border border-white/90 focus:border-emerald-400 rounded-2xl outline-none shadow-[inset_0_2px_5px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.95)] focus:ring-4 focus:ring-emerald-500/15 text-slate-900 font-semibold placeholder:text-slate-400 text-xs transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                    Used for login and application verification notifications.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                    <span>School or Academy Name</span>
                    <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 z-10 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Apex Science Academy Lahore"
                      value={academyName}
                      onChange={(e) => setAcademyName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white/60 focus:bg-white/90 backdrop-blur-xl border border-white/90 focus:border-emerald-400 rounded-2xl outline-none shadow-[inset_0_2px_5px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.95)] focus:ring-4 focus:ring-emerald-500/15 text-slate-900 font-semibold placeholder:text-slate-400 text-xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                    Create Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 z-10 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/60 focus:bg-white/90 backdrop-blur-xl border border-white/90 focus:border-emerald-400 rounded-2xl outline-none shadow-[inset_0_2px_5px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.95)] focus:ring-4 focus:ring-emerald-500/15 text-slate-900 font-semibold placeholder:text-slate-400 text-xs transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative overflow-hidden w-full py-3.5 px-4 bg-gradient-to-b from-emerald-400/95 via-emerald-500/95 to-teal-600/95 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm rounded-2xl border border-emerald-300/90 shadow-[0_5px_0_0_#065f46,0_14px_28px_-6px_rgba(16,185,129,0.5),inset_0_2px_2px_rgba(255,255,255,0.75),inset_0_-2px_4px_rgba(6,95,70,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_0_#065f46,inset_0_2px_4px_rgba(0,0,0,0.2)] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span
                      className="pointer-events-none absolute inset-x-2 top-0.5 h-3.5 rounded-t-full bg-gradient-to-b from-white/55 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(6,95,70,0.6)]">
                      {loading ? "Processing..." : "Continue to Raast Payment"}
                    </span>
                    {!loading && <ArrowRight className="w-4 h-4 relative z-10" />}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* STEP 2: RAAST PAYMENT PROOF */}
          {step === "payment" && (
            <div className="relative space-y-5 text-xs animate-in fade-in duration-300">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-800 border border-amber-300 shadow-[inset_0_1px_0_#ffffff]">
                  Step 2: Payment Required
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  Pay via Raast ID
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Transfer fee to the administrator&apos;s Raast ID below using any Pakistani banking app, Easypaisa, or JazzCash.
                </p>
              </div>

              {/* Raast Account Card */}
              <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-2xl border border-emerald-400/30 shadow-[0_12px_30px_-6px_rgba(6,95,70,0.45),inset_0_1px_1px_rgba(255,255,255,0.25)] relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-black text-emerald-300 text-xs">
                      ⚡
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block leading-tight">
                        Instant Raast Transfer
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        Zero transfer fees across all banks
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Rs. {amount}
                  </span>
                </div>

                <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-xl border border-white/10 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Official Raast ID:
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xl sm:text-2xl font-black text-emerald-300 tracking-wider">
                      {RAAST_ID}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(RAAST_ID)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      {copiedRaast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRaast ? "Copied!" : "Copy ID"}</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-200/90 flex items-center justify-between pt-1 border-t border-white/10">
                  <span>Raast Title: <strong>{RAAST_TITLE}</strong></span>
                  <span>Amount: <strong>PKR {amount}</strong></span>
                </div>
              </div>

              {/* Quick instructions */}
              <div className="p-3.5 bg-white/55 backdrop-blur-md rounded-2xl border border-white/85 shadow-[inset_0_1px_0_#ffffff] space-y-1.5 text-[11px] text-slate-700">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  How to pay:
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                  <li>Open your Bank App (HBL, Meezan, Allied, etc.) or JazzCash / Easypaisa.</li>
                  <li>Select <strong>Raast Payment</strong> and enter Raast ID: <strong>{RAAST_ID}</strong></li>
                  <li>Transfer exactly <strong>Rs. {amount}</strong> and copy the <strong>Transaction ID / TID</strong>.</li>
                  <li>Paste the TID below to submit for administrative approval.</li>
                </ol>
              </div>

              {/* Payment Proof Form */}
              <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Transaction ID / Reference Number (TID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 240819283712 or TRX-99214"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/60 focus:bg-white/90 backdrop-blur-xl border border-white/90 focus:border-emerald-400 rounded-2xl outline-none shadow-[inset_0_2px_5px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.95)] focus:ring-4 focus:ring-emerald-500/15 font-mono text-xs font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Found on your bank transfer receipt SMS or app screenshot.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Sender Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0300-1234567"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white/60 focus:bg-white/90 backdrop-blur-xl border border-white/90 focus:border-emerald-400 rounded-xl outline-none shadow-[inset_0_2px_4px_rgba(15,23,42,0.06)] text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Sender Bank / Account Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Mehmood"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/60 focus:bg-white/90 backdrop-blur-xl border border-white/90 focus:border-emerald-400 rounded-xl outline-none shadow-[inset_0_2px_4px_rgba(15,23,42,0.06)] text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative overflow-hidden w-full py-3.5 px-4 bg-gradient-to-b from-emerald-400/95 via-emerald-500/95 to-teal-600/95 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm rounded-2xl border border-emerald-300/90 shadow-[0_5px_0_0_#065f46,0_14px_28px_-6px_rgba(16,185,129,0.5),inset_0_2px_2px_rgba(255,255,255,0.75)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span
                    className="pointer-events-none absolute inset-x-2 top-0.5 h-3.5 rounded-t-full bg-gradient-to-b from-white/55 to-transparent"
                    aria-hidden="true"
                  />
                  <span className="relative z-10">{loading ? "Submitting Application..." : "Submit Payment for Verification 🚀"}</span>
                  {!loading && <ArrowRight className="w-4 h-4 relative z-10" />}
                </button>

                <p className="text-[11px] text-center text-slate-600">
                  Profile will immediately enter <strong>Hold Verification</strong> until admin confirms your payment on Raast ID <strong>{RAAST_ID}</strong>.
                </p>
              </form>
            </div>
          )}

          {/* Value Props & Footer */}
          <div className="relative pt-3 border-t border-white/60 grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Official BISE Curriculum</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verified Admin Activation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Instant Raast (03092770207)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>All 9 Punjab Boards</span>
            </div>
          </div>

          <div className="relative text-center pt-2 space-y-2.5">
            <p className="text-xs text-slate-700 font-medium">
              Already have an approved account?
            </p>
            <Link
              href="/login"
              className="relative overflow-hidden w-full py-2.5 px-4 rounded-2xl bg-gradient-to-b from-white/85 via-white/65 to-slate-100/70 hover:from-white/95 hover:to-white/85 backdrop-blur-xl border border-white/90 text-slate-900 font-extrabold text-xs shadow-[0_4px_0_0_rgba(203,213,225,0.85),0_8px_18px_-4px_rgba(15,23,42,0.12),inset_0_2px_1px_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 inline-flex items-center justify-center gap-1.5"
            >
              <span
                className="pointer-events-none absolute inset-x-2 top-0.5 h-3 rounded-t-full bg-gradient-to-b from-white/80 to-transparent"
                aria-hidden="true"
              />
              <Lock className="w-3.5 h-3.5 text-emerald-600 relative z-10" />
              <span className="relative z-10">Sign In to Existing Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
