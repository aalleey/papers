"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Question, ClientUser, SubscriptionPlanId, isPaidSubscriber } from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";
import { getUrduTranslation } from "@/lib/urdu-translations";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import {
  ArrowLeft,
  Bookmark,
  Printer,
  Settings,
  Sparkles,
  Sliders,
  Type,
  Building2,
  HelpCircle,
  Shuffle,
  Trash2,
  Edit3,
  Check,
  X,
  Eye,
  ChevronDown,
  Crown,
  Lock,
  LogIn,
  LogOut,
} from "lucide-react";

export default function PaperEditorPage() {
  const router = useRouter();

  // Client authentication & subscription state
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subModalTitle, setSubModalTitle] = useState("Unlock Full Examination Features");
  const [subModalSubtitle, setSubModalSubtitle] = useState(
    "Choose a subscription plan to generate board-standard papers with your academy branding and answer keys."
  );
  const [subModalHighlight, setSubModalHighlight] = useState<SubscriptionPlanId | undefined>("standard");
  const [authChecked, setAuthChecked] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Paper header & parameters (matching Paper Preview & Print.html)
  const [institutionName, setInstitutionName] = useState("Your Institution Name");
  const [paperTypeBanner, setPaperTypeBanner] = useState("EXAMINATION 2026-27");
  const [subjectTitle, setSubjectTitle] = useState("Computer کمپوٹر");
  const [classNameText, setClassNameText] = useState("10th");
  const [syllabusText, setSyllabusText] = useState("Unit-2 System Recovery and Advanced Maintenance");
  const [totalMarks, setTotalMarks] = useState<number>(75);
  const [timeDuration, setTimeDuration] = useState("2:30 hrs");
  const [paperDate, setPaperDate] = useState("11-10-2026");
  const [testNoText, setTestNoText] = useState("");

  // Version variant state (Version A, B, C, D)
  const [paperVersion, setPaperVersion] = useState<"A" | "B" | "C" | "D">("A");
  const [paperCodes, setPaperCodes] = useState<Record<string, string>>({
    A: "3041",
    B: "3042",
    C: "3043",
    D: "3044",
  });

  // Ribbon configurations
  const [headerStyle, setHeaderStyle] = useState<"style1" | "style2">("style1");
  const [languageMode, setLanguageMode] = useState<"Bilingual" | "English" | "Urdu">("Bilingual");

  // Font & display sizing
  const [mcqFontSize, setMcqFontSize] = useState<number>(12);
  const [subFontSize, setSubFontSize] = useState<number>(12);
  const [titleFontSize, setTitleFontSize] = useState<number>(30);

  // Content display toggles
  const [showOMRSheet, setShowOMRSheet] = useState(true);
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [showStudentDetails, setShowStudentDetails] = useState(true);
  const [showInstructionNote, setShowInstructionNote] = useState(true);

  // Instruction Note text
  const [instructionText, setInstructionText] = useState(
    "Four possible answer a,b,c and d to each question are given. The choice which you think is correct, fill that circle in front of that questions with Marker or Pen ink, Cutting or filling two or more circles will result in zero mark in that question."
  );

  // Active popover dropdown menu state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Print dropdown mode
  const [printMode, setPrintMode] = useState<"all" | "questions" | "key">("all");

  // 1. Load editor data helper function
  async function loadEditorData() {
    try {
      setLoading(true);
      const res = await fetch("/api/paper/questions?chapter_id=68fc022a-f4b1-53f8-a133-2946135d88db");
      const data = await res.json();
      if (data.questions?.length) {
        setBankQuestions(data.questions);
      }

      // Check sessionStorage
      const stored = sessionStorage.getItem("papermaker_selected_questions");
      const storedLang = sessionStorage.getItem("papermaker_language_mode");
      if (storedLang === "Urdu" || storedLang === "English" || storedLang === "Bilingual") {
        setLanguageMode(storedLang);
      }

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuestions(parsed);
            const firstQ = parsed[0];
            if (firstQ?.chapter_id && data.chapters) {
              const matchCh = data.chapters.find((c: any) => c.id === firstQ.chapter_id);
              if (matchCh) {
                setSyllabusText(`Unit-${matchCh.number} ${matchCh.title}`);
              }
            }
            return;
          }
        } catch {
          // ignore
        }
      }

      // Default set matching Chapter 2
      if (data.questions?.length) {
        const defaultMcqs = data.questions.filter((q: Question) => q.type === "mcq").slice(0, 7);
        const defaultShorts = data.questions.filter((q: Question) => q.type === "short").slice(0, 5);
        const defaultLongs = data.questions.filter((q: Question) => q.type === "long").slice(0, 1);
        setQuestions([...defaultMcqs, ...defaultShorts, ...defaultLongs]);
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  }

  // Initial Load: Check client authentication
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/client/me");
        const data = await res.json();
        if (data.client) {
          setClientUser(data.client);
          if (data.client.academyName && data.client.subscription.canCustomBranding) {
            setInstitutionName(data.client.academyName);
          }
          await loadEditorData();
        } else {
          setClientUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load client user:", err);
        setLoading(false);
      } finally {
        setAuthChecked(true);
      }
    }

    init();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/client/logout", { method: "POST" });
      setClientUser(null);
    } catch (e) {
      console.error("Failed to logout client", e);
    }
  }

  // Split questions
  const mcqs = useMemo(() => questions.filter((q) => q.type === "mcq"), [questions]);
  const shorts = useMemo(() => questions.filter((q) => q.type === "short"), [questions]);
  const longs = useMemo(() => questions.filter((q) => q.type === "long"), [questions]);

  // Version-shuffled MCQs
  const displayedMcqs = useMemo(() => {
    if (paperVersion === "A") return mcqs;
    const offset = paperVersion === "B" ? 2 : paperVersion === "C" ? 4 : 5;
    return [...mcqs.slice(offset % mcqs.length), ...mcqs.slice(0, offset % mcqs.length)];
  }, [mcqs, paperVersion]);

  // Current Paper Code
  const currentPaperCode = paperCodes[paperVersion] || "3041";

  // Print Action
  const handlePrint = (mode: "all" | "questions" | "key" = "all") => {
    // 1. Must be logged in
    if (!clientUser) {
      setSubModalTitle("Client Login & Subscription Required");
      setSubModalSubtitle("Please sign in or select a subscription plan to export and print examination papers.");
      setShowAuthModal(true);
      return;
    }

    // 2. Must be an active paid subscriber
    if (!isPaidSubscriber(clientUser)) {
      setSubModalTitle("Paid Subscription Required to Print");
      setSubModalSubtitle("Only registered educators with an active paid subscription are eligible to generate, export, and print examination papers. Upgrade your plan to proceed.");
      setSubModalHighlight("pay_as_you_go");
      setShowSubModal(true);
      return;
    }

    // 3. Answer Key Export check
    if (mode === "key" && !clientUser.subscription.canExportAnswerKey) {
      setSubModalTitle("Answer Key Export is Locked");
      setSubModalSubtitle("Answer keys are included in Go as you pay (Rs. 30), Standard, and Annual plans. Upgrade now to export answer keys for all tests!");
      setSubModalHighlight("pay_as_you_go");
      setShowSubModal(true);
      return;
    }

    // 3. Pay-as-you-go needs credits
    if (clientUser.subscription.planId === "pay_as_you_go" && clientUser.subscription.paperCredits <= 0) {
      setSubModalTitle("No Paper Credits Left");
      setSubModalSubtitle("You have used all your Go as you pay credits (Rs. 30 per paper). Buy more or switch to Standard / Annual for unlimited papers.");
      setSubModalHighlight("standard");
      setShowSubModal(true);
      return;
    }

    // 4. Save to the client's paper history (non-blocking for printing)
    fetch("/api/papers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: testNoText ? `${testNoText} - ${subjectTitle}` : `${paperTypeBanner} - ${subjectTitle}`,
        institution: institutionName,
        subject: subjectTitle.replace(/[^\x20-\x7E]/g, "").trim() || subjectTitle,
        className: classNameText,
        syllabus: syllabusText,
        mcqCount: mcqs.length,
        shortCount: shorts.length,
        longCount: longs.length,
        totalMarks,
        languageMode,
        version: paperVersion,
        exportMode: mode,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.client) setClientUser(d.client);
      })
      .catch((e) => console.error("Failed to record paper history", e));

    setPrintMode(mode);
    setActiveDropdown(null);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Swap question
  const handleSwapQuestion = (id: string, type: string) => {
    const currentIds = new Set(questions.map((q) => q.id));
    const available = bankQuestions.filter((q) => q.type === type && !currentIds.has(q.id));
    if (available.length > 0) {
      const replacement = available[Math.floor(Math.random() * available.length)];
      setQuestions((prev) => prev.map((q) => (q.id === id ? replacement : q)));
    } else {
      alert("No additional questions of this type available to swap.");
    }
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  if (!authChecked || (loading && clientUser)) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-slate-700">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Formatting Examination Paper...</h2>
        <p className="text-xs text-slate-500 mt-1">Rendering layout from Paper Preview &amp; Print</p>
      </div>
    );
  }

  // LOCKED SCREEN: Shown when user is not logged in
  if (authChecked && !clientUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-teal-500/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-lg w-full bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 blur-lg opacity-60 animate-pulse" />
            <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-xl ring-4 ring-blue-500/30">
              <Lock className="w-9 h-9 text-white stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Authentication Required &bull; Everything Locked</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Examination Paper Editor is Locked
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              Please sign in with your educator account to customize questions, edit institution headers, and print examination papers.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-950/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              id="btn-editor-lock-login"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Unlock Paper Editor</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/pricing"
                className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>View Plans</span>
              </Link>
              <Link
                href="/select-questions"
                className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Question Bank</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-800 text-left">
              <span className="text-[11px] font-bold text-slate-400 block mb-2 text-center">
                ⚡ Instant 1-Click Sandbox Login:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth/client/subscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          planId: "standard",
                          email: "demo.teacher@paperwala.world",
                          fullName: "Professor Usman Khan",
                          academyName: "Apex Science Academy Lahore",
                        }),
                      });
                      const d = await res.json();
                      if (d.client) {
                        setClientUser(d.client);
                        if (d.client.academyName && d.client.subscription.canCustomBranding) {
                          setInstitutionName(d.client.academyName);
                        }
                        await loadEditorData();
                      }
                    } catch (e) {
                      console.error("Demo login failed", e);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-extrabold transition-all text-center"
                >
                  Standard Plan Demo
                </button>

                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth/client/subscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          planId: "pay_as_you_go",
                          email: "payg.teacher@paperwala.world",
                          fullName: "Prof. Tariq Mahmood",
                          academyName: "Punjab Cadet College",
                        }),
                      });
                      const d = await res.json();
                      if (d.client) {
                        setClientUser(d.client);
                        await loadEditorData();
                      }
                    } catch (e) {
                      console.error("Demo login failed", e);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-xs font-bold transition-all text-center"
                >
                  Go as you pay Demo (Rs. 30)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Client Auth Modal */}
        <ClientAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={async (user) => {
            setClientUser(user);
            setShowAuthModal(false);
            if (user.academyName && user.subscription.canCustomBranding) {
              setInstitutionName(user.academyName);
            }
            if (isPaidSubscriber(user)) {
              await loadEditorData();
            }
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // LOCKED PAYWALL SCREEN: Shown when user is logged in on a FREE account
  // (Only registered users with a paid subscription are eligible to generate or print papers)
  // =========================================================================
  if (authChecked && clientUser && !isPaidSubscriber(clientUser)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-rose-500/15 to-indigo-500/20 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-2xl w-full bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Paid Subscription Required to Print Papers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Examination Paper Printing is Locked
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              Logged in as <strong className="text-white">{clientUser.fullName}</strong> ({clientUser.email}) &bull; Current Status: <span className="text-amber-400 font-bold">{clientUser.subscription.planName}</span>. Free accounts cannot generate or export exam papers. Choose a plan below to unlock:
            </p>
          </div>

          {/* Monthly Subscription Card */}
          <div className="max-w-lg mx-auto w-full">
            <div className="bg-slate-800/90 border-2 border-emerald-500 rounded-3xl p-6 flex flex-col justify-between shadow-2xl shadow-emerald-950/60 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                UNLIMITED PAPER PRINTING &amp; EXPORT
              </div>
              <div className="space-y-3 text-center pt-2">
                <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">30 Days Full Access</span>
                <h3 className="font-extrabold text-white text-xl">Monthly Subscription</h3>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-slate-500 line-through text-base font-bold">Rs. 4,000</span>
                  <span className="text-3xl sm:text-4xl font-black text-white">Rs. 2,000</span>
                  <span className="text-xs font-semibold text-slate-400">/ month</span>
                  <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full ml-1">50% OFF</span>
                </div>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Print and export unlimited exam papers, answer keys, bubble sheets, and customize with your academy crest &amp; header.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubModalTitle("Subscribe to Monthly Plan (Rs. 2,000)");
                  setSubModalSubtitle("Enjoy 30 days of unlimited paper printing and exports with your academy branding.");
                  setSubModalHighlight("monthly");
                  setShowSubModal(true);
                }}
                className="mt-6 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>Subscribe Monthly (Rs. 2,000)</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800">
            <Link
              href="/pricing"
              className="text-amber-400 hover:underline font-bold flex items-center gap-1"
            >
              <Crown className="w-4 h-4" />
              <span>View Full Pricing &amp; Comparison</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
              >
                Back to Home
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Modal for Upgrading */}
        <SubscriptionModal
          isOpen={showSubModal}
          onClose={() => setShowSubModal(false)}
          title={subModalTitle}
          subtitle={subModalSubtitle}
          highlightPlan={subModalHighlight}
          onSuccess={async (updatedClient) => {
            setClientUser(updatedClient);
            setShowSubModal(false);
            if (isPaidSubscriber(updatedClient)) {
              await loadEditorData();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => setActiveDropdown(null)}
      className="min-h-screen bg-white text-slate-900 font-sans pb-28 selection:bg-blue-100"
    >
      {/* =========================================================================
          TOP APP BAR (Exact match to Paper Preview & Print.html)
          ========================================================================= */}
      <div
        className="no-print sticky top-0 z-50 flex flex-col bg-white border-b-2 border-slate-200 shadow-sm px-4 sm:px-6 py-2.5 gap-2.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Row: Title, Version, and Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          {/* Left: Brand / Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/select-questions"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Back to Question Selector"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-2xl">🎓</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                PaperWala پیپر والا
              </span>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setSubjectTitle(e.currentTarget.textContent || subjectTitle)}
                className="text-base sm:text-lg font-bold text-slate-900 whitespace-nowrap outline-none hover:bg-slate-50 px-1 rounded cursor-text"
              >
                Preview - {subjectTitle}
              </div>
            </div>
          </div>

          {/* Center: Version Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="paperVersionSelector"
              className="text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap"
            >
              Version:
            </label>
            <select
              id="paperVersionSelector"
              value={paperVersion}
              onChange={(e) => setPaperVersion(e.target.value as "A" | "B" | "C" | "D")}
              className="h-9 font-bold text-blue-700 border-2 border-blue-600 rounded-md px-3 text-xs bg-white cursor-pointer outline-none shadow-xs"
            >
              <option value="A">Version A (Code: {paperCodes.A})</option>
              <option value="B">Version B (Code: {paperCodes.B})</option>
              <option value="C">Version C (Code: {paperCodes.C})</option>
              <option value="D">Version D (Code: {paperCodes.D})</option>
            </select>
          </div>

          {/* Right: Action Buttons & Subscription Pill */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Client Subscription Status */}
            {clientUser ? (
              <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => {
                    setSubModalTitle("Manage Subscription Plan");
                    setSubModalSubtitle(`Current Plan: ${clientUser.subscription.planName}. Choose a plan below to upgrade or renew.`);
                    setSubModalHighlight(clientUser.subscription.planId);
                    setShowSubModal(true);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-black flex items-center gap-1 transition-all ${
                    clientUser.subscription.planId === "annual"
                      ? "bg-blue-600 text-white"
                      : clientUser.subscription.planId === "standard"
                      ? "bg-emerald-600 text-white"
                      : clientUser.subscription.planId === "pay_as_you_go"
                      ? "bg-amber-600 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                  title="Click to view plans or upgrade"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{clientUser.subscription.planName}</span>
                </button>

                {clientUser.subscription.planId === "free" && (
                  <button
                    onClick={() => {
                      setSubModalTitle("Upgrade Your Subscription");
                      setSubModalSubtitle("Unlock custom academy branding, logo, answer keys, and auto board patterns!");
                      setSubModalHighlight("standard");
                      setShowSubModal(true);
                    }}
                    className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black transition-colors"
                  >
                    Upgrade
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Client Login</span>
              </button>
            )}

            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>📂</span>
              <span>Library</span>
            </button>

            <button
              onClick={() => setActiveDropdown(activeDropdown === "settings" ? null : "settings")}
              className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>

            <button
              onClick={() => alert("⭐ Paper design saved to browser favorites!")}
              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span>⭐</span>
              <span>Save Favorite</span>
            </button>

            {/* Print Dropdown */}
            <div className="relative inline-flex">
              <button
                onClick={() => handlePrint("all")}
                className="px-4 py-1.5 rounded-l-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>🖨️</span>
                <span>Print PDF</span>
              </button>
              <button
                onClick={() => setActiveDropdown(activeDropdown === "print" ? null : "print")}
                className="px-2 py-1.5 rounded-r-md bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs border-l border-blue-500 transition-colors"
                title="Print Options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {activeDropdown === "print" && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 text-xs font-semibold z-50">
                  <button
                    onClick={() => handlePrint("all")}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>📄</span> Print Complete Paper
                  </button>
                  <button
                    onClick={() => handlePrint("questions")}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>📝</span> Print Questions Only
                  </button>
                  <button
                    onClick={() => handlePrint("key")}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>🔑</span> Print Answer Key Only
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Ribbon (Exact layout & colors from Paper Preview & Print.html) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs">
          {/* Left Ribbon Group: Style, Language, Marks, Time, Date */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={headerStyle}
              onChange={(e) => setHeaderStyle(e.target.value as "style1" | "style2")}
              className="h-9 px-3 rounded-md border border-slate-300 font-semibold text-slate-800 bg-white shadow-2xs outline-none focus:border-blue-600"
            >
              <option value="style1">Style 1: Punjab Boards</option>
              <option value="style2">Style 2: Federal Board</option>
            </select>

            <select
              value={languageMode}
              onChange={(e) => setLanguageMode(e.target.value as "Bilingual" | "English" | "Urdu")}
              className="h-9 px-3 rounded-md border border-slate-300 font-semibold text-slate-800 bg-white shadow-2xs outline-none focus:border-blue-600"
            >
              <option value="Bilingual">Bilingual (English &amp; Urdu)</option>
              <option value="English">English Only</option>
              <option value="Urdu">Urdu Only</option>
            </select>

            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              placeholder="Marks (75)"
              title="Total Marks"
              className="h-9 w-20 px-2 rounded-md border border-slate-300 font-bold text-center bg-white shadow-2xs outline-none focus:border-blue-600"
            />

            <input
              type="text"
              value={timeDuration}
              onChange={(e) => setTimeDuration(e.target.value)}
              placeholder="Time (2:30)"
              title="Time Duration"
              className="h-9 w-24 px-2 rounded-md border border-slate-300 font-bold text-center bg-white shadow-2xs outline-none focus:border-blue-600"
            />

            <input
              type="text"
              value={paperDate}
              onChange={(e) => setPaperDate(e.target.value)}
              placeholder="Date"
              title="Paper Date"
              className="h-9 w-28 px-2 rounded-md border border-slate-300 font-bold text-center bg-white shadow-2xs outline-none focus:border-blue-600"
            />
          </div>

          {/* Right Ribbon Group: Popovers for Fonts, Content, Profile, Instructions */}
          <div className="flex flex-wrap items-center gap-2 relative">
            {/* 1. Fonts & Sizing Popover */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "fonts" ? null : "fonts");
                }}
                className="h-9 px-3 rounded-md bg-white border border-slate-300 border-l-4 border-l-blue-600 font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex items-center gap-1"
              >
                <span>📐 Fonts &amp; Sizing ▾</span>
              </button>

              {activeDropdown === "fonts" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-300 rounded-xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in"
                >
                  <div className="font-bold text-slate-800 pb-1 border-b">Layout &amp; Font Sizing</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">MCQ Size (px)</label>
                      <input
                        type="number"
                        min="9"
                        max="20"
                        value={mcqFontSize}
                        onChange={(e) => setMcqFontSize(Number(e.target.value))}
                        className="w-full p-1.5 border rounded text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Subjective (px)</label>
                      <input
                        type="number"
                        min="9"
                        max="20"
                        value={subFontSize}
                        onChange={(e) => setSubFontSize(Number(e.target.value))}
                        className="w-full p-1.5 border rounded text-center font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">
                      Title Size ({titleFontSize}px)
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="42"
                      value={titleFontSize}
                      onChange={(e) => setTitleFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Content Options Popover */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "content" ? null : "content");
                }}
                className="h-9 px-3 rounded-md bg-white border border-slate-300 border-l-4 border-l-emerald-600 font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex items-center gap-1"
              >
                <span>⚙️ Content Options ▾</span>
              </button>

              {activeDropdown === "content" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-300 rounded-xl shadow-2xl p-4 text-xs space-y-2.5 z-50 animate-in fade-in"
                >
                  <div className="font-bold text-slate-800 pb-1 border-b">Section Visibility</div>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">OMR Bubble Sheet</span>
                    <input
                      type="checkbox"
                      checked={showOMRSheet}
                      onChange={(e) => setShowOMRSheet(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Answer Key Table</span>
                    <input
                      type="checkbox"
                      checked={showAnswerKey}
                      onChange={(e) => setShowAnswerKey(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Student Name / Roll No</span>
                    <input
                      type="checkbox"
                      checked={showStudentDetails}
                      onChange={(e) => setShowStudentDetails(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Instructions Note Box</span>
                    <input
                      type="checkbox"
                      checked={showInstructionNote}
                      onChange={(e) => setShowInstructionNote(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* 3. Profile Popover */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "profile" ? null : "profile");
                }}
                className="h-9 px-3 rounded-md bg-white border border-slate-300 border-l-4 border-l-amber-600 font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex items-center gap-1"
              >
                <span>🏫 Profile ▾</span>
              </button>

              {activeDropdown === "profile" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-300 rounded-xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in"
                >
                  <div className="font-bold text-slate-800 pb-1 border-b flex items-center justify-between">
                    <span>Institution Header</span>
                    {!clientUser?.subscription?.canCustomBranding && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        Branding Locked
                      </span>
                    )}
                  </div>

                  {!clientUser?.subscription?.canCustomBranding && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                      <p className="font-semibold">Academy branding is exclusive to paid plans.</p>
                      <button
                        onClick={() => {
                          setSubModalTitle("Custom Academy Branding Required");
                          setSubModalSubtitle("Upgrade to Go as you pay (Rs. 30), Standard, or Annual Plan to add your academy name and logo.");
                          setSubModalHighlight("standard");
                          setShowSubModal(true);
                        }}
                        className="mt-1 inline-flex items-center gap-1 text-blue-700 font-black hover:underline"
                      >
                        <Crown className="w-3 h-3" />
                        <span>Upgrade to Unlock Branding</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-600">School / College Name</label>
                      {!clientUser?.subscription?.canCustomBranding && (
                        <Lock className="w-3 h-3 text-slate-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      disabled={!clientUser?.subscription?.canCustomBranding}
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className={`w-full p-1.5 border rounded font-bold uppercase ${
                        !clientUser?.subscription?.canCustomBranding
                          ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                          : "bg-white text-slate-900"
                      }`}
                      title={!clientUser?.subscription?.canCustomBranding ? "Upgrade to unlock custom academy name" : ""}
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Examination Title</label>
                    <input
                      type="text"
                      value={paperTypeBanner}
                      onChange={(e) => setPaperTypeBanner(e.target.value)}
                      className="w-full p-1.5 border rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Syllabus</label>
                    <input
                      type="text"
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                      className="w-full p-1.5 border rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Instructions Popover */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "inst" ? null : "inst");
                }}
                className="h-9 px-3 rounded-md bg-white border border-slate-300 border-l-4 border-l-purple-600 font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex items-center gap-1"
              >
                <span>ℹ️ Instructions ▾</span>
              </button>

              {activeDropdown === "inst" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-300 rounded-xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in"
                >
                  <div className="font-bold text-slate-800 pb-1 border-b">Instruction Note</div>
                  <textarea
                    rows={4}
                    value={instructionText}
                    onChange={(e) => setInstructionText(e.target.value)}
                    className="w-full p-2 border rounded leading-relaxed text-[11px]"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveDropdown(null)}
                      className="px-3 py-1 bg-blue-600 text-white font-bold rounded text-xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          THE AUTHENTIC EXAMINATION PAPER SHEET (A4 Print Layout)
          ========================================================================= */}
      <main className="max-w-[850px] mx-auto px-4 sm:px-6 pt-6">
        <div
          id="paper-outer-container"
          className="bg-white border-2 border-black p-6 sm:p-8 shadow-xl text-black leading-tight space-y-4"
        >
          {/* Print Mode: Questions Section (Hidden if printMode === 'key') */}
          {printMode !== "key" && (
            <div id="paperContent" className="space-y-4" style={{ fontSize: `${mcqFontSize}px` }}>
              {/* ===================================================================
                  1. INSTITUTION & EXAM HEADER (Exact layout from Paper Preview & Print.html)
                  =================================================================== */}
              <div
                dir="ltr"
                style={{
                  border: "2px solid #000",
                  display: "flex",
                  alignItems: "stretch",
                  width: "100%",
                  marginBottom: 0,
                  background: "#fff",
                  boxSizing: "border-box",
                  lineHeight: 1.2,
                }}
              >
                {/* Middle Content Box */}
                <div
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                    borderRight: "2px solid #000",
                  }}
                >
                  {/* Institution Name */}
                  <div
                    contentEditable={clientUser?.subscription?.canCustomBranding}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (clientUser?.subscription?.canCustomBranding) {
                        setInstitutionName(e.currentTarget.textContent || institutionName);
                      }
                    }}
                    style={{
                      fontSize: `${titleFontSize}px`,
                      fontWeight: 800,
                      color: "#1a365d",
                      padding: "6px 4px 3px 4px",
                      margin: 0,
                      textTransform: "uppercase",
                      outline: "none",
                    }}
                    title={
                      clientUser?.subscription?.canCustomBranding
                        ? "Click to edit school name inline"
                        : "Custom Branding Locked - Upgrade to Standard/Annual plan"
                    }
                  >
                    {clientUser?.subscription?.canCustomBranding
                      ? institutionName
                      : "YOUR INSTITUTION NAME (FREE PLAN)"}
                  </div>

                  {/* Dark Blue Banner */}
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setPaperTypeBanner(e.currentTarget.textContent || paperTypeBanner)}
                    style={{
                      backgroundColor: "#1a365d",
                      color: "#ffffff",
                      fontWeight: "bold",
                      fontSize: "12px",
                      padding: "2px 10px",
                      borderTop: "1px solid #000",
                      borderBottom: "1px solid #000",
                      textAlign: "center",
                      outline: "none",
                    }}
                  >
                    {paperTypeBanner}
                  </div>

                  {/* Subject and Class Details */}
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      padding: "2px 0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "15px",
                      color: "#000",
                    }}
                  >
                    <span>
                      Subject:{" "}
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setSubjectTitle(e.currentTarget.textContent || subjectTitle)}
                        className="outline-none"
                      >
                        {subjectTitle}
                      </span>
                    </span>
                    <span>|</span>
                    <span>
                      Class:{" "}
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setClassNameText(e.currentTarget.textContent || classNameText)}
                        className="outline-none"
                      >
                        {classNameText}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Right Paper Code Box */}
                <div
                  style={{
                    width: "110px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2px",
                    flexShrink: 0,
                    background: "#fff",
                  }}
                >
                  <div className="text-center">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-[10px] font-bold uppercase tracking-tight text-center mb-1 outline-none"
                    >
                      PAPER CODE
                    </div>
                    <div className="flex justify-center gap-0.5">
                      {currentPaperCode.split("").map((digit, dIdx) => (
                        <div
                          key={dIdx}
                          contentEditable
                          suppressContentEditableWarning
                          style={{
                            width: "20px",
                            height: "24px",
                            border: "2px solid #000",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontFamily: "Arial",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        >
                          {digit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================================================================
                  STUDENT NAME & META TABLE (Exact layout from Paper Preview & Print.html)
                  =================================================================== */}
              {showStudentDetails && (
                <table
                  className="paper-table"
                  dir="ltr"
                  style={{
                    width: "100%",
                    border: "2px solid #000",
                    borderTop: "none",
                    borderCollapse: "collapse",
                    fontWeight: "bold",
                    marginTop: 0,
                    marginBottom: 0,
                    fontSize: "13px",
                    direction: "ltr",
                  }}
                >
                  <tbody>
                    {/* Row 1: Student Name & Syllabus */}
                    <tr style={{ borderBottom: "1px solid #000", height: "26px" }}>
                      <td
                        style={{
                          borderRight: "1px solid #000",
                          padding: "2px 4px",
                          width: "15%",
                          background: "#f8f9fa",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span>Student Name:</span>
                      </td>
                      <td
                        style={{
                          borderRight: "2px solid #000",
                          padding: "2px 4px",
                          width: "35%",
                          background: "#fff",
                        }}
                        contentEditable
                        suppressContentEditableWarning
                      />
                      <td
                        style={{
                          borderRight: "1px solid #000",
                          padding: "2px 4px",
                          width: "15%",
                          background: "#fff3e0",
                          textAlign: "left",
                          color: "#e65100",
                        }}
                      >
                        <span>Syllabus:</span>
                      </td>
                      <td
                        style={{
                          padding: "2px 4px",
                          width: "35%",
                          background: "#fff",
                          textAlign: "left",
                          color: "#333",
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setSyllabusText(e.currentTarget.textContent || syllabusText)}
                      >
                        {syllabusText}
                      </td>
                    </tr>

                    {/* Row 2: Roll No, Time, Marks, Date, Test No */}
                    <tr style={{ backgroundColor: "#e3f2fd", height: "26px" }}>
                      <td colSpan={4} style={{ padding: "2px 4px", textAlign: "center", color: "#0d47a1" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "13px",
                            lineHeight: 1,
                          }}
                        >
                          <span>
                            Roll No:{" "}
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              style={{
                                borderBottom: "1px dashed #0d47a1",
                                padding: "0 4px",
                                minWidth: "45px",
                                display: "inline-block",
                                outline: "none",
                              }}
                            />
                          </span>
                          <span>|</span>
                          <span>
                            Time:{" "}
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => setTimeDuration(e.currentTarget.textContent || timeDuration)}
                              style={{
                                borderBottom: "1px dashed #0d47a1",
                                padding: "0 4px",
                                minWidth: "35px",
                                display: "inline-block",
                                outline: "none",
                              }}
                            >
                              {timeDuration}
                            </span>
                          </span>
                          <span>|</span>
                          <span>
                            Marks:{" "}
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => setTotalMarks(Number(e.currentTarget.textContent) || totalMarks)}
                              style={{
                                borderBottom: "1px dashed #0d47a1",
                                padding: "0 4px",
                                minWidth: "35px",
                                display: "inline-block",
                                outline: "none",
                              }}
                            >
                              {totalMarks}
                            </span>
                          </span>
                          <span>|</span>
                          <span>
                            Date:{" "}
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => setPaperDate(e.currentTarget.textContent || paperDate)}
                              style={{
                                borderBottom: "1px dashed #0d47a1",
                                padding: "0 4px",
                                minWidth: "55px",
                                display: "inline-block",
                                outline: "none",
                              }}
                            >
                              {paperDate}
                            </span>
                          </span>
                          <span>|</span>
                          <span>
                            Test No.:{" "}
                            <span
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => setTestNoText(e.currentTarget.textContent || testNoText)}
                              style={{
                                borderBottom: "1px dashed #0d47a1",
                                padding: "0 4px",
                                minWidth: "45px",
                                display: "inline-block",
                                outline: "none",
                              }}
                            >
                              {testNoText}
                            </span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* ===================================================================
                  INSTRUCTIONS NOTE PANEL
                  =================================================================== */}
              {showInstructionNote && (
                <div
                  style={{
                    padding: "4px 0",
                    margin: "4px 0",
                    fontSize: "11px",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "flex-start",
                    lineHeight: 1.3,
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#d4efdf",
                      color: "#196f3d",
                      padding: "1px 6px",
                      borderRadius: "3px",
                      fontWeight: "bold",
                      marginRight: "6px",
                      display: "inline-block",
                      fontSize: "11px",
                    }}
                  >
                    Note:
                  </span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setInstructionText(e.currentTarget.textContent || instructionText)}
                    style={{ color: "#212529", fontWeight: 500, outline: "none" }}
                  >
                    {instructionText}
                  </span>
                </div>
              )}

              {/* ===================================================================
                  SECTION - I: OBJECTIVE TYPE (MCQs)
                  =================================================================== */}
              {displayedMcqs.length > 0 && (
                <div className="section space-y-2">
                  <div className="text-center font-black text-sm uppercase tracking-wider py-1 border-y border-black bg-slate-50/50">
                    SECTION - I
                  </div>

                  <div className="text-center italic font-semibold text-xs text-slate-700">
                    Choose the correct answer from the following.
                  </div>

                  {/* OMR Bubble Sheet Table */}
                  {showOMRSheet && (
                    <div
                      style={{
                        margin: "4px 0",
                        padding: 0,
                        direction: "ltr",
                        maxWidth: "100%",
                        overflowX: "auto",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          border: "2px solid #0d47a1",
                          borderCollapse: "collapse",
                          backgroundColor: "#f8fafc",
                          direction: "ltr",
                        }}
                      >
                        <tbody>
                          <tr>
                            {displayedMcqs.map((_, idx) => (
                              <td
                                key={idx}
                                style={{
                                  border: "1px solid #cbd5e1",
                                  padding: "3px 2px",
                                  verticalAlign: "middle",
                                  fontSize: "10px",
                                  textAlign: "center",
                                  whiteSpace: "nowrap",
                                  direction: "ltr",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 800,
                                    marginRight: "3px",
                                    fontSize: "10px",
                                    color: "#1e3a8a",
                                  }}
                                >
                                  {(idx + 1).toString().padStart(2, "0")}.
                                </span>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "13px",
                                    height: "13px",
                                    border: "1.5px solid #ef4444",
                                    color: "#b91c1c",
                                    backgroundColor: "#fef2f2",
                                    borderRadius: "50%",
                                    fontSize: "8px",
                                    margin: "0 1px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  A
                                </span>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "13px",
                                    height: "13px",
                                    border: "1.5px solid #3b82f6",
                                    color: "#1d4ed8",
                                    backgroundColor: "#eff6ff",
                                    borderRadius: "50%",
                                    fontSize: "8px",
                                    margin: "0 1px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  B
                                </span>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "13px",
                                    height: "13px",
                                    border: "1.5px solid #10b981",
                                    color: "#047857",
                                    backgroundColor: "#ecfdf5",
                                    borderRadius: "50%",
                                    fontSize: "8px",
                                    margin: "0 1px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  C
                                </span>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "13px",
                                    height: "13px",
                                    border: "1.5px solid #f59e0b",
                                    color: "#b45309",
                                    backgroundColor: "#fffbeb",
                                    borderRadius: "50%",
                                    fontSize: "8px",
                                    margin: "0 1px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  D
                                </span>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* MCQs List with 4 options */}
                  <div className="space-y-2 pt-1">
                    {displayedMcqs.map((q, idx) => {
                      const enTrans = q.translations?.find((t) => t.language === "en");
                      const dynamicUr = getUrduTranslation(enTrans?.text || "", enTrans?.options);

                      return (
                        <div
                          key={q.id}
                          className="group relative p-1 hover:bg-slate-50/80 rounded transition-colors"
                        >
                          {/* Hover action toolbar for question */}
                          <div className="no-print absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white border border-slate-300 rounded shadow-xs px-1.5 py-0.5 z-10 transition-opacity">
                            <button
                              onClick={() => handleSwapQuestion(q.id, "mcq")}
                              className="text-teal-600 hover:text-teal-800 p-0.5"
                              title="Swap with another MCQ"
                            >
                              <Shuffle className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-rose-600 hover:text-rose-800 p-0.5"
                              title="Delete from paper"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Question text */}
                          <div className="flex items-start gap-1.5 font-bold leading-normal">
                            <span>{idx + 1}.</span>
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                className="outline-none"
                              >
                                <MathRenderer content={enTrans?.text || ""} />
                              </span>
                              {languageMode === "Bilingual" && dynamicUr.text_ur && (
                                <span className="font-urdu text-sm text-right pr-2 text-slate-800" dir="rtl">
                                  {dynamicUr.text_ur}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Options grid */}
                          {enTrans?.options && enTrans.options.length > 0 && (
                            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-1 pl-4 text-xs">
                              {enTrans.options.map((opt, optIdx) => {
                                const letter = String.fromCharCode(65 + optIdx);
                                const optUr = dynamicUr.options_ur?.[optIdx];

                                return (
                                  <div key={optIdx} className="flex items-baseline gap-1 min-w-[22%]">
                                    <span className="font-bold">({letter})</span>
                                    <span
                                      contentEditable
                                      suppressContentEditableWarning
                                      className="outline-none"
                                    >
                                      {opt}
                                    </span>
                                    {languageMode === "Bilingual" && optUr && (
                                      <span className="font-urdu text-xs ml-1" dir="rtl">
                                        {optUr}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ===================================================================
                  SECTION - II: SUBJECTIVE TYPE (Short Questions)
                  =================================================================== */}
              {shorts.length > 0 && (
                <div className="section space-y-2 pt-2">
                  <div className="text-center font-black text-sm uppercase tracking-wider py-1 border-y border-black bg-slate-50/50">
                    SECTION - II
                  </div>

                  <div
                    style={{
                      backgroundColor: "#e0e0e0",
                      padding: "4px 8px",
                      borderBottom: "1px solid #000",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    <strong>Q. 2:</strong> Write short answers of the following questions.
                  </div>

                  {/* 2-Column Structured Layout */}
                  <div
                    style={{
                      columnCount: 2,
                      columnGap: "20px",
                      padding: "5px 10px",
                      direction: "ltr",
                      fontSize: `${subFontSize}px`,
                    }}
                  >
                    {shorts.map((q, idx) => {
                      const roman = ["(i)", "(ii)", "(iii)", "(iv)", "(v)", "(vi)", "(vii)", "(viii)", "(ix)", "(x)"][idx] || `(${idx + 1})`;
                      const enTrans = q.translations?.find((t) => t.language === "en");

                      return (
                        <div
                          key={q.id}
                          className="group relative hover:bg-slate-50/80 p-1 rounded transition-colors break-inside-avoid mb-2"
                        >
                          <div className="no-print absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white border border-slate-300 rounded shadow-xs px-1 py-0.5 z-10 transition-opacity">
                            <button
                              onClick={() => handleSwapQuestion(q.id, "short")}
                              className="text-teal-600 hover:text-teal-800 p-0.5"
                              title="Swap with another Short question"
                            >
                              <Shuffle className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-rose-600 hover:text-rose-800 p-0.5"
                              title="Delete from paper"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-start gap-1 leading-normal">
                            <span className="font-bold shrink-0">{roman}</span>
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              className="outline-none font-semibold flex-1"
                            >
                              <MathRenderer content={enTrans?.text || ""} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ===================================================================
                  SECTION - III: LONG QUESTIONS (If chosen)
                  =================================================================== */}
              {longs.length > 0 && (
                <div className="section space-y-2 pt-2">
                  <div className="text-center font-black text-sm uppercase tracking-wider py-1 border-y border-black bg-slate-50/50">
                    SECTION - III
                  </div>

                  <div
                    style={{
                      backgroundColor: "#e0e0e0",
                      padding: "4px 8px",
                      borderBottom: "1px solid #000",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    <strong>Q. 3:</strong> Write detailed answers to the following questions.
                  </div>

                  <div className="space-y-2 pt-1 pl-4">
                    {longs.map((q, idx) => {
                      const letter = String.fromCharCode(97 + idx);
                      const enTrans = q.translations?.find((t) => t.language === "en");

                      return (
                        <div key={q.id} className="flex items-start gap-2">
                          <span className="font-bold">({letter})</span>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            className="outline-none font-semibold flex-1 leading-relaxed"
                          >
                            <MathRenderer content={enTrans?.text || ""} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              ANSWER KEY SECTION (Print Mode: Key or All)
              =================================================================== */}
          {showAnswerKey && displayedMcqs.length > 0 && printMode !== "questions" && (
            <div
              className={`pt-6 ${printMode === "all" ? "page-break" : ""}`}
              style={{ pageBreakBefore: printMode === "all" ? "always" : "auto" }}
            >
              <div className="text-center font-black text-sm uppercase tracking-widest mb-0.5">
                ANSWER KEY
              </div>
              <div className="text-center text-xs text-slate-700 font-bold mb-2">
                Multiple Choice Questions
              </div>

              {/* Boxed Answer Key Table matching Paper Preview & Print.html */}
              <table
                className="answer-key-table w-full border-collapse border border-black text-xs font-sans text-center"
                style={{ direction: "ltr" }}
              >
                <thead>
                  <tr className="bg-slate-200/80 font-bold border-b border-black">
                    <th className="py-1 px-2 border-r border-black w-16">Q. No.</th>
                    <th className="py-1 px-2 border-r border-black text-left">Correct Answer</th>
                    <th className="py-1 px-2 border-r border-black w-16">Q. No.</th>
                    <th className="py-1 px-2 text-left">Correct Answer</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.ceil(displayedMcqs.length / 2) }).map((_, rIdx) => {
                    const q1 = displayedMcqs[rIdx];
                    const q2 = displayedMcqs[rIdx + Math.ceil(displayedMcqs.length / 2)];

                    const getAnsText = (q?: Question) => {
                      if (!q) return "";
                      const en = q.translations?.find((t) => t.language === "en");
                      const optIdx = (q.correct_option || 1) - 1;
                      const letter = String.fromCharCode(65 + optIdx);
                      const optText = en?.options?.[optIdx] || "";
                      return `(${letter}) ${optText}`;
                    };

                    return (
                      <tr key={rIdx} className="border-b border-black/60 text-[11px]">
                        <td className="py-1 border-r border-black font-bold font-mono">
                          {(rIdx + 1).toString().padStart(2, "0")}
                        </td>
                        <td className="py-1 px-2 border-r border-black text-left font-medium">
                          {getAnsText(q1)}
                        </td>
                        <td className="py-1 border-r border-black font-bold font-mono">
                          {q2 ? (rIdx + 1 + Math.ceil(displayedMcqs.length / 2)).toString().padStart(2, "0") : ""}
                        </td>
                        <td className="py-1 px-2 text-left font-medium">{getAnsText(q2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Client Authentication Modal */}
      <ClientAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setClientUser(user);
          setShowAuthModal(false);
          if (user.academyName && user.subscription.canCustomBranding) {
            setInstitutionName(user.academyName);
          }
        }}
      />

      {/* Subscription Plans Modal */}
      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSuccess={(user) => {
          setClientUser(user);
          setShowSubModal(false);
          if (user.academyName && user.subscription.canCustomBranding) {
            setInstitutionName(user.academyName);
          }
        }}
        title={subModalTitle}
        subtitle={subModalSubtitle}
        highlightPlan={subModalHighlight}
      />
    </div>
  );
}
