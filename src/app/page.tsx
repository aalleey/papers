import React from "react";
import Link from "next/link";
import { BookOpen, ShieldCheck, FileSpreadsheet, ArrowRight, CheckCircle2, Award, Sparkles } from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">Paper Maker</span>
              <span className="text-[10px] text-emerald-400 block -mt-1 font-medium tracking-wide">
                Pakistani School Exam Generator
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1 Milestone Complete &mdash; Question Bank Admin Area</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            High-Quality Exam Papers for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Pakistani Schools
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Standardized question bank management with bilingual Urdu Nastaliq typography, KaTeX mathematical formulas, and cascading curriculum hierarchy for Punjab and Federal Boards.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 active:scale-[0.98] transition-all"
            >
              <span>Launch Admin Question Bank</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/import"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>CSV Bulk Ingestion</span>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              $f(x)$
            </div>
            <h3 className="text-lg font-bold text-white">KaTeX Mathematical Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Native LaTeX rendering for inline <code className="text-emerald-300 font-mono">$...$</code> and block formulas. Supports quadratic equations, radicals, and complex fractions effortlessly.
            </p>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-emerald-300 font-mono">
              <MathRenderer content="Formula: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-urdu text-lg">
              اردو
            </div>
            <h3 className="text-lg font-bold text-white">Noto Nastaliq Urdu (RTL)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pakistani educational standards require authentic Urdu typography. Embedded Google Font Noto Nastaliq with native right-to-left direction and embedded math.
            </p>
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <UrduText content="دو درجی مساوات کی معیاری شکل: $ax^2 + bx + c = 0$" className="text-emerald-300 text-sm" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              RLS
            </div>
            <h3 className="text-lg font-bold text-white">Strict Row-Level Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Database security enforced at the Postgres engine level. Logged-out visitors cannot read questions, and only authorized administrators can modify curriculum tables.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full Supabase Postgres Security Configured</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Paper Maker &bull; Phase 1 Milestone &bull; Built with Next.js, Supabase, Tailwind, KaTeX & Noto Nastaliq Urdu
      </footer>
    </div>
  );
}
