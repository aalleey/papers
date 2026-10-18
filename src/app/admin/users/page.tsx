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
} from "lucide-react";
import { ClientUser, SubscriptionPlanId, SubscriptionInfo, PLAN_METADATA } from "@/lib/types";

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
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Track which client IDs have their password visible in table
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());

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
  const [editStatus, setEditStatus] = useState<"active" | "expired" | "trial" | "suspended" | "pending_verification">("active");
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

  // Toggle reveal password for client in table
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

  // Plan Selection changed in Edit Modal: auto-fill preset permissions & expiry
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
      // Free
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

  // Save Edit Handler
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

  // Add New Client Handler
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

  // Approve Application & Payment Verification Quick Action
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
    } catch (err) {
      showToast("Failed to approve account", "error");
    }
  };

  // Toggle Suspend / Activate Quick Action
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
    } catch (err) {
      showToast("Failed to toggle status", "error");
    }
  };

  // Delete Client Handler
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
    } catch (err) {
      showToast("Failed to delete client", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Quick Plan Upgrade Button
  const handleQuickUpgrade = async (c: ClientUser, plan: SubscriptionPlanId) => {
    try {
      const res = await fetch(`/api/admin/clients/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan }),
      });
      if (!res.ok) throw new Error("Failed to change plan");
      showToast(`Upgraded ${c.fullName} to ${plan.toUpperCase()} plan.`);
      await loadClients();
    } catch (err) {
      showToast("Failed to change plan", "error");
    }
  };

  // Export CSV of Clients
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

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all transform animate-in slide-in-from-top-3 ${
            toastType === "success"
              ? "bg-emerald-600 text-white shadow-emerald-900/40"
              : "bg-rose-600 text-white shadow-rose-900/40"
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

      {/* Top Executive Command Bar (3D Liquid Glass) */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white/85 via-white/70 to-white/85 backdrop-blur-2xl saturate-150 p-5 sm:p-6 rounded-3xl border border-white/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12),0_4px_0_0_rgba(203,213,225,0.6),inset_0_2px_1px_#ffffff] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/70 to-transparent"
          aria-hidden="true"
        />
        <div className="relative space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
            <span>Admin Console</span>
            <span className="text-slate-300">/</span>
            <span>Educator CRM &amp; Billing</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-[0_4px_0_0_#065f46,inset_0_1px_1px_rgba(255,255,255,0.65)] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Registered Educators &amp; Subscriptions
            </h1>
            <span className="font-urdu text-emerald-700 text-base sm:text-lg font-bold px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              صارفین اور سبسکرپشن کنٹرول
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium max-w-2xl">
            Verify Raast ID (<strong className="font-mono text-slate-800">03092770207</strong>) transfers, manage educator credentials, and configure plan permissions.
          </p>
        </div>

        <div className="relative flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => loadClients()}
            title="Refresh List"
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

      {/* Interactive KPI Telemetry Cards (Click to Filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* 1. Total Clients */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus("all");
            setFilterPlan("all");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === "all" && filterPlan === "all"
              ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-[0_4px_0_0_#10b981]"
              : "bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7),0_10px_25px_-8px_rgba(15,23,42,0.08)] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Total Educators
            </span>
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[11px] text-slate-500 font-semibold">accounts</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-600 font-medium flex items-center gap-1.5 tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{stats.active} Active right now</span>
          </div>
        </button>

        {/* 2. Pending Verification Hold */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus(filterStatus === "pending_verification" ? "all" : "pending_verification");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === "pending_verification"
              ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/25 shadow-[0_4px_0_0_#f59e0b]"
              : stats.pendingVerification > 0
              ? "bg-gradient-to-b from-amber-50/90 to-white border-amber-300 shadow-[0_4px_0_0_#fcd34d]"
              : "bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7)] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
              Pending Approval
            </span>
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
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
              ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-[0_4px_0_0_#10b981]"
              : "bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7),0_10px_25px_-8px_rgba(15,23,42,0.08)] hover:-translate-y-0.5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Paid Pro Plans
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Crown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
            <span className="text-2xl font-black text-emerald-700">{stats.paid}</span>
            <span className="text-[11px] text-emerald-800 font-semibold">subscribers</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-600 flex items-center gap-1.5 tabular-nums">
            <span className="text-emerald-700 font-bold">{stats.standard} Monthly</span>
            <span>&bull;</span>
            <span className="text-indigo-700 font-bold">{stats.annual} Annual</span>
          </div>
        </button>

        {/* 4. Free Tier */}
        <button
          type="button"
          onClick={() => {
            setFilterPlan(filterPlan === "free" ? "all" : "free");
            setFilterStatus("all");
          }}
          className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filterPlan === "free"
              ? "bg-white border-slate-500 ring-2 ring-slate-400/20 shadow-[0_4px_0_0_#64748b]"
              : "bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7),0_10px_25px_-8px_rgba(15,23,42,0.08)] hover:-translate-y-0.5"
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

        {/* 5. Suspended Accounts */}
        <button
          type="button"
          onClick={() => {
            setFilterStatus(filterStatus === "suspended" ? "all" : "suspended");
          }}
          className={`col-span-2 sm:col-span-1 text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
            filterStatus === "suspended"
              ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-[0_4px_0_0_#f43f5e]"
              : "bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_4px_0_0_rgba(203,213,225,0.7),0_10px_25px_-8px_rgba(15,23,42,0.08)] hover:-translate-y-0.5"
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
            Click to filter locked accounts
          </div>
        </button>
      </div>

      {/* Filter & Search Command Bar */}
      <div className="bg-white/85 backdrop-blur-2xl p-4 rounded-2xl border border-white/90 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.08),0_3px_0_0_rgba(203,213,225,0.6),inset_0_1px_0_#ffffff] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search educator name, email, WhatsApp/mobile, Raast TID, or school..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-slate-50/90 focus:bg-white border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-inner transition-all"
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

        {/* Quick Status Segmented Pills & Plan Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-bold">
            {[
              { id: "all", label: "All" },
              { id: "pending_verification", label: `Pending (${stats.pendingVerification})` },
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

          {/* Plan Filter */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
          >
            <option value="all">All Plans</option>
            <option value="free">Free (Rs. 0)</option>
            <option value="pay_as_you_go">Go as you pay (Rs. 30)</option>
            <option value="standard">Standard (Rs. 2000)</option>
            <option value="annual">Annual Premium (Rs. 3000)</option>
          </select>
        </div>
      </div>

      {/* Clients Container (Dual Responsive: Mobile/Tablet Cards + Desktop High-Density Table) */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.1),0_4px_0_0_rgba(203,213,225,0.65)] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-bold text-slate-600">Loading educator profiles &amp; subscriptions...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="py-20 px-4 text-center text-slate-400 space-y-3">
            <Users className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <p className="text-base font-black text-slate-800">No registered educators match your filters</p>
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
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-500 transition-colors"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ===============================================================
                1. MOBILE & TABLET RESPONSIVE CARDS (< lg)
                =============================================================== */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3.5 sm:p-5 bg-slate-50/50">
              {clients.map((c) => {
                const planMeta = PLAN_METADATA[c.subscription.planId] || {
                  name: c.subscription.planName || c.subscription.planId,
                  priceFormatted: "Custom",
                };
                const isPending = c.subscription.status === "pending_verification" || c.isVerified === false;
                const isSuspended = c.subscription.status === "suspended";
                const isExpired = c.subscription.status === "expired";

                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl border p-4 space-y-3.5 bg-white shadow-sm transition-all ${
                      isPending
                        ? "border-amber-400 ring-2 ring-amber-400/20"
                        : isSuspended
                        ? "border-rose-200 bg-rose-50/20"
                        : "border-slate-200/90"
                    }`}
                  >
                    {/* Card Header: Avatar, Name, Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl text-white font-black flex items-center justify-center text-sm shrink-0 shadow-sm ${
                            isPending
                              ? "bg-gradient-to-tr from-amber-500 to-orange-500"
                              : "bg-gradient-to-tr from-emerald-500 to-teal-600"
                          }`}
                        >
                          {c.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${c.id}`}
                            className="font-black text-slate-900 text-sm hover:text-emerald-700 truncate block"
                          >
                            {c.fullName}
                          </Link>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                            <School className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{c.academyName || "Educator Academy"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <div className="shrink-0">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>HOLD</span>
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <span>SUSPENDED</span>
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <span>EXPIRED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ACTIVE</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Raast TID Notice if present */}
                    {c.paymentSubmission && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-2 font-mono">
                        <span>⚡ Raast TID: <strong>{c.paymentSubmission.transactionRef}</strong></span>
                        {c.paymentSubmission.amount && (
                          <span className="font-bold bg-amber-200/70 px-2 py-0.5 rounded text-[10px]">
                            Rs. {c.paymentSubmission.amount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Contact & Password Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="space-y-1 min-w-0">
                        <a
                          href={`mailto:${c.email}`}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 font-medium truncate"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </a>
                        {c.phone && (
                          <a
                            href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-emerald-700 font-semibold"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{c.phone}</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-1.5">
                        <div className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-1.5">
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
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                        >
                          {revealedPasswords.has(c.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Plan & Actions Footer */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>{planMeta.name}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isPending && (
                          <button
                            onClick={() => handleApproveClient(c)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}
                        <Link
                          href={`/admin/users/${c.id}`}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-indigo-50 text-slate-700"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-emerald-50 text-slate-700"
                          title="Edit Profile & Plan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEmailPreviewClient(c)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-amber-50 text-slate-700"
                          title="Welcome Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingClient(c)}
                          className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-rose-600"
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
                2. DESKTOP HIGH-DENSITY ENTERPRISE TABLE (lg+)
                =============================================================== */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-extrabold border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Educator &amp; Academy</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Password</th>
                    <th className="py-3.5 px-4">Plan &amp; Billing</th>
                    <th className="py-3.5 px-4">Status &amp; Expiry</th>
                    <th className="py-3.5 px-4">Permissions</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((c) => {
                    const planMeta = PLAN_METADATA[c.subscription.planId] || {
                      name: c.subscription.planName || c.subscription.planId,
                      priceFormatted: "Custom",
                    };
                    const isPending = c.subscription.status === "pending_verification" || c.isVerified === false;
                    const isSuspended = c.subscription.status === "suspended";
                    const isExpired = c.subscription.status === "expired";

                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50/90 transition-colors ${
                          isPending
                            ? "bg-amber-50/50 border-l-4 border-l-amber-500"
                            : isSuspended
                            ? "bg-rose-50/30"
                            : ""
                        }`}
                      >
                        {/* Educator & Academy */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl text-white font-black flex items-center justify-center text-sm shrink-0 shadow-sm ${
                                isPending
                                  ? "bg-gradient-to-tr from-amber-500 to-orange-500"
                                  : "bg-gradient-to-tr from-emerald-500 to-teal-600"
                              }`}
                            >
                              {c.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <Link
                                  href={`/admin/users/${c.id}`}
                                  className="hover:text-emerald-700 hover:underline"
                                >
                                  {c.fullName}
                                </Link>
                                {c.subscription.planId === "annual" && (
                                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                )}
                                {isPending && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500 text-white tracking-wider">
                                    HOLD
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <School className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[180px] font-medium">
                                  {c.academyName || "Educator Academy"}
                                </span>
                              </div>
                              {c.paymentSubmission && (
                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200 font-mono">
                                  <span>⚡ Raast TID:</span>
                                  <strong className="font-bold">{c.paymentSubmission.transactionRef}</strong>
                                  {c.paymentSubmission.amount && <span>(Rs. {c.paymentSubmission.amount})</span>}
                                </div>
                              )}
                              {c.notes && (
                                <div className="text-[10px] text-slate-400 italic mt-0.5 max-w-[200px] truncate">
                                  {c.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <a
                              href={`mailto:${c.email}`}
                              className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 font-medium transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.email}</span>
                            </a>
                            {c.phone ? (
                              <a
                                href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 font-medium transition-colors tabular-nums"
                              >
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{c.phone}</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No phone added</span>
                            )}
                          </div>
                        </td>

                        {/* User Password */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-1.5">
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
                              title={revealedPasswords.has(c.id) ? "Hide Password" : "Show Password"}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                              {revealedPasswords.has(c.id) ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Current Plan */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border ${
                                c.subscription.planId === "annual"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : c.subscription.planId === "standard"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : c.subscription.planId === "pay_as_you_go" || c.subscription.planId === "pay_per_paper"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {c.subscription.planId === "annual" && <Crown className="w-3 h-3 text-indigo-600" />}
                              {c.subscription.planId === "standard" && <Sparkles className="w-3 h-3 text-emerald-600" />}
                              {c.subscription.planId === "pay_as_you_go" && <Zap className="w-3 h-3 text-amber-600" />}
                              <span>{planMeta.name}</span>
                            </span>

                            <div className="text-[11px] text-slate-500 font-medium tabular-nums">
                              {c.subscription.planId === "pay_as_you_go" || c.subscription.planId === "pay_per_paper" ? (
                                <span>Credits: <b>{c.subscription.paperCredits} papers</b></span>
                              ) : (
                                <span>{planMeta.priceFormatted}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status & Expiry */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div>
                              {isPending ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                  <Clock className="w-3 h-3 text-amber-700" />
                                  <span>HOLD (APPROVAL)</span>
                                </span>
                              ) : isSuspended ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                  <XCircle className="w-3 h-3" />
                                  <span>SUSPENDED</span>
                                </span>
                              ) : isExpired ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  <span>EXPIRED</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>ACTIVE</span>
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center gap-1 tabular-nums">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {c.subscription.expiresAt ? (
                                <span>Exp: {new Date(c.subscription.expiresAt).toLocaleDateString()}</span>
                              ) : (
                                <span>Perpetual / Free</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Permissions Breakdown */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {c.subscription.canAutoBoardPattern ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Board Scheme
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400">
                                No Scheme
                              </span>
                            )}

                            {c.subscription.canCustomBranding ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Branding
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400">
                                No Brand
                              </span>
                            )}

                            {c.subscription.canExportAnswerKey && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Key
                              </span>
                            )}

                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 tabular-nums">
                              Max {c.subscription.maxQuestionsPerPaper} Qs
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            {isPending && (
                              <button
                                onClick={() => handleApproveClient(c)}
                                title="Approve Raast Payment & Activate Account"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95 mr-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            <Link
                              href={`/admin/users/${c.id}`}
                              title="View Profile & Paper History"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-600 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => setEmailPreviewClient(c)}
                              title="Preview & Send Welcome Email"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-slate-600 transition-colors cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(c)}
                              title="Edit Profile & Permissions"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-600 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleSuspend(c)}
                              title={isSuspended ? "Activate Account" : "Suspend Account"}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isSuspended
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
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
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
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
          </>
        )}
      </div>

      {/* =========================================================================
          MODAL: EDIT CLIENT PROFILE, PLAN & PERMISSIONS
          ========================================================================= */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
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
                  Editing: <span className="font-bold text-emerald-400">{editingClient.fullName}</span> ({editingClient.email})
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
              {/* TAB 1: Profile & Contact */}
              {editTab === "profile" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
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
                      <label className="block font-bold text-slate-700 mb-1">
                        Email Address *
                      </label>
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
                      <label className="block font-bold text-slate-700 mb-1">
                        User Password
                      </label>
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
                          {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

              {/* TAB 2: Plan & Subscription */}
              {editTab === "subscription" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Select Subscription Tier:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(["free", "pay_as_you_go", "standard", "annual"] as SubscriptionPlanId[]).map((pid) => {
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
                            <span className="font-black text-slate-900 block truncate">{meta.name}</span>
                            <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
                              {meta.priceFormatted}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Account Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
                      >
                        <option value="active">Active (Normal Access)</option>
                        <option value="pending_verification">Pending Approval (Hold Verification)</option>
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
                    <div className="flex items-center gap-2">
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

              {/* TAB 3: Permissions Matrix */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Register New Educator</h2>
                <p className="text-xs text-slate-400">Onboard a client account with custom subscription</p>
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
                <label className="block font-bold text-slate-700 mb-1">Account Password (Optional - Auto-generated if blank)</label>
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
                  <option value="monthly">Monthly Subscription (Rs. 2000 / Month - Unlimited)</option>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Delete Educator Account?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <b>{deletingClient.fullName}</b> ({deletingClient.email})? This will permanently remove their subscription and saved settings.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Welcome Email Preview &amp; Dispatch</h2>
                  <p className="text-xs text-slate-300">
                    To: <span className="font-bold text-emerald-400">{emailPreviewClient.fullName}</span> &lt;{emailPreviewClient.email}&gt;
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
                  <span>Academy: <b>{emailPreviewClient.academyName || "Educator Academy"}</b></span>
                  <span className="mx-2">&bull;</span>
                  <span>Plan: <b>{emailPreviewClient.subscription.planName}</b></span>
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
                        data.message || "Simulated only: Add SMTP_HOST or RESEND_API_KEY in .env.local to send real emails.",
                        "error"
                      );
                    } else {
                      showToast(`Welcome email successfully sent to ${emailPreviewClient.email}!`);
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
                💡 Delivered automatically upon registration. Click <b>Send Welcome Email Now</b> to resend.
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
