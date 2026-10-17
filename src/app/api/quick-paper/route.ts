import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { parseRawTextToExam, ExamPaperData, ExamSection, ExamQuestion } from "@/lib/quick-paper-parser";
import { getUrduTranslation } from "@/lib/urdu-translations";

const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-flash-latest"];

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function generateWithFallback(
  ai: GoogleGenAI,
  contents: any,
  config?: Record<string, any>
): Promise<string> {
  let lastError: Error | null = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${model} error:`, err?.message || err);
    }
  }
  throw lastError || new Error("Gemini API request failed");
}

/**
 * Normalizes any AI JSON response into a strict ExamPaperData structure
 * so both Urdu, English, and Bilingual modes render without missing fields.
 */
function normalizeExamPaperData(
  raw: any,
  fallbackLang: "Urdu" | "English" | "Bilingual" = "Bilingual"
): ExamPaperData {
  const sectionsRaw = Array.isArray(raw?.sections) ? raw.sections : [];
  const normalizedSections: ExamSection[] = sectionsRaw.map((sec: any, sIdx: number) => {
    const rawType = String(sec?.type || "short").toLowerCase();
    const type: ExamSection["type"] =
      rawType === "mcq" || rawType === "objective"
        ? "mcq"
        : rawType === "long" || rawType === "detailed"
        ? "long"
        : rawType === "poetry"
        ? "poetry"
        : rawType === "essay"
        ? "essay"
        : rawType === "letter"
        ? "letter"
        : "short";

    const defaultEnTitle =
      type === "mcq"
        ? "SECTION-I: MULTIPLE CHOICE QUESTIONS"
        : type === "long"
        ? "SECTION-III: DETAILED / LONG QUESTIONS"
        : "SECTION-II: SHORT QUESTIONS";
    const defaultUrTitle =
      type === "mcq"
        ? "حصہ اول: کثیر الانتخابی سوالات (MCQs)"
        : type === "long"
        ? "حصہ سوم: تفصیلی سوالات"
        : "حصہ دوم: مختصر سوالات";

    const titleEn = sec?.titleEn || sec?.title || defaultEnTitle;
    const titleUr = sec?.titleUr || sec?.urduTitle || (fallbackLang === "English" ? titleEn : defaultUrTitle);
    const instructionsEn = sec?.instructionsEn || sec?.instructions || "";
    const instructionsUr =
      sec?.instructionsUr || sec?.urduInstructions || (fallbackLang === "English" ? instructionsEn : "");

    const questionsRaw = Array.isArray(sec?.questions) ? sec.questions : [];
    const questions: ExamQuestion[] = questionsRaw.map((q: any, qIdx: number) => {
      const qEn = String(q?.questionEn || q?.textEn || q?.question || q?.questionUr || "").trim();
      const autoUr = qEn ? getUrduTranslation(qEn).text_ur : null;
      const qUr = String(q?.questionUr || q?.textUr || autoUr || qEn || "").trim();

      let options: ExamQuestion["options"] = undefined;
      if (Array.isArray(q?.options) && q.options.length > 0) {
        options = q.options.map((opt: any, oIdx: number) => {
          const defaultKey = ["A", "B", "C", "D"][oIdx] || String(oIdx + 1);
          if (typeof opt === "string") {
            return { key: defaultKey, textEn: opt, textUr: opt };
          }
          const tEn = String(opt?.textEn || opt?.text || opt?.textUr || "").trim();
          const tUr = String(opt?.textUr || opt?.text || opt?.textEn || "").trim();
          return {
            key: String(opt?.key || defaultKey),
            textEn: tEn,
            textUr: tUr,
          };
        });
      }

      return {
        number: Number(q?.number) || qIdx + 1,
        questionEn: qEn || qUr,
        questionUr: qUr || qEn,
        poetryLines: Array.isArray(q?.poetryLines) ? q.poetryLines : undefined,
        options,
        marks: Number(q?.marks) || (type === "mcq" ? 1 : type === "long" ? 5 : 2),
      };
    });

    const computedMarks =
      Number(sec?.marks) ||
      questions.reduce((acc, q) => acc + (q.marks || (type === "mcq" ? 1 : 2)), 0);

    return {
      id: sec?.id || `sec-${sIdx + 1}`,
      type,
      titleEn,
      titleUr,
      instructionsEn,
      instructionsUr,
      marks: computedMarks,
      questions,
    };
  });

  const totalMarks =
    Number(raw?.totalMarks) ||
    normalizedSections.reduce((acc, s) => acc + (s.marks || 0), 0) ||
    25;

  return {
    title: raw?.title || "EXAMINATION 2026-27",
    institutionName: raw?.institutionName || "SEEKACADEMY",
    subject: raw?.subject || "Computer Science / کمپیوٹر سائنس",
    grade: raw?.grade || "10th",
    timeAllowed: raw?.timeAllowed || "1:30 Hours",
    totalMarks,
    instructions:
      raw?.instructions ||
      "Attempt all questions carefully. Overwriting or cutting in MCQs is not allowed.",
    sections: normalizedSections,
    detectedLanguage: raw?.detectedLanguage || fallbackLang,
  };
}

/**
 * Converts structured ExamPaperData into clean editable raw text
 * so the left editor textarea stays synchronized with AI actions.
 */
function examDataToRawText(data: ExamPaperData, lang: "Urdu" | "English" | "Bilingual"): string {
  const lines: string[] = [];
  for (const sec of data.sections) {
    const headerTitle =
      lang === "Urdu"
        ? sec.titleUr || sec.titleEn
        : lang === "English"
        ? sec.titleEn || sec.titleUr
        : `${sec.titleEn || "SECTION"} / ${sec.titleUr || ""}`;
    lines.push(`${headerTitle} (Marks: ${sec.marks || 10})`);

    for (const q of sec.questions) {
      const qText =
        lang === "Urdu"
          ? q.questionUr || q.questionEn
          : lang === "English"
          ? q.questionEn || q.questionUr
          : q.questionEn && q.questionUr && q.questionEn !== q.questionUr
          ? `${q.questionEn} | ${q.questionUr}`
          : q.questionEn || q.questionUr;

      lines.push(`${q.number}. ${qText}`);

      if (q.options && q.options.length > 0) {
        const optLine = q.options
          .map((o) => {
            const oText =
              lang === "Urdu"
                ? o.textUr || o.textEn
                : lang === "English"
                ? o.textEn || o.textUr
                : o.textEn && o.textUr && o.textEn !== o.textUr
                ? `${o.textEn} (${o.textUr})`
                : o.textEn || o.textUr;
            return `(${o.key}) ${oText}`;
          })
          .join("   ");
        lines.push(optLine);
      }
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      text,
      topicPrompt,
      imageBase64,
      mimeType,
      targetLang = "Bilingual",
      mcqCount = 5,
      shortCount = 4,
      longCount = 2,
    } = body;

    const ai = getAiClient();

    // =========================================================================
    // 1. OCR IMAGE SCANNING
    // =========================================================================
    if (action === "ocr") {
      if (!imageBase64) {
        return NextResponse.json({ error: "Missing image data for OCR scan." }, { status: 400 });
      }

      if (!ai) {
        return NextResponse.json(
          { error: "Server Gemini API key not configured; switching to local OCR fallback." },
          { status: 503 }
        );
      }

      const prompt = `You are an expert OCR & examination digitizer for Pakistani Board (BISE Punjab, FBISE) and international school exam papers.
Extract all text from this exam paper image accurately:
- Retain all Urdu Nastaliq text and English text without typos.
- Retain question numbers, section headings (MCQs, Short Questions, Long Questions), options (A, B, C, D or الف, ب, ج, د), and marks.
- Convert any mathematical formulas into clean LaTeX (e.g. $x^2 + 2x = 0$).
Return clean, well-structured plain text of the examination paper.`;

      const extractedText = await generateWithFallback(ai, [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
              },
            },
          ],
        },
      ]);

      const structured = parseRawTextToExam(extractedText);
      return NextResponse.json({
        result: extractedText,
        paperData: structured,
      });
    }

    // =========================================================================
    // 2. TRANSLATE PAPER (URDU / ENGLISH / BILINGUAL)
    // =========================================================================
    if (action === "translate") {
      if (!text || !String(text).trim()) {
        return NextResponse.json({ error: "Please enter or paste exam text to translate." }, { status: 400 });
      }

      if (ai) {
        try {
          const prompt = `You are an expert Pakistani academic translator specializing in Punjab Board (BISE) and Federal Board (FBISE) examination papers.
Translate and structure the following exam paper into **${targetLang}** mode.
- Keep all mathematical formulas in LaTeX ($...$).
- Provide accurate academic English AND accurate Pakistani textbook Urdu (نستعلیق) for every section, question, and MCQ option so the user can switch between Urdu, English, and Bilingual seamlessly.

Input Exam Text:
${text}

Return strictly valid JSON matching this schema:
{
  "title": "EXAMINATION 2026-27",
  "subject": "Subject Name",
  "grade": "10th",
  "timeAllowed": "1:30 Hours",
  "totalMarks": 25,
  "detectedLanguage": "${targetLang}",
  "sections": [
    {
      "id": "sec-1",
      "type": "mcq",
      "titleEn": "SECTION-I: MULTIPLE CHOICE QUESTIONS",
      "titleUr": "حصہ اول: کثیر الانتخابی سوالات",
      "instructionsEn": "Choose the correct option.",
      "instructionsUr": "درست جواب کا انتخاب کریں۔",
      "marks": 5,
      "questions": [
        {
          "number": 1,
          "questionEn": "English question text",
          "questionUr": "اردو سوال کا متن",
          "options": [
            { "key": "A", "textEn": "Option A", "textUr": "آپشن اے" },
            { "key": "B", "textEn": "Option B", "textUr": "آپشن بی" },
            { "key": "C", "textEn": "Option C", "textUr": "آپشن سی" },
            { "key": "D", "textEn": "Option D", "textUr": "آپشن ڈی" }
          ],
          "marks": 1
        }
      ]
    }
  ]
}`;

          const jsonText = await generateWithFallback(ai, prompt, {
            responseMimeType: "application/json",
          });
          const cleanJson = (jsonText || "{}").replace(/^```json\s*/i, "").replace(/\s*```$/, "");
          const parsedJson = JSON.parse(cleanJson);
          const normalized = normalizeExamPaperData(parsedJson, targetLang);
          const syncedRawText = examDataToRawText(normalized, targetLang);

          return NextResponse.json({
            result: syncedRawText,
            paperData: normalized,
          });
        } catch (err) {
          console.warn("Gemini translate fallback to deterministic translator:", err);
        }
      }

      // Deterministic Fallback Translator if AI key is unavailable
      const parsed = parseRawTextToExam(text);
      parsed.detectedLanguage = targetLang;
      parsed.sections = parsed.sections.map((sec) => ({
        ...sec,
        titleEn:
          sec.titleEn ||
          (sec.type === "mcq" ? "SECTION-I: MULTIPLE CHOICE QUESTIONS" : "SECTION-II: SUBJECTIVE QUESTIONS"),
        titleUr:
          sec.titleUr ||
          (sec.type === "mcq" ? "حصہ اول: معروضی سوالات" : "حصہ دوم: مختصر اور تفصیلی سوالات"),
        questions: sec.questions.map((q) => {
          const baseText = q.questionEn || q.questionUr || "";
          const urLookup = getUrduTranslation(
            baseText,
            q.options?.map((o) => o.textEn || o.textUr)
          );
          return {
            ...q,
            questionEn: baseText,
            questionUr: urLookup.text_ur || q.questionUr || baseText,
            options: q.options?.map((o, idx) => ({
              key: o.key,
              textEn: o.textEn || o.textUr,
              textUr: urLookup.options_ur?.[idx] || o.textUr || o.textEn || "",
            })),
          };
        }),
      }));

      return NextResponse.json({
        result: examDataToRawText(parsed, targetLang),
        paperData: parsed,
      });
    }

    // =========================================================================
    // 3. AI FORMAT & STANDARDIZE RAW TEXT
    // =========================================================================
    if (action === "format_exam") {
      if (!text || !String(text).trim()) {
        return NextResponse.json({ error: "Please paste or write exam questions first." }, { status: 400 });
      }

      if (ai) {
        try {
          const prompt = `You are an expert Pakistani Board Examination Compiler (Punjab Boards BISE & Federal Board FBISE).
Organize and standardize the following raw exam text into structured sections (MCQs, Short Questions, Long Questions).
- Fix any spelling or formatting errors.
- Format mathematical equations in clean KaTeX/LaTeX ($...$).
- Provide BOTH English (questionEn, titleEn, textEn) and Urdu (questionUr, titleUr, textUr) fields for every item so the teacher can toggle between Urdu, English, and Bilingual modes seamlessly.

Raw Input Text:
${text}

Return strictly valid JSON matching this schema:
{
  "title": "EXAMINATION 2026-27",
  "subject": "Subject Name",
  "grade": "10th",
  "timeAllowed": "1:30 Hours",
  "totalMarks": 25,
  "instructions": "Attempt all sections carefully.",
  "sections": [
    {
      "id": "sec-1",
      "type": "mcq",
      "titleEn": "SECTION-I: MULTIPLE CHOICE QUESTIONS",
      "titleUr": "حصہ اول: کثیر الانتخابی سوالات",
      "instructionsEn": "Four possible answers A, B, C and D to each question are given. Fill the correct circle.",
      "instructionsUr": "ہر سوال کے چار ممکنہ جوابات دیے گئے ہیں، درست جواب کا انتخاب کریں۔",
      "marks": 5,
      "questions": [
        {
          "number": 1,
          "questionEn": "English question text here",
          "questionUr": "اردو سوال کا متن یہاں",
          "options": [
            { "key": "A", "textEn": "Option A", "textUr": "آپشن الف" },
            { "key": "B", "textEn": "Option B", "textUr": "آپشن ب" },
            { "key": "C", "textEn": "Option C", "textUr": "آپشن ج" },
            { "key": "D", "textEn": "Option D", "textUr": "آپشن د" }
          ],
          "marks": 1
        }
      ]
    },
    {
      "id": "sec-2",
      "type": "short",
      "titleEn": "SECTION-II: SHORT QUESTIONS",
      "titleUr": "حصہ دوم: مختصر سوالات",
      "instructionsEn": "Write short answers to the following questions.",
      "instructionsUr": "درج ذیل سوالات کے مختصر جوابات تحریر کریں۔",
      "marks": 10,
      "questions": [
        {
          "number": 1,
          "questionEn": "Short question in English",
          "questionUr": "مختصر سوال اردو میں",
          "marks": 2
        }
      ]
    },
    {
      "id": "sec-3",
      "type": "long",
      "titleEn": "SECTION-III: DETAILED / LONG QUESTIONS",
      "titleUr": "حصہ سوم: تفصیلی سوالات",
      "instructionsEn": "Answer the following questions in detail.",
      "instructionsUr": "درج ذیل سوالات کے تفصیلی جوابات تحریر کریں۔",
      "marks": 10,
      "questions": [
        {
          "number": 1,
          "questionEn": "Detailed question in English",
          "questionUr": "تفصیلی سوال اردو میں",
          "marks": 5
        }
      ]
    }
  ]
}`;

          const jsonText = await generateWithFallback(ai, prompt, {
            responseMimeType: "application/json",
          });
          const cleanJson = (jsonText || "{}").replace(/^```json\s*/i, "").replace(/\s*```$/, "");
          const parsedJson = JSON.parse(cleanJson);
          const normalized = normalizeExamPaperData(parsedJson, targetLang);

          return NextResponse.json({
            result: normalized,
            rawText: examDataToRawText(normalized, targetLang),
          });
        } catch (err) {
          console.warn("Gemini format_exam fallback to smart local parser:", err);
        }
      }

      const fallbackParsed = parseRawTextToExam(text);
      const normalizedFallback = normalizeExamPaperData(
        fallbackParsed,
        fallbackParsed.detectedLanguage || targetLang
      );
      return NextResponse.json({
        result: normalizedFallback,
        rawText: examDataToRawText(normalizedFallback, normalizedFallback.detectedLanguage || targetLang),
      });
    }

    // =========================================================================
    // 4. AI TOPIC / CHAPTER EXAM GENERATOR (NEW!)
    // =========================================================================
    if (action === "generate_topic") {
      if (!topicPrompt || !String(topicPrompt).trim()) {
        return NextResponse.json(
          { error: "Please enter a topic, subject, or chapter prompt to generate a paper." },
          { status: 400 }
        );
      }

      if (ai) {
        try {
          const prompt = `You are a senior Pakistani Board Paper Setter (Punjab Boards BISE Lahore/Gujranwala/Rawalpindi & Federal Board FBISE).
Create a complete, authentic examination paper for the following topic/syllabus request:
Topic / Request: "${topicPrompt}"
Language Mode: ${targetLang}
Requested Structure:
- ${mcqCount} Multiple Choice Questions (1 mark each, 4 options A/B/C/D)
- ${shortCount} Short Questions (2 marks each)
- ${longCount} Detailed / Long Questions (5 marks each)

Important Rules:
- Always populate BOTH English (questionEn, titleEn, textEn) AND authentic Pakistani textbook Urdu (questionUr, titleUr, textUr) for every section, question, and option.
- Use KaTeX/LaTeX ($...$) for any mathematical or chemical equations.

Return strictly valid JSON matching this schema:
{
  "title": "CHAPTER ASSESSMENT 2026-27",
  "subject": "Detected Subject Name",
  "grade": "10th",
  "timeAllowed": "1:30 Hours",
  "totalMarks": ${Number(mcqCount) * 1 + Number(shortCount) * 2 + Number(longCount) * 5},
  "detectedLanguage": "${targetLang}",
  "sections": [
    {
      "id": "sec-1",
      "type": "mcq",
      "titleEn": "SECTION-I: MULTIPLE CHOICE QUESTIONS",
      "titleUr": "حصہ اول: کثیر الانتخابی سوالات",
      "instructionsEn": "Choose the correct option for each question.",
      "instructionsUr": "ہر سوال کے درست جواب کا انتخاب کریں۔",
      "marks": ${Number(mcqCount) * 1},
      "questions": [
        {
          "number": 1,
          "questionEn": "...",
          "questionUr": "...",
          "options": [
            { "key": "A", "textEn": "...", "textUr": "..." },
            { "key": "B", "textEn": "...", "textUr": "..." },
            { "key": "C", "textEn": "...", "textUr": "..." },
            { "key": "D", "textEn": "...", "textUr": "..." }
          ],
          "marks": 1
        }
      ]
    },
    {
      "id": "sec-2",
      "type": "short",
      "titleEn": "SECTION-II: SHORT QUESTIONS",
      "titleUr": "حصہ دوم: مختصر سوالات",
      "instructionsEn": "Write short answers to the following questions.",
      "instructionsUr": "درج ذیل سوالات کے مختصر جوابات تحریر کریں۔",
      "marks": ${Number(shortCount) * 2},
      "questions": [
        {
          "number": 1,
          "questionEn": "...",
          "questionUr": "...",
          "marks": 2
        }
      ]
    },
    {
      "id": "sec-3",
      "type": "long",
      "titleEn": "SECTION-III: DETAILED QUESTIONS",
      "titleUr": "حصہ سوم: تفصیلی سوالات",
      "instructionsEn": "Attempt the following questions in detail.",
      "instructionsUr": "درج ذیل سوالات کے تفصیلی جوابات تحریر کریں۔",
      "marks": ${Number(longCount) * 5},
      "questions": [
        {
          "number": 1,
          "questionEn": "...",
          "questionUr": "...",
          "marks": 5
        }
      ]
    }
  ]
}`;

          const jsonText = await generateWithFallback(ai, prompt, {
            responseMimeType: "application/json",
          });
          const cleanJson = (jsonText || "{}").replace(/^```json\s*/i, "").replace(/\s*```$/, "");
          const parsedJson = JSON.parse(cleanJson);
          const normalized = normalizeExamPaperData(parsedJson, targetLang);

          return NextResponse.json({
            result: normalized,
            rawText: examDataToRawText(normalized, targetLang),
          });
        } catch (err) {
          console.warn("Gemini generate_topic fallback:", err);
        }
      }

      // Deterministic Fallback Topic Paper if Gemini key is unavailable
      const fallbackPaper: ExamPaperData = normalizeExamPaperData(
        {
          title: "CHAPTER ASSESSMENT 2026-27",
          subject: topicPrompt.slice(0, 35),
          grade: "10th",
          timeAllowed: "1:00 Hour",
          totalMarks: 23,
          detectedLanguage: targetLang,
          sections: [
            {
              id: "sec-1",
              type: "mcq",
              titleEn: "SECTION-I: MULTIPLE CHOICE QUESTIONS",
              titleUr: "حصہ اول: کثیر الانتخابی سوالات",
              marks: 5,
              questions: [
                {
                  number: 1,
                  questionEn: `Which of the following is the fundamental principle of ${topicPrompt}?`,
                  questionUr: `${topicPrompt} کا بنیادی اصول درج ذیل میں سے کون سا ہے؟`,
                  options: [
                    { key: "A", textEn: "Systematic Analysis", textUr: "منظم تجزیہ" },
                    { key: "B", textEn: "Random Estimation", textUr: "بے ترتیب اندازہ" },
                    { key: "C", textEn: "Manual Redundancy", textUr: "دستی تکرار" },
                    { key: "D", textEn: "None of these", textUr: "ان میں سے کوئی نہیں" },
                  ],
                  marks: 1,
                },
                {
                  number: 2,
                  questionEn: "Which step comes first in problem solving and algorithm design?",
                  questionUr: "مسئلہ حل کرنے اور الگورتھم ڈیزائن میں پہلا قدم کون سا ہے؟",
                  options: [
                    { key: "A", textEn: "Defining the Problem", textUr: "مسئلے کی تعریف" },
                    { key: "B", textEn: "Coding", textUr: "کوڈنگ" },
                    { key: "C", textEn: "Testing", textUr: "ٹیسٹنگ" },
                    { key: "D", textEn: "Documentation", textUr: "دستاویزات" },
                  ],
                  marks: 1,
                },
                {
                  number: 3,
                  questionEn: "A pictorial representation of an algorithm is called:",
                  questionUr: "الگورتھم کی تصویری نمائندگی کو کیا کہتے ہیں؟",
                  options: [
                    { key: "A", textEn: "Flowchart", textUr: "فلو چارٹ" },
                    { key: "B", textEn: "Pseudocode", textUr: "سوڈو کوڈ" },
                    { key: "C", textEn: "Compiler", textUr: "کمپائلر" },
                    { key: "D", textEn: "Matrix", textUr: "میٹرکس" },
                  ],
                  marks: 1,
                },
                {
                  number: 4,
                  questionEn: "Which symbol is used for decision making in a flowchart?",
                  questionUr: "فلو چارٹ میں فیصلہ سازی کے لیے کون سی علامت استعمال ہوتی ہے؟",
                  options: [
                    { key: "A", textEn: "Diamond", textUr: "ڈائمنڈ (ہیرا)" },
                    { key: "B", textEn: "Rectangle", textUr: "مستطیل" },
                    { key: "C", textEn: "Oval", textUr: "بیضوی" },
                    { key: "D", textEn: "Parallelogram", textUr: "متوازی الاضلاع" },
                  ],
                  marks: 1,
                },
                {
                  number: 5,
                  questionEn: "Verification ensures that the solution is:",
                  questionUr: "تصدیق (Verification) اس بات کو یقینی بناتی ہے کہ حل:",
                  options: [
                    { key: "A", textEn: "Correct according to requirements", textUr: "ضروریات کے مطابق درست ہے" },
                    { key: "B", textEn: "Syntax error", textUr: "سنٹیکس کی غلطی" },
                    { key: "C", textEn: "Infinite loop", textUr: "لامتناہی لوپ" },
                    { key: "D", textEn: "Obsolete", textUr: "متروک" },
                  ],
                  marks: 1,
                },
              ],
            },
            {
              id: "sec-2",
              type: "short",
              titleEn: "SECTION-II: SHORT QUESTIONS",
              titleUr: "حصہ دوم: مختصر سوالات",
              marks: 8,
              questions: [
                {
                  number: 1,
                  questionEn: `Define the core concept of ${topicPrompt} with one example.`,
                  questionUr: `${topicPrompt} کے بنیادی تصور کی ایک مثال کے ساتھ تعریف کریں۔`,
                  marks: 2,
                },
                {
                  number: 2,
                  questionEn: "Differentiate between verification and validation.",
                  questionUr: "تصدیق (Verification) اور توثیق (Validation) میں فرق واضح کریں۔",
                  marks: 2,
                },
                {
                  number: 3,
                  questionEn: "Why is trace table used in testing algorithms?",
                  questionUr: "الگورتھم کی جانچ میں ٹریس ٹیبل کیوں استعمال کیا جاتا ہے؟",
                  marks: 2,
                },
                {
                  number: 4,
                  questionEn: "Write down any two advantages of drawing a flowchart.",
                  questionUr: "فلو چارٹ بنانے کے کوئی سے دو فوائد تحریر کریں۔",
                  marks: 2,
                },
              ],
            },
            {
              id: "sec-3",
              type: "long",
              titleEn: "SECTION-III: DETAILED QUESTIONS",
              titleUr: "حصہ سوم: تفصیلی سوالات",
              marks: 10,
              questions: [
                {
                  number: 1,
                  questionEn: `Explain the main steps and applications of ${topicPrompt} in detail.`,
                  questionUr: `${topicPrompt} کے اہم مراحل اور اطلاقات کی تفصیل سے وضاحت کریں۔`,
                  marks: 5,
                },
                {
                  number: 2,
                  questionEn: "Discuss the standard symbols of a flowchart and draw an example.",
                  questionUr: "فلو چارٹ کی معیاری علامات پر بحث کریں اور ایک مثال بنائیں۔",
                  marks: 5,
                },
              ],
            },
          ],
        },
        targetLang
      );

      return NextResponse.json({
        result: fallbackPaper,
        rawText: examDataToRawText(fallbackPaper, targetLang),
      });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (error: any) {
    console.error("Quick paper API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process AI request." },
      { status: 500 }
    );
  }
}
