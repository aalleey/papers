import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuestionReportStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

// PUT /api/reports/[id] - Update report status OR execute 1-Click Fix on the live Question & resolve
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const existingReport = await db.getQuestionReportById(id);

    if (!existingReport) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    let updatedSnapshot = existingReport.questionSnapshot;
    let questionUpdated = false;

    // 1-Click Fix Mode: If `questionFix` is provided, apply changes directly to the Question in DB
    if (body.questionFix) {
      const fix = body.questionFix;
      const liveQuestion = await db.getQuestionById(existingReport.questionId);

      const chapterId =
        fix.chapterId || liveQuestion?.chapter_id || existingReport.chapterId || "81fef04e-6a53-5018-9051-fdb1c36775d9";
      const qType = fix.type || liveQuestion?.type || existingReport.questionType || "mcq";

      const textEn = (fix.textEn ?? updatedSnapshot.textEn ?? "").trim();
      const textUr = (fix.textUr ?? updatedSnapshot.textUr ?? "").trim();
      const optionsEn =
        qType === "mcq"
          ? fix.optionsEn ?? updatedSnapshot.optionsEn ?? null
          : null;
      const optionsUr =
        qType === "mcq"
          ? fix.optionsUr ?? updatedSnapshot.optionsUr ?? optionsEn
          : null;
      const correctOption =
        qType === "mcq"
          ? Number(fix.correctOption ?? updatedSnapshot.correctOption ?? 1)
          : null;
      const answerEn = fix.answerEn !== undefined ? fix.answerEn : updatedSnapshot.answerEn || null;
      const answerUr = fix.answerUr !== undefined ? fix.answerUr : updatedSnapshot.answerUr || null;
      const marks = Number(fix.marks ?? updatedSnapshot.marks ?? (qType === "mcq" ? 1 : qType === "short" ? 2 : 5));

      const translations: {
        language: "en" | "ur";
        text: string;
        options?: string[] | null;
        answer?: string | null;
      }[] = [
        {
          language: "en",
          text: textEn,
          options: optionsEn,
          answer: answerEn,
        },
      ];

      if (textUr) {
        translations.push({
          language: "ur",
          text: textUr,
          options: optionsUr,
          answer: answerUr || answerEn,
        });
      }

      await db.saveQuestion({
        id: existingReport.questionId,
        chapter_id: chapterId,
        topic_id: liveQuestion?.topic_id || null,
        type: qType,
        source: liveQuestion?.source || "exercise",
        source_ref: liveQuestion?.source_ref || null,
        concept_tag: liveQuestion?.concept_tag || null,
        correct_option: correctOption,
        marks,
        difficulty: liveQuestion?.difficulty || "medium",
        is_active: liveQuestion ? liveQuestion.is_active : true,
        source_note: liveQuestion?.source_note || "Verified via Admin Report Fix",
        translations,
      });

      updatedSnapshot = {
        textEn,
        textUr: textUr || null,
        optionsEn,
        optionsUr,
        correctOption,
        answerEn,
        answerUr,
        marks,
      };
      questionUpdated = true;
    }

    const newStatus: QuestionReportStatus =
      body.status || (questionUpdated ? "resolved" : existingReport.status);
    const resolvedAt =
      newStatus === "resolved"
        ? new Date().toISOString()
        : newStatus === "open"
        ? null
        : existingReport.resolvedAt || null;

    const updatedReport = await db.updateQuestionReport(id, {
      status: newStatus,
      adminNotes:
        body.adminNotes !== undefined ? body.adminNotes : existingReport.adminNotes,
      resolvedAt,
      questionSnapshot: updatedSnapshot,
    });

    return NextResponse.json({
      success: true,
      report: updatedReport,
      questionUpdated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update question report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/reports/[id] - Delete a report ticket
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const success = await db.deleteQuestionReport(id);
  return NextResponse.json({ success });
}
