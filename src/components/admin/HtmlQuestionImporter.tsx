// src/components/admin/HtmlQuestionImporter.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Course, Subject, Chapter, Topic } from "@/lib/types";
import { ParsedHtmlMetadata, ParsedQuestionItem } from "@/lib/html-question-parser";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import Link from "next/link";
import {
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  BookOpen,
  Bookmark,
  Check,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Clipboard,
  X,
  ExternalLink,
} from "lucide-react";

interface QuestionWithDuplicate extends ParsedQuestionItem {
  isDuplicate?: boolean;
}

export function HtmlQuestionImporter() {
  // Database hierarchy state
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Selection state
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [targetChapterChoice, setTargetChapterChoice] = useState<"new" | "existing">("new");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [customChapterNumber, setCustomChapterNumber] = useState<number>(1);
  const [customChapterTitle, setCustomChapterTitle] = useState("");
  const [customChapterTitleUr, setCustomChapterTitleUr] = useState("");
  const [createMissingTopics, setCreateMissingTopics] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Input state
  const [inputMode, setInputMode] = useState<"file" | "paste">("file");
  const [rawHtmlText, setRawHtmlText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parsing / Preview state
  const [parsing, setParsing] = useState(false);
  const [parsedMetadata, setParsedMetadata] = useState<ParsedHtmlMetadata | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<QuestionWithDuplicate[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    mcq: number;
    short: number;
    long: number;
    bilingual: number;
    duplicateCount: number;
    warningsCount: number;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter & Search state
  const [filterType, setFilterType] = useState<"all" | "mcq" | "short" | "long">("all");
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Import Execution state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    chapterId: string;
    chapterNumber: number;
    chapterTitle: string;
    importedCount: number;
    skippedDuplicates: number;
    totalParsed: number;
    mcqCount: number;
    shortCount: number;
    longCount: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Initial Load: Fetch Courses
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch("/api/courses").then((r) => r.json());
        if (res.courses?.length) {
          setCourses(res.courses);
          setSelectedCourseId(res.courses[0].id);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    }
    loadInitial();
  }, []);

  // 2. Load Subjects when course changes
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
        console.error("Failed to load subjects:", err);
      }
    }
    loadSubjects();
  }, [selectedCourseId]);

  // 3. Load Chapters when subject changes
  useEffect(() => {
    if (!selectedSubjectId) return;
    async function loadChapters() {
      try {
        const res = await fetch(`/api/chapters?subjectId=${selectedSubjectId}`).then((r) => r.json());
        if (res.chapters?.length) {
          setChapters(res.chapters);
        } else {
          setChapters([]);
        }
      } catch (err) {
        console.error("Failed to load chapters:", err);
      }
    }
    loadChapters();
  }, [selectedSubjectId]);

  // Handle HTML File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processHtmlFile(file);
  };

  const processHtmlFile = (file: File) => {
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");
    setErrorMessage(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setRawHtmlText(content);
        previewHtmlContent(content);
      }
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read HTML file.");
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".html") || file.name.endsWith(".htm"))) {
      processHtmlFile(file);
    } else {
      setErrorMessage("Please drop a valid .html file.");
    }
  };

  // Preview / Validate HTML via backend API
  const previewHtmlContent = async (htmlToPreview: string) => {
    if (!htmlToPreview.trim()) {
      setErrorMessage("Please enter or upload HTML content.");
      return;
    }

    setParsing(true);
    setErrorMessage(null);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/import-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent: htmlToPreview,
          action: "preview",
          courseId: selectedCourseId || undefined,
          subjectId: selectedSubjectId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to preview questions.");
      }

      setParsedMetadata(data.metadata);
      setParsedQuestions(data.questions);
      setStats(data.stats);

      // Select all non-duplicate questions by default
      const initialIds = new Set<string>();
      data.questions.forEach((q: QuestionWithDuplicate) => {
        if (!q.isDuplicate) {
          initialIds.add(q.original_id);
        }
      });
      setSelectedIds(initialIds);

      // Auto-set course, subject, and chapter from detected metadata
      if (data.matchedCourse && data.matchedCourse.id !== selectedCourseId) {
        setSelectedCourseId(data.matchedCourse.id);
      }
      if (data.matchedSubject && data.matchedSubject.id !== selectedSubjectId) {
        setSelectedSubjectId(data.matchedSubject.id);
      }

      if (data.detectedChapterNumber) {
        setCustomChapterNumber(data.detectedChapterNumber);
      }
      if (data.metadata?.chapterTitle) {
        setCustomChapterTitle(data.metadata.chapterTitle);
      }
      if (data.metadata?.chapterTitleUr) {
        setCustomChapterTitleUr(data.metadata.chapterTitleUr);
      }

      if (data.matchedChapter) {
        setTargetChapterChoice("existing");
        setSelectedChapterId(data.matchedChapter.id);
      } else {
        setTargetChapterChoice("new");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error validating HTML file";
      setErrorMessage(msg);
    } finally {
      setParsing(false);
    }
  };

  // Filtered Questions Memo
  const filteredQuestions = useMemo(() => {
    return parsedQuestions.filter((q) => {
      // Type filter
      if (filterType !== "all" && q.type !== filterType) return false;

      // Topic filter
      if (filterTopic !== "all") {
        if (!q.topic_title || q.topic_title !== filterTopic) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesEn = q.text_en.toLowerCase().includes(query);
        const matchesUr = q.text_ur.toLowerCase().includes(query);
        const matchesId = q.original_id.toLowerCase().includes(query);
        const matchesRemarks = (q.concept_tag || "").toLowerCase().includes(query);
        if (!matchesEn && !matchesUr && !matchesId && !matchesRemarks) return false;
      }

      return true;
    });
  }, [parsedQuestions, filterType, filterTopic, searchQuery]);

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.size === parsedQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(parsedQuestions.map((q) => q.original_id)));
    }
  };

  const toggleSelectQuestion = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Commit Import
  const handleCommitImport = async () => {
    if (!rawHtmlText || selectedIds.size === 0) return;

    setImporting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/import-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent: rawHtmlText,
          action: "commit",
          courseId: selectedCourseId,
          subjectId: selectedSubjectId,
          chapterId: targetChapterChoice === "existing" ? selectedChapterId : undefined,
          chapterNumber: customChapterNumber,
          chapterTitle: customChapterTitle,
          chapterTitleUr: customChapterTitleUr,
          selectedOriginalIds: Array.from(selectedIds),
          createMissingTopics,
          skipDuplicates,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to commit questions.");
      }

      setImportResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error importing questions into database";
      setErrorMessage(msg);
    } finally {
      setImporting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setRawHtmlText("");
    setFileName(null);
    setFileSize(null);
    setParsedMetadata(null);
    setParsedQuestions([]);
    setStats(null);
    setSelectedIds(new Set());
    setImportResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart HTML Question Importer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Instant Question Bank HTML Parser
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Upload any Paper Generator HTML file (e.g. <code className="text-indigo-300 bg-slate-800/80 px-1.5 py-0.5 rounded text-xs">Select Questions Chapter XX.html</code>).
              Automatically restores KaTeX math formulas, bilingual Urdu &amp; English text, topics, and MCQs directly into PaperWala with 1 click.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputMode("file")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === "file"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
            <button
              onClick={() => setInputMode("paste")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                inputMode === "paste"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              <Clipboard className="w-4 h-4" />
              Paste Code
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {importResult && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl p-6 text-slate-900 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-black text-emerald-950">
                🎉 Successfully Imported {importResult.importedCount} Questions!
              </h3>
              <p className="text-sm text-emerald-800">
                All questions have been upserted into <strong>Chapter {importResult.chapterNumber}: {importResult.chapterTitle}</strong> in the Supabase Question Bank.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {importResult.mcqCount} MCQs
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {importResult.shortCount} Short Questions
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {importResult.longCount} Long Questions
                </span>
                {importResult.skippedDuplicates > 0 && (
                  <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
                    {importResult.skippedDuplicates} Duplicates Skipped
                  </span>
                )}
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/admin/questions"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  View in Question Bank
                </Link>
                <Link
                  href={`/select-questions?chapter=${importResult.chapterNumber}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Generate Paper with Chapter {importResult.chapterNumber}
                </Link>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100/50 transition-colors"
                >
                  Import Another Chapter HTML
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FILE UPLOAD / CODE INPUT CARD */}
      {!parsedMetadata && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {inputMode === "file" ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]"
                  : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileCode className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-1">
                Drag &amp; drop your Question HTML file here
              </h3>
              <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
                Supports <code className="font-semibold text-slate-700">Select Questions Chapter XX.html</code> with hundreds of questions, MCQs, and KaTeX formulas.
              </p>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Browse HTML File
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Paste Raw HTML Code:
              </label>
              <textarea
                value={rawHtmlText}
                onChange={(e) => setRawHtmlText(e.target.value)}
                placeholder="<!DOCTYPE html><html>... Paste the exported HTML content here..."
                rows={10}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => previewHtmlContent(rawHtmlText)}
                  disabled={parsing || !rawHtmlText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm inline-flex items-center gap-2"
                >
                  {parsing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Parsing HTML...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Parse &amp; Validate HTML
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PARSING / PREVIEW SECTION */}
      {parsedMetadata && stats && (
        <div className="space-y-6">
          {/* Metadata & Target Mapping Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {fileName || "Uploaded HTML"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{fileSize || `${(rawHtmlText.length / 1024).toFixed(1)} KB`}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">Parsed Successfully</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Target Hierarchy Mapping Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Course */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Course / Class:
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Detected: <strong>{parsedMetadata.className}</strong>
                </span>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Subject:
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Detected: <strong>{parsedMetadata.subjectName}</strong>
                </span>
              </div>

              {/* Chapter Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chapter Destination:
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setTargetChapterChoice("new")}
                    className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all ${
                      targetChapterChoice === "new"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Create / Upsert New
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetChapterChoice("existing")}
                    disabled={chapters.length === 0}
                    className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                      targetChapterChoice === "existing"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Existing Chapter
                  </button>
                </div>

                {targetChapterChoice === "existing" ? (
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Ch {ch.number}: {ch.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={customChapterNumber}
                        onChange={(e) => setCustomChapterNumber(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-800 text-center"
                        title="Chapter Number"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={customChapterTitle}
                        onChange={(e) => setCustomChapterTitle(e.target.value)}
                        placeholder="Chapter Title (English)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Options Toggles */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={createMissingTopics}
                  onChange={(e) => setCreateMissingTopics(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  Automatically create <strong>{parsedMetadata.topics.length} detected topics</strong> if missing
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  Skip duplicate questions (<span className="text-amber-700 font-bold">{stats.duplicateCount}</span> detected)
                </span>
              </label>
            </div>
          </div>

          {/* STATS DASHBOARD BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Parsed</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">from HTML cards</div>
            </div>

            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 shadow-sm">
              <div className="text-xs text-indigo-700 font-bold uppercase tracking-wider">MCQs</div>
              <div className="text-2xl font-black text-indigo-900 mt-1">{stats.mcq}</div>
              <div className="text-[11px] text-indigo-600 mt-0.5">with 4 options</div>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 shadow-sm">
              <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Short Qs</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{stats.short}</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">2 marks each</div>
            </div>

            <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-100 shadow-sm">
              <div className="text-xs text-purple-700 font-bold uppercase tracking-wider">Long Qs</div>
              <div className="text-2xl font-black text-purple-900 mt-1">{stats.long}</div>
              <div className="text-[11px] text-purple-600 mt-0.5">5 marks each</div>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-100 shadow-sm">
              <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">Bilingual</div>
              <div className="text-2xl font-black text-amber-900 mt-1">{stats.bilingual}</div>
              <div className="text-[11px] text-amber-600 mt-0.5">with Nastaliq Urdu</div>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-100 shadow-sm">
              <div className="text-xs text-rose-700 font-bold uppercase tracking-wider">Duplicates</div>
              <div className="text-2xl font-black text-rose-900 mt-1">{stats.duplicateCount}</div>
              <div className="text-[11px] text-rose-600 mt-0.5">already in bank</div>
            </div>
          </div>

          {/* QUESTIONS PREVIEW & FILTER TOOLBAR */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50">
              {/* Type Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All ({parsedQuestions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("mcq")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === "mcq"
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  MCQs ({stats.mcq})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("short")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === "short"
                      ? "bg-emerald-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Short ({stats.short})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("long")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === "long"
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Long ({stats.long})
                </button>
              </div>

              {/* Topic Filter & Search */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {parsedMetadata.topics.length > 0 && (
                  <select
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white"
                  >
                    <option value="all">All Topics</option>
                    {parsedMetadata.topics.map((t) => (
                      <option key={t.number} value={t.title}>
                        {t.number}. {t.title}
                      </option>
                    ))}
                  </select>
                )}

                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search preview..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50"
                >
                  {selectedIds.size === parsedQuestions.length ? "Deselect All" : "Select All"}
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto p-4 space-y-4">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No questions match your current search/filter.
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isChecked = selectedIds.has(q.original_id);

                  return (
                    <div
                      key={q.original_id || idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isChecked
                          ? "border-indigo-300 bg-indigo-50/20 shadow-sm"
                          : "border-slate-200 bg-white opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectQuestion(q.original_id)}
                          className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />

                        <div className="flex-1 space-y-2.5">
                          {/* Tags line */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                                q.type === "mcq"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : q.type === "short"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {q.type} ({q.marks} {q.marks === 1 ? "mark" : "marks"})
                            </span>

                            {q.topic_title && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                                📚 {q.topic_title}
                              </span>
                            )}

                            {q.concept_tag && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                                💡 {q.concept_tag}
                              </span>
                            )}

                            {q.source_ref && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                🏷️ {q.source_ref}
                              </span>
                            )}

                            {q.isDuplicate && (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
                                ⚠️ Duplicate in DB
                              </span>
                            )}

                            <span className="text-[11px] text-slate-400 font-mono ml-auto">
                              ID: {q.original_id}
                            </span>
                          </div>

                          {/* Question Text */}
                          <div className="space-y-1.5">
                            <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                              <MathRenderer content={q.text_en} />
                            </div>
                            {q.text_ur && (
                              <div className="pt-1 text-slate-800">
                                <UrduText content={q.text_ur} className="text-base" />
                              </div>
                            )}
                          </div>

                          {/* MCQ Options Grid */}
                          {q.type === "mcq" && q.options_en && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                              {q.options_en.map((optEn, optIdx) => {
                                const isCorrect = q.correct_option === optIdx + 1;
                                const optUr = q.options_ur ? q.options_ur[optIdx] : null;

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                                      isCorrect
                                        ? "border-emerald-400 bg-emerald-50 text-emerald-900 font-bold"
                                        : "border-slate-200 bg-slate-50/70 text-slate-700 font-medium"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                          isCorrect
                                            ? "bg-emerald-600 text-white"
                                            : "bg-slate-200 text-slate-700"
                                        }`}
                                      >
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <MathRenderer content={optEn} />
                                    </div>

                                    {optUr && (
                                      <div className="text-right pl-2">
                                        <UrduText content={optUr} className="text-xs" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600 font-medium">
                Ready to import <strong className="text-indigo-600 font-black">{selectedIds.size}</strong> of{" "}
                <strong>{parsedQuestions.length}</strong> questions into{" "}
                <strong>Chapter {customChapterNumber}: {customChapterTitle}</strong>.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCommitImport}
                  disabled={importing || selectedIds.size === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black tracking-wide shadow-md shadow-emerald-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Import {selectedIds.size} Questions into Bank
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
