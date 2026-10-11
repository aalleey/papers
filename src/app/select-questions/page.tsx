"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Question,
  Chapter,
  Topic,
  ClientUser,
  SubscriptionPlanId,
  SUBSCRIPTION_PLANS,
  getPlanPermissions,
  isPaidSubscriber,
} from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import { getUrduTranslation } from "@/lib/urdu-translations";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import {
  ChevronUp,
  ChevronDown,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  FileText,
  SlidersHorizontal,
  X,
  ArrowLeft,
  Settings,
  HelpCircle,
  BookOpen,
  Award,
  Zap,
  RotateCcw,
  Eye,
  Sliders,
  ChevronRight,
  Crown,
  Lock,
  UserCheck,
  LogIn,
  LogOut,
} from "lucide-react";

export default function SelectQuestionsPage() {
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

  // Data state
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // Selection state (Set of question IDs)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter controls state
  const [patternMode, setPatternMode] = useState<"board" | "auto" | "custom" | null>(null);
  const [skipALP, setSkipALP] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<"mixed" | "exercise" | "additional" | "board">("mixed");
  const [languageMode, setLanguageMode] = useState<"English" | "Urdu" | "Bilingual">("Bilingual");

  // Topic filter state (Set of selected topic IDs or 'ALL')
  const [selectedTopicFilters, setSelectedTopicFilters] = useState<Set<string>>(new Set(["ALL"]));

  // UI state
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [viewOnlySelected, setViewOnlySelected] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [mobileTopicsOpen, setMobileTopicsOpen] = useState(false);

  // Accordion state
  const [accordionOpen, setAccordionOpen] = useState({
    mcq: true,
    short: true,
    long: true,
  });

  // Custom pattern modal counts
  const [customCounts, setCustomCounts] = useState({
    mcqs: 10,
    shorts: 5,
    longs: 2,
  });

  const [authChecked, setAuthChecked] = useState(false);

  // Load questions for a specific chapter (Only accessible if logged in)
  async function loadQuestionsForChapter(chapterOverride?: string) {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams(window.location.search);
      const urlChap = searchParams.get("chapter");
      const urlChapId = searchParams.get("chapter_id");

      let initialChapterId = chapterOverride || urlChapId || "bd6c341e-e709-5551-959a-84c2a20e57f5"; // Default Chapter 3
      if (urlChap === "1") initialChapterId = "81fef04e-6a53-5018-9051-fdb1c36775d9";
      if (urlChap === "2") initialChapterId = "68fc022a-f4b1-53f8-a133-2946135d88db";
      if (urlChap === "3") initialChapterId = "bd6c341e-e709-5551-959a-84c2a20e57f5";
      if (urlChap === "8") initialChapterId = "ac5b38de-123c-51fc-a96b-1ecaff9762ce";

      const res = await fetch(`/api/paper/questions?chapter_id=${initialChapterId}`);
      if (res.status === 401) {
        setClientUser(null);
        setAllQuestions([]);
        return;
      }

      const data = await res.json();
      if (data.chapters?.length) {
        setChapters(data.chapters);
        const activeCh = data.chapters.find((c: Chapter) => c.id === initialChapterId) || data.chapters[0];
        setCurrentChapter(activeCh);
      }

      if (data.topics?.length) {
        setTopics(data.topics);
      }

      if (data.questions?.length) {
        setAllQuestions(data.questions);
      }

      // Check if there are previously selected questions in sessionStorage
      const saved = sessionStorage.getItem("papermaker_selected_ids");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedIds(new Set(parsed));
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  }

  // 1. Initial Load: Check Auth First (Lock everything until user is logged in)
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const authRes = await fetch("/api/auth/client/me");
        const authData = await authRes.json();
        if (authData.client) {
          setClientUser(authData.client);
          await loadQuestionsForChapter();
        } else {
          setClientUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to check auth state:", err);
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
      setAllQuestions([]);
      setSelectedIds(new Set());
    } catch (e) {
      console.error("Failed to log out client", e);
    }
  }

  async function handleChapterChange(chapterId: string) {
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    setCurrentChapter(ch);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("chapter_id", ch.id);
    window.history.replaceState({}, "", newUrl.toString());
    await loadQuestionsForChapter(ch.id);
  }

  // Sync selection to sessionStorage
  useEffect(() => {
    if (selectedIds.size > 0) {
      sessionStorage.setItem("papermaker_selected_ids", JSON.stringify([...selectedIds]));
    }
  }, [selectedIds]);

  // Topic counts map
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of allQuestions) {
      if (q.topic_id) {
        counts[q.topic_id] = (counts[q.topic_id] || 0) + 1;
      }
      if (q.source === "exercise") {
        counts["exercise_source"] = (counts["exercise_source"] || 0) + 1;
      }
    }
    return counts;
  }, [allQuestions]);

  // Filtered Questions based on active filters
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      // 1. Topic Filter
      if (!selectedTopicFilters.has("ALL")) {
        if (selectedTopicFilters.has("exercise_source")) {
          if (q.source !== "exercise") return false;
        } else if (!q.topic_id || !selectedTopicFilters.has(q.topic_id)) {
          return false;
        }
      }

      // 2. Source Filter
      if (sourceFilter === "exercise" && q.source !== "exercise") return false;
      if (sourceFilter === "additional" && q.source !== "extra") return false;
      if (sourceFilter === "board" && q.source !== "past_paper") return false;

      // 3. Skip ALP Filter
      if (skipALP && (q.concept_tag?.toLowerCase().includes("alp") || q.source_ref?.toLowerCase().includes("alp"))) {
        return false;
      }

      // 4. View Only Selected filter
      if (viewOnlySelected && !selectedIds.has(q.id)) {
        return false;
      }

      return true;
    });
  }, [allQuestions, selectedTopicFilters, sourceFilter, skipALP, viewOnlySelected, selectedIds]);

  // Split into categories
  const mcqQuestions = useMemo(() => filteredQuestions.filter((q) => q.type === "mcq"), [filteredQuestions]);
  const shortQuestions = useMemo(() => filteredQuestions.filter((q) => q.type === "short"), [filteredQuestions]);
  const longQuestions = useMemo(() => filteredQuestions.filter((q) => q.type === "long"), [filteredQuestions]);

  // Selected counts breakdown
  const selectedCounts = useMemo(() => {
    let mcq = 0;
    let short = 0;
    let long = 0;
    for (const id of selectedIds) {
      const q = allQuestions.find((item) => item.id === id);
      if (q) {
        if (q.type === "mcq") mcq++;
        else if (q.type === "short") short++;
        else if (q.type === "long") long++;
      }
    }
    return { mcq, short, long, total: selectedIds.size };
  }, [selectedIds, allQuestions]);

  // Toggle selection of a question
  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all in a group
  const selectAllInGroup = (group: Question[]) => {
    const allSelected = group.every((q) => selectedIds.has(q.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        group.forEach((q) => next.delete(q.id));
      } else {
        group.forEach((q) => next.add(q.id));
      }
      return next;
    });
  };

  // Toggle topic filter
  const toggleTopic = (topicKey: string) => {
    setSelectedTopicFilters((prev) => {
      if (topicKey === "ALL") {
        return new Set(["ALL"]);
      }
      const next = new Set(prev);
      next.delete("ALL");
      if (next.has(topicKey)) {
        next.delete(topicKey);
        if (next.size === 0) next.add("ALL");
      } else {
        next.add(topicKey);
      }
      return next;
    });
  };

  // Auto Selection / Custom Pattern Action
  const applyCustomPattern = (mcqTarget: number, shortTarget: number, longTarget: number) => {
    const newSelected = new Set<string>();

    const mcqs = allQuestions.filter((q) => q.type === "mcq");
    const shorts = allQuestions.filter((q) => q.type === "short");
    const longs = allQuestions.filter((q) => q.type === "long");

    mcqs.slice(0, mcqTarget).forEach((q) => newSelected.add(q.id));
    shorts.slice(0, shortTarget).forEach((q) => newSelected.add(q.id));
    longs.slice(0, longTarget).forEach((q) => newSelected.add(q.id));

    setSelectedIds(newSelected);
    setShowCustomModal(false);
  };

  // Navigate to Paper Editor
  const handleGeneratePaper = () => {
    // 1. Must be logged in / have client session
    if (!clientUser) {
      setSubModalTitle("Client Login & Subscription Required");
      setSubModalSubtitle("Please sign in or select a plan to generate and export board examination papers.");
      setShowAuthModal(true);
      return;
    }

    // 2. Paid Subscription Check: Free accounts or 0 credits cannot generate papers
    if (!isPaidSubscriber(clientUser)) {
      setSubModalTitle("Paid Subscription Required");
      setSubModalSubtitle(
        "Only registered educators with an active paid subscription are eligible to generate examination papers. Upgrade to Go as you pay (Rs. 30), Standard, or Annual Plan to generate papers!"
      );
      setSubModalHighlight("pay_as_you_go");
      setShowSubModal(true);
      return;
    }

    const selectedList = allQuestions.filter((q) => selectedIds.has(q.id));
    sessionStorage.setItem("papermaker_selected_questions", JSON.stringify(selectedList));
    sessionStorage.setItem("papermaker_language_mode", languageMode);
    router.push("/paper-editor");
  };

  if (!authChecked || (loading && clientUser)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6 text-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-black text-white mt-6 tracking-tight flex items-center gap-2">
          <span>Loading Question Bank...</span>
          <span className="font-urdu text-emerald-400 text-lg">پیپر والا</span>
        </h2>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Fetching Punjab Board Curriculum &bull; Class 10
        </p>
      </div>
    );
  }

  // =========================================================================
  // LOCKED PORTAL SCREEN: Shown when user is not logged in
  // =========================================================================
  if (authChecked && !clientUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-600/20 via-indigo-600/25 to-teal-500/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-lg w-full bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 blur-lg opacity-60 animate-pulse" />
            <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center shadow-xl ring-4 ring-amber-500/30">
              <Lock className="w-9 h-9 text-white stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Authentication Required &bull; Everything Locked</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Question Bank &amp; Paper Maker is Locked
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              Please sign in with your educator account to access the question bank, select syllabus chapters, and generate board-standard papers.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-950/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              id="btn-lock-login"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Unlock Generator</span>
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
                href="/"
                className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home Page</span>
              </Link>
            </div>
          </div>

          {/* Quick 1-Click Demo Testing */}
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
                      await loadQuestionsForChapter();
                    }
                  } catch (e) {
                    console.error("Demo login failed", e);
                  }
                }}
                className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold transition-all text-center"
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
                      await loadQuestionsForChapter();
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

        {/* Client Auth Modal */}
        <ClientAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={async (user) => {
            setClientUser(user);
            setShowAuthModal(false);
            if (isPaidSubscriber(user)) {
              await loadQuestionsForChapter();
            }
          }}
        />
      </div>
    );
  }

  // =========================================================================
  // LOCKED PAYWALL SCREEN: Shown when user is logged in on a FREE account
  // (Only registered users with a paid subscription are eligible to generate papers)
  // =========================================================================
  if (authChecked && clientUser && !isPaidSubscriber(clientUser)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-amber-500/15 via-rose-500/15 to-indigo-500/20 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-2xl w-full bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Paid Subscription Required to Generate Papers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Only Paid Subscribers Can Generate Papers
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              Logged in as <strong className="text-white">{clientUser.fullName}</strong> ({clientUser.email}) &bull; Current Status: <span className="text-amber-400 font-bold">{clientUser.subscription.planName}</span>. Free accounts cannot generate or export examination papers. Choose a plan below to activate instant generation:
            </p>
          </div>

          {/* Monthly Subscription Card */}
          <div className="max-w-lg mx-auto w-full">
            <div className="bg-slate-800/90 border-2 border-emerald-500 rounded-3xl p-6 flex flex-col justify-between shadow-2xl shadow-emerald-950/60 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                UNLIMITED PAPER GENERATION
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
                  Unlimited papers for all classes (9th–12th), auto board pattern (ALP), custom academy crest, answer keys &amp; instant PDF export.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubModalTitle("Subscribe to Monthly Plan (Rs. 2,000)");
                  setSubModalSubtitle("Enjoy 30 days of unlimited paper generation with academy branding & answer keys.");
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
              <span>Compare All Plan Details &amp; Pricing</span>
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
              await loadQuestionsForChapter();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-800 font-sans pb-36 selection:bg-indigo-500 selection:text-white">
      {/* =========================================================================
          TOP SMART HEADER (VIBRANT & FULLY RESPONSIVE)
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-md shadow-indigo-950/5 transition-all duration-200">
        {!headerCollapsed && (
          <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3 space-y-3">
            {/* Top Bar: Title, Breadcrumbs, and Brand Badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Link
                  href="/"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors shadow-2xs shrink-0"
                  title="Back to Homepage"
                  id="btn-back-home"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 bg-clip-text text-transparent">
                        Select: Computer
                      </span>
                      <span className="font-urdu text-blue-700 text-base sm:text-lg">کمپیوٹر</span>
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                      <Sparkles className="w-3 h-3 text-emerald-200" />
                      PaperWala
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5 flex flex-wrap items-center gap-1">
                    <span>Punjab Boards &bull; 10th (New) 2026-27 &bull;</span>
                    <span className="text-indigo-600 font-bold">
                      Unit-{currentChapter?.number || 2}: {currentChapter?.title || "System Recovery"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Responsive Quick Action Buttons & Client Subscription Badge in Header */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                {/* Client Subscription Status Badge */}
                {clientUser ? (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
                    <button
                      onClick={() => {
                        setSubModalTitle("Manage Subscription Plan");
                        setSubModalSubtitle(`Current Plan: ${clientUser.subscription.planName}. Choose a plan below to upgrade or renew.`);
                        setSubModalHighlight(clientUser.subscription.planId);
                        setShowSubModal(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all shadow-2xs ${
                        clientUser.subscription.planId === "annual"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          : clientUser.subscription.planId === "standard"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                          : clientUser.subscription.planId === "pay_as_you_go"
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
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
                          setSubModalTitle("Upgrade Your Plan");
                          setSubModalSubtitle("Unlock Auto Board Pattern Generator, full papers, academy branding, and answer keys!");
                          setSubModalHighlight("standard");
                          setShowSubModal(true);
                        }}
                        className="px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black transition-colors"
                      >
                        Upgrade
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Log Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
                    id="btn-client-login"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Client Login</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (!clientUser) {
                      setShowAuthModal(true);
                      return;
                    }
                    if (!clientUser.subscription.canAutoBoardPattern) {
                      setSubModalTitle("Auto Board Pattern Generator is Locked");
                      setSubModalSubtitle("Free Plan only allows manual question selection. Upgrade to Go as you pay (Rs. 30), Standard, or Annual Plan for automatic board selection.");
                      setSubModalHighlight("standard");
                      setShowSubModal(true);
                      return;
                    }
                    applyCustomPattern(10, 5, 2);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200 flex items-center gap-1.5 shadow-2xs"
                  title="Quick Auto Pick (10 MCQs, 5 Shorts, 2 Longs)"
                >
                  <Zap className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                  <span>Auto Pick</span>
                  {!clientUser?.subscription?.canAutoBoardPattern && <Lock className="w-3 h-3 text-indigo-500" />}
                </button>

                <button
                  onClick={() => setShowCustomModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-all border border-violet-200 flex items-center gap-1.5 shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-violet-600" />
                  <span>Custom</span>
                </button>

                <button
                  onClick={() => setSelectedIds(new Set())}
                  disabled={selectedIds.size === 0}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold transition-all"
                  title="Clear selection"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Vibrant Controls Grid: Pattern, Source, Language */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
              {/* 1. Pattern Group (Warm Amber / Gold Theme) */}
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border border-amber-200/90 rounded-xl p-2.5 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-amber-600" />
                    Selection Pattern
                  </span>
                  {skipALP && (
                    <span className="text-[9px] bg-rose-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                      ALP Skipped
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-700 font-medium">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-amber-900 select-none">
                    <input
                      type="checkbox"
                      checked={patternMode === "board"}
                      onChange={() => {
                        if (!clientUser) {
                          setShowAuthModal(true);
                          return;
                        }
                        if (!clientUser.subscription.canAutoBoardPattern) {
                          setSubModalTitle("Auto Board Pattern Generator is Locked");
                          setSubModalSubtitle("Free Plan only allows manual question selection. Upgrade to Go as you pay (Rs. 30), Standard, or Annual Plan to generate papers with Board patterns.");
                          setSubModalHighlight("standard");
                          setShowSubModal(true);
                          return;
                        }
                        setPatternMode(patternMode === "board" ? null : "board");
                      }}
                      className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                    />
                    <span>Board</span>
                    {!clientUser?.subscription?.canAutoBoardPattern && <Lock className="w-3 h-3 text-amber-600 inline" />}
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-amber-900 select-none">
                    <input
                      type="checkbox"
                      checked={patternMode === "auto"}
                      onChange={() => {
                        if (!clientUser) {
                          setShowAuthModal(true);
                          return;
                        }
                        if (!clientUser.subscription.canAutoBoardPattern) {
                          setSubModalTitle("Auto Pattern Selection is Locked");
                          setSubModalSubtitle("Free Plan only allows manual question selection. Upgrade to Go as you pay (Rs. 30), Standard, or Annual Plan to generate papers automatically.");
                          setSubModalHighlight("standard");
                          setShowSubModal(true);
                          return;
                        }
                        setPatternMode(patternMode === "auto" ? null : "auto");
                        if (patternMode !== "auto") applyCustomPattern(10, 5, 2);
                      }}
                      className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                    />
                    <span className="font-bold text-amber-900">Auto (10:5:2)</span>
                    {!clientUser?.subscription?.canAutoBoardPattern && <Lock className="w-3 h-3 text-amber-600 inline" />}
                  </label>

                  <label className="inline-flex items-center gap-1.5 cursor-pointer hover:text-amber-900 select-none">
                    <input
                      type="checkbox"
                      checked={patternMode === "custom"}
                      onChange={() => {
                        setPatternMode("custom");
                        setShowCustomModal(true);
                      }}
                      className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                    />
                    <span>Custom</span>
                  </label>

                  <label className="inline-flex items-center gap-1 cursor-pointer font-bold text-rose-600 hover:text-rose-700 select-none ml-auto">
                    <input
                      type="checkbox"
                      checked={skipALP}
                      onChange={(e) => setSkipALP(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    <span>Skip ALP</span>
                  </label>
                </div>
              </div>

              {/* 2. Source Group (Fresh Emerald / Teal Theme) */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-200/90 rounded-xl p-2.5 shadow-xs">
                <div className="font-extrabold text-emerald-800 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-emerald-600" />
                  Question Source
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-slate-700 font-medium">
                  {[
                    { value: "mixed", label: "Mixed" },
                    { value: "exercise", label: "Exercise" },
                    { value: "additional", label: "Extra" },
                    { value: "board", label: "Past Papers" },
                  ].map((src) => (
                    <label
                      key={src.value}
                      className={`inline-flex items-center gap-1 cursor-pointer select-none px-2 py-0.5 rounded-md transition-colors ${
                        sourceFilter === src.value
                          ? "bg-emerald-600 text-white font-bold shadow-2xs"
                          : "hover:bg-emerald-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="source"
                        checked={sourceFilter === src.value}
                        onChange={() => setSourceFilter(src.value as any)}
                        className="sr-only"
                      />
                      <span>{src.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Language Group (Vibrant Indigo / Violet Theme) */}
              <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-white border border-indigo-200/90 rounded-xl p-2.5 shadow-xs">
                <div className="font-extrabold text-indigo-800 uppercase tracking-wider text-[10px] mb-1.5 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-indigo-600" />
                  Language Format
                </div>
                <div className="flex items-center justify-around gap-1.5 text-slate-700 font-medium">
                  {[
                    { value: "Bilingual", label: "Both (Bilingual)" },
                    { value: "English", label: "English" },
                    { value: "Urdu", label: "اردو" },
                  ].map((lang) => (
                    <label
                      key={lang.value}
                      className={`inline-flex items-center gap-1 cursor-pointer select-none px-2.5 py-0.5 rounded-md transition-colors ${
                        languageMode === lang.value
                          ? "bg-indigo-600 text-white font-bold shadow-2xs"
                          : "hover:bg-indigo-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="lang"
                        checked={languageMode === lang.value}
                        onChange={() => setLanguageMode(lang.value as any)}
                        className="sr-only"
                      />
                      <span className={lang.value === "Urdu" ? "font-urdu text-sm" : ""}>
                        {lang.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Chapter Navigation Bar (Matches Ref Chapter Header with high vibrance) */}
            <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  if (!currentChapter) return;
                  const curIdx = chapters.findIndex((c) => c.id === currentChapter.id);
                  if (curIdx > 0) handleChapterChange(chapters[curIdx - 1].id);
                }}
                disabled={!currentChapter || chapters.findIndex((c) => c.id === currentChapter.id) <= 0}
                className="px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 font-extrabold text-xs transition-all disabled:cursor-not-allowed shadow-sm shrink-0 flex items-center gap-1"
                id="btn-prev-chapter"
              >
                <span>&larr;</span>
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex-1 max-w-xl text-center">
                <select
                  value={currentChapter?.id || ""}
                  onChange={(e) => handleChapterChange(e.target.value)}
                  className="w-full font-black text-slate-800 text-xs sm:text-sm bg-gradient-to-r from-slate-50 to-indigo-50/50 hover:bg-slate-100 px-3 py-1.5 sm:py-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-center shadow-xs"
                  id="select-chapter-dropdown"
                >
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      Unit-{ch.number}: {ch.title} {ch.title_ur ? `(${ch.title_ur})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  if (!currentChapter) return;
                  const curIdx = chapters.findIndex((c) => c.id === currentChapter.id);
                  if (curIdx < chapters.length - 1) handleChapterChange(chapters[curIdx + 1].id);
                }}
                disabled={!currentChapter || chapters.findIndex((c) => c.id === currentChapter.id) >= chapters.length - 1}
                className="px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 font-extrabold text-xs transition-all disabled:cursor-not-allowed shadow-sm shrink-0 flex items-center gap-1"
                id="btn-next-chapter"
              >
                <span className="hidden sm:inline">Next</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* Toggle Collapse Tab */}
        <div className="flex justify-center -mb-3 relative z-10">
          <button
            onClick={() => setHeaderCollapsed(!headerCollapsed)}
            className="w-10 h-6 bg-white border border-indigo-100 rounded-b-xl shadow-sm hover:bg-indigo-50 flex items-center justify-center text-indigo-600 transition-colors"
            title={headerCollapsed ? "Expand Smart Header" : "Collapse Smart Header"}
            id="btn-toggle-header"
          >
            {headerCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN LAYOUT: TOPICS (DESKTOP SIDEBAR + MOBILE ACCORDION) & QUESTIONS
          ========================================================================= */}
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 pt-5 sm:pt-7 flex flex-col lg:flex-row items-start gap-5 sm:gap-6">
        {/* MOBILE TOPIC ACCORDION STRIP (Shown only on < lg) */}
        <div className="lg:hidden w-full bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setMobileTopicsOpen(!mobileTopicsOpen)}
            className="w-full px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center justify-between text-xs font-bold text-indigo-900"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Filter by Topic ({topics.length} Topics Available)</span>
              {!selectedTopicFilters.has("ALL") && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px]">
                  Filtered
                </span>
              )}
            </div>
            {mobileTopicsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {mobileTopicsOpen && (
            <div className="p-3 border-t border-indigo-100 flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => toggleTopic("ALL")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedTopicFilters.has("ALL")
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Topics ({allQuestions.length})
              </button>

              {topics.map((t) => {
                const isSelected = selectedTopicFilters.has(t.id);
                const count = topicCounts[t.id] || 0;
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleTopic(t.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-left transition-all text-xs font-medium ${
                      isSelected
                        ? "bg-indigo-600 text-white font-bold shadow-xs"
                        : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-indigo-50"
                    }`}
                  >
                    <span>
                      {/^\d+\./.test(t.title) ? t.title : `${currentChapter?.number || 2}.${t.number} ${t.title}`}
                    </span>
                    <span className="ml-1.5 opacity-80 font-bold">({count})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* DESKTOP VERTICAL SIDEBAR: TOPIC FILTER */}
        <aside className="hidden lg:block w-72 xl:w-80 bg-white rounded-2xl border border-indigo-100 shadow-md shadow-indigo-950/5 overflow-hidden shrink-0 sticky top-28">
          <div className="px-4 py-3.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 text-white flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-indigo-200" />
              Filter by Topic
            </span>
            <button
              onClick={() => setSelectedTopicFilters(new Set(["ALL"]))}
              className="text-[10px] text-indigo-200 hover:text-white font-bold underline transition-colors"
            >
              Reset
            </button>
          </div>

          <ul className="divide-y divide-slate-100 text-xs max-h-[calc(100vh-220px)] overflow-y-auto">
            {/* All Topics */}
            <li
              onClick={() => toggleTopic("ALL")}
              className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                selectedTopicFilters.has("ALL")
                  ? "bg-gradient-to-r from-indigo-50 to-blue-50 font-bold text-indigo-900 border-l-4 border-indigo-600"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedTopicFilters.has("ALL")}
                  readOnly
                  className="rounded text-indigo-600 pointer-events-none h-4 w-4"
                />
                <span className="font-bold">All Topics</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-black">
                {allQuestions.length}
              </span>
            </li>

            {/* Individual Topics */}
            {topics.map((t) => {
              const isSelected = selectedTopicFilters.has(t.id);
              const count = topicCounts[t.id] || 0;
              return (
                <li
                  key={t.id}
                  onClick={() => toggleTopic(t.id)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-50 to-blue-50 font-bold text-indigo-900 border-l-4 border-indigo-600"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 pr-2 leading-tight">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded text-indigo-600 pointer-events-none shrink-0 h-4 w-4"
                    />
                    <span className="line-clamp-2">
                      {/^\d+\./.test(t.title) ? t.title : `${currentChapter?.number || 2}.${t.number} ${t.title}`}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </li>
              );
            })}

            {/* Exercise Filter */}
            <li
              onClick={() => toggleTopic("exercise_source")}
              className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                selectedTopicFilters.has("exercise_source")
                  ? "bg-gradient-to-r from-indigo-50 to-blue-50 font-bold text-indigo-900 border-l-4 border-indigo-600"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedTopicFilters.has("exercise_source")}
                  readOnly
                  className="rounded text-indigo-600 pointer-events-none h-4 w-4"
                />
                <span className="font-bold">Textbook Exercise Questions</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                {topicCounts["exercise_source"] || 0}
              </span>
            </li>
          </ul>
        </aside>

        {/* QUESTIONS CONTAINER */}
        <main className="flex-1 w-full space-y-6">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-md space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="font-black text-lg text-slate-800">No Questions Match Current Filters</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Try selecting &ldquo;All Topics&rdquo; or switching the Source filter to &ldquo;Mixed&rdquo;.
              </p>
              <button
                onClick={() => {
                  setSelectedTopicFilters(new Set(["ALL"]));
                  setSourceFilter("mixed");
                  setViewOnlySelected(false);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* SECTION 1: MULTIPLE CHOICE QUESTIONS (Vibrant Royal Blue / Indigo Theme) */}
              {mcqQuestions.length > 0 && (
                <section className="bg-white rounded-2xl border border-blue-100 shadow-md shadow-blue-950/5 overflow-hidden">
                  {/* Accordion Header */}
                  <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white border-b border-blue-100 flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => setAccordionOpen((prev) => ({ ...prev, mcq: !prev.mcq }))}
                      className="flex items-center gap-2.5 font-black text-sm sm:text-base text-blue-950 hover:text-blue-700 transition-colors"
                      id="accordion-toggle-mcq"
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        A
                      </div>
                      <span>Multiple Choice Questions</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-black">
                        {mcqQuestions.length}
                      </span>
                      {accordionOpen.mcq ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllInGroup(mcqQuestions)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-lg border border-blue-200 shadow-2xs transition-all active:scale-95"
                      >
                        {mcqQuestions.every((q) => selectedIds.has(q.id)) ? "Deselect All MCQs" : "Select All MCQs"}
                      </button>
                    </div>
                  </div>

                  {/* Responsive Card Grid */}
                  {accordionOpen.mcq && (
                    <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                      {mcqQuestions.map((q, idx) => (
                        <QuestionCard
                          key={q.id}
                          index={idx + 1}
                          question={q}
                          isSelected={selectedIds.has(q.id)}
                          languageMode={languageMode}
                          onToggle={() => toggleQuestion(q.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* SECTION 2: SHORT QUESTIONS (Vibrant Emerald / Teal Theme) */}
              {shortQuestions.length > 0 && (
                <section className="bg-white rounded-2xl border border-emerald-100 shadow-md shadow-emerald-950/5 overflow-hidden">
                  <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => setAccordionOpen((prev) => ({ ...prev, short: !prev.short }))}
                      className="flex items-center gap-2.5 font-black text-sm sm:text-base text-emerald-950 hover:text-emerald-700 transition-colors"
                      id="accordion-toggle-short"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        B
                      </div>
                      <span>Short Questions</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black">
                        {shortQuestions.length}
                      </span>
                      {accordionOpen.short ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-emerald-600" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllInGroup(shortQuestions)}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 rounded-lg border border-emerald-200 shadow-2xs transition-all active:scale-95"
                      >
                        {shortQuestions.every((q) => selectedIds.has(q.id)) ? "Deselect All Shorts" : "Select All Shorts"}
                      </button>
                    </div>
                  </div>

                  {accordionOpen.short && (
                    <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                      {shortQuestions.map((q, idx) => (
                        <QuestionCard
                          key={q.id}
                          index={idx + 1}
                          question={q}
                          isSelected={selectedIds.has(q.id)}
                          languageMode={languageMode}
                          onToggle={() => toggleQuestion(q.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* SECTION 3: DETAILED / LONG QUESTIONS (Vibrant Violet / Fuchsia Theme) */}
              {longQuestions.length > 0 && (
                <section className="bg-white rounded-2xl border border-purple-100 shadow-md shadow-purple-950/5 overflow-hidden">
                  <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-purple-50/90 via-fuchsia-50/60 to-white border-b border-purple-100 flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => setAccordionOpen((prev) => ({ ...prev, long: !prev.long }))}
                      className="flex items-center gap-2.5 font-black text-sm sm:text-base text-purple-950 hover:text-purple-700 transition-colors"
                      id="accordion-toggle-long"
                    >
                      <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                        C
                      </div>
                      <span>Detailed / Long Questions</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-xs font-black">
                        {longQuestions.length}
                      </span>
                      {accordionOpen.long ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-purple-600" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllInGroup(longQuestions)}
                        className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-white hover:bg-purple-50 rounded-lg border border-purple-200 shadow-2xs transition-all active:scale-95"
                      >
                        {longQuestions.every((q) => selectedIds.has(q.id)) ? "Deselect All Longs" : "Select All Longs"}
                      </button>
                    </div>
                  </div>

                  {accordionOpen.long && (
                    <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                      {longQuestions.map((q, idx) => (
                        <QuestionCard
                          key={q.id}
                          index={idx + 1}
                          question={q}
                          isSelected={selectedIds.has(q.id)}
                          languageMode={languageMode}
                          onToggle={() => toggleQuestion(q.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* =========================================================================
          STICKY BOTTOM BAR (COMPACT, GLOWING & 100% RESPONSIVE)
          ========================================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-indigo-100 shadow-2xl py-2.5 sm:py-3.5 px-3 sm:px-8">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Counters row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs font-bold text-slate-800 w-full sm:w-auto">
            <span className="flex items-center gap-1.5 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200">
              <span className="text-slate-600">MCQs:</span>
              <span className="font-black text-blue-700">{selectedCounts.mcq}</span>
            </span>

            <span className="flex items-center gap-1.5 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span className="text-slate-600">Shorts:</span>
              <span className="font-black text-emerald-700">{selectedCounts.short}</span>
            </span>

            <span className="flex items-center gap-1.5 bg-purple-50/80 px-2.5 py-1 rounded-lg border border-purple-200">
              <span className="text-slate-600">Longs:</span>
              <span className="font-black text-purple-700">{selectedCounts.long}</span>
            </span>

            <div className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 rounded-lg border border-amber-200 font-black text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Total Selected: {selectedCounts.total}</span>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            {selectedCounts.total > 0 && (
              <button
                onClick={() => setViewOnlySelected(!viewOnlySelected)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                  viewOnlySelected
                    ? "bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-300"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{viewOnlySelected ? "Show All" : `View Selected (${selectedCounts.total})`}</span>
              </button>
            )}

            <button
              onClick={handleGeneratePaper}
              disabled={selectedCounts.total === 0}
              id="btn-generate-paper-bottom"
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                selectedCounts.total === 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/20 ring-2 ring-emerald-400/40"
              }`}
            >
              <span>Generate Paper</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          CUSTOM PATTERN SELECTION MODAL
          ========================================================================= */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 border border-indigo-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-base text-slate-900">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                <span>Custom Question Pattern</span>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Specify the exact number of questions to pick for each section:
            </p>

            <div className="space-y-4 text-xs font-semibold">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                <label className="block text-blue-900 mb-1">Multiple Choice Questions (MCQs):</label>
                <input
                  type="number"
                  min="0"
                  max={allQuestions.filter((q) => q.type === "mcq").length}
                  value={customCounts.mcqs}
                  onChange={(e) => setCustomCounts({ ...customCounts, mcqs: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-800"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <label className="block text-emerald-900 mb-1">Short Questions:</label>
                <input
                  type="number"
                  min="0"
                  max={allQuestions.filter((q) => q.type === "short").length}
                  value={customCounts.shorts}
                  onChange={(e) => setCustomCounts({ ...customCounts, shorts: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-black focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-800"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                <label className="block text-purple-900 mb-1">Long / Detailed Questions:</label>
                <input
                  type="number"
                  min="0"
                  max={allQuestions.filter((q) => q.type === "long").length}
                  value={customCounts.longs}
                  onChange={(e) => setCustomCounts({ ...customCounts, longs: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-black focus:ring-2 focus:ring-purple-500 outline-none bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => applyCustomPattern(customCounts.mcqs, customCounts.shorts, customCounts.longs)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all active:scale-95"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Authentication Modal */}
      <ClientAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setClientUser(user);
          setShowAuthModal(false);
        }}
      />

      {/* Subscription Plans Modal */}
      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSuccess={(user) => {
          setClientUser(user);
          setShowSubModal(false);
        }}
        title={subModalTitle}
        subtitle={subModalSubtitle}
        highlightPlan={subModalHighlight}
      />
    </div>
  );
}

// =========================================================================
// VIBRANT, EYE-CATCHING QUESTION CARD COMPONENT
// =========================================================================
interface QuestionCardProps {
  index: number;
  question: Question;
  isSelected: boolean;
  languageMode: "English" | "Urdu" | "Bilingual";
  onToggle: () => void;
}

function QuestionCard({
  index,
  question,
  isSelected,
  languageMode,
  onToggle,
}: QuestionCardProps) {
  const enTrans = question.translations?.find((t) => t.language === "en");
  const urTrans = question.translations?.find((t) => t.language === "ur");

  const dynamicUrdu = useMemo(() => {
    if (urTrans?.text) return { text_ur: urTrans.text, options_ur: urTrans.options };
    if (enTrans?.text) return getUrduTranslation(enTrans.text, enTrans.options);
    return { text_ur: null, options_ur: null };
  }, [enTrans, urTrans]);

  const showEnglish = languageMode === "English" || languageMode === "Bilingual";
  const showUrdu = languageMode === "Urdu" || languageMode === "Bilingual";

  const optionsEn: string[] = useMemo(() => {
    const raw = enTrans?.options;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  }, [enTrans?.options]);

  const optionsUr: string[] = useMemo(() => {
    const raw = dynamicUrdu.options_ur;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  }, [dynamicUrdu.options_ur]);

  return (
    <article
      onClick={onToggle}
      className={`group relative rounded-2xl border p-4 text-xs transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
        isSelected
          ? "border-indigo-400 bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-white ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-100"
          : "border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-950/5"
      }`}
    >
      {/* Top Header Row with Number and Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "border-2 border-slate-300 group-hover:border-indigo-400"
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span
              className={`font-black text-xs sm:text-sm tracking-tight ${
                isSelected ? "text-indigo-950" : "text-slate-800"
              }`}
            >
              Q.{index}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {question.source === "exercise" && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Exercise
              </span>
            )}

            {question.source_ref && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px]">
                {question.source_ref}
              </span>
            )}

            {question.concept_tag && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[10px]">
                {question.concept_tag}
              </span>
            )}
          </div>
        </div>

        {/* Question Text (Bilingual / Single Language) */}
        <div className="py-1">
          {languageMode === "Bilingual" ? (
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 text-slate-800 leading-relaxed">
              {/* English on Left */}
              <div className="flex-1 font-bold text-slate-900 text-xs sm:text-sm">
                <MathRenderer content={enTrans?.text || ""} />
              </div>
              {/* Urdu on Right */}
              {dynamicUrdu.text_ur && (
                <div className="flex-1 text-right font-urdu text-sm sm:text-base text-indigo-950 leading-loose" dir="rtl">
                  <MathRenderer content={dynamicUrdu.text_ur} />
                </div>
              )}
            </div>
          ) : showEnglish ? (
            <div className="font-bold text-slate-900 text-xs sm:text-sm leading-relaxed">
              <MathRenderer content={enTrans?.text || ""} />
            </div>
          ) : (
            <div className="text-right font-urdu text-sm sm:text-base text-indigo-950 leading-loose" dir="rtl">
              <MathRenderer content={dynamicUrdu.text_ur || enTrans?.text || ""} />
            </div>
          )}
        </div>
      </div>

      {/* Options Grid (for MCQs) */}
      {question.type === "mcq" && optionsEn.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {optionsEn.map((optEn, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isCorrect = question.correct_option === optIdx + 1;
            const optUr = optionsUr[optIdx];

            return (
              <div
                key={optIdx}
                className={`p-2 rounded-xl flex items-center justify-between gap-1.5 text-[11px] transition-colors ${
                  isCorrect
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 font-extrabold border-2 border-emerald-400 shadow-2xs"
                    : "text-slate-700 bg-slate-50 border border-slate-200/80 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                      isCorrect
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="truncate">{optEn}</span>
                </div>
                {languageMode === "Bilingual" && optUr && (
                  <span className="font-urdu text-xs text-slate-800 shrink-0 pr-1" dir="rtl">
                    {optUr}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
