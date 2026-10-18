"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Crown,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  School,
  Calendar,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Sparkles,
  Zap,
  Sliders,
  AlertTriangle,
  X,
  Check,
  Clock,
  KeyRound,
  ExternalLink,
  Lock,
  EyeOff,
  FileText,
  BookOpen,
  Copy,
  Activity,
  Award,
  Layers,
  LayoutGrid,
  Table2,
  TrendingUp,
} from "lucide-react";
import {
  ClientUser,
  SubscriptionPlanId,
  PLAN_METADATA,
  PaperRecord,
  ClientPaperStats,
  InvoiceRecord,
  EmailRecord,
  QuestionReportRecord,
} from "@/lib/types";
import { ClientProfileView } from "@/components/ClientProfileView";

interface StatsData {
  total: number;
  active: number;
  pendingVerification: number;
  free: number;
  paid: number;
  standard: number;
  annual: number;
  payAsYouGo: number;
  suspended: number;
  totalPapersGenerated?: number;
}

export default function AdminUsersPage() {
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    active: 0,
    pendingVerification: 0,
    free: 0,
    paid: 0,
    standard: 0,
    annual: 0,
    payAsYouGo: 0,
    suspended: 0,
    totalPapersGenerated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Track which client IDs have their password visible
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Rich Profile Dossier Modal State
  const [inspectingClientId, setInspectingClientId] = useState<string | null>(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [dossierData, setDossierData] = useState<{
    client: ClientUser;
    papers: PaperRecord[];
    stats: ClientPaperStats;
    invoices: InvoiceRecord[];
    emails: EmailRecord[];
    reports: QuestionReportRecord[];
  } | null>(null);

  // Edit Modal State
  const [editingClient, setEditingClient] = useState<ClientUser | null>(null);
  const [editTab, setEditTab] = useState<"profile" | "subscription" | "permissions">("profile");
  const [savingEdit, setSavingEdit] = useState(false);

  // Form Fields for Editing
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editAcademyName, setEditAcademyName] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [editPlanId, setEditPlanId] = useState<SubscriptionPlanId>("free");
  const [editStatus, setEditStatus] = useState<
    "active" | "expired" | "trial" | "suspended" | "pending_verification"
  >("active");
  const [editExpiresAt, setEditExpiresAt] = useState<string>("");
  const [editPaperCredits, setEditPaperCredits] = useState<number>(0);

  // Permission toggles
  const [permAutoBoard, setPermAutoBoard] = useState(false);
  const [permCustomBranding, setPermCustomBranding] = useState(false);
  const [permAnswerKey, setPermAnswerKey] = useState(false);
  const [permFullBoard, setPermFullBoard] = useState(false);
  const [permUnlimitedExport, setPermUnlimitedExport] = useState(false);
  const [permAllClasses, setPermAllClasses] = useState(true);
  const [permMaxQuestions, setPermMaxQuestions] = useState(10);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFullName, setAddFullName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addAcademyName, setAddAcademyName] = useState("");
  const [addPlanId, setAddPlanId] = useState<SubscriptionPlanId>("standard");
  const [addNotes, setAddNotes] = useState("");
  const [savingAdd, setSavingAdd] = useState(false);

  // Delete Confirmation State
  const [deletingClient, setDeletingClient] = useState<ClientUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Email Preview & Send State
  const [emailPreviewClient, setEmailPreviewClient] = useState<ClientUser | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Feedback Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopy = (val: string, key: string, label: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    showToast(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const loadClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (filterPlan !== "all") params.set("plan", filterPlan);
      if (filterStatus !== "all") params.set("status", filterStatus);

      const res = await fetch(`/api/admin/clients?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load clients");
      const data = await res.json();
      setClients(data.clients || []);
      if (data.stats) setStats(data.stats);
    } catch (err: unknown) {
      console.error(err);
      showToast("Failed to fetch clients from database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [searchTerm, filterPlan, filterStatus]);

  // Open Inline Rich Profile Dossier Modal
  const handleOpenDossier = async (clientId: string) => {
    setInspectingClientId(clientId);
    setDossierLoading(true);
    setDossierData(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/papers`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load dossier");
      setDossierData({
        client: data.client,
        papers: data.papers || [],
        stats: data.stats,
        invoices: data.invoices || [],
        emails: data.emails || [],
        reports: data.reports || [],
      });
    } catch (err) {
      showToast("Failed to load educator profile dossier", "error");
      setInspectingClientId(null);
    } finally {
      setDossierLoading(false);
    }
  };

  // Open Edit Modal with Prepopulated Values
  const handleOpenEdit = (c: ClientUser) => {
    setEditingClient(c);
    setEditTab("profile");

    setEditFullName(c.fullName || "");
    setEditEmail(c.email || "");
    setEditPhone(c.phone || "");
    setEditPassword(c.password || "");
    setShowEditPassword(false);
    setEditAcademyName(c.academyName || "");
    setEditNotes(c.notes || "");

    setEditPlanId(c.subscription.planId);
    setEditStatus(c.subscription.status);
    setEditExpiresAt(c.subscription.expiresAt ? c.subscription.expiresAt.substring(0, 10) : "");
    setEditPaperCredits(c.subscription.paperCredits ?? 0);

    setPermAutoBoard(Boolean(c.subscription.canAutoBoardPattern));
    setPermCustomBranding(Boolean(c.subscription.canCustomBranding));
    setPermAnswerKey(Boolean(c.subscription.canExportAnswerKey));
    setPermFullBoard(Boolean(c.subscription.canFullBoardPaper));
    setPermUnlimitedExport(Boolean(c.subscription.canUnlimitedExport));
    setPermAllClasses(Boolean(c.subscription.canAccessAllClasses));
    setPermMaxQuestions(c.subscription.maxQuestionsPerPaper || 10);
  };

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePlanChangeInEdit = (newPlan: SubscriptionPlanId) => {
    setEditPlanId(newPlan);
    const now = new Date();
    if (newPlan === "annual") {
      const exp = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      setEditExpiresAt(exp.toISOString().substring(0, 10));
      setEditPaperCredits(999999);
      setPermAutoBoard(true);
      setPermCustomBranding(true);
      setPermAnswerKey(true);
      setPermFullBoard(true);
      setPermUnlimitedExport(true);
      setPermAllClasses(true);
      setPermMaxQuestions(100);
    } else if (newPlan === "standard") {
      const exp = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      setEditExpiresAt(exp.toISOString().substring(0, 10));
      setEditPaperCredits(999999);
      setPermAutoBoard(true);
      setPermCustomBranding(true);
      setPermAnswerKey(true);
      setPermFullBoard(true);
      setPermUnlimitedExport(true);
      setPermAllClasses(true);
      setPermMaxQuestions(100);
    } else if (newPlan === "pay_as_you_go" || newPlan === "pay_per_paper") {
      setEditExpiresAt("");
      setEditPaperCredits(10);
      setPermAutoBoard(true);
      setPermCustomBranding(true);
      setPermAnswerKey(true);
      setPermFullBoard(true);
      setPermUnlimitedExport(false);
      setPermAllClasses(true);
      setPermMaxQuestions(100);
    } else {
      setEditExpiresAt("");
      setEditPaperCredits(0);
      setPermAutoBoard(false);
      setPermCustomBranding(false);
      setPermAnswerKey(false);
      setPermFullBoard(false);
      setPermUnlimitedExport(false);
      setPermAllClasses(true);
      setPermMaxQuestions(10);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;
    if (!editFullName.trim() || !editEmail.trim()) {
      showToast("Full Name and Email are required", "error");
      return;
    }

    try {
      setSavingEdit(true);
      const res = await fetch(`/api/admin/clients/${editingClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editFullName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim() || null,
          password: editPassword.trim() || null,
          academyName: editAcademyName.trim() || null,
          notes: editNotes.trim() || null,
          planId: editPlanId,
          status: editStatus,
          expiresAt: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
          paperCredits: Number(editPaperCredits) || 0,
          permissions: {
            canAutoBoardPattern: permAutoBoard,
            canCustomBranding: permCustomBranding,
            canExportAnswerKey: permAnswerKey,
            canFullBoardPaper: permFullBoard,
            canUnlimitedExport: permUnlimitedExport,
            canAccessAllClasses: permAllClasses,
            maxQuestionsPerPaper: Number(permMaxQuestions) || 10,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update client");

      showToast(`Profile & Subscription for "${editFullName}" updated successfully!`);
      setEditingClient(null);
      await loadClients();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save changes";
      showToast(msg, "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFullName.trim() || !addEmail.trim()) {
      showToast("Full Name and Email are required", "error");
      return;
    }

    try {
      setSavingAdd(true);
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: addFullName.trim(),
          email: addEmail.trim(),
          phone: addPhone.trim() || null,
          password: addPassword.trim() || "eduPass" + Math.floor(1000 + Math.random() * 9000),
          academyName: addAcademyName.trim() || null,
          planId: addPlanId,
          notes: addNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create client");

      showToast(`Educator "${addFullName}" registered successfully!`);
      setShowAddModal(false);
      setAddFullName("");
      setAddEmail("");
      setAddPhone("");
      setAddPassword("");
      setShowAddPassword(false);
      setAddAcademyName("");
      setAddNotes("");
      await loadClients();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register educator";
      showToast(msg, "error");
    } finally {
      setSavingAdd(false);
    }
  };

  const handleApproveClient = async (c: ClientUser) => {
    try {
      const res = await fetch(`/api/admin/clients/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          isVerified: true,
          planId: c.subscription.planId === "free" ? "standard" : c.subscription.planId,
        }),
      });
      if (!res.ok) throw new Error("Failed to approve account");
      showToast(`Account for "${c.fullName}" has been APPROVED and ACTIVATED! 🎉`);
      await loadClients();
    } catch {
      showToast("Failed to approve account", "error");
    }
  };

  const handleToggleSuspend = async (c: ClientUser) => {
    const newStatus = c.subscription.status === "suspended" ? "active" : "suspended";
    try {
      const res = await fetch(`/api/admin/clients/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      showToast(
        newStatus === "suspended"
          ? `Account for ${c.fullName} has been SUSPENDED.`
          : `Account for ${c.fullName} has been ACTIVATED.`
      );
      await loadClients();
    } catch {
      showToast("Failed to toggle status", "error");
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/clients/${deletingClient.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete client");
      showToast(`Account "${deletingClient.fullName}" deleted successfully.`);
      setDeletingClient(null);
      await loadClients();
    } catch {
      showToast("Failed to delete client", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCsv = () => {
    if (clients.length === 0) {
      showToast("No clients to export", "error");
      return;
    }
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone",
      "Academy Name",
      "Plan",
      "Status",
      "Expires At",
      "Credits",
      "Total Papers",
      "Papers This Month",
      "Total Questions",
      "Created At",
    ];
    const rows = clients.map((c) => [
      `"${c.id}"`,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone || ""}"`,
      `"${(c.academyName || "").replace(/"/g, '""')}"`,
      `"${c.subscription.planId}"`,
      `"${c.subscription.status}"`,
      `"${c.subscription.expiresAt || "N/A"}"`,
      `"${c.subscription.paperCredits}"`,
      `"${c.paperStats?.totalPapers ?? 0}"`,
      `"${c.paperStats?.papersThisMonth ?? 0}"`,
      `"${c.paperStats?.totalQuestions ?? 0}"`,
      `"${c.createdAt}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `paperwala-clients-${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Clients exported to CSV successfully!");
  };

  const formatRelativeTime = (iso?: string | null) => {
    if (!iso) return "No papers yet";
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  };

  const getExpiryProgress = (c: ClientUser) => {
    if (!c.subscription.expiresAt) return null;
    const now = Date.now();
    const exp = new Date(c.subscription.expiresAt).getTime();
    const start = c.createdAt
      ? new Date(c.createdAt).getTime()
      : exp - 180 * 86400000;
    const total = Math.max(1, exp - start);
    const remaining = exp - now;
    const daysLeft = Math.ceil(remaining / 86400000);
    const pct = Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
    return { daysLeft, pct };
  };

  return (
    <div className="relative space-y-6 pb-8">
      {/* Ambient Liquid Glass Mesh Blobs */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-75"
        aria-hidden="true"
      >
        <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-indigo-400/15 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-cyan-400/15 blur-3xl" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-2xl backdrop-blur-2xl border flex items-center gap-3 text-sm font-bold transition-all transform animate-in slide-in-from-top-3 ${
            toastType === "success"
              ? "bg-emerald-600/95 border-emerald-400/50 text-white shadow-[0_12px_30px_-6px_rgba(16,185,129,0.5)]"
              : "bg-rose-600/95 border-rose-400/50 text-white shadow-[0_12px_30px_-6px_rgba(244,63,94,0.5)]"
          }`}
        >
          {toastType === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =====================================================================
          1. TOP EXECUTIVE COMMAND BAR (3D LIQUID GLASS)
          ===================================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white/85 via-white/70 to-emerald-50/50 backdrop-blur-2xl saturate-150 p-5 sm:p-6 rounded-3xl border border-white/95 shadow-[0_24px_55px_-15px_rgba(15,23,42,0.12),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_2px_#ffffff] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/80 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-12 -top-12 w-56 h-56 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-transparent blur-2xl"
          aria-hidden="true"
        />

        <div className="relative space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Admin Executive CRM
            </span>
            <span className="text-slate-300">/</span>
            <span>Educator Profiles &amp; Live Usage Telemetry</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-[0_4px_0_0_#065f46,0_8px_16px_-4px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.65)] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Educators Directory &amp; Rich Profiles
                </h1>
                <span className="font-urdu text-emerald-800 text-base sm:text-lg font-bold px-3 py-0.5 bg-white/80 backdrop-blur-md border border-emerald-500/25 rounded-xl shadow-2xs">
                  اساتذہ پروفائلز اور سبسکرپشن کنٹرول
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium max-w-2xl mt-0.5">
                Inspect educator paper generation activity, subject preferences, Raast ID (
                <strong className="font-mono text-slate-800">03092770207</strong>) verifications, and fine-grained entitlements.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-2.5 shrink-0">
          {/* View Mode Toggle (Desktop) */}
          <div className="hidden lg:inline-flex items-center p-1 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_0_#ffffff]">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="High-Density Table View"
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Rich Glass Profile Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Profile Cards</span>
            </button>
          </div>

          <button
            onClick={() => loadClients()}
            title="Refresh Profiles"
            className="p-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-700 shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-800 text-xs font-extrabold shadow-[0_3px_0_0_#cbd5e1,inset_0_1px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="relative overflow-hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white text-xs font-extrabold border border-emerald-300/80 shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.45),inset_0_2px_1px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <span
              className="pointer-events-none absolute inset-x-1.5 top-0.5 h-2 rounded-t-full bg-gradient-to-b from-white/50 to-transparent"
              aria-hidden="true"
            />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Register New Educator</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. 6 INTERACTIVE 3D GLASS KPI TELEMETRY CARDS
          ===================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* 1. Total Educators */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus("all");
            setFilterPlan("all");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === "all" && filterPlan === "all"
              ? "bg-white/95 border-emerald-500 ring-2 ring-emerald-500/20 shadow-[0_5px_0_0_#10b981,0_12px_25px_-6px_rgba(16,185,129,0.2)]"
              : "bg-gradient-to-b from-white/85 to-white/70 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7),0_10px_25px_-8px_rgba(15,23,42,0.08),inset_0_1px_0_#ffffff] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Total Educators
            </span>
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-200/60">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[11px] text-slate-500 font-semibold">profiles</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-600 font-semibold flex items-center gap-1.5 tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{stats.active} Active right now</span>
          </div>
        </button>

        {/* 2. Pending Verification Hold */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus(
              filterStatus === "pending_verification" ? "all" : "pending_verification"
            );
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === "pending_verification"
              ? "bg-amber-50/95 border-amber-500 ring-2 ring-amber-500/25 shadow-[0_5px_0_0_#f59e0b]"
              : stats.pendingVerification > 0
              ? "bg-gradient-to-b from-amber-50/90 to-white/85 backdrop-blur-xl border-amber-300 shadow-[0_4px_0_0_#fcd34d]"
              : "bg-gradient-to-b from-white/85 to-white/70 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7),inset_0_1px_0_#ffffff] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
              Pending Approval
            </span>
            <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-300/60">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-amber-600">
              {stats.pendingVerification}
            </span>
            <span className="text-[11px] text-amber-800 font-bold">on hold</span>
          </div>
          <div className="mt-1.5 text-[10px] text-amber-700 font-semibold truncate">
            Raast 03092770207 review
          </div>
        </button>

        {/* 3. Paid / Pro Subscribers */}
        <button
          type="button"
          onClick={() => {
            setFilterPlan(filterPlan === "standard" ? "all" : "standard");
            setFilterStatus("all");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filterPlan === "standard" || filterPlan === "annual"
              ? "bg-white/95 border-emerald-500 ring-2 ring-emerald-500/20 shadow-[0_5px_0_0_#10b981]"
              : "bg-gradient-to-b from-white/85 to-white/70 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7),0_10px_25px_-8px_rgba(15,23,42,0.08),inset_0_1px_0_#ffffff] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Paid Pro Plans
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200/60">
              <Crown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-emerald-700">{stats.paid}</span>
            <span className="text-[11px] text-emerald-800 font-semibold">subscribers</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-600 flex items-center gap-1.5 tabular-nums">
            <span className="text-emerald-700 font-bold">{stats.standard} Std</span>
            <span>&bull;</span>
            <span className="text-indigo-700 font-bold">{stats.annual} Annual</span>
          </div>
        </button>

        {/* 4. Total Papers Generated Across Users */}
        <div className="text-left p-4 rounded-2xl border bg-gradient-to-b from-indigo-50/75 via-white/85 to-white/80 backdrop-blur-xl border-indigo-200/80 shadow-[0_4px_0_0_rgba(199,210,254,0.8),0_10px_25px_-8px_rgba(79,70,229,0.1),inset_0_1px_0_#ffffff] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-wider">
              Papers Generated
            </span>
            <div className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-700 border border-indigo-200">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-indigo-900">
              {stats.totalPapersGenerated ??
                clients.reduce((s, c) => s + (c.paperStats?.totalPapers ?? 0), 0)}
            </span>
            <span className="text-[11px] text-indigo-700 font-bold">exams</span>
          </div>
          <div className="mt-1.5 text-[10px] text-indigo-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Live educator output</span>
          </div>
        </div>

        {/* 5. Free Tier */}
        <button
          type="button"
          onClick={() => {
            setFilterPlan(filterPlan === "free" ? "all" : "free");
            setFilterStatus("all");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filterPlan === "free"
              ? "bg-white/95 border-slate-500 ring-2 ring-slate-400/20 shadow-[0_5px_0_0_#64748b]"
              : "bg-gradient-to-b from-white/85 to-white/70 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7),0_10px_25px_-8px_rgba(15,23,42,0.08),inset_0_1px_0_#ffffff] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Free &amp; Credits
            </span>
            <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <School className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-slate-800">{stats.free}</span>
            <span className="text-[11px] text-slate-500 font-semibold">free tier</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-600 flex items-center gap-1 tabular-nums">
            <span>Pay-per-paper:</span>
            <span className="font-bold text-amber-700">{stats.payAsYouGo}</span>
          </div>
        </button>

        {/* 6. Suspended Accounts */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus(filterStatus === "suspended" ? "all" : "suspended");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === "suspended"
              ? "bg-rose-50/95 border-rose-500 ring-2 ring-rose-500/20 shadow-[0_5px_0_0_#f43f5e]"
              : "bg-gradient-to-b from-white/85 to-white/70 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7),0_10px_25px_-8px_rgba(15,23,42,0.08),inset_0_1px_0_#ffffff] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Suspended
            </span>
            <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-rose-600">{stats.suspended}</span>
            <span className="text-[11px] text-rose-700 font-semibold">locked</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-500 truncate">
            Click to filter locked
          </div>
        </button>
      </div>

      {/* =====================================================================
          3. FROSTED GLASS SEARCH & FILTER BAR
          ===================================================================== */}
      <div className="bg-gradient-to-b from-white/85 to-white/75 backdrop-blur-2xl p-4 rounded-2xl border border-white/90 shadow-[0_12px_32px_-10px_rgba(15,23,42,0.08),0_3px_0_0_rgba(203,213,225,0.6),inset_0_1px_0_#ffffff] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search educator name, email, WhatsApp/mobile, Raast TID, academy, or notes..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-white/80 focus:bg-white border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 shadow-inner transition-all"
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
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 backdrop-blur-md border border-slate-200/80 text-xs font-bold">
            {[
              { id: "all", label: "All Profiles" },
              { id: "pending_verification", label: `Hold (${stats.pendingVerification})` },
              { id: "active", label: "Active" },
              { id: "suspended", label: "Suspended" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
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
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200/90 bg-white/90 text-slate-800 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
          >
            <option value="all">All Subscription Plans</option>
            <option value="free">Free (Rs. 0)</option>
            <option value="pay_as_you_go">Go as you pay (Rs. 30)</option>
            <option value="standard">Standard (Rs. 2000)</option>
            <option value="annual">Annual Premium (Rs. 3000)</option>
          </select>
        </div>
      </div>

      {/* =====================================================================
          4. RICH USER PROFILES DIRECTORY (CARDS & ENTERPRISE GLASS TABLE)
          ===================================================================== */}
      <div className="bg-gradient-to-b from-white/85 via-white/80 to-white/90 backdrop-blur-2xl rounded-3xl border border-white/95 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.12),0_4px_0_0_rgba(203,213,225,0.65),inset_0_1px_1px_#ffffff] overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-extrabold text-slate-600">
              Loading rich educator profiles, paper telemetry &amp; subscriptions...
            </p>
          </div>
        ) : clients.length === 0 ? (
          <div className="py-20 px-4 text-center text-slate-400 space-y-3">
            <Users className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <p className="text-base font-black text-slate-800">
              No registered educators match your filters
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try clearing your search or status filter, or register a new educator account above.
            </p>
            {(searchTerm || filterPlan !== "all" || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterPlan("all");
                  setFilterStatus("all");
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-500 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ===============================================================
                A. RICH GLASS PROFILE CARDS (< lg OR when viewMode === 'cards')
                =============================================================== */}
            <div
              className={`${
                viewMode === "cards" ? "grid" : "lg:hidden grid"
              } grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6 bg-gradient-to-b from-slate-50/40 to-white/40`}
            >
              {clients.map((c) => {
                const planMeta = PLAN_METADATA[c.subscription.planId] || {
                  name: c.subscription.planName || c.subscription.planId,
                  priceFormatted: "Custom",
                };
                const isPending =
                  c.subscription.status === "pending_verification" || c.isVerified === false;
                const isSuspended = c.subscription.status === "suspended";
                const isExpired = c.subscription.status === "expired";
                const ps = c.paperStats || {
                  totalPapers: 0,
                  papersThisMonth: 0,
                  papersThisWeek: 0,
                  totalQuestions: 0,
                  totalMarks: 0,
                  withAnswerKey: 0,
                  lastPaperAt: null,
                  topSubjects: [],
                };
                const expProg = getExpiryProgress(c);

                return (
                  <div
                    key={c.id}
                    className={`group relative overflow-hidden rounded-3xl border p-5 space-y-4 transition-all duration-200 ${
                      isPending
                        ? "bg-gradient-to-b from-amber-50/90 via-white/95 to-white border-amber-400 ring-2 ring-amber-400/20 shadow-[0_14px_30px_-10px_rgba(245,158,11,0.2),0_4px_0_0_#fbbf24]"
                        : isSuspended
                        ? "bg-gradient-to-b from-rose-50/60 via-white/95 to-white border-rose-200 shadow-[0_10px_25px_-10px_rgba(244,63,94,0.12),0_3px_0_0_#fecdd3]"
                        : "bg-gradient-to-b from-white/95 via-white/90 to-slate-50/70 backdrop-blur-xl border-white/95 shadow-[0_16px_35px_-12px_rgba(15,23,42,0.1),0_4px_0_0_rgba(203,213,225,0.65),inset_0_1px_1px_#ffffff] hover:-translate-y-1 hover:shadow-[0_22px_45px_-12px_rgba(16,185,129,0.18),0_4px_0_0_#6ee7b7]"
                    }`}
                  >
                    {/* Top Specular Highlight */}
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/80 to-transparent"
                      aria-hidden="true"
                    />

                    {/* Card Header: Avatar, Name, Academy, Status */}
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleOpenDossier(c.id)}
                          className={`w-12 h-12 rounded-2xl text-white font-black flex items-center justify-center text-base shrink-0 shadow-[0_4px_10px_-2px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] cursor-pointer transition-transform group-hover:scale-105 ${
                            isPending
                              ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600"
                              : c.subscription.planId === "annual"
                              ? "bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700"
                              : "bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600"
                          }`}
                          title="Open 360° Rich Profile Dossier"
                        >
                          {c.fullName.charAt(0).toUpperCase()}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDossier(c.id)}
                              className="font-black text-slate-900 text-sm hover:text-emerald-700 truncate text-left cursor-pointer"
                            >
                              {c.fullName}
                            </button>
                            {c.subscription.planId === "annual" && (
                              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1 truncate mt-0.5">
                            <School className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              {c.academyName || "Independent Educator Academy"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                            <span>
                              Joined{" "}
                              {new Date(c.createdAt).toLocaleDateString("en-PK", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            <span>&bull;</span>
                            <span className="text-emerald-700 font-bold">
                              {formatRelativeTime(ps.lastPaperAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>HOLD</span>
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <span>SUSPENDED</span>
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <span>EXPIRED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Raast TID Notice if present */}
                    {c.paymentSubmission && (
                      <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-950 text-xs flex items-center justify-between gap-2 font-mono shadow-2xs">
                        <span>
                          ⚡ Raast TID: <strong>{c.paymentSubmission.transactionRef}</strong>
                        </span>
                        {c.paymentSubmission.amount && (
                          <span className="font-black bg-amber-200/80 px-2 py-0.5 rounded-lg text-[10px]">
                            Rs. {c.paymentSubmission.amount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rich Paper Generation & Subject Telemetry Strip */}
                    <div className="p-3 rounded-2xl bg-slate-900/[0.03] border border-slate-200/80 space-y-2.5">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-white/90 border border-white shadow-2xs">
                          <div className="text-[10px] font-extrabold uppercase text-slate-400">
                            Papers
                          </div>
                          <div className="text-base font-black text-slate-900 tabular-nums">
                            {ps.totalPapers}
                          </div>
                          <div className="text-[9px] font-bold text-emerald-600">
                            +{ps.papersThisMonth} this mo
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/90 border border-white shadow-2xs">
                          <div className="text-[10px] font-extrabold uppercase text-slate-400">
                            Questions
                          </div>
                          <div className="text-base font-black text-indigo-700 tabular-nums">
                            {ps.totalQuestions}
                          </div>
                          <div className="text-[9px] font-bold text-slate-500">
                            {ps.totalMarks} marks
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/90 border border-white shadow-2xs">
                          <div className="text-[10px] font-extrabold uppercase text-slate-400">
                            Ans Keys
                          </div>
                          <div className="text-base font-black text-teal-700 tabular-nums">
                            {ps.withAnswerKey}
                          </div>
                          <div className="text-[9px] font-bold text-slate-500">
                            OMR ready
                          </div>
                        </div>
                      </div>

                      {/* Top Subjects Taught */}
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase mr-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-indigo-500" />
                          Subjects:
                        </span>
                        {ps.topSubjects && ps.topSubjects.length > 0 ? (
                          ps.topSubjects.map((sub) => (
                            <span
                              key={sub.subject}
                              className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-800 border border-indigo-500/20 text-[10px] font-extrabold"
                            >
                              {sub.subject} ({sub.count})
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            No papers generated yet
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contact & Credentials with 1-Click Copy */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-1 min-w-0">
                          <a
                            href={`mailto:${c.email}`}
                            className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 font-semibold truncate"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{c.email}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.email, `email-${c.id}`, "Email")}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                            title="Copy Email"
                          >
                            {copiedKey === `email-${c.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {c.phone ? (
                          <div className="flex items-center gap-1">
                            <a
                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-emerald-700 font-bold tabular-nums"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{c.phone}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(c.phone || "", `phone-${c.id}`, "Phone")}
                              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                              title="Copy Phone"
                            >
                              {copiedKey === `phone-${c.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic block">
                            No WhatsApp number
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-1">
                        <div className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-800 flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>
                            {c.password
                              ? revealedPasswords.has(c.id)
                                ? c.password
                                : "••••••••"
                              : "default123"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleRevealPassword(c.id)}
                          className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          title="Show/Hide Password"
                        >
                          {revealedPasswords.has(c.id) ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(c.password || "default123", `pass-${c.id}`, "Password")
                          }
                          className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          title="Copy Password"
                        >
                          {copiedKey === `pass-${c.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Subscription Progress Bar if applicable */}
                    {expProg && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-500">Subscription Validity</span>
                          <span
                            className={
                              expProg.daysLeft <= 7
                                ? "text-rose-600 font-black"
                                : "text-emerald-700"
                            }
                          >
                            {expProg.daysLeft > 0
                              ? `${expProg.daysLeft} days remaining`
                              : "Expired"}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              expProg.daysLeft <= 7
                                ? "bg-rose-500"
                                : "bg-gradient-to-r from-emerald-500 to-teal-500"
                            }`}
                            style={{ width: `${expProg.pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Card Footer: Plan Badge & Actions */}
                    <div className="pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black bg-white border border-slate-200/90 text-slate-800 shadow-2xs">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>{planMeta.name}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isPending && (
                          <button
                            onClick={() => handleApproveClient(c)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenDossier(c.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-800 text-[11px] font-extrabold transition-colors cursor-pointer"
                          title="Quick 360° Profile Dossier"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>Profile</span>
                        </button>
                        <Link
                          href={`/admin/users/${c.id}`}
                          className="p-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700"
                          title="Open Full Profile Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-emerald-50 text-slate-700 cursor-pointer"
                          title="Edit Profile & Plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEmailPreviewClient(c)}
                          className="p-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-amber-50 text-slate-700 cursor-pointer"
                          title="Welcome Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingClient(c)}
                          className="p-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-rose-50 text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ===============================================================
                B. DESKTOP HIGH-DENSITY ENTERPRISE GLASS TABLE (lg+)
                =============================================================== */}
            {viewMode === "table" && (
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-200 uppercase tracking-wider font-extrabold border-b border-slate-800 text-[10px]">
                    <tr>
                      <th className="py-4 px-4">Educator Profile &amp; Academy</th>
                      <th className="py-4 px-4">Contact &amp; Credentials</th>
                      <th className="py-4 px-4">Paper Activity &amp; Subjects</th>
                      <th className="py-4 px-4">Subscription &amp; Validity</th>
                      <th className="py-4 px-4">Entitlements Matrix</th>
                      <th className="py-4 px-4 text-right">Executive Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70">
                    {clients.map((c) => {
                      const planMeta = PLAN_METADATA[c.subscription.planId] || {
                        name: c.subscription.planName || c.subscription.planId,
                        priceFormatted: "Custom",
                      };
                      const isPending =
                        c.subscription.status === "pending_verification" ||
                        c.isVerified === false;
                      const isSuspended = c.subscription.status === "suspended";
                      const isExpired = c.subscription.status === "expired";
                      const ps = c.paperStats || {
                        totalPapers: 0,
                        papersThisMonth: 0,
                        papersThisWeek: 0,
                        totalQuestions: 0,
                        totalMarks: 0,
                        withAnswerKey: 0,
                        lastPaperAt: null,
                        topSubjects: [],
                      };
                      const expProg = getExpiryProgress(c);

                      return (
                        <tr
                          key={c.id}
                          className={`group transition-colors ${
                            isPending
                              ? "bg-amber-50/55 hover:bg-amber-50/80 border-l-4 border-l-amber-500"
                              : isSuspended
                              ? "bg-rose-50/30 hover:bg-rose-50/50"
                              : "hover:bg-emerald-50/35"
                          }`}
                        >
                          {/* 1. Educator Profile & Academy */}
                          <td className="py-4 px-4 align-top">
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => handleOpenDossier(c.id)}
                                className={`w-11 h-11 rounded-2xl text-white font-black flex items-center justify-center text-sm shrink-0 shadow-[0_4px_10px_-2px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)] cursor-pointer transition-transform group-hover:scale-105 ${
                                  isPending
                                    ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600"
                                    : c.subscription.planId === "annual"
                                    ? "bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700"
                                    : "bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600"
                                }`}
                                title="Click to open 360° Rich Profile Dossier"
                              >
                                {c.fullName.charAt(0).toUpperCase()}
                              </button>
                              <div className="min-w-0 space-y-1">
                                <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDossier(c.id)}
                                    className="hover:text-emerald-700 hover:underline text-left cursor-pointer"
                                  >
                                    {c.fullName}
                                  </button>
                                  {c.subscription.planId === "annual" && (
                                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                  )}
                                  {isPending && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-white tracking-wider">
                                      HOLD
                                    </span>
                                  )}
                                </div>

                                <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1.5">
                                  <School className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate max-w-[200px]">
                                    {c.academyName || "Independent Educator Academy"}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-medium">
                                  <span>
                                    Joined{" "}
                                    {new Date(c.createdAt).toLocaleDateString("en-PK", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                  {c.updatedAt && (
                                    <>
                                      <span>&bull;</span>
                                      <span className="text-slate-500">
                                        Updated: {formatRelativeTime(c.updatedAt)}
                                      </span>
                                    </>
                                  )}
                                </div>

                                {c.paymentSubmission && (
                                  <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-lg border border-amber-300 font-mono">
                                    <span>⚡ Raast TID:</span>
                                    <strong className="font-black">
                                      {c.paymentSubmission.transactionRef}
                                    </strong>
                                    {c.paymentSubmission.amount && (
                                      <span>(Rs. {c.paymentSubmission.amount})</span>
                                    )}
                                  </div>
                                )}

                                {c.notes && (
                                  <div className="text-[10px] text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md italic max-w-[220px] truncate">
                                    “{c.notes}”
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 2. Contact & Credentials */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`mailto:${c.email}`}
                                  className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 font-semibold transition-colors truncate max-w-[190px]"
                                >
                                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{c.email}</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(c.email, `email-${c.id}`, "Email")}
                                  className="p-1 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                  title="Copy Email"
                                >
                                  {copiedKey === `email-${c.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>

                              {c.phone ? (
                                <div className="flex items-center gap-1.5">
                                  <a
                                    href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-600 font-bold transition-colors tabular-nums"
                                  >
                                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{c.phone}</span>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopy(c.phone || "", `phone-${c.id}`, "Phone")
                                    }
                                    className="p-1 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                    title="Copy Phone"
                                  >
                                    {copiedKey === `phone-${c.id}` ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic block">
                                  No phone / WhatsApp
                                </span>
                              )}

                              {/* Password Pill */}
                              <div className="flex items-center gap-1 pt-0.5">
                                <div className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100/90 border border-slate-200/90 text-slate-800 flex items-center gap-1.5">
                                  <Lock className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {c.password
                                      ? revealedPasswords.has(c.id)
                                        ? c.password
                                        : "••••••••"
                                      : "default123"}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleRevealPassword(c.id)}
                                  title={
                                    revealedPasswords.has(c.id)
                                      ? "Hide Password"
                                      : "Reveal Password"
                                  }
                                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                >
                                  {revealedPasswords.has(c.id) ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(
                                      c.password || "default123",
                                      `pass-${c.id}`,
                                      "Password"
                                    )
                                  }
                                  title="Copy Password"
                                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                >
                                  {copiedKey === `pass-${c.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* 3. Rich Paper Activity & Subjects Telemetry */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1.5 max-w-[230px]">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 font-black text-xs tabular-nums">
                                  <FileText className="w-3 h-3 text-indigo-600" />
                                  {ps.totalPapers} Papers
                                </span>
                                {ps.papersThisMonth > 0 && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-[10px] font-extrabold tabular-nums">
                                    +{ps.papersThisMonth} this mo
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-600 font-semibold tabular-nums">
                                <span>{ps.totalQuestions} Qs</span>
                                <span>&bull;</span>
                                <span>{ps.totalMarks} Marks</span>
                                <span>&bull;</span>
                                <span className="text-teal-700 font-bold">
                                  {ps.withAnswerKey} Keys
                                </span>
                              </div>

                              {ps.topSubjects && ps.topSubjects.length > 0 ? (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {ps.topSubjects.map((subj) => (
                                    <span
                                      key={subj.subject}
                                      className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-slate-700 text-[10px] font-bold"
                                    >
                                      {subj.subject} ({subj.count})
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-400 italic">
                                  No exam papers generated yet
                                </div>
                              )}

                              {ps.lastPaperAt && (
                                <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  <span>Last paper {formatRelativeTime(ps.lastPaperAt)}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 4. Subscription & Validity */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1.5 min-w-[155px]">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-black border ${
                                    c.subscription.planId === "annual"
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                      : c.subscription.planId === "standard"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : c.subscription.planId === "pay_as_you_go" ||
                                        c.subscription.planId === "pay_per_paper"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {c.subscription.planId === "annual" && (
                                    <Crown className="w-3 h-3 text-indigo-600" />
                                  )}
                                  {c.subscription.planId === "standard" && (
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                  )}
                                  {c.subscription.planId === "pay_as_you_go" && (
                                    <Zap className="w-3 h-3 text-amber-600" />
                                  )}
                                  <span>{planMeta.name}</span>
                                </span>
                              </div>

                              <div>
                                {isPending ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                    <Clock className="w-3 h-3 text-amber-700" />
                                    <span>HOLD (APPROVAL)</span>
                                  </span>
                                ) : isSuspended ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                    <XCircle className="w-3 h-3" />
                                    <span>SUSPENDED</span>
                                  </span>
                                ) : isExpired ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                    <Clock className="w-3 h-3" />
                                    <span>EXPIRED</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>ACTIVE</span>
                                  </span>
                                )}
                              </div>

                              <div className="text-[10px] text-slate-500 flex items-center gap-1 tabular-nums">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {c.subscription.expiresAt ? (
                                  <span>
                                    Exp:{" "}
                                    {new Date(c.subscription.expiresAt).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span>Perpetual / Free</span>
                                )}
                              </div>

                              {expProg && (
                                <div className="w-32 space-y-0.5">
                                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        expProg.daysLeft <= 7
                                          ? "bg-rose-500"
                                          : "bg-gradient-to-r from-emerald-500 to-teal-500"
                                      }`}
                                      style={{ width: `${expProg.pct}%` }}
                                    />
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-400">
                                    {expProg.daysLeft > 0
                                      ? `${expProg.daysLeft}d remaining`
                                      : "Expired"}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 5. Entitlements Matrix */}
                          <td className="py-4 px-4 align-top">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {c.subscription.canAutoBoardPattern ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                                  Board Scheme
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-400">
                                  No Scheme
                                </span>
                              )}

                              {c.subscription.canCustomBranding ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-800 border border-blue-500/20">
                                  Branding
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-400">
                                  No Brand
                                </span>
                              )}

                              {c.subscription.canExportAnswerKey && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-800 border border-indigo-500/20">
                                  OMR Key
                                </span>
                              )}

                              {c.subscription.canUnlimitedExport && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/10 text-teal-800 border border-teal-500/20">
                                  Unlimited PDF
                                </span>
                              )}

                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200/80 tabular-nums">
                                Max {c.subscription.maxQuestionsPerPaper} Qs
                              </span>
                            </div>
                          </td>

                          {/* 6. Executive Actions */}
                          <td className="py-4 px-4 text-right whitespace-nowrap align-top">
                            <div className="inline-flex items-center gap-1.5">
                              {isPending && (
                                <button
                                  onClick={() => handleApproveClient(c)}
                                  title="Approve Raast Payment & Activate Account"
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenDossier(c.id)}
                                title="Open 360° Rich Profile Dossier Modal"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-b from-indigo-50 to-white hover:from-indigo-100 hover:to-indigo-50 border border-indigo-200/90 text-indigo-800 font-extrabold text-[11px] shadow-[0_2px_0_0_#c7d2fe] transition-all cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                <span>360° Profile</span>
                              </button>

                              <Link
                                href={`/admin/users/${c.id}`}
                                title="Open Dedicated Profile Page"
                                className="p-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-600 shadow-[0_2px_0_0_#e2e8f0] transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                onClick={() => setEmailPreviewClient(c)}
                                title="Preview & Send Welcome Email"
                                className="p-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-slate-600 shadow-[0_2px_0_0_#e2e8f0] transition-colors cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenEdit(c)}
                                title="Edit Profile & Permissions"
                                className="p-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-600 shadow-[0_2px_0_0_#e2e8f0] transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleSuspend(c)}
                                title={isSuspended ? "Activate Account" : "Suspend Account"}
                                className={`p-1.5 rounded-xl border shadow-[0_2px_0_0_#e2e8f0] transition-colors cursor-pointer ${
                                  isSuspended
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    : "border-slate-200/90 bg-white text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
                                }`}
                              >
                                {isSuspended ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                onClick={() => setDeletingClient(c)}
                                title="Delete Client"
                                className="p-1.5 rounded-xl border border-slate-200/90 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-[0_2px_0_0_#e2e8f0] transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          </>
        )}
      </div>

      {/* =========================================================================
          MODAL: 360° RICH EDUCATOR PROFILE DOSSIER (INLINE GLASS OVERLAY)
          ========================================================================= */}
      {inspectingClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/65 backdrop-blur-md overflow-y-auto">
          <div className="relative bg-gradient-to-b from-slate-100/95 via-white/95 to-slate-100/95 backdrop-blur-2xl rounded-3xl border border-white shadow-[0_30px_90px_-20px_rgba(15,23,42,0.5)] max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Top Bar */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    360° Educator Profile &amp; Activity Dossier
                  </h2>
                  <p className="text-xs text-slate-300">
                    Complete paper history, subject breakdown, Raast invoices, email logs &amp; live permission toggles
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/users/${inspectingClientId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Page View</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setInspectingClientId(null);
                    setDossierData(null);
                  }}
                  className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {dossierLoading || !dossierData ? (
                <div className="py-28 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-extrabold text-slate-600">
                    Loading educator dossier, papers, invoices &amp; logs...
                  </p>
                </div>
              ) : (
                <ClientProfileView
                  client={dossierData.client}
                  papers={dossierData.papers}
                  stats={dossierData.stats}
                  invoices={dossierData.invoices}
                  emails={dossierData.emails}
                  reports={dossierData.reports}
                  isAdminView={true}
                  onClientUpdated={(updated) => {
                    setDossierData((prev) => (prev ? { ...prev, client: updated } : prev));
                    loadClients();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT CLIENT PROFILE, PLAN & PERMISSIONS
          ========================================================================= */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sliders className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-black text-white">
                    Edit Educator Profile &amp; Permissions
                  </h2>
                </div>
                <p className="text-xs text-slate-300">
                  Editing:{" "}
                  <span className="font-bold text-emerald-400">{editingClient.fullName}</span> (
                  {editingClient.email})
                </p>
              </div>

              <button
                onClick={() => setEditingClient(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
              <button
                onClick={() => setEditTab("profile")}
                className={`flex-1 py-3 px-4 border-b-2 text-center transition-colors ${
                  editTab === "profile"
                    ? "border-emerald-600 text-emerald-700 bg-white"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                1. Profile &amp; Contact
              </button>
              <button
                onClick={() => setEditTab("subscription")}
                className={`flex-1 py-3 px-4 border-b-2 text-center transition-colors ${
                  editTab === "subscription"
                    ? "border-emerald-600 text-emerald-700 bg-white"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                2. Plan &amp; Expiry
              </button>
              <button
                onClick={() => setEditTab("permissions")}
                className={`flex-1 py-3 px-4 border-b-2 text-center transition-colors ${
                  editTab === "permissions"
                    ? "border-emerald-600 text-emerald-700 bg-white"
                    : "border-transparent hover:text-slate-900"
                }`}
              >
                3. Custom Permissions
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {editTab === "profile" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="e.g. Professor Usman Khan"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="educator@domain.pk"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="0300-1234567"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">User Password</label>
                      <div className="relative">
                        <input
                          type={showEditPassword ? "text" : "password"}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                          placeholder="Set user password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                        >
                          {showEditPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      School / College / Academy Name
                    </label>
                    <input
                      type="text"
                      value={editAcademyName}
                      onChange={(e) => setEditAcademyName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="e.g. Apex Science Academy Lahore"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      This title appears on generated exam headers and watermarks if branding is allowed.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Internal Administrator Notes
                    </label>
                    <textarea
                      rows={2}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="e.g. Paid via JazzCash, Matric 2026 Batch..."
                    />
                  </div>
                </div>
              )}

              {editTab === "subscription" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Select Subscription Tier:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["free", "pay_as_you_go", "standard", "annual"] as SubscriptionPlanId[]).map(
                        (pid) => {
                          const meta = PLAN_METADATA[pid];
                          const isSelected = editPlanId === pid;
                          return (
                            <button
                              key={pid}
                              type="button"
                              onClick={() => handlePlanChangeInEdit(pid)}
                              className={`p-3 rounded-2xl border text-left transition-all ${
                                isSelected
                                  ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <span className="font-black text-slate-900 block truncate">
                                {meta.name}
                              </span>
                              <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
                                {meta.priceFormatted}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(
                            e.target.value as
                              | "active"
                              | "expired"
                              | "trial"
                              | "suspended"
                              | "pending_verification"
                          )
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="active">Active (Normal Access)</option>
                        <option value="pending_verification">
                          Pending Approval (Hold Verification)
                        </option>
                        <option value="suspended">Suspended (Access Locked)</option>
                        <option value="expired">Expired (Requires Renewal)</option>
                        <option value="trial">Trial Period</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Paper Credits (for Pay-As-You-Go)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={999999}
                        value={editPaperCredits}
                        onChange={(e) => setEditPaperCredits(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block font-bold text-slate-700 mb-1">
                      Subscription Expiry Date
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        value={editExpiresAt}
                        onChange={(e) => setEditExpiresAt(e.target.value)}
                        className="p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 1);
                          setEditExpiresAt(d.toISOString().substring(0, 10));
                        }}
                        className="py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600"
                      >
                        +1 Month
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 6);
                          setEditExpiresAt(d.toISOString().substring(0, 10));
                        }}
                        className="py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600"
                      >
                        +6 Months
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setFullYear(d.getFullYear() + 1);
                          setEditExpiresAt(d.toISOString().substring(0, 10));
                        }}
                        className="py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600"
                      >
                        +1 Year
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditExpiresAt("")}
                        className="py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600"
                      >
                        Never Expire
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {editTab === "permissions" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px]">
                    <b>Admin Override:</b> You can customize individual permissions for this client independently of their default tier preset.
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Auto Punjab Board Pairing Scheme
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Automatic marks distribution matching BISE exam pairing guidelines
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={permAutoBoard}
                        onChange={(e) => setPermAutoBoard(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Custom Academy Branding &amp; Logo
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Display custom school header, watermark, and address on paper
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={permCustomBranding}
                        onChange={(e) => setPermCustomBranding(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Answer Key &amp; Solution Matrix Export
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Automatically generates matching answer key with OMR bubble sheet
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={permAnswerKey}
                        onChange={(e) => setPermAnswerKey(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Full Board Paper Subjective Structure
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Allows Section-I, Section-II, and Section-III exam layout
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={permFullBoard}
                        onChange={(e) => setPermFullBoard(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Unlimited PDF Print &amp; Exports
                        </span>
                        <span className="text-[11px] text-slate-500">
                          No daily or monthly quota limits on generated test papers
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={permUnlimitedExport}
                        onChange={(e) => setPermUnlimitedExport(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Cross-Class Access (9th &amp; 10th Curriculum)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Grant access across all classes and future subjects
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={permAllClasses}
                        onChange={(e) => setPermAllClasses(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>

                    <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Max Questions per Single Paper
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Free plan default is 10; Paid plans default to 100
                        </span>
                      </div>
                      <input
                        type="number"
                        min={5}
                        max={300}
                        value={permMaxQuestions}
                        onChange={(e) => setPermMaxQuestions(Number(e.target.value))}
                        className="w-20 p-2 rounded-lg border border-slate-300 text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Update Profile &amp; Permissions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REGISTER NEW EDUCATOR MANUALLY
          ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Register New Educator</h2>
                <p className="text-xs text-slate-400">
                  Onboard a client account with custom subscription
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Educator Full Name *</label>
                <input
                  type="text"
                  required
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  placeholder="e.g. Professor Usman Khan"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="educator@school.pk"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile / WhatsApp</label>
                  <input
                    type="text"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academy / School</label>
                  <input
                    type="text"
                    value={addAcademyName}
                    onChange={(e) => setAddAcademyName(e.target.value)}
                    placeholder="Punjab Science Academy"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Password (Optional - Auto-generated if blank)
                </label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="Enter password (e.g. educator2026)"
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Initial Plan</label>
                <select
                  value={addPlanId}
                  onChange={(e) => setAddPlanId(e.target.value as SubscriptionPlanId)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="monthly">
                    Monthly Subscription (Rs. 2000 / Month - Unlimited)
                  </option>
                  <option value="standard">Standard Plan (Rs. 2000 - 6 Months)</option>
                  <option value="annual">Annual Premium Plan (Rs. 3000 - 1 Year)</option>
                  <option value="free">Free Plan (Browse Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Reference</label>
                <input
                  type="text"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="Direct registration by admin"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdd}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-950/20 disabled:opacity-50"
                >
                  {savingAdd ? "Creating..." : "Register Educator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DELETE CONFIRMATION
          ========================================================================= */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Delete Educator Account?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <b>{deletingClient.fullName}</b> (
                {deletingClient.email})? This will permanently remove their subscription and saved settings.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteClient}
                disabled={deleting}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/20 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: WELCOME EMAIL PREVIEW & DISPATCH
          ========================================================================= */}
      {emailPreviewClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">
                    Welcome Email Preview &amp; Dispatch
                  </h2>
                  <p className="text-xs text-slate-300">
                    To:{" "}
                    <span className="font-bold text-emerald-400">
                      {emailPreviewClient.fullName}
                    </span>{" "}
                    &lt;{emailPreviewClient.email}&gt;
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEmailPreviewClient(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Meta Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div>
                  <span className="font-bold text-slate-500">Subject: </span>
                  <span className="font-semibold text-slate-800">
                    Welcome to PaperWala (پیپر والا) - Pakistan&apos;s #1 Exam Paper Generator! 🎓
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span>
                    Academy: <b>{emailPreviewClient.academyName || "Educator Academy"}</b>
                  </span>
                  <span className="mx-2">&bull;</span>
                  <span>
                    Plan: <b>{emailPreviewClient.subscription.planName}</b>
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={sendingEmail}
                onClick={async () => {
                  try {
                    setSendingEmail(true);
                    const res = await fetch("/api/admin/emails", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ clientId: emailPreviewClient.id }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to send email");
                    if (data.simulated || data.result?.simulated) {
                      showToast(
                        data.message ||
                          "Simulated only: Add SMTP_HOST or RESEND_API_KEY in .env.local to send real emails.",
                        "error"
                      );
                    } else {
                      showToast(
                        `Welcome email successfully sent to ${emailPreviewClient.email}!`
                      );
                      setEmailPreviewClient(null);
                    }
                  } catch (e: unknown) {
                    const msg = e instanceof Error ? e.message : "Failed to send";
                    showToast(msg, "error");
                  } finally {
                    setSendingEmail(false);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-950/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {sendingEmail ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Email...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Welcome Email Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Rendered Email HTML Preview (iframe) */}
            <div className="p-4 bg-slate-100 flex justify-center">
              <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <iframe
                  src={`/api/admin/emails/preview?clientId=${emailPreviewClient.id}`}
                  title="Welcome Email Preview"
                  className="w-full h-[480px] border-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                💡 Delivered automatically upon registration. Click{" "}
                <b>Send Welcome Email Now</b> to resend.
              </span>
              <button
                type="button"
                onClick={() => setEmailPreviewClient(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
