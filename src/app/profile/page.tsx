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
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-emerald-700">
            <ArrowLeft className="w-4 h-4" />
            <span>
              PaperWala <span className="font-urdu text-emerald-600 font-normal">پیپر والا</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/select-questions"
              id="btn-profile-new-paper"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
            >
              <FilePlus2 className="w-4 h-4" /> New Paper
            </Link>
            {client && (
              <button
                onClick={handleLogout}
                id="btn-profile-logout"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-rose-600 hover:border-rose-200"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
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
