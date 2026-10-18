"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, PenTool, Sparkles, Check } from "lucide-react";

export interface BrandLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark";
  variant?: "full" | "compact" | "mark";
  subtitle?: string;
  showUrdu?: boolean;
  id?: string;
  className?: string;
}

/**
 * PaperWala 3D Liquid Glass & Gold Academic Crest Emblem
 * Uses layered Lucide iconography (Open Syllabus Book + Gold Fountain Nib + Verified Seal)
 * inside a multi-bevel emerald-teal iOS Liquid Glass shield.
 */
export function BrandEmblem({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dimensions = {
    sm: {
      outer: "w-9 h-9 rounded-xl",
      innerRing: "inset-[2px] rounded-[9px]",
      book: "w-4 h-4",
      nibBadge: "w-4 h-4 -top-1 -right-1 rounded-md",
      nibIcon: "w-2.5 h-2.5",
      sealBadge: "w-3.5 h-3.5 -bottom-0.5 -left-0.5 rounded-full",
      sealIcon: "w-2 h-2",
    },
    md: {
      outer: "w-10 h-10 rounded-[14px]",
      innerRing: "inset-[2.5px] rounded-[11px]",
      book: "w-[18px] h-[18px]",
      nibBadge: "w-4 h-4 -top-1 -right-1 rounded-md",
      nibIcon: "w-2.5 h-2.5",
      sealBadge: "w-3.5 h-3.5 -bottom-0.5 -left-0.5 rounded-full",
      sealIcon: "w-2 h-2",
    },
    lg: {
      outer: "w-12 h-12 rounded-2xl",
      innerRing: "inset-[3px] rounded-[13px]",
      book: "w-5 h-5",
      nibBadge: "w-5 h-5 -top-1 -right-1 rounded-lg",
      nibIcon: "w-3 h-3",
      sealBadge: "w-4 h-4 -bottom-0.5 -left-0.5 rounded-full",
      sealIcon: "w-2.5 h-2.5",
    },
    xl: {
      outer: "w-14 h-14 rounded-[18px]",
      innerRing: "inset-[3.5px] rounded-[14px]",
      book: "w-6 h-6",
      nibBadge: "w-5.5 h-5.5 -top-1.5 -right-1.5 rounded-lg",
      nibIcon: "w-3.5 h-3.5",
      sealBadge: "w-4.5 h-4.5 -bottom-1 -left-1 rounded-full",
      sealIcon: "w-2.5 h-2.5",
    },
  }[size];

  return (
    <div
      className={`relative ${dimensions.outer} bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-900 flex items-center justify-center text-white shadow-[0_4px_0_0_#064e3b,0_10px_22px_-3px_rgba(16,185,129,0.5),inset_0_2px_2px_rgba(255,255,255,0.85),inset_0_-2px_4px_rgba(6,78,59,0.7)] group-hover:-translate-y-0.5 group-active:translate-y-0.5 transition-all duration-150 shrink-0 select-none ${className}`}
    >
      {/* Top iOS Liquid Glass Specular Crown */}
      <span
        className="pointer-events-none absolute inset-x-1.5 top-0.5 h-2.5 rounded-t-full bg-gradient-to-b from-white/70 via-white/25 to-transparent"
        aria-hidden="true"
      />

      {/* Inner Gold Academic Crest Filigree Frame */}
      <span
        className={`pointer-events-none absolute ${dimensions.innerRing} border border-amber-300/60 bg-gradient-to-b from-white/10 via-transparent to-emerald-950/35 shadow-[inset_0_1px_1px_rgba(253,224,71,0.35)]`}
        aria-hidden="true"
      />

      {/* Primary Center Motif: Open Examination Syllabus Book */}
      <BookOpen
        className={`${dimensions.book} relative z-10 text-white drop-shadow-[0_2px_3px_rgba(6,78,59,0.75)] translate-y-[1px]`}
      />

      {/* Floating 3D Gold Fountain Pen Nib Corner Crest */}
      <span
        className={`absolute ${dimensions.nibBadge} z-20 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 border border-white/95 flex items-center justify-center text-slate-950 shadow-[0_2px_0_0_#92400e,0_4px_8px_rgba(245,158,11,0.45),inset_0_1px_1px_#ffffff] group-hover:scale-105 transition-transform`}
        aria-hidden="true"
      >
        <PenTool className={`${dimensions.nibIcon} -rotate-45 stroke-[2.5]`} />
      </span>

      {/* Bottom-Left Verified Board Standard Micro-Seal */}
      <span
        className={`absolute ${dimensions.sealBadge} z-20 bg-gradient-to-b from-white via-emerald-50 to-emerald-200 border border-emerald-700/40 flex items-center justify-center text-emerald-800 shadow-[0_1.5px_3px_rgba(6,78,59,0.45)]`}
        aria-hidden="true"
      >
        <Check className={`${dimensions.sealIcon} stroke-[3.2]`} />
      </span>
    </div>
  );
}

/**
 * Complete PaperWala Brand Logo (3D Crest + Bilingual Wordmark + Optional Subtitle)
 */
export function BrandLogo({
  href = "/",
  size = "md",
  theme = "light",
  variant = "full",
  subtitle,
  showUrdu = true,
  id,
  className = "",
}: BrandLogoProps) {
  const isDark = theme === "dark";

  const textSize = {
    sm: {
      eng: "text-base",
      urdu: "text-sm",
      sub: "text-[9.5px]",
      badge: "text-[8.5px] px-1.5 py-0.5",
    },
    md: {
      eng: "text-lg",
      urdu: "text-base",
      sub: "text-[10px]",
      badge: "text-[9px] px-1.5 py-0.5",
    },
    lg: {
      eng: "text-2xl",
      urdu: "text-xl",
      sub: "text-[11px]",
      badge: "text-[9.5px] px-2 py-0.5",
    },
    xl: {
      eng: "text-3xl",
      urdu: "text-2xl",
      sub: "text-xs",
      badge: "text-[10px] px-2 py-0.5",
    },
  }[size];

  const content = (
    <>
      <BrandEmblem size={size} />

      {variant !== "mark" && (
        <div className="text-left min-w-0">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span
              className={`font-black ${textSize.eng} tracking-tight ${
                isDark
                  ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                  : "text-slate-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.95)]"
              }`}
            >
              Paper
              <span
                className={
                  isDark
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300"
                    : "text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800"
                }
              >
                Wala
              </span>
            </span>

            {showUrdu && (
              <>
                <span
                  className={`${isDark ? "text-slate-500" : "text-slate-300"} text-xs select-none`}
                  aria-hidden="true"
                >
                  ·
                </span>
                <span
                  className={`font-urdu font-bold ${textSize.urdu} leading-none ${
                    isDark
                      ? "text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                      : "text-emerald-700 drop-shadow-[0_1px_0_rgba(255,255,255,0.95)]"
                  }`}
                >
                  پیپر والا
                </span>
              </>
            )}
          </div>

          {subtitle ? (
            <span
              className={`${textSize.sub} font-bold tracking-wide block mt-1 truncate ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {subtitle}
            </span>
          ) : variant === "full" ? (
            <div className="flex items-center gap-1 mt-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              <span
                className={`${textSize.sub} font-extrabold uppercase tracking-wider leading-none ${
                  isDark ? "text-emerald-400/90" : "text-emerald-800/80"
                }`}
              >
                Board Exam Studio
              </span>
            </div>
          ) : null}
        </div>
      )}
    </>
  );

  if (!href) {
    return (
      <div
        id={id}
        className={`inline-flex items-center gap-3 group whitespace-nowrap shrink-0 ${className}`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      id={id}
      className={`inline-flex items-center gap-3 group whitespace-nowrap shrink-0 ${className}`}
    >
      {content}
    </Link>
  );
}

/**
 * Generates a high-resolution 400x400 PNG Data URL of the Official PaperWala Academic Crest.
 * Works natively in both HTML <img> tags (PDF print preview) and docx ImageRun (Word .docx download).
 */
export function generatePaperWalaCrestDataUrl(): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  const size = 400;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const cx = size / 2;
  const cy = size / 2;

  // Clear transparent canvas
  ctx.clearRect(0, 0, size, size);

  // 1. Outer 16-point Academic Starburst / Rosette Seal
  const outerPoints = 16;
  const rOuter = 186;
  const rInner = 168;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < outerPoints * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = (i * Math.PI) / outerPoints - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  const sealGrad = ctx.createLinearGradient(0, 0, size, size);
  sealGrad.addColorStop(0, "#047857");
  sealGrad.addColorStop(0.5, "#065f46");
  sealGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = sealGrad;
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#d97706";
  ctx.stroke();
  ctx.restore();

  // 2. Concentric Gold & Cream Academic Rings
  ctx.beginPath();
  ctx.arc(cx, cy, 154, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#f59e0b";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 122, 0, Math.PI * 2);
  const centerGrad = ctx.createRadialGradient(cx, cy - 25, 15, cx, cy, 125);
  centerGrad.addColorStop(0, "#10b981");
  centerGrad.addColorStop(0.65, "#047857");
  centerGrad.addColorStop(1, "#064e3b");
  ctx.fillStyle = centerGrad;
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = "#fbbf24";
  ctx.stroke();

  // 3. Inner Shield / Crest Outline
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - 58, cy - 58);
  ctx.lineTo(cx + 58, cy - 58);
  ctx.lineTo(cx + 58, cy + 5);
  ctx.quadraticCurveTo(cx + 58, cy + 58, cx, cy + 82);
  ctx.quadraticCurveTo(cx - 58, cy + 58, cx - 58, cy + 5);
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "rgba(253, 224, 71, 0.85)";
  ctx.stroke();
  ctx.restore();

  // 4. Open Syllabus Book in Center
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#064e3b";
  ctx.lineWidth = 3;

  // Left page
  ctx.beginPath();
  ctx.moveTo(cx, cy - 18);
  ctx.quadraticCurveTo(cx - 26, cy - 28, cx - 48, cy - 18);
  ctx.lineTo(cx - 48, cy + 28);
  ctx.quadraticCurveTo(cx - 26, cy + 18, cx, cy + 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right page
  ctx.beginPath();
  ctx.moveTo(cx, cy - 18);
  ctx.quadraticCurveTo(cx + 26, cy - 28, cx + 48, cy - 18);
  ctx.lineTo(cx + 48, cy + 28);
  ctx.quadraticCurveTo(cx + 26, cy + 18, cx, cy + 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gold Fountain Pen Nib Rising from Book Spine
  ctx.beginPath();
  ctx.moveTo(cx, cy - 66);
  ctx.lineTo(cx + 18, cy - 28);
  ctx.lineTo(cx + 9, cy - 10);
  ctx.lineTo(cx - 9, cy - 10);
  ctx.lineTo(cx - 18, cy - 28);
  ctx.closePath();
  const nibGrad = ctx.createLinearGradient(cx - 18, cy - 66, cx + 18, cy - 10);
  nibGrad.addColorStop(0, "#fef08a");
  nibGrad.addColorStop(0.5, "#f59e0b");
  nibGrad.addColorStop(1, "#b45309");
  ctx.fillStyle = nibGrad;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // Nib slit & breather hole
  ctx.beginPath();
  ctx.moveTo(cx, cy - 64);
  ctx.lineTo(cx, cy - 34);
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy - 32, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = "#78350f";
  ctx.fill();
  ctx.restore();

  // 5. Top & Bottom Banner Text inside the White Ring
  ctx.save();
  ctx.fillStyle = "#064e3b";
  ctx.font = "900 22px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PAPERWALA", cx, cy - 137);

  ctx.fillStyle = "#b45309";
  ctx.font = "800 15px sans-serif";
  ctx.fillText("★ BOARD EXAM STANDARD ★", cx, cy + 138);

  // Side stars
  ctx.fillStyle = "#d97706";
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("✦", cx - 138, cy);
  ctx.fillText("✦", cx + 138, cy);

  // Bottom ribbon inside shield
  ctx.fillStyle = "#fef08a";
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("BISE • FBISE", cx, cy + 54);
  ctx.restore();

  return canvas.toDataURL("image/png");
}
