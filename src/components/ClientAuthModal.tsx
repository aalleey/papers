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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 border border-slate-100 text-slate-800 relative overflow-hidden">
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand & Greeting */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>PaperWala &bull; پیپر والا</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Sign in to access your question bank, past generated papers, and custom school branding.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <span className="text-rose-500 font-bold shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
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
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium placeholder:text-slate-400 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>{loading ? "Signing in..." : "Sign In to PaperWala"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Trust Badges */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official BISE System</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Educator Portal</span>
          </div>
        </div>

        {/* Link to Registration page */}
        <div className="text-center text-xs text-slate-500 pt-1">
          <span>
            Don&apos;t have an educator account?{" "}
            <Link
              href="/register"
              onClick={onClose}
              className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-0.5"
            >
              <span>Create an account here</span>
              <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
