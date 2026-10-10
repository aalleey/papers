"use client";

import React, { useState, useEffect } from "react";
import { Question, Chapter, Topic, QuestionType, QuestionDifficulty, QuestionSource } from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import { QuestionRenderer } from "@/components/QuestionRenderer";
import {
  X,
  Eye,
  Edit3,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Award,
  Layers,
  Languages,
} from "lucide-react";

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  chapters: Chapter[];
  topics: Topic[];
  selectedChapterId?: string;
  initialQuestion?: Question | null;
  mode?: "create" | "edit" | "duplicate";
}

export function QuestionFormModal({
  isOpen,
  onClose,
  onSaved,
  chapters,
  topics,
  selectedChapterId,
  initialQuestion,
  mode = "create",
}: QuestionFormModalProps) {
  const [activeTab, setActiveTab] = useState<"en" | "ur">("en");
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Form Fields
  const [chapterId, setChapterId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [type, setType] = useState<QuestionType>("mcq");
  const [source, setSource] = useState<QuestionSource>("exercise");
  const [sourceRef, setSourceRef] = useState("");
  const [conceptTag, setConceptTag] = useState("");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("medium");
  const [marks, setMarks] = useState(1);
  const [correctOption, setCorrectOption] = useState<number>(1);
  const [sourceNote, setSourceNote] = useState("");

  // English
  const [textEn, setTextEn] = useState("");
  const [optionsEn, setOptionsEn] = useState(["", "", "", ""]);
  const [answerEn, setAnswerEn] = useState("");

  // Urdu
  const [textUr, setTextUr] = useState("");
  const [optionsUr, setOptionsUr] = useState(["", "", "", ""]);
  const [answerUr, setAnswerUr] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (initialQuestion) {
      setChapterId(initialQuestion.chapter_id);
      setTopicId(initialQuestion.topic_id || "");
      setType(initialQuestion.type);
      setSource(initialQuestion.source);
      setSourceRef(initialQuestion.source_ref || "");
      setConceptTag(initialQuestion.concept_tag || "");
      setDifficulty(initialQuestion.difficulty);
      setMarks(initialQuestion.marks);
      setCorrectOption(initialQuestion.correct_option || 1);
      setSourceNote(initialQuestion.source_note || "");

      const en = initialQuestion.translations?.find((t) => t.language === "en");
      const ur = initialQuestion.translations?.find((t) => t.language === "ur");

      setTextEn(en?.text || "");
      setOptionsEn(en?.options && en.options.length === 4 ? [...en.options] : ["", "", "", ""]);
      setAnswerEn(en?.answer || "");

      setTextUr(ur?.text || "");
      setOptionsUr(ur?.options && ur.options.length === 4 ? [...ur.options] : ["", "", "", ""]);
      setAnswerUr(ur?.answer || "");
    } else {
      setChapterId(selectedChapterId || (chapters[0]?.id ?? ""));
      setTopicId("");
      setType("mcq");
      setSource("exercise");
      setSourceRef("");
      setConceptTag("");
      setDifficulty("medium");
      setMarks(1);
      setCorrectOption(1);
      setSourceNote("");

      setTextEn("");
      setOptionsEn(["", "", "", ""]);
      setAnswerEn("");

      setTextUr("");
      setOptionsUr(["", "", "", ""]);
      setAnswerUr("");
    }
    setError(null);
  }, [initialQuestion, selectedChapterId, chapters, isOpen]);

  // Adjust default marks when type changes
  const handleTypeChange = (newType: QuestionType) => {
    setType(newType);
    if (newType === "mcq") setMarks(1);
    else if (newType === "short") setMarks(2);
    else if (newType === "long") setMarks(5);
  };

  const handleOptionEnChange = (index: number, val: string) => {
    const updated = [...optionsEn];
    updated[index] = val;
    setOptionsEn(updated);
  };

  const handleOptionUrChange = (index: number, val: string) => {
    const updated = [...optionsUr];
    updated[index] = val;
    setOptionsUr(updated);
  };

  // Filter topics for selected chapter
  const filteredTopics = topics.filter((t) => t.chapter_id === chapterId);

  // Live preview model
  const previewQuestion: Partial<Question> = {
    type,
    difficulty,
    marks,
    concept_tag: conceptTag || undefined,
    source_ref: sourceRef || undefined,
    correct_option: type === "mcq" ? correctOption : undefined,
    translations: [
      {
        language: "en",
        text: textEn || "Your English question text with math like $x^2 + \\frac{1}{2}$ will preview here...",
        options: type === "mcq" ? optionsEn : null,
        answer: answerEn || null,
      },
      ...(textUr.trim()
        ? [
            {
              language: "ur" as const,
              text: textUr,
              options: type === "mcq" ? optionsUr : null,
              answer: answerUr || null,
            },
          ]
        : []),
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!chapterId) {
      setError("Please select a Chapter");
      return;
    }
    if (!textEn.trim()) {
      setError("English question text is required");
      return;
    }
    if (type === "mcq") {
      if (optionsEn.some((opt) => !opt.trim())) {
        setError("All 4 options (A, B, C, D) are required for English MCQ");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        id: mode === "edit" ? initialQuestion?.id : undefined,
        chapter_id: chapterId,
        topic_id: topicId || null,
        type,
        source,
        source_ref: sourceRef || null,
        concept_tag: conceptTag || null,
        correct_option: type === "mcq" ? correctOption : null,
        marks,
        difficulty,
        is_active: initialQuestion ? initialQuestion.is_active : true,
        source_note: sourceNote || null,
        text_en: textEn.trim(),
        options_en: type === "mcq" ? optionsEn : null,
        answer_en: answerEn.trim() || null,
        text_ur: textUr.trim() || null,
        options_ur: type === "mcq" ? optionsUr : null,
        answer_ur: answerUr.trim() || null,
      };

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save question");
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error saving question";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              {mode === "edit" ? <Edit3 className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {mode === "edit"
                  ? "Edit Question"
                  : mode === "duplicate"
                  ? "Duplicate Question (New Draft)"
                  : "Add New Question"}
              </h2>
              <p className="text-xs text-slate-500">
                Supports KaTeX math formulas (wrapped in <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">$...$</code>) and bilingual Noto Nastaliq Urdu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                showLivePreview
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showLivePreview ? "Preview Active" : "Preview Hidden"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Controls */}
            <div className={showLivePreview ? "lg:col-span-7 space-y-5" : "lg:col-span-12 space-y-5"}>
              {/* Hierarchy: Chapter & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Chapter *
                  </label>
                  <select
                    value={chapterId}
                    onChange={(e) => {
                      setChapterId(e.target.value);
                      setTopicId("");
                    }}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Ch {ch.number}: {ch.title} {ch.title_ur ? `(${ch.title_ur})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Topic (Optional)
                  </label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">-- No specific topic --</option>
                    {filteredTopics.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.number}. {top.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Metadata Row: Type, Difficulty, Marks, Source */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Question Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="short">Short Question</option>
                    <option value="long">Long Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Source
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as QuestionSource)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="exercise">Exercise</option>
                    <option value="past_paper">Past Paper</option>
                    <option value="extra">Extra / Conceptual</option>
                  </select>
                </div>
              </div>

              {/* Extra Ref & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Source Reference (e.g., Ex 1.1 Q1 / LHR 2023)
                  </label>
                  <input
                    type="text"
                    value={sourceRef}
                    onChange={(e) => setSourceRef(e.target.value)}
                    placeholder="Ex 1.1 Q2 (ii)"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Concept Tag
                  </label>
                  <input
                    type="text"
                    value={conceptTag}
                    onChange={(e) => setConceptTag(e.target.value)}
                    placeholder="quadratic_formula"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bilingual Tabs */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="flex border-b border-slate-200 bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab("en")}
                    className={`flex-1 py-2.5 px-4 text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                      activeTab === "en"
                        ? "bg-white text-emerald-800 border-b-2 border-emerald-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Languages className="w-4 h-4" />
                    <span>English Version (Required)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("ur")}
                    className={`flex-1 py-2.5 px-4 text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                      activeTab === "ur"
                        ? "bg-white text-emerald-800 border-b-2 border-emerald-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="font-urdu text-sm">اردو ورژن</span>
                    <span>Urdu Version (Optional)</span>
                  </button>
                </div>

                <div className="p-4 space-y-4 bg-white">
                  {/* English Tab Content */}
                  {activeTab === "en" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                          English Question Statement *
                        </label>
                        <textarea
                          rows={3}
                          value={textEn}
                          onChange={(e) => setTextEn(e.target.value)}
                          required
                          placeholder="e.g. The roots of $ax^2 + bx + c = 0$ are real if the discriminant..."
                          className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans"
                        />
                      </div>

                      {/* If MCQ, show 4 options */}
                      {type === "mcq" && (
                        <div className="space-y-3 pt-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            MCQ Options & Select Correct Answer
                          </label>
                          <div className="space-y-2.5">
                            {["A", "B", "C", "D"].map((letter, idx) => {
                              const optNum = idx + 1;
                              const isChecked = correctOption === optNum;
                              return (
                                <div key={letter} className="flex items-center gap-2.5">
                                  <label
                                    className={`flex items-center justify-center w-8 h-8 rounded-lg border font-bold text-xs cursor-pointer transition-colors ${
                                      isChecked
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                                    }`}
                                    title="Mark as correct answer"
                                  >
                                    <input
                                      type="radio"
                                      name="correct_option_en"
                                      checked={isChecked}
                                      onChange={() => setCorrectOption(optNum)}
                                      className="sr-only"
                                    />
                                    {letter}
                                  </label>
                                  <input
                                    type="text"
                                    value={optionsEn[idx]}
                                    onChange={(e) => handleOptionEnChange(idx, e.target.value)}
                                    placeholder={`Option ${letter} (e.g. $b^2 - 4ac \\ge 0$)`}
                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                  />
                                  {isChecked && (
                                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                                      Correct
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* If Short/Long, show Answer */}
                      {type !== "mcq" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                            Answer / Solution (English)
                          </label>
                          <textarea
                            rows={3}
                            value={answerEn}
                            onChange={(e) => setAnswerEn(e.target.value)}
                            placeholder="Complete solution or key steps with LaTeX math..."
                            className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Urdu Tab Content */}
                  {activeTab === "ur" && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] text-slate-400">RTL Enabled</span>
                          <label className="text-xs font-bold text-slate-700 font-urdu text-base">
                            اردو سوال کا متن
                          </label>
                        </div>
                        <textarea
                          rows={3}
                          dir="rtl"
                          value={textUr}
                          onChange={(e) => setTextUr(e.target.value)}
                          placeholder="مثال: دو درجی مساوات $ax^2 + bx + c = 0$ کو حل کرنے کے لیے..."
                          className="w-full p-3 rounded-xl border border-slate-300 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none font-urdu leading-loose"
                        />
                      </div>

                      {type === "mcq" && (
                        <div className="space-y-3 pt-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-right font-urdu text-sm">
                            اردو آپشنز (اختیارات)
                          </label>
                          <div className="space-y-2.5">
                            {["A", "B", "C", "D"].map((letter, idx) => {
                              const optNum = idx + 1;
                              const isChecked = correctOption === optNum;
                              return (
                                <div key={letter} className="flex items-center gap-2.5">
                                  <label
                                    className={`flex items-center justify-center w-8 h-8 rounded-lg border font-bold text-xs cursor-pointer transition-colors ${
                                      isChecked
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : "bg-slate-100 text-slate-700 border-slate-300"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="correct_option_ur"
                                      checked={isChecked}
                                      onChange={() => setCorrectOption(optNum)}
                                      className="sr-only"
                                    />
                                    {letter}
                                  </label>
                                  <input
                                    type="text"
                                    dir="rtl"
                                    value={optionsUr[idx]}
                                    onChange={(e) => handleOptionUrChange(idx, e.target.value)}
                                    placeholder={`آپشن ${letter}`}
                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-urdu"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {type !== "mcq" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 text-right font-urdu text-sm">
                            اردو حل / جواب
                          </label>
                          <textarea
                            rows={3}
                            dir="rtl"
                            value={answerUr}
                            onChange={(e) => setAnswerUr(e.target.value)}
                            placeholder="مکمل جواب یا ثبوت..."
                            className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-urdu leading-loose"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Live KaTeX & Urdu Preview */}
            {showLivePreview && (
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    <span>Real-time Live Preview</span>
                  </div>
                  <span className="text-[11px] text-slate-400">KaTeX Math + Urdu</span>
                </div>

                <div className="sticky top-0">
                  <QuestionRenderer question={previewQuestion} showAnswer={true} />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-950/20 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Question"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
