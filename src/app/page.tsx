// src/app/page.tsx
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
  HelpCircle,
  Award,
  Zap,
  Crown,
  LogIn,
  LogOut,
  User,
  Phone,
  Search,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { ClientUser, isPaidSubscriber } from "@/lib/types";

export default function Home() {
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive preview state for the Hero Mock Paper
  const [heroLang, setHeroLang] = useState<"Bilingual" | "English" | "Urdu">("Bilingual");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Comprehensive SEO Structured Data (SoftwareApplication + HowTo + FAQPage)
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "PaperWala – Online Paper Maker & Board Pattern Exam Generator",
        "alternateName": ["PaperWala", "Paper Wala", "پیپر والا", "Online Paper Maker Pakistan"],
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "All (Web Browser, Windows, macOS, Android, iOS)",
        "description":
          "Pakistan's #1 online paper maker and board pattern exam generator for schools, colleges, and academies. Create 9th, 10th, 1st Year & 2nd Year test papers with Urdu Nastaliq, KaTeX Math, 1-page A4 PDF print, and editable Word (.docx) download.",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "30",
          "highPrice": "2000",
          "priceCurrency": "PKR",
          "offerCount": "3",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1480",
          "bestRating": "5",
          "worstRating": "1",
        },
      },
      {
        "@type": "HowTo",
        "name": "How to Make a Board Pattern Exam Paper Online in 60 Seconds",
        "description":
          "Step-by-step guide for teachers and academies to create, customize, and download official BISE & FBISE board-pattern question papers online.",
        "totalTime": "PT1M",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Select Chapter Questions or Use AI Quick Paper Maker",
            "text": "Choose your class (9th, 10th, 1st Year, 2nd Year), board (Punjab BISE or Federal FBISE), and chapter from the Question Bank, or paste/scan any topic in the AI Quick Paper Maker.",
            "url": "https://paperwala.world/select-questions",
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Customize School Header, Crest & Board Pattern",
            "text": "Enter your school or academy name, upload your crest/logo, select Bilingual (English + Urdu Nastaliq), and pick Paper Code A/B/C/D.",
            "url": "https://paperwala.world/paper-editor",
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Download Editable Word (.docx) or Print 1-Page A4 PDF",
            "text": "Export a formatted Microsoft Word (.docx) document or print an exact 1-page A4 PDF complete with OMR bubble sheets and teacher answer keys.",
            "url": "https://paperwala.world/quick-paper",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which is the best online paper maker with official board pattern in Pakistan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PaperWala (paperwala.world) is Pakistan's #1 online paper maker and board-pattern test generator for 9th, 10th, 1st Year (11th), and 2nd Year (12th) across all 9 Punjab Boards (BISE Lahore, Gujranwala, Rawalpindi, Faisalabad, Multan, Sargodha, Bahawalpur, DG Khan, Sahiwal) and Federal Board (FBISE Islamabad).",
            },
          },
          {
            "@type": "Question",
            "name": "Do I need InPage or special Urdu software installed on my computer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No! PaperWala runs 100% online in your web browser. Authentic Noto Nastaliq Urdu and KaTeX mathematical equations render natively without InPage or extra font installations.",
            },
          },
          {
            "@type": "Question",
            "name": "Can I download the exam paper in editable Microsoft Word (.docx) and 1-page PDF?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Both the AI Quick Paper Studio and Live Paper Editor let you download a fully editable Microsoft Word (.docx) file with aligned Urdu/English columns and 4-column MCQ grids, or print a 1-page auto-fit A4 PDF.",
            },
          },
          {
            "@type": "Question",
            "name": "Does PaperWala match official Punjab Board (BISE) and FBISE exam formats?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. PaperWala strictly follows official BISE and FBISE board pairing schemes, including 1-mark MCQs with 4-column option tables, 2-mark Short Questions (attempt any 5 of 8), and Long Questions with exact marks tags.",
            },
          },
          {
            "@type": "Question",
            "name": "Does PaperWala automatically generate Answer Keys and OMR Bubble Sheets?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Every generated paper can include a 4-circle OMR bubble sheet for students and an automated grading answer key across 4 anti-cheating shuffled Paper Codes (A, B, C, D).",
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
      setMobileMenuOpen(false);
    } catch (e) {
      console.error(e);
    }
  }

  const openAuth = () => {
    setMobileMenuOpen(false);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* =========================================================================
          TOP STICKY NAVBAR - iOS Liquid Glass 3D Floating Bar
          ========================================================================= */}
      <header className="sticky top-3 z-50 px-3 sm:px-6 lg:px-8 pointer-events-none">
        <div className="pointer-events-auto max-w-7xl mx-auto rounded-[22px] bg-gradient-to-b from-white/65 via-white/40 to-white/55 backdrop-blur-3xl border border-white/90 ring-1 ring-slate-900/[0.04] shadow-[0_22px_55px_-12px_rgba(15,23,42,0.18),0_6px_20px_-4px_rgba(16,185,129,0.12),inset_0_2px_2px_0_rgba(255,255,255,1),inset_0_-2px_6px_0_rgba(255,255,255,0.7)] transition-all duration-200">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
            {/* Zone 1: 3D Liquid Glass Brand Emblem & Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-3 group whitespace-nowrap shrink-0"
              id="nav-brand-logo"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_4px_0_0_#065f46,0_8px_16px_-2px_rgba(16,185,129,0.45),inset_0_2px_2px_rgba(255,255,255,0.7)] group-hover:-translate-y-0.5 group-active:translate-y-0.5 transition-all duration-150">
                <BookOpen className="w-4 h-4 drop-shadow-xs" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.95)]">
                  PaperWala
                </span>
                <span className="text-slate-400 text-xs" aria-hidden="true">·</span>
                <span className="font-urdu text-emerald-700 text-base font-bold drop-shadow-[0_1px_0_rgba(255,255,255,0.95)]">
                  پیپر والا
                </span>
              </div>
            </Link>

            {/* Zone 2: 3D Recessed Liquid Glass Navigation Track (Desktop) */}
            <nav
              className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/[0.04] backdrop-blur-xl border border-white/80 shadow-[inset_0_2px_5px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.95)] text-xs font-semibold text-slate-700"
              aria-label="Main Navigation"
            >
              <a
                href="#how-it-works"
                className="px-3.5 py-1.5 rounded-xl hover:bg-gradient-to-b hover:from-white/95 hover:to-white/75 hover:text-slate-950 hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.12),0_2px_0_0_rgba(203,213,225,0.85),inset_0_1px_1px_#ffffff] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 whitespace-nowrap shrink-0"
              >
                How It Works
              </a>
              <a
                href="#active-chapters"
                className="px-3.5 py-1.5 rounded-xl hover:bg-gradient-to-b hover:from-white/95 hover:to-white/75 hover:text-slate-950 hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.12),0_2px_0_0_rgba(203,213,225,0.85),inset_0_1px_1px_#ffffff] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 whitespace-nowrap shrink-0"
              >
                Question Bank
              </a>
              <a
                href="#sample-paper"
                className="px-3.5 py-1.5 rounded-xl hover:bg-gradient-to-b hover:from-white/95 hover:to-white/75 hover:text-slate-950 hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.12),0_2px_0_0_rgba(203,213,225,0.85),inset_0_1px_1px_#ffffff] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 whitespace-nowrap shrink-0"
              >
                Sample Paper
              </a>
              <Link
                href="/pricing"
                className="px-3.5 py-1.5 rounded-xl text-emerald-800 bg-gradient-to-b from-white/85 to-white/55 hover:from-white hover:to-white/80 shadow-[0_3px_8px_-1px_rgba(16,185,129,0.16),0_2px_0_0_#a7f3d0,inset_0_1px_1px_#ffffff] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 whitespace-nowrap shrink-0"
              >
                Pricing
              </Link>
              <a
                href="#faq"
                className="px-3.5 py-1.5 rounded-xl hover:bg-gradient-to-b hover:from-white/95 hover:to-white/75 hover:text-slate-950 hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.12),0_2px_0_0_rgba(203,213,225,0.85),inset_0_1px_1px_#ffffff] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 whitespace-nowrap shrink-0"
              >
                FAQs
              </a>
            </nav>

            {/* Zone 3: iOS Liquid Glass 3D Account Controls & Primary Action */}
            <div className="flex items-center gap-2.5 shrink-0">
              {clientUser ? (
                <>
                  <Link
                    href="/quick-paper"
                    id="nav-quick-paper-btn"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-white/80 via-white/45 to-white/65 hover:from-white/95 hover:to-white/80 backdrop-blur-2xl border border-white/90 text-slate-800 text-xs font-bold shadow-[0_4px_0_0_rgba(203,213,225,0.8),0_8px_20px_-4px_rgba(15,23,42,0.12),inset_0_2px_2px_0_#ffffff,inset_0_-2px_4px_0_rgba(16,185,129,0.1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0"
                    title="Create or Paste Instant Paper"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick Paper</span>
                  </Link>

                  {clientUser.email.toLowerCase() === "ali.khaliq50@gmail.com" && (
                    <Link
                      href="/admin/users"
                      id="nav-admin-panel-btn"
                      className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-b from-indigo-50/85 via-white/50 to-indigo-100/65 hover:from-indigo-50 hover:to-indigo-100/90 backdrop-blur-2xl border border-white/90 text-indigo-800 text-xs font-bold shadow-[0_4px_0_0_#c7d2fe,0_8px_20px_-4px_rgba(79,70,229,0.15),inset_0_2px_2px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0"
                      title="Open Admin Panel"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-white/80 via-white/45 to-white/65 backdrop-blur-2xl border border-white/90 text-xs font-medium shadow-[0_4px_0_0_rgba(203,213,225,0.8),0_8px_20px_-4px_rgba(15,23,42,0.12),inset_0_2px_2px_0_#ffffff] whitespace-nowrap shrink-0">
                    <Link
                      href="/profile"
                      id="nav-my-profile-link"
                      title="My Profile & Paper History"
                      className="inline-flex items-center gap-1.5 text-slate-800 hover:text-emerald-700 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold">{clientUser.fullName.split(" ")[0]}</span>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span className="text-[11px] text-emerald-700 font-bold">
                        {clientUser.subscription.planName}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-0.5 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                      title="Log Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2.5">
                  <button
                    onClick={() => openAuth()}
                    id="nav-client-login-btn"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-white/85 via-white/45 to-white/70 hover:from-white hover:via-white/70 hover:to-emerald-50/75 backdrop-blur-2xl border border-white/95 ring-1 ring-slate-900/[0.04] text-slate-800 hover:text-emerald-900 text-xs font-bold shadow-[0_4px_0_0_rgba(203,213,225,0.85),0_10px_22px_-4px_rgba(15,23,42,0.14),inset_0_2px_2px_0_rgba(255,255,255,1),inset_0_-2px_6px_0_rgba(16,185,129,0.12)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgba(167,243,208,0.9),0_14px_26px_-4px_rgba(16,185,129,0.22),inset_0_2px_3px_0_#ffffff] active:translate-y-0.5 active:shadow-[0_2px_0_0_rgba(203,213,225,0.9)] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sign In</span>
                  </button>
                  <Link
                    href="/register"
                    id="nav-client-signup-btn"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-50/85 via-white/45 to-teal-50/75 hover:from-white hover:via-emerald-50/65 hover:to-teal-100/80 backdrop-blur-2xl border border-white/95 ring-1 ring-emerald-500/15 text-emerald-900 hover:text-emerald-950 text-xs font-extrabold shadow-[0_4px_0_0_rgba(167,243,208,0.95),0_10px_22px_-4px_rgba(16,185,129,0.18),inset_0_2px_2px_0_rgba(255,255,255,1),inset_0_-2px_6px_0_rgba(16,185,129,0.18)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgba(110,231,183,1),0_14px_28px_-4px_rgba(16,185,129,0.28),inset_0_2px_3px_0_#ffffff] active:translate-y-0.5 active:shadow-[0_2px_0_0_rgba(167,243,208,1)] transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Register Account</span>
                  </Link>
                </div>
              )}

              {clientUser ? (
                isPaidSubscriber(clientUser) ? (
                  <Link
                    href="/select-questions?chapter=3"
                    id="nav-generate-paper-btn"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-bold text-xs shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.45),inset_0_2px_2px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#065f46,0_14px_24px_-4px_rgba(16,185,129,0.55),inset_0_2px_2px_rgba(255,255,255,0.75)] active:translate-y-0.5 active:shadow-[0_2px_0_0_#065f46] transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    <span>Generate Paper</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href="/pricing"
                    id="nav-generate-paper-btn"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 text-white font-bold text-xs shadow-[0_4px_0_0_#9a3412,0_10px_20px_-4px_rgba(245,158,11,0.45),inset_0_2px_2px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    <span>Upgrade Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )
              ) : (
                <Link
                  href="/pricing"
                  id="nav-generate-paper-btn"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-bold text-xs shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.45),inset_0_2px_2px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#065f46,0_14px_24px_-4px_rgba(16,185,129,0.55),inset_0_2px_2px_rgba(255,255,255,0.75)] active:translate-y-0.5 active:shadow-[0_2px_0_0_#065f46] transition-all duration-150 whitespace-nowrap shrink-0"
                >
                  <span>Plans &amp; Pricing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-gradient-to-b from-white/85 to-white/60 border border-white text-slate-700 hover:text-slate-950 shadow-[0_3px_0_0_#cbd5e1,inset_0_2px_2px_#ffffff] active:translate-y-0.5 transition-all"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile 3D Liquid Glass Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/70 bg-gradient-to-b from-white/75 to-white/60 backdrop-blur-3xl rounded-b-[22px] px-4 py-4 space-y-3">
              <nav className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] hover:text-emerald-700 transition-all"
                >
                  How It Works
                </a>
                <a
                  href="#active-chapters"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] hover:text-emerald-700 transition-all"
                >
                  Question Bank
                </a>
                <a
                  href="#sample-paper"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] hover:text-emerald-700 transition-all"
                >
                  Sample Paper
                </a>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 shadow-[0_2px_0_0_#a7f3d0,inset_0_1px_1px_#ffffff] transition-all"
                >
                  Pricing (Monthly)
                </Link>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] hover:text-emerald-700 transition-all"
                >
                  FAQs
                </a>
                <Link
                  href="/quick-paper"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white text-emerald-700 shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] transition-all"
                >
                  Quick Paper
                </Link>
              </nav>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                {clientUser ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-800"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{clientUser.fullName}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-emerald-700">{clientUser.subscription.planName}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-[0_2px_0_0_#fecdd3]"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 w-full">
                    <button
                      onClick={() => openAuth()}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-white/90 via-white/55 to-white/75 backdrop-blur-2xl border border-white text-slate-800 text-xs font-bold shadow-[0_4px_0_0_rgba(203,213,225,0.85),inset_0_2px_2px_#ffffff] text-center"
                    >
                      Sign In
                    </button>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-emerald-50/90 via-white/55 to-teal-50/85 backdrop-blur-2xl border border-white text-emerald-900 text-xs font-extrabold shadow-[0_4px_0_0_rgba(167,243,208,0.95),inset_0_2px_2px_#ffffff] text-center"
                    >
                      Register Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION: Clean, Welcoming, User-Friendly with 1-Click Generator
          ========================================================================= */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-white via-slate-50 to-emerald-50/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              {/* Badge Announcement */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Punjab Boards &amp; Federal Board (FBISE) New 2026-27 Syllabus Ready</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.18]">
                #1 Online Paper Maker &amp;{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800">
                  Board Pattern Exam Generator
                </span>
              </h1>

              {/* Urdu Subtitle */}
              <div className="font-urdu text-xl sm:text-2xl text-emerald-900 font-bold leading-relaxed max-w-2xl mx-auto" dir="rtl">
                سکول اور اکیڈمی کے بورڈ پیٹرن امتحانی پرچے آن لائن منٹوں میں تیار کریں — بغیر کسی ان پیج (InPage) یا فارمیٹنگ کی پریشانی کے!
              </div>

              {/* Simple description */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
                Create official <strong>Punjab Board (BISE) &amp; Federal Board (FBISE)</strong> pattern test papers online for <strong>9th, 10th, 1st Year &amp; 2nd Year</strong>. Type, select from our verified question bank, or use our <strong>AI Quick Paper Maker</strong> to export <strong>1-Page A4 PDF</strong> &amp; editable <strong>Microsoft Word (.docx)</strong> papers in <strong>Urdu Nastaliq</strong> and <strong>English</strong>.
              </p>

              {/* =================================================================
                  PORTAL SHOWCASE & SUBSCRIPTION ACCESS
                  ================================================================= */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/90 max-w-3xl mx-auto text-left mt-8 space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      🎓
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900">
                        Official BISE Examination Generation System
                      </h2>
                      <span className="text-[11px] text-slate-500 font-medium">
                        For Registered Schools, Academies &amp; Tuition Centers
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
                    Paid Subscription Required
                  </span>
                </div>

                {/* Core Feature Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span> 785+ Verified Qs
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Punjab Board 2026-27 updated syllabus with authentic Urdu Nastaliq &amp; KaTeX Math formulas.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span> 4 Shuffled Codes
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Version A, B, C, D anti-cheating shuffled papers with automatic grading keys &amp; bubble sheets.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span> Academy Crest
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Your customized academy/school name, exam heading, time duration, and watermark.
                    </p>
                  </div>
                </div>

                {/* Conditional CTAs based on login & subscription status */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {clientUser
                        ? isPaidSubscriber(clientUser)
                          ? `Active Plan: ${clientUser.subscription.planName}`
                          : `Current: ${clientUser.subscription.planName} (Paid monthly subscription required to generate)`
                        : "Monthly Subscription: Rs. 2,000/month &bull; Unlimited Papers &bull; 30 Days Access"}
                    </span>
                  </div>

                  {clientUser ? (
                    isPaidSubscriber(clientUser) ? (
                      <Link
                        href="/select-questions?chapter=3"
                        id="hero-generate-paper-btn"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-700/25 transition-all"
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Open Paper Generator</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <Link
                        href="/pricing"
                        id="hero-upgrade-plan-btn"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-700/25 transition-all"
                      >
                        <Crown className="w-4 h-4 fill-white" />
                        <span>Subscribe to Generate (Rs. 2,000/mo)</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )
                  ) : (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Link
                        href="/pricing"
                        id="hero-pricing-btn"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-700/25 transition-all"
                      >
                        <Crown className="w-3.5 h-3.5 fill-white" />
                        <span>View Monthly Plan (Rs. 2,000)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => openAuth()}
                        id="hero-login-btn"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Ribbon */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-center">
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-emerald-700">785+</div>
                  <div className="text-[11px] text-slate-500 font-medium">Verified Questions</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-teal-700">9 Boards</div>
                  <div className="text-[11px] text-slate-500 font-medium">Punjab &amp; FBISE</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-indigo-700">4 Versions</div>
                  <div className="text-[11px] text-slate-500 font-medium">A, B, C, D Shuffled</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-emerald-700">Rs. 2,000/mo</div>
                  <div className="text-[11px] text-slate-500 font-medium">Unlimited Monthly Access</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
             SIMPLE 3-STEP GUIDE: How It Works
            ========================================================================= */}
        <section id="how-it-works" className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Simple &amp; Fast
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                How to Generate an Exam Paper in 3 Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Designed for busy school teachers, principals, and academy owners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3 relative hover:border-emerald-300 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-base shadow-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">Choose Questions</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select your chapter and tick the MCQs, Short Questions, and Long Questions you want, or click <strong>1-Click Auto Pattern</strong> to pick balanced board questions automatically.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3 relative hover:border-emerald-300 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-black flex items-center justify-center text-base shadow-sm">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900">Add School Name &amp; Crest</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Customize the paper header with your Academy or School name, term exam title, time allowed (e.g. 2 hours), and total marks.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3 relative hover:border-emerald-300 transition-all">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-base shadow-sm">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900">Print or Download PDF</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instantly print clean photocopy-ready papers on A4 or Legal, with automatic teacher answer keys and student bubble sheets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            QUESTION BANK CHAPTER LAUNCHERS
            ========================================================================= */}
        <section id="active-chapters" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Active Question Bank
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Class 10th Computer Science (New 2026-27)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Explore board-aligned units. Active paid subscribers can generate complete papers directly from any unit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Unit 3 (New) */}
            <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500 shadow-md space-y-4 hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl tracking-wider">
                New Unit
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-700">Unit 3</span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Introduction to Python Programming
                </h3>
                <span className="font-urdu text-slate-500 text-xs block">
                  پائتھن پروگرامنگ کا تعارف
                </span>
                <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <strong>147 Questions</strong> &bull; 70 MCQs, 69 Short, 8 Long
                </div>
              </div>
              <Link
                href={clientUser && isPaidSubscriber(clientUser) ? "/select-questions?chapter=3" : "/pricing"}
                className={`w-full py-2.5 rounded-xl text-white text-xs font-bold text-center block transition-colors ${
                  clientUser && isPaidSubscriber(clientUser)
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {clientUser && isPaidSubscriber(clientUser) ? "Generate Unit Paper →" : "Subscribe to Generate →"}
              </Link>
            </div>

            {/* Unit 2 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500">Unit 2</span>
                <h3 className="text-base font-extrabold text-slate-900">
                  System Recovery &amp; Maintenance
                </h3>
                <span className="font-urdu text-slate-500 text-xs block">
                  سسٹم ریکوری اور مینٹیننس
                </span>
                <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <strong>210 Questions</strong> &bull; 103 MCQs, 102 Short, 5 Long
                </div>
              </div>
              <Link
                href={clientUser && isPaidSubscriber(clientUser) ? "/select-questions?chapter=2" : "/pricing"}
                className={`w-full py-2.5 rounded-xl text-white text-xs font-bold text-center block transition-colors ${
                  clientUser && isPaidSubscriber(clientUser)
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {clientUser && isPaidSubscriber(clientUser) ? "Generate Unit Paper →" : "Subscribe to Generate →"}
              </Link>
            </div>

            {/* Unit 1 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500">Unit 1</span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Operating Systems: Structure &amp; Services
                </h3>
                <span className="font-urdu text-slate-500 text-xs block">
                  آپریٹنگ سسٹمز: ساخت اور خدمات
                </span>
                <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <strong>223 Questions</strong> &bull; 108 MCQs, 110 Short, 5 Long
                </div>
              </div>
              <Link
                href={clientUser && isPaidSubscriber(clientUser) ? "/select-questions?chapter=1" : "/pricing"}
                className={`w-full py-2.5 rounded-xl text-white text-xs font-bold text-center block transition-colors ${
                  clientUser && isPaidSubscriber(clientUser)
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {clientUser && isPaidSubscriber(clientUser) ? "Generate Unit Paper →" : "Subscribe to Generate →"}
              </Link>
            </div>

            {/* Unit 8 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500">Unit 8</span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Digital Entrepreneurship
                </h3>
                <span className="font-urdu text-slate-500 text-xs block">
                  ڈیجیٹل انٹرپرینیورشپ
                </span>
                <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <strong>180 Questions</strong> &bull; 80 MCQs, 85 Short, 15 Long
                </div>
              </div>
              <Link
                href={clientUser && isPaidSubscriber(clientUser) ? "/select-questions?chapter=8" : "/pricing"}
                className={`w-full py-2.5 rounded-xl text-white text-xs font-bold text-center block transition-colors ${
                  clientUser && isPaidSubscriber(clientUser)
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {clientUser && isPaidSubscriber(clientUser) ? "Generate Unit Paper →" : "Subscribe to Generate →"}
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SAMPLE PAPER SHOWCASE (Light & Realistic)
            ========================================================================= */}
        <section id="sample-paper" className="py-16 bg-slate-100/70 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Authentic Board Paper Layout
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Every generated paper matches official Pakistani examination standards. Toggle language mode to see how authentic Urdu Nastaliq and English typeset side-by-side.
              </p>

              {/* Language Switcher Buttons */}
              <div className="flex items-center justify-center gap-2 mt-4 bg-white p-1 rounded-2xl border border-slate-200 inline-flex shadow-xs">
                <button
                  onClick={() => setHeroLang("Bilingual")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    heroLang === "Bilingual"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Bilingual (Both)
                </button>
                <button
                  onClick={() => setHeroLang("English")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    heroLang === "English"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  English Only
                </button>
                <button
                  onClick={() => setHeroLang("Urdu")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    heroLang === "Urdu"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Urdu Nastaliq
                </button>
              </div>
            </div>

            {/* Simulated Paper Sheet */}
            <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-3xl shadow-xl p-6 sm:p-10 border border-slate-200 font-sans relative overflow-hidden">
              {/* Paper Code Watermark */}
              <div className="absolute right-6 top-6 px-3 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] uppercase font-bold border border-slate-200">
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
                  <span>Unit 3: Python Programming</span>
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
                <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-extrabold">
                  <span>SECTION-A (Multiple Choice Questions)</span>
                  <span>Marks: 10</span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Sample Question 1 */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold flex items-start justify-between gap-4">
                      {heroLang !== "Urdu" && (
                        <span>Q.1 Which of the following steps is NOT part of the programming process?</span>
                      )}
                      {heroLang !== "English" && (
                        <span className="font-urdu text-sm text-right leading-relaxed flex-1 text-slate-900" dir="rtl">
                          ۱۔ درج ذیل میں سے کون سا مرحلہ بنیادی پروگرامنگ کے عمل کا حصہ نہیں ہے؟
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-200 text-slate-700">
                      <div className="font-medium">A) Write Code</div>
                      <div className="font-medium">B) Compile</div>
                      <div className="font-medium">C) Execute</div>
                      <div className="font-bold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">
                        D) Ignore Errors (✓)
                      </div>
                    </div>
                  </div>

                  {/* Sample Question 2 (with Math formula) */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold flex items-start justify-between gap-4">
                      {heroLang !== "Urdu" && (
                        <div>
                          <span>Q.2 What will be the output of: </span>
                          <span className="text-blue-700 font-mono ml-1">print($10 // 3$)</span>?
                        </div>
                      )}
                      {heroLang !== "English" && (
                        <div className="font-urdu text-sm text-right leading-relaxed flex-1 text-slate-900" dir="rtl">
                          ۲۔ کمانڈ print($10 // 3$) کا آؤٹ پٹ کیا ہوگا؟
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-slate-200 text-slate-700">
                      <div className="font-medium">A) 3.333</div>
                      <div className="font-bold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">
                        B) 3 (✓)
                      </div>
                      <div className="font-medium">C) 1</div>
                      <div className="font-medium">D) 4</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ready for Photocopier &bull; Clean Single or Double Column Printing</span>
                </div>
                <Link
                  href={clientUser && isPaidSubscriber(clientUser) ? "/select-questions?chapter=3" : "/pricing"}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                >
                  <span>{clientUser && isPaidSubscriber(clientUser) ? "Select Questions for this Unit" : "Subscribe to Generate Papers"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            FAQ ACCORDION
            ========================================================================= */}
        <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              FAQs
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear answers to common questions asked by Pakistani teachers.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Which is the best online paper maker with official board pattern in Pakistan?",
                a: "PaperWala (paperwala.world) is Pakistan's #1 online paper maker and board-pattern exam generator for 9th, 10th, 1st Year (11th), and 2nd Year (12th). It supports all 9 Punjab Boards (BISE Lahore, Gujranwala, Rawalpindi, Faisalabad, Multan, Sargodha, Bahawalpur, DG Khan, Sahiwal) and Federal Board (FBISE Islamabad).",
              },
              {
                q: "Do I need InPage or special Urdu software installed on my computer?",
                a: "No! PaperWala runs completely in your web browser. You do not need InPage, Arabic fonts, or any extra software. Authentic Noto Nastaliq Urdu and KaTeX Math formulas render natively with one click.",
              },
              {
                q: "Can I download the exam paper in editable Microsoft Word (.docx) and 1-page PDF?",
                a: "Yes! Both the AI Quick Paper Maker (/quick-paper) and Live Paper Editor (/paper-editor) let you download an editable Microsoft Word (.docx) file with properly aligned Bilingual Urdu/English columns and 4-column MCQ grids, or print a 1-page auto-fit A4 PDF.",
              },
              {
                q: "Does PaperWala match official Punjab Board (BISE) and FBISE exam formats?",
                a: "Yes. PaperWala strictly adheres to official pairing schemes and weightage distributions set by Punjab Boards and FBISE. Questions include 1-mark MCQs, 2-mark Short Questions, and 4/5-mark Long Questions with exact marks tags.",
              },
              {
                q: "Can I add my School / Academy name and logo on top of the paper?",
                a: "Yes, 100%! In the Paper Editor & Print studio, you can customize your institution name, upload your school crest/logo, set the exam title (Send-Up Exam, Class Test, Monthly Assessment), date, time duration, and custom student instructions.",
              },
              {
                q: "Does PaperWala automatically generate Answer Keys and Bubble Sheets?",
                a: "Yes. Every generated paper automatically includes teacher grading keys and standard 4-circle OMR bubble sheets for students across 4 shuffled anti-cheating Paper Codes (A, B, C, D).",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SEO DIRECTORY: SUPPORTED BOARDS, CLASSES & ONLINE PAPER MAKING TOOLS
            ========================================================================= */}
        <section className="py-14 bg-white border-y border-slate-200/80" aria-labelledby="seo-directory-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-3xl space-y-2">
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Complete Pakistan Board Coverage
              </span>
              <h2 id="seo-directory-heading" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Online Paper Maker for All Punjab Boards (BISE), Federal Board (FBISE) &amp; Classes
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                PaperWala is built for Pakistani schools, colleges, and coaching academies searching for a fast, accurate <strong>online paper maker with board pattern</strong>. Generate bilingual English &amp; Urdu Nastaliq question papers for daily class tests, weekly quizzes, monthly assessments, send-up exams, and pre-board papers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Supported Educational Boards in Pakistan
                </h3>
                <ul className="space-y-1.5 text-slate-600">
                  <li>&bull; <strong>BISE Lahore</strong> Board Pattern Paper Maker</li>
                  <li>&bull; <strong>BISE Gujranwala &amp; Rawalpindi</strong> Online Test Generator</li>
                  <li>&bull; <strong>BISE Faisalabad &amp; Multan</strong> Exam Paper Maker</li>
                  <li>&bull; <strong>BISE Sargodha, Bahawalpur, DG Khan &amp; Sahiwal</strong></li>
                  <li>&bull; <strong>FBISE Islamabad (Federal Board)</strong> SLO &amp; Board Pattern</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Classes &amp; Subjects Question Bank
                </h3>
                <ul className="space-y-1.5 text-slate-600">
                  <li>&bull; <strong>9th Class (Matric Part-I)</strong> Online Paper Maker</li>
                  <li>&bull; <strong>10th Class (Matric Part-II)</strong> Board Pattern Generator</li>
                  <li>&bull; <strong>1st Year (11th / FSc &amp; ICS Part-I)</strong> Test Maker</li>
                  <li>&bull; <strong>2nd Year (12th / FSc &amp; ICS Part-II)</strong> Exam Creator</li>
                  <li>&bull; Computer Science, Mathematics, Physics, Chemistry, Biology, English, Urdu, Islamiat &amp; Pak Studies</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Direct Online Paper Making Tools
                </h3>
                <ul className="space-y-2 text-slate-600">
                  <li>
                    <Link href="/quick-paper" className="font-bold text-emerald-700 hover:underline">
                      AI Quick Paper Maker &amp; OCR Scanner →
                    </Link>{" "}
                    Paste raw text, upload book photos, or enter any topic to generate a formatted bilingual board paper.
                  </li>
                  <li>
                    <Link href="/select-questions" className="font-bold text-emerald-700 hover:underline">
                      Chapter-Wise Question Bank Selector →
                    </Link>{" "}
                    Pick verified MCQs, Short Questions, and Long Questions with 1-click auto board pattern.
                  </li>
                  <li>
                    <Link href="/paper-editor" className="font-bold text-emerald-700 hover:underline">
                      Live Paper Studio (.docx &amp; 1-Page PDF) →
                    </Link>{" "}
                    Customize school header, 2-per-page landscape duplex mode, and Word download.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BOTTOM CALL TO ACTION
            ========================================================================= */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
            <div className="max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Start Generating Exam Papers Today
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100">
                Join thousands of Pakistani schools &amp; academies saving 10+ hours every examination cycle. Unlimited Monthly Subscription is only Rs. 2,000 / month (50% OFF).
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {clientUser && isPaidSubscriber(clientUser) ? (
                <Link
                  href="/select-questions?chapter=3"
                  className="px-8 py-3.5 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-emerald-900" />
                  <span>Open Question Generator</span>
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="px-8 py-3.5 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <Crown className="w-4 h-4 text-emerald-900 fill-emerald-900" />
                  <span>Subscribe to Generate (Rs. 2,000/mo)</span>
                </Link>
              )}
              {!clientUser && (
                <Link
                  href="/register"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-sm border border-emerald-500/40 transition-all inline-flex items-center justify-center"
                >
                  Register Educator Account
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-base">PaperWala (پیپر والا)</div>
                <div className="text-[10px] text-emerald-700">Pakistani School Exam Paper Generator</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-slate-600 font-semibold text-xs">
              <Link href="/quick-paper" className="hover:text-emerald-700 transition-colors">
                AI Quick Paper Maker
              </Link>
              <Link href="/select-questions" className="hover:text-emerald-700 transition-colors">
                Board Question Bank
              </Link>
              <Link href="/paper-editor" className="hover:text-emerald-700 transition-colors">
                Paper Editor &amp; Word Export
              </Link>
              <Link href="/pricing" className="hover:text-emerald-700 transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="hover:text-emerald-700 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-emerald-700 transition-colors">
                Register Account
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} PaperWala PK. All rights reserved. Designed for Punjab Boards, Federal Board (FBISE), and Pakistani Schools.
            </div>
            <div>
              Built for Pakistani Educators with Urdu Nastaliq &amp; KaTeX Support.
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
