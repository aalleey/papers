import { NextRequest, NextResponse } from "next/server";
import { isCurrentUserAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SEED_QUESTIONS } from "@/lib/seed-data";
import { Question, QuestionTranslation } from "@/lib/types";

export const dynamic = "force-dynamic";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-3-flash-preview", "gemini-2.0-flash"];

interface PromptQuestionItem {
  id: string;
  type: "short" | "long";
  marks: number;
  textEn: string;
  textUr?: string;
}

interface GeneratedAnswerItem {
  id: string;
  textUr?: string;
  answerEn: string;
  answerUr: string;
}

async function callGeminiForAnswers(
  items: PromptQuestionItem[],
  contextLabel: string
): Promise<GeneratedAnswerItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add GEMINI_API_KEY to your .env.local or Vercel environment variables to generate AI answers."
    );
  }

  const systemInstruction = `You are a senior Pakistani Board (Punjab BISE & Federal Board FBISE) subject specialist preparing official chapter-wise solved study notes for Matric (9th/10th) and Intermediate (FSc/ICS) students.

Rules for every answer:
1. Accuracy: Give textbook-accurate, board-marking-scheme answers (${contextLabel || "Pakistan Board 2026-27 Syllabus"}).
2. Short Questions (2 marks): Write a concise, high-scoring 2 to 4 sentence definition/explanation. If the question asks for an example, rule, difference, or code/formula, include a clear compact example.
3. Long Questions (4 to 8 marks): Write a structured, comprehensive answer with clear sub-points or numbered steps suitable for full board marks.
4. Math & Code: Wrap mathematical expressions in inline LaTeX $...$ (for KaTeX). Keep programming code (e.g. Python/C) clean and accurate.
5. Bilingual Output: Return "answerEn" (clear academic English), "answerUr" (natural, accurate Pakistani textbook Urdu Nastaliq; keep code identifiers and $...$ math formulas in English/LTR inside Urdu), and "textUr" (accurate Urdu Nastaliq translation of the question itself if textUr was missing).
6. Return strict JSON matching the requested schema with the exact "id" for each item.`;

  const userPrompt = JSON.stringify({
    context: contextLabel,
    questions: items,
  });

  const bodyPayload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.25,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          answers: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                textUr: { type: "STRING" },
                answerEn: { type: "STRING" },
                answerUr: { type: "STRING" },
              },
              required: ["id", "textUr", "answerEn", "answerUr"],
            },
          },
        },
        required: ["answers"],
      },
    },
  };

  let lastError = "Gemini request failed";
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = `${model} returned ${res.status}: ${errText.slice(0, 200)}`;
        continue;
      }

      const data = await res.json();
      const rawText: string | undefined =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastError = `${model} returned empty content`;
        continue;
      }

      const parsed = JSON.parse(rawText) as { answers?: GeneratedAnswerItem[] };
      if (Array.isArray(parsed.answers) && parsed.answers.length > 0) {
        return parsed.answers;
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(lastError);
}

async function findQuestionWithSeedFallback(id: string): Promise<Question | null> {
  const fromDb = await db.getQuestionById(id);
  if (fromDb) return fromDb;

  const fromSeed = SEED_QUESTIONS.find((q) => q.id === id);
  if (!fromSeed) return null;

  return {
    id: fromSeed.id,
    chapter_id: fromSeed.chapter_id,
    topic_id: fromSeed.topic_id || null,
    type: fromSeed.type,
    source: fromSeed.source,
    source_ref: fromSeed.source_ref || null,
    concept_tag: fromSeed.concept_tag || null,
    correct_option: fromSeed.correct_option ?? null,
    marks: fromSeed.marks,
    difficulty: fromSeed.difficulty,
    is_active: fromSeed.is_active,
    source_note: fromSeed.source_note || null,
    translations: fromSeed.translations.map((t) => ({
      language: t.language,
      text: t.text,
      options: t.options ?? null,
      answer: t.answer ?? null,
    })),
  };
}

