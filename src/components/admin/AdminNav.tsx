"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthUser } from "@/lib/auth";
import {
  BookOpen,
  HelpCircle,
  Upload,
  Globe2,
  GraduationCap,
  Book,
  Bookmark,
  Layers,
  LogOut,
  Menu,
  X,
  Users,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileText,
  WalletCards,
} from "lucide-react";

interface AdminNavProps {
  user: AuthUser | null;
}

const primaryNavItems = [
  { href: "/admin/users", label: "Registered Educators", badge: "CRM", icon: Users },
  { href: "/admin/finance", label: "Finance & Invoices", badge: "New", icon: WalletCards },
  { href: "/admin/questions", label: "Questions Bank", badge: "KaTeX", icon: HelpCircle },
  { href: "/admin/import", label: "HTML & CSV Import", badge: "Bulk", icon: Upload },
];

const curriculumNavItems = [
  { href: "/admin/boards", label: "Education Boards", icon: Globe2 },
  { href: "/admin/courses", label: "Class Courses", icon: GraduationCap },
  { href: "/admin/subjects", label: "Subjects", icon: Book },
  { href: "/admin/chapters", label: "Chapters & Units", icon: Layers },
  { href: "/admin/topics", label: "Syllabus Topics", icon: Bookmark },
];

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await fetch("/api/auth/client/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile & Tablet Top Command Bar (< lg) */}
      <div className="lg:hidden flex items-center justify-between bg-slate-950/95 backdrop-blur-2xl text-white px-4 h-16 border-b border-slate-800/80 sticky top-0 z-40 shadow-lg">
        <NextLink href="/" className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_3px_0_0_#065f46,inset_0_1px_1px_rgba(255,255,255,0.6)]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">PaperWala</span>
              <span className="font-urdu text-emerald-400 text-xs font-bold">پیپر والا</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block">
              Executive Admin Console
            </span>
          </div>
        </NextLink>

        <div className="flex items-center gap-2">
          <NextLink
            href="/select-questions"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generator</span>
          </NextLink>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-150"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop permanent lg+, Mobile/Tablet slide-over drawer) */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 lg:z-20 w-72 bg-slate-950 border-r border-slate-800/90 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 h-screen shrink-0 shadow-2xl lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500" />

        {/* Brand Header */}
        <div className="px-5 h-20 border-b border-slate-800/80 flex items-center justify-between">
          <NextLink href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_4px_0_0_#065f46,0_8px_16px_-2px_rgba(16,185,129,0.4),inset_0_2px_1px_rgba(255,255,255,0.65)] group-hover:-translate-y-0.5 transition-all">
              <span
                className="pointer-events-none absolute inset-x-1 top-0.5 h-2 rounded-t-full bg-gradient-to-b from-white/50 to-transparent"
                aria-hidden="true"
              />
              <BookOpen className="w-5 h-5 relative z-10" />
            </div>
            <div>
              <div className="font-black text-white text-base tracking-tight leading-none flex items-baseline gap-2">
                <span>PaperWala</span>
                <span className="font-urdu text-emerald-400 text-sm font-bold">پیپر والا</span>
              </div>
              <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin Console</span>
              </div>
            </div>
          </NextLink>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Workspace Switcher */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/40 space-y-2">
          <NextLink
            href="/select-questions"
            onClick={() => setMobileOpen(false)}
            className="relative overflow-hidden w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-[0_3px_0_0_#065f46,0_8px_16px_-4px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-between"
          >
            <span
              className="pointer-events-none absolute inset-x-1.5 top-0.5 h-2 rounded-t-full bg-gradient-to-b from-white/50 to-transparent"
              aria-hidden="true"
            />
            <span className="flex items-center gap-2 relative z-10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Exam Generator</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 relative z-10 opacity-80" />
          </NextLink>

          <NextLink
            href="/quick-paper"
            onClick={() => setMobileOpen(false)}
            className="w-full py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Paper Studio</span>
            </span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </NextLink>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3.5 space-y-5">
          {/* Section 1: Core Operations */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Operations &amp; CRM
            </div>
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-transparent text-white border border-emerald-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                        isActive
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NextLink>
              );
            })}
          </div>

          {/* Section 2: Curriculum Hierarchy */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Curriculum Taxonomy
            </div>
            {curriculumNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-transparent text-white border border-emerald-500/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </NextLink>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/90 shadow-inner">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                {(user?.email || "A").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.email || "Admin User"}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Super Administrator</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

