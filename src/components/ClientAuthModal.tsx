"use client";

import React, { useState } from "react";
import { X, User, Lock, Mail, Building, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
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
  initialMode = "login",
}: ClientAuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, fullName, academyName, planId: "free" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Authentication failed");
        return;
      }

      if (data.client) {
        onSuccess(data.client);
        onClose();
      }
    } catch (err) {
      setError("Network or server error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Quick 1-click demo login for fast educator testing
  async function handleQuickDemo(plan: "free" | "standard" | "annual") {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/client/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan,
          email: `${plan}.educator@paperwala.pk`,
          fullName: `${plan.toUpperCase()} Plan Educator`,
          academyName: "Apex Science Academy Lahore",
        }),
      });
      const data = await res.json();
      if (data.client) {
        onSuccess(data.client);
        onClose();
      }
    } catch {
      setError("Failed to create demo session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 border border-slate-200 text-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mx-auto shadow-md mb-2">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === "login" ? "Educator Sign In" : "Create Educator Account"}
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to manage and generate exam papers for your academy.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === "login" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === "signup" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === "signup" && (
            <>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Muhammad Ali"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">School / Academy Name:</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Apex Science Academy"
                    value={academyName}
                    onChange={(e) => setAcademyName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email / Mobile Number:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="teacher@school.edu.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{mode === "login" ? "Sign In" : "Register & Start Free"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Sandbox Testing Buttons */}
        <div className="pt-3 border-t border-slate-100 text-center space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Instant Test Login (Fast Sandbox)
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleQuickDemo("standard")}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors"
            >
              ⭐ Standard Plan (Rs. 2000)
            </button>
            <button
              onClick={() => handleQuickDemo("free")}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
            >
              👤 Free Plan (Rs. 0)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
