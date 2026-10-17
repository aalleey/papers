"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, Lock, LogIn, Crown, FilePlus2 } from "lucide-react";
import { ClientProfileView } from "@/components/ClientProfileView";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { ClientUser, PaperRecord, ClientPaperStats } from "@/lib/types";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientUser | null>(null);
  const [papers, setPapers] = useState<PaperRecord[]>([]);
  const [stats, setStats] = useState<ClientPaperStats | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/papers");
      if (res.ok) {
        const data = await res.json();
        setClient(data.client);
        setPapers(data.papers);
        setStats(data.stats);
      } else {
        setClient(null);
      }
    } catch {
      setClient(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/client/logout", { method: "POST" });
    setClient(null);
    setPapers([]);
    setStats(null);
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb]">
      {/* Top bar - Transparent 3D Glassmorphic Floating Bar */}
      <header className="sticky top-3 z-30 px-3 sm:px-6 pointer-events-none">
        <div className="pointer-events-auto max-w-6xl mx-auto rounded-2xl bg-white/45 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18),0_4px_16px_-2px_rgba(16,185,129,0.12),inset_0_2px_1px_0_rgba(255,255,255,0.95),inset_0_-2px_4px_0_rgba(15,23,42,0.06)]">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
              <Link
                href="/"
                className="p-2 rounded-xl bg-white/80 hover:bg-white border border-white text-slate-700 hover:text-slate-950 shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150"
                title="Back to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="/" className="flex items-baseline gap-2 text-sm font-extrabold text-slate-900">
                <span className="text-lg tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">PaperWala</span>
                <span className="text-slate-400 text-xs" aria-hidden="true">·</span>
                <span className="font-urdu text-emerald-700 font-bold text-base drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]">پیپر والا</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {client?.email?.toLowerCase() === "ali.khaliq50@gmail.com" && (
                <Link
                  href="/admin/users"
                  id="btn-profile-admin-panel"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-[0_3px_0_0_#c7d2fe,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href="/quick-paper"
                id="btn-profile-quick-paper"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-white text-slate-800 text-xs font-bold shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap"
                title="Create or Paste Instant Paper"
              >
                <span>Quick Paper</span>
              </Link>
              <Link
                href="/select-questions"
                id="btn-profile-new-paper"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white text-xs font-bold shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap"
              >
                <FilePlus2 className="w-3.5 h-3.5" /> New Paper
              </Link>
              {client && (
                <button
                  onClick={handleLogout}
                  id="btn-profile-logout"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white bg-white/80 text-xs font-bold text-slate-700 hover:text-rose-600 shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="py-32 flex flex-col items-center text-slate-400 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">Loading your profile...</p>
          </div>
        ) : !client || !stats ? (
          <div className="max-w-md mx-auto mt-16 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Your profile is locked</h1>
            <p className="text-sm text-slate-500">Log in to see your paper history, usage and plan details.</p>
            <button
              onClick={() => setShowAuth(true)}
              id="btn-profile-login"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm inline-flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Log In
            </button>
            <Link href="/pricing" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700">
              <Crown className="w-3.5 h-3.5 text-amber-500" /> View plans
            </Link>
          </div>
        ) : (
          <ClientProfileView client={client} papers={papers} stats={stats} />
        )}
      </main>

      <ClientAuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={async () => {
          setShowAuth(false);
          await load();
        }}
      />
    </div>
  );
}
