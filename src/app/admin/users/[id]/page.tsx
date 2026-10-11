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
