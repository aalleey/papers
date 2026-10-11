"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Edit2 } from "lucide-react";
import { ClientProfileView } from "@/components/ClientProfileView";
import { ClientUser, PaperRecord, ClientPaperStats } from "@/lib/types";

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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/clients/${id}/papers`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load client");
        setClient(data.client);
        setPapers(data.papers);
        setStats(data.stats);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load client");
      } finally {
        setLoading(false);
      }
    }
    load();
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
          planId: client.subscription.planId === "free" ? "standard" : client.subscription.planId,
        }),
      });
      if (!res.ok) throw new Error("Failed to approve account");
      const updatedData = await res.json();
      if (updatedData.client) {
        setClient(updatedData.client);
      }
    } catch (e) {
      alert("Failed to approve account: " + (e instanceof Error ? e.message : "Unknown error"));
    }
  };

  const isPending =
    client &&
    (client.subscription?.status === "pending_verification" || client.isVerified === false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Registered Clients
        </Link>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit profile &amp; permissions in list
        </Link>
      </div>

      {isPending && (
        <div className="p-4 rounded-2xl bg-amber-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/20">
          <div className="space-y-0.5">
            <div className="font-black text-sm flex items-center gap-1.5">
              <span>⚠️ Application on HOLD — Pending Admin Approval</span>
            </div>
            <p className="text-xs text-amber-100 font-medium">
              Educator has submitted Raast payment to 03092770207
              {client.paymentSubmission?.transactionRef && ` (TID: ${client.paymentSubmission.transactionRef})`}
              . Approve to activate paper generator access.
            </p>
          </div>
          <button
            type="button"
            onClick={handleQuickApprove}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 hover:text-emerald-800 font-black text-xs shadow-md transition-colors shrink-0"
          >
            ✓ Approve &amp; Activate Now
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-32 flex justify-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error || !client || !stats ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center text-rose-600 text-sm font-bold">
          {error || "Client not found"}
        </div>
      ) : (
        <ClientProfileView client={client} papers={papers} stats={stats} />
      )}
    </div>
  );
}
