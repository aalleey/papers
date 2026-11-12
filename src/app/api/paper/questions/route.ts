import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentClient, getCurrentUser } from "@/lib/auth";
import { isPaidSubscriber } from "@/lib/types";

export const dynamic = "force-dynamic";

// Teacher Paper Maker API: Fetches curriculum hierarchy and questions (Locked until registered with active paid subscription)
export async function GET(req: NextRequest) {
  const [clientUser, adminUser] = await Promise.all([
    getCurrentClient(),
    getCurrentUser(),
  ]);

  if (!clientUser && !adminUser) {
    return NextResponse.json(
      {
        error: "Authentication required. Only registered users with an active paid subscription are eligible to generate papers.",
        requireLogin: true,
      },
      { status: 401 }
    );
  }

  // Check if profile is on hold awaiting admin verification
  if (clientUser && !adminUser && (clientUser.subscription.status === "pending_verification" || clientUser.isVerified === false)) {
    return NextResponse.json(
      {
        error: "Your account is on hold pending payment verification. Please wait until admin approves your application.",
        pendingVerification: true,
      },
      { status: 403 }
    );
  }

  // Only registered users with an active paid subscription (or admins) are eligible to generate papers
  if (!isPaidSubscriber(clientUser, adminUser)) {
    return NextResponse.json(
      {
        error: "Paid subscription required. Only registered users with an active paid subscription are eligible to generate papers.",
        requireSubscription: true,
        currentPlan: clientUser?.subscription?.planId || "free",
        paperCredits: clientUser?.subscription?.paperCredits ?? 0,
      },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId") || searchParams.get("chapter_id") || undefined;
  const courseId = searchParams.get("courseId") || searchParams.get("course_id") || undefined;
  const subjectId = searchParams.get("subjectId") || searchParams.get("subject_id") || undefined;

  try {
    // 1. Fetch full curriculum hierarchy + scoped chapters/topics
    const [boards, classes, courses, rawSubjects, rawAllChapters, topics] = await Promise.all([
      db.getBoards(),
      db.getClasses(),
      db.getCourses(),
      db.getSubjects(courseId),
      db.getChapters(),
      db.getTopics(chapterId),
    ]);

    // Filter out legacy duplicate seed chapter (ea100000-0000-0000-0000-000000000008) that has 0 questions
    // when the active 2026-27 Computer Science subject (1def1b99-7726-55ec-8b98-17c3f3c85c6a) exists
    const hasNewCsSubject = rawSubjects.some(
      (s) => s.id === "1def1b99-7726-55ec-8b98-17c3f3c85c6a"
    );
    const subjects = hasNewCsSubject
      ? rawSubjects.filter((s) => s.id !== "da100000-0000-0000-0000-000000000004")
      : rawSubjects;
    const allChapters = hasNewCsSubject
      ? rawAllChapters.filter((c) => c.subject_id !== "da100000-0000-0000-0000-000000000004")
      : rawAllChapters;

    // Scope chapters to requested subjectId or chapterId's subject
    let chapters = subjectId
      ? allChapters.filter((c) => c.subject_id === subjectId)
      : allChapters;
    if (!subjectId && chapterId) {
      const activeCh = allChapters.find((c) => c.id === chapterId);
      if (activeCh) {
        chapters = allChapters.filter((c) => c.subject_id === activeCh.subject_id);
      }
    }

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
      allChapters,
      topics,
      questions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load paper questions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
