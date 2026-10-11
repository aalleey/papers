"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Board, Course, Subject, Chapter, CsvRowValidationResult } from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";
import { UrduText } from "@/components/UrduText";
import Link from "next/link";
import { HtmlQuestionImporter } from "@/components/admin/HtmlQuestionImporter";
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileCode,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  Sparkles,
} from "lucide-react";

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<"html" | "csv">("html");

  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [previewResults, setPreviewResults] = useState<CsvRowValidationResult[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
  } | null>(null);

  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<{
    count: number;
    skipped: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load courses
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/courses").then((r) => r.json());
        if (res.courses?.length) {
          setCourses(res.courses);
          setSelectedCourseId(res.courses[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  // When course changes, load subjects
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
        console.error(err);
      }
    }
    loadSubjects();
  }, [selectedCourseId]);

  // Handle CSV file selection and parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setImportSuccess(null);
    parseAndPreview(selected);
  };

  const parseAndPreview = (fileToParse: File) => {
    if (!selectedSubjectId) {
      setError("Please select a target Course and Subject first.");
      return;
    }

    setParsing(true);
    Papa.parse<Record<string, unknown>>(fileToParse, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: async (results) => {
        try {
          const res = await fetch("/api/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subjectId: selectedSubjectId,
              rows: results.data,
              action: "preview",
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Preview validation failed");
          }

          setPreviewResults(data.validationResults || []);
          setStats({
            total: data.totalRows || 0,
            valid: data.validCount || 0,
            invalid: data.invalidCount || 0,
            duplicates: data.duplicateCount || 0,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Error validating CSV file";
          setError(msg);
        } finally {
          setParsing(false);
        }
      },
      error: (parseError) => {
        setError(`CSV Parse error: ${parseError.message}`);
        setParsing(false);
      },
    });
  };

  // Commit valid rows to database
  const handleCommitImport = async () => {
    if (!file || previewResults.length === 0) return;
    setImporting(true);
    setError(null);

    try {
      // Re-parse raw rows to send to commit endpoint
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
        complete: async (results) => {
          const res = await fetch("/api/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subjectId: selectedSubjectId,
              rows: results.data,
              action: "commit",
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Failed to commit import");
          }

          setImportSuccess({
            count: data.importedCount,
            skipped: data.skippedDuplicates,
          });
          setPreviewResults([]);
          setStats(null);
          setFile(null);
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Import failed";
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("html")}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all ${
              activeTab === "html"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>HTML Question Parser</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                activeTab === "html"
                  ? "bg-indigo-500/40 text-indigo-100"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              New
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("csv")}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all ${
              activeTab === "csv"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Spreadsheet Import</span>
          </button>
        </div>

        {activeTab === "csv" && (
          <a
            href="/api/template/csv"
            download="paper_maker_questions_template.csv"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Template</span>
          </a>
        )}
      </div>

      {/* Tab 1: HTML Question Parser */}
      {activeTab === "html" ? (
        <HtmlQuestionImporter />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>CSV Question Import</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Batch import multiple exam questions with bilingual text, KaTeX formulas, and MCQ options.
              </p>
            </div>
          </div>

          {/* Target Destination & Upload Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Course *
            </label>
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

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Subject *
            </label>
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
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center transition-colors bg-slate-50/50 hover:bg-emerald-50/20">
          <input
            type="file"
            id="csv-file-input"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="csv-file-input" className="cursor-pointer block space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm hover:underline">
                {file ? file.name : "Click to select a CSV file"}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Supports .csv files formatted per the official PaperWala template.
              </p>
            </div>
          </label>
        </div>

        {/* Instructions Note */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">CSV Columns Requirements:</p>
            <p className="font-mono text-[11px] text-slate-700 break-all">
              chapter_number, topic_number, type, source, source_ref, concept_tag, text_en, option_a, option_b, option_c, option_d, text_ur, correct_option, answer_en, marks, difficulty
            </p>
            <p className="text-[11px] text-slate-500">
              Math formulas should be wrapped in dollar signs (e.g. <code className="bg-white px-1 py-0.2 rounded border">$x^2 + \frac{1}{2}$</code>). Duplicate questions matching the same chapter and English text are automatically flagged and skipped.
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Success alert */}
      {importSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-base">Import Completed Successfully!</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Successfully imported <strong>{importSuccess.count}</strong> questions.
                {importSuccess.skipped > 0 && ` Skipped ${importSuccess.skipped} duplicate rows.`}
              </p>
            </div>
          </div>
          <Link
            href="/admin/questions"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-500 transition-colors shrink-0"
          >
            View in Questions Bank
          </Link>
        </div>
      )}

      {/* Loading state */}
      {parsing && (
        <div className="p-12 text-center text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm font-semibold text-slate-700">Validating CSV rows...</p>
        </div>
      )}

      {/* Preview Summary Bar & Action */}
      {stats && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pre-Import Row-by-Row Preview</h2>
              <p className="text-xs text-slate-500">
                Review flagged validation errors and duplicates before committing.
              </p>
            </div>

            <button
              onClick={handleCommitImport}
              disabled={importing || stats.valid === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-950/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {importing ? (
                <span>Importing...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Import {stats.valid} Valid Questions</span>
                </>
              )}
            </button>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase">Total Rows</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.total}</div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <div className="text-xs text-emerald-700 font-semibold uppercase">Valid Ready</div>
              <div className="text-xl font-extrabold text-emerald-800 mt-0.5">{stats.valid}</div>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
              <div className="text-xs text-rose-700 font-semibold uppercase">Invalid Flagged</div>
              <div className="text-xl font-extrabold text-rose-800 mt-0.5">{stats.invalid}</div>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
              <div className="text-xs text-amber-700 font-semibold uppercase">Duplicates</div>
              <div className="text-xl font-extrabold text-amber-800 mt-0.5">{stats.duplicates}</div>
            </div>
          </div>
        </div>
      )}

      {/* Row-by-row Preview Table */}
      {previewResults.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Row #</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Ch #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Question Preview (with KaTeX Math)</th>
                  <th className="py-3 px-4">MCQ Options / Answer</th>
                  <th className="py-3 px-4">Issues / Error Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {previewResults.map((row) => {
                  const d = row.data;
                  return (
                    <tr
                      key={row.rowNumber}
                      className={
                        !row.isValid
                          ? "bg-rose-50/40"
                          : row.isDuplicate
                          ? "bg-amber-50/40"
                          : "hover:bg-slate-50/60"
                      }
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-700 align-top">
                        #{row.rowNumber}
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valid</span>
                          </span>
                        ) : row.isDuplicate ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Duplicate</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Invalid</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top font-semibold text-slate-800">
                        Ch {String(d.chapter_number || "-")}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <span className="uppercase text-xs font-bold text-slate-700">
                          {String(d.type || "-")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 align-top max-w-md">
                        <div className="space-y-1">
                          <div className="text-slate-800 font-medium">
                            <MathRenderer content={String(d.text_en || "-")} />
                          </div>
                          {d.text_ur && (
                            <div className="pt-0.5 text-slate-600">
                              <UrduText content={String(d.text_ur)} className="text-sm line-clamp-1" />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top text-xs text-slate-600 max-w-xs">
                        {d.type === "mcq" ? (
                          <div className="space-y-0.5">
                            <div>A: {String(d.option_a || "")}</div>
                            <div>B: {String(d.option_b || "")}</div>
                            <div>C: {String(d.option_c || "")}</div>
                            <div>D: {String(d.option_d || "")}</div>
                            {d.correct_option && (
                              <div className="font-bold text-emerald-700">
                                Correct: {String(d.correct_option)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>{String(d.answer_en || "-")}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top text-xs">
                        {row.errors.length > 0 ? (
                          <ul className="space-y-1 list-disc list-inside text-rose-700">
                            {row.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
