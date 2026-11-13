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
  Flag,
  MessageCircle,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

interface AdminNavProps {
  user: AuthUser | null;
}

const primaryNavItems = [
  { href: "/admin/users", label: "Registered Educators", badge: "CRM", icon: Users },
  { href: "/admin/support", label: "Support Chat", badge: "Live", icon: MessageCircle },
  { href: "/admin/finance", label: "Finance & Invoices", badge: "New", icon: WalletCards },
  { href: "/admin/reports", label: "Flagged Questions", badge: "Queue", icon: Flag },
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
      <div className="lg:hidden flex items-center justify-between bg-white/90 backdrop-blur-xl text-slate-900 px-4 h-16 border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <BrandLogo size="sm" theme="light" subtitle="Admin Console" />

        <div className="flex items-center gap-2">
          <NextLink
            href="/select-questions"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generator</span>
          </NextLink>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-200/70 transition-colors cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-150"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop permanent lg+, Mobile/Tablet slide-over drawer) */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 lg:z-20 w-72 bg-white/95 backdrop-blur-2xl border-r border-slate-200/80 text-slate-700 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 h-screen shrink-0 shadow-xl lg:shadow-[4px_0_24px_-12px_rgba(15,23,42,0.06)] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />

        {/* Brand Header */}
        <div className="px-5 h-20 border-b border-slate-100 flex items-center justify-between">
          <BrandLogo size="md" theme="light" subtitle="Admin Console" />
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Workspace Switcher */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/60 space-y-2">
          <NextLink
            href="/select-questions"
            onClick={() => setMobileOpen(false)}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Exam Generator</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 opacity-85" />
          </NextLink>

          <NextLink
            href="/quick-paper"
            onClick={() => setMobileOpen(false)}
            className="w-full py-2 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-950 font-bold text-xs transition-colors flex items-center justify-between shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quick Paper Studio</span>
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </NextLink>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3.5 space-y-5">
          {/* Section 1: Core Operations */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
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
                      ? "bg-gradient-to-r from-emerald-50 via-teal-50/70 to-transparent text-emerald-900 border border-emerald-200/90 shadow-2xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 border border-slate-200/80"
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
            <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-50 via-blue-50/60 to-transparent text-indigo-950 border border-indigo-200/90 shadow-2xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 border border-transparent"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span>{item.label}</span>
                </NextLink>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {(user?.email || "A").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-slate-900 truncate">
                  {user?.email || "Admin User"}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Super Administrator</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

