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

  // If on login page, do not render sidebar
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage && (!user || user.role !== "admin")) {
      router.push("/admin/login");
    }
  }, [user, isLoginPage, router]);

  if (isLoginPage) {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm">PaperWala</span>
            <span className="text-[10px] text-emerald-400 block -mt-0.5">Admin Area</span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop permanent, Mobile drawer) */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-0 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 h-screen ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-950">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
                <span>PaperWala</span>
                <span className="font-urdu text-emerald-400 text-sm font-normal">پیپر والا</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-medium mt-1">Admin Dashboard</div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </NextLink>
            );
          })}
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-850/80 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/30">
                A
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.email || "Admin User"}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Role: Admin
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
