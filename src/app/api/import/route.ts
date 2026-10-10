import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { CsvRowRawSchema } from "@/lib/validations";
import { CsvImportRow, CsvRowValidationResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin role required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { subjectId, rows, action } = body as {
      subjectId: string;
      rows: Record<string, unknown>[];
      action: "preview" | "commit";
    };

    if (!subjectId) {
      return NextResponse.json({ error: "Please select a target subject" }, { status: 400 });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided for import" }, { status: 400 });
    }

    // Load available chapters for the subject
    const chapters = await db.getChapters(subjectId);
    const existingQuestions = await thisSubjectQuestions(subjectId);

    const validationResults: CsvRowValidationResult[] = [];
    const validRowsToCommit: CsvImportRow[] = [];

    rows.forEach((rawRow, idx) => {
      const rowNumber = idx + 1;
      const errors: string[] = [];

      // Validate schema
      const parseResult = CsvRowRawSchema.safeParse(rawRow);
      if (!parseResult.success) {
        const zodIssues = parseResult.error.issues.map((iss) => `${iss.path.join(".")}: ${iss.message}`);
        errors.push(...zodIssues);
      }

      const parsedData = parseResult.success ? parseResult.data : (rawRow as unknown as Partial<CsvImportRow>);

      // Validate chapter exists
      const chapterNum = Number(rawRow.chapter_number);
      const chapter = chapters.find((c) => c.number === chapterNum);
      if (!chapter) {
        errors.push(`Chapter number ${chapterNum} does not exist in this subject`);
      }

      // Check MCQ requirements
      if (parsedData.type === "mcq") {
        if (!rawRow.option_a || !rawRow.option_b || !rawRow.option_c || !rawRow.option_d) {
          errors.push("MCQ requires all 4 options (option_a, option_b, option_c, option_d)");
        }
        const correctOpt = Number(rawRow.correct_option);
        if (!correctOpt || correctOpt < 1 || correctOpt > 4) {
          errors.push("MCQ requires valid correct_option between 1 and 4");
        }
      }

      // Duplicate check: same chapter + same English text
      let isDuplicate = false;
      if (chapter && parsedData.text_en) {
        isDuplicate = existingQuestions.some((eq) => {
          if (eq.chapter_id !== chapter.id) return false;
          const en = eq.translations?.find((t) => t.language === "en");
          return en?.text.trim().toLowerCase() === String(parsedData.text_en).trim().toLowerCase();
        });
        if (isDuplicate) {
          // Flag as duplicate
          errors.push("Duplicate detected: Question with identical text exists in this chapter (will be skipped)");
        }
      }

      const isValid = errors.length === 0 || (isDuplicate && errors.length === 1);

      validationResults.push({
        rowNumber,
        data: rawRow as Partial<CsvImportRow>,
        errors,
        isDuplicate,
        isValid: errors.length === 0,
      });

      if (errors.length === 0 && !isDuplicate && parseResult.success) {
        validRowsToCommit.push(parseResult.data as CsvImportRow);
      }
    });

    if (action === "preview") {
      return NextResponse.json({
        validationResults,
        totalRows: rows.length,
        validCount: validRowsToCommit.length,
        invalidCount: validationResults.filter((r) => r.errors.length > 0 && !r.isDuplicate).length,
        duplicateCount: validationResults.filter((r) => r.isDuplicate).length,
      });
    }

    // Action === "commit"
    const importStats = await db.importCsvQuestions(subjectId, validRowsToCommit);

    return NextResponse.json({
      success: true,
      importedCount: importStats.importedCount,
      skippedDuplicates: importStats.skippedDuplicates,
      errors: importStats.errors,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error processing CSV";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

async function thisSubjectQuestions(subjectId: string) {
  const chapters = await db.getChapters(subjectId);
  const chapterIds = new Set(chapters.map((c) => c.id));
  const allQ = await db.getQuestions({ isAuthenticatedAdmin: true });
  return allQ.filter((q) => chapterIds.has(q.chapter_id));
}
