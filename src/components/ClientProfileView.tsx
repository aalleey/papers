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
} from "lucide-react";
import { ClientUser, PaperRecord, ClientPaperStats } from "@/lib/types";

interface Props {
  client: ClientUser;
  papers: PaperRecord[];
  stats: ClientPaperStats;
}

const MODE_LABEL: Record<string, string> = {
  all: "Paper + Key",
  questions: "Paper only",
  key: "Answer key",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return fmtDate(iso);
}

export function ClientProfileView({ client, papers, stats }: Props) {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [visible, setVisible] = useState(15);
  const [showPassword, setShowPassword] = useState(false);

  const sub = client.subscription;
  const isSuspended = sub.status === "suspended";
  const isExpired = sub.status === "expired";

  const daysLeft = sub.expiresAt
    ? Math.ceil((new Date(sub.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;

  const maxPerDay = Math.max(1, ...stats.perDay.map((d) => d.count));
  const maxSubject = Math.max(1, ...stats.bySubject.map((s) => s.count));

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

  const statCards = [
    { label: "Total Papers", value: stats.totalPapers, icon: FileText, tone: "from-emerald-500 to-teal-600", sub: `Last: ${timeAgo(stats.lastPaperAt)}` },
    { label: "This Month", value: stats.papersThisMonth, icon: CalendarDays, tone: "from-blue-500 to-indigo-600", sub: "Papers generated" },
    { label: "This Week", value: stats.papersThisWeek, icon: CalendarRange, tone: "from-violet-500 to-fuchsia-600", sub: "Last 7 days" },
    { label: "Questions Used", value: stats.totalQuestions, icon: HelpCircle, tone: "from-amber-500 to-orange-600", sub: "Across all papers" },
    { label: "Total Marks", value: stats.totalMarks, icon: Award, tone: "from-rose-500 to-pink-600", sub: "Marks assessed" },
    { label: "With Answer Key", value: stats.withAnswerKey, icon: KeyRound, tone: "from-cyan-500 to-sky-600", sub: "Keys exported" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center text-3xl font-black shadow-lg ring-4 ring-white/10 shrink-0">
            {client.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{client.fullName}</h1>
              {sub.planId === "annual" && <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />}
              {isSuspended ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <XCircle className="w-3 h-3" /> SUSPENDED
                </span>
              ) : isExpired ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3 h-3" /> EXPIRED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs sm:text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <School className="w-4 h-4 text-emerald-400" />
                {client.academyName || "Educator Academy"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-400" />
                {client.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400" />
                {client.phone || "No phone added"}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10 text-white font-mono">
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Password:</span>
                <span className="font-bold text-amber-200">
                  {client.password
                    ? showPassword
                      ? client.password
                      : "••••••••"
                    : "default123"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-1 p-0.5 text-slate-300 hover:text-white transition-colors"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-emerald-400" />
                Member since {fmtDate(client.createdAt)}
              </span>
            </div>
            {client.notes && (
              <p className="text-[11px] text-slate-400 italic">Note: {client.notes}</p>
            )}
          </div>

          {/* Plan box */}
          <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur p-4 min-w-[220px] space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Plan</div>
            <div className="text-lg font-black text-white flex items-center gap-1.5">
              {sub.planId === "pay_as_you_go" ? <Zap className="w-4 h-4 text-amber-400" /> : <Crown className="w-4 h-4 text-amber-400" />}
              {sub.planName}
            </div>
            {sub.planId === "pay_as_you_go" ? (
              <div className="text-xs text-slate-300">
                Credits left: <b className="text-emerald-300">{sub.paperCredits}</b>
              </div>
            ) : sub.expiresAt ? (
              <div className="text-xs text-slate-300">
                {daysLeft !== null && daysLeft >= 0 ? (
                  <>
                    <b className={daysLeft <= 14 ? "text-amber-300" : "text-emerald-300"}>{daysLeft} days left</b>{" "}
                    · ends {fmtDate(sub.expiresAt)}
                  </>
                ) : (
                  <b className="text-rose-300">Expired {fmtDate(sub.expiresAt)}</b>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-300">No expiry</div>
            )}
            <div className="text-[11px] text-slate-400">Max {sub.maxQuestionsPerPaper} questions / paper</div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.tone} text-white flex items-center justify-center shadow-sm`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900">{c.value.toLocaleString()}</div>
              <div className="text-xs font-bold text-slate-700">{c.label}</div>
              <div className="text-[11px] text-slate-400">{c.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-900">Papers generated · last 14 days</h2>
            <span className="text-[11px] text-slate-400">{stats.perDay.reduce((s, d) => s + d.count, 0)} papers</span>
          </div>
          <div className="flex items-end gap-1.5 h-36">
            {stats.perDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 group h-full">
                <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.count}
                </span>
                <div
                  className={`w-full rounded-t-md transition-all ${
                    d.count > 0 ? "bg-gradient-to-t from-emerald-600 to-teal-400" : "bg-slate-100"
                  }`}
                  style={{ height: `${d.count > 0 ? Math.max(8, (d.count / maxPerDay) * 100) : 4}%` }}
                  title={`${d.date}: ${d.count} paper(s)`}
                />
                <span className="text-[9px] text-slate-400">{d.date.substring(8, 10)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
          <div>
            <h2 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" /> By subject
            </h2>
            {stats.bySubject.length === 0 ? (
              <p className="text-xs text-slate-400">No papers yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.bySubject.map((s) => (
                  <div key={s.subject}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 truncate">{s.subject}</span>
                      <span className="font-bold text-slate-900">{s.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${(s.count / maxSubject) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-indigo-600" /> By language
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {stats.byLanguage.length === 0 && <p className="text-xs text-slate-400">No papers yet.</p>}
              {stats.byLanguage.map((l) => (
                <span key={l.language} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-bold">
                  {l.language} · {l.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-black text-slate-900 mb-3">Plan permissions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            ["Board pairing scheme", sub.canAutoBoardPattern],
            ["Academy branding", sub.canCustomBranding],
            ["Answer key export", sub.canExportAnswerKey],
            ["Full board paper", sub.canFullBoardPaper],
            ["Unlimited exports", sub.canUnlimitedExport],
            ["All classes", sub.canAccessAllClasses],
          ].map(([label, on]) => (
            <span
              key={label as string}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${
                on
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-400 border-slate-200 line-through"
              }`}
            >
              {on ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {label as string}
            </span>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">Paper history</h2>
            <p className="text-xs text-slate-500">
              {filtered.length} of {papers.length} papers
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(15);
                }}
                placeholder="Search title, unit..."
                className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-52"
              />
            </div>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setVisible(15);
              }}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
            >
              <option value="all">All subjects</option>
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
            <p className="mt-2 text-sm font-bold text-slate-600">No papers found</p>
            <p className="text-xs">Papers appear here each time one is printed or exported.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Paper</th>
                    <th className="py-3 px-4">Syllabus</th>
                    <th className="py-3 px-4">Questions</th>
                    <th className="py-3 px-4">Marks</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.slice(0, visible).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{fmtDate(p.createdAt)}</div>
                        <div className="text-[11px] text-slate-400">{fmtTime(p.createdAt)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.subject} · Class {p.className} · Set {p.version}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[220px] text-slate-600">
                        <span className="line-clamp-2">{p.syllabus || "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{p.questionCount}</div>
                        <div className="text-[11px] text-slate-400">
                          {p.mcqCount} MCQ · {p.shortCount} S · {p.longCount} L
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{p.totalMarks}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                          {p.languageMode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                          {MODE_LABEL[p.exportMode] || p.exportMode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visible < filtered.length && (
              <div className="p-4 text-center border-t border-slate-100">
                <button
                  onClick={() => setVisible((v) => v + 15)}
                  className="px-5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
                >
                  Show more ({filtered.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
