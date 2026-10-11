// src/components/ClientAuthModal.tsx
"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Lock,
  Mail,
  Building,
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
  initialMode = "signup",
}: ClientAuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/client/login" : "/api/auth/client/signup";
      
      // Auto normalize phone or email
      const cleanIdentifier = emailOrPhone.trim();
      const payload =
        mode === "login"
          ? { email: cleanIdentifier, password }
          : {
              email: cleanIdentifier,
              password,
              fullName: fullName.trim(),
              academyName: academyName.trim() || "My Academy / School",
              planId: "free",
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Authentication failed. Please check your credentials.");
        return;
      }

      if (data.client) {
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
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
            {mode === "signup" ? "Register Educator Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {mode === "signup"
              ? "Join thousands of Pakistani teachers and generate board-standard exam papers."
              : "Sign in to access your papers, question bank, and saved templates."}
          </p>
        </div>

        {/* Friendly Segmented Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === "signup"
                ? "bg-white text-emerald-900 shadow-sm font-extrabold"
                : "hover:text-slate-900 text-slate-500"
            }`}
          >
            Register Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-sm font-extrabold"
                : "hover:text-slate-900 text-slate-500"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <span className="text-rose-500 font-bold shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === "signup" && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sir Muhammad Ali"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium placeholder:text-slate-400 text-xs"
                />
              </div>
            </div>
          )}

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
            {mode === "signup" && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                We use this to verify your account and send paper alerts.
              </span>
            )}
          </div>

          {mode === "signup" && (
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>School or Academy Name</span>
                <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Lahore Science Academy"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 font-medium placeholder:text-slate-400 text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
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
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            <span>
              {loading
                ? "Please wait..."
                : mode === "signup"
                ? "Register Account 🚀"
                : "Sign In to PaperWala"}
            </span>
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
            <span>No Credit Card Needed</span>
          </div>
        </div>

        {/* Switch Mode Prompt */}
        <div className="text-center text-xs text-slate-500 pt-1">
          {mode === "signup" ? (
            <span>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Sign In here
              </button>
            </span>
          ) : (
            <span>
              New to PaperWala?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Create an account in 30 seconds
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
