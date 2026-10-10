import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuestionSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // STRICT RLS RULE: Questions and translations are NOT publicly readable!
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized. Questions are not publicly readable." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId") || undefined;
  const topicId = searchParams.get("topicId") || undefined;
  const type = searchParams.get("type") || undefined;
  const difficulty = searchParams.get("difficulty") || undefined;
  const source = searchParams.get("source") || undefined;
  const search = searchParams.get("search") || undefined;

  const questions = await db.getQuestions({
    chapterId,
    topicId,
    type,
    difficulty,
    source,
    search,
    isAuthenticatedAdmin: true,
  });

  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = QuestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const translations: {
      language: "en" | "ur";
      text: string;
      options?: string[] | null;
      answer?: string | null;
    }[] = [
      {
        language: "en",
        text: data.text_en,
        options: data.type === "mcq" ? data.options_en || null : null,
        answer: data.answer_en || null,
      },
    ];

    if (data.text_ur && data.text_ur.trim()) {
      translations.push({
        language: "ur",
        text: data.text_ur,
        options: data.type === "mcq" ? data.options_ur || data.options_en || null : null,
        answer: data.answer_ur || data.answer_en || null,
      });
    }

    const saved = await db.saveQuestion({
      id: data.id,
      chapter_id: data.chapter_id,
      topic_id: data.topic_id || null,
      type: data.type,
      source: data.source,
      source_ref: data.source_ref || null,
      concept_tag: data.concept_tag || null,
      correct_option: data.type === "mcq" ? data.correct_option || null : null,
      marks: data.marks,
      difficulty: data.difficulty,
      is_active: data.is_active,
      source_note: data.source_note || null,
      translations,
    });

    return NextResponse.json({ success: true, question: saved });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error saving question";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
