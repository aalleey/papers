"use client";

import React, { useMemo, useState } from "react";
import {
  FileText,
  CalendarDays,
  CalendarRange,
  HelpCircle,
  Award,
  KeyRound,
  Mail,
  Phone,
  School,
  Crown,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Languages,
  BookOpen,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Receipt,
  Flag,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Layers,
  UserCheck,
  CreditCard,
  Send,
  ExternalLink,
  AlertTriangle,
  LayoutTemplate,
} from "lucide-react";
import { PaperTemplateSettings } from "@/components/PaperTemplateSettings";
import {
  ClientUser,
  PaperRecord,
  ClientPaperStats,
  InvoiceRecord,
  EmailRecord,
  QuestionReportRecord,
} from "@/lib/types";

interface Props {
  client: ClientUser;
  papers: PaperRecord[];
  stats: ClientPaperStats;
  invoices?: InvoiceRecord[];
  emails?: EmailRecord[];
  reports?: QuestionReportRecord[];
  isAdminView?: boolean;
  onClientUpdated?: (updated: ClientUser) => void;
}

const MODE_LABEL: Record<string, string> = {
  all: "Paper + Key",
  questions: "Paper only",
  key: "Answer key",
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso?: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff)) return "Never";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return fmtDate(iso);
}

export function ClientProfileView({
  client,
  papers,
  stats,
  invoices = [],
  emails = [],
  reports = [],
  isAdminView = false,
  onClientUpdated,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "papers" | "billing" | "communications" | "permissions" | "template"
  >("overview");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [visible, setVisible] = useState(15);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const sub = client.subscription;
  const isPending = sub.status === "pending_verification" || client.isVerified === false;
  const isSuspended = sub.status === "suspended";
  const isExpired = sub.status === "expired";

  const daysLeft = sub.expiresAt
    ? Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  const maxPerDay = Math.max(1, ...stats.perDay.map((d) => d.count));
  const maxSubject = Math.max(1, ...stats.bySubject.map((s) => s.count));

  const copyValue = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Breakdown of total MCQ / Short / Long questions across all generated papers
  const questionBreakdown = useMemo(() => {
    let mcq = 0;
    let short = 0;
    let long = 0;
    papers.forEach((p) => {
      mcq += p.mcqCount || 0;
      short += p.shortCount || 0;
      long += p.longCount || 0;
    });
    const total = Math.max(1, mcq + short + long);
    return {
      mcq,
      short,
      long,
      mcqPct: Math.round((mcq / total) * 100),
      shortPct: Math.round((short / total) * 100),
      longPct: Math.round((long / total) * 100),
    };
  }, [papers]);

  // Export Mode breakdown
  const exportModeBreakdown = useMemo(() => {
    let all = 0;
    let questionsOnly = 0;
    let keyOnly = 0;
    papers.forEach((p) => {
      if (p.exportMode === "all") all++;
      else if (p.exportMode === "questions") questionsOnly++;
      else if (p.exportMode === "key") keyOnly++;
    });
    return { all, questionsOnly, keyOnly };
  }, [papers]);

  // Unique classes & syllabi taught by educator
  const educatorFootprint = useMemo(() => {
    const classSet = new Set<string>();
    const syllabusSet = new Set<string>();
    papers.forEach((p) => {
      if (p.className) classSet.add(p.className);
      if (p.syllabus) syllabusSet.add(p.syllabus);
    });
    return {
      classes: Array.from(classSet),
      syllabi: Array.from(syllabusSet).slice(0, 8),
      avgQuestionsPerPaper: papers.length > 0 ? Math.round(stats.totalQuestions / papers.length) : 0,
      avgMarksPerPaper: papers.length > 0 ? Math.round(stats.totalMarks / papers.length) : 0,
    };
  }, [papers, stats]);

  const subjects = useMemo(
    () => Array.from(new Set(papers.map((p) => p.subject))),
    [papers]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return papers.filter((p) => {
      if (subjectFilter !== "all" && p.subject !== subjectFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.syllabus.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q)
      );
    });
  }, [papers, search, subjectFilter]);

  const handleQuickAdminUpdate = async (payload: Record<string, unknown>, successMsg: string) => {
    if (!onClientUpdated) return;
    try {
      setActionLoading(successMsg);
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.client) {
        onClientUpdated(data.client);
        notify(successMsg);
      }
    } catch {
      notify("Failed to update profile");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendWelcomeEmail = async () => {
    try {
      setActionLoading("email");
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      const data = await res.json();
      if (res.ok) {
        notify(
          data.simulated
            ? "Welcome email simulated & logged to outbox!"
            : `Welcome email sent to ${client.email}!`
        );
      }
    } catch {
      notify("Could not send welcome email");
    } finally {
      setActionLoading(null);
    }
  };

  const statCards = [
    {
      label: "Total Papers",
      value: stats.totalPapers,
      icon: FileText,
      tone: "from-emerald-400 via-emerald-500 to-teal-600",
      glow: "shadow-emerald-500/20",
      badgeBg: "bg-emerald-500/10 text-emerald-700 border-emerald-200/80",
      sub: `Last: ${timeAgo(stats.lastPaperAt)}`,
    },
    {
      label: "This Month",
      value: stats.papersThisMonth,
      icon: CalendarDays,
      tone: "from-blue-400 via-blue-500 to-indigo-600",
      glow: "shadow-blue-500/20",
      badgeBg: "bg-blue-500/10 text-blue-700 border-blue-200/80",
      sub: "Generated in 30d",
    },
    {
      label: "This Week",
      value: stats.papersThisWeek,
      icon: CalendarRange,
      tone: "from-violet-400 via-purple-500 to-fuchsia-600",
      glow: "shadow-purple-500/20",
      badgeBg: "bg-purple-500/10 text-purple-700 border-purple-200/80",
      sub: "Last 7 days activity",
    },
    {
      label: "Questions Used",
      value: stats.totalQuestions,
      icon: HelpCircle,
      tone: "from-amber-400 via-orange-500 to-rose-500",
      glow: "shadow-amber-500/20",
      badgeBg: "bg-amber-500/10 text-amber-800 border-amber-200/80",
      sub: `Avg ${educatorFootprint.avgQuestionsPerPaper} Qs / paper`,
    },
    {
      label: "Total Marks",
      value: stats.totalMarks,
      icon: Award,
      tone: "from-rose-400 via-pink-500 to-fuchsia-600",
      glow: "shadow-rose-500/20",
      badgeBg: "bg-rose-500/10 text-rose-700 border-rose-200/80",
      sub: `Avg ${educatorFootprint.avgMarksPerPaper} marks / paper`,
    },
    {
      label: "With Answer Key",
      value: stats.withAnswerKey,
      icon: KeyRound,
      tone: "from-cyan-400 via-sky-500 to-blue-600",
      glow: "shadow-cyan-500/20",
      badgeBg: "bg-cyan-500/10 text-cyan-700 border-cyan-200/80",
      sub: "OMR & keys exported",
    },
  ];

  const permissionItems = [
    {
      key: "canAutoBoardPattern",
      label: "Auto Punjab Board Pairing Scheme (ALP)",
      desc: "Automatic 1-click question selection matching BISE Lahore & Punjab Board syllabus weightage",
      enabled: sub.canAutoBoardPattern,
    },
    {
      key: "canCustomBranding",
      label: "Custom School / Academy Crest & Watermark",
      desc: "Prints institution name, custom logo, campus header, and watermark on every exam sheet",
      enabled: sub.canCustomBranding,
    },
    {
      key: "canExportAnswerKey",
      label: "Automated Answer Key & OMR Bubble Sheet",
      desc: "Exports teacher solution matrix and student OMR bubble grid alongside objective MCQs",
      enabled: sub.canExportAnswerKey,
    },
    {
      key: "canFullBoardPaper",
      label: "Full Board Subjective Paper Structure",
      desc: "Unlocks multi-section Part-I & Part-II board examination layouts and 2-Up duplex printing",
      enabled: sub.canFullBoardPaper,
    },
    {
      key: "canUnlimitedExport",
      label: "Unlimited PDF & Word (.DOCX) Exports",
      desc: "No daily or monthly cap on generating, printing, or downloading editable Word exam papers",
      enabled: sub.canUnlimitedExport,
    },
    {
      key: "canAccessAllClasses",
      label: "All Classes Curriculum (9th, 10th, 1st & 2nd Year)",
      desc: "Full access across Matric and Intermediate Bilingual question banks",
      enabled: sub.canAccessAllClasses,
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-emerald-400/40 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* =====================================================================
          1. 3D LIQUID GLASS EXECUTIVE PROFILE BANNER
          ===================================================================== */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-white/15 shadow-[0_28px_70px_-15px_rgba(15,23,42,0.45),inset_0_2px_2px_rgba(255,255,255,0.2)]">
        {/* Ambient Liquid Glass Orbs */}
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-indigo-500/25 blur-3xl pointer-events-none" />
        <div className="absolute top-0 inset-x-10 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        <div className="relative flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          {/* Left: Avatar + Identity + Credentials */}
          <div className="flex flex-col sm:flex-row items-start gap-5 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center text-3xl sm:text-4xl font-black text-slate-950 shadow-[0_8px_25px_-4px_rgba(16,185,129,0.55),inset_0_2px_3px_rgba(255,255,255,0.8)] ring-4 ring-white/15">
                {client.fullName.charAt(0).toUpperCase()}
              </div>
              <div
                className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center border-2 border-slate-900 shadow-md ${
                  isPending
                    ? "bg-amber-400 text-slate-950"
                    : isSuspended
                    ? "bg-rose-500 text-white"
                    : "bg-emerald-400 text-slate-950"
                }`}
                title={isPending ? "Pending Verification" : isSuspended ? "Suspended" : "Verified Educator"}
              >
                {isPending ? (
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : isSuspended ? (
                  <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              {/* Name, Role, Status Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
                  {client.fullName}
                </h1>
                {sub.planId !== "free" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-300 border border-amber-400/35">
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>PRO EDUCATOR</span>
                  </span>
                )}
                {isPending ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/25 text-amber-200 border border-amber-400/50 animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>HOLD &bull; PENDING APPROVAL</span>
                  </span>
                ) : isSuspended ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/25 text-rose-200 border border-rose-400/40">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>SUSPENDED</span>
                  </span>
                ) : isExpired ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/25 text-amber-200 border border-amber-400/40">
                    <Clock className="w-3.5 h-3.5" />
                    <span>EXPIRED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ACTIVE &amp; VERIFIED</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/10 text-[10px] font-mono text-slate-300">
                  ID: {client.id}
                </span>
              </div>

              {/* Institution & Contact Pills with 1-Click Copy */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100 font-semibold">
                  <School className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{client.academyName || "Independent Educator Academy"}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100">
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <a href={`mailto:${client.email}`} className="hover:underline font-medium">
                    {client.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyValue("email", client.email)}
                    className="ml-1 p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedField === "email" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {client.phone ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <a
                      href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline font-semibold text-emerald-200"
                    >
                      {client.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => copyValue("phone", client.phone!)}
                      className="ml-1 p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedField === "phone" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 italic">
                    <Phone className="w-3.5 h-3.5" /> No phone linked
                  </span>
                )}

                {/* Password Vault Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 backdrop-blur-md border border-amber-400/30 text-amber-100 font-mono">
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-[11px] font-sans text-amber-200/80">Pass:</span>
                  <span className="font-bold text-amber-200">
                    {client.password ? (showPassword ? client.password : "••••••••") : "default123"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-0.5 p-0.5 text-amber-200/80 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {client.password && (
                    <button
                      type="button"
                      onClick={() => copyValue("pass", client.password!)}
                      className="p-0.5 text-amber-200/80 hover:text-white transition-colors cursor-pointer"
                      title="Copy Password"
                    >
                      {copiedField === "pass" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Timestamps & Footprint Tags */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300/90 pt-0.5">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Joined: <strong className="text-white">{fmtDate(client.createdAt)}</strong></span>
                </span>
                {client.updatedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Updated: <strong className="text-white">{timeAgo(client.updatedAt)}</strong></span>
                  </span>
                )}
                {educatorFootprint.classes.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Classes Taught: <strong className="text-emerald-300">{educatorFootprint.classes.join(", ")}</strong></span>
                  </span>
                )}
              </div>

              {client.notes && (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-center gap-2 max-w-2xl">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong className="text-amber-300">Admin Note:</strong> {client.notes}</span>
                </div>
              )}

              {/* Raast Payment Submission Callout */}
              {client.paymentSubmission && (
                <div className="mt-2 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-emerald-500/15 backdrop-blur-xl border border-amber-400/40 text-amber-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="space-y-1">
                    <div className="font-black text-amber-300 flex items-center gap-1.5 text-xs sm:text-sm">
                      <CreditCard className="w-4 h-4 text-amber-300" />
                      <span>Raast Transfer Proof Submitted ({fmtDate(client.paymentSubmission.submittedAt)})</span>
                    </div>
                    <div className="text-[11px] text-amber-100/95 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
                      <span>Raast ID: <strong className="text-white">{client.paymentSubmission.raastId || "03092770207"}</strong></span>
                      <span>TID / Ref: <strong className="text-emerald-300 underline">{client.paymentSubmission.transactionRef}</strong></span>
                      {client.paymentSubmission.amount && <span>Amount: <strong className="text-white">Rs. {client.paymentSubmission.amount}</strong></span>}
                      {client.paymentSubmission.senderName && <span>Sender: <strong className="text-white">{client.paymentSubmission.senderName}</strong></span>}
                      {client.paymentSubmission.senderPhone && <span>Phone: <strong className="text-white">{client.paymentSubmission.senderPhone}</strong></span>}
                    </div>
                  </div>
                  {isPending && isAdminView && onClientUpdated && (
                    <button
                      type="button"
                      disabled={actionLoading !== null}
                      onClick={() =>
                        handleQuickAdminUpdate(
                          {
                            status: "active",
                            isVerified: true,
                            planId: sub.planId === "free" ? "standard" : sub.planId,
                          },
                          "Account Approved & Activated!"
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-400 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shrink-0 cursor-pointer transition-all"
                    >
                      ✓ Approve &amp; Activate Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: 3D Liquid Glass Subscription Card & Quick Controls */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 p-5 sm:min-w-[270px] xl:max-w-xs w-full space-y-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                Subscription Tier
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-slate-200 uppercase">
                {sub.planId}
              </span>
            </div>

            <div>
              <div className="text-xl font-black text-white flex items-center gap-2">
                {sub.planId === "pay_as_you_go" ? (
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                ) : (
                  <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                )}
                <span>{sub.planName}</span>
              </div>

              <div className="mt-1.5 text-xs text-slate-300">
                {sub.planId === "pay_as_you_go" ? (
                  <span>
                    Remaining Credits: <strong className="text-emerald-300 text-sm">{sub.paperCredits} papers</strong>
                  </span>
                ) : sub.expiresAt ? (
                  daysLeft !== null && daysLeft >= 0 ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <strong className={daysLeft <= 14 ? "text-amber-300" : "text-emerald-300"}>
                          {daysLeft} days remaining
                        </strong>
                        <span className="text-[11px] text-slate-400">Ends {fmtDate(sub.expiresAt)}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            daysLeft <= 14 ? "bg-amber-400" : "bg-gradient-to-r from-emerald-400 to-cyan-400"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(8, (daysLeft / 30) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <strong className="text-rose-300">Expired on {fmtDate(sub.expiresAt)}</strong>
                  )
                ) : (
                  <span className="text-emerald-300 font-semibold">Unlimited / No Expiry</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px]">Quota / Paper</span>
                <strong className="text-white font-black">{sub.maxQuestionsPerPaper} Qs</strong>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400 block text-[10px]">Paper Credits</span>
                <strong className="text-emerald-300 font-black">
                  {sub.paperCredits >= 99999 ? "Unlimited" : sub.paperCredits}
                </strong>
              </div>
            </div>

            {isAdminView && onClientUpdated && (
              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  disabled={actionLoading !== null}
                  onClick={() => {
                    const nextExp = new Date(
                      sub.expiresAt && new Date(sub.expiresAt) > new Date()
                        ? new Date(sub.expiresAt).getTime() + 30 * 24 * 60 * 60 * 1000
                        : Date.now() + 30 * 24 * 60 * 60 * 1000
                    ).toISOString();
                    handleQuickAdminUpdate(
                      { status: "active", isVerified: true, expiresAt: nextExp },
                      "Extended subscription by +30 Days!"
                    );
                  }}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold transition-all cursor-pointer"
                >
                  +30 Days
                </button>
                <button
                  type="button"
                  disabled={actionLoading !== null}
                  onClick={handleResendWelcomeEmail}
                  className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Send Welcome Email"
                >
                  <Send className="w-3 h-3" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  disabled={actionLoading !== null}
                  onClick={() =>
                    handleQuickAdminUpdate(
                      { status: isSuspended ? "active" : "suspended" },
                      isSuspended ? "Account Reactivated!" : "Account Suspended!"
                    )
                  }
                  className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    isSuspended
                      ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                      : "bg-rose-500/20 border-rose-400/30 text-rose-200 hover:bg-rose-500/30"
                  }`}
                >
                  {isSuspended ? "Unsuspend" : "Suspend"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. 3D GLASS KPI TELEMETRY CARDS
          ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/90 via-white/75 to-white/90 backdrop-blur-2xl saturate-150 border border-white/90 p-4 shadow-[0_14px_35px_-10px_rgba(15,23,42,0.08),0_3px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${c.tone} text-white flex items-center justify-center shadow-lg ${c.glow} border border-white/30`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${c.badgeBg}`}>
                  LIVE
                </span>
              </div>
              <div className="mt-3 text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                {c.value.toLocaleString()}
              </div>
              <div className="text-xs font-extrabold text-slate-800 mt-0.5">{c.label}</div>
              <div className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          3. SEGMENTED GLASS NAVIGATION TABS
          ===================================================================== */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-2xl p-2 rounded-2xl border border-white/90 shadow-[0_10px_25px_-8px_rgba(15,23,42,0.07),0_3px_0_0_rgba(203,213,225,0.5),inset_0_1px_0_#ffffff] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: "overview", label: "Rich Profile & Analytics", icon: TrendingUp },
            { id: "papers", label: `Paper History (${papers.length})`, icon: FileText },
            ...(isAdminView ? [] : [{ id: "template", label: "Paper Template", icon: LayoutTemplate }]),
            { id: "billing", label: `Billing & Raast (${invoices.length + (client.paymentSubmission ? 1 : 0)})`, icon: Receipt },
            { id: "communications", label: `Emails & Reports (${emails.length + reports.length})`, icon: Mail },
            { id: "permissions", label: "Entitlements & Access", icon: ShieldCheck },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-gradient-to-b from-slate-900 to-indigo-950 text-white shadow-[0_3px_0_0_#0f172a,0_8px_16px_-4px_rgba(15,23,42,0.3)] -translate-y-0.5"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          TAB: PAPER TEMPLATE (user's default paper generation settings)
          ===================================================================== */}
      {activeTab === "template" && !isAdminView && <PaperTemplateSettings client={client} />}

      {/* =====================================================================
          TAB 1: OVERVIEW (ANALYTICS, QUESTION COMPOSITION, SYLLABUS FOOTPRINT)
          ===================================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 14-Day Activity Chart */}
            <div className="lg:col-span-2 rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-6 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Paper Generation Velocity &bull; Last 14 Days</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Daily examination papers compiled and exported by {client.fullName}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                  {stats.perDay.reduce((s, d) => s + d.count, 0)} papers (14d)
                </span>
              </div>

              <div className="flex items-end gap-2 h-44 pt-4 px-2 rounded-2xl bg-gradient-to-b from-slate-50/70 to-white border border-slate-100">
                {stats.perDay.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1.5 group h-full">
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-2xs">
                      {d.count}
                    </span>
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        d.count > 0
                          ? "bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 shadow-sm shadow-emerald-500/30 group-hover:from-emerald-500 group-hover:to-teal-300"
                          : "bg-slate-200/70"
                      }`}
                      style={{ height: `${d.count > 0 ? Math.max(10, (d.count / maxPerDay) * 100) : 5}%` }}
                      title={`${d.date}: ${d.count} paper(s)`}
                    />
                    <span className="text-[10px] font-bold text-slate-400 pb-1">{d.date.substring(8, 10)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Question Type & Export Composition */}
            <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-6 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] space-y-5">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Question Bank Composition</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Distribution across Objective, Short &amp; Long questions
                </p>
              </div>

              {/* Stacked Progress Bar */}
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex p-0.5 gap-0.5 border border-slate-200/80">
                  <div
                    className="h-full rounded-l-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${Math.max(5, questionBreakdown.mcqPct)}%` }}
                    title={`MCQs: ${questionBreakdown.mcq}`}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${Math.max(5, questionBreakdown.shortPct)}%` }}
                    title={`Short Questions: ${questionBreakdown.short}`}
                  />
                  <div
                    className="h-full rounded-r-full bg-gradient-to-r from-purple-500 to-fuchsia-600"
                    style={{ width: `${Math.max(5, questionBreakdown.longPct)}%` }}
                    title={`Long Questions: ${questionBreakdown.long}`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2.5 rounded-2xl bg-blue-50/80 border border-blue-200/80">
                    <span className="text-[10px] font-extrabold uppercase text-blue-700 block">MCQs</span>
                    <span className="text-base font-black text-blue-950">{questionBreakdown.mcq}</span>
                    <span className="text-[10px] text-blue-600 font-bold block">{questionBreakdown.mcqPct}%</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-700 block">Shorts</span>
                    <span className="text-base font-black text-emerald-950">{questionBreakdown.short}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">{questionBreakdown.shortPct}%</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-purple-50/80 border border-purple-200/80">
                    <span className="text-[10px] font-extrabold uppercase text-purple-700 block">Longs</span>
                    <span className="text-base font-black text-purple-950">{questionBreakdown.long}</span>
                    <span className="text-[10px] text-purple-600 font-bold block">{questionBreakdown.longPct}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/70 space-y-2">
                <span className="text-xs font-extrabold text-slate-700 block">Export Format Preferences</span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="font-black text-slate-900 block">{exportModeBreakdown.all}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Paper + Key</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="font-black text-slate-900 block">{exportModeBreakdown.questionsOnly}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Paper Only</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="font-black text-slate-900 block">{exportModeBreakdown.keyOnly}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Key Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Distribution, Language Mode & Syllabus Footprint */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Subject Breakdown */}
            <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-6 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Subjects Taught &amp; Examined</span>
              </h3>
              {stats.bySubject.length === 0 ? (
                <p className="text-xs text-slate-400">No subject data recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.bySubject.map((s) => (
                    <div key={s.subject}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800">{s.subject}</span>
                        <span className="font-black text-emerald-700">{s.count} papers</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                          style={{ width: `${(s.count / maxSubject) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medium / Language Breakdown */}
            <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-6 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-600" />
                <span>Language Medium &amp; Classes</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.byLanguage.length === 0 && (
                  <p className="text-xs text-slate-400">No language metrics yet.</p>
                )}
                {stats.byLanguage.map((l) => (
                  <div
                    key={l.language}
                    className="flex-1 min-w-[110px] p-3 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-violet-50/60 border border-indigo-200/80 text-center"
                  >
                    <span className="text-lg font-black text-indigo-950 block">{l.count}</span>
                    <span className="text-[11px] font-bold text-indigo-700">{l.language} Medium</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200/70">
                <span className="text-xs font-extrabold text-slate-700 block mb-2">
                  Recent Syllabus Units Tested
                </span>
                {educatorFootprint.syllabi.length === 0 ? (
                  <p className="text-xs text-slate-400">No chapters tested yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {educatorFootprint.syllabi.map((unit) => (
                      <span
                        key={unit}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 text-[11px] font-semibold transition-colors"
                      >
                        {unit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Account Security & Quick Profile Summary */}
            <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-6 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Account Credentials &amp; Audit</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Verification Status</span>
                  <span className={`font-black ${isPending ? "text-amber-600" : "text-emerald-600"}`}>
                    {isPending ? "Hold (Pending Review)" : "Verified Educator"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Registered Email</span>
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">{client.email}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">WhatsApp / Mobile</span>
                  <span className="font-bold text-slate-800">{client.phone || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Invoices Issued</span>
                  <span className="font-bold text-slate-800">{invoices.length} invoices</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500 font-medium">Emails Dispatched</span>
                  <span className="font-bold text-slate-800">{emails.length} messages</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: GENERATED PAPERS HISTORY
          ===================================================================== */}
      {(activeTab === "papers" || activeTab === "overview") && (
        <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Generated Examination Papers Log</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Showing {filtered.length} of {papers.length} total papers generated by {client.fullName}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setVisible(15);
                  }}
                  placeholder="Search paper title, unit, subject..."
                  className="pl-9 pr-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-56 shadow-2xs"
                />
              </div>
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setVisible(15);
                }}
                className="py-2 px-3 text-xs font-bold rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-2xs cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto stroke-1 text-slate-300" />
              <p className="mt-2 text-sm font-black text-slate-700">No generated papers match your filter</p>
              <p className="text-xs text-slate-500">Papers are automatically logged whenever an exam is printed or exported.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-extrabold text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Date &amp; Time</th>
                      <th className="py-3.5 px-4">Paper Title &amp; Class</th>
                      <th className="py-3.5 px-4">Syllabus / Chapters</th>
                      <th className="py-3.5 px-4">Questions Breakdown</th>
                      <th className="py-3.5 px-4">Total Marks</th>
                      <th className="py-3.5 px-4">Medium</th>
                      <th className="py-3.5 px-4">Export Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.slice(0, visible).map((p) => (
                      <tr key={p.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{fmtDate(p.createdAt)}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{fmtTime(p.createdAt)}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">{p.title}</div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {p.subject} &bull; Class {p.className} &bull; Set {p.version}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[240px] text-slate-600 font-medium">
                          <span className="line-clamp-2">{p.syllabus || "—"}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900">{p.questionCount} Questions</div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold">
                            <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {p.mcqCount} MCQ
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {p.shortCount} Short
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              {p.longCount} Long
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-black">
                            {p.totalMarks} Marks
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200">
                            {p.languageMode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                            {MODE_LABEL[p.exportMode] || p.exportMode}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {visible < filtered.length && (
                <div className="p-4 text-center border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => setVisible((v) => v + 15)}
                    className="px-5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-extrabold text-slate-800 shadow-2xs cursor-pointer"
                  >
                    Show More Papers ({filtered.length - visible} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 3: BILLING, INVOICES & RAAST VERIFICATION LEDGER
          ===================================================================== */}
      {activeTab === "billing" && (
        <div className="space-y-5">
          {/* Raast Payment Submission Card */}
          <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-6 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>Raast Payment Verification Details</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Official PaperWala Raast ID: <strong className="font-mono text-slate-800">03092770207</strong>
                </p>
              </div>
            </div>

            {client.paymentSubmission ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <span className="text-[10px] font-bold uppercase text-amber-700 block">Transaction ID (TID)</span>
                  <span className="text-base font-black font-mono text-amber-950 mt-0.5 block">
                    {client.paymentSubmission.transactionRef}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">Amount Transferred</span>
                  <span className="text-base font-black text-emerald-950 mt-0.5 block">
                    Rs. {client.paymentSubmission.amount || "2,000"}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                  <span className="text-[10px] font-bold uppercase text-blue-700 block">Sender Name &amp; Phone</span>
                  <span className="text-sm font-black text-blue-950 mt-0.5 block">
                    {client.paymentSubmission.senderName || client.fullName} ({client.paymentSubmission.senderPhone || client.phone || "N/A"})
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                  <span className="text-[10px] font-bold uppercase text-purple-700 block">Submitted Timestamp</span>
                  <span className="text-sm font-black text-purple-950 mt-0.5 block">
                    {fmtDate(client.paymentSubmission.submittedAt)} {fmtTime(client.paymentSubmission.submittedAt)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-center text-xs text-slate-500">
                No manual Raast TID submission on file for this account.
              </div>
            )}
          </div>

          {/* Invoices Table */}
          <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200/70">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>Billing &amp; Invoices Ledger ({invoices.length})</span>
              </h2>
            </div>
            {invoices.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No formal invoices generated for this educator yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-300 uppercase text-[11px] font-extrabold">
                    <tr>
                      <th className="py-3.5 px-4">Invoice #</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Issued Date</th>
                      <th className="py-3.5 px-4">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-mono font-black text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{inv.description}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-700">Rs. {inv.amount.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              inv.status === "paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : inv.status === "sent"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{fmtDate(inv.issuedAt)}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{inv.transactionRef || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: COMMUNICATIONS & QUESTION REPORTS
          ===================================================================== */}
      {activeTab === "communications" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Transactional Emails Sent */}
          <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-6 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Dispatched Emails ({emails.length})</span>
                </h2>
                <p className="text-xs text-slate-500">Welcome &amp; transactional notifications sent to {client.email}</p>
              </div>
              {isAdminView && (
                <button
                  type="button"
                  onClick={handleResendWelcomeEmail}
                  disabled={actionLoading === "email"}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Resend Welcome Email</span>
                </button>
              )}
            </div>

            {emails.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-400">
                No emails logged for this recipient yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {emails.map((em) => (
                  <div
                    key={em.id}
                    className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-slate-900 truncate">{em.subject}</div>
                      <div className="text-[11px] text-slate-500">
                        Template: <strong className="uppercase">{em.template}</strong> &bull; {fmtDate(em.sentAt)} {fmtTime(em.sentAt)}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                        em.status === "sent" || em.status === "delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {em.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question Reports Submitted by Educator */}
          <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-6 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <span>Submitted Question Feedback ({reports.length})</span>
              </h2>
              <p className="text-xs text-slate-500">Typos or answer key flags reported by this educator</p>
            </div>

            {reports.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-400">
                No question error reports submitted by this educator.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 uppercase text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {rep.category.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-slate-400">{fmtDate(rep.createdAt)}</span>
                    </div>
                    <p className="font-semibold text-slate-800">{rep.description}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Question: {rep.questionSnapshot.textEn}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: ENTITLEMENTS & ACCESS MATRIX
          ===================================================================== */}
      {activeTab === "permissions" && (
        <div className="rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/95 p-6 shadow-[0_18px_45px_-12px_rgba(15,23,42,0.08),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Plan Entitlements &amp; Feature Matrix</span>
              </h2>
              <p className="text-xs text-slate-500">
                Active capabilities unlocked for {client.fullName} under <strong>{sub.planName}</strong>
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-black">
              Max {sub.maxQuestionsPerPaper} Questions / Single Paper
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {permissionItems.map((item) => (
              <div
                key={item.key}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  item.enabled
                    ? "bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 border-emerald-200/90 shadow-xs"
                    : "bg-slate-50/70 border-slate-200/80 opacity-70"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-xs text-slate-900">{item.label}</span>
                    {item.enabled ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> ENABLED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold shrink-0">
                        <XCircle className="w-3 h-3" /> LOCKED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>

                {isAdminView && onClientUpdated && (
                  <button
                    type="button"
                    disabled={actionLoading !== null}
                    onClick={() =>
                      handleQuickAdminUpdate(
                        {
                          permissions: {
                            [item.key]: !item.enabled,
                          },
                        },
                        `Updated ${item.label}!`
                      )
                    }
                    className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
                      item.enabled
                        ? "bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                    }`}
                  >
                    {item.enabled ? "Revoke Permission" : "Grant Permission"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
