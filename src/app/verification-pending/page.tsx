// src/app/verification-pending/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  MessageCircle,
  BookOpen,
  LogOut,
  Lock,
  Sparkles,
} from "lucide-react";
import { ClientUser } from "@/lib/types";
import {
  PaymentQr,
  OFFICIAL_WHATSAPP,
  OFFICIAL_WHATSAPP_INTL,
  HBL_ACCOUNT_TITLE,
  HBL_ACCOUNT_NUMBER,
} from "@/components/PaymentQr";

export default function VerificationPendingPage() {
  const router = useRouter();
  const [client, setClient] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  const loadProfile = async (silent = false) => {
    if (!silent) setLoading(true);
    else setChecking(true);

    try {
      const res = await fetch("/api/auth/client/me");
      const data = await res.json();
      if (data.client) {
        setClient(data.client);
        // If admin has approved account and status is active, forward to generator!
        if (data.client.subscription?.status === "active" && data.client.isVerified !== false) {
          router.push("/select-questions");
          router.refresh();
          return;
        }
      } else {
        router.push("/login");
      }
    } catch (e) {
      console.error("Failed to check status", e);
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // Poll status every 10 seconds in case admin approves while user is on this page
    const interval = setInterval(() => {
      loadProfile(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/client/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Checking verification status...</p>
        </div>
      </div>
    );
  }

  const submission = client?.paymentSubmission;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-emerald-50/40 to-cyan-50/50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Ambient Orbs */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[620px] h-[360px] rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-300/20 to-cyan-400/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-2">
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
      </div>

      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_28px_70px_-15px_rgba(15,23,42,0.18)] border border-white/95 overflow-hidden">
          {/* Top Hold Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-7 text-white text-center relative overflow-hidden border-b border-emerald-500/20">
            <div
              className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full bg-emerald-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 backdrop-blur-md border border-emerald-400/30 mx-auto flex items-center justify-center mb-3 shadow-inner">
                <Clock className="w-7 h-7 text-emerald-300 animate-pulse" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
                <Sparkles className="w-3 h-3" />
                Verification in Progress
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Application Under Verification
              </h1>
              <p className="text-xs text-slate-300 font-medium max-w-md mx-auto mt-1.5 leading-relaxed">
                Your profile is awaiting admin confirmation. Send your payment screenshot / script on WhatsApp{" "}
                <strong className="text-emerald-300 font-mono">{OFFICIAL_WHATSAPP}</strong> for instant activation.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Registered Educator:</span>
                <span className="font-black text-slate-900">{client?.fullName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Email / Mobile:</span>
                <span className="font-semibold text-slate-800">{client?.email}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Academy / School:</span>
                <span className="font-semibold text-slate-800">{client?.academyName || "My Academy"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                  <Lock className="w-3 h-3" />
                  HOLD (PENDING ADMIN APPROVAL)
                </span>
              </div>
            </div>

            {/* Official WhatsApp 03473576122 Highlight Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white border border-emerald-500/30 shadow-lg space-y-3.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Send Payment Script on WhatsApp</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Fast Approval
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Send the screenshot / script of your payment to our official WhatsApp number below so the admin can activate your account immediately:
              </p>
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/10 border border-white/15">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                    Official WhatsApp for Buy &amp; Payment
                  </span>
                  <span className="font-mono font-black text-lg sm:text-xl text-white tracking-wider">
                    {OFFICIAL_WHATSAPP}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(OFFICIAL_WHATSAPP);
                    setCopiedWhatsapp(true);
                    setTimeout(() => setCopiedWhatsapp(false), 2500);
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedWhatsapp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWhatsapp ? "Copied" : "Copy Number"}</span>
                </button>
              </div>
              <a
                href={`https://wa.me/${OFFICIAL_WHATSAPP_INTL}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum, I registered on PaperWala (${client?.fullName || ""}, ${client?.email || ""}) and submitted my payment${
                    submission?.transactionRef && submission.transactionRef !== "Not provided"
                      ? ` (TID: ${submission.transactionRef})`
                      : ""
                  }. Sending my payment screenshot / script here for activation.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp ({OFFICIAL_WHATSAPP}) &amp; Send Screenshot</span>
              </a>
            </div>

            {/* Submitted Payment Proof Overview or QR Code if not yet paid */}
            {submission ? (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <span className="font-black text-emerald-950">
                      Payment Details Recorded
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold">
                    HBL ({HBL_ACCOUNT_TITLE})
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px] text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction TID:</span>
                    <strong className="font-mono text-emerald-900">{submission.transactionRef}</strong>
                  </div>
                  {submission.senderName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sender Account:</span>
                      <strong className="text-slate-800">{submission.senderName}</strong>
                    </div>
                  )}
                  {submission.amount && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Sent:</span>
                      <strong className="text-slate-800">PKR {submission.amount}</strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submitted at:</span>
                    <span className="text-slate-600">
                      {new Date(submission.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <PaymentQr />
              </div>
            )}

            {/* What happens next box */}
            <div className="space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                What happens next?
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-600 leading-relaxed">
                <li>Admin verifies your payment receipt sent to WhatsApp <strong>{OFFICIAL_WHATSAPP}</strong>.</li>
                <li>Upon approval, your status changes to <strong>ACTIVE</strong> immediately.</li>
                <li>All curriculum question banks and exam generators unlock automatically.</li>
              </ul>
            </div>

            {/* Interactive Live Status Check & Logout */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => loadProfile(false)}
                disabled={checking}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
                <span>{checking ? "Checking approval..." : "Check Approval Status Now"}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
