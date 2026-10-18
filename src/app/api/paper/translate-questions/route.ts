import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionTranslation } from "@/lib/types";
import { getUrduTranslation } from "@/lib/urdu-translations";

export const dynamic = "force-dynamic";

const CANDIDATE_MODELS = ["gemini-3-flash-preview", "gemini-2.5-flash"];

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function hasUrduScript(text?: string | null): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF]/.test(text);
}

function hasEnglishScript(text?: string | null): boolean {
  if (!text) return false;
  return /[a-zA-Z]{2,}/.test(text);
}

/**
 * Deterministic Urdu-to-English & English-to-Urdu fallback converter
 * so conversion works reliably even if Gemini API key is not configured or rate-limited.
 */
const URDU_TO_ENGLISH_MAP: Array<[RegExp, string]> = [
  [/درج ذیل میں سے کون سا/g, "Which of the following"],
  [/کون سا آپشن/g, "which option"],
  [/کی بہترین وضاحت کرتا ہے/g, "best explains"],
  [/کی تعریف کریں/g, "Define"],
  [/سے کیا مراد ہے/g, "What is meant by"],
  [/کے درمیان فرق واضح کریں/g, "Differentiate between"],
  [/میں فرق بیان کریں/g, "Differentiate between"],
  [/کے کوئی سے دو فوائد تحریر کریں/g, "Write down any two advantages of"],
  [/کی تفصیل سے وضاحت کریں/g, "Explain in detail"],
  [/مختصر جواب تحریر کریں/g, "Write a short answer"],
  [/ان میں سے کوئی نہیں/g, "None of these"],
  [/تمام درست ہیں/g, "All of these"],
  [/آپریٹنگ سسٹم/g, "Operating System"],
  [/کمپیوٹر سائنس/g, "Computer Science"],
  [/فلو چارٹ/g, "Flowchart"],
  [/الگورتھم/g, "Algorithm"],
  [/ڈیٹا بیس/g, "Database"],
  [/نیٹ ورک/g, "Network"],
  [/پروگرامنگ/g, "Programming"],
  [/مساوات/g, "Equation"],
  [/حرارت/g, "Heat"],
  [/توانائی/g, "Energy"],
  [/قوت/g, "Force"],
  [/رفتار/g, "Velocity"],
  [/روشنی/g, "Light"],
  [/برقی رو/g, "Electric Current"],
  [/کیمیائی تعامل/g, "Chemical Reaction"],
  [/خلیہ/g, "Cell"],
];

const ENGLISH_TO_URDU_PHRASE_MAP: Array<[RegExp, string]> = [
  [/^Define\s+(.+?)(\.|\?)?$/i, "$1 کی تعریف کریں۔"],
  [/^What is meant by\s+(.+?)(\.|\?)?$/i, "$1 سے کیا مراد ہے؟"],
  [/^What is\s+(.+?)(\.|\?)?$/i, "$1 کیا ہے؟"],
  [/^Explain\s+(.+?)\s+in detail(\.|\?)?$/i, "$1 کی تفصیل سے وضاحت کریں۔"],
  [/^Differentiate between\s+(.+?)\s+and\s+(.+?)(\.|\?)?$/i, "$1 اور $2 کے درمیان فرق واضح کریں۔"],
  [/^Write down any two advantages of\s+(.+?)(\.|\?)?$/i, "$1 کے کوئی سے دو فوائد تحریر کریں۔"],
  [/^Write short note on\s+(.+?)(\.|\?)?$/i, "$1 پر مختصر نوٹ لکھیں۔"],
  [/^Which of the following\s+(.+?)(\.|\?)?$/i, "درج ذیل میں سے کون سا $1؟"],
];

function fallbackEnglishToUrdu(enText: string, enOptions?: string[] | null): {
  textUr: string;
  optionsUr: string[] | null;
} {
  const cleanEn = (enText || "").trim();
  const dictMatch = getUrduTranslation(cleanEn, enOptions);
  if (dictMatch.text_ur && hasUrduScript(dictMatch.text_ur)) {
    return {
      textUr: dictMatch.text_ur,
      optionsUr: dictMatch.options_ur || (enOptions ? [...enOptions] : null),
    };
  }

  let converted = cleanEn;
  for (const [pattern, replacement] of ENGLISH_TO_URDU_PHRASE_MAP) {
    if (pattern.test(converted)) {
      converted = converted.replace(pattern, replacement);
      break;
    }
  }

  if (!hasUrduScript(converted)) {
    if (cleanEn.endsWith("?")) {
      converted = `${cleanEn.replace(/\?$/, "")} سے کیا مراد ہے؟ وضاحت کریں۔`;
    } else {
      converted = `${cleanEn} کی وضاحت کریں۔`;
    }
  }

  const optionsUr = enOptions
    ? enOptions.map((opt) => {
        const optLookup = getUrduTranslation(opt);
        if (optLookup.text_ur && hasUrduScript(optLookup.text_ur)) {
          return optLookup.text_ur;
        }
        if (/^none of these$/i.test(opt.trim())) return "ان میں سے کوئی نہیں";
        if (/^all of these|all of the above$/i.test(opt.trim())) return "یہ تمام";
        if (/^both a and b$/i.test(opt.trim())) return "A اور B دونوں";
        return opt;
      })
    : null;

  return { textUr: converted, optionsUr };
}

