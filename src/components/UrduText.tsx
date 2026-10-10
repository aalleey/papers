"use client";

import React from "react";
import { MathRenderer } from "./MathRenderer";

interface UrduTextProps {
  content: string;
  className?: string;
}

export function UrduText({ content, className = "" }: UrduTextProps) {
  if (!content) return null;

  return (
    <div
      dir="rtl"
      lang="ur"
      className={`font-urdu text-right leading-loose tracking-normal text-slate-800 ${className}`}
      style={{ fontFamily: "var(--font-urdu), 'Noto Nastaliq Urdu', serif" }}
    >
      <MathRenderer content={content} />
    </div>
  );
}
