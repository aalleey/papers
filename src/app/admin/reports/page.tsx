"use client";

import React, { useState, useEffect } from "react";
import {
  QuestionReportRecord,
  QuestionReportCategory,
  QuestionReportStatus,
} from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";
import {
  Flag,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  RefreshCw,
  Wrench,
  Edit3,
  Trash2,
  X,
  Check,
  Sparkles,
  BookOpen,
  User,
  School,
  XCircle,
  RotateCcw,
  Languages,
  KeyRound,
  FileWarning,
  MessageSquareWarning,
} from "lucide-react";

interface ReportStats {
  total: number;
  open: number;
  resolved: number;
  dismissed: number;
  wrongAnswer: number;
  typo: number;
  urduTranslation: number;
  mathFormula: number;
}

const CATEGORY_META: Record<
  QuestionReportCategory,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  wrong_answer: {
    label: "Wrong Answer Key",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
    icon: KeyRound,
  },
  typo: {
    label: "Typo / Spelling",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
    icon: FileWarning,
  },
  urdu_translation: {
    label: "Urdu Translation",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-300",
    icon: Languages,
  },
  math_formula: {
    label: "Broken Math / KaTeX",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
    icon: Sparkles,
  },
  wrong_marks: {
    label: "Marks / Syllabus",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
    icon: BookOpen,
  },
  other: {
    label: "General Issue",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
    icon: MessageSquareWarning,
  },
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<QuestionReportRecord[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    open: 0,
    resolved: 0,
    dismissed: 0,
    wrongAnswer: 0,
    typo: 0,
    urduTranslation: 0,
    mathFormula: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("open");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Quick Fix / Live Editor Modal State
  const [editingReport, setEditingReport] = useState<QuestionReportRecord | null>(null);
  const [fixTextEn, setFixTextEn] = useState("");
  const [fixTextUr, setFixTextUr] = useState("");
  const [fixOptionsEn, setFixOptionsEn] = useState<string[]>(["", "", "", ""]);
  const [fixOptionsUr, setFixOptionsUr] = useState<string[]>(["", "", "", ""]);
  const [fixCorrectOption, setFixCorrectOption] = useState<number>(1);
  const [fixAnswerEn, setFixAnswerEn] = useState("");
  const [fixAnswerUr, setFixAnswerUr] = useState("");
  const [fixMarks, setFixMarks] = useState<number>(1);
  const [fixAdminNotes, setFixAdminNotes] = useState("");
  const [savingFix, setSavingFix] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterCategory !== "all") params.set("category", filterCategory);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data.reports || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
      showToast("Failed to load flagged questions queue", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filterStatus, filterCategory, searchTerm]);

  // 1-Click Instant Fix using Teacher's Suggested Answer / Text
  const handleOneClickApplySuggestion = async (rep: QuestionReportRecord) => {
    try {
      setProcessingId(rep.id);
      const snap = rep.questionSnapshot;
      const newCorrectOption =
        rep.suggestedCorrectOption !== null && rep.suggestedCorrectOption !== undefined
          ? rep.suggestedCorrectOption
          : snap.correctOption;
      const newTextEn =
        rep.suggestedFix && rep.suggestedFix.trim() && rep.category !== "wrong_answer"
          ? rep.suggestedFix.trim()
          : snap.textEn;

      const res = await fetch(`/api/reports/${rep.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          adminNotes: "Applied educator's suggested correction via 1-Click Fix.",
          questionFix: {
            type: rep.questionType,
            textEn: newTextEn,
            textUr: snap.textUr || "",
            optionsEn: snap.optionsEn || null,
            optionsUr: snap.optionsUr || null,
            correctOption: newCorrectOption,
            answerEn: snap.answerEn || null,
            answerUr: snap.answerUr || null,
            marks: snap.marks || 1,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to apply 1-click fix");
      showToast("Question updated in live bank & ticket marked Resolved!");
      await loadReports();
    } catch (err) {
      showToast("Failed to apply 1-click fix", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Open Full Quick-Fix Editor Modal
  const handleOpenFixModal = (rep: QuestionReportRecord) => {
    setEditingReport(rep);
    const snap = rep.questionSnapshot;
    setFixTextEn(
      rep.suggestedFix && rep.category === "typo" ? rep.suggestedFix : snap.textEn || ""
    );
    setFixTextUr(snap.textUr || "");
    setFixOptionsEn(
      snap.optionsEn && snap.optionsEn.length === 4
        ? [...snap.optionsEn]
        : ["", "", "", ""]
    );
    setFixOptionsUr(
      snap.optionsUr && snap.optionsUr.length === 4
        ? [...snap.optionsUr]
        : ["", "", "", ""]
    );
    setFixCorrectOption(
      rep.suggestedCorrectOption ?? snap.correctOption ?? 1
    );
    setFixAnswerEn(snap.answerEn || "");
    setFixAnswerUr(snap.answerUr || "");
    setFixMarks(snap.marks || (rep.questionType === "mcq" ? 1 : rep.questionType === "short" ? 2 : 5));
    setFixAdminNotes(rep.adminNotes || "Verified and fixed in Question Bank.");
  };

  // Save Question Edits & Mark Resolved
  const handleSaveFixModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    if (!fixTextEn.trim()) {
      showToast("English question text is required", "error");
      return;
    }

    try {
      setSavingFix(true);
      const res = await fetch(`/api/reports/${editingReport.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          adminNotes: fixAdminNotes.trim() || "Fixed question and resolved ticket.",
          questionFix: {
            type: editingReport.questionType,
            textEn: fixTextEn.trim(),
            textUr: fixTextUr.trim() || null,
            optionsEn: editingReport.questionType === "mcq" ? fixOptionsEn : null,
            optionsUr:
              editingReport.questionType === "mcq" && fixOptionsUr.some((o) => o.trim())
                ? fixOptionsUr
                : null,
            correctOption: editingReport.questionType === "mcq" ? fixCorrectOption : null,
            answerEn: fixAnswerEn.trim() || null,
            answerUr: fixAnswerUr.trim() || null,
            marks: Number(fixMarks) || 1,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to save question fix");
      showToast("Question fixed in live bank & report resolved!");
      setEditingReport(null);
      await loadReports();
    } catch (err) {
      showToast("Error saving question fix", "error");
    } finally {
      setSavingFix(false);
    }
  };

  // Quick Status Change (Resolve / Dismiss / Reopen)
  const handleStatusChange = async (
    rep: QuestionReportRecord,
    newStatus: QuestionReportStatus
  ) => {
    try {
      setProcessingId(rep.id);
      const res = await fetch(`/api/reports/${rep.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      showToast(`Report marked as ${newStatus.toUpperCase()}`);
      await loadReports();
    } catch {
      showToast("Failed to update report status", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Delete Report
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this error report permanently?")) return;
    try {
      setProcessingId(id);
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Report deleted");
      await loadReports();
    } catch {
      showToast("Failed to delete report", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white shadow-emerald-900/40"
              : "bg-rose-600 text-white shadow-rose-900/40"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Executive Command Bar */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white/85 via-white/70 to-white/85 backdrop-blur-2xl saturate-150 p-5 sm:p-6 rounded-3xl border border-white/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-rose-600">
            <span>Admin Console</span>
            <span className="text-slate-300">/</span>
            <span>Quality Assurance &amp; Support Queue</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-rose-500 via-rose-600 to-orange-600 text-white flex items-center justify-center shadow-[0_4px_0_0_#9f1239,inset_0_1px_1px_rgba(255,255,255,0.65)] shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Flagged Questions &amp; Error Reports
            </h1>
            <span className="font-urdu text-rose-700 text-base sm:text-lg font-bold px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              سوالات کی تصحیح اور شکایات
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium max-w-2xl">
            Review typos, wrong MCQ answer keys, or Urdu translation issues reported by educators while building papers, and apply 1-click fixes directly to the live Question Bank.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadReports()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-800 text-xs font-extrabold shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : "text-slate-600"}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Telemetry Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Open Queue */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus("open");
            setFilterCategory("all");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === "open" && filterCategory === "all"
              ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/25 shadow-[0_4px_0_0_#f59e0b]"
              : "bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7)] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
              Open Review Queue
            </span>
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-amber-600">{stats.open}</span>
            <span className="text-[11px] text-amber-800 font-bold">pending fix</span>
          </div>
          <div className="mt-1.5 text-[10px] text-amber-700 font-semibold">
            Needs admin attention
          </div>
        </button>

        {/* 2. Wrong Answer Key Alerts */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus("open");
            setFilterCategory(filterCategory === "wrong_answer" ? "all" : "wrong_answer");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            filterCategory === "wrong_answer"
              ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/25 shadow-[0_4px_0_0_#f43f5e]"
              : "bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7)] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider">
              Wrong Answer Keys
            </span>
            <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-rose-600">{stats.wrongAnswer}</span>
            <span className="text-[11px] text-rose-700 font-bold">open MCQs</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-500 font-medium">
            1-click key update ready
          </div>
        </button>

        {/* 3. Resolved & Fixed */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus("resolved");
            setFilterCategory("all");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === "resolved"
              ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/25 shadow-[0_4px_0_0_#10b981]"
              : "bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7)] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
              Fixed &amp; Resolved
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-emerald-700">{stats.resolved}</span>
            <span className="text-[11px] text-emerald-800 font-bold">corrected</span>
          </div>
          <div className="mt-1.5 text-[10px] text-emerald-700 font-semibold">
            Updated in live Question Bank
          </div>
        </button>

        {/* 4. Total Reports */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus("all");
            setFilterCategory("all");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === "all" && filterCategory === "all"
              ? "bg-white border-slate-500 ring-2 ring-slate-400/20 shadow-[0_4px_0_0_#64748b]"
              : "bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7)] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              All Reports
            </span>
            <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Flag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[11px] text-slate-500 font-semibold">tickets</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-500">
            {stats.typo} Typos &bull; {stats.urduTranslation} Urdu
          </div>
        </button>
      </div>

      {/* Filter & Search Command Bar */}
      <div className="bg-white/85 backdrop-blur-2xl p-4 rounded-2xl border border-white/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.08),0_3px_0_0_rgba(203,213,225,0.6)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by question text, educator name, academy, subject, or chapter..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-slate-50/90 focus:bg-white border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
            {[
              { id: "open", label: `Open Queue (${stats.open})` },
              { id: "resolved", label: `Resolved (${stats.resolved})` },
              { id: "dismissed", label: `Dismissed (${stats.dismissed})` },
              { id: "all", label: "All" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === tab.id
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="all">All Issue Categories</option>
            <option value="wrong_answer">Wrong Answer Key</option>
            <option value="typo">Typo / Spelling</option>
            <option value="urdu_translation">Urdu Translation</option>
            <option value="math_formula">Broken Math / KaTeX</option>
            <option value="wrong_marks">Marks / Syllabus</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Reports Review Queue List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white/90 rounded-3xl border border-slate-200/80 py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-bold text-slate-600">Loading flagged questions queue...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white/90 rounded-3xl border border-slate-200/80 py-16 px-4 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 stroke-1" />
            <p className="text-base font-black text-slate-800">
              No flagged question reports match your current filters
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              When teachers click &ldquo;Report Typo / Wrong Answer&rdquo; while building a paper, their tickets appear here for 1-click correction.
            </p>
          </div>
        ) : (
          reports.map((rep) => {
            const catMeta = CATEGORY_META[rep.category] || CATEGORY_META.other;
            const CatIcon = catMeta.icon;
            const snap = rep.questionSnapshot;
            const hasOneClickSuggestion =
              rep.status === "open" &&
              ((rep.category === "wrong_answer" && rep.suggestedCorrectOption) ||
                (rep.suggestedFix && rep.suggestedFix.trim() !== snap.textEn.trim()));

            return (
              <div
                key={rep.id}
                className={`bg-white/95 backdrop-blur-xl rounded-3xl border-2 p-5 sm:p-6 shadow-md transition-all ${
                  rep.status === "open"
                    ? "border-amber-200/90 hover:border-amber-300"
                    : rep.status === "resolved"
                    ? "border-emerald-200/80 bg-emerald-50/10"
                    : "border-slate-200 opacity-75"
                }`}
              >
                {/* Top Metadata Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold border ${catMeta.badgeClass}`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                      <span>{catMeta.label}</span>
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border ${
                        rep.status === "open"
                          ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                          : rep.status === "resolved"
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : "bg-slate-200 text-slate-700 border-slate-300"
                      }`}
                    >
                      {rep.status}
                    </span>

                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 uppercase">
                      {rep.questionType} &bull; {snap.marks} {snap.marks === 1 ? "Mark" : "Marks"}
                    </span>

                    {(rep.subjectName || rep.chapterTitle) && (
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs border border-blue-200">
                        {[rep.subjectName, rep.chapterTitle].filter(Boolean).join(" • ")}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold">
                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <strong>{rep.reporterName}</strong>
                    </span>
                    {rep.academyName && (
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <School className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{rep.academyName}</span>
                      </span>
                    )}
                    <span>&bull;</span>
                    <span>{new Date(rep.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Main Grid: Left = Question Snapshot, Right = Teacher Report & 1-Click Fix Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Question Content Snapshot */}
                  <div className="lg:col-span-7 space-y-3 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Current Question in Bank (ID: {rep.questionId.slice(0, 12)})</span>
                    </div>

                    <div className="space-y-2">
                      <div className="font-bold text-slate-900 text-sm leading-relaxed">
                        <MathRenderer content={snap.textEn} />
                      </div>
                      {snap.textUr && (
                        <div
                          className="font-urdu text-base text-indigo-950 text-right leading-loose pt-1 border-t border-slate-200/60"
                          dir="rtl"
                        >
                          <MathRenderer content={snap.textUr} />
                        </div>
                      )}
                    </div>

                    {/* MCQ Options if applicable */}
                    {rep.questionType === "mcq" && snap.optionsEn && snap.optionsEn.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                        {snap.optionsEn.map((opt, idx) => {
                          const optNum = idx + 1;
                          const letter = String.fromCharCode(65 + idx);
                          const isCurrentCorrect = snap.correctOption === optNum;
                          const isSuggestedCorrect =
                            rep.status === "open" &&
                            rep.suggestedCorrectOption === optNum &&
                            rep.suggestedCorrectOption !== snap.correctOption;

                          return (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                                isCurrentCorrect
                                  ? "bg-emerald-100/90 border-emerald-400 text-emerald-950 font-black"
                                  : isSuggestedCorrect
                                  ? "bg-amber-100/90 border-amber-400 text-amber-950 font-black ring-2 ring-amber-400/40"
                                  : "bg-white border-slate-200 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                                    isCurrentCorrect
                                      ? "bg-emerald-600 text-white"
                                      : isSuggestedCorrect
                                      ? "bg-amber-500 text-white"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span className="truncate">{opt}</span>
                              </div>
                              {isCurrentCorrect && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-black shrink-0">
                                  Current Key
                                </span>
                              )}
                              {isSuggestedCorrect && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-600 text-white font-black shrink-0">
                                  Suggested Key
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Educator Feedback & Admin 1-Click Fix Controls */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1.5">
                        <div className="text-[11px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Educator Report Details</span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                          {rep.description}
                        </p>
                      </div>

                      {rep.suggestedCorrectOption && rep.questionType === "mcq" && (
                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950 flex items-center justify-between">
                          <span>
                            Suggested Correct Option:{" "}
                            <strong className="px-2 py-0.5 rounded bg-amber-500 text-white font-black ml-1">
                              Option {String.fromCharCode(64 + rep.suggestedCorrectOption)}
                            </strong>
                          </span>
                        </div>
                      )}

                      {rep.suggestedFix &&
                        rep.suggestedFix.trim() !== snap.textEn.trim() && (
                          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                              Suggested Text Correction:
                            </span>
                            <p className="text-xs font-bold text-emerald-950">
                              {rep.suggestedFix}
                            </p>
                          </div>
                        )}

                      {rep.adminNotes && (
                        <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                          <strong className="text-slate-900">Admin Note:</strong> {rep.adminNotes}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      {hasOneClickSuggestion && (
                        <button
                          type="button"
                          disabled={processingId === rep.id}
                          onClick={() => handleOneClickApplySuggestion(rep)}
                          className="flex-1 min-w-[180px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>
                            {rep.category === "wrong_answer" && rep.suggestedCorrectOption
                              ? `1-Click Fix Key → Option ${String.fromCharCode(
                                  64 + rep.suggestedCorrectOption
                                )}`
                              : "1-Click Apply Suggested Fix"}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenFixModal(rep)}
                        className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit &amp; Fix Question</span>
                      </button>

                      {rep.status === "open" ? (
                        <>
                          <button
                            type="button"
                            disabled={processingId === rep.id}
                            onClick={() => handleStatusChange(rep, "resolved")}
                            className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                            title="Mark Resolved without changing question"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Resolve</span>
                          </button>
                          <button
                            type="button"
                            disabled={processingId === rep.id}
                            onClick={() => handleStatusChange(rep, "dismissed")}
                            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                            title="Dismiss report"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Dismiss</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={processingId === rep.id}
                          onClick={() => handleStatusChange(rep, "open")}
                          className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reopen</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={processingId === rep.id}
                        onClick={() => handleDelete(rep.id)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-auto cursor-pointer"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          1-CLICK LIVE QUESTION EDITOR & RESOLUTION MODAL
          ========================================================================= */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base sm:text-lg">
                    Fix Live Question &amp; Resolve Report
                  </h2>
                  <p className="text-xs text-slate-300">
                    Reported by {editingReport.reporterName} &bull;{" "}
                    {CATEGORY_META[editingReport.category]?.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFixModal} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs sm:text-sm">
              {/* Teacher's Note Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                <div className="font-black uppercase tracking-wider text-[10px] text-amber-800">
                  Educator&apos;s Flagged Note:
                </div>
                <div className="font-semibold">{editingReport.description}</div>
              </div>

              {/* English Stem */}
              <div className="space-y-1.5">
                <label className="block font-black text-slate-800 text-xs uppercase tracking-wider">
                  English Question Text (Supports KaTeX $...$)
                </label>
                <textarea
                  rows={3}
                  value={fixTextEn}
                  onChange={(e) => setFixTextEn(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  required
                />
              </div>

              {/* Urdu Stem */}
              <div className="space-y-1.5">
                <label className="block font-black text-slate-800 text-xs uppercase tracking-wider">
                  Urdu Question Translation (سوال کا اردو ترجمہ)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={fixTextUr}
                  onChange={(e) => setFixTextUr(e.target.value)}
                  placeholder="اردو ترجمہ یہاں درج کریں..."
                  className="w-full rounded-xl border border-slate-300 p-3 font-urdu text-base text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>

              {/* MCQ Options & Correct Answer Key */}
              {editingReport.questionType === "mcq" && (
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-black text-blue-950 text-xs uppercase tracking-wider">
                      MCQ Options &amp; Answer Key
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-blue-900">Correct Option:</span>
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setFixCorrectOption(num)}
                          className={`px-3 py-1 rounded-lg font-black text-xs transition-all cursor-pointer ${
                            fixCorrectOption === num
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {String.fromCharCode(64 + num)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          Option {String.fromCharCode(65 + idx)} (English)
                        </label>
                        <input
                          type="text"
                          value={fixOptionsEn[idx] || ""}
                          onChange={(e) => {
                            const next = [...fixOptionsEn];
                            next[idx] = e.target.value;
                            setFixOptionsEn(next);
                          }}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Short / Long Model Answer & Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">
                    Model Answer / Explanation (Optional)
                  </label>
                  <input
                    type="text"
                    value={fixAnswerEn}
                    onChange={(e) => setFixAnswerEn(e.target.value)}
                    placeholder="Model answer or key explanation..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={fixMarks}
                    onChange={(e) => setFixMarks(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-black"
                  />
                </div>
              </div>

              {/* Admin Resolution Note */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 text-xs">
                  Admin Resolution Note
                </label>
                <input
                  type="text"
                  value={fixAdminNotes}
                  onChange={(e) => setFixAdminNotes(e.target.value)}
                  placeholder="Note explaining what was fixed..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFix}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savingFix ? "Saving & Resolving..." : "Save Question & Mark Resolved"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
