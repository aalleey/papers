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
} from "lucide-react";
import { Question, Topic } from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";

interface NotesChapterViewerProps {
  chapterId: string;
  subjectId: string;
  chapterNumber: number;
  chapterTitle: string;
  topics: Topic[];
  questions: Question[];
}

export function NotesChapterViewer({
  chapterId,
  subjectId,
  chapterNumber,
  chapterTitle,
  topics,
  questions,
}: NotesChapterViewerProps) {
  const [langMode, setLangMode] = useState<"bilingual" | "en" | "ur">("bilingual");
  const [activeType, setActiveType] = useState<"all" | "mcq" | "short" | "long">("all");
  const [activeSource, setActiveSource] = useState<"all" | "exercise" | "extra">("all");
  const [activeTopicId, setActiveTopicId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const counts = useMemo(() => {
    let mcq = 0;
    let short = 0;
    let long = 0;
    let exercise = 0;
    let extra = 0;
    for (const q of questions) {
      if (q.type === "mcq") mcq++;
      else if (q.type === "short") short++;
      else if (q.type === "long") long++;

      if (q.source === "exercise") exercise++;
      else extra++;
    }
    return { mcq, short, long, exercise, extra };
  }, [questions]);

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
      {/* Sticky Filter & Controls Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Type Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: `All (${questions.length})` },
              { id: "mcq", label: `Solved MCQs (${counts.mcq})` },
              { id: "short", label: `Short Qs (${counts.short})` },
              { id: "long", label: `Long Qs (${counts.long})` },
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

            {counts.mcq > 0 && (
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
              placeholder={`Search inside Unit ${chapterNumber}: ${chapterTitle}...`}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={activeSource}
            onChange={(e) => setActiveSource(e.target.value as typeof activeSource)}
            aria-label="Filter by question source"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Sources ({questions.length})</option>
            <option value="exercise">Textbook Exercise ({counts.exercise})</option>
            <option value="extra">Extra / Board Conceptual ({counts.extra})</option>
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
              answered ({mcqs.length} total MCQs)
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
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-800">
            No matching questions in this filter
          </h3>
          <p className="text-xs text-slate-500">
            Try clearing your search box or switching back to All Sources / All Topics.
          </p>
        </div>
      )}

      {/* =====================================================================
          SECTION 1: SOLVED MCQs
          ===================================================================== */}
      {mcqs.length > 0 && (
        <section className="space-y-4" aria-labelledby="notes-mcqs-heading">
          <div className="flex items-center justify-between gap-2">
            <h2 id="notes-mcqs-heading" className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
              Solved Multiple Choice Questions (MCQs) — {mcqs.length}
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
      {shorts.length > 0 && (
        <section className="space-y-4" aria-labelledby="notes-shorts-heading">
          <div className="flex items-center justify-between gap-2">
            <h2 id="notes-shorts-heading" className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
              Short Questions &amp; Answers — {shorts.length}
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
          </div>
        </section>
      )}

      {/* =====================================================================
          SECTION 3: LONG QUESTIONS
          ===================================================================== */}
      {longs.length > 0 && (
        <section className="space-y-4" aria-labelledby="notes-longs-heading">
          <div className="flex items-center justify-between gap-2">
            <h2 id="notes-longs-heading" className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
              Long / Detailed Questions — {longs.length}
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
          </div>
        </section>
      )}
    </div>
  );
}
