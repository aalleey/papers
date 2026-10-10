import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public / Teacher Paper Maker API: Fetches curriculum hierarchy and questions
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId") || searchParams.get("chapter_id") || undefined;
  const courseId = searchParams.get("courseId") || searchParams.get("course_id") || undefined;
  const subjectId = searchParams.get("subjectId") || searchParams.get("subject_id") || undefined;

  try {
    // 1. If subjectId or courseId is given, fetch chapters/topics
    const [boards, classes, courses, subjects, chapters, topics] = await Promise.all([
      db.getBoards(),
      db.getClasses(),
      db.getCourses(),
      db.getSubjects(courseId),
      db.getChapters(subjectId),
      db.getTopics(chapterId),
    ]);

    // 2. Fetch questions
    const questions = await db.getQuestions({
      chapterId,
      isActiveOnly: true,
      isAuthenticatedAdmin: true, // allow teacher generator read
    });

    return NextResponse.json({
      boards,
      classes,
      courses,
      subjects,
      chapters,
      topics,
      questions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load paper questions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
