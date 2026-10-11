// src/app/api/admin/import-html/route.ts
import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { parseQuestionsHtml, ParsedQuestionItem } from "@/lib/html-question-parser";
import crypto from "crypto";

export const maxDuration = 60; // Allow sufficient time for batch imports

const uuid = (key: string) => {
  const h = crypto.createHash("sha1").update(`papermaker:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      htmlContent,
      action = "preview",
      courseId: requestedCourseId,
      subjectId: requestedSubjectId,
      chapterId: requestedChapterId,
      chapterNumber: requestedChapterNumber,
      chapterTitle: requestedChapterTitle,
      chapterTitleUr: requestedChapterTitleUr,
      selectedOriginalIds,
      skipDuplicates = true,
      createMissingTopics = true,
    } = body as {
      htmlContent: string;
      action: "preview" | "commit";
      courseId?: string;
      subjectId?: string;
      chapterId?: string;
      chapterNumber?: number;
      chapterTitle?: string;
      chapterTitleUr?: string;
      selectedOriginalIds?: string[];
      skipDuplicates?: boolean;
      createMissingTopics?: boolean;
    };

    if (!htmlContent || typeof htmlContent !== "string") {
      return NextResponse.json({ error: "Missing HTML content" }, { status: 400 });
    }

    // 1. Parse HTML
    const parseResult = parseQuestionsHtml(htmlContent);

    if (parseResult.questions.length === 0) {
      return NextResponse.json(
        { error: "No question cards found in the provided HTML file." },
        { status: 400 }
      );
    }

    // 2. Resolve Course, Subject, Chapter
    const allCourses = await db.getCourses();
    let course = requestedCourseId
      ? allCourses.find((c) => c.id === requestedCourseId)
      : allCourses.find((c) =>
          c.name.toLowerCase().includes("10th") ||
          c.name.toLowerCase().includes(parseResult.metadata.className.toLowerCase())
        ) || allCourses[0];

    const allSubjects = course ? await db.getSubjects(course.id) : [];
    let subject = requestedSubjectId
      ? allSubjects.find((s) => s.id === requestedSubjectId)
      : allSubjects.find((s) =>
          s.name.toLowerCase().includes("computer") ||
          parseResult.metadata.subjectName.toLowerCase().includes(s.name.toLowerCase())
        ) || allSubjects[0];

    const allChapters = subject ? await db.getChapters(subject.id) : [];
    const chNum = requestedChapterNumber ?? parseResult.metadata.chapterNumber ?? 1;

    let chapter = requestedChapterId && requestedChapterId !== "new"
      ? allChapters.find((c) => c.id === requestedChapterId)
      : allChapters.find((c) => c.number === chNum) || null;

    // Load existing questions for duplicate checking
    const existingSubjectQuestions = subject ? await db.getQuestions({ isAuthenticatedAdmin: true }) : [];
    const chapterExistingQuestions = chapter
      ? existingSubjectQuestions.filter((q) => q.chapter_id === chapter.id)
      : [];

    // Annotate questions with duplicate and Urdu enrichment flags
    const existingByEn = new Map<string, any>();
    const existingByUr = new Map<string, any>();
    const existingById = new Map<string, any>();

    for (const eq of chapterExistingQuestions) {
      const enT = eq.translations?.find((t: any) => t.language === "en");
      if (enT?.text) existingByEn.set(enT.text.trim().toLowerCase(), eq);

      const urT = eq.translations?.find((t: any) => t.language === "ur");
      if (urT?.text) existingByUr.set(urT.text.trim().toLowerCase(), eq);

      if (eq.source_note) {
        const m = eq.source_note.match(/(?:id|ID:?)\s*([A-Za-z0-9_\-]+)/);
        if (m) existingById.set(m[1], eq);
      }
    }

    const questionsWithDuplicates = parseResult.questions.map((q) => {
      let matched = existingById.get(q.original_id) || null;
      if (!matched && q.text_en) {
        matched = existingByEn.get(q.text_en.trim().toLowerCase()) || null;
      }
      if (!matched && q.text_ur) {
        matched = existingByUr.get(q.text_ur.trim().toLowerCase()) || null;
      }

      const isDup = Boolean(matched);
      const existingUrTrans = matched?.translations?.find((t: any) => t.language === "ur");
      const hasExistingUrdu = Boolean(existingUrTrans?.text?.trim());
      const willEnrichUrdu = Boolean(matched && !hasExistingUrdu && q.text_ur && q.text_ur.trim());

      return {
        ...q,
        isDuplicate: isDup,
        matchedExistingId: matched?.id || null,
        hasExistingUrdu,
        willEnrichUrdu,
      };
    });

    const duplicateCount = questionsWithDuplicates.filter((q) => q.isDuplicate).length;
    const enrichUrduCount = questionsWithDuplicates.filter((q) => q.willEnrichUrdu).length;

    // ------------------------------------------------------------------
    // ACTION: PREVIEW
    // ------------------------------------------------------------------
    if (action === "preview") {
      return NextResponse.json({
        success: true,
        metadata: parseResult.metadata,
        matchedCourse: course || null,
        matchedSubject: subject || null,
        matchedChapter: chapter || null,
        detectedChapterNumber: chNum,
        availableCourses: allCourses,
        availableSubjects: allSubjects,
        availableChapters: allChapters,
        questions: questionsWithDuplicates,
        stats: {
          ...parseResult.stats,
          duplicateCount,
          enrichUrduCount,
        },
      });
    }

    // ------------------------------------------------------------------
    // ACTION: COMMIT (Save to Question Bank)
    // ------------------------------------------------------------------
    if (!subject) {
      return NextResponse.json({ error: "Target Subject must be selected or created first." }, { status: 400 });
    }

    const adminClient = createAdminSupabaseClient();

    // 1. Ensure / Create Chapter
    const finalChTitle =
      requestedChapterTitle?.trim() ||
      parseResult.metadata.chapterTitle?.trim() ||
      `Chapter ${chNum}`;
    const finalChTitleUr =
      requestedChapterTitleUr?.trim() ||
      parseResult.metadata.chapterTitleUr?.trim() ||
      `یونٹ ${chNum}`;

    let targetChapterId = chapter?.id;

    if (!targetChapterId) {
      targetChapterId = uuid(`${subject.id}:chapter:${chNum}`);
      if (adminClient) {
        const { error: chErr } = await adminClient.from("chapters").upsert({
          id: targetChapterId,
          subject_id: subject.id,
          number: chNum,
          title: finalChTitle,
          title_ur: finalChTitleUr,
        });
        if (chErr) throw new Error(`Failed to create chapter: ${chErr.message}`);
      } else {
        await db.createChapter({
          subject_id: subject.id,
          number: chNum,
          title: finalChTitle,
          title_ur: finalChTitleUr,
        });
      }
    }

    // 2. Ensure / Create Topics
    const existingTopics = await db.getTopics(targetChapterId);
    const topicIdMap = new Map<number | string, string>(); // number or title -> topicId

    for (const top of existingTopics) {
      topicIdMap.set(top.number, top.id);
      topicIdMap.set(top.title.trim().toLowerCase(), top.id);
    }

    if (createMissingTopics && parseResult.metadata.topics.length > 0) {
      for (const tDef of parseResult.metadata.topics) {
        if (!topicIdMap.has(tDef.number) && !topicIdMap.has(tDef.title.trim().toLowerCase())) {
          const newTopicId = uuid(`${targetChapterId}:topic:${tDef.number}`);
          if (adminClient) {
            await adminClient.from("topics").upsert({
              id: newTopicId,
              chapter_id: targetChapterId,
              number: tDef.number,
              title: tDef.title,
              title_ur: tDef.title_ur || tDef.title,
            });
          } else {
            await db.createTopic({
              chapter_id: targetChapterId,
              number: tDef.number,
              title: tDef.title,
              title_ur: tDef.title_ur || tDef.title,
            });
          }
          topicIdMap.set(tDef.number, newTopicId);
          topicIdMap.set(tDef.title.trim().toLowerCase(), newTopicId);
        }
      }
    }

    // Refresh topics map
    const allCurrentTopics = await db.getTopics(targetChapterId);
    for (const top of allCurrentTopics) {
      topicIdMap.set(top.number, top.id);
      topicIdMap.set(top.title.trim().toLowerCase(), top.id);
    }

    // 3. Filter Questions to Import & Enrich
    const filterSet = selectedOriginalIds ? new Set(selectedOriginalIds) : null;
    const newQuestionsToCreate: typeof questionsWithDuplicates = [];
    const existingToEnrichUrdu: Array<{
      existingId: string;
      q: ParsedQuestionItem;
    }> = [];

    const seenNewKeys = new Set<string>();

    for (const q of questionsWithDuplicates) {
      if (filterSet && !filterSet.has(q.original_id)) continue;

      if (q.matchedExistingId) {
        // Question already exists in target chapter
        if (q.text_ur && q.text_ur.trim()) {
          existingToEnrichUrdu.push({ existingId: q.matchedExistingId, q });
        }
        if (!skipDuplicates) {
          const key = (q.text_en || q.text_ur).trim().toLowerCase();
          if (!seenNewKeys.has(key)) {
            seenNewKeys.add(key);
            newQuestionsToCreate.push(q);
          }
        }
      } else {
        // Brand new question
        const key = (q.text_en || q.text_ur).trim().toLowerCase();
        if (!seenNewKeys.has(key)) {
          seenNewKeys.add(key);
          newQuestionsToCreate.push(q);
        }
      }
    }

    // 4. Prepare Question and Translation Payloads
    const questionRows: Array<{
      id: string;
      chapter_id: string;
      topic_id: string | null;
      type: "mcq" | "short" | "long";
      source: "exercise" | "past_paper" | "extra";
      source_ref: string | null;
      concept_tag: string | null;
      correct_option: number | null;
      marks: number;
      difficulty: "easy" | "medium" | "hard";
      is_active: boolean;
      source_note: string | null;
    }> = [];

    const translationRows: Array<{
      id: string;
      question_id: string;
      language: "en" | "ur";
      text: string;
      options: string | null;
      answer: string | null;
    }> = [];

    for (const q of newQuestionsToCreate) {
      const qId = q.matchedExistingId || uuid(`question:${q.original_id}`);
      let assignedTopicId: string | null = null;

      if (q.topic_number && topicIdMap.has(q.topic_number)) {
        assignedTopicId = topicIdMap.get(q.topic_number)!;
      } else if (q.topic_title && topicIdMap.has(q.topic_title.trim().toLowerCase())) {
        assignedTopicId = topicIdMap.get(q.topic_title.trim().toLowerCase())!;
      }

      questionRows.push({
        id: qId,
        chapter_id: targetChapterId,
        topic_id: assignedTopicId,
        type: q.type,
        source: q.source,
        source_ref: q.source_ref || null,
        concept_tag: q.concept_tag || null,
        correct_option: q.type === "mcq" ? q.correct_option || 1 : null,
        marks: q.marks,
        difficulty: q.difficulty || "medium",
        is_active: true,
        source_note: `HTML Parser Import (ID: ${q.original_id})`,
      });

      // English Translation
      if (q.text_en && q.text_en.trim()) {
        translationRows.push({
          id: uuid(`${qId}:trans:en`),
          question_id: qId,
          language: "en",
          text: q.text_en,
          options: q.type === "mcq" && q.options_en ? JSON.stringify(q.options_en) : null,
          answer: null,
        });
      }

      // Urdu Translation (if available)
      if (q.text_ur && q.text_ur.trim()) {
        translationRows.push({
          id: uuid(`${qId}:trans:ur`),
          question_id: qId,
          language: "ur",
          text: q.text_ur,
          options:
            q.type === "mcq"
              ? JSON.stringify(q.options_ur || q.options_en || [])
              : null,
          answer: null,
        });
      }
    }

    // Attach Urdu translations for existing questions
    for (const item of existingToEnrichUrdu) {
      const q = item.q;
      const targetQId = item.existingId;

      translationRows.push({
        id: uuid(`${targetQId}:trans:ur`),
        question_id: targetQId,
        language: "ur",
        text: q.text_ur,
        options:
          q.type === "mcq"
            ? JSON.stringify(q.options_ur || q.options_en || [])
            : null,
        answer: null,
      });
    }

    // 5. Batch Upsert to Supabase
    if (adminClient) {
      // Upsert questions in chunks of 50
      for (let i = 0; i < questionRows.length; i += 50) {
        const chunk = questionRows.slice(i, i + 50);
        const { error: qErr } = await adminClient.from("questions").upsert(chunk);
        if (qErr) throw new Error(`Questions upsert failed at batch ${i}: ${qErr.message}`);
      }

      // Upsert translations in chunks of 50
      for (let i = 0; i < translationRows.length; i += 50) {
        const chunk = translationRows.slice(i, i + 50);
        const { error: tErr } = await adminClient.from("question_translations").upsert(chunk);
        if (tErr) throw new Error(`Translations upsert failed at batch ${i}: ${tErr.message}`);
      }
    } else {
      // Fallback local mock store
      for (let i = 0; i < questionRows.length; i++) {
        const qRow = questionRows[i];
        const trans = translationRows
          .filter((t) => t.question_id === qRow.id)
          .map((t) => ({
            language: t.language,
            text: t.text,
            options: t.options ? JSON.parse(t.options) : null,
            answer: t.answer,
          }));

        await db.saveQuestion({
          id: qRow.id,
          chapter_id: qRow.chapter_id,
          topic_id: qRow.topic_id,
          type: qRow.type,
          source: qRow.source,
          source_ref: qRow.source_ref,
          concept_tag: qRow.concept_tag,
          correct_option: qRow.correct_option,
          marks: qRow.marks,
          difficulty: qRow.difficulty,
          is_active: qRow.is_active,
          source_note: qRow.source_note,
          translations: trans,
        });
      }

      for (const item of existingToEnrichUrdu) {
        const q = item.q;
        const targetQId = item.existingId;
        const existingQ = chapterExistingQuestions.find((eq: any) => eq.id === targetQId);
        if (existingQ) {
          const trans = (existingQ.translations || []).filter((t: any) => t.language !== "ur");
          trans.push({
            language: "ur",
            text: q.text_ur,
            options: q.type === "mcq" ? q.options_ur || q.options_en || null : null,
            answer: null,
          });
          await db.saveQuestion({
            ...existingQ,
            translations: trans,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      chapterId: targetChapterId,
      chapterNumber: chNum,
      chapterTitle: finalChTitle,
      importedCount: newQuestionsToCreate.length,
      enrichedUrduCount: existingToEnrichUrdu.length,
      skippedDuplicates:
        parseResult.questions.length - newQuestionsToCreate.length - existingToEnrichUrdu.length,
      totalParsed: parseResult.questions.length,
      mcqCount: parseResult.questions.filter((q) => q.type === "mcq").length,
      shortCount: parseResult.questions.filter((q) => q.type === "short").length,
      longCount: parseResult.questions.filter((q) => q.type === "long").length,
    });
  } catch (err: unknown) {
    console.error("HTML Import error:", err);
    const msg = err instanceof Error ? err.message : "Internal error importing HTML questions";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
