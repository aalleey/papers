import React from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Control Center",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-emerald-50/30 flex flex-col lg:flex-row overflow-x-hidden">
      <AdminNav user={user} />
      <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

