import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient, getCurrentUser, isCurrentUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuestionReportCategory, QuestionType } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/reports - Fetch flagged questions queue & summary telemetry (Admin only)
export async function GET(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const category = searchParams.get("category") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const [reports, allReports] = await Promise.all([
      db.getQuestionReports({ status, category, search }),
      db.getQuestionReports(),
    ]);

    const stats = {
      total: allReports.length,
      open: allReports.filter((r) => r.status === "open").length,
      resolved: allReports.filter((r) => r.status === "resolved").length,
      dismissed: allReports.filter((r) => r.status === "dismissed").length,
      wrongAnswer: allReports.filter((r) => r.category === "wrong_answer" && r.status === "open").length,
      typo: allReports.filter((r) => r.category === "typo" && r.status === "open").length,
      urduTranslation: allReports.filter((r) => r.category === "urdu_translation" && r.status === "open").length,
      mathFormula: allReports.filter((r) => r.category === "math_formula" && r.status === "open").length,
    };

    return NextResponse.json({ reports, stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load question reports";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/reports - Submit a flagged question report from an educator or admin
export async function POST(req: NextRequest) {
  try {
    const [client, admin] = await Promise.all([getCurrentClient(), getCurrentUser()]);
    const body = await req.json();

    const {
      questionId,
      chapterId,
      subjectName,
      chapterTitle,
      questionType,
      questionSnapshot,
      category,
      description,
      suggestedFix,
      suggestedCorrectOption,
    } = body;

    if (!questionId || !category) {
      return NextResponse.json(
        { error: "Question ID and report category are required." },
        { status: 400 }
      );
    }

    const validCategories: QuestionReportCategory[] = [
      "typo",
      "wrong_answer",
      "urdu_translation",
      "math_formula",
      "wrong_marks",
      "other",
    ];
    const safeCategory: QuestionReportCategory = validCategories.includes(category)
      ? category
      : "other";

    const reporterName =
      client?.fullName || admin?.fullName || body.reporterName || "Registered Educator";
    const reporterEmail =
      client?.email || admin?.email || body.reporterEmail || null;
    const academyName =
      client?.academyName || (admin ? "Admin Console" : body.academyName || null);
    const reporterId = client?.id || admin?.id || null;

    const created = await db.createQuestionReport({
      questionId,
      chapterId: chapterId || null,
      subjectName: subjectName || null,
      chapterTitle: chapterTitle || null,
      questionType: (questionType as QuestionType) || "mcq",
      questionSnapshot: {
        textEn: questionSnapshot?.textEn || "Question text",
        textUr: questionSnapshot?.textUr || null,
        optionsEn: questionSnapshot?.optionsEn || null,
        optionsUr: questionSnapshot?.optionsUr || null,
        correctOption: questionSnapshot?.correctOption ?? null,
        answerEn: questionSnapshot?.answerEn || null,
        answerUr: questionSnapshot?.answerUr || null,
        marks: Number(questionSnapshot?.marks) || 1,
      },
      category: safeCategory,
      description:
        (description && String(description).trim()) ||
        `Flagged as ${safeCategory.replace("_", " ")} by educator`,
      suggestedFix: suggestedFix ? String(suggestedFix).trim() : null,
      suggestedCorrectOption:
        suggestedCorrectOption !== undefined && suggestedCorrectOption !== null
          ? Number(suggestedCorrectOption)
          : null,
      reporterId,
      reporterName,
      reporterEmail,
      academyName,
    });

    return NextResponse.json({ success: true, report: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit question report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
