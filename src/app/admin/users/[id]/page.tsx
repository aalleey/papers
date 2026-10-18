"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Sparkles, RefreshCw } from "lucide-react";
import { ClientProfileView } from "@/components/ClientProfileView";
import {
  ClientUser,
  PaperRecord,
  ClientPaperStats,
  InvoiceRecord,
  EmailRecord,
  QuestionReportRecord,
} from "@/lib/types";

export default function AdminClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<ClientUser | null>(null);
  const [papers, setPapers] = useState<PaperRecord[]>([]);
  const [stats, setStats] = useState<ClientPaperStats | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [reports, setReports] = useState<QuestionReportRecord[]>([]);

  const loadClientProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/clients/${id}/papers`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load client");
      setClient(data.client);
      setPapers(data.papers || []);
      setStats(data.stats);
      setInvoices(data.invoices || []);
      setEmails(data.emails || []);
      setReports(data.reports || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load client");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientProfile();
  }, [id]);

  const handleQuickApprove = async () => {
    if (!client) return;
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          isVerified: true,
          planId:
            client.subscription.planId === "free"
              ? "standard"
              : client.subscription.planId,
        }),
      });
      if (!res.ok) throw new Error("Failed to approve account");
      const updatedData = await res.json();
      if (updatedData.client) {
        setClient(updatedData.client);
      }
    } catch (e) {
      alert(
        "Failed to approve account: " +
          (e instanceof Error ? e.message : "Unknown error")
      );
    }
  };

  const isPending =
    client &&
    (client.subscription?.status === "pending_verification" ||
      client.isVerified === false);

  return (
    <div className="space-y-5 relative">
      {/* Top 3D Frosted Glass Navigation Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/85 via-white/75 to-white/90 backdrop-blur-2xl border border-white/90 px-4 py-3 shadow-[0_12px_30px_-10px_rgba(15,23,42,0.08),0_3px_0_0_rgba(203,213,225,0.6),inset_0_1px_0_#ffffff] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-xs font-extrabold text-slate-700 hover:text-emerald-700 shadow-[0_2px_0_0_#cbd5e1] hover:-translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Educators Directory</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <span>/</span>
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-700 font-extrabold">
              {client ? client.fullName : "Educator Dossier"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[11px] font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>360° Rich Educator Intelligence Dossier</span>
          </span>
          <button
            type="button"
            onClick={loadClientProfile}
            title="Refresh Profile Data"
            className="p-2 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-600 hover:text-emerald-700 shadow-[0_2px_0_0_#cbd5e1] transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`}
            />
          </button>
        </div>
      </div>

      {isPending && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/25 border border-amber-300/60">
          <div className="space-y-0.5">
            <div className="font-black text-sm flex items-center gap-1.5">
              <span>⚠️ Application on HOLD — Pending Admin Verification</span>
            </div>
            <p className="text-xs text-amber-50 font-medium">
              Educator has submitted Raast payment to 03092770207
              {client.paymentSubmission?.transactionRef &&
                ` (TID: ${client.paymentSubmission.transactionRef})`}
              . Approve to activate full paper generator access.
            </p>
          </div>
          <button
            type="button"
            onClick={handleQuickApprove}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-800 font-black text-xs shadow-md transition-colors shrink-0 cursor-pointer"
          >
            ✓ Approve &amp; Activate Now
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-3 bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-lg">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-extrabold text-slate-600">
            Loading rich educator profile, generated papers, invoices &amp; logs...
          </p>
        </div>
      ) : error || !client || !stats ? (
        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl border border-rose-200 p-8 text-center text-rose-600 text-sm font-bold shadow-lg">
          {error || "Client not found"}
        </div>
      ) : (
        <ClientProfileView
          client={client}
          papers={papers}
          stats={stats}
          invoices={invoices}
          emails={emails}
          reports={reports}
          isAdminView={true}
          onClientUpdated={(updated) => setClient(updated)}
        />
      )}
    </div>
  );
}
