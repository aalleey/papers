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
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col lg:flex-row overflow-x-hidden relative">
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 right-0 w-[520px] h-[520px] rounded-full bg-emerald-400/[0.08] blur-3xl" />
        <div className="absolute top-1/3 left-64 w-[480px] h-[480px] rounded-full bg-indigo-400/[0.08] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[420px] h-[420px] rounded-full bg-sky-400/[0.07] blur-3xl" />
      </div>
      <AdminNav user={user} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

