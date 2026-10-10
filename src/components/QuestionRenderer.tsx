"use client";

import React from "react";
import { Question } from "@/lib/types";
import { MathRenderer } from "./MathRenderer";
import { UrduText } from "./UrduText";
import { CheckCircle2, Bookmark, Award } from "lucide-react";

interface QuestionRendererProps {
  question: Partial<Question>;
  showAnswer?: boolean;
  className?: string;
}

export function QuestionRenderer({
  question,
  showAnswer = true,
  className = "",
}: QuestionRendererProps) {
  const enTrans = question.translations?.find((t) => t.language === "en");
  const urTrans = question.translations?.find((t) => t.language === "ur");

  const typeColor =
    question.type === "mcq"
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : question.type === "short"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  const diffColor =
    question.difficulty === "easy"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : question.difficulty === "hard"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-sky-50 text-sky-700 border-sky-200";

  const options = enTrans?.options || urTrans?.options || [];

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 ${className}`}>
      {/* Badges / Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold border ${typeColor}`}>
            {question.type}
          </span>
          <span className={`px-2.5 py-1 rounded-full capitalize border ${diffColor}`}>
            {question.difficulty}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            <Award className="w-3.5 h-3.5 text-slate-500" />
            {question.marks} {question.marks === 1 ? "Mark" : "Marks"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          {question.concept_tag && (
            <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              <Bookmark className="w-3 h-3 text-slate-400" />
              {question.concept_tag}
            </span>
          )}
          {question.source_ref && (
            <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-600">
              {question.source_ref}
            </span>
          )}
        </div>
      </div>

      {/* English Text */}
      {enTrans?.text && (
        <div className="space-y-1">
          <div className="text-xs uppercase font-semibold text-slate-400">English</div>
          <div className="text-slate-800 text-base leading-relaxed">
            <MathRenderer content={enTrans.text} />
          </div>
        </div>
      )}

      {/* Urdu Text */}
      {urTrans?.text && (
        <div className="space-y-1 pt-2 border-t border-slate-50">
          <div className="text-xs uppercase font-semibold text-slate-400 text-right">اردو</div>
          <UrduText content={urTrans.text} className="text-lg" />
        </div>
      )}

      {/* MCQ Options */}
      {question.type === "mcq" && options.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {options.map((opt, idx) => {
            const optNum = idx + 1;
            const isCorrect = question.correct_option === optNum;
            const letter = String.fromCharCode(65 + idx);

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-colors ${
                  isCorrect
                    ? "bg-emerald-50/60 border-emerald-300 text-emerald-950 font-medium"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                    isCorrect ? "bg-emerald-600 text-white" : "bg-white border border-slate-300 text-slate-600"
                  }`}
                >
                  {letter}
                </span>
                <div className="flex-1 pt-0.5">
                  <MathRenderer content={opt} />
                </div>
                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Answer / Solution for Short or Long questions */}
      {showAnswer && question.type !== "mcq" && (enTrans?.answer || urTrans?.answer) && (
        <div className="pt-3 border-t border-slate-100 bg-slate-50/70 p-3.5 rounded-lg space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Answer / Solution:</div>
          {enTrans?.answer && (
            <div className="text-sm text-slate-700 leading-relaxed">
              <MathRenderer content={enTrans.answer} />
            </div>
          )}
          {urTrans?.answer && (
            <div className="pt-2 border-t border-slate-200">
              <UrduText content={urTrans.answer} className="text-sm" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
