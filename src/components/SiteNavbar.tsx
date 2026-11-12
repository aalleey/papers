"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
  Zap,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { ClientUser, isPaidSubscriber } from "@/lib/types";

interface SiteNavbarProps {
  clientUser?: ClientUser | null;
  onAuthSuccess?: (user: ClientUser) => void;
  onLogout?: () => void;
  onOpenAuth?: () => void;
}

export function SiteNavbar({
  clientUser: controlledUser,
  onAuthSuccess,
  onLogout,
  onOpenAuth,
}: SiteNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isControlled = controlledUser !== undefined;
  const [internalUser, setInternalUser] = useState<ClientUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [internalAuthOpen, setInternalAuthOpen] = useState(false);

  const clientUser = isControlled ? controlledUser : internalUser;

  useEffect(() => {
    if (isControlled) return;
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch("/api/auth/client/me");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.client) {
          setInternalUser(data.client);
        }
      } catch {
        // ignore network errors
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
  }, [isControlled]);

  const handleOpenAuth = () => {
    setMobileMenuOpen(false);
    if (onOpenAuth) {
      onOpenAuth();
    } else {
      setInternalAuthOpen(true);
    }
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await fetch("/api/auth/client/logout", { method: "POST" });
      setInternalUser(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  const isHome = pathname === "/";
  const isNotes = pathname === "/notes" || pathname.startsWith("/notes/");
  const isPricing = pathname === "/pricing";

  const howItWorksHref = isHome ? "#how-it-works" : "/#how-it-works";
  const questionBankHref = isHome ? "#active-chapters" : "/#active-chapters";
  const samplePaperHref = isHome ? "#sample-paper" : "/#sample-paper";
  const faqHref = isHome ? "#faq" : "/#faq";

  const navItemBase =
    "rounded-xl hover:bg-gradient-to-b hover:from-white/95 hover:to-white/75 hover:text-slate-950 hover:shadow-[0_4px_12px_-2px_rgba(15,23,42,0.12),0_2px_0_0_rgba(203,213,225,0.85),inset_0_1px_1px_#ffffff] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 whitespace-nowrap shrink-0";
  const activeNavItem =
    "text-emerald-800 bg-gradient-to-b from-white/95 to-white/70 shadow-[0_3px_8px_-1px_rgba(16,185,129,0.18),0_2px_0_0_#a7f3d0,inset_0_1px_1px_#ffffff] font-bold whitespace-nowrap shrink-0 rounded-xl";

  return (
    <>
      <header className="sticky top-2 sm:top-3 z-50 px-2 sm:px-4 lg:px-8 pointer-events-none">
        <div className="pointer-events-auto max-w-7xl mx-auto rounded-[20px] sm:rounded-[22px] bg-gradient-to-b from-white/75 via-white/55 to-white/70 backdrop-blur-3xl border border-white/90 ring-1 ring-slate-900/[0.04] shadow-[0_22px_55px_-12px_rgba(15,23,42,0.18),0_6px_20px_-4px_rgba(16,185,129,0.12),inset_0_2px_2px_0_rgba(255,255,255,1),inset_0_-2px_6px_0_rgba(255,255,255,0.7)] transition-all duration-200">
          <div className="px-2.5 sm:px-5 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 lg:gap-3 xl:gap-5">
            {/* Zone 1: Brand Logo */}
            <div className="shrink-0 min-w-0">
              <BrandLogo id="nav-brand-logo" size="sm" variant="full" />
            </div>

            {/* Zone 2: Desktop Navigation Track */}
            <nav
              className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 p-1 xl:p-1.5 rounded-2xl bg-slate-900/[0.04] backdrop-blur-xl border border-white/80 shadow-[inset_0_2px_5px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.95)] text-[11px] xl:text-xs font-semibold text-slate-700 min-w-0"
              aria-label="Main Navigation"
            >
              <Link
                href={howItWorksHref}
                className={`hidden xl:inline-block px-3 py-1.5 ${navItemBase}`}
              >
                How It Works
              </Link>
              <Link
                href={questionBankHref}
                className={`px-2.5 xl:px-3.5 py-1.5 ${navItemBase}`}
              >
                Question Bank
              </Link>
              <Link
                href="/notes"
                className={`px-2.5 xl:px-3.5 py-1.5 ${isNotes ? activeNavItem : navItemBase}`}
              >
                Study Notes
              </Link>
              <Link
                href={samplePaperHref}
                className={`hidden xl:inline-block px-3 py-1.5 ${navItemBase}`}
              >
                Sample Paper
              </Link>
              <Link
                href="/pricing"
                className={`px-2.5 xl:px-3.5 py-1.5 ${
                  isPricing
                    ? activeNavItem
                    : "rounded-xl text-emerald-800 bg-gradient-to-b from-white/85 to-white/55 hover:from-white hover:to-white/80 shadow-[0_3px_8px_-1px_rgba(16,185,129,0.16),0_2px_0_0_#a7f3d0,inset_0_1px_1px_#ffffff] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 whitespace-nowrap shrink-0"
                }`}
              >
                Pricing
              </Link>
              <Link
                href={faqHref}
                className={`px-2.5 xl:px-3.5 py-1.5 ${navItemBase}`}
              >
                FAQs
              </Link>
            </nav>

            {/* Zone 3: Account Controls & Primary Action */}
            <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0 min-w-0">
              {clientUser ? (
                <>
                  <Link
                    href="/quick-paper"
                    id="nav-quick-paper-btn"
                    className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-b from-white/80 via-white/45 to-white/65 hover:from-white/95 hover:to-white/80 backdrop-blur-2xl border border-white/90 text-slate-800 text-xs font-bold shadow-[0_4px_0_0_rgba(203,213,225,0.8),0_8px_20px_-4px_rgba(15,23,42,0.12),inset_0_2px_2px_0_#ffffff,inset_0_-2px_4px_0_rgba(16,185,129,0.1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0"
                    title="Create or Paste Instant Paper"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick Paper</span>
                  </Link>

                  {clientUser.email.toLowerCase() === "ali.khaliq50@gmail.com" && (
                    <Link
                      href="/admin/users"
                      id="nav-admin-panel-btn"
                      className="hidden md:inline-flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 rounded-xl bg-gradient-to-b from-indigo-50/85 via-white/50 to-indigo-100/65 hover:from-indigo-50 hover:to-indigo-100/90 backdrop-blur-2xl border border-white/90 text-indigo-800 text-xs font-bold shadow-[0_4px_0_0_#c7d2fe,0_8px_20px_-4px_rgba(79,70,229,0.15),inset_0_2px_2px_0_#ffffff] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0"
                      title="Open Admin Panel"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden xl:inline">Admin</span>
                    </Link>
                  )}

                  <div className="hidden md:inline-flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-white/80 via-white/45 to-white/65 backdrop-blur-2xl border border-white/90 text-xs font-medium shadow-[0_4px_0_0_rgba(203,213,225,0.8),0_8px_20px_-4px_rgba(15,23,42,0.12),inset_0_2px_2px_0_#ffffff] whitespace-nowrap shrink-0">
                    <Link
                      href="/profile"
                      id="nav-my-profile-link"
                      title="My Profile & Paper History"
                      className="inline-flex items-center gap-1.5 text-slate-800 hover:text-emerald-700 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold max-w-[95px] xl:max-w-[140px] truncate">
                        {clientUser.fullName.split(" ")[0]}
                      </span>
                      <span className="hidden 2xl:inline text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span className="hidden 2xl:inline text-[11px] text-emerald-700 font-bold">
                        {clientUser.subscription.planName}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-0.5 text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                      title="Log Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 lg:gap-2">
                  <button
                    onClick={handleOpenAuth}
                    id="nav-client-login-btn"
                    className="inline-flex items-center gap-1.5 px-3 xl:px-4 py-2 rounded-xl bg-gradient-to-b from-white/85 via-white/45 to-white/70 hover:from-white hover:via-white/70 hover:to-emerald-50/75 backdrop-blur-2xl border border-white/95 ring-1 ring-slate-900/[0.04] text-slate-800 hover:text-emerald-900 text-xs font-bold shadow-[0_4px_0_0_rgba(203,213,225,0.85),0_10px_22px_-4px_rgba(15,23,42,0.14),inset_0_2px_2px_0_rgba(255,255,255,1),inset_0_-2px_6px_0_rgba(16,185,129,0.12)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgba(167,243,208,0.9),0_14px_26px_-4px_rgba(16,185,129,0.22),inset_0_2px_3px_0_#ffffff] active:translate-y-0.5 active:shadow-[0_2px_0_0_rgba(203,213,225,0.9)] transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sign In</span>
                  </button>
                  <Link
                    href="/register"
                    id="nav-client-signup-btn"
                    className="hidden md:inline-flex items-center gap-1.5 px-3 xl:px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-50/85 via-white/45 to-teal-50/75 hover:from-white hover:via-emerald-50/65 hover:to-teal-100/80 backdrop-blur-2xl border border-white/95 ring-1 ring-emerald-500/15 text-emerald-900 hover:text-emerald-950 text-xs font-extrabold shadow-[0_4px_0_0_rgba(167,243,208,0.95),0_10px_22px_-4px_rgba(16,185,129,0.18),inset_0_2px_2px_0_rgba(255,255,255,1),inset_0_-2px_6px_0_rgba(16,185,129,0.18)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_rgba(110,231,183,1),0_14px_28px_-4px_rgba(16,185,129,0.28),inset_0_2px_3px_0_#ffffff] active:translate-y-0.5 active:shadow-[0_2px_0_0_rgba(167,243,208,1)] transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Register</span>
                  </Link>
                </div>
              )}

              {clientUser ? (
                isPaidSubscriber(clientUser) ? (
                  <Link
                    href="/select-questions"
                    id="nav-generate-paper-btn"
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 xl:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-bold text-[11px] sm:text-xs shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.45),inset_0_2px_2px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#065f46,0_14px_24px_-4px_rgba(16,185,129,0.55),inset_0_2px_2px_rgba(255,255,255,0.75)] active:translate-y-0.5 active:shadow-[0_2px_0_0_#065f46] transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    <span>Generate Paper</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href="/pricing"
                    id="nav-generate-paper-btn"
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 xl:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 text-white font-bold text-[11px] sm:text-xs shadow-[0_4px_0_0_#9a3412,0_10px_20px_-4px_rgba(245,158,11,0.45),inset_0_2px_2px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    <span>Upgrade Plan</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </Link>
                )
              ) : (
                <Link
                  href="/pricing"
                  id="nav-generate-paper-btn"
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 xl:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 text-white font-bold text-[11px] sm:text-xs shadow-[0_4px_0_0_#065f46,0_10px_20px_-4px_rgba(16,185,129,0.45),inset_0_2px_2px_rgba(255,255,255,0.65)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_#065f46,0_14px_24px_-4px_rgba(16,185,129,0.55),inset_0_2px_2px_rgba(255,255,255,0.75)] active:translate-y-0.5 active:shadow-[0_2px_0_0_#065f46] transition-all duration-150 whitespace-nowrap shrink-0"
                >
                  <span>Plans &amp; Pricing</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Link>
              )}

              {/* Mobile / Laptop Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl bg-gradient-to-b from-white/85 to-white/60 border border-white text-slate-700 hover:text-slate-950 shadow-[0_3px_0_0_#cbd5e1,inset_0_2px_2px_#ffffff] active:translate-y-0.5 transition-all shrink-0 cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile & Laptop 3D Liquid Glass Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="xl:hidden border-t border-white/70 bg-gradient-to-b from-white/75 to-white/60 backdrop-blur-3xl rounded-b-[22px] px-4 py-4 space-y-3">
              {clientUser && isPaidSubscriber(clientUser) && (
                <Link
                  href="/select-questions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>Generate Exam Paper (Choose Class → Subject → Chapter)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}

              <nav className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold text-slate-700">
                <Link
                  href={howItWorksHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] hover:text-emerald-700 transition-all"
                >
                  How It Works
                </Link>
                <Link
                  href={questionBankHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] hover:text-emerald-700 transition-all"
                >
                  Question Bank
                </Link>
                <Link
                  href="/notes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] hover:text-emerald-700 transition-all"
                >
                  Study Notes
                </Link>
                <Link
                  href={samplePaperHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] hover:text-emerald-700 transition-all"
                >
                  Sample Paper
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 shadow-[0_2px_0_0_#a7f3d0,inset_0_1px_1px_#ffffff] transition-all"
                >
                  Pricing (Monthly)
                </Link>
                <Link
                  href={faqHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] hover:text-emerald-700 transition-all"
                >
                  FAQs
                </Link>
                <Link
                  href="/quick-paper"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/80 border border-white text-emerald-700 shadow-[0_2px_0_0_#cbd5e1,inset_0_1px_1px_#ffffff] transition-all"
                >
                  Quick Paper
                </Link>
                {clientUser && clientUser.email.toLowerCase() === "ali.khaliq50@gmail.com" && (
                  <Link
                    href="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl bg-indigo-50/90 border border-indigo-200 text-indigo-800 shadow-[0_2px_0_0_#c7d2fe,inset_0_1px_1px_#ffffff] transition-all"
                  >
                    Admin Panel
                  </Link>
                )}
              </nav>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                {clientUser ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-800 min-w-0 truncate"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{clientUser.fullName}</span>
                      <span className="text-slate-400 shrink-0">·</span>
                      <span className="text-emerald-700 shrink-0">
                        {clientUser.subscription.planName}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-[0_2px_0_0_#fecdd3] shrink-0 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 w-full">
                    <button
                      onClick={handleOpenAuth}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-white/90 via-white/55 to-white/75 backdrop-blur-2xl border border-white text-slate-800 text-xs font-bold shadow-[0_4px_0_0_rgba(203,213,225,0.85),inset_0_2px_2px_#ffffff] text-center cursor-pointer"
                    >
                      Sign In
                    </button>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-b from-emerald-50/90 via-white/55 to-teal-50/85 backdrop-blur-2xl border border-white text-emerald-900 text-xs font-extrabold shadow-[0_4px_0_0_rgba(167,243,208,0.95),inset_0_2px_2px_#ffffff] text-center"
                    >
                      Register Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {!onOpenAuth && (
        <ClientAuthModal
          isOpen={internalAuthOpen}
          onClose={() => setInternalAuthOpen(false)}
          onSuccess={(user) => {
            setInternalUser(user);
            setInternalAuthOpen(false);
            if (onAuthSuccess) onAuthSuccess(user);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