export async function POST(req: NextRequest) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const mode: string = body?.mode || "batch";
    const contextLabel = [body?.className, body?.subjectName, body?.chapterTitle]
      .filter(Boolean)
      .join(" — ");

    // 1. Single preview mode (inside QuestionFormModal before saving)
    if (mode === "preview") {
      const textEn = String(body?.textEn || "").trim();
      const textUr = String(body?.textUr || "").trim();
      const qType: "short" | "long" = body?.type === "long" ? "long" : "short";
      const marks = Number(body?.marks) || (qType === "long" ? 5 : 2);

      if (!textEn && !textUr) {
        return NextResponse.json(
          { error: "Enter the question statement first." },
          { status: 400 }
        );
      }

      const generated = await callGeminiForAnswers(
        [
          {
            id: "preview-1",
            type: qType,
            marks,
            textEn: textEn || textUr,
            textUr: textUr || undefined,
          },
        ],
        contextLabel
      );

      const first = generated[0];
      return NextResponse.json({
        textUr: first?.textUr || "",
        answerEn: first?.answerEn || "",
        answerUr: first?.answerUr || "",
      });
    }

    // 2. Batch database save mode (from Admin Questions table / toolbar)
    const rawIds: string[] = Array.isArray(body?.questionIds) ? body.questionIds : [];
    const overwrite = Boolean(body?.overwrite);
    const ids = rawIds.slice(0, 12); // Cap per HTTP call so serverless timeouts never trigger

    if (ids.length === 0) {
      return NextResponse.json({ error: "No questionIds provided." }, { status: 400 });
    }

    const loadedQuestions: Question[] = [];
    for (const id of ids) {
      const q = await findQuestionWithSeedFallback(id);
      if (!q || q.type === "mcq") continue;

      if (!overwrite) {
        const enAns = q.translations?.find((t) => t.language === "en")?.answer?.trim();
        const urAns = q.translations?.find((t) => t.language === "ur")?.answer?.trim();
        if (enAns && urAns) continue;
      }
      loadedQuestions.push(q);
    }

    if (loadedQuestions.length === 0) {
      return NextResponse.json({ updatedQuestions: [], updatedCount: 0 });
    }

    const promptItems: PromptQuestionItem[] = loadedQuestions.map((q) => {
      const en = q.translations?.find((t) => t.language === "en");
      const ur = q.translations?.find((t) => t.language === "ur");
      return {
        id: q.id,
        type: q.type === "long" ? "long" : "short",
        marks: q.marks || (q.type === "long" ? 5 : 2),
        textEn: en?.text || ur?.text || "",
        textUr: ur?.text || undefined,
      };
    });

    const aiResults = await callGeminiForAnswers(promptItems, contextLabel);
    const resultById = new Map(aiResults.map((r) => [r.id, r]));

    const updatedQuestions: Question[] = [];

    for (const q of loadedQuestions) {
      const gen = resultById.get(q.id);
      if (!gen) continue;

      const enExisting = q.translations?.find((t) => t.language === "en");
      const urExisting = q.translations?.find((t) => t.language === "ur");

      const nextTranslations: QuestionTranslation[] = [];

      if (enExisting) {
        nextTranslations.push({
          ...enExisting,
          answer:
            !overwrite && enExisting.answer?.trim()
              ? enExisting.answer
              : gen.answerEn.trim(),
        });
      } else if (gen.answerEn.trim()) {
        nextTranslations.push({
          language: "en",
          text: urExisting?.text || "",
          options: null,
          answer: gen.answerEn.trim(),
        });
      }

      if (urExisting) {
        nextTranslations.push({
          ...urExisting,
          answer:
            !overwrite && urExisting.answer?.trim()
              ? urExisting.answer
              : gen.answerUr.trim(),
        });
      } else if (gen.answerUr.trim() && gen.textUr?.trim()) {
        nextTranslations.push({
          language: "ur",
          text: gen.textUr.trim(),
          options: null,
          answer: gen.answerUr.trim(),
        });
      }

      const saved = await db.saveQuestion({
        id: q.id,
        chapter_id: q.chapter_id,
        topic_id: q.topic_id || null,
        type: q.type,
        source: q.source,
        source_ref: q.source_ref || null,
        concept_tag: q.concept_tag || null,
        correct_option: q.correct_option ?? null,
        marks: q.marks,
        difficulty: q.difficulty,
        is_active: q.is_active,
        source_note: q.source_note || null,
        translations: nextTranslations,
      });

      updatedQuestions.push(saved);
    }

    return NextResponse.json({
      updatedQuestions,
      updatedCount: updatedQuestions.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate answers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
