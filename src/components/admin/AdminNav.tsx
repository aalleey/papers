"use client";

import React, { useState, useEffect } from "react";
import Link from "next/navigation";
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
  UserShield,
  Users,
} from "lucide-react";

interface AdminNavProps {
  user: AuthUser | null;
}

const navItems = [
  { href: "/admin/users", label: "Registered Clients", icon: Users },
  { href: "/admin/questions", label: "Questions Bank", icon: HelpCircle },
  { href: "/admin/import", label: "HTML & CSV Import", icon: Upload },
  { href: "/admin/boards", label: "Boards", icon: Globe2 },
  { href: "/admin/courses", label: "Courses", icon: GraduationCap },
  { href: "/admin/subjects", label: "Subjects", icon: Book },
  { href: "/admin/chapters", label: "Chapters", icon: Layers },
  { href: "/admin/topics", label: "Topics", icon: Bookmark },
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
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-950 text-white px-4 h-14 border-b border-slate-800/80 sticky top-0 z-40">
        <NextLink href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-sm tracking-tight">PaperWala</span>
            <span className="text-slate-600 text-xs" aria-hidden="true">·</span>
            <span className="text-[11px] text-emerald-400 font-semibold">Admin</span>
          </div>
        </NextLink>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop permanent, Mobile drawer) */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-0 w-64 bg-slate-950 border-r border-slate-800/80 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 h-screen ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Brand Header */}
        <div className="px-5 h-16 border-b border-slate-800/80 flex items-center justify-between">
          <NextLink href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight leading-none flex items-baseline gap-1.5">
                <span>PaperWala</span>
                <span className="font-urdu text-emerald-400 text-xs font-bold">پیپر والا</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">Admin Console</div>
            </div>
          </NextLink>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-slate-500">
            Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <NextLink
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </NextLink>
            );
          })}
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/30">
                A
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.email || "Admin User"}
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  Administrator
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
