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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-slate-900 leading-none">PaperWala</span>
              <span className="font-urdu text-emerald-700 text-xl font-bold leading-none">پیپر والا</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Pakistan&apos;s #1 Exam Paper Generator
            </span>
          </div>
        </Link>

        {/* Multi-step Progress Indicator */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === "register"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              1
            </div>
            <span className={`text-xs font-bold ${step === "register" ? "text-slate-900" : "text-slate-500"}`}>
              Register Profile
            </span>
          </div>

          <div className="w-8 h-0.5 bg-slate-300" />

          <div className="flex items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === "payment"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/30"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              2
            </div>
            <span className={`text-xs font-bold ${step === "payment" ? "text-slate-900" : "text-slate-400"}`}>
              Raast Payment
            </span>
          </div>

          <div className="w-8 h-0.5 bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-black">
              3
            </div>
            <span className="text-xs font-medium text-slate-400">
              Admin Approval
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-200/80 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <span className="text-rose-500 font-bold shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: REGISTRATION FORM */}
          {step === "register" && (
            <>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Educator Registration
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register your account, then complete activation via official Raast payment.
                </p>
              </div>

              {/* Plan Picker */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Select Subscription Plan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan("standard");
                      setAmount("2000");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPlan === "standard"
                        ? "border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-slate-200 bg-slate-100/60 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <span className="block font-black text-xs text-slate-900">Standard Plan</span>
                    <span className="block text-[11px] font-bold text-emerald-600 mt-0.5">Rs. 2000 / month</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan("annual");
                      setAmount("3000");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      selectedPlan === "annual"
                        ? "border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-slate-200 bg-slate-100/60 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <span className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      Best Value
                    </span>
                    <span className="block font-black text-xs text-slate-900">Annual Pro</span>
                    <span className="block text-[11px] font-bold text-emerald-600 mt-0.5">Rs. 3000 / year</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sir Tariq Mehmood"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium placeholder:text-slate-400 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mobile / WhatsApp or Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="0300-1234567 or teacher@school.com"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium placeholder:text-slate-400 text-xs"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Used for login and application verification notifications.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>School or Academy Name</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Apex Science Academy Lahore"
                      value={academyName}
                      onChange={(e) => setAcademyName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium placeholder:text-slate-400 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Create Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium placeholder:text-slate-400 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <span>{loading ? "Processing..." : "Continue to Raast Payment"}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}

          {/* STEP 2: RAAST PAYMENT PROOF */}
          {step === "payment" && (
            <div className="space-y-5 text-xs animate-in fade-in duration-300">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Step 2: Payment Required
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  Pay via Raast ID
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transfer fee to the administrator&apos;s Raast ID below using any Pakistani banking app, Easypaisa, or JazzCash.
                </p>
              </div>

              {/* Raast Account Card */}
              <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-xl shadow-emerald-950/20 relative overflow-hidden space-y-4">
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
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
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
                  <label className="block font-bold text-slate-700 mb-1">
                    Transaction ID / Reference Number (TID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 240819283712 or TRX-99214"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs font-semibold text-slate-900 placeholder:text-slate-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Found on your bank transfer receipt SMS or app screenshot.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Sender Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0300-1234567"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Sender Bank / Account Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Mehmood"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  <span>{loading ? "Submitting Application..." : "Submit Payment for Verification 🚀"}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Profile will immediately enter <strong>Hold Verification</strong> until admin confirms your payment on Raast ID <strong>{RAAST_ID}</strong>.
                </p>
              </form>
            </div>
          )}

          {/* Value Props & Footer */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium">
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

          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              Already have an approved account?{" "}
              <Link href="/login" className="font-extrabold text-emerald-700 hover:underline">
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
