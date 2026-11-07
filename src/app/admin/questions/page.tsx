"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Board,
  ClassItem,
  Course,
  Subject,
  Chapter,
  Topic,
  Question,
  QuestionType,
  QuestionDifficulty,
  QuestionSource,
} from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import { QuestionFormModal } from "@/components/admin/QuestionFormModal";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Copy,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  RefreshCw,
  HelpCircle,
  Layers,
  Award,
  Bookmark,
  Languages,
  Sparkles,
  BookOpen,
} from "lucide-react";

function hasAnyAnswer(q: Question): boolean {
  return Boolean(q.translations?.some((t) => Boolean(t.answer && t.answer.trim())));
}

function hasCompleteBilingualAnswer(q: Question): boolean {
  const enAns = q.translations?.find((t) => t.language === "en")?.answer?.trim();
  const urAns = q.translations?.find((t) => t.language === "ur")?.answer?.trim();
  return Boolean(enAns && urAns);
}

export default function QuestionsAdminPage() {
  // Cascading hierarchy state
  const [boards, setBoards] = useState<Board[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("all");

  // Filter state
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterTopicId, setFilterTopicId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyMissingAnswers, setOnlyMissingAnswers] = useState(false);

  // Data & Modal state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "duplicate">("create");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // AI Solved Answer Generator state
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);
  const [aiRowId, setAiRowId] = useState<string | null>(null);
  const [aiToast, setAiToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Initial load: Boards, Classes
  useEffect(() => {
    async function loadHierarchy() {
      try {
        const [boardsRes, classesRes] = await Promise.all([
          fetch("/api/boards").then((r) => r.json()),
          fetch("/api/classes").then((r) => r.json()),
        ]);

        if (boardsRes.boards?.length) {
          setBoards(boardsRes.boards);
          setSelectedBoardId(boardsRes.boards[0].id);
        }
        if (classesRes.classes?.length) {
          setClasses(classesRes.classes);
          // Default to Class 10 if exists
          const c10 = classesRes.classes.find((c: ClassItem) => c.numeric_order === 10);
          setSelectedClassId(c10 ? c10.id : classesRes.classes[0].id);
        }
      } catch (err) {
        console.error("Failed to load boards/classes", err);
      }
    }
    loadHierarchy();
  }, []);

  // When Board or Class changes -> load Courses
  useEffect(() => {
    if (!selectedBoardId) return;
    async function loadCourses() {
      try {
        const res = await fetch(`/api/courses?boardId=${selectedBoardId}`).then((r) => r.json());
        if (res.courses?.length) {
          setCourses(res.courses);
          // Pick course matching selected class if possible
          const matched = res.courses.find((c: Course) => c.class_id === selectedClassId);
          setSelectedCourseId(matched ? matched.id : res.courses[0].id);
        } else {
          setCourses([]);
          setSelectedCourseId("");
        }
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    }
    loadCourses();
  }, [selectedBoardId, selectedClassId]);

  // When Course changes -> load Subjects
  useEffect(() => {
    if (!selectedCourseId) return;
    async function loadSubjects() {
      try {
        const res = await fetch(`/api/subjects?courseId=${selectedCourseId}`).then((r) => r.json());
        if (res.subjects?.length) {
          setSubjects(res.subjects);
          setSelectedSubjectId(res.subjects[0].id);
        } else {
          setSubjects([]);
          setSelectedSubjectId("");
        }
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    }
    loadSubjects();
  }, [selectedCourseId]);

  // When Subject changes -> load Chapters & Questions
  useEffect(() => {
    if (!selectedSubjectId) return;
    async function loadChaptersAndQuestions() {
      setLoading(true);
      try {
        const [chapRes, qRes] = await Promise.all([
          fetch(`/api/chapters?subjectId=${selectedSubjectId}`).then((r) => r.json()),
          fetch(`/api/questions`).then((r) => r.json()),
        ]);

        if (chapRes.chapters?.length) {
          setChapters(chapRes.chapters);
          setSelectedChapterId("all");
          // load topics for all chapters in subject
          const allTopics: Topic[] = [];
          for (const ch of chapRes.chapters) {
            const topRes = await fetch(`/api/topics?chapterId=${ch.id}`).then((r) => r.json());
            if (topRes.topics) allTopics.push(...topRes.topics);
          }
          setTopics(allTopics);
        } else {
          setChapters([]);
          setTopics([]);
        }

        if (qRes.questions) {
          setQuestions(qRes.questions);
        }
      } catch (err) {
        console.error("Failed to load chapters/questions", err);
      } finally {
        setLoading(false);
      }
    }
    loadChaptersAndQuestions();
  }, [selectedSubjectId]);

  // Refresh questions list
  const refreshQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/questions").then((r) => r.json());
      if (res.questions) setQuestions(res.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string) => {
    try {
      await fetch(`/api/questions/${id}/toggle`, { method: "POST" });
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, is_active: !q.is_active } : q))
      );
    } catch (err) {
      console.error("Failed to toggle active", err);
    }
  };

  // Delete question
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await fetch(`/api/questions/${id}`, { method: "DELETE" });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Failed to delete question", err);
    }
  };

  // Filtered Questions in memory based on cascading selections & filters
  const filteredQuestions = useMemo(() => {
    const chapterIdsInSubject = new Set(chapters.map((c) => c.id));

    return questions.filter((q) => {
      // Must belong to this subject
      if (!chapterIdsInSubject.has(q.chapter_id)) return false;

      // Chapter filter
      if (selectedChapterId !== "all" && q.chapter_id !== selectedChapterId) return false;

      // Type filter
      if (filterType !== "all" && q.type !== filterType) return false;

      // Difficulty filter
      if (filterDifficulty !== "all" && q.difficulty !== filterDifficulty) return false;

      // Source filter
      if (filterSource !== "all" && q.source !== filterSource) return false;

      // Topic filter
      if (filterTopicId !== "all" && q.topic_id !== filterTopicId) return false;

      // Missing solved answers filter (Short & Long only)
      if (onlyMissingAnswers && (q.type === "mcq" || hasCompleteBilingualAnswer(q))) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const sq = searchQuery.toLowerCase();
        const enText = q.translations?.find((t) => t.language === "en")?.text.toLowerCase() || "";
        const urText = q.translations?.find((t) => t.language === "ur")?.text.toLowerCase() || "";
        const ref = q.source_ref?.toLowerCase() || "";
        const tag = q.concept_tag?.toLowerCase() || "";
        return enText.includes(sq) || urText.includes(sq) || ref.includes(sq) || tag.includes(sq);
      }

      return true;
    });
  }, [
    questions,
    chapters,
    selectedChapterId,
    filterType,
    filterDifficulty,
    filterSource,
    filterTopicId,
    onlyMissingAnswers,
    searchQuery,
  ]);

  const unansweredShortLongIds = useMemo(() => {
    return filteredQuestions
      .filter((q) => q.type !== "mcq" && !hasCompleteBilingualAnswer(q))
      .map((q) => q.id);
  }, [filteredQuestions]);

  const currentClassName = useMemo(
    () => classes.find((c) => c.id === selectedClassId)?.name || "",
    [classes, selectedClassId]
  );
  const currentSubjectName = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId)?.name || "",
    [subjects, selectedSubjectId]
  );
  const currentChapterTitle = useMemo(() => {
    if (selectedChapterId === "all") return "";
    const ch = chapters.find((c) => c.id === selectedChapterId);
    return ch ? `Unit ${ch.number}: ${ch.title}` : "";
  }, [chapters, selectedChapterId]);

  const mergeUpdatedQuestions = (updatedList: Question[]) => {
    if (!updatedList.length) return;
    const map = new Map(updatedList.map((u) => [u.id, u]));
    setQuestions((prev) => prev.map((q) => map.get(q.id) || q));
  };

  const handleBatchGenerateAnswers = async () => {
    if (batchGenerating || unansweredShortLongIds.length === 0) return;
    const total = unansweredShortLongIds.length;
    setBatchGenerating(true);
    setBatchProgress({ done: 0, total });
    setAiToast(null);

    let solvedTotal = 0;
    try {
      const CHUNK_SIZE = 10;
      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = unansweredShortLongIds.slice(i, i + CHUNK_SIZE);
        const res = await fetch("/api/admin/generate-answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "batch",
            questionIds: chunk,
            overwrite: false,
            className: currentClassName,
            subjectName: currentSubjectName,
            chapterTitle: currentChapterTitle,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Batch AI answer generation failed.");
        }
        if (Array.isArray(data.updatedQuestions)) {
          mergeUpdatedQuestions(data.updatedQuestions);
          solvedTotal += data.updatedQuestions.length;
        }
        setBatchProgress({ done: Math.min(i + chunk.length, total), total });
      }
      setAiToast({
        type: "success",
        message: `Generated & saved bilingual (English + Urdu) study-notes answers for ${solvedTotal} Short/Long questions.`,
      });
    } catch (err: unknown) {
      setAiToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to generate AI answers.",
      });
    } finally {
      setBatchGenerating(false);
      setBatchProgress(null);
    }
  };

  const handleSingleRowAiAnswer = async (q: Question) => {
    if (aiRowId || batchGenerating || q.type === "mcq") return;
    setAiRowId(q.id);
    setAiToast(null);
    const ch = chapters.find((c) => c.id === q.chapter_id);
    try {
      const res = await fetch("/api/admin/generate-answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "batch",
          questionIds: [q.id],
          overwrite: hasCompleteBilingualAnswer(q),
          className: currentClassName,
          subjectName: currentSubjectName,
          chapterTitle: ch ? `Unit ${ch.number}: ${ch.title}` : currentChapterTitle,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI answer generation failed.");
      }
      if (Array.isArray(data.updatedQuestions) && data.updatedQuestions.length > 0) {
        mergeUpdatedQuestions(data.updatedQuestions);
        setAiToast({
          type: "success",
          message: "Saved AI-generated English & Urdu answer for this question.",
        });
      }
    } catch (err: unknown) {
      setAiToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to generate AI answer.",
      });
    } finally {
      setAiRowId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Executive Header Bar (3D Liquid Glass) */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white/85 via-white/70 to-white/85 backdrop-blur-2xl saturate-150 p-5 sm:p-6 rounded-3xl border border-white/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
            <span>Admin Console</span>
            <span className="text-slate-300">/</span>
            <span>Curriculum Question Bank</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Questions Bank</h1>
            <span className="px-3 py-0.5 rounded-xl text-xs font-extrabold bg-emerald-500/15 text-emerald-800 border border-emerald-500/25 tabular-nums">
              {filteredQuestions.length} Questions
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Browse, filter, edit, or auto-generate solved Study Notes answers (English + Urdu Nastaliq) with AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/notes"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 hover:text-emerald-800 font-extrabold text-xs shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>View /notes</span>
          </Link>

          {unansweredShortLongIds.length > 0 && (
            <button
              type="button"
              onClick={handleBatchGenerateAnswers}
              disabled={batchGenerating}
              title="Auto-generate and save English + Urdu Study Notes answers for filtered Short & Long questions"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-extrabold text-xs border border-indigo-400/70 shadow-[0_3px_0_0_#3730a3,0_8px_18px_-4px_rgba(79,70,229,0.4),inset_0_1px_0_rgba(255,255,255,0.45)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer tabular-nums"
            >
              <Sparkles className={`w-4 h-4 ${batchGenerating ? "animate-spin" : ""}`} />
              <span>
                {batchGenerating && batchProgress
                  ? `Solving ${batchProgress.done}/${batchProgress.total}...`
                  : `AI Solve Answers (${unansweredShortLongIds.length})`}
              </span>
            </button>
          )}

          <Link
            href="/admin/import"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-800 font-extrabold text-xs shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>HTML / CSV Import</span>
          </Link>

          <button
            onClick={() => {
              setSelectedQuestion(null);
              setModalMode("create");
              setModalOpen(true);
            }}
            className="relative overflow-hidden inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-extrabold text-xs border border-emerald-300/80 shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.45),inset_0_2px_1px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {aiToast && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
            aiToast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{aiToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setAiToast(null)}
            className="text-[11px] font-extrabold underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Cascading Hierarchy Selection Bar */}
      <div className="bg-white/85 backdrop-blur-2xl p-4 sm:p-5 rounded-3xl border border-white/90 shadow-[0_12px_30px_-10px_rgba(15,23,42,0.08),0_3px_0_0_rgba(203,213,225,0.6)] space-y-3.5">
        <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Curriculum Hierarchy Selection</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Board */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">Board</label>
            <select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/90 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.name_ur ? `(${b.name_ur})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Class */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/90 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Course */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/90 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              {courses.map((cr) => (
                <option key={cr.id} value={cr.id}>
                  {cr.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Subject */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/90 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.name_ur ? `(${s.name_ur})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Chapter */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">Chapter</label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/90 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Chapters ({chapters.length})</option>
              {chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Ch {ch.number}: {ch.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/85 backdrop-blur-2xl p-4 rounded-2xl border border-white/90 shadow-[0_10px_25px_-10px_rgba(15,23,42,0.06),0_3px_0_0_rgba(203,213,225,0.6)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search question statement, KaTeX math, concept tags, or board reference..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/90 focus:bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Type Segmented Filter */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
            {[
              { id: "all", label: "All Types" },
              { id: "mcq", label: "MCQs" },
              { id: "short", label: "Shorts" },
              { id: "long", label: "Longs" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterType(t.id)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterType === t.id
                    ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Source */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="exercise">Textbook Exercise</option>
            <option value="past_paper">Past Board Papers</option>
            <option value="extra">Extra / Conceptual</option>
          </select>

          {/* Missing Solved Answers Filter */}
          <button
            type="button"
            onClick={() => setOnlyMissingAnswers((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
              onlyMissingAnswers
                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Missing Answers</span>
          </button>
        </div>
      </div>

      {/* Questions List (Responsive Mobile Cards + Desktop Table) */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.1),0_4px_0_0_rgba(203,213,225,0.65)] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-bold text-slate-600">Loading questions from question bank...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">No questions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No questions matched your current curriculum filters or search term. Try adjusting your filters or click Add Question.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile & Tablet Cards (< lg) */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredQuestions.map((q) => {
                const enTrans = q.translations?.find((t) => t.language === "en");
                const urTrans = q.translations?.find((t) => t.language === "ur");
                const ch = chapters.find((c) => c.id === q.chapter_id);

                const typeBadge =
                  q.type === "mcq"
                    ? "bg-purple-100 text-purple-800"
                    : q.type === "short"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-amber-100 text-amber-800";

                return (
                  <div key={q.id} className={`p-4 space-y-2.5 ${!q.is_active ? "opacity-60 bg-slate-50" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${typeBadge}`}>
                          {q.type}
                        </span>
                        {ch && (
                          <span className="text-xs font-bold text-slate-700">
                            Ch {ch.number}: {ch.title}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-600 tabular-nums">
                        {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed">
                      <MathRenderer content={enTrans?.text || "No text"} />
                    </div>

                    {urTrans?.text && (
                      <div className="text-right font-urdu text-sm text-slate-700 leading-loose pt-1 border-t border-slate-100" dir="rtl">
                        <MathRenderer content={urTrans.text} />
                      </div>
                    )}

                    {q.type !== "mcq" && (
                      <div className="pt-1">
                        {hasAnyAnswer(q) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>
                              {hasCompleteBilingualAnswer(q) ? "Answer Saved (EN + اردو)" : "Answer Saved (Partial)"}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span>No Study Notes Answer</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleToggleActive(q.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          q.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {q.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{q.is_active ? "Active" : "Inactive"}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {q.type !== "mcq" && (
                          <button
                            type="button"
                            onClick={() => handleSingleRowAiAnswer(q)}
                            disabled={aiRowId === q.id || batchGenerating}
                            title="AI Generate Study Notes Answer (EN + اردو)"
                            className="p-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${aiRowId === q.id ? "animate-spin" : ""}`} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedQuestion(q);
                            setModalMode("edit");
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuestion(q);
                            setModalMode("duplicate");
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (lg+) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Question Statement (English &amp; Urdu Nastaliq)</th>
                    <th className="py-3.5 px-4">Chapter</th>
                    <th className="py-3.5 px-4">Marks / Diff</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredQuestions.map((q) => {
                    const enTrans = q.translations?.find((t) => t.language === "en");
                    const urTrans = q.translations?.find((t) => t.language === "ur");
                    const ch = chapters.find((c) => c.id === q.chapter_id);

                    const typeBadge =
                      q.type === "mcq"
                        ? "bg-purple-100 text-purple-800"
                        : q.type === "short"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800";

                    const diffBadge =
                      q.difficulty === "easy"
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : q.difficulty === "hard"
                        ? "text-rose-700 bg-rose-50 border-rose-200"
                        : "text-sky-700 bg-sky-50 border-sky-200";

                    return (
                      <tr
                        key={q.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !q.is_active ? "opacity-60 bg-slate-50/40" : ""
                        }`}
                      >
                        {/* Type Badge */}
                        <td className="py-3.5 px-4 align-top">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${typeBadge}`}
                          >
                            {q.type}
                          </span>
                        </td>

                        {/* Question Preview */}
                        <td className="py-3.5 px-4 align-top max-w-xl">
                          <div className="space-y-1.5">
                            <div className="text-slate-800 font-medium leading-relaxed text-xs sm:text-sm">
                              <MathRenderer content={enTrans?.text || "No text"} />
                            </div>

                            {/* Urdu Text Snippet */}
                            {urTrans?.text && (
                              <div className="pt-1 text-slate-600 border-t border-slate-100">
                                <UrduText content={urTrans.text} className="text-sm line-clamp-1" />
                              </div>
                            )}

                            {/* Saved Answer Preview for Short & Long */}
                            {q.type !== "mcq" && enTrans?.answer?.trim() && (
                              <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 line-clamp-2">
                                <span className="font-extrabold text-emerald-800 mr-1.5">Ans:</span>
                                <MathRenderer content={enTrans.answer} />
                              </div>
                            )}

                            {/* Extra Badges: Options count, answer status, source_ref, concept tag */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                              {q.type === "mcq" && q.correct_option && (
                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Correct: Option {String.fromCharCode(64 + q.correct_option)}
                                </span>
                              )}
                              {q.type !== "mcq" && (
                                hasAnyAnswer(q) ? (
                                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>
                                      {hasCompleteBilingualAnswer(q) ? "Answer Saved (EN+UR)" : "Answer Saved"}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    No Answer
                                  </span>
                                )
                              )}
                              {q.concept_tag && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                  #{q.concept_tag}
                                </span>
                              )}
                              {q.source_ref && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                  {q.source_ref}
                                </span>
                              )}
                              {urTrans && (
                                <span className="inline-flex items-center gap-1 font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                  <Languages className="w-3 h-3" />
                                  <span>Bilingual</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Chapter */}
                        <td className="py-3.5 px-4 align-top text-xs text-slate-600 whitespace-nowrap">
                          {ch ? (
                            <div>
                              <span className="font-bold text-slate-800">Ch {ch.number}</span>
                              <div className="text-slate-500 truncate max-w-[150px]">{ch.title}</div>
                            </div>
                          ) : (
                            "Unknown"
                          )}
                        </td>

                        {/* Marks / Diff */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap tabular-nums">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-700 block">
                              {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                            </span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize border ${diffBadge}`}
                            >
                              {q.difficulty}
                            </span>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(q.id)}
                            title={q.is_active ? "Click to deactivate" : "Click to activate"}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                              q.is_active
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {q.is_active ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {q.type !== "mcq" && (
                              <button
                                type="button"
                                onClick={() => handleSingleRowAiAnswer(q)}
                                disabled={aiRowId === q.id || batchGenerating}
                                title={
                                  hasCompleteBilingualAnswer(q)
                                    ? "Regenerate Study Notes Answer with AI (EN + اردو)"
                                    : "AI Generate Study Notes Answer (EN + اردو)"
                                }
                                className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 disabled:opacity-50 transition-colors cursor-pointer"
                              >
                                <Sparkles className={`w-4 h-4 ${aiRowId === q.id ? "animate-spin" : ""}`} />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedQuestion(q);
                                setModalMode("edit");
                                setModalOpen(true);
                              }}
                              title="Edit Question"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedQuestion(q);
                                setModalMode("duplicate");
                                setModalOpen(true);
                              }}
                              title="Duplicate Question"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors cursor-pointer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(q.id)}
                              title="Delete Question"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={refreshQuestions}
        chapters={chapters}
        topics={topics}
        selectedChapterId={selectedChapterId !== "all" ? selectedChapterId : undefined}
        initialQuestion={selectedQuestion}
        mode={modalMode}
      />
    </div>
  );
}
