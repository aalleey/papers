"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Eye,
  Award,
  Lock,
  Crown,
  LogIn,
} from "lucide-react";
import { Question, Topic } from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";

export interface NotesTotalCounts {
  total: number;
  mcq: number;
  short: number;
  long: number;
  exercise: number;
  extra: number;
}

interface NotesChapterViewerProps {
  chapterId: string;
  subjectId: string;
  chapterNumber: number;
  chapterTitle: string;
  topics: Topic[];
  questions: Question[];
  isUnlocked: boolean;
  isLoggedInFreeUser?: boolean;
  totalCounts: NotesTotalCounts;
}

export function NotesChapterViewer({
  chapterId,
  subjectId,
  chapterNumber,
  chapterTitle,
  topics,
  questions,
  isUnlocked,
  isLoggedInFreeUser = false,
  totalCounts,
}: NotesChapterViewerProps) {
  const [langMode, setLangMode] = useState<"bilingual" | "en" | "ur">("bilingual");
  const [activeType, setActiveType] = useState<"all" | "mcq" | "short" | "long">("all");
  const [activeSource, setActiveSource] = useState<"all" | "exercise" | "extra">("all");
  const [activeTopicId, setActiveTopicId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const visibleCounts = useMemo(() => {
    let mcq = 0;
    let short = 0;
    let long = 0;
    for (const q of questions) {
      if (q.type === "mcq") mcq++;
      else if (q.type === "short") short++;
      else if (q.type === "long") long++;
    }
    return { mcq, short, long };
  }, [questions]);

  const lockedMcqCount = Math.max(0, totalCounts.mcq - visibleCounts.mcq);
  const lockedShortCount = Math.max(0, totalCounts.short - visibleCounts.short);
  const lockedLongCount = Math.max(0, totalCounts.long - visibleCounts.long);
  const lockedTotalCount = Math.max(0, totalCounts.total - questions.length);

  const filteredQuestions = useMemo(() => {
    const sq = searchQuery.trim().toLowerCase();
    return questions.filter((q) => {
      if (activeType !== "all" && q.type !== activeType) return false;
      if (activeSource === "exercise" && q.source !== "exercise") return false;
      if (activeSource === "extra" && q.source === "exercise") return false;
      if (activeTopicId !== "all" && q.topic_id !== activeTopicId) return false;

      if (sq) {
        const en = q.translations?.find((t) => t.language === "en");
        const ur = q.translations?.find((t) => t.language === "ur");
        const haystack = [
          en?.text,
          en?.answer,
          ...(Array.isArray(en?.options) ? en.options : []),
          ur?.text,
          ur?.answer,
          q.source_ref,
          q.concept_tag,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(sq)) return false;
      }
      return true;
    });
  }, [questions, activeType, activeSource, activeTopicId, searchQuery]);

  const mcqs = useMemo(
    () => filteredQuestions.filter((q) => q.type === "mcq"),
    [filteredQuestions]
  );
  const shorts = useMemo(
    () => filteredQuestions.filter((q) => q.type === "short"),
    [filteredQuestions]
  );
  const longs = useMemo(
    () => filteredQuestions.filter((q) => q.type === "long"),
    [filteredQuestions]
  );

  const topicMap = useMemo(() => new Map(topics.map((t) => [t.id, t])), [topics]);

  const quizScore = useMemo(() => {
    let answered = 0;
    let correct = 0;
    for (const q of mcqs) {
      const picked = selectedAnswers[q.id];
      if (picked) {
        answered++;
        if (picked === q.correct_option) correct++;
      }
    }
    return { answered, correct };
  }, [mcqs, selectedAnswers]);

  const generatorUrl = `/select-questions?subject_id=${encodeURIComponent(
    subjectId
  )}&chapter_id=${encodeURIComponent(chapterId)}`;

  return (
    <div className="space-y-8">
      {/* Subscriber Preview Notice Banner (when not a paid subscriber) */}
      {!isUnlocked && lockedTotalCount > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-emerald-50/70 to-teal-50 border border-emerald-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  Sample Preview Mode — Showing {questions.length} of {totalCounts.total} Questions
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/80">
                  +{lockedTotalCount} Locked
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are viewing the public sample ({visibleCounts.mcq} MCQs, {visibleCounts.short} Short &amp; {visibleCounts.long} Long). Active paid subscribers unlock all{" "}
                <strong>{totalCounts.total} solved bilingual questions</strong> + unlimited exam paper generation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition-colors"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{isLoggedInFreeUser ? "Upgrade to Unlock" : "Subscribe to Unlock"}</span>
            </Link>
            {!isLoggedInFreeUser && (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Sticky Filter & Controls Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Type Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: `All (${totalCounts.total})` },
              { id: "mcq", label: `Solved MCQs (${totalCounts.mcq})` },
              { id: "short", label: `Short Qs (${totalCounts.short})` },
              { id: "long", label: `Long Qs (${totalCounts.long})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id as typeof activeType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeType === tab.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Language Mode + Self-Test Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
              {[
                { id: "bilingual", label: "Bilingual" },
                { id: "en", label: "English" },
                { id: "ur", label: "اردو" },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLangMode(l.id as typeof langMode)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    langMode === l.id
                      ? "bg-white text-emerald-800 shadow-2xs font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {visibleCounts.mcq > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuizMode((prev) => !prev);
                  setSelectedAnswers({});
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  quizMode
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {quizMode ? <Award className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{quizMode ? "Self-Test Quiz Active" : "Practice MCQ Quiz"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search + Source + Topic Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isUnlocked
                  ? `Search all ${totalCounts.total} questions in Unit ${chapterNumber}: ${chapterTitle}...`
                  : `Search preview questions in Unit ${chapterNumber} (Subscribe to search all ${totalCounts.total})...`
              }
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={activeSource}
            onChange={(e) => setActiveSource(e.target.value as typeof activeSource)}
            aria-label="Filter by question source"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Sources ({totalCounts.total})</option>
            <option value="exercise">Textbook Exercise ({totalCounts.exercise})</option>
            <option value="extra">Extra / Board Conceptual ({totalCounts.extra})</option>
          </select>

          {topics.length > 0 && (
            <select
              value={activeTopicId}
              onChange={(e) => setActiveTopicId(e.target.value)}
              aria-label="Filter by topic"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 max-w-xs"
            >
              <option value="all">All Topics ({topics.length})</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.number}. {t.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {quizMode && mcqs.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-bold">
            <span>
              Click any option (A–D) below to test yourself! Score:{" "}
              <strong>
                {quizScore.correct} / {quizScore.answered}
              </strong>{" "}
              answered ({mcqs.length} {isUnlocked ? "total" : "sample"} MCQs)
            </span>
            {quizScore.answered > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAnswers({})}
                className="underline hover:text-indigo-700 cursor-pointer"
              >
                Reset Quiz
              </button>
            )}
          </div>
        )}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-800">
            {isUnlocked
              ? "No matching questions in this filter"
              : "No matching questions in the free sample preview"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isUnlocked
              ? "Try clearing your search box or switching back to All Sources / All Topics."
              : `Your filter or search may match one of the ${lockedTotalCount} subscriber-only questions in this chapter.`}
          </p>
          {!isUnlocked && (
            <div className="pt-1">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock All {totalCounts.total} Questions in Unit {chapterNumber}</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Publicly Accessible Lead-In Sample / Full Unlocked Questions Container */}
      <div className="notes-public-preview space-y-8">
        {/* =====================================================================
            SECTION 1: SOLVED MCQs
            ===================================================================== */}
        {(mcqs.length > 0 || (!isUnlocked && activeType === "mcq" && totalCounts.mcq > 0)) && (
          <section className="space-y-4" aria-labelledby="notes-mcqs-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="notes-mcqs-heading"
                className="text-lg sm:text-xl font-black tracking-tight text-slate-900"
              >
                Solved Multiple Choice Questions (MCQs) —{" "}
                {isUnlocked
                  ? mcqs.length
                  : `Showing ${mcqs.length} of ${totalCounts.mcq}`}
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                1 Mark Each
              </span>
            </div>

            <div className="space-y-3.5">
              {mcqs.map((q, idx) => {
                const en = q.translations?.find((t) => t.language === "en");
                const ur = q.translations?.find((t) => t.language === "ur");
                const optsEn = Array.isArray(en?.options) ? en.options : [];
                const optsUr = Array.isArray(ur?.options) ? ur.options : [];
                const topic = q.topic_id ? topicMap.get(q.topic_id) : undefined;
                const picked = selectedAnswers[q.id];

                return (
                  <article
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-black">
                          MCQ #{idx + 1}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold ${
                            q.source === "exercise"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {q.source === "exercise" ? "Textbook Exercise" : "Extra / Board"}
                        </span>
                        {q.source_ref && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                            {q.source_ref}
                          </span>
                        )}
                        {topic && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold">
                            {topic.title}
                          </span>
                        )}
                      </div>

                      {!quizMode && q.correct_option && (
                        <span className="inline-flex items-center gap-1 font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Answer: {String.fromCharCode(64 + q.correct_option)}</span>
                        </span>
                      )}
                    </div>

                    {/* Question Statement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {langMode !== "ur" && en?.text && (
                        <div
                          className={`text-sm font-bold text-slate-900 leading-relaxed ${
                            langMode === "en" || !ur?.text ? "md:col-span-2" : ""
                          }`}
                        >
                          <MathRenderer content={en.text} />
                        </div>
                      )}
                      {langMode !== "en" && ur?.text && (
                        <div
                          dir="rtl"
                          className={`font-urdu text-base font-bold text-slate-900 leading-loose text-right ${
                            langMode === "ur" || !en?.text ? "md:col-span-2" : ""
                          }`}
                        >
                          <MathRenderer content={ur.text} />
                        </div>
                      )}
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      {[0, 1, 2, 3].map((oIdx) => {
                        const optNumber = oIdx + 1;
                        const letter = String.fromCharCode(65 + oIdx);
                        const isCorrect = q.correct_option === optNumber;
                        const isPicked = picked === optNumber;

                        const optEnText = optsEn[oIdx] || "";
                        const optUrText = optsUr[oIdx] || "";
                        if (!optEnText && !optUrText) return null;

                        let boxStyle = "bg-slate-50/80 border-slate-200 text-slate-700";
                        if (!quizMode && isCorrect) {
                          boxStyle =
                            "bg-emerald-50/90 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400/30";
                        } else if (quizMode && picked) {
                          if (isCorrect) {
                            boxStyle =
                              "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                          } else if (isPicked && !isCorrect) {
                            boxStyle = "bg-rose-50 border-rose-400 text-rose-900 font-bold";
                          }
                        } else if (quizMode) {
                          boxStyle =
                            "bg-slate-50 hover:bg-indigo-50/60 hover:border-indigo-300 border-slate-200 text-slate-800 cursor-pointer";
                        }

                        const inner = (
                          <div className="flex items-start justify-between gap-2 w-full">
                            <div className="flex items-start gap-2 min-w-0">
                              <span
                                className={`w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 ${
                                  (!quizMode && isCorrect) || (quizMode && picked && isCorrect)
                                    ? "bg-emerald-600 text-white"
                                    : quizMode && isPicked && !isCorrect
                                    ? "bg-rose-600 text-white"
                                    : "bg-white border border-slate-300 text-slate-700"
                                }`}
                              >
                                {letter}
                              </span>
                              {langMode !== "ur" && optEnText && (
                                <span className="text-xs sm:text-[13px] leading-snug">
                                  <MathRenderer content={optEnText} />
                                </span>
                              )}
                            </div>

                            {langMode !== "en" && optUrText && optUrText !== optEnText && (
                              <span
                                dir="rtl"
                                className="font-urdu text-xs sm:text-sm leading-relaxed text-right shrink-0"
                              >
                                <MathRenderer content={optUrText} />
                              </span>
                            )}
                          </div>
                        );

                        if (quizMode) {
                          return (
                            <button
                              key={letter}
                              type="button"
                              onClick={() =>
                                setSelectedAnswers((prev) => ({ ...prev, [q.id]: optNumber }))
                              }
                              className={`p-2.5 rounded-xl border text-left transition-all ${boxStyle}`}
                            >
                              {inner}
                            </button>
                          );
                        }

                        return (
                          <div key={letter} className={`p-2.5 rounded-xl border ${boxStyle}`}>
                            {inner}
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}

              {/* Locked MCQs Teaser Banner */}
              {!isUnlocked && lockedMcqCount > 0 && (
                <div className="rounded-2xl border-2 border-dashed border-emerald-300/90 bg-gradient-to-b from-white to-emerald-50/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-black text-slate-900">
                        +{lockedMcqCount} More Solved MCQs in Unit {chapterNumber} (Subscriber Only)
                      </div>
                      <p className="text-xs text-slate-600">
                        Unlock all {totalCounts.mcq} textbook exercise &amp; board conceptual MCQs with answer keys and interactive self-quiz.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shrink-0 transition-colors"
                  >
                    <span>Unlock All {totalCounts.mcq} MCQs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Mid-Page Teacher CTA Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-5 sm:p-7 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>For School &amp; Academy Teachers</span>
            </div>
            <h3 className="text-base sm:text-lg font-black">
              Turn Unit {chapterNumber} ({chapterTitle}) into a Printable Board Test in 60 Seconds
            </h3>
            <p className="text-xs text-emerald-100/90">
              Auto-pick MCQs, Short &amp; Long questions with your school logo, Paper Codes A–D, OMR sheet, PDF &amp; editable Word (.docx).
            </p>
          </div>
          <Link
            href={generatorUrl}
            className="px-5 py-3 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs sm:text-sm shrink-0 inline-flex items-center gap-2 shadow-sm transition-colors"
          >
            <span>Generate Test Paper</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* =====================================================================
            SECTION 2: SHORT QUESTIONS
            ===================================================================== */}
        {(shorts.length > 0 || (!isUnlocked && activeType === "short" && totalCounts.short > 0)) && (
          <section className="space-y-4" aria-labelledby="notes-shorts-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="notes-shorts-heading"
                className="text-lg sm:text-xl font-black tracking-tight text-slate-900"
              >
                Short Questions &amp; Answers —{" "}
                {isUnlocked
                  ? shorts.length
                  : `Showing ${shorts.length} of ${totalCounts.short}`}
              </h2>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                2 Marks Each
              </span>
            </div>

            <div className="space-y-3.5">
              {shorts.map((q, idx) => {
                const en = q.translations?.find((t) => t.language === "en");
                const ur = q.translations?.find((t) => t.language === "ur");
                const topic = q.topic_id ? topicMap.get(q.topic_id) : undefined;
                const hasAnswer = Boolean(
                  (en?.answer && en.answer.trim()) || (ur?.answer && ur.answer.trim())
                );

                return (
                  <article
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-blue-700 text-white font-black">
                          SQ #{idx + 1}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold ${
                            q.source === "exercise"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {q.source === "exercise" ? "Textbook Exercise" : "Important Board SQ"}
                        </span>
                        {q.source_ref && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                            {q.source_ref}
                          </span>
                        )}
                        {q.concept_tag && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {q.concept_tag}
                          </span>
                        )}
                        {topic && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold">
                            {topic.title}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-500">{q.marks} Marks</span>
                    </div>

                    {/* Question */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {langMode !== "ur" && en?.text && (
                        <h3
                          className={`text-sm sm:text-[15px] font-extrabold text-slate-900 leading-relaxed ${
                            langMode === "en" || !ur?.text ? "md:col-span-2" : ""
                          }`}
                        >
                          <MathRenderer content={en.text} />
                        </h3>
                      )}
                      {langMode !== "en" && ur?.text && (
                        <div
                          dir="rtl"
                          className={`font-urdu text-base font-bold text-slate-900 leading-loose text-right ${
                            langMode === "ur" || !en?.text ? "md:col-span-2" : ""
                          }`}
                        >
                          <MathRenderer content={ur.text} />
                        </div>
                      )}
                    </div>

                    {/* Solved Answer (when populated) */}
                    {hasAnswer && (
                      <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/80 p-3.5 sm:p-4 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Answer / حل</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {langMode !== "ur" && en?.answer && (
                            <div
                              className={`text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line ${
                                langMode === "en" || !ur?.answer ? "md:col-span-2" : ""
                              }`}
                            >
                              <MathRenderer content={en.answer} />
                            </div>
                          )}
                          {langMode !== "en" && ur?.answer && (
                            <div
                              dir="rtl"
                              className={`font-urdu text-sm sm:text-base text-slate-900 leading-loose text-right whitespace-pre-line ${
                                langMode === "ur" || !en?.answer ? "md:col-span-2" : ""
                              }`}
                            >
                              <MathRenderer content={ur.answer} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {/* Locked Short Questions Teaser Banner */}
              {!isUnlocked && lockedShortCount > 0 && (
                <div className="rounded-2xl border-2 border-dashed border-blue-300/90 bg-gradient-to-b from-white to-blue-50/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-black text-slate-900">
                        +{lockedShortCount} More Short Questions &amp; Notes in Unit {chapterNumber} (Subscriber Only)
                      </div>
                      <p className="text-xs text-slate-600">
                        Unlock all {totalCounts.short} textbook exercise and conceptual board short questions in English &amp; Urdu Nastaliq.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shrink-0 transition-colors"
                  >
                    <span>Unlock All {totalCounts.short} Short Qs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* =====================================================================
            SECTION 3: LONG QUESTIONS
            ===================================================================== */}
        {(longs.length > 0 || (!isUnlocked && activeType === "long" && totalCounts.long > 0)) && (
          <section className="space-y-4" aria-labelledby="notes-longs-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2
                id="notes-longs-heading"
                className="text-lg sm:text-xl font-black tracking-tight text-slate-900"
              >
                Long / Detailed Questions —{" "}
                {isUnlocked
                  ? longs.length
                  : `Showing ${longs.length} of ${totalCounts.long}`}
              </h2>
              <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Detailed Board Questions
              </span>
            </div>

            <div className="space-y-3.5">
              {longs.map((q, idx) => {
                const en = q.translations?.find((t) => t.language === "en");
                const ur = q.translations?.find((t) => t.language === "ur");
                const topic = q.topic_id ? topicMap.get(q.topic_id) : undefined;
                const hasAnswer = Boolean(
                  (en?.answer && en.answer.trim()) || (ur?.answer && ur.answer.trim())
                );

                return (
                  <article
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-purple-700 text-white font-black">
                          LQ #{idx + 1}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold ${
                            q.source === "exercise"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {q.source === "exercise" ? "Textbook Exercise" : "Important Board LQ"}
                        </span>
                        {q.source_ref && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                            {q.source_ref}
                          </span>
                        )}
                        {topic && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold">
                            {topic.title}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-600">{q.marks} Marks</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {langMode !== "ur" && en?.text && (
                        <h3
                          className={`text-sm sm:text-base font-extrabold text-slate-900 leading-relaxed ${
                            langMode === "en" || !ur?.text ? "md:col-span-2" : ""
                          }`}
                        >
                          <MathRenderer content={en.text} />
                        </h3>
                      )}
                      {langMode !== "en" && ur?.text && (
                        <div
                          dir="rtl"
                          className={`font-urdu text-base sm:text-lg font-bold text-slate-900 leading-loose text-right ${
                            langMode === "ur" || !en?.text ? "md:col-span-2" : ""
                          }`}
                        >
                          <MathRenderer content={ur.text} />
                        </div>
                      )}
                    </div>

                    {hasAnswer && (
                      <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/80 p-4 sm:p-5 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Detailed Solution / تفصیلی جواب</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {langMode !== "ur" && en?.answer && (
                            <div
                              className={`text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line ${
                                langMode === "en" || !ur?.answer ? "md:col-span-2" : ""
                              }`}
                            >
                              <MathRenderer content={en.answer} />
                            </div>
                          )}
                          {langMode !== "en" && ur?.answer && (
                            <div
                              dir="rtl"
                              className={`font-urdu text-sm sm:text-base text-slate-900 leading-loose text-right whitespace-pre-line ${
                                langMode === "ur" || !en?.answer ? "md:col-span-2" : ""
                              }`}
                            >
                              <MathRenderer content={ur.answer} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {/* Locked Long Questions Teaser Banner */}
              {!isUnlocked && lockedLongCount > 0 && (
                <div className="rounded-2xl border-2 border-dashed border-purple-300/90 bg-gradient-to-b from-white to-purple-50/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-black text-slate-900">
                        +{lockedLongCount} More Detailed Long Questions in Unit {chapterNumber} (Subscriber Only)
                      </div>
                      <p className="text-xs text-slate-600">
                        Unlock all {totalCounts.long} board long questions and structured solutions in English &amp; Urdu.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs shrink-0 transition-colors"
                  >
                    <span>Unlock All {totalCounts.long} Long Qs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* =====================================================================
          GOOGLE-COMPLIANT PAYWALL GATE (.notes-paywall-gate)
          ===================================================================== */}
      {!isUnlocked && lockedTotalCount > 0 && (
        <section
          aria-labelledby="notes-paywall-heading"
          className="notes-paywall-gate relative overflow-hidden rounded-3xl border-2 border-emerald-500/80 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Subscriber-Only Full Study Notes &amp; Question Bank</span>
              </div>

              <h3
                id="notes-paywall-heading"
                className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight"
              >
                Unlock All {totalCounts.total} Solved Questions in Unit {chapterNumber}: {chapterTitle}
              </h3>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                You have viewed the {questions.length} free preview questions for this chapter. Upgrade to a{" "}
                <strong>PaperWala Paid Subscription (Rs. 2,000 / month — 50% OFF)</strong> to unlock the remaining{" "}
                <strong>
                  {lockedMcqCount} Solved MCQs, {lockedShortCount} Short Questions, and {lockedLongCount} Long Questions
                </strong>{" "}
                plus unlimited bilingual exam paper generation.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-semibold text-emerald-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full Chapter-Wise Solved MCQs, Short &amp; Long Notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bilingual English + Noto Nastaliq Urdu &amp; Self-Quiz</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Board-Pattern Paper Generation (ALP)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PDF, MS Word (.docx), Answer Keys &amp; Codes A–D</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 shrink-0 sm:min-w-[240px]">
              <Link
                href="/pricing"
                className="w-full px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm text-center shadow-lg transition-all inline-flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                <span>
                  {isLoggedInFreeUser
                    ? "Upgrade to Paid (Rs. 2,000/mo)"
                    : "Subscribe Now (Rs. 2,000/mo)"}
                </span>
              </Link>

              {!isLoggedInFreeUser ? (
                <Link
                  href="/login"
                  className="w-full px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs text-center transition-all inline-flex items-center justify-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Already Subscribed? Sign In</span>
                </Link>
              ) : (
                <div className="text-[11px] text-center text-emerald-200/80 font-medium">
                  Signed in on Free Plan &bull; Instant activation
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
