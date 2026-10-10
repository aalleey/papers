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
} from "lucide-react";

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

  // Data & Modal state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "duplicate">("create");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

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
    searchQuery,
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Questions Bank</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {filteredQuestions.length} Questions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, edit, or import bilingual exam questions with KaTeX mathematical formulas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/import"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>CSV Import</span>
          </Link>

          <button
            onClick={() => {
              setSelectedQuestion(null);
              setModalMode("create");
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Cascading Hierarchy Selection Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Curriculum Hierarchy Selection</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Board */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Board</label>
            <select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Chapter</label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question text, formulas, concept tags, ref..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Question Type */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="mcq">MCQ (Multiple Choice)</option>
              <option value="short">Short Question</option>
              <option value="long">Long Question</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Source */}
          <div>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">All Sources</option>
              <option value="exercise">Textbook Exercise</option>
              <option value="past_paper">Past Board Papers</option>
              <option value="extra">Extra / Conceptual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p className="text-sm font-medium">Loading questions from question bank...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-150 text-slate-400 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No questions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No questions matched your current curriculum filters or search term. Try adjusting your filters or click Add Question.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Question Statement (with KaTeX Math)</th>
                  <th className="py-3 px-4">Chapter</th>
                  <th className="py-3 px-4">Marks / Diff</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
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
                          <div className="text-slate-800 font-medium leading-relaxed">
                            <MathRenderer content={enTrans?.text || "No text"} />
                          </div>

                          {/* Urdu Text Snippet */}
                          {urTrans?.text && (
                            <div className="pt-1 text-slate-600 border-t border-slate-100">
                              <UrduText content={urTrans.text} className="text-sm line-clamp-1" />
                            </div>
                          )}

                          {/* Extra Badges: Options count, source_ref, concept tag */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                            {q.type === "mcq" && q.correct_option && (
                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Correct: Option {String.fromCharCode(64 + q.correct_option)}
                              </span>
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
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
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
                          <button
                            onClick={() => {
                              setSelectedQuestion(q);
                              setModalMode("edit");
                              setModalOpen(true);
                            }}
                            title="Edit Question"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors"
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(q.id)}
                            title="Delete Question"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
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
