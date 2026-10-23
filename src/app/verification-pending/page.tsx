// src/app/verification-pending/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Phone,
  MessageCircle,
  BookOpen,
  ArrowRight,
  LogOut,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { ClientUser } from "@/lib/types";
import { PaymentQr } from "@/components/PaymentQr";

export default function VerificationPendingPage() {
  const router = useRouter();
  const [client, setClient] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [copiedRaast, setCopiedRaast] = useState(false);

  const RAAST_ID = "03092770207";
  const ADMIN_WHATSAPP = "03473576122";
  const ADMIN_WHATSAPP_INTL = "923473576122";
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRaast(true);
    setTimeout(() => setCopiedRaast(false), 2500);
  };

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center space-y-2">
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

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
          {/* Top Hold Banner */}
          <div className="bg-amber-500 p-6 text-white text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Application Under Verification
            </h1>
            <p className="text-xs text-amber-100 font-medium max-w-sm mx-auto mt-1">
              Your profile is on <strong>HOLD</strong>. Exam generator and question bank features are temporarily locked until the system administrator verifies your Raast fee payment.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
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

            {/* Submitted Payment Proof Overview */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <span className="font-bold text-emerald-950">
                    Payment Details Submitted
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  Raast ID: {RAAST_ID}
                </span>
              </div>

              {submission ? (
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
              ) : (
                <div className="text-[11px] text-slate-600 space-y-2">
                  <p>
                    Did you pay? Transfer registration fee to Raast ID <strong>{RAAST_ID}</strong>:
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-200">
                    <span className="font-mono font-bold text-emerald-800">{RAAST_ID}</span>
                    <button
                      onClick={() => copyToClipboard(RAAST_ID)}
                      className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold"
                    >
                      {copiedRaast ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <PaymentQr />
                </div>
              )}
            </div>

            {/* After submitting: send payment screenshot / script to admin WhatsApp */}
            {submission && (
              <div className="p-4 rounded-2xl bg-green-50 border border-green-300 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-black text-green-900">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span>Send your payment screenshot on WhatsApp</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  You have submitted your payment. To get approved faster, please send the screenshot / script of your
                  payment to this WhatsApp number:
                </p>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-green-200">
                  <span className="font-mono font-black text-base text-green-800">{ADMIN_WHATSAPP}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(ADMIN_WHATSAPP);
                      setCopiedWhatsapp(true);
                      setTimeout(() => setCopiedWhatsapp(false), 2500);
                    }}
                    className="px-2.5 py-1 rounded bg-green-600 text-white text-[10px] font-bold cursor-pointer"
                  >
                    {copiedWhatsapp ? "Copied" : "Copy"}
                  </button>
                </div>
                <a
                  href={`https://wa.me/${ADMIN_WHATSAPP_INTL}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum, I registered on PaperWala (${client?.fullName || ""}, ${client?.email || ""}) and submitted my payment. TID: ${submission.transactionRef}. Sending the payment screenshot here.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Open WhatsApp &amp; Send Screenshot</span>
                </a>
              </div>
            )}

            {/* What happens next box */}
            <div className="space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                What happens next?
              </h4>
              <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-600 leading-relaxed">
                <li>The administrator verifies the TID match with banking records.</li>
                <li>Upon approval, your status changes to <strong>ACTIVE</strong> immediately.</li>
                <li>All curriculum question banks and exam generators unlock automatically.</li>
              </ul>
            </div>

            {/* Interactive Live Status Check & WhatsApp Help */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => loadProfile(false)}
                disabled={checking}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
                <span>{checking ? "Checking approval..." : "Check Approval Status Now"}</span>
              </button>

              <a
                href={`https://wa.me/923092770207?text=Assalam-o-Alaikum%20Admin,%20I%20registered%20on%20PaperWala%20(${encodeURIComponent(
                  client?.fullName || ""
                )})%20and%20sent%20payment%20to%20Raast%2003092770207.%20TID:%20${encodeURIComponent(
                  submission?.transactionRef || ""
                )}.%20Please%20verify%20and%20approve%20my%20profile.`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Urgent Activation? Message Admin on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center gap-1"
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
