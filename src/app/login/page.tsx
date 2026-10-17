// src/app/login/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  User,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("ali.khaliq50@gmail.com");
  const [password, setPassword] = useState("laptop321");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailOrPhone.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Invalid login credentials. Please try again.");
        return;
      }

      // If default admin, show choice options
      if (
        data.isAdmin ||
        data.client?.email?.toLowerCase() === "ali.khaliq50@gmail.com" ||
        emailOrPhone.trim().toLowerCase() === "ali.khaliq50@gmail.com"
      ) {
        setAdminLoggedIn(true);
        return;
      }

      // If educator profile is pending verification, route to verification hold page
      if (
        data.client?.subscription?.status === "pending_verification" ||
        data.client?.isVerified === false ||
        data.isPendingVerification
      ) {
        router.push("/verification-pending");
        router.refresh();
        return;
      }

      router.push("/select-questions");
      router.refresh();
    } catch {
      setError("Network or server connection issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-emerald-50/40 to-cyan-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      {/* Ambient iOS Liquid Refraction Orbs */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[340px] rounded-full bg-gradient-to-tr from-emerald-400/25 via-teal-300/25 to-cyan-400/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-8 left-1/4 w-80 h-80 rounded-full bg-emerald-300/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-cyan-300/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Top Floating Liquid Glass Navbar Pill */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4 mb-6 flex justify-center">
        <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white/45 backdrop-blur-2xl saturate-200 border border-white/85 shadow-[0_12px_30px_-8px_rgba(15,23,42,0.12),0_3px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_rgba(255,255,255,0.95)]">
          <Link
            href="/login"
            className="relative overflow-hidden px-4 py-1.5 rounded-xl bg-gradient-to-b from-white/95 via-white/80 to-slate-100/75 border border-white text-slate-900 font-extrabold text-xs shadow-[0_3px_0_0_#cbd5e1,0_6px_14px_-2px_rgba(15,23,42,0.12),inset_0_2px_1px_#ffffff] flex items-center gap-1.5"
          >
            <span
              className="pointer-events-none absolute inset-x-1 top-0.5 h-2 rounded-t-full bg-gradient-to-b from-white/90 to-transparent"
              aria-hidden="true"
            />
            <Lock className="w-3.5 h-3.5 text-emerald-600 relative z-10" />
            <span className="relative z-10">Sign In</span>
          </Link>
          <Link
            href="/register"
            className="relative overflow-hidden px-4 py-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-white/60 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Register Account</span>
          </Link>
        </div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 px-4">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_5px_0_0_#065f46,0_12px_24px_-4px_rgba(16,185,129,0.45),inset_0_2px_2px_rgba(255,255,255,0.75)] group-hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150">
            <span
              className="pointer-events-none absolute inset-x-1.5 top-1 h-2.5 rounded-t-full bg-gradient-to-b from-white/60 to-transparent"
              aria-hidden="true"
            />
            <BookOpen className="w-6 h-6 relative z-10 drop-shadow" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-slate-900 leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
                PaperWala
              </span>
              <span className="font-urdu text-emerald-700 text-xl font-bold leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">
                پیپر والا
              </span>
            </div>
            <span className="text-[11px] text-slate-600 font-semibold block mt-1">
              Pakistan&apos;s #1 Exam Paper Generator
            </span>
          </div>
        </Link>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-2 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
          Sign In to Your Account
        </h2>
        <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
          Welcome back! Access your question bank, past generated papers, and custom school templates.
        </p>
      </div>

      <div className="relative z-10 mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {adminLoggedIn ? (
          <div className="relative overflow-hidden bg-gradient-to-b from-white/65 via-white/45 to-white/60 backdrop-blur-3xl saturate-200 py-8 px-6 sm:px-8 rounded-3xl border border-white/90 shadow-[0_28px_70px_-15px_rgba(15,23,42,0.22),0_6px_0_0_rgba(203,213,225,0.65),inset_0_2px_2px_0_rgba(255,255,255,1),inset_0_-2px_6px_0_rgba(16,185,129,0.08)] space-y-6 text-center animate-in zoom-in-95 duration-200">
            {/* Top Liquid Glass Specular Sheen */}
            <div
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/65 to-transparent"
              aria-hidden="true"
            />

            <div className="relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-b from-indigo-500 via-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-[0_5px_0_0_#312e81,0_12px_24px_-4px_rgba(79,70,229,0.45),inset_0_2px_2px_rgba(255,255,255,0.65)]">
              <span
                className="pointer-events-none absolute inset-x-1.5 top-1 h-3 rounded-t-full bg-gradient-to-b from-white/55 to-transparent"
                aria-hidden="true"
              />
              <ShieldCheck className="w-8 h-8 relative z-10" />
            </div>

            <div className="relative space-y-1.5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome, Ali Khaliq!
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50/80 backdrop-blur-md text-indigo-700 border border-indigo-200/90 shadow-[inset_0_1px_0_#ffffff]">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Authenticated as Administrator</span>
              </div>
              <p className="text-xs text-slate-600 pt-1 font-medium">
                Choose an option below to proceed:
              </p>
            </div>

            <div className="relative space-y-3.5 pt-2">
              <Link
                href="/admin/users"
                id="btn-goto-admin-panel"
                className="relative overflow-hidden w-full py-3.5 px-5 bg-gradient-to-b from-indigo-500 via-indigo-600 to-purple-700 text-white font-black text-sm rounded-2xl border border-indigo-300/70 shadow-[0_5px_0_0_#312e81,0_12px_24px_-4px_rgba(79,70,229,0.45),inset_0_2px_2px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span
                  className="pointer-events-none absolute inset-x-2 top-0.5 h-3.5 rounded-t-full bg-gradient-to-b from-white/45 to-transparent"
                  aria-hidden="true"
                />
                <ShieldCheck className="w-5 h-5 text-indigo-100 relative z-10" />
                <span className="relative z-10">Admin Panel</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
              </Link>

              <Link
                href="/select-questions"
                id="btn-goto-generator"
                className="relative overflow-hidden w-full py-3.5 px-5 bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-black text-sm rounded-2xl border border-emerald-300/80 shadow-[0_5px_0_0_#065f46,0_12px_24px_-4px_rgba(16,185,129,0.45),inset_0_2px_2px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span
                  className="pointer-events-none absolute inset-x-2 top-0.5 h-3.5 rounded-t-full bg-gradient-to-b from-white/50 to-transparent"
                  aria-hidden="true"
                />
                <BookOpen className="w-5 h-5 text-emerald-100 relative z-10" />
                <span className="relative z-10">Question Bank &amp; Exam Generator</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
              </Link>
            </div>

            <div className="relative pt-3 border-t border-white/60 text-center">
              <Link
                href="/"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                &larr; Back to Homepage
              </Link>
            </div>
          </div>
        ) : (
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

            <form onSubmit={handleLogin} className="relative space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                  Mobile / WhatsApp or Email:
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
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                  Password:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 z-10 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
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
                    {loading ? "Signing in..." : "Sign In to PaperWala"}
                  </span>
                  {!loading && <ArrowRight className="w-4 h-4 relative z-10" />}
                </button>
              </div>
            </form>

            <div className="relative pt-4 border-t border-white/60 text-center space-y-3">
              <p className="text-xs text-slate-700 font-medium">
                Don&apos;t have an account yet?
              </p>
              <Link
                href="/register"
                className="relative overflow-hidden w-full py-2.5 px-4 rounded-2xl bg-gradient-to-b from-white/85 via-white/65 to-slate-100/70 hover:from-white/95 hover:to-white/85 backdrop-blur-xl border border-white/90 text-slate-900 font-extrabold text-xs shadow-[0_4px_0_0_rgba(203,213,225,0.85),0_8px_18px_-4px_rgba(15,23,42,0.12),inset_0_2px_1px_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 inline-flex items-center justify-center gap-1.5"
              >
                <span
                  className="pointer-events-none absolute inset-x-2 top-0.5 h-3 rounded-t-full bg-gradient-to-b from-white/80 to-transparent"
                  aria-hidden="true"
                />
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 relative z-10" />
                <span className="relative z-10">Register New Account</span>
              </Link>
              <div className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe, fast, and board-standard examination platform</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
