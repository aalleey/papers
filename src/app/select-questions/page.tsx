"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Question,
  Chapter,
  Topic,
  Subject,
  ClassItem,
  Course,
  ClientUser,
  SubscriptionPlanId,
  SUBSCRIPTION_PLANS,
  getPlanPermissions,
  isPaidSubscriber,
  QuestionReportCategory,
} from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import { getUrduTranslation } from "@/lib/urdu-translations";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { BrandLogo } from "@/components/BrandLogo";
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
  ShieldCheck,
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
  GraduationCap,
  CirclePlus,
  Search,
  Brain,
  Loader2,
  Plus,
  Flag,
  AlertTriangle,
} from "lucide-react";

interface AiTopicSearchResponse {
  query: string;
  topicTitleEn: string;
  topicTitleUr: string;
  summaryEn: string;
  summaryUr: string;
  boardImportance: string;
  keyConcepts: string[];
  dbMatchCount: number;
  aiGeneratedCount: number;
  questions: Question[];
}

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
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [allSubjectsList, setAllSubjectsList] = useState<Subject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
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
  const [showManualQuestionModal, setShowManualQuestionModal] = useState(false);
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
  const [manualQuestion, setManualQuestion] = useState({
    type: "short" as Question["type"],
    text: "",
    marks: 2,
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: 1,
  });

  // Persistent map of all seen questions (across chapters + AI topic searches) so selections are never lost
  const [knownQuestionsMap, setKnownQuestionsMap] = useState<Record<string, Question>>({});

  // AI Topic Search state
  const [aiTopicQuery, setAiTopicQuery] = useState("");
  const [sidebarTopicSearch, setSidebarTopicSearch] = useState("");
  const [aiQuestionType, setAiQuestionType] = useState<"all" | "mcq" | "short" | "long">("all");
  const [aiDifficulty, setAiDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState<AiTopicSearchResponse | null>(null);
  const [showAiResultsMode, setShowAiResultsMode] = useState(false);

  const [authChecked, setAuthChecked] = useState(false);

  // Flagged Question Error Reporting State
  const [reportingQuestion, setReportingQuestion] = useState<Question | null>(null);
  const [reportCategory, setReportCategory] = useState<QuestionReportCategory>("wrong_answer");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSuggestedFix, setReportSuggestedFix] = useState("");
  const [reportSuggestedOption, setReportSuggestedOption] = useState<number | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportedQuestionIds, setReportedQuestionIds] = useState<Set<string>>(new Set());
  const [reportToast, setReportToast] = useState<string | null>(null);

  const openReportModal = (q: Question) => {
    setReportingQuestion(q);
    setReportCategory(q.type === "mcq" ? "wrong_answer" : "typo");
    setReportDescription("");
    const en = q.translations?.find((t) => t.language === "en");
    setReportSuggestedFix(en?.text || "");
    setReportSuggestedOption(q.type === "mcq" ? (q.correct_option || 1) : null);
  };

  const handleSubmitQuestionReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingQuestion) return;
    try {
      setSubmittingReport(true);
      const en = reportingQuestion.translations?.find((t) => t.language === "en");
      const ur = reportingQuestion.translations?.find((t) => t.language === "ur");
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: reportingQuestion.id,
          chapterId: reportingQuestion.chapter_id || currentChapter?.id || null,
          subjectName: currentSubject?.name || null,
          chapterTitle: currentChapter
            ? `Unit-${currentChapter.number}: ${currentChapter.title}`
            : null,
          questionType: reportingQuestion.type,
          questionSnapshot: {
            textEn: en?.text || "",
            textUr: ur?.text || null,
            optionsEn: Array.isArray(en?.options) ? en?.options : null,
            optionsUr: Array.isArray(ur?.options) ? ur?.options : null,
            correctOption: reportingQuestion.correct_option ?? null,
            answerEn: en?.answer || null,
            answerUr: ur?.answer || null,
            marks: reportingQuestion.marks || 1,
          },
          category: reportCategory,
          description:
            reportDescription.trim() ||
            `Flagged ${reportCategory.replace("_", " ")} during paper preparation`,
          suggestedFix:
            reportSuggestedFix.trim() && reportSuggestedFix.trim() !== (en?.text || "").trim()
              ? reportSuggestedFix.trim()
              : null,
          suggestedCorrectOption:
            reportingQuestion.type === "mcq" && reportCategory === "wrong_answer"
              ? reportSuggestedOption
              : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit report");
      setReportedQuestionIds((prev) => new Set(prev).add(reportingQuestion.id));
      setReportingQuestion(null);
      setReportToast("Question flagged & sent to Admin Review Queue for 1-click fix!");
      setTimeout(() => setReportToast(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Load questions for a specific class, subject, and chapter (Only accessible if logged in)
  async function loadQuestionsData(
    classOverride?: string,
    subjectOverride?: string,
    chapterOverride?: string
  ) {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams(window.location.search);
      const urlClassId = searchParams.get("class_id") || searchParams.get("classId");
      const urlSubId = searchParams.get("subject_id") || searchParams.get("subjectId");
      const urlChap = searchParams.get("chapter");
      const urlChapId = searchParams.get("chapter_id") || searchParams.get("chapterId");

      let targetClassId = classOverride !== undefined ? classOverride : (urlClassId || selectedClassId || "");
      let targetSubId = subjectOverride !== undefined ? subjectOverride : (urlSubId || currentSubject?.id || "");
      let targetChapId = chapterOverride !== undefined ? chapterOverride : (urlChapId || "");

      if (urlChap === "1" && !targetChapId) targetChapId = "81fef04e-6a53-5018-9051-fdb1c36775d9";
      if (urlChap === "2" && !targetChapId) targetChapId = "68fc022a-f4b1-53f8-a133-2946135d88db";
      if (urlChap === "3" && !targetChapId) targetChapId = "bd6c341e-e709-5551-959a-84c2a20e57f5";
      if (urlChap === "8" && !targetChapId) targetChapId = "ac5b38de-123c-51fc-a96b-1ecaff9762ce";

      const queryParams = new URLSearchParams();
      if (targetSubId) queryParams.set("subject_id", targetSubId);
      if (targetChapId) queryParams.set("chapter_id", targetChapId);

      const res = await fetch(`/api/paper/questions?${queryParams.toString()}`);
      if (res.status === 401) {
        setClientUser(null);
        setAllQuestions([]);
        return;
      }

      const data = await res.json();

      // 1. Process Classes & Courses
      if (data.classes?.length) {
        setClassesList(data.classes);
      }
      if (data.courses?.length) {
        setCoursesList(data.courses);
      }

      // 2. Process All Subjects
      const rawSubjects: Subject[] = data.subjects || [];
      setAllSubjectsList(rawSubjects);

      // Determine active class
      let activeClass = targetClassId;
      if (!activeClass && data.classes?.length) {
        // Find if targetSubId belongs to a course with a class
        if (targetSubId) {
          const matchedSub = rawSubjects.find((s) => s.id === targetSubId);
          if (matchedSub && data.courses) {
            const matchedCourse = data.courses.find((c: Course) => c.id === matchedSub.course_id);
            if (matchedCourse) activeClass = matchedCourse.class_id;
          }
        }
        if (!activeClass) {
          // Default to class 10 if exists, or first class
          const class10 = data.classes.find((c: ClassItem) => c.numeric_order === 10 || c.name.includes("10"));
          activeClass = class10 ? class10.id : data.classes[0].id;
        }
      }
      setSelectedClassId(activeClass);

      // Filter subjects for the active class (via course_id)
      let classFilteredSubjects = rawSubjects;
      if (activeClass && data.courses?.length) {
        const classCourseIds = new Set(
          data.courses.filter((c: Course) => c.class_id === activeClass).map((c: Course) => c.id)
        );
        const filtered = rawSubjects.filter((s) => classCourseIds.has(s.course_id));
        if (filtered.length > 0) {
          classFilteredSubjects = filtered;
        }
      }
      setSubjects(classFilteredSubjects);

      // Determine active Subject
      let activeSub = classFilteredSubjects.find((s: Subject) => s.id === targetSubId);
      if (!activeSub && classFilteredSubjects.length > 0) {
        activeSub = classFilteredSubjects[0];
      }
      setCurrentSubject(activeSub || null);
      targetSubId = activeSub?.id || "";

      // 3. Process Chapters (filter by active subject)
      let availableChapters: Chapter[] = data.chapters || [];
      if (targetSubId && availableChapters.length > 0) {
        const subChapters = availableChapters.filter((c: Chapter) => c.subject_id === targetSubId);
        if (subChapters.length > 0) {
          availableChapters = subChapters;
        }
      }
      setChapters(availableChapters);

      let activeCh = availableChapters.find((c: Chapter) => c.id === targetChapId);
      if (!activeCh && availableChapters.length > 0) {
        activeCh = availableChapters[0];
      }
      setCurrentChapter(activeCh || null);

      if (data.topics?.length) {
        setTopics(data.topics);
      } else {
        setTopics([]);
      }

      // 3. Process Questions
      if (data.questions?.length) {
        setAllQuestions(data.questions);
        setKnownQuestionsMap((prev) => {
          const next = { ...prev };
          for (const q of data.questions as Question[]) {
            next[q.id] = q;
          }
          return next;
        });
      } else {
        setAllQuestions([]);
      }

      // Restore cached selected question objects from sessionStorage if present
      const savedQJson = sessionStorage.getItem("papermaker_selected_questions");
      if (savedQJson) {
        try {
          const parsedQs = JSON.parse(savedQJson);
          if (Array.isArray(parsedQs) && parsedQs.length > 0) {
            setKnownQuestionsMap((prev) => {
              const next = { ...prev };
              for (const q of parsedQs as Question[]) {
                if (q && q.id) next[q.id] = q;
              }
              return next;
            });
          }
        } catch {
          // ignore
        }
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
          // If account is on hold pending admin verification, redirect to verification pending screen
          if (
            authData.client.subscription?.status === "pending_verification" ||
            authData.client.isVerified === false
          ) {
            router.push("/verification-pending");
            return;
          }
          setClientUser(authData.client);
          await loadQuestionsData();

          // If navigated with ?ai_topic=... in URL, automatically run AI Topic Search
          const urlTopic = new URLSearchParams(window.location.search).get("ai_topic");
          if (urlTopic && urlTopic.trim()) {
            setAiTopicQuery(urlTopic.trim());
            handleAiTopicSearch(urlTopic.trim());
          }
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

  // Run AI Topic Search to find & synthesize questions for any topic
  async function handleAiTopicSearch(overrideQuery?: string) {
    const targetQuery = (overrideQuery !== undefined ? overrideQuery : aiTopicQuery).trim();
    if (!targetQuery) return;

    try {
      setAiSearchLoading(true);
      const activeClassName =
        classesList.find((c) => c.id === selectedClassId)?.name || "Class 10th";
      const activeSubjectName = currentSubject?.name || "Computer Science";

      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: targetQuery,
          className: activeClassName,
          subjectName: activeSubjectName,
          chapterId: currentChapter?.id || "",
          questionType: aiQuestionType,
          difficulty: aiDifficulty,
          mcqCount: 6,
          shortCount: 5,
          longCount: 2,
          includeDbMatches: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.questions) {
        setAiSearchResult(data);
        setShowAiResultsMode(true);
        setKnownQuestionsMap((prev) => {
          const next = { ...prev };
          for (const q of data.questions as Question[]) {
            next[q.id] = q;
          }
          return next;
        });
      }
    } catch (err) {
      console.error("AI Topic Search failed:", err);
    } finally {
      setAiSearchLoading(false);
    }
  }

  // Suggested high-yield topics based on active subject
  const suggestedAiTopics = useMemo(() => {
    const subLower = (currentSubject?.name || "").toLowerCase();
    if (subLower.includes("physics")) {
      return [
        "Simple Harmonic Motion",
        "Ohm's Law & Resistance",
        "Reflection & Lenses",
        "Electrostatics & Coulomb's Law",
        "Logic Gates & Digital Electronics",
        "Atomic & Nuclear Physics",
      ];
    }
    if (subLower.includes("chemistry")) {
      return [
        "Chemical Equilibrium",
        "Acids, Bases and Salts",
        "Organic Chemistry & Hydrocarbons",
        "Biochemistry & Carbohydrates",
        "Atmospheric Pollution",
        "Water Hardness",
      ];
    }
    if (subLower.includes("biology")) {
      return [
        "Gaseous Exchange in Humans",
        "Homeostasis & Kidney",
        "Coordination & Nervous System",
        "Inheritance & Mendel's Laws",
        "Biotechnology & Fermentation",
        "Cell Division (Mitosis)",
      ];
    }
    if (subLower.includes("math")) {
      return [
        "Quadratic Equations & Formula",
        "Theory of Quadratic Equations",
        "Partial Fractions",
        "Sets and Functions",
        "Trigonometric Identities",
        "Circle Theorems",
      ];
    }
    return [
      "Operating System & Kernel",
      "Problem Solving & Flowcharts",
      "Loops & Control Structures in C",
      "Arrays & Data Structures",
      "System Recovery & Maintenance",
      "Digital Entrepreneurship",
    ];
  }, [currentSubject]);

  // Filtered sidebar topics based on sidebarTopicSearch
  const filteredSidebarTopics = useMemo(() => {
    const q = sidebarTopicSearch.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.title_ur && t.title_ur.includes(sidebarTopicSearch.trim()))
    );
  }, [topics, sidebarTopicSearch]);

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

  async function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("class_id", classId);
    newUrl.searchParams.delete("subject_id");
    newUrl.searchParams.delete("chapter_id");
    newUrl.searchParams.delete("chapter");
    window.history.replaceState({}, "", newUrl.toString());
    await loadQuestionsData(classId, "", "");
  }

  async function handleSubjectChange(subjectId: string) {
    const sub = subjects.find((s) => s.id === subjectId) || allSubjectsList.find((s) => s.id === subjectId);
    if (!sub) return;
    setCurrentSubject(sub);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("subject_id", sub.id);
    newUrl.searchParams.delete("chapter_id");
    newUrl.searchParams.delete("chapter");
    window.history.replaceState({}, "", newUrl.toString());
    await loadQuestionsData(selectedClassId, sub.id, "");
  }

  async function handleChapterChange(chapterId: string) {
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    setCurrentChapter(ch);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("chapter_id", ch.id);
    window.history.replaceState({}, "", newUrl.toString());
    await loadQuestionsData(selectedClassId, currentSubject?.id || ch.subject_id, ch.id);
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

  // Active question pool (either AI Topic Search results or current Chapter questions)
  const activeQuestionPool = useMemo(() => {
    if (showAiResultsMode && aiSearchResult) {
      return aiSearchResult.questions;
    }
    return allQuestions;
  }, [showAiResultsMode, aiSearchResult, allQuestions]);

  // Filtered Questions based on active filters
  const filteredQuestions = useMemo(() => {
    return activeQuestionPool.filter((q) => {
      // If viewing only selected across all chapters/AI searches, use active pool + known selected
      if (viewOnlySelected && !selectedIds.has(q.id)) {
        return false;
      }

      // When in Chapter mode, apply chapter topic filter
      if (!showAiResultsMode) {
        if (!selectedTopicFilters.has("ALL")) {
          if (selectedTopicFilters.has("exercise_source")) {
            if (q.source !== "exercise") return false;
          } else if (!q.topic_id || !selectedTopicFilters.has(q.topic_id)) {
            return false;
          }
        }
      }

      // Source Filter
      if (sourceFilter === "exercise" && q.source !== "exercise") return false;
      if (sourceFilter === "additional" && q.source !== "extra") return false;
      if (sourceFilter === "board" && q.source !== "past_paper") return false;

      // Skip ALP Filter
      if (skipALP && (q.concept_tag?.toLowerCase().includes("alp") || q.source_ref?.toLowerCase().includes("alp"))) {
        return false;
      }

      return true;
    });
  }, [activeQuestionPool, showAiResultsMode, selectedTopicFilters, sourceFilter, skipALP, viewOnlySelected, selectedIds]);

  // Split into categories
  const mcqQuestions = useMemo(() => filteredQuestions.filter((q) => q.type === "mcq"), [filteredQuestions]);
  const shortQuestions = useMemo(() => filteredQuestions.filter((q) => q.type === "short"), [filteredQuestions]);
  const longQuestions = useMemo(() => filteredQuestions.filter((q) => q.type === "long"), [filteredQuestions]);

  // Selected counts breakdown (across both chapter questions and AI-searched questions!)
  const selectedCounts = useMemo(() => {
    let mcq = 0;
    let short = 0;
    let long = 0;
    for (const id of selectedIds) {
      const q = knownQuestionsMap[id] || allQuestions.find((item) => item.id === id);
      if (q) {
        if (q.type === "mcq") mcq++;
        else if (q.type === "short") short++;
        else if (q.type === "long") long++;
      }
    }
    return { mcq, short, long, total: selectedIds.size };
  }, [selectedIds, knownQuestionsMap, allQuestions]);

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

  const addManualQuestion = () => {
    const text = manualQuestion.text.trim();
    if (!text) return;
    const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const options = [manualQuestion.optionA, manualQuestion.optionB, manualQuestion.optionC, manualQuestion.optionD]
      .map((option) => option.trim());
    const question: Question = {
      id,
      chapter_id: currentChapter?.id || "manual",
      topic_id: null,
      type: manualQuestion.type,
      source: "extra",
      source_ref: "Manually added",
      source_note: null,
      concept_tag: "Manual question",
      correct_option: manualQuestion.type === "mcq" ? manualQuestion.correctOption : null,
      marks: Math.max(1, Number(manualQuestion.marks) || 1),
      difficulty: "medium",
      is_active: true,
      translations: [{ language: "en", text, options: manualQuestion.type === "mcq" ? options : null, answer: null }],
    };
    setAllQuestions((previous) => [...previous, question]);
    setSelectedIds((previous) => new Set([...previous, id]));
    setManualQuestion({ type: "short", text: "", marks: 2, optionA: "", optionB: "", optionC: "", optionD: "", correctOption: 1 });
    setShowManualQuestionModal(false);
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

    const selectedList: Question[] = [];
    for (const id of selectedIds) {
      const q = knownQuestionsMap[id] || allQuestions.find((item) => item.id === id);
      if (q) selectedList.push(q);
    }
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
                      await loadQuestionsData();
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
                      await loadQuestionsData();
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
              await loadQuestionsData();
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
              await loadQuestionsData();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#f0fdf4] to-[#fdf4ff] text-slate-800 font-sans pb-36 selection:bg-indigo-500 selection:text-white relative">
      {/* Ambient color blobs for depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/[0.07] via-indigo-400/[0.05] to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-emerald-400/[0.07] via-teal-400/[0.04] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[500px] bg-gradient-to-tr from-violet-400/[0.06] via-fuchsia-400/[0.04] to-transparent rounded-full blur-3xl" />
        <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-amber-400/[0.05] via-orange-400/[0.03] to-transparent rounded-full blur-3xl" />
      </div>
      {/* =========================================================================
          TOP SMART HEADER (TRANSPARENT 3D GLASS COMMAND BAR + FILTER TOOLBAR)
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-2xl border-b border-white/80 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.14),inset_0_2px_1px_0_rgba(255,255,255,0.95)] transition-all duration-200 max-h-[80vh] overflow-y-auto md:max-h-none md:overflow-visible">
        {/* Top Transparent 3D Glass Navbar Row */}
        <div className="border-b border-slate-200/60 bg-white/60 backdrop-blur-xl">
          <div className="max-w-[1700px] mx-auto px-2.5 sm:px-6 h-14 sm:h-15 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="p-2 rounded-xl bg-white/80 hover:bg-white border border-white text-slate-700 hover:text-slate-950 shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 shrink-0"
                title="Back to Homepage"
                id="btn-back-home"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <BrandLogo
                size="sm"
                variant="compact"
                className="hidden sm:inline-flex pr-3 border-r border-slate-300/70"
              />

              <div className="flex items-center gap-2 min-w-0 truncate">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 truncate">
                  <span className="truncate">
                    {currentSubject ? currentSubject.name : "Questions"}
                  </span>
                  {currentSubject?.name_ur && (
                    <span className="font-urdu text-emerald-700 text-sm shrink-0">{currentSubject.name_ur}</span>
                  )}
                </h1>
                <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold truncate">
                  <span aria-hidden="true">·</span>
                  <span>{classesList.find((c) => c.id === selectedClassId)?.name || "Class 10th"}</span>
                  {currentChapter && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-bold truncate">
                        Unit-{currentChapter.number}: {currentChapter.title}
                      </span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Right Quick Action 3D Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/quick-paper"
                id="btn-header-quick-paper"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white border border-white text-slate-800 text-xs font-bold shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap"
                title="Create or Paste Instant Paper"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quick Paper</span>
              </Link>

              {clientUser?.email?.toLowerCase() === "ali.khaliq50@gmail.com" && (
                <Link
                  href="/admin/users"
                  id="btn-header-admin-panel"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-[0_3px_0_0_#c7d2fe,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap"
                  title="Open Admin Panel"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Admin Panel</span>
                </Link>
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
                className="px-3 py-1.5 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white text-xs font-bold shadow-[0_3px_0_0_#065f46,0_6px_12px_-2px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap"
                title="Quick Auto Pick (10 MCQs, 5 Shorts, 2 Longs)"
              >
                <Zap className="w-3.5 h-3.5 text-white" />
                <span>Auto Pick</span>
                {!clientUser?.subscription?.canAutoBoardPattern && <Lock className="w-3 h-3 text-white" />}
              </button>

              <button
                onClick={() => setShowCustomModal(true)}
                className="px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white border border-white text-slate-800 text-xs font-bold shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Custom</span>
              </button>

              <button
                onClick={() => setShowManualQuestionModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 text-white text-xs font-bold shadow-[0_3px_0_0_#3730a3,inset_0_1px_0_rgba(255,255,255,.35)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap"
                title="Add a question manually"
              >
                <CirclePlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Question</span>
              </button>

              <button
                onClick={() => setSelectedIds(new Set())}
                disabled={selectedIds.size === 0}
                className="p-1.5 rounded-xl bg-white/85 hover:bg-rose-50 border border-white text-slate-500 hover:text-rose-600 shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold transition-all"
                title="Clear selection"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {clientUser ? (
                <div className="flex items-center gap-1.5 bg-white/85 border border-white rounded-xl px-2.5 py-1 shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff]">
                  <button
                    onClick={() => {
                      setSubModalTitle("Manage Subscription Plan");
                      setSubModalSubtitle(`Current Plan: ${clientUser.subscription.planName}. Choose a plan below to upgrade or renew.`);
                      setSubModalHighlight(clientUser.subscription.planId);
                      setShowSubModal(true);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 whitespace-nowrap"
                    title="Click to view plans or upgrade"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">{clientUser.subscription.planName}</span>
                  </button>

                  {clientUser.subscription.planId === "free" && (
                    <button
                      onClick={() => {
                        setSubModalTitle("Upgrade Your Plan");
                        setSubModalSubtitle("Unlock Auto Board Pattern Generator, full papers, academy branding, and answer keys!");
                        setSubModalHighlight("standard");
                        setShowSubModal(true);
                      }}
                      className="px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold transition-colors"
                    >
                      Upgrade
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="relative overflow-hidden px-3 py-1.5 rounded-xl bg-gradient-to-b from-white/85 via-white/60 to-slate-100/70 hover:from-white/95 hover:to-white/85 backdrop-blur-2xl saturate-150 border border-white/90 text-slate-900 text-xs font-extrabold shadow-[0_3px_0_0_rgba(203,213,225,0.9),0_6px_14px_-3px_rgba(15,23,42,0.14),inset_0_2px_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 flex items-center gap-1.5 transition-all duration-150 whitespace-nowrap cursor-pointer"
                    id="btn-client-login"
                  >
                    <span
                      className="pointer-events-none absolute inset-x-1 top-0.5 h-2 rounded-t-full bg-gradient-to-b from-white/90 to-transparent"
                      aria-hidden="true"
                    />
                    <LogIn className="w-3.5 h-3.5 text-emerald-600 relative z-10" />
                    <span className="relative z-10">Sign In</span>
                  </button>
                  <Link
                    href="/register"
                    className="relative overflow-hidden hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-emerald-400/90 via-emerald-500/85 to-teal-600/90 hover:from-emerald-300/95 hover:to-teal-500/95 backdrop-blur-2xl saturate-200 border border-emerald-200/90 text-white text-xs font-extrabold shadow-[0_3px_0_0_#065f46,0_8px_18px_-3px_rgba(16,185,129,0.45),inset_0_2px_2px_0_rgba(255,255,255,0.8)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap"
                  >
                    <span
                      className="pointer-events-none absolute inset-x-1 top-0.5 h-2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent"
                      aria-hidden="true"
                    />
                    <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(6,95,70,0.6)]">Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {!headerCollapsed && (
          <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3 space-y-3">

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

            {/* Class, Subject & Chapter Navigation Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
              {/* Class & Subject Selectors */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
                {/* 1. Class Selector */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 hidden sm:flex items-center gap-1 shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Class:</span>
                  </span>
                  <select
                    value={selectedClassId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full sm:w-auto font-black text-slate-800 text-xs sm:text-sm bg-gradient-to-r from-blue-50/90 to-indigo-50/70 hover:bg-blue-100/70 px-2.5 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs sm:min-w-[110px] truncate"
                    id="select-class-dropdown"
                  >
                    {classesList.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Subject Selector */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 hidden sm:flex items-center gap-1 shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Subject:</span>
                  </span>
                  <select
                    value={currentSubject?.id || ""}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full sm:w-auto font-black text-slate-800 text-xs sm:text-sm bg-gradient-to-r from-indigo-50/80 to-blue-50/60 hover:bg-indigo-100/70 px-2.5 py-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs sm:min-w-[150px] truncate"
                    id="select-subject-dropdown"
                  >
                    {subjects.length === 0 ? (
                      <option value="">No subjects in class</option>
                    ) : (
                      subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} {sub.name_ur ? `(${sub.name_ur})` : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Chapter Navigation & Selector */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 lg:max-w-2xl lg:justify-end">
                <button
                  onClick={() => {
                    if (!currentChapter) return;
                    const curIdx = chapters.findIndex((c) => c.id === currentChapter.id);
                    if (curIdx > 0) handleChapterChange(chapters[curIdx - 1].id);
                  }}
                  disabled={!currentChapter || chapters.findIndex((c) => c.id === currentChapter.id) <= 0}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-gradient-to-b from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 font-extrabold text-xs transition-all disabled:cursor-not-allowed shadow-sm shrink-0 flex items-center gap-1 cursor-pointer"
                  id="btn-prev-chapter"
                  title="Previous Chapter"
                >
                  <span>&larr;</span>
                  <span className="hidden md:inline">Prev</span>
                </button>

                <div className="flex-1 min-w-0 text-center">
                  <select
                    value={currentChapter?.id || ""}
                    onChange={(e) => handleChapterChange(e.target.value)}
                    className="w-full max-w-full truncate font-black text-slate-800 text-xs sm:text-sm bg-gradient-to-r from-slate-50 to-indigo-50/50 hover:bg-slate-100 px-2.5 sm:px-3 py-2 rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-center shadow-xs"
                    id="select-chapter-dropdown"
                  >
                    {chapters.length === 0 ? (
                      <option value="">No chapters available</option>
                    ) : (
                      chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          Unit-{ch.number}: {ch.title} {ch.title_ur ? `(${ch.title_ur})` : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <button
                  onClick={() => {
                    if (!currentChapter) return;
                    const curIdx = chapters.findIndex((c) => c.id === currentChapter.id);
                    if (curIdx < chapters.length - 1) handleChapterChange(chapters[curIdx + 1].id);
                  }}
                  disabled={!currentChapter || chapters.findIndex((c) => c.id === currentChapter.id) >= chapters.length - 1}
                  className="px-2.5 sm:px-3 py-2 rounded-xl bg-gradient-to-b from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 font-extrabold text-xs transition-all disabled:cursor-not-allowed shadow-sm shrink-0 flex items-center gap-1 cursor-pointer"
                  id="btn-next-chapter"
                  title="Next Chapter"
                >
                  <span className="hidden md:inline">Next</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            {/* =========================================================================
                AI SMART TOPIC SEARCH & QUESTION DISCOVERY BAR
                ========================================================================= */}
            <div className="pt-2.5 border-t border-indigo-100/80">
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 rounded-2xl p-2.5 sm:p-3 border border-indigo-500/30 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.25),inset_0_1px_0_rgba(255,255,255,0.18)] text-white">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
                  {/* Search Input */}
                  <div className="relative flex-1 flex items-center">
                    <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    </div>
                    <input
                      type="text"
                      value={aiTopicQuery}
                      onChange={(e) => setAiTopicQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAiTopicSearch();
                        }
                      }}
                      placeholder="AI Topic Search: Type any topic or concept (e.g., 'Flowcharts', 'Ohm's Law', 'Quadratic Formula', 'Operating System')..."
                      className="w-full pl-9 pr-9 py-2 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/15 border border-white/20 focus:border-emerald-400 text-xs sm:text-sm font-bold text-white placeholder:text-slate-300/80 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 transition-all"
                      id="input-ai-topic-search"
                    />
                    {aiTopicQuery && (
                      <button
                        onClick={() => {
                          setAiTopicQuery("");
                          if (showAiResultsMode) {
                            setShowAiResultsMode(false);
                          }
                        }}
                        className="absolute right-2.5 p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Clear AI topic search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filters & Trigger Button */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-nowrap items-center gap-1.5 sm:gap-2 shrink-0">
                    <select
                      value={aiQuestionType}
                      onChange={(e) => setAiQuestionType(e.target.value as any)}
                      className="px-2 sm:px-2.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-[11px] sm:text-xs font-bold focus:outline-none focus:border-emerald-400 cursor-pointer w-full sm:w-auto truncate"
                      title="Filter AI Search by Question Type"
                    >
                      <option value="all" className="text-slate-900">All Types (MCQ+Short+Long)</option>
                      <option value="mcq" className="text-slate-900">MCQs Only</option>
                      <option value="short" className="text-slate-900">Short Questions Only</option>
                      <option value="long" className="text-slate-900">Long Questions Only</option>
                    </select>

                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as any)}
                      className="px-2 sm:px-2.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-[11px] sm:text-xs font-bold focus:outline-none focus:border-emerald-400 cursor-pointer w-full sm:w-auto truncate"
                      title="Filter AI Search by Difficulty"
                    >
                      <option value="all" className="text-slate-900">All Difficulties</option>
                      <option value="easy" className="text-slate-900">Easy / Conceptual</option>
                      <option value="medium" className="text-slate-900">Medium / Board Standard</option>
                      <option value="hard" className="text-slate-900">Hard / Analytical SLO</option>
                    </select>

                    <button
                      onClick={() => handleAiTopicSearch()}
                      disabled={aiSearchLoading || !aiTopicQuery.trim()}
                      id="btn-ai-topic-search"
                      className="col-span-2 sm:col-span-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {aiSearchLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                          <span>Searching Topic...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>AI Search Topic</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Suggested Topic Chips */}
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
                  <span className="font-extrabold text-emerald-300 shrink-0 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    <span>Quick Topics:</span>
                  </span>
                  {suggestedAiTopics.map((topicChip) => {
                    const isActiveChip =
                      showAiResultsMode &&
                      aiSearchResult?.query.toLowerCase() === topicChip.toLowerCase();
                    return (
                      <button
                        key={topicChip}
                        onClick={() => {
                          setAiTopicQuery(topicChip);
                          handleAiTopicSearch(topicChip);
                        }}
                        className={`px-2.5 py-0.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                          isActiveChip
                            ? "bg-emerald-400 text-slate-950 shadow-xs"
                            : "bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15"
                        }`}
                      >
                        {topicChip}
                      </button>
                    );
                  })}
                  {showAiResultsMode && (
                    <button
                      onClick={() => setShowAiResultsMode(false)}
                      className="ml-auto px-2.5 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 font-extrabold shrink-0 cursor-pointer"
                    >
                      &larr; Back to Chapter Questions
                    </button>
                  )}
                </div>
              </div>
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
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 flex items-center justify-between text-xs font-black text-white"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-200" />
              <span>Filter by Topic ({topics.length} Topics Available)</span>
              {!selectedTopicFilters.has("ALL") && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black">
                  Filtered
                </span>
              )}
            </div>
            {mobileTopicsOpen ? <ChevronUp className="w-4 h-4 text-indigo-200" /> : <ChevronDown className="w-4 h-4 text-indigo-200" />}
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

        {/* DESKTOP VERTICAL SIDEBAR: TOPIC FILTER + AI TOPIC DISCOVERY */}
        <aside className="hidden lg:block w-72 xl:w-80 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-indigo-200/80 shadow-lg shadow-indigo-500/10 overflow-hidden shrink-0 sticky top-28">
          <div className="px-4 py-3.5 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 text-white flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-indigo-200" />
              Topics &amp; AI Search
            </span>
            <button
              onClick={() => {
                setSelectedTopicFilters(new Set(["ALL"]));
                setSidebarTopicSearch("");
                setShowAiResultsMode(false);
              }}
              className="text-[10px] text-indigo-200 hover:text-white font-bold underline transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Sidebar Topic Search & AI Trigger */}
          <div className="p-2.5 bg-indigo-50/50 border-b border-indigo-100 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={sidebarTopicSearch}
                onChange={(e) => setSidebarTopicSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && sidebarTopicSearch.trim()) {
                    setAiTopicQuery(sidebarTopicSearch.trim());
                    handleAiTopicSearch(sidebarTopicSearch.trim());
                  }
                }}
                placeholder="Filter or AI search any topic..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {sidebarTopicSearch && (
                <button
                  onClick={() => setSidebarTopicSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {sidebarTopicSearch.trim() && (
              <button
                onClick={() => {
                  const q = sidebarTopicSearch.trim();
                  setAiTopicQuery(q);
                  handleAiTopicSearch(q);
                }}
                disabled={aiSearchLoading}
                className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-200" />
                <span className="truncate">AI Search &ldquo;{sidebarTopicSearch.trim()}&rdquo;</span>
              </button>
            )}
          </div>

          <ul className="divide-y divide-slate-100 text-xs max-h-[calc(100vh-280px)] overflow-y-auto">
            {/* Active AI Topic Search Item */}
            {aiSearchResult && (
              <li
                onClick={() => setShowAiResultsMode(true)}
                className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                  showAiResultsMode
                    ? "bg-gradient-to-r from-emerald-50 to-teal-50 font-black text-emerald-950 border-l-4 border-emerald-600"
                    : "bg-emerald-50/40 hover:bg-emerald-50 text-emerald-900"
                }`}
              >
                <div className="flex items-center gap-2 pr-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="block font-black text-xs truncate">
                      AI: {aiSearchResult.topicTitleEn}
                    </span>
                    <span className="block text-[10px] text-emerald-700 font-semibold">
                      Click to view topic questions
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black shrink-0">
                  {aiSearchResult.questions.length}
                </span>
              </li>
            )}

            {/* All Topics */}
            <li
              onClick={() => {
                setShowAiResultsMode(false);
                toggleTopic("ALL");
              }}
              className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                !showAiResultsMode && selectedTopicFilters.has("ALL")
                  ? "bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent font-black text-indigo-950 border-l-4 border-indigo-600"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={!showAiResultsMode && selectedTopicFilters.has("ALL")}
                  readOnly
                  className="rounded text-indigo-600 pointer-events-none h-4 w-4"
                />
                <span className="font-extrabold">All Chapter Topics</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-2xs ${
                !showAiResultsMode && selectedTopicFilters.has("ALL")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-indigo-100 text-indigo-800"
              }`}>
                {allQuestions.length}
              </span>
            </li>

            {/* Individual Topics */}
            {filteredSidebarTopics.map((t, idx) => {
              const isSelected = !showAiResultsMode && selectedTopicFilters.has(t.id);
              const count = topicCounts[t.id] || 0;
              // Cycle through subtle badge hues for visual richness
              const badgeColors = [
                "bg-blue-50 text-blue-700 border-blue-200",
                "bg-emerald-50 text-emerald-700 border-emerald-200",
                "bg-purple-50 text-purple-700 border-purple-200",
                "bg-amber-50 text-amber-700 border-amber-200",
                "bg-teal-50 text-teal-700 border-teal-200",
              ];
              const topicColorClass = badgeColors[idx % badgeColors.length];

              return (
                <li
                  key={t.id}
                  onClick={() => {
                    setShowAiResultsMode(false);
                    toggleTopic(t.id);
                  }}
                  className={`group px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-transparent font-black text-indigo-950 border-l-4 border-indigo-600"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 pr-2 leading-tight min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded text-indigo-600 pointer-events-none shrink-0 h-4 w-4"
                    />
                    <span className="line-clamp-2 font-medium">
                      {/^\d+\./.test(t.title) ? t.title : `${currentChapter?.number || 2}.${t.number} ${t.title}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAiTopicQuery(t.title);
                        handleAiTopicSearch(t.title);
                      }}
                      title={`Generate & find more questions on "${t.title}" with AI`}
                      className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black transition-all flex items-center gap-0.5 shadow-2xs hover:scale-105"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>AI</span>
                    </button>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-black border transition-colors shrink-0 ${
                        isSelected
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-2xs"
                          : topicColorClass
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                </li>
              );
            })}

            {/* Exercise Filter */}
            <li
              onClick={() => {
                setShowAiResultsMode(false);
                toggleTopic("exercise_source");
              }}
              className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                !showAiResultsMode && selectedTopicFilters.has("exercise_source")
                  ? "bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent font-black text-emerald-950 border-l-4 border-emerald-600"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={!showAiResultsMode && selectedTopicFilters.has("exercise_source")}
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
          {/* =========================================================================
              AI TOPIC SEARCH INTELLIGENCE BANNER (SHOWN WHEN AI SEARCH IS ACTIVE)
              ========================================================================= */}
          {showAiResultsMode && aiSearchResult && (
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 rounded-2xl p-4 sm:p-6 text-white border border-emerald-500/40 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      AI Topic Search Results
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                      {aiSearchResult.boardImportance}
                    </span>
                    {aiSearchResult.dbMatchCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[11px] font-bold">
                        {aiSearchResult.dbMatchCount} Bank Matches
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-bold">
                      {aiSearchResult.aiGeneratedCount} AI Board Questions
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-3 pt-1">
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                      {aiSearchResult.topicTitleEn}
                    </h2>
                    {aiSearchResult.topicTitleUr && (
                      <span className="font-urdu text-base sm:text-xl text-emerald-300">
                        {aiSearchResult.topicTitleUr}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {aiSearchResult.summaryEn}
                  </p>
                </div>

                {/* Batch Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => selectAllInGroup(aiSearchResult.questions)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {aiSearchResult.questions.every((q) => selectedIds.has(q.id))
                        ? "Deselect Topic Questions"
                        : `Select All (${aiSearchResult.questions.length})`}
                    </span>
                  </button>

                  <button
                    onClick={() => handleAiTopicSearch(aiSearchResult.query)}
                    disabled={aiSearchLoading}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${aiSearchLoading ? "animate-spin" : ""}`} />
                    <span>Regenerate</span>
                  </button>

                  <button
                    onClick={() => setShowAiResultsMode(false)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 font-bold text-xs cursor-pointer transition-all"
                  >
                    Back to Chapter
                  </button>
                </div>
              </div>

              {/* Key Sub-Concepts Covered */}
              {aiSearchResult.keyConcepts?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-bold mr-1">Sub-concepts covered:</span>
                  {aiSearchResult.keyConcepts.map((concept, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiTopicQuery(concept);
                        handleAiTopicSearch(concept);
                      }}
                      className="px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-emerald-500/30 border border-white/15 text-emerald-200 font-semibold transition-colors cursor-pointer"
                      title={`Drill down into "${concept}"`}
                    >
                      {concept}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
                <section className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-blue-200/80 shadow-lg shadow-blue-500/10 overflow-hidden ring-1 ring-blue-100">
                  {/* Accordion Header */}
                  <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => setAccordionOpen((prev) => ({ ...prev, mcq: !prev.mcq }))}
                      className="flex items-center gap-2.5 font-black text-sm sm:text-base text-white hover:text-blue-100 transition-colors"
                      id="accordion-toggle-mcq"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-xs font-black border border-white/30 shadow-inner">
                        A
                      </div>
                      <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">Multiple Choice Questions</span>
                      <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-black border border-white/20">
                        {mcqQuestions.length}
                      </span>
                      {accordionOpen.mcq ? <ChevronUp className="w-4 h-4 text-blue-200" /> : <ChevronDown className="w-4 h-4 text-blue-200" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllInGroup(mcqQuestions)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-white/90 hover:bg-white rounded-lg border border-white/80 shadow-md transition-all active:scale-95"
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
                          onReport={() => openReportModal(q)}
                          isReported={reportedQuestionIds.has(q.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* SECTION 2: SHORT QUESTIONS (Vibrant Emerald / Teal Theme) */}
              {shortQuestions.length > 0 && (
                <section className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-emerald-200/80 shadow-lg shadow-emerald-500/10 overflow-hidden ring-1 ring-emerald-100">
                  <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => setAccordionOpen((prev) => ({ ...prev, short: !prev.short }))}
                      className="flex items-center gap-2.5 font-black text-sm sm:text-base text-white hover:text-emerald-100 transition-colors"
                      id="accordion-toggle-short"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-xs font-black border border-white/30 shadow-inner">
                        B
                      </div>
                      <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">Short Questions</span>
                      <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-black border border-white/20">
                        {shortQuestions.length}
                      </span>
                      {accordionOpen.short ? <ChevronUp className="w-4 h-4 text-emerald-200" /> : <ChevronDown className="w-4 h-4 text-emerald-200" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllInGroup(shortQuestions)}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-white/90 hover:bg-white rounded-lg border border-white/80 shadow-md transition-all active:scale-95"
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
                          onReport={() => openReportModal(q)}
                          isReported={reportedQuestionIds.has(q.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* SECTION 3: DETAILED / LONG QUESTIONS (Vibrant Violet / Fuchsia Theme) */}
              {longQuestions.length > 0 && (
                <section className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200/80 shadow-lg shadow-purple-500/10 overflow-hidden ring-1 ring-purple-100">
                  <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => setAccordionOpen((prev) => ({ ...prev, long: !prev.long }))}
                      className="flex items-center gap-2.5 font-black text-sm sm:text-base text-white hover:text-purple-100 transition-colors"
                      id="accordion-toggle-long"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-xs font-black border border-white/30 shadow-inner">
                        C
                      </div>
                      <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">Detailed / Long Questions</span>
                      <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-black border border-white/20">
                        {longQuestions.length}
                      </span>
                      {accordionOpen.long ? <ChevronUp className="w-4 h-4 text-purple-200" /> : <ChevronDown className="w-4 h-4 text-purple-200" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllInGroup(longQuestions)}
                        className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-white/90 hover:bg-white rounded-lg border border-white/80 shadow-md transition-all active:scale-95"
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
                          onReport={() => openReportModal(q)}
                          isReported={reportedQuestionIds.has(q.id)}
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
          STICKY BOTTOM BAR (3D LIQUID GLASS DOCK & 100% RESPONSIVE)
          ========================================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-white/90 via-indigo-50/40 to-white/90 backdrop-blur-2xl saturate-150 border-t-2 border-indigo-100/80 shadow-[0_-12px_35px_-8px_rgba(15,23,42,0.18),inset_0_2px_2px_0_#ffffff] py-2.5 sm:py-3 px-3 sm:px-8">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
          {/* Counters row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs font-bold text-slate-800 w-full sm:w-auto">
            <span className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-xl border-2 border-blue-200/80 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-white/95 via-white/90 to-white/95 backdrop-blur-2xl saturate-150 border-t border-white/90 shadow-[0_-12px_35px_-8px_rgba(15,23,42,0.14),inset_0_2px_2px_0_#ffffff] py-2 sm:py-3 px-2.5 sm:px-8">
        <div className="max-w-[1700px] mx-auto flex flex-wrap sm:flex-row items-center justify-between gap-2 sm:gap-4">
          {/* Counters row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-bold text-slate-800 w-full sm:w-auto">
            <span className="flex items-center gap-1 bg-blue-50/90 px-2 sm:px-2.5 py-1 rounded-xl border border-blue-200/80 shadow-2xs">
              <span className="text-slate-600">MCQs:</span>
              <span className="font-black text-blue-700 tabular-nums text-sm">{selectedCounts.mcq}</span>
            </span>

            <span className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1.5 rounded-xl border-2 border-emerald-200/80 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600" />
            <span className="flex items-center gap-1 bg-emerald-50/90 px-2 sm:px-2.5 py-1 rounded-xl border border-emerald-200/80 shadow-2xs">
              <span className="text-slate-600">Shorts:</span>
              <span className="font-black text-emerald-700 tabular-nums text-sm">{selectedCounts.short}</span>
            </span>

            <span className="flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 px-3 py-1.5 rounded-xl border-2 border-purple-200/80 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600" />
            <span className="flex items-center gap-1 bg-purple-50/90 px-2 sm:px-2.5 py-1 rounded-xl border border-purple-200/80 shadow-2xs">
              <span className="text-slate-600">Longs:</span>
              <span className="font-black text-purple-700 tabular-nums text-sm">{selectedCounts.long}</span>
            </span>

            <div className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 px-3.5 py-1.5 rounded-xl border-2 border-amber-300/80 font-black text-amber-900 tabular-nums shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Total Selected: <span className="text-sm">{selectedCounts.total}</span></span>
            </div>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {selectedCounts.total > 0 && (
              <button
                onClick={() => setViewOnlySelected(!viewOnlySelected)}
                className={`px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  viewOnlySelected
                    ? "bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-300"
                    : "bg-white/90 text-indigo-700 hover:bg-indigo-50 border border-indigo-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{viewOnlySelected ? "Show All" : `Selected (${selectedCounts.total})`}</span>
              </button>
            )}

            <button
              onClick={handleGeneratePaper}
              disabled={selectedCounts.total === 0}
              id="btn-generate-paper-bottom"
              className={`relative overflow-hidden flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer ${
                selectedCounts.total === 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-b from-emerald-400/95 via-emerald-500/90 to-teal-600/95 hover:from-emerald-300 hover:to-teal-500 border border-emerald-200/80 shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.5),inset_0_2px_2px_0_rgba(255,255,255,0.75)] hover:-translate-y-0.5 active:translate-y-0.5"
              }`}
            >
              {selectedCounts.total > 0 && (
                <span
                  className="pointer-events-none absolute inset-x-2 top-0.5 h-2 rounded-t-full bg-gradient-to-b from-white/60 to-transparent"
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10">Generate Paper ({selectedCounts.total})</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
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

      {showManualQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-indigo-100">
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-950 via-indigo-800 to-violet-700 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/15 p-2"><CirclePlus className="w-5 h-5" /></div>
                <div><h2 className="font-black">Add Question Manually</h2><p className="text-xs text-indigo-100">It will be selected immediately and numbered automatically in the paper.</p></div>
              </div>
              <button onClick={() => setShowManualQuestionModal(false)} className="rounded-xl p-2 text-indigo-100 hover:bg-white/10 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 p-6 text-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="font-bold text-slate-700">Section
                  <select value={manualQuestion.type} onChange={(e) => setManualQuestion({ ...manualQuestion, type: e.target.value as Question["type"] })} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-semibold">
                    <option value="mcq">MCQ</option><option value="short">Short Question</option><option value="long">Long Question</option>
                  </select>
                </label>
                <label className="font-bold text-slate-700">Marks
                  <input type="number" min="1" max="100" value={manualQuestion.marks} onChange={(e) => setManualQuestion({ ...manualQuestion, marks: Number(e.target.value) })} className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 font-semibold" />
                </label>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900"><strong>Numbering:</strong><br />Placed in sequence inside its section.</div>
              </div>
              <label className="block font-bold text-slate-700">Question text
                <textarea autoFocus rows={4} value={manualQuestion.text} onChange={(e) => setManualQuestion({ ...manualQuestion, text: e.target.value })} placeholder="Type your question here…" className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 p-3 leading-relaxed focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
              </label>
              {manualQuestion.type === "mcq" && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="font-black text-blue-950">Answer options</span><label className="text-xs font-bold text-blue-800">Correct answer <select value={manualQuestion.correctOption} onChange={(e) => setManualQuestion({ ...manualQuestion, correctOption: Number(e.target.value) })} className="ml-1 rounded-lg border border-blue-200 bg-white px-2 py-1"><option value={1}>A</option><option value={2}>B</option><option value={3}>C</option><option value={4}>D</option></select></label></div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(["optionA", "optionB", "optionC", "optionD"] as const).map((field, index) => <label key={field} className="font-bold text-slate-700">{String.fromCharCode(65 + index)}<input value={manualQuestion[field]} onChange={(e) => setManualQuestion({ ...manualQuestion, [field]: e.target.value })} placeholder={`Option ${String.fromCharCode(65 + index)}`} className="ml-2 w-[calc(100%-28px)] rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-normal" /></label>)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button onClick={() => setShowManualQuestionModal(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-white">Cancel</button>
              <button onClick={addManualQuestion} disabled={!manualQuestion.text.trim() || (manualQuestion.type === "mcq" && !manualQuestion.optionA.trim())} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"><Check className="w-4 h-4" />Add &amp; Select Question</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Question Error / Wrong Answer Modal */}
      {reportingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between bg-gradient-to-r from-rose-600 via-rose-700 to-orange-600 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/15 p-2">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base">Report Question Typo / Wrong Key</h2>
                  <p className="text-[11px] text-rose-100">
                    Sent directly to the Admin Review Queue for 1-click correction
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReportingQuestion(null)}
                className="rounded-xl p-1.5 text-rose-100 hover:bg-white/10 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestionReport} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-bold">
                <MathRenderer
                  content={
                    reportingQuestion.translations?.find((t) => t.language === "en")?.text || ""
                  }
                />
              </div>

              <div>
                <label className="block font-black text-slate-800 text-xs uppercase tracking-wider mb-1.5">
                  Issue Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "wrong_answer", label: "Wrong Answer Key" },
                      { id: "typo", label: "Typo / Spelling" },
                      { id: "urdu_translation", label: "Urdu Translation" },
                      { id: "math_formula", label: "Math / Formula" },
                      { id: "wrong_marks", label: "Marks / Syllabus" },
                      { id: "other", label: "Other Issue" },
                    ] as const
                  ).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setReportCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                        reportCategory === cat.id
                          ? "bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 font-black"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {reportingQuestion.type === "mcq" && reportCategory === "wrong_answer" && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <span className="block text-xs font-black text-amber-900">
                    Which option is actually the correct answer?
                  </span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setReportSuggestedOption(num)}
                        className={`flex-1 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                          reportSuggestedOption === num
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white border border-amber-300 text-slate-700 hover:bg-amber-100"
                        }`}
                      >
                        Option {String.fromCharCode(64 + num)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Describe the issue (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="E.g. According to PTB page 42, Option B is correct..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                />
              </div>

              {reportCategory !== "wrong_answer" && (
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Suggested Corrected Question Text (Optional — enables 1-Click Fix for Admin)
                  </label>
                  <textarea
                    rows={2}
                    value={reportSuggestedFix}
                    onChange={(e) => setReportSuggestedFix(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReportingQuestion(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{submittingReport ? "Submitting..." : "Submit Report to Admin"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Submitted Toast */}
      {reportToast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{reportToast}</span>
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
  onReport?: () => void;
  isReported?: boolean;
}

function QuestionCard({
  index,
  question,
  isSelected,
  languageMode,
  onToggle,
  onReport,
  isReported,
}: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const enTrans = question.translations?.find((t) => t.language === "en");
  const urTrans = question.translations?.find((t) => t.language === "ur");

  const dynamicUrdu = useMemo(() => {
    if (urTrans?.text) return { text_ur: urTrans.text, options_ur: urTrans.options };
    if (enTrans?.text) return getUrduTranslation(enTrans.text, enTrans.options);
    return { text_ur: null, options_ur: null };
  }, [enTrans, urTrans]);

  const showEnglish = languageMode === "English" || languageMode === "Bilingual";
  const hasModelAnswer = Boolean(enTrans?.answer || urTrans?.answer);

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

  // Type-specific color theming
  const typeColors = useMemo(() => {
    if (question.type === "mcq") return {
      border: isSelected ? "border-blue-400" : "border-l-blue-500 border-slate-200/90",
      selectedBg: "bg-gradient-to-br from-blue-50 via-indigo-50/70 to-violet-50/40",
      ring: "ring-blue-500/40",
      shadow: "shadow-blue-200/50",
      checkBg: "bg-gradient-to-r from-blue-600 to-indigo-600",
      indexColor: "text-blue-700",
      accentDot: "bg-blue-500",
    };
    if (question.type === "short") return {
      border: isSelected ? "border-emerald-400" : "border-l-emerald-500 border-slate-200/90",
      selectedBg: "bg-gradient-to-br from-emerald-50 via-teal-50/70 to-cyan-50/40",
      ring: "ring-emerald-500/40",
      shadow: "shadow-emerald-200/50",
      checkBg: "bg-gradient-to-r from-emerald-600 to-teal-600",
      indexColor: "text-emerald-700",
      accentDot: "bg-emerald-500",
    };
    return {
      border: isSelected ? "border-purple-400" : "border-l-purple-500 border-slate-200/90",
      selectedBg: "bg-gradient-to-br from-purple-50 via-fuchsia-50/70 to-pink-50/40",
      ring: "ring-purple-500/40",
      shadow: "shadow-purple-200/50",
      checkBg: "bg-gradient-to-r from-purple-600 to-fuchsia-600",
      indexColor: "text-purple-700",
      accentDot: "bg-purple-500",
    };
  }, [question.type, isSelected]);

  return (
    <article
      onClick={onToggle}
      className={`group relative rounded-2xl border-2 border-l-4 p-4 text-xs transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${typeColors.border} ${
        isSelected
          ? `${typeColors.selectedBg} ring-2 ${typeColors.ring} shadow-lg ${typeColors.shadow}`
          : "bg-white hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5"
      }`}
    >
      {/* Top Header Row with Number and Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className={`w-5.5 h-5.5 rounded-md flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? `${typeColors.checkBg} text-white shadow-sm`
                  : "border-2 border-slate-300 group-hover:border-indigo-400 group-hover:bg-indigo-50"
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span
              className={`font-black text-xs sm:text-sm tracking-tight ${
                isSelected ? typeColors.indexColor : "text-slate-800"
              }`}
            >
              Q.{index}
            </span>
            {isSelected && (
              <span className={`w-2 h-2 rounded-full ${typeColors.accentDot} animate-pulse`} />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {question.source_note?.toLowerCase().includes("ai") && (
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-violet-600 to-emerald-600 text-white font-black text-[10px] flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" />
                AI Topic
              </span>
            )}

            {question.marks && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 font-black border border-amber-300 text-[10px] shadow-sm">
                {question.marks} {question.marks === 1 ? "mark" : "marks"}
              </span>
            )}

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

            {onReport && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReport();
                }}
                title="Report typo or wrong answer key to Admin"
                className={`px-2 py-0.5 rounded-full font-bold text-[10px] border inline-flex items-center gap-1 transition-all cursor-pointer ${
                  isReported
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : "bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border-slate-200 hover:border-rose-200"
                }`}
              >
                <Flag className="w-2.5 h-2.5" />
                <span>{isReported ? "Reported" : "Report"}</span>
              </button>
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
                className={`p-2.5 rounded-xl flex items-start justify-between gap-2 text-[11px] transition-all ${
                  isCorrect
                    ? "bg-gradient-to-r from-emerald-100/90 via-teal-50 to-emerald-50 text-emerald-950 font-extrabold border-2 border-emerald-400 shadow-xs ring-1 ring-emerald-300"
                    : "text-slate-700 bg-white/80 border border-slate-200/90 hover:border-indigo-200 hover:bg-slate-50/90"
                }`}
              >
                <div className="flex items-start gap-2 min-w-0 flex-1 break-words leading-snug">
                  <span
                    className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 shadow-2xs ${
                      isCorrect
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="break-words pt-0.5">{optEn}</span>
                </div>
                {languageMode === "Bilingual" && optUr && (
                  <span className="font-urdu text-xs text-slate-800 shrink-0 max-w-[52%] text-right break-words leading-relaxed pr-0.5" dir="rtl">
                    {optUr}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Model Answer Preview for Short / Long Questions */}
      {question.type !== "mcq" && hasModelAnswer && (
        <div className="mt-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAnswer(!showAnswer);
            }}
            className="text-[11px] font-black text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100/80 px-2.5 py-1 rounded-lg border border-indigo-200/70 inline-flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showAnswer ? "Hide Model Answer" : "View Model Answer / Key"}</span>
          </button>
          {showAnswer && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-2.5 p-3 rounded-xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-emerald-50/40 border-2 border-indigo-200/80 text-[11px] text-slate-800 space-y-1.5 shadow-xs"
            >
              {enTrans?.answer && (
                <div className="font-semibold leading-relaxed">
                  <span className="font-black text-indigo-800 mr-1.5 bg-indigo-100/80 px-1.5 py-0.5 rounded text-[10px] uppercase">Answer Key:</span>
                  <MathRenderer content={enTrans.answer} />
                </div>
              )}
              {urTrans?.answer && languageMode !== "English" && (
                <div className="font-urdu text-xs text-indigo-950 text-right leading-loose pt-1 border-t border-indigo-100" dir="rtl">
                  <MathRenderer content={urTrans.answer} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
