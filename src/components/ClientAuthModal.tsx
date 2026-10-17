// src/components/ClientAuthModal.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Lock,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { ClientUser } from "@/lib/types";

interface ClientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: ClientUser) => void;
  initialMode?: "login" | "signup";
}

export function ClientAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: ClientAuthModalProps) {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminClient, setAdminClient] = useState<ClientUser | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanIdentifier = emailOrPhone.trim();
      const res = await fetch("/api/auth/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanIdentifier,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Invalid credentials. Please check your username/phone and password.");
        return;
      }

      if (data.client) {
        // If default admin, give options
        if (
          data.isAdmin ||
          data.client?.email?.toLowerCase() === "ali.khaliq50@gmail.com" ||
          cleanIdentifier.toLowerCase() === "ali.khaliq50@gmail.com"
        ) {
          setAdminClient(data.client);
          return;
        }

        if (
          data.client?.subscription?.status === "pending_verification" ||
          data.client?.isVerified === false ||
          data.isPendingVerification
        ) {
          window.location.href = "/verification-pending";
          return;
        }
        onSuccess(data.client);
        onClose();
      }
    } catch {
      setError("Network or server connection issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Ambient Liquid Refraction Glow Behind Modal */}
      <div className="relative max-w-md w-full">
        <div className="absolute -top-12 -left-12 w-52 h-52 rounded-full bg-emerald-400/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-52 h-52 rounded-full bg-cyan-400/25 blur-3xl pointer-events-none" />

        <div className="relative rounded-[28px] bg-gradient-to-b from-white/75 via-white/55 to-white/70 backdrop-blur-3xl border border-white/95 ring-1 ring-slate-900/[0.05] shadow-[0_30px_70px_-15px_rgba(15,23,42,0.28),0_10px_30px_-6px_rgba(16,185,129,0.16),inset_0_2px_3px_0_rgba(255,255,255,1),inset_0_-3px_8px_0_rgba(255,255,255,0.8)] p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 text-slate-800 overflow-hidden">
          {/* Specular Top Liquid Highlight */}
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-xl bg-white/75 hover:bg-white border border-white text-slate-500 hover:text-slate-900 shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Brand & Greeting */}
          <div className="text-center space-y-1.5 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-xl text-emerald-800 text-[11px] font-bold border border-white shadow-[0_2px_6px_rgba(16,185,129,0.12),inset_0_1px_1px_#ffffff]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>PaperWala &bull; پیپر والا</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto font-medium">
              Sign in to access your question bank, past generated papers, and custom school branding.
            </p>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50/85 backdrop-blur-xl border border-rose-200/90 text-rose-800 text-xs font-semibold flex items-start gap-2 shadow-[inset_0_1px_1px_#ffffff] animate-in fade-in">
              <span className="text-rose-500 font-bold shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {adminClient ? (
            <div className="space-y-5 text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-b from-indigo-500 via-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-[0_5px_0_0_#3730a3,0_12px_24px_-4px_rgba(79,70,229,0.4),inset_0_2px_2px_rgba(255,255,255,0.6)]">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Welcome, Ali Khaliq!
                </h3>
                <p className="text-xs text-slate-600">
                  Logged in with Administrator privileges. Where would you like to go?
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <Link
                  href="/admin/users"
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-gradient-to-b from-indigo-500 via-indigo-600 to-purple-700 text-white font-black text-xs rounded-2xl shadow-[0_4px_0_0_#312e81,0_10px_20px_-4px_rgba(79,70,229,0.4),inset_0_2px_2px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 group transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-200" />
                  <span>Admin Panel</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    onSuccess(adminClient);
                    onClose();
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-black text-xs rounded-2xl shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.4),inset_0_2px_2px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 group transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-100" />
                  <span>Continue to Paper Generator</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
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
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white/65 focus:bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl outline-none shadow-[inset_0_2px_4px_rgba(15,23,42,0.06),0_1px_0_rgba(255,255,255,0.95)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-semibold placeholder:text-slate-400 text-xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white/65 focus:bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl outline-none shadow-[inset_0_2px_4px_rgba(15,23,42,0.06),0_1px_0_rgba(255,255,255,0.95)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-semibold placeholder:text-slate-400 text-xs transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3D Liquid Glass Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-black text-sm rounded-2xl shadow-[0_5px_0_0_#065f46,0_12px_24px_-4px_rgba(16,185,129,0.45),inset_0_2px_2px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_0_#065f46,0_16px_28px_-4px_rgba(16,185,129,0.55),inset_0_2px_3px_rgba(255,255,255,0.75)] active:translate-y-0.5 active:shadow-[0_2px_0_0_#065f46] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  <span>{loading ? "Signing in..." : "Sign In to PaperWala"}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              {/* Trust Badges */}
              <div className="pt-3 border-t border-white/70 flex items-center justify-around text-[11px] text-slate-600 font-semibold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official BISE System</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secure Educator Portal</span>
                </div>
              </div>

              {/* Liquid Glass Link to Registration page */}
              <div className="text-center text-xs text-slate-600 pt-1">
                <Link
                  href="/register"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-2xl bg-gradient-to-b from-white/85 via-white/50 to-white/70 hover:from-white hover:to-emerald-50/80 border border-white/95 font-extrabold text-emerald-800 shadow-[0_3px_0_0_rgba(203,213,225,0.85),0_6px_14px_-2px_rgba(15,23,42,0.08),inset_0_2px_2px_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
                >
                  <span>Don&apos;t have an account? Register Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
