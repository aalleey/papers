"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Printer,
  Shuffle,
  FileCheck2,
  GraduationCap,
  Layers,
  ChevronDown,
  ChevronUp,
  School,
  Check,
  SlidersHorizontal,
  Download,
  HelpCircle,
  Clock,
  Award,
  Zap,
  Crown,
  LogIn,
  LogOut,
  User,
  Lock,
} from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { ClientUser } from "@/lib/types";

export default function Home() {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Interactive preview state for the Hero Mock Paper
  const [heroLang, setHeroLang] = useState<"Bilingual" | "English" | "Urdu">("Bilingual");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Structured Data (JSON-LD) for Google SEO Rich Snippets
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "PaperWala",
        "alternateName": "پیپر والا",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All (Web App)",
        "description":
          "Pakistan's #1 exam and test paper generator for schools, colleges, and academies. Generates board-standard papers with authentic Urdu Nastaliq and KaTeX mathematical formulas for Punjab Boards and Federal Board (FBISE).",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "PKR",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1280",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does PaperWala match official Punjab Board (BISE) exam formats?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "PaperWala strictly adheres to the official pairing schemes and weightage distributions set by Punjab Boards (Lahore, Rawalpindi, Faisalabad, Gujranwala, Multan, etc.) and FBISE. Questions include 1-mark MCQs, 2-mark Short Questions, and 4/5-mark Long/Detailed Questions with exact marks tags.",
            },
          },
          {
            "@type": "Question",
            "name": "Does PaperWala support the new 2026-27 Single National Curriculum (SNC)?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Yes. PaperWala contains the latest Class 10 (New) 2026-27 syllabus questions, including Computer Science Unit 1 (Operating Systems), Unit 2 (System Recovery and Maintenance), Unit 8 (Digital Entrepreneurship), and Mathematics Quadratic Equations.",
            },
          },
          {
            "@type": "Question",
            "name": "Can I print exam papers in Urdu, English, and Bilingual format?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Yes. PaperWala offers one-click toggle between English-only, Urdu-only (rendered in authentic Google Font Noto Nastaliq Urdu with native RTL direction), and side-by-side or stacked Bilingual format.",
            },
          },
          {
            "@type": "Question",
            "name": "Does PaperWala automatically generate Answer Keys and OMR Bubble Sheets?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                "Yes. Every generated exam paper comes with an automatically matched Answer Key grid for teachers and a standard 4-option OMR bubble sheet for student roll numbers and MCQ answers.",
            },
          },
        ],
      },
    ],
  };

  useEffect(() => {
    async function loadClient() {
      try {
        const res = await fetch("/api/auth/client/me");
        const data = await res.json();
        if (data.client) {
          setClientUser(data.client);
        }
      } catch (err) {
        console.error("Failed to load client on home:", err);
      }
    }
    loadClient();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/client/logout", { method: "POST" });
      setClientUser(null);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white font-sans">
      {/* Inject JSON-LD Schema for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* =========================================================================
          TOP STICKY NAVBAR
          ========================================================================= */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group" id="nav-brand-logo">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">PaperWala</span>
                <span className="font-urdu text-emerald-400 text-lg font-bold">پیپر والا</span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-1 font-medium tracking-wide">
                Pakistan&apos;s #1 Exam Paper Generator
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300" aria-label="Main Navigation">
            <a href="#curriculum" className="hover:text-emerald-400 transition-colors">
              Curriculum &amp; Boards
            </a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              Key Features
            </a>
            <a href="#interactive-preview" className="hover:text-emerald-400 transition-colors">
              Live Paper Sample
            </a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              FAQs
            </a>
            <Link
              href="/pricing"
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Pricing &amp; Plans</span>
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {clientUser ? (
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold shadow-xs">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-200">{clientUser.fullName.split(" ")[0]}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                  {clientUser.subscription.planName}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-0.5"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                id="nav-client-login-btn"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Client Login</span>
              </button>
            )}

            <Link
              href="/pricing"
              id="nav-pricing-btn"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Plans (From Rs. 30)</span>
            </Link>

            <Link
              href="/admin/login"
              id="nav-admin-login-btn"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin Portal</span>
            </Link>

            <Link
              href="/select-questions?chapter=2"
              id="nav-generate-paper-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/60 active:scale-[0.98] transition-all ring-1 ring-emerald-400/30"
            >
              <Zap className="w-4 h-4 fill-white text-white" />
              <span>Generate Paper</span>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION: High visual impact, SEO headline, Quick Actions
          ========================================================================= */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          {/* Subtle Ambient Glow Blobs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-indigo-600/15 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-600/10 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              {/* Badge Announcement */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 shadow-sm shadow-emerald-950/40">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Punjab Boards &amp; FBISE New 2026-27 Syllabus Ready</span>
              </div>

              {/* Main H1 Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.12]">
                Generate Board-Standard{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Exam Papers
                </span>{" "}
                in 60 Seconds
              </h1>

              {/* Urdu Subheading */}
              <div className="font-urdu text-xl sm:text-2xl text-emerald-300/90 leading-relaxed font-bold max-w-2xl mx-auto" dir="rtl">
                پنجاب اور فیڈرل بورڈز کے عین مطابق امتحانی پرچے، او ایم آر شیٹس اور حل شدہ کیز صرف ایک کلک میں تیار کریں!
              </div>

              {/* Descriptive Paragraph for SEO */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
                <strong className="text-white font-semibold">PaperWala (پیپر والا)</strong> empowers Pakistani school teachers, academy directors, and tuition centers to create print-ready examination papers from a verified question bank. Featuring authentic <strong className="text-emerald-300">Noto Nastaliq Urdu</strong> typography, <strong className="text-emerald-300">KaTeX</strong> mathematical formulas, 4 anti-cheating paper codes (A, B, C, D), and automated answer keys.
              </p>

              {/* Primary Call-to-Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href="/select-questions?chapter=2"
                  id="hero-cta-start"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-emerald-900/60 active:scale-[0.98] transition-all ring-2 ring-emerald-400/40"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Start Creating Paper (Free)</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>

                <Link
                  href="/paper-editor"
                  id="hero-cta-editor"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm sm:text-base transition-all hover:border-emerald-500/40 shadow-lg"
                >
                  <Printer className="w-5 h-5 text-emerald-400" />
                  <span>Paper Preview &amp; Print</span>
                </Link>

                <Link
                  href="/admin/login"
                  id="hero-cta-admin"
                  className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs sm:text-sm font-semibold transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Admin Bank</span>
                </Link>
              </div>

              {/* Trust & Spec Ribbon */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400">640+</div>
                  <div className="text-xs text-slate-400 font-medium">Verified Questions Live</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xl sm:text-2xl font-black text-teal-400">9 Boards</div>
                  <div className="text-xs text-slate-400 font-medium">Punjab BISE + FBISE</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xl sm:text-2xl font-black text-cyan-400">4 Versions</div>
                  <div className="text-xs text-slate-400 font-medium">A, B, C, D Shuffled Codes</div>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xl sm:text-2xl font-black text-amber-400">100% Free</div>
                  <div className="text-xs text-slate-400 font-medium">Print-Ready PDF Output</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            LIVE INTERACTIVE PAPER SAMPLE SHOWCASE
            ========================================================================= */}
        <section id="interactive-preview" className="py-12 bg-slate-900/60 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Authentic Pakistani Exam Format
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Real-time preview of PaperWala&apos;s board-standard layout. Toggle language mode to see how authentic Urdu Nastaliq and English typeset side-by-side.
              </p>

              {/* Language Switcher Buttons */}
              <div className="flex items-center justify-center gap-2 mt-4 bg-slate-950 p-1 rounded-xl border border-slate-800 inline-flex">
                <button
                  onClick={() => setHeroLang("Bilingual")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    heroLang === "Bilingual"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Both (Bilingual)
                </button>
                <button
                  onClick={() => setHeroLang("English")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    heroLang === "English"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  English Only
                </button>
                <button
                  onClick={() => setHeroLang("Urdu")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    heroLang === "Urdu"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Urdu Nastaliq
                </button>
              </div>
            </div>

            {/* Simulated Paper Sheet */}
            <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-200 font-sans relative overflow-hidden">
              {/* Paper Watermark Badge */}
              <div className="absolute right-6 top-6 px-3 py-1 rounded bg-slate-100 text-slate-500 font-mono text-[10px] uppercase font-bold border border-slate-200">
                Paper Code: 3041 &bull; Version A
              </div>

              {/* Institutional Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  YOUR INSTITUTION / ACADEMY NAME
                </h3>
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
                  FIRST TERM EXAMINATION 2026-27 &bull; CLASS 10TH
                </div>
                <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-800 pt-2 border-t border-slate-200">
                  <span>Subject: Computer Science (کمپیوٹر)</span>
                  <span>Syllabus: Unit-2 System Recovery &amp; Maintenance</span>
                  <span>Time: 2:30 Hours</span>
                  <span>Total Marks: 75</span>
                </div>
              </div>

              {/* Student Roll No Banner */}
              <div className="flex flex-wrap items-center justify-between text-xs py-2 bg-slate-50 border-b border-slate-200 px-2 mt-2 font-medium">
                <div>Roll No: ____________________</div>
                <div>Name: ______________________</div>
                <div>Section: _______</div>
                <div>Signature: _______</div>
              </div>

              {/* SECTION A: MCQs */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-1 rounded text-xs font-extrabold">
                  <span>SECTION-A (Multiple Choice Questions)</span>
                  <span>Marks: 10</span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Sample Question 1 */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-bold flex items-start justify-between gap-4">
                      {heroLang !== "Urdu" && (
                        <span>Q.1 Task Manager is mainly used to:</span>
                      )}
                      {heroLang !== "English" && (
                        <span className="font-urdu text-sm text-right leading-relaxed flex-1" dir="rtl">
                          ۱۔ ٹاسک مینیجر بنیادی طور پر کس مقصد کے لیے استعمال ہوتا ہے؟
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-200 text-slate-700">
                      <div className="font-medium">A) Monitor running apps</div>
                      <div className="font-medium">B) Clean up disks</div>
                      <div className="font-medium">C) Scan for viruses</div>
                      <div className="font-medium">D) Manage files</div>
                    </div>
                  </div>

                  {/* Sample Question 2 (with Math formula) */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-bold flex items-start justify-between gap-4">
                      {heroLang !== "Urdu" && (
                        <div>
                          <span>Q.2 In mathematics, standard form of quadratic equation is: </span>
                          <span className="text-blue-700 font-mono ml-1">$ax^2 + bx + c = 0$</span>
                        </div>
                      )}
                      {heroLang !== "English" && (
                        <div className="font-urdu text-sm text-right leading-relaxed flex-1" dir="rtl">
                          ۲۔ ریاضی میں دو درجی مساوات کی معیاری شکل: $ax^2 + bx + c = 0$
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-200 text-slate-700">
                      <div className="font-medium">A) $a = 0$</div>
                      <div className="font-medium font-bold text-emerald-700">B) $a \neq 0$ (Correct)</div>
                      <div className="font-medium">C) $b = 0$</div>
                      <div className="font-medium">D) $c = 0$</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button at footer of sample */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ready for Photocopier &bull; Clean Single or Double Column Printing</span>
                </div>
                <Link
                  href="/select-questions?chapter=2"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <span>Select Questions for this Unit</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CURRICULUM MATRIX & QUICK CHAPTER LAUNCHERS
            ========================================================================= */}
        <section id="curriculum" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-3.5 h-3.5" />
              <span>Active Question Bank Matrix</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Instant Chapter Launchers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Click any active chapter below to instantly open the question selector with live topics and questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chapter 2 Card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4 hover:border-emerald-400 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                Most Popular
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
                02
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Computer Science &bull; Class 10 (New)
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Unit 2: System Recovery &amp; Advanced Maintenance
                </h3>
                <span className="font-urdu text-slate-400 text-sm block mt-1">
                  سسٹم ریکوری اور ایڈوانسڈ مینٹیننس
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Total Questions:</span>
                  <span className="font-bold text-white">210 Questions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Breakdown:</span>
                  <span className="text-slate-300">103 MCQs &bull; 102 Short &bull; 5 Long</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Topics Covered:</span>
                  <span className="text-slate-300">7 Topics (2.1 to 2.7)</span>
                </div>
              </div>

              <Link
                href="/select-questions?chapter=2"
                id="launch-ch2-btn"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-950/50"
              >
                <span>Launch Unit 2 Question Bank</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Chapter 1 Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">
                01
              </div>

              <div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                  Computer Science &bull; Class 10 (New)
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  Unit 1: Operating Systems: Structure and Services
                </h3>
                <span className="font-urdu text-slate-400 text-sm block mt-1">
                  آپریٹنگ سسٹمز: ساخت اور خدمات
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Total Questions:</span>
                  <span className="font-bold text-white">226 Questions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Breakdown:</span>
                  <span className="text-slate-300">110 MCQs &bull; 106 Short &bull; 10 Long</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Topics Covered:</span>
                  <span className="text-slate-300">Full Chapter &amp; Exercises</span>
                </div>
              </div>

              <Link
                href="/select-questions?chapter=1"
                id="launch-ch1-btn"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-all"
              >
                <span>Launch Unit 1 Question Bank</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Chapter 8 Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">
                08
              </div>

              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                  Computer Science &bull; Class 10 (New)
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  Unit 8: Digital Entrepreneurship
                </h3>
                <span className="font-urdu text-slate-400 text-sm block mt-1">
                  ڈیجیٹل انٹرپرینیورشپ
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Total Questions:</span>
                  <span className="font-bold text-white">180 Questions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Breakdown:</span>
                  <span className="text-slate-300">80 MCQs &bull; 85 Short &bull; 15 Long</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Topics Covered:</span>
                  <span className="text-slate-300">CRM, Ethics, IP &amp; Marketing</span>
                </div>
              </div>

              <Link
                href="/select-questions?chapter=8"
                id="launch-ch8-btn"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-all"
              >
                <span>Launch Unit 8 Question Bank</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            KEY FEATURES SHOWCASE: 6 Core Pillars
            ========================================================================= */}
        <section id="features" className="py-16 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award className="w-3.5 h-3.5" />
                <span>Engineered for Pakistani Educators</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Why Top Schools &amp; Academies Choose PaperWala
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Everything required to conduct clean, cheating-free, and board-standard examinations without the headaches of InPage or manual formatting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-urdu text-lg">
                  اردو
                </div>
                <h3 className="text-lg font-bold text-white">Authentic Noto Nastaliq Urdu (RTL)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Full right-to-left Pakistani typography powered by Google Font Noto Nastaliq. Zero corrupted characters or mismatched Urdu fonts. Works seamlessly side-by-side with English text.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-urdu text-sm text-emerald-300 text-right" dir="rtl">
                  پنجاب بورڈ کے نصاب کے عین مطابق خالص نستعلیق رسم الخط
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-mono font-bold text-sm">
                  $f(x)$
                </div>
                <h3 className="text-lg font-bold text-white">KaTeX Vector Mathematical Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Razor-sharp vector rendering for complex fractions, square roots, matrices, quadratic formulas, and geometry symbols. Formulae stay crisp at any printer resolution.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-mono text-teal-300">
                  <MathRenderer content="Formula: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Shuffle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">4 Anti-Cheating Versions (A, B, C, D)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Eliminate hall cheating with a single click. PaperWala generates 4 scrambled versions of the exam with unique 4-digit paper codes (3041, 3042, etc.) and matching answer keys.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Unique Codes &amp; Shuffled Bubbles</span>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Auto OMR Sheets &amp; Grading Keys</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate official 4-circle OMR bubble sheets for students, plus full color-coded answer keys for teachers to mark 100 papers in under 15 minutes.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Automatic Grading Keys Included</span>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Board Pairing Scheme Compliance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tailored to BISE Lahore, Rawalpindi, and FBISE standards. Accurate marks weights: 1 mark for MCQs, 2 marks for Short Questions, and 4/5 marks for Detailed Long Questions.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Punjab &amp; Federal Scheme Compliant</span>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Custom School Name &amp; Crest</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every paper generated carries your school or academy title, exam type, date, session, and instructions. Print directly to standard A4 or Legal paper sizes.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% Institutional Customization</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            HOW IT WORKS: 4-Step Visual Process
            ========================================================================= */}
        <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Create a Complete Exam Paper in 4 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              No complicated software or design experience needed. Fast and intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-white">Select Class &amp; Chapter</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose your Board (Punjab/Federal), Class (10th/9th), Subject, and active Unit.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 font-black flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-white">Pick Questions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click questions individually or use 1-click &quot;Auto Pattern&quot; to pick 10 MCQs, 5 Shorts, and 2 Longs.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-white">Customize Paper</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add your Academy Name, adjust font sizes, toggle Bilingual layout, and generate 4 version codes.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-white">Print &amp; Export PDF</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instantly print or download your vector-sharp exam paper alongside the teacher answer key and OMR sheet.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PUNJAB & FEDERAL BOARDS DIRECTORY SHOWCASE
            ========================================================================= */}
        <section className="py-12 bg-slate-900/60 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Compliant with All Major Pakistani Educational Boards
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto text-xs font-semibold">
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">BISE Lahore</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">BISE Rawalpindi</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">BISE Faisalabad</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">BISE Gujranwala</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">BISE Multan</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">BISE Sahiwal</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">BISE Bahawalpur</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">BISE DG Khan</span>
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">BISE Sargodha</span>
              <span className="px-3 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 border border-emerald-500/40">Federal Board (FBISE) Islamabad</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            FREQUENTLY ASKED QUESTIONS (SEO FAQ ACCORDION)
            ========================================================================= */}
        <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions &amp; Answers</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Common questions about PaperWala, syllabus coverage, and printing.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does PaperWala match official Punjab Board (BISE) exam formats?",
                a: "PaperWala strictly adheres to the official pairing schemes and weightage distributions set by Punjab Boards (Lahore, Rawalpindi, Faisalabad, Gujranwala, Multan, etc.) and FBISE. Questions include 1-mark MCQs, 2-mark Short Questions, and 4/5-mark Long/Detailed Questions with exact marks tags.",
              },
              {
                q: "Does PaperWala support the new 2026-27 Single National Curriculum (SNC)?",
                a: "Yes! PaperWala contains the latest Class 10 (New) 2026-27 syllabus questions, including Computer Science Unit 1 (Operating Systems), Unit 2 (System Recovery and Maintenance), Unit 8 (Digital Entrepreneurship), and Mathematics Quadratic Equations.",
              },
              {
                q: "Can I print exam papers in Urdu, English, and Bilingual format?",
                a: "Yes. PaperWala offers a one-click toggle between English-only, Urdu-only (rendered in authentic Google Font Noto Nastaliq Urdu with native RTL direction), and side-by-side or stacked Bilingual format.",
              },
              {
                q: "Does PaperWala automatically generate Answer Keys and OMR Bubble Sheets?",
                a: "Yes. Every generated exam paper comes with an automatically matched Answer Key grid for teachers and a standard 4-option OMR bubble sheet for student roll numbers and MCQ answers.",
              },
              {
                q: "Can I customize the school name, header banner, and exam instructions?",
                a: "Absolutely. In the Paper Preview & Print editor, you can change your institution name, exam title (e.g., Send-Up Exam, First Term), date, time duration, total marks, and paper instructions.",
              },
              {
                q: "Can schools or academies upload their own question bank via CSV?",
                a: "Yes. Authorized administrators can use PaperWala's Admin Bulk Import tool to upload hundreds of questions via CSV with real-time validation and error reporting.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-emerald-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            BOTTOM HIGH-CONVERSION CTA
            ========================================================================= */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ready to Generate Your Next Exam Paper?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Join hundreds of Pakistani teachers and academies saving 10+ hours every examination cycle. Free, instant, and board-standard.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/select-questions?chapter=2"
                id="footer-cta-generate"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/60 active:scale-[0.98] transition-all ring-1 ring-emerald-400/40"
              >
                <Zap className="w-4 h-4 fill-white text-white" />
                <span>Create Paper Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/paper-editor"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
              >
                <span>View Paper Preview &amp; Print</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          FOOTER WITH RICH LINKS & COPYRIGHT
          ========================================================================= */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base">PaperWala (پیپر والا)</div>
                <div className="text-[10px] text-emerald-400">Pakistani School Exam Paper Generator</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-slate-400 font-medium">
              <Link href="/select-questions?chapter=2" className="hover:text-emerald-400 transition-colors">
                Question Selector
              </Link>
              <Link href="/paper-editor" className="hover:text-emerald-400 transition-colors">
                Paper Editor
              </Link>
              <Link href="/admin/login" className="hover:text-emerald-400 transition-colors">
                Admin Portal
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} PaperWala PK. All rights reserved. Designed for Punjab Boards, Federal Board (FBISE), and Pakistani Schools.
            </div>
            <div>
              Built with Next.js, Supabase, Tailwind, KaTeX &amp; Google Noto Nastaliq Urdu.
            </div>
          </div>
        </div>
      </footer>

      {/* Client Authentication Modal */}
      <ClientAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setClientUser(user);
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}
