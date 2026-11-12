// src/components/admin/HtmlQuestionImporter.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Course, Subject, Chapter } from "@/lib/types";
import { ParsedHtmlMetadata, ParsedQuestionItem } from "@/lib/html-question-parser";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import Link from "next/link";
import {
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Check,
  RefreshCw,
  Search,
  Sparkles,
  Clipboard,
  X,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

interface QuestionWithDuplicate extends ParsedQuestionItem {
  isDuplicate?: boolean;
  matchedExistingId?: string | null;
  hasExistingUrdu?: boolean;
  willEnrichUrdu?: boolean;
}

const PAGE_SIZE = 25;

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

  // Refs to prevent cascade useEffects from clobbering auto-matched subject/chapter
  const pendingMatchedSubjectRef = useRef<string | null>(null);
  const pendingMatchedChapterRef = useRef<string | null>(null);

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
    enrichUrduCount?: number;
    warningsCount: number;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter, Search & Pagination state
  const [filterType, setFilterType] = useState<"all" | "mcq" | "short" | "long">("all");
  const [filterTopic, setFilterTopic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Import Execution state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    chapterId: string;
    chapterNumber: number;
    chapterTitle: string;
    importedCount: number;
    enrichedUrduCount?: number;
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
          setSelectedCourseId((prev) => prev || res.courses[0].id);
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
    let cancelled = false;
    async function loadSubjects() {
      try {
        const res = await fetch(`/api/subjects?courseId=${selectedCourseId}`).then((r) => r.json());
        if (cancelled) return;
        const list: Subject[] = res.subjects || [];
        setSubjects(list);
        if (pendingMatchedSubjectRef.current && list.some((s) => s.id === pendingMatchedSubjectRef.current)) {
          setSelectedSubjectId(pendingMatchedSubjectRef.current);
          pendingMatchedSubjectRef.current = null;
        } else if (list.length > 0) {
          setSelectedSubjectId((prev) => (list.some((s) => s.id === prev) ? prev : list[0].id));
        } else {
          setSelectedSubjectId("");
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }
    }
    loadSubjects();
    return () => {
      cancelled = true;
    };
  }, [selectedCourseId]);

  // 3. Load Chapters when subject changes
  useEffect(() => {
    if (!selectedSubjectId) {
      setChapters([]);
      return;
    }
    let cancelled = false;
    async function loadChapters() {
      try {
        const res = await fetch(`/api/chapters?subjectId=${selectedSubjectId}`).then((r) => r.json());
        if (cancelled) return;
        const list: Chapter[] = res.chapters || [];
        setChapters(list);
        if (pendingMatchedChapterRef.current && list.some((c) => c.id === pendingMatchedChapterRef.current)) {
          setSelectedChapterId(pendingMatchedChapterRef.current);
          setTargetChapterChoice("existing");
          pendingMatchedChapterRef.current = null;
        } else if (list.length > 0) {
          setSelectedChapterId((prev) => (list.some((c) => c.id === prev) ? prev : list[0].id));
        } else {
          setSelectedChapterId("");
          setTargetChapterChoice("new");
        }
      } catch (err) {
        console.error("Failed to load chapters:", err);
      }
    }
    loadChapters();
    return () => {
      cancelled = true;
    };
  }, [selectedSubjectId]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterType, filterTopic, searchQuery]);

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
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setRawHtmlText(content);
        previewHtmlContent(content);
      } else {
        setParsing(false);
        setErrorMessage("The selected HTML file is empty.");
      }
    };
    reader.onerror = () => {
      setParsing(false);
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
    if (file && (file.name.endsWith(".html") || file.name.endsWith(".htm") || file.name.endsWith(".mhtml"))) {
      processHtmlFile(file);
    } else {
      setErrorMessage("Please drop a valid .html or .htm file.");
    }
  };

  // Preview / Validate HTML via backend API
  const previewHtmlContent = async (htmlToPreview: string) => {
    if (!htmlToPreview.trim()) {
      setErrorMessage("Please enter or upload HTML content.");
      setParsing(false);
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
      setParsedQuestions(data.questions || []);
      setStats(data.stats);
      setVisibleCount(PAGE_SIZE);

      // Select all non-duplicate questions (or duplicates that enrich Urdu) by default
      const initialIds = new Set<string>();
      (data.questions || []).forEach((q: QuestionWithDuplicate) => {
        if (!q.isDuplicate || q.willEnrichUrdu) {
          initialIds.add(q.original_id);
        }
      });
      setSelectedIds(initialIds);

      // Preserve matched subject & chapter across cascade useEffects
      if (data.matchedSubject?.id) {
        pendingMatchedSubjectRef.current = data.matchedSubject.id;
        setSelectedSubjectId(data.matchedSubject.id);
      }
      if (data.matchedChapter?.id) {
        pendingMatchedChapterRef.current = data.matchedChapter.id;
        setSelectedChapterId(data.matchedChapter.id);
        setTargetChapterChoice("existing");
      } else {
        pendingMatchedChapterRef.current = null;
        setTargetChapterChoice("new");
      }

      if (data.matchedCourse?.id && data.matchedCourse.id !== selectedCourseId) {
        setSelectedCourseId(data.matchedCourse.id);
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
      if (filterType !== "all" && q.type !== filterType) return false;
      if (filterTopic !== "all") {
        if (!q.topic_title || q.topic_title !== filterTopic) return false;
      }
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

  const visibleQuestions = useMemo(
    () => filteredQuestions.slice(0, visibleCount),
    [filteredQuestions, visibleCount]
  );

  // Toggle selection (for currently filtered questions or all)
  const toggleSelectAllFiltered = () => {
    const allFilteredSelected =
      filteredQuestions.length > 0 && filteredQuestions.every((q) => selectedIds.has(q.original_id));
    const next = new Set(selectedIds);
    if (allFilteredSelected) {
      filteredQuestions.forEach((q) => next.delete(q.original_id));
    } else {
      filteredQuestions.forEach((q) => next.add(q.original_id));
    }
    setSelectedIds(next);
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
    setSearchQuery("");
    setFilterType("all");
    setFilterTopic("all");
    setVisibleCount(PAGE_SIZE);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const activeChapterSummary = useMemo(() => {
    if (targetChapterChoice === "existing") {
      const found = chapters.find((c) => c.id === selectedChapterId);
      if (found) return `Chapter ${found.number}: ${found.title}`;
    }
    return `Chapter ${customChapterNumber}: ${customChapterTitle || "Untitled Chapter"}`;
  }, [targetChapterChoice, chapters, selectedChapterId, customChapterNumber, customChapterTitle]);

  return (
    <div className="space-y-5 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Smart HTML Question Importer</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Instant Question Bank HTML Parser
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Upload any Paper Generator HTML file (e.g.{" "}
              <code className="text-indigo-300 bg-slate-800/80 px-1.5 py-0.5 rounded text-xs break-all">
                Select Questions Chapter XX.html
              </code>
              ). Automatically restores KaTeX math formulas, bilingual Urdu &amp; English text, topics, and MCQs directly into PaperWala.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setInputMode("file")}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inputMode === "file"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:text-white"
              }`}
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode("paste")}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                inputMode === "paste"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-300 hover:text-white"
              }`}
            >
              <Clipboard className="w-4 h-4 shrink-0" />
              <span>Paste Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {importResult && (
        <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-6 text-slate-900 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="text-base sm:text-lg font-black text-emerald-950">
                Successfully Imported {importResult.importedCount} Questions!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 break-words">
                All questions have been upserted into{" "}
                <strong>
                  Chapter {importResult.chapterNumber}: {importResult.chapterTitle}
                </strong>{" "}
                in the Question Bank.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {importResult.mcqCount} MCQs
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {importResult.shortCount} Short Questions
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {importResult.longCount} Long Questions
                </span>
                {Boolean(importResult.enrichedUrduCount && importResult.enrichedUrduCount > 0) && (
                  <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200">
                    {importResult.enrichedUrduCount} Enriched with Urdu
                  </span>
                )}
                {importResult.skippedDuplicates > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
                    {importResult.skippedDuplicates} Duplicates Skipped
                  </span>
                )}
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-2.5">
                <Link
                  href="/admin/questions"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>View in Question Bank</span>
                </Link>
                <Link
                  href={`/select-questions?chapter=${importResult.chapterNumber}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Generate Paper (Ch {importResult.chapterNumber})</span>
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100/50 transition-colors cursor-pointer"
                >
                  Import Another HTML File
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
          <div className="flex-1 min-w-0 text-xs sm:text-sm font-medium break-words">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-600 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FILE UPLOAD / CODE INPUT CARD */}
      {!parsedMetadata && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          {parsing ? (
            <div className="py-16 px-4 text-center space-y-3">
              <RefreshCw className="w-9 h-9 text-indigo-600 animate-spin mx-auto" />
              <div className="text-sm sm:text-base font-black text-slate-900">
                Parsing HTML &amp; Checking Question Bank...
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Extracting English &amp; Urdu Nastaliq text, KaTeX formulas, MCQ options, and matching topics.
              </p>
            </div>
          ) : inputMode === "file" ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/50"
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

              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileCode className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1">
                Tap or drag &amp; drop your Question HTML file here
              </h3>
              <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
                Supports <code className="font-semibold text-slate-700">Select Questions Chapter XX.html</code> with MCQs, Short &amp; Long questions, and KaTeX formulas.
              </p>

              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Browse HTML File</span>
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
                rows={9}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => previewHtmlContent(rawHtmlText)}
                  disabled={parsing || !rawHtmlText.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Parse &amp; Validate HTML</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PARSING / PREVIEW SECTION */}
      {parsedMetadata && stats && (
        <div className="space-y-5 min-w-0">
          {/* Metadata & Target Mapping Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base truncate" title={fileName || "Uploaded HTML"}>
                    {fileName || "Uploaded HTML"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                    <span>{fileSize || `${(rawHtmlText.length / 1024).toFixed(1)} KB`}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">Parsed Successfully</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 shrink-0 cursor-pointer"
              >
                Change HTML File
              </button>
            </div>

            {/* Target Hierarchy Mapping Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Course */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Course / Class:
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block truncate">
                  Detected: <strong>{parsedMetadata.className || "—"}</strong>
                </span>
              </div>

              {/* Subject */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Subject:
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block truncate">
                  Detected: <strong>{parsedMetadata.subjectName || "—"}</strong>
                </span>
              </div>

              {/* Chapter Destination */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chapter Destination:
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setTargetChapterChoice("new")}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      targetChapterChoice === "new"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Create / Upsert
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetChapterChoice("existing")}
                    disabled={chapters.length === 0}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${
                      targetChapterChoice === "existing"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Existing ({chapters.length})
                  </button>
                </div>

                {targetChapterChoice === "existing" ? (
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Ch {ch.number}: {ch.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={customChapterNumber}
                      onChange={(e) => setCustomChapterNumber(parseInt(e.target.value, 10) || 1)}
                      className="w-16 h-10 px-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 text-center shrink-0"
                      title="Chapter Number"
                    />
                    <input
                      type="text"
                      value={customChapterTitle}
                      onChange={(e) => setCustomChapterTitle(e.target.value)}
                      placeholder="Chapter Title (English)"
                      className="flex-1 min-w-0 h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Options Toggles */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-6 pt-2 border-t border-slate-100 text-xs text-slate-700">
              <label className="flex items-start sm:items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={createMissingTopics}
                  onChange={(e) => setCreateMissingTopics(e.target.checked)}
                  className="mt-0.5 sm:mt-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                />
                <span>
                  Auto-create <strong>{parsedMetadata.topics.length} detected topics</strong> if missing
                </span>
              </label>

              <label className="flex items-start sm:items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="mt-0.5 sm:mt-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
                />
                <span>
                  Skip duplicate questions (
                  <span className="text-amber-700 font-bold">{stats.duplicateCount}</span> in bank
                  {Boolean(stats.enrichUrduCount && stats.enrichUrduCount > 0) && (
                    <span className="text-emerald-700 font-bold ml-1">
                      • {stats.enrichUrduCount} will gain Urdu
                    </span>
                  )}
                  )
                </span>
              </label>
            </div>
          </div>

          {/* STATS DASHBOARD BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Parsed</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
              <div className="text-[10px] text-slate-400">from HTML file</div>
            </div>

            <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 shadow-sm">
              <div className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider">MCQs</div>
              <div className="text-xl sm:text-2xl font-black text-indigo-900 mt-0.5">{stats.mcq}</div>
              <div className="text-[10px] text-indigo-600">objective</div>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 shadow-sm">
              <div className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">Short Qs</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5">{stats.short}</div>
              <div className="text-[10px] text-emerald-600">2 marks each</div>
            </div>

            <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-100 shadow-sm">
              <div className="text-[11px] text-purple-700 font-bold uppercase tracking-wider">Long Qs</div>
              <div className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5">{stats.long}</div>
              <div className="text-[10px] text-purple-600">5 marks each</div>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-100 shadow-sm">
              <div className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">Bilingual</div>
              <div className="text-xl sm:text-2xl font-black text-amber-900 mt-0.5">{stats.bilingual}</div>
              <div className="text-[10px] text-amber-600">
                {stats.bilingual > 0 ? "English + Urdu" : "English only"}
              </div>
            </div>

            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-100 shadow-sm">
              <div className="text-[11px] text-rose-700 font-bold uppercase tracking-wider">Duplicates</div>
              <div className="text-xl sm:text-2xl font-black text-rose-900 mt-0.5">{stats.duplicateCount}</div>
              <div className="text-[10px] text-rose-600">
                {Boolean(stats.enrichUrduCount && stats.enrichUrduCount > 0)
                  ? `${stats.enrichUrduCount} gain Urdu`
                  : "already in bank"}
              </div>
            </div>
          </div>

          {/* QUESTIONS PREVIEW & FILTER TOOLBAR */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/70">
              {/* Type Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: "all", label: `All (${parsedQuestions.length})`, activeCls: "bg-slate-900 text-white" },
                    { id: "mcq", label: `MCQs (${stats.mcq})`, activeCls: "bg-indigo-600 text-white" },
                    { id: "short", label: `Short (${stats.short})`, activeCls: "bg-emerald-600 text-white" },
                    { id: "long", label: `Long (${stats.long})`, activeCls: "bg-purple-600 text-white" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterType(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterType === tab.id
                        ? tab.activeCls
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Topic Filter, Search & Select All */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto min-w-0">
                {parsedMetadata.topics.length > 0 && (
                  <select
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value)}
                    className="h-9 px-2.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white w-full sm:max-w-[220px] truncate outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Topics ({parsedMetadata.topics.length})</option>
                    {parsedMetadata.topics.map((t) => (
                      <option key={t.number} value={t.title}>
                        {t.number}. {t.title}
                      </option>
                    ))}
                  </select>
                )}

                <div className="relative flex-1 sm:w-56 min-w-0">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={toggleSelectAllFiltered}
                  className="h-9 px-3 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shrink-0 cursor-pointer"
                >
                  {filteredQuestions.length > 0 && filteredQuestions.every((q) => selectedIds.has(q.original_id))
                    ? "Deselect Shown"
                    : "Select Shown"}
                </button>
              </div>
            </div>

            {/* Paginated Questions List */}
            <div className="p-3 sm:p-4 space-y-3 max-h-[650px] overflow-y-auto overflow-x-hidden">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No questions match your current search or filter.
                </div>
              ) : (
                <>
                  {visibleQuestions.map((q, idx) => {
                    const isChecked = selectedIds.has(q.original_id);

                    return (
                      <div
                        key={q.original_id || idx}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-colors ${
                          isChecked
                            ? "border-indigo-300 bg-indigo-50/20"
                            : "border-slate-200 bg-white opacity-65"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectQuestion(q.original_id)}
                            className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                          />

                          <div className="flex-1 min-w-0 space-y-2.5">
                            {/* Tags line */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold uppercase ${
                                  q.type === "mcq"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : q.type === "short"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {q.type} ({q.marks}m)
                              </span>

                              {q.topic_title && (
                                <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-700 max-w-full truncate">
                                  📚 {q.topic_title}
                                </span>
                              )}

                              {q.concept_tag && (
                                <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-amber-100 text-amber-800 max-w-full truncate">
                                  💡 {q.concept_tag}
                                </span>
                              )}

                              {q.source_ref && (
                                <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                  🏷️ {q.source_ref}
                                </span>
                              )}

                              {q.willEnrichUrdu ? (
                                <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                                  ✨ Adds Urdu
                                </span>
                              ) : q.isDuplicate ? (
                                <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-amber-100 text-amber-800">
                                  {q.hasExistingUrdu ? "✓ In Bank" : "⚠️ In Bank (EN only)"}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                  ✨ New
                                </span>
                              )}

                              <span className="text-[10px] text-slate-400 font-mono sm:ml-auto">
                                #{q.original_id}
                              </span>
                            </div>

                            {/* Question Text */}
                            <div className="space-y-1.5 min-w-0 overflow-x-auto">
                              <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed break-words">
                                <MathRenderer content={q.text_en} />
                              </div>
                              {q.text_ur && (
                                <div className="pt-1 text-slate-800">
                                  <UrduText content={q.text_ur} className="text-sm sm:text-base" />
                                </div>
                              )}
                            </div>

                            {/* MCQ Options Grid */}
                            {q.type === "mcq" && q.options_en && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                                {q.options_en.map((optEn, optIdx) => {
                                  const isCorrect = q.correct_option === optIdx + 1;
                                  const optUr = q.options_ur ? q.options_ur[optIdx] : null;

                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-2.5 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 min-w-0 ${
                                        isCorrect
                                          ? "border-emerald-400 bg-emerald-50 text-emerald-900 font-bold"
                                          : "border-slate-200 bg-slate-50/70 text-slate-700 font-medium"
                                      }`}
                                    >
                                      <div className="flex items-start gap-2 min-w-0 flex-1">
                                        <span
                                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                                            isCorrect
                                              ? "bg-emerald-600 text-white"
                                              : "bg-slate-200 text-slate-700"
                                          }`}
                                        >
                                          {String.fromCharCode(65 + optIdx)}
                                        </span>
                                        <div className="min-w-0 flex-1 break-words overflow-x-auto">
                                          <MathRenderer content={optEn} />
                                        </div>
                                      </div>

                                      {optUr && (
                                        <div className="text-right ml-auto max-w-full">
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
                  })}

                  {visibleCount < filteredQuestions.length && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4" />
                        <span>
                          Show More Questions ({visibleCount} of {filteredQuestions.length} shown)
                        </span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-medium min-w-0 break-words">
                Ready to import <strong className="text-indigo-600 font-black">{selectedIds.size}</strong> of{" "}
                <strong>{parsedQuestions.length}</strong> questions into <strong>{activeChapterSummary}</strong>.
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCommitImport}
                  disabled={importing || selectedIds.size === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black tracking-wide shadow-md shadow-emerald-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {importing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Import {selectedIds.size} Questions</span>
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
