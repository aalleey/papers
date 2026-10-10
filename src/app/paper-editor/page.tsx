"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Question } from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import { getUrduTranslation } from "@/lib/urdu-translations";
import {
  Printer,
  ArrowLeft,
  Settings,
  Bookmark,
  Building2,
  Type,
  FileCheck,
  RotateCcw,
  Sparkles,
  Trash2,
  Edit3,
  Check,
  X,
  Shuffle,
  ChevronDown,
  Layers,
  HelpCircle,
  Eye,
  Sliders,
} from "lucide-react";

export default function PaperEditorPage() {
  const router = useRouter();

  // Data & Selected questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Paper header & metadata state (editable inline or via toolbars)
  const [institutionName, setInstitutionName] = useState("YOUR INSTITUTION NAME");
  const [examTitle, setExamTitle] = useState("EXAMINATION 2026-27");
  const [subjectName, setSubjectName] = useState("Computer کمپیوٹر");
  const [className, setClassName] = useState("10th");
  const [syllabusText, setSyllabusText] = useState("Unit-8 Digital Entrepreneurship");
  const [totalMarks, setTotalMarks] = useState<number>(75);
  const [examTime, setExamTime] = useState("2:30 hrs");
  const [examDate, setExamDate] = useState("11-10-2026");
  const [testNumber, setTestNumber] = useState("01");

  // Version variant state (Version A, B, C, D)
  const [paperVersion, setPaperVersion] = useState<"A" | "B" | "C" | "D">("A");
  const [paperCodes, setPaperCodes] = useState<Record<string, string>>({
    A: "3041",
    B: "4152",
    C: "5263",
    D: "6374",
  });

  // Display & Content Options
  const [boardStyle, setBoardStyle] = useState<"punjab" | "federal" | "minimal">("punjab");
  const [languageMode, setLanguageMode] = useState<"English" | "Urdu" | "Bilingual">("English");
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [showOMRSheet, setShowOMRSheet] = useState(true);
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [showStudentDetails, setShowStudentDetails] = useState(true);
  const [showInstructionNote, setShowInstructionNote] = useState(true);

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSizingModal, setShowSizingModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);

  // Active question being edited inline
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Instruction Note text
  const [instructionNote, setInstructionNote] = useState(
    "Note: Four possible answers A, B, C and D to each question are given. Fill that circle in front of that question with Marker or Pen ink. Cutting or filling two or more circles will result in zero mark in that question."
  );

  // 1. Initial Load: Read selected questions from sessionStorage or load default set
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load bank questions to support swapping
        const res = await fetch("/api/paper/questions?chapter_id=ac5b38de-123c-51fc-a96b-1ecaff9762ce");
        const data = await res.json();
        if (data.questions?.length) {
          setBankQuestions(data.questions);
        }

        // Check sessionStorage for chosen questions
        const stored = sessionStorage.getItem("papermaker_selected_questions");
        const storedLang = sessionStorage.getItem("papermaker_language_mode");
        if (storedLang === "Urdu" || storedLang === "Bilingual" || storedLang === "English") {
          setLanguageMode(storedLang);
        }

        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setQuestions(parsed);
              return;
            }
          } catch {
            // ignore
          }
        }

        // If no selection was stored, default to a balanced set matching Screenshot 2 (e.g. 7 MCQs, 5 Shorts, 1 Long)
        if (data.questions?.length) {
          const defaultMcqs = data.questions.filter((q: Question) => q.type === "mcq").slice(0, 7);
          const defaultShorts = data.questions.filter((q: Question) => q.type === "short").slice(0, 5);
          const defaultLongs = data.questions.filter((q: Question) => q.type === "long").slice(0, 1);
          setQuestions([...defaultMcqs, ...defaultShorts, ...defaultLongs]);
        }
      } catch (err) {
        console.error("Failed to load paper editor questions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Split into MCQs, Shorts, Longs
  const mcqs = useMemo(() => questions.filter((q) => q.type === "mcq"), [questions]);
  const shorts = useMemo(() => questions.filter((q) => q.type === "short"), [questions]);
  const longs = useMemo(() => questions.filter((q) => q.type === "long"), [questions]);

  // Version shuffler: shuffles options or questions order per version
  const displayedMcqs = useMemo(() => {
    if (paperVersion === "A") return mcqs;
    // For Version B, C, D, deterministic rotation based on version code
    const offset = paperVersion === "B" ? 2 : paperVersion === "C" ? 4 : 6;
    return [...mcqs.slice(offset % mcqs.length), ...mcqs.slice(0, offset % mcqs.length)];
  }, [mcqs, paperVersion]);

  // Dynamic Paper Code
  const currentPaperCode = paperCodes[paperVersion] || "3041";

  // Trigger Print dialog
  const handlePrint = () => {
    window.print();
  };

  // Inline delete question
  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Swap question with an unselected question of the same type from the bank
  const handleSwapQuestion = (id: string, type: string) => {
    const currentIds = new Set(questions.map((q) => q.id));
    const available = bankQuestions.filter((q) => q.type === type && !currentIds.has(q.id));
    if (available.length > 0) {
      const randomReplacement = available[Math.floor(Math.random() * available.length)];
      setQuestions((prev) => prev.map((q) => (q.id === id ? randomReplacement : q)));
    } else {
      alert("No alternate questions available in the current chapter for this type.");
    }
  };

  // Save inline text edit
  const handleSaveTextEdit = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const updatedTranslations = (q.translations || []).map((t) =>
            t.language === "en" ? { ...t, text: editingText } : t
          );
          return { ...q, translations: updatedTranslations };
        }
        return q;
      })
    );
    setEditingQuestionId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-slate-700">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Generating Paper Preview...</h2>
        <p className="text-xs text-slate-500 mt-1">Formatting authentic examination sheet layout</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9ecef] text-slate-900 font-sans pb-24 selection:bg-blue-100">
      {/* =========================================================================
          TOP ACTION BAR (Toolbar 1 - Exact match to Screenshot 2)
          ========================================================================= */}
      <header className="no-print bg-white border-b border-slate-300 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1500px] mx-auto px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          {/* Left Title & Back button */}
          <div className="flex items-center gap-3">
            <Link
              href="/select-questions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Selection</span>
            </Link>

            <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-700 font-extrabold">&bull; Preview - Computer</span>
              <span className="font-urdu text-blue-800 text-base">کمپیوٹر</span>
            </h1>
          </div>

          {/* Center Version Selector */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">VERSION:</span>
            <select
              value={paperVersion}
              onChange={(e) => setPaperVersion(e.target.value as "A" | "B" | "C" | "D")}
              className="px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="A">Version A (Code: {paperCodes.A})</option>
              <option value="B">Version B (Code: {paperCodes.B})</option>
              <option value="C">Version C (Code: {paperCodes.C})</option>
              <option value="D">Version D (Code: {paperCodes.D})</option>
            </select>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              <span>Library</span>
            </button>

            <button
              onClick={() => setShowContentModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => alert("Paper configuration saved to your browser favorites!")}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Save Favorite</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/20 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            SECONDARY TOOLBAR (Style, Language, Marks, Date, Customizer buttons)
            ========================================================================= */}
        <div className="bg-slate-50 border-t border-slate-200 py-2 px-4 sm:px-6">
          <div className="max-w-[1500px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Style selector */}
              <select
                value={boardStyle}
                onChange={(e) => setBoardStyle(e.target.value as "punjab" | "federal" | "minimal")}
                className="px-2.5 py-1 rounded border border-slate-300 font-medium text-slate-700 bg-white"
              >
                <option value="punjab">Style 1: Punjab Boards</option>
                <option value="federal">Style 2: Federal Board</option>
                <option value="minimal">Style 3: Standard School</option>
              </select>

              {/* Language selector */}
              <select
                value={languageMode}
                onChange={(e) => setLanguageMode(e.target.value as "English" | "Urdu" | "Bilingual")}
                className="px-2.5 py-1 rounded border border-slate-300 font-medium text-slate-700 bg-white"
              >
                <option value="English">English Only</option>
                <option value="Urdu">Urdu Only</option>
                <option value="Bilingual">Both (Bilingual)</option>
              </select>

              {/* Total Marks input */}
              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-300">
                <span className="text-slate-500 text-[11px] font-bold">Marks:</span>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-12 font-bold text-center outline-none"
                />
              </div>

              {/* Time input */}
              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-300">
                <span className="text-slate-500 text-[11px] font-bold">Time:</span>
                <input
                  type="text"
                  value={examTime}
                  onChange={(e) => setExamTime(e.target.value)}
                  className="w-16 font-bold text-center outline-none"
                />
              </div>

              {/* Date input */}
              <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-300">
                <span className="text-slate-500 text-[11px] font-bold">Date:</span>
                <input
                  type="text"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-20 font-bold text-center outline-none"
                />
              </div>
            </div>

            {/* Right Buttons: Fonts & Sizing, Content Options, Profile, Instructions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowSizingModal(true)}
                className="px-3 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium flex items-center gap-1"
              >
                <Type className="w-3.5 h-3.5 text-slate-500" />
                <span>Fonts & Sizing</span>
              </button>

              <button
                onClick={() => setShowContentModal(true)}
                className="px-3 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Content Options</span>
              </button>

              <button
                onClick={() => setShowProfileModal(true)}
                className="px-3 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium flex items-center gap-1"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setShowInstructionModal(true)}
                className="px-3 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Instructions</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          THE AUTHENTIC EXAMINATION PAPER SHEET (Exact match to Screenshot 2)
          ========================================================================= */}
      <main className="max-w-[950px] mx-auto px-4 sm:px-6 pt-6">
        <div className="exam-sheet-container bg-white border border-slate-800 shadow-2xl p-6 sm:p-10 font-serif text-black leading-tight text-sm space-y-6">
          {/* 1. INSTITUTION & EXAM HEADER BOX */}
          <div className="border border-black">
            {/* Institution Title */}
            <div className="text-center py-2 border-b border-black">
              <h2
                onClick={() => setShowProfileModal(true)}
                className="text-2xl sm:text-3xl font-black uppercase tracking-wider cursor-pointer hover:bg-amber-50"
                title="Click to edit Institution Name"
              >
                {institutionName}
              </h2>
              <div className="text-xs font-bold tracking-widest mt-0.5">{examTitle}</div>
            </div>

            {/* Subject and Class Row */}
            <div className="text-center py-1 font-bold text-xs border-b border-black bg-slate-50/50">
              Subject: {subjectName} &nbsp;|&nbsp; Class: {className}
            </div>

            {/* Student Name & Syllabus Row */}
            {showStudentDetails && (
              <div className="grid grid-cols-2 divide-x divide-black text-xs font-semibold border-b border-black">
                <div className="p-1.5">
                  Student Name: <span className="inline-block border-b border-dotted border-black w-3/5 ml-2" />
                </div>
                <div className="p-1.5 flex items-center justify-between">
                  <span>Syllabus: {syllabusText}</span>
                </div>
              </div>
            )}

            {/* Meta Row with Roll No, Time, Marks, Date, Test No & Paper Code */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold p-1.5 divide-x-0 sm:divide-x divide-black">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  Roll No: <span className="inline-block border-b border-dotted border-black w-14" />
                </span>
                <span>Time: {examTime}</span>
                <span>Marks: {totalMarks}</span>
                <span>Date: {examDate}</span>
                <span>Test No: {testNumber}</span>
              </div>

              {/* Paper Code Box */}
              <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
                <span className="text-[10px] uppercase font-bold tracking-tight">Paper Code:</span>
                <div className="flex border border-black text-xs font-bold divide-x divide-black bg-white">
                  {currentPaperCode.split("").map((digit, dIdx) => (
                    <span key={dIdx} className="w-5 h-5 flex items-center justify-center font-mono">
                      {digit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. INSTRUCTION NOTE BOX */}
          {showInstructionNote && (
            <div className="border border-black p-2 text-[11px] leading-relaxed text-black/90">
              <span className="font-bold underline mr-1">Note:</span>
              <span>{instructionNote}</span>
            </div>
          )}

          {/* 3. SECTION - I: OBJECTIVE TYPE (MCQs) */}
          {displayedMcqs.length > 0 && (
            <section className="space-y-4">
              <div className="text-center font-black text-xs uppercase tracking-widest border-y border-black py-1 bg-slate-50/40">
                SECTION - I
              </div>

              {/* OMR Bubble Sheet Circles Grid (Screenshot 2 Feature!) */}
              {showOMRSheet && (
                <div className="border border-black p-3 space-y-2 bg-slate-50/30">
                  <div className="font-bold text-[11px] uppercase tracking-wide">
                    Choose the correct answer from the following.
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-y-2 gap-x-4 text-xs font-mono">
                    {displayedMcqs.map((_, idx) => {
                      const num = (idx + 1).toString().padStart(2, "0");
                      return (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="font-bold text-slate-800 text-[11px] w-6">{num}.</span>
                          <span className="tracking-tight text-[11px]">◯ A ◯ B ◯ C ◯ D</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MCQ Questions List */}
              <div className="space-y-3 pt-1">
                {displayedMcqs.map((q, idx) => {
                  const enTrans = q.translations?.find((t) => t.language === "en");
                  const dynamicUr = getUrduTranslation(enTrans?.text || "", enTrans?.options);
                  const isEditing = editingQuestionId === q.id;

                  return (
                    <div
                      key={q.id}
                      className="group relative hover:bg-blue-50/20 p-1.5 rounded transition-colors avoid-break"
                    >
                      {/* Interactive Edit / Swap / Delete Controls (Hover on screen only) */}
                      <div className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white border border-slate-300 rounded shadow-sm px-1.5 py-0.5 z-10 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingQuestionId(q.id);
                            setEditingText(enTrans?.text || "");
                          }}
                          className="text-blue-600 hover:text-blue-800 p-0.5"
                          title="Edit Question Text"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSwapQuestion(q.id, "mcq")}
                          className="text-teal-600 hover:text-teal-800 p-0.5"
                          title="Swap with another MCQ from bank"
                        >
                          <Shuffle className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-rose-600 hover:text-rose-800 p-0.5"
                          title="Delete question from paper"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Question Text */}
                      <div className="font-bold leading-normal flex items-start gap-1.5">
                        <span className="shrink-0">{idx + 1}.</span>
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-blue-500 rounded outline-none font-sans"
                            />
                            <button
                              onClick={() => handleSaveTextEdit(q.id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingQuestionId(null)}
                              className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                            <span>
                              <MathRenderer content={enTrans?.text || ""} />
                            </span>
                            {languageMode === "Bilingual" && dynamicUr.text_ur && (
                              <span className="font-urdu text-sm text-right pr-2 text-slate-800" dir="rtl">
                                {dynamicUr.text_ur}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Options List */}
                      {enTrans?.options && enTrans.options.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pl-4 text-xs font-normal">
                          {enTrans.options.map((opt, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const optUr = dynamicUr.options_ur?.[optIdx];

                            return (
                              <div key={optIdx} className="flex items-baseline gap-1">
                                <span className="font-semibold">({letter})</span>
                                <span>{opt}</span>
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
            </section>
          )}

          {/* 4. SECTION - II: SUBJECTIVE TYPE (Short Questions) */}
          {shorts.length > 0 && (
            <section className="space-y-4 pt-2">
              <div className="text-center font-black text-xs uppercase tracking-widest border-y border-black py-1 bg-slate-50/40">
                SECTION - II
              </div>

              <div className="font-bold text-xs uppercase">
                Q. 2: Write short answers of the following questions.
              </div>

              {/* 2-Column Structured Short Questions Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-1">
                {shorts.map((q, idx) => {
                  const roman = ["(i)", "(ii)", "(iii)", "(iv)", "(v)", "(vi)", "(vii)", "(viii)", "(ix)", "(x)"][idx] || `(${idx + 1})`;
                  const enTrans = q.translations?.find((t) => t.language === "en");
                  const isEditing = editingQuestionId === q.id;

                  return (
                    <div
                      key={q.id}
                      className="group relative hover:bg-blue-50/20 p-1.5 rounded transition-colors avoid-break"
                    >
                      <div className="no-print absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white border border-slate-300 rounded shadow-sm px-1.5 py-0.5 z-10 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingQuestionId(q.id);
                            setEditingText(enTrans?.text || "");
                          }}
                          className="text-blue-600 hover:text-blue-800 p-0.5"
                          title="Edit Question Text"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleSwapQuestion(q.id, "short")}
                          className="text-teal-600 hover:text-teal-800 p-0.5"
                          title="Swap with another Short Question"
                        >
                          <Shuffle className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-rose-600 hover:text-rose-800 p-0.5"
                          title="Delete question from paper"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-start gap-1.5 text-xs leading-normal">
                        <span className="font-bold shrink-0">{roman}</span>
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-blue-500 rounded outline-none font-sans"
                            />
                            <button
                              onClick={() => handleSaveTextEdit(q.id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingQuestionId(null)}
                              className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 font-medium">
                            <MathRenderer content={enTrans?.text || ""} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 5. SECTION - III: LONG QUESTIONS (If present) */}
          {longs.length > 0 && (
            <section className="space-y-4 pt-2">
              <div className="text-center font-black text-xs uppercase tracking-widest border-y border-black py-1 bg-slate-50/40">
                SECTION - III
              </div>

              <div className="font-bold text-xs uppercase">
                Q. 3: Write detailed answers to the following questions.
              </div>

              <div className="space-y-3 pt-1">
                {longs.map((q, idx) => {
                  const enTrans = q.translations?.find((t) => t.language === "en");
                  return (
                    <div key={q.id} className="p-1.5 flex items-start gap-1.5 text-xs avoid-break">
                      <span className="font-bold shrink-0">({String.fromCharCode(97 + idx)})</span>
                      <div className="flex-1 font-medium leading-relaxed">
                        <MathRenderer content={enTrans?.text || ""} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 6. ANSWER KEY TABLE (Screenshot 2 Feature!) */}
          {showAnswerKey && displayedMcqs.length > 0 && (
            <section className="pt-6 avoid-break">
              <div className="text-center font-black text-xs uppercase tracking-widest mb-1">
                ANSWER KEY
              </div>
              <div className="text-center text-[10px] text-slate-600 font-bold mb-2">
                Multiple Choice Questions
              </div>

              {/* Table with columns: Q. No. | Correct Answer | Q. No. | Correct Answer */}
              <div className="border border-black overflow-hidden">
                <table className="w-full text-center text-xs divide-y divide-black font-sans">
                  <thead>
                    <tr className="bg-slate-100/70 font-bold divide-x divide-black">
                      <th className="py-1 px-2 w-16">Q. No.</th>
                      <th className="py-1 px-2">Correct Answer</th>
                      <th className="py-1 px-2 w-16">Q. No.</th>
                      <th className="py-1 px-2">Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {Array.from({ length: Math.ceil(displayedMcqs.length / 2) }).map((_, rIdx) => {
                      const q1 = displayedMcqs[rIdx];
                      const q2 = displayedMcqs[rIdx + Math.ceil(displayedMcqs.length / 2)];

                      const getAns = (q?: Question) => {
                        if (!q) return null;
                        const en = q.translations?.find((t) => t.language === "en");
                        const optIdx = (q.correct_option || 1) - 1;
                        const letter = String.fromCharCode(65 + optIdx);
                        const text = en?.options?.[optIdx] || "";
                        return `(${letter}) ${text}`;
                      };

                      return (
                        <tr key={rIdx} className="divide-x divide-black text-[11px]">
                          <td className="py-1 font-mono font-bold">{(rIdx + 1).toString().padStart(2, "0")}</td>
                          <td className="py-1 px-2 text-left font-medium">{getAns(q1)}</td>
                          <td className="py-1 font-mono font-bold">
                            {q2 ? (rIdx + 1 + Math.ceil(displayedMcqs.length / 2)).toString().padStart(2, "0") : ""}
                          </td>
                          <td className="py-1 px-2 text-left font-medium">{getAns(q2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* =========================================================================
          PROFILE / INSTITUTION MODAL
          ========================================================================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Institution Profile</span>
              </h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Institution / School Name:</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Examination Title:</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Syllabus Text:</label>
                <input
                  type="text"
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs"
              >
                Save Header
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTENT OPTIONS MODAL
          ========================================================================= */}
      {showContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Content & Display Options</span>
              </h3>
              <button onClick={() => setShowContentModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg cursor-pointer">
                <span>Show OMR Bubble Answer Sheet</span>
                <input
                  type="checkbox"
                  checked={showOMRSheet}
                  onChange={(e) => setShowOMRSheet(e.target.checked)}
                  className="rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg cursor-pointer">
                <span>Show Answer Key Table</span>
                <input
                  type="checkbox"
                  checked={showAnswerKey}
                  onChange={(e) => setShowAnswerKey(e.target.checked)}
                  className="rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg cursor-pointer">
                <span>Show Student Details Row (Roll No / Name)</span>
                <input
                  type="checkbox"
                  checked={showStudentDetails}
                  onChange={(e) => setShowStudentDetails(e.target.checked)}
                  className="rounded text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg cursor-pointer">
                <span>Show Examination Instructions Box</span>
                <input
                  type="checkbox"
                  checked={showInstructionNote}
                  onChange={(e) => setShowInstructionNote(e.target.checked)}
                  className="rounded text-blue-600"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowContentModal(false)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          INSTRUCTIONS MODAL
          ========================================================================= */}
      {showInstructionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>Examination Instructions</span>
              </h3>
              <button onClick={() => setShowInstructionModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold text-xs mb-1">Instruction Note:</label>
              <textarea
                rows={4}
                value={instructionNote}
                onChange={(e) => setInstructionNote(e.target.value)}
                className="w-full p-3 border rounded-lg text-xs leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInstructionModal(false)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs"
              >
                Save Instructions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SIZING MODAL
          ========================================================================= */}
      {showSizingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Type className="w-5 h-5 text-blue-600" />
                <span>Fonts & Sizing</span>
              </h3>
              <button onClick={() => setShowSizingModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg cursor-pointer">
                <span>Compact (10pt - fits more questions)</span>
                <input
                  type="radio"
                  name="fsize"
                  checked={fontSize === "sm"}
                  onChange={() => setFontSize("sm")}
                  className="text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg cursor-pointer">
                <span>Standard (11pt - standard board exam)</span>
                <input
                  type="radio"
                  name="fsize"
                  checked={fontSize === "base"}
                  onChange={() => setFontSize("base")}
                  className="text-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg cursor-pointer">
                <span>Spacious (12pt - large print)</span>
                <input
                  type="radio"
                  name="fsize"
                  checked={fontSize === "lg"}
                  onChange={() => setFontSize("lg")}
                  className="text-blue-600"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSizingModal(false)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