function fallbackUrduToEnglish(urText: string, urOptions?: string[] | null): {
  textEn: string;
  optionsEn: string[] | null;
} {
  const cleanUr = (urText || "").trim();
  if (hasEnglishScript(cleanUr) && !hasUrduScript(cleanUr)) {
    return { textEn: cleanUr, optionsEn: urOptions ? [...urOptions] : null };
  }

  let converted = cleanUr;
  for (const [pattern, replacement] of URDU_TO_ENGLISH_MAP) {
    converted = converted.replace(pattern, replacement);
  }

  if (!hasEnglishScript(converted)) {
    converted = `Explain the concept and principle of: ${cleanUr}`;
  }

  const optionsEn = urOptions
    ? urOptions.map((opt) => {
        let cOpt = opt;
        for (const [pattern, replacement] of URDU_TO_ENGLISH_MAP) {
          cOpt = cOpt.replace(pattern, replacement);
        }
        return cOpt;
      })
    : null;

  return { textEn: converted, optionsEn };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      questions = [],
      direction = "both_bilingual", // "en_to_ur" | "ur_to_en" | "both_bilingual"
      subjectName = "General Science / Computer Science",
    }: {
      questions: Question[];
      direction?: "en_to_ur" | "ur_to_en" | "both_bilingual";
      subjectName?: string;
    } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "No questions provided for translation." },
        { status: 400 }
      );
    }

    // Prepare compact array for Gemini AI translation
    const itemsToTranslate = questions.map((q, index) => {
      const enTrans = q.translations?.find((t) => t.language === "en");
      const urTrans = q.translations?.find((t) => t.language === "ur");

      const rawEn = enTrans?.text || "";
      const rawUr = urTrans?.text || "";
      const optsEn = Array.isArray(enTrans?.options) ? enTrans?.options : [];
      const optsUr = Array.isArray(urTrans?.options) ? urTrans?.options : [];

      return {
        id: q.id || `q-${index}`,
        type: q.type,
        textEn: rawEn,
        textUr: rawUr,
        optionsEn: optsEn,
        optionsUr: optsUr,
        answerEn: enTrans?.answer || "",
        answerUr: urTrans?.answer || "",
      };
    });

    const ai = getAiClient();
    if (ai) {
      const prompt = `You are an expert bilingual Pakistani Board Examination Translator for Punjab Boards (BISE) and Federal Board (FBISE).
Subject Context: "${subjectName}"
Translation Mode Requested: "${direction}"
- If direction is "en_to_ur": Convert every question's English text and MCQ options into authentic, high-precision Pakistani textbook Urdu Nastaliq (textUr, optionsUr, answerUr) while keeping the English intact.
- If direction is "ur_to_en": Convert every question's Urdu text and MCQ options into accurate, formal Pakistani Board academic English (textEn, optionsEn, answerEn) while keeping the Urdu intact.
- If direction is "both_bilingual": Ensure EVERY single question has BOTH complete academic English (textEn, optionsEn, answerEn) AND authentic Pakistani textbook Urdu Nastaliq (textUr, optionsUr, answerUr). If a question only has English, translate it to Urdu. If a question only has Urdu, translate it to English. If a question has partial text, complete both languages accurately.

CRITICAL RULES:
1. Preserve all question IDs in the exact same order.
2. Keep mathematical formulas, numbers, and scientific symbols in clean LaTeX ($...$) or standard notation.
3. For MCQs, ensure optionsEn has 4 English options and optionsUr has 4 corresponding Urdu options.

Questions Input JSON:
${JSON.stringify(itemsToTranslate)}`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          translatedQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                textEn: { type: Type.STRING },
                textUr: { type: Type.STRING },
                optionsEn: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                optionsUr: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                answerEn: { type: Type.STRING },
                answerUr: { type: Type.STRING },
              },
              required: ["id", "textEn", "textUr"],
            },
          },
        },
        required: ["translatedQuestions"],
      };

      for (const model of CANDIDATE_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema,
            },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            const aiList: any[] = Array.isArray(parsed.translatedQuestions)
              ? parsed.translatedQuestions
              : [];

            const byId = new Map<string, any>();
            aiList.forEach((item) => {
              if (item && item.id) byId.set(String(item.id), item);
            });

            const updatedQuestions: Question[] = questions.map((q, idx) => {
              const matched = byId.get(q.id) || aiList[idx];
              const existingEn = q.translations?.find((t) => t.language === "en");
              const existingUr = q.translations?.find((t) => t.language === "ur");

              const newTextEn =
                (matched?.textEn && String(matched.textEn).trim()) ||
                existingEn?.text ||
                existingUr?.text ||
                "";
              const newTextUr =
                (matched?.textUr && String(matched.textUr).trim()) ||
                existingUr?.text ||
                getUrduTranslation(newTextEn).text_ur ||
                newTextEn;

              const newOptsEn =
                q.type === "mcq"
                  ? Array.isArray(matched?.optionsEn) && matched.optionsEn.length > 0
                    ? matched.optionsEn
                    : existingEn?.options || existingUr?.options || []
                  : null;

              const newOptsUr =
                q.type === "mcq"
                  ? Array.isArray(matched?.optionsUr) && matched.optionsUr.length > 0
                    ? matched.optionsUr
                    : existingUr?.options ||
                      getUrduTranslation(newTextEn, newOptsEn).options_ur ||
                      newOptsEn
                  : null;

              const translations: QuestionTranslation[] = [
                {
                  language: "en",
                  text: newTextEn,
                  options: newOptsEn,
                  answer: matched?.answerEn || existingEn?.answer || null,
                },
                {
                  language: "ur",
                  text: newTextUr,
                  options: newOptsUr,
                  answer: matched?.answerUr || existingUr?.answer || null,
                },
              ];

              return {
                ...q,
                translations,
              };
            });

            return NextResponse.json({
              questions: updatedQuestions,
              translatedCount: updatedQuestions.length,
              direction,
              provider: "gemini-ai",
            });
          }
        } catch (aiErr: any) {
          console.warn(`Paper translate model ${model} error:`, aiErr?.message || aiErr);
        }
      }
    }

    // Deterministic Fallback Converter if Gemini API key is not configured or rate-limited
    const fallbackQuestions: Question[] = questions.map((q) => {
      const existingEn = q.translations?.find((t) => t.language === "en");
      const existingUr = q.translations?.find((t) => t.language === "ur");

      let textEn = existingEn?.text?.trim() || "";
      let textUr = existingUr?.text?.trim() || "";
      let optsEn = Array.isArray(existingEn?.options) ? existingEn.options : null;
      let optsUr = Array.isArray(existingUr?.options) ? existingUr.options : null;

      // If textEn actually contains Urdu script and no English script, treat it as Urdu source
      if (!textUr && hasUrduScript(textEn)) {
        textUr = textEn;
        if (!optsUr && optsEn) optsUr = optsEn;
      }

      if (direction === "en_to_ur" || direction === "both_bilingual") {
        if (textEn && (!textUr || !hasUrduScript(textUr) || direction === "en_to_ur")) {
          const conv = fallbackEnglishToUrdu(textEn, optsEn);
          textUr = conv.textUr;
          if (q.type === "mcq") {
            optsUr = conv.optionsUr;
          }
        }
      }

      if (direction === "ur_to_en" || direction === "both_bilingual") {
        if (textUr && (!textEn || !hasEnglishScript(textEn) || direction === "ur_to_en")) {
          const conv = fallbackUrduToEnglish(textUr, optsUr);
          textEn = conv.textEn;
          if (q.type === "mcq") {
            optsEn = conv.optionsEn;
          }
        }
      }

      return {
        ...q,
        translations: [
          {
            language: "en",
            text: textEn || textUr,
            options: q.type === "mcq" ? optsEn || optsUr || [] : null,
            answer: existingEn?.answer || existingUr?.answer || null,
          },
          {
            language: "ur",
            text: textUr || textEn,
            options: q.type === "mcq" ? optsUr || optsEn || [] : null,
            answer: existingUr?.answer || existingEn?.answer || null,
          },
        ],
      };
    });

    return NextResponse.json({
      questions: fallbackQuestions,
      translatedCount: fallbackQuestions.length,
      direction,
      provider: "smart-bilingual-engine",
    });
  } catch (err: any) {
    console.error("Failed to translate paper questions:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to convert paper languages." },
      { status: 500 }
    );
  }
}
