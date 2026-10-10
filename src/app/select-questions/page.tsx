"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Question,
  Chapter,
  Topic,
  QuestionType,
  QuestionSource,
} from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import { getUrduTranslation } from "@/lib/urdu-translations";
import {
  ChevronUp,
  ChevronDown,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  FileText,
  SlidersHorizontal,
  X,
  BookOpen,
  ArrowLeft,
  Settings,
  HelpCircle,
} from "lucide-react";

export default function SelectQuestionsPage() {
  const router = useRouter();

  // Data state
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // Selection state (Array of selected question IDs)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter controls state (matching Screenshot 1)
  const [patternMode, setPatternMode] = useState<"board" | "auto" | "custom" | null>(null);
  const [skipALP, setSkipALP] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<"mixed" | "exercise" | "additional" | "board">("exercise");
  const [languageMode, setLanguageMode] = useState<"English" | "Urdu" | "Bilingual">("Bilingual");

  // Topic filter state (Set of selected topic IDs or 'ALL')
  const [selectedTopicFilters, setSelectedTopicFilters] = useState<Set<string>>(new Set(["ALL"]));

  // UI state
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [viewOnlySelected, setViewOnlySelected] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

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

  // 1. Initial Load: Fetch Chapter 8 (or chapters for Computer Science)
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/paper/questions?chapter_id=ac5b38de-123c-51fc-a96b-1ecaff9762ce");
        const data = await res.json();

        if (data.chapters?.length) {
          setChapters(data.chapters);
          const ch8 = data.chapters.find((c: Chapter) => c.number === 8) || data.chapters[0];
          setCurrentChapter(ch8);
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

    loadData();
  }, []);

  async function handleChapterChange(chapterId: string) {
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    setCurrentChapter(ch);
    setLoading(true);
    try {
      const res = await fetch(`/api/paper/questions?chapter_id=${ch.id}`);
      const data = await res.json();
      if (data.topics) setTopics(data.topics);
      if (data.questions) setAllQuestions(data.questions);
      setSelectedTopicFilters(new Set(["ALL"]));
    } catch (e) {
      console.error("Failed to load chapter questions", e);
    } finally {
      setLoading(false);
    }
  }

  // Sync selection to sessionStorage for seamless transfer to Paper Editor
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
      if (sourceFilter === "exercise" && q.source !== "exercise") {
        return false;
      }
      if (sourceFilter === "additional" && q.source !== "extra") {
        return false;
      }
      if (sourceFilter === "board" && q.source !== "past_paper") {
        return false;
      }

      // 3. View Only Selected toggle
      if (viewOnlySelected && !selectedIds.has(q.id)) {
        return false;
      }

      return true;
    });
  }, [allQuestions, selectedTopicFilters, sourceFilter, viewOnlySelected, selectedIds]);

  // Group by question type
  const mcqQuestions = useMemo(() => filteredQuestions.filter((q) => q.type === "mcq"), [filteredQuestions]);
  const shortQuestions = useMemo(() => filteredQuestions.filter((q) => q.type === "short"), [filteredQuestions]);
  const longQuestions = useMemo(() => filteredQuestions.filter((q) => q.type === "long"), [filteredQuestions]);

  // Live Selected counts
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

  // Toggle selection for a single question
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

  // Select all or clear questions in a specific group
  const selectAllInGroup = (questionsGroup: Question[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = questionsGroup.every((q) => next.has(q.id));
      if (allSelected) {
        questionsGroup.forEach((q) => next.delete(q.id));
      } else {
        questionsGroup.forEach((q) => next.add(q.id));
      }
      return next;
    });
  };

  // Toggle Topic Filter
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

    // Pick target count from each
    mcqs.slice(0, mcqTarget).forEach((q) => newSelected.add(q.id));
    shorts.slice(0, shortTarget).forEach((q) => newSelected.add(q.id));
    longs.slice(0, longTarget).forEach((q) => newSelected.add(q.id));

    setSelectedIds(newSelected);
    setShowCustomModal(false);
  };

  // Navigate to Paper Editor
  const handleGeneratePaper = () => {
    // Save selected questions list
    const selectedList = allQuestions.filter((q) => selectedIds.has(q.id));
    sessionStorage.setItem("papermaker_selected_questions", JSON.stringify(selectedList));
    sessionStorage.setItem("papermaker_language_mode", languageMode);
    router.push("/paper-editor");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-slate-700">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Loading Question Bank...</h2>
        <p className="text-xs text-slate-500 mt-1">Fetching Class 10 Computer Science Chapter 8</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-800 font-sans pb-28 selection:bg-blue-100 selection:text-blue-900">
      {/* =========================================================================
          TOP FIXED HEADER WRAPPER (Exact match to Screenshot 1)
          ========================================================================= */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm transition-all duration-200">
        {!headerCollapsed && (
          <div className="max-w-[1700px] mx-auto px-4 py-3 sm:px-6">
            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Back to Home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>Select: Computer</span>
                    <span className="font-urdu text-blue-700 text-lg">کمپیوٹر</span>
                  </h1>
                  <div className="text-xs text-slate-500 font-medium">
                    Punjab Boards &bull; 10th (New) 2026-27 &bull; Unit-8 Digital Entrepreneurship
                  </div>
                </div>
              </div>

              {/* Controls Grid (Pattern, Source, Language) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Pattern Group */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1.5">Pattern</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={patternMode === "board"}
                        onChange={() => setPatternMode(patternMode === "board" ? null : "board")}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Board</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={patternMode === "auto"}
                        onChange={() => {
                          setPatternMode(patternMode === "auto" ? null : "auto");
                          if (patternMode !== "auto") applyCustomPattern(10, 5, 2);
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Auto</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                      <input
                        type="checkbox"
                        checked={patternMode === "custom"}
                        onChange={() => {
                          setPatternMode("custom");
                          setShowCustomModal(true);
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Custom</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-rose-600 select-none">
                      <input
                        type="checkbox"
                        checked={skipALP}
                        onChange={(e) => setSkipALP(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Skip ALP</span>
                    </label>
                  </div>
                </div>

                {/* Source Group */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1.5">Source</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                      <input
                        type="radio"
                        name="source"
                        checked={sourceFilter === "mixed"}
                        onChange={() => setSourceFilter("mixed")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Mixed</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                      <input
                        type="radio"
                        name="source"
                        checked={sourceFilter === "exercise"}
                        onChange={() => setSourceFilter("exercise")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Exercise</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                      <input
                        type="radio"
                        name="source"
                        checked={sourceFilter === "additional"}
                        onChange={() => setSourceFilter("additional")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Extra</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                      <input
                        type="radio"
                        name="source"
                        checked={sourceFilter === "board"}
                        onChange={() => setSourceFilter("board")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Past Papers</span>
                    </label>
                  </div>
                </div>

                {/* Language Group */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <div className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1.5">Language</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                      <input
                        type="radio"
                        name="lang"
                        checked={languageMode === "English"}
                        onChange={() => setLanguageMode("English")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Eng</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                      <input
                        type="radio"
                        name="lang"
                        checked={languageMode === "Urdu"}
                        onChange={() => setLanguageMode("Urdu")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Urdu</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                      <input
                        type="radio"
                        name="lang"
                        checked={languageMode === "Bilingual"}
                        onChange={() => setLanguageMode("Bilingual")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Both</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Header row */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (!currentChapter) return;
                  const curIdx = chapters.findIndex((c) => c.id === currentChapter.id);
                  if (curIdx > 0) handleChapterChange(chapters[curIdx - 1].id);
                }}
                disabled={!currentChapter || chapters.findIndex((c) => c.id === currentChapter.id) <= 0}
                className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:text-slate-300 font-semibold text-xs transition-colors disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <select
                value={currentChapter?.id || ""}
                onChange={(e) => handleChapterChange(e.target.value)}
                className="font-bold text-slate-800 text-sm bg-slate-100 hover:bg-slate-200 px-4 py-1 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-center"
              >
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Unit-{ch.number}: {ch.title}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!currentChapter) return;
                  const curIdx = chapters.findIndex((c) => c.id === currentChapter.id);
                  if (curIdx < chapters.length - 1) handleChapterChange(chapters[curIdx + 1].id);
                }}
                disabled={!currentChapter || chapters.findIndex((c) => c.id === currentChapter.id) >= chapters.length - 1}
                className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:text-slate-300 font-semibold text-xs transition-colors disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Toggle Collapse Chevron Tab */}
        <div className="flex justify-center -mb-3 relative z-10">
          <button
            onClick={() => setHeaderCollapsed(!headerCollapsed)}
            className="w-8 h-6 bg-white border border-slate-200 rounded-b-md shadow-sm hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors"
            title={headerCollapsed ? "Expand Header" : "Collapse Header"}
          >
            {headerCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN LAYOUT: SIDEBAR + QUESTIONS GRID
          ========================================================================= */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 pt-6 flex flex-col lg:flex-row items-start gap-6">
        {/* LEFT VERTICAL SIDEBAR: TOPIC FILTER */}
        <aside className="w-full lg:w-72 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0 sticky top-28">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filter by Topic
            </span>
            <button
              onClick={() => setSelectedTopicFilters(new Set(["ALL"]))}
              className="text-[10px] text-slate-400 hover:text-blue-600 font-medium underline"
            >
              Reset
            </button>
          </div>

          <ul className="divide-y divide-slate-100 text-xs">
            {/* All Topics */}
            <li
              onClick={() => toggleTopic("ALL")}
              className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                selectedTopicFilters.has("ALL") ? "bg-blue-50/80 font-bold text-blue-900" : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTopicFilters.has("ALL")}
                  readOnly
                  className="rounded text-blue-600 pointer-events-none"
                />
                <span>All Topics</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
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
                  className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50/80 font-bold text-blue-900" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 pr-2 leading-tight">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded text-blue-600 pointer-events-none shrink-0"
                    />
                    <span className="line-clamp-2">
                      8.{t.number} {t.title}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium shrink-0">
                    {count}
                  </span>
                </li>
              );
            })}

            {/* Exercise Filter */}
            <li
              onClick={() => toggleTopic("exercise_source")}
              className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                selectedTopicFilters.has("exercise_source")
                  ? "bg-blue-50/80 font-bold text-blue-900"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTopicFilters.has("exercise_source")}
                  readOnly
                  className="rounded text-blue-600 pointer-events-none"
                />
                <span>Exercise</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                {topicCounts["exercise_source"] || 0}
              </span>
            </li>
          </ul>
        </aside>

        {/* QUESTIONS CONTAINER */}
        <main className="flex-1 w-full space-y-6">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No Questions Match Current Filters</h3>
              <p className="text-xs text-slate-400">
                Try selecting &ldquo;All Topics&rdquo; or switching the Source filter to &ldquo;Mixed&rdquo;.
              </p>
              <button
                onClick={() => {
                  setSelectedTopicFilters(new Set(["ALL"]));
                  setSourceFilter("mixed");
                  setViewOnlySelected(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* SECTION: MULTIPLE CHOICE QUESTIONS */}
              {mcqQuestions.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Section Accordion Header */}
                  <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => setAccordionOpen((prev) => ({ ...prev, mcq: !prev.mcq }))}
                      className="flex items-center gap-2 font-bold text-sm text-blue-800 hover:text-blue-900"
                    >
                      <span>Multiple Choice Questions ( {mcqQuestions.length} )</span>
                      {accordionOpen.mcq ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllInGroup(mcqQuestions)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      >
                        {mcqQuestions.every((q) => selectedIds.has(q.id)) ? "Deselect All MCQs" : "Select All MCQs"}
                      </button>
                    </div>
                  </div>

                  {/* 3-Column Card Grid */}
                  {accordionOpen.mcq && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                </div>
              )}

              {/* SECTION: SHORT QUESTIONS */}
              {shortQuestions.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => setAccordionOpen((prev) => ({ ...prev, short: !prev.short }))}
                      className="flex items-center gap-2 font-bold text-sm text-blue-800 hover:text-blue-900"
                    >
                      <span>Short Questions ( {shortQuestions.length} )</span>
                      {accordionOpen.short ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllInGroup(shortQuestions)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      >
                        {shortQuestions.every((q) => selectedIds.has(q.id)) ? "Deselect All Shorts" : "Select All Shorts"}
                      </button>
                    </div>
                  </div>

                  {accordionOpen.short && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                </div>
              )}

              {/* SECTION: LONG QUESTIONS */}
              {longQuestions.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => setAccordionOpen((prev) => ({ ...prev, long: !prev.long }))}
                      className="flex items-center gap-2 font-bold text-sm text-blue-800 hover:text-blue-900"
                    >
                      <span>Long Questions ( {longQuestions.length} )</span>
                      {accordionOpen.long ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectAllInGroup(longQuestions)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      >
                        {longQuestions.every((q) => selectedIds.has(q.id)) ? "Deselect All Longs" : "Select All Longs"}
                      </button>
                    </div>
                  </div>

                  {accordionOpen.long && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* =========================================================================
          STICKY BOTTOM BAR (Exact Match to Screenshot 1)
          ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-300 shadow-2xl py-3 px-4 sm:px-8">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Counters on the left */}
          <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <span>MCQs:</span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
                {selectedCounts.mcq}
              </span>
            </span>

            <span className="text-slate-300">&bull;</span>

            <span className="flex items-center gap-1.5">
              <span>Shorts:</span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
                {selectedCounts.short}
              </span>
            </span>

            <span className="text-slate-300">&bull;</span>

            <span className="flex items-center gap-1.5">
              <span>Longs:</span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
                {selectedCounts.long}
              </span>
            </span>

            <span className="hidden md:inline-block text-slate-300">&bull;</span>

            <span className="hidden md:inline-flex items-center gap-1.5 text-emerald-700">
              <span>Total Selected:</span>
              <span className="font-black">{selectedCounts.total}</span>
            </span>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-3">
            {selectedCounts.total > 0 && (
              <button
                onClick={() => setViewOnlySelected(!viewOnlySelected)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  viewOnlySelected
                    ? "bg-amber-500 text-white shadow-md hover:bg-amber-600"
                    : "bg-teal-600 text-white shadow-md hover:bg-teal-500"
                }`}
              >
                {viewOnlySelected ? "Show All Questions" : "View Selected"}
              </button>
            )}

            <button
              onClick={handleGeneratePaper}
              disabled={selectedCounts.total === 0}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg flex items-center gap-2 transition-all active:scale-[0.98] ${
                selectedCounts.total === 0
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
              }`}
            >
              <span>Generate Paper</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CUSTOM PATTERN SELECTION MODAL
          ========================================================================= */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-base text-slate-900">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <span>Custom Question Pattern</span>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Specify the number of questions to auto-pick from Chapter 8 according to your exam format.
            </p>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Multiple Choice Questions (MCQs):</label>
                <input
                  type="number"
                  min="0"
                  max={mcqQuestions.length}
                  value={customCounts.mcqs}
                  onChange={(e) => setCustomCounts({ ...customCounts, mcqs: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Short Questions:</label>
                <input
                  type="number"
                  min="0"
                  max={shortQuestions.length}
                  value={customCounts.shorts}
                  onChange={(e) => setCustomCounts({ ...customCounts, shorts: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Long Questions:</label>
                <input
                  type="number"
                  min="0"
                  max={longQuestions.length}
                  value={customCounts.longs}
                  onChange={(e) => setCustomCounts({ ...customCounts, longs: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => applyCustomPattern(customCounts.mcqs, customCounts.shorts, customCounts.longs)}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// QUESTION CARD COMPONENT (Matching Screenshot 1)
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

  // Lookup Urdu translation if not stored directly
  const dynamicUrdu = useMemo(() => {
    if (urTrans?.text) return { text_ur: urTrans.text, options_ur: urTrans.options };
    if (enTrans?.text) return getUrduTranslation(enTrans.text, enTrans.options);
    return { text_ur: null, options_ur: null };
  }, [enTrans, urTrans]);

  const showEnglish = languageMode === "English" || languageMode === "Bilingual";
  const showUrdu = languageMode === "Urdu" || languageMode === "Bilingual";

  const optionsEn = enTrans?.options || [];
  const optionsUr = dynamicUrdu.options_ur || [];

  return (
    <div
      onClick={onToggle}
      className={`relative bg-white rounded-xl border p-4 text-xs transition-all cursor-pointer select-none flex flex-col justify-between ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/10"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Top Header Row with Number and Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}} // handled by parent onClick
              className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
            />
            <span className="font-extrabold text-slate-800 text-sm">Q.{index}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {question.source === "exercise" && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-200 text-[10px]">
                Exercise
              </span>
            )}

            {question.source_ref && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[10px]">
                {question.source_ref}
              </span>
            )}

            {question.concept_tag && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 text-[10px]">
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
              <div className="flex-1 font-semibold text-slate-900">
                <MathRenderer content={enTrans?.text || ""} />
              </div>
              {/* Urdu on Right */}
              {dynamicUrdu.text_ur && (
                <div className="flex-1 text-right font-urdu text-sm text-blue-950 leading-loose" dir="rtl">
                  <MathRenderer content={dynamicUrdu.text_ur} />
                </div>
              )}
            </div>
          ) : showEnglish ? (
            <div className="font-semibold text-slate-900 text-sm leading-relaxed">
              <MathRenderer content={enTrans?.text || ""} />
            </div>
          ) : (
            <div className="text-right font-urdu text-base text-blue-950 leading-loose" dir="rtl">
              <MathRenderer content={dynamicUrdu.text_ur || enTrans?.text || ""} />
            </div>
          )}
        </div>
      </div>

      {/* Options Grid (for MCQs) */}
      {question.type === "mcq" && optionsEn.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
          {optionsEn.map((optEn, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isCorrect = question.correct_option === optIdx + 1;
            const optUr = optionsUr[optIdx];

            return (
              <div
                key={optIdx}
                className={`p-1.5 rounded-md flex items-center justify-between gap-1 text-[11px] ${
                  isCorrect
                    ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                    : "text-slate-600 bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="font-extrabold text-slate-500 shrink-0">{letter})</span>
                  <span className="truncate">{optEn}</span>
                </div>
                {languageMode === "Bilingual" && optUr && (
                  <span className="font-urdu text-xs text-slate-700 shrink-0 pr-1" dir="rtl">
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
}
