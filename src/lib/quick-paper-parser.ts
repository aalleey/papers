export interface ExamQuestion {
  number: number;
  customNumber?: string;
  questionUr: string;
  questionEn?: string;
  poetryLines?: string[];
  options?: { key: string; textUr: string; textEn?: string }[];
  marks?: number;
}

export interface ExamSection {
  id: string;
  type: "mcq" | "poetry" | "short" | "long" | "essay" | "letter" | "general";
  questionNumber?: string;
  titleUr: string;
  titleEn?: string;
  instructionsUr?: string;
  instructionsEn?: string;
  marks?: number;
  questions: ExamQuestion[];
}

export interface ExamPaperData {
  title: string;
  institutionName: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  totalMarks: number;
  date?: string;
  paperCode?: string;
  instructions?: string;
  sections: ExamSection[];
  detectedLanguage?: "Urdu" | "English" | "Bilingual";
}

export function cleanUrduText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*{1,3}/g, "") // strip markdown asterisks
    .replace(/[`_]/g, "")
    .replace(/[✓✔√]/g, "") // strip checkmarks
    .trim();
}

export function normalizeOptionKey(rawKey: string, index: number): string {
  const k = rawKey.trim().toUpperCase();
  if (k === "A" || k === "1" || k === "I" || k === "الف") return "A";
  if (k === "B" || k === "2" || k === "II" || k === "ب") return "B";
  if (k === "C" || k === "3" || k === "III" || k === "ج") return "C";
  if (k === "D" || k === "4" || k === "IV" || k === "د") return "D";
  return ["A", "B", "C", "D"][index] || "A";
}

export function getUrduOptionLabel(key: string, index: number = 0): string {
  const k = normalizeOptionKey(key, index);
  if (k === "A") return "الف";
  if (k === "B") return "ب";
  if (k === "C") return "ج";
  if (k === "D") return "د";
  return key;
}

export function hasUrduScript(text?: string): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF]/.test(text);
}

export function isPureUrduText(text?: string): boolean {
  if (!text) return false;
  const cleaned = text.replace(/\\[a-zA-Z]+/g, ""); // ignore LaTeX commands
  return /[\u0600-\u06FF]/.test(cleaned) && !/[A-Za-z]{3,}/.test(cleaned);
}

/**
 * Splits a bilingual option string such as "Diamond (ڈائمنڈ)" or "Diamond | ڈائمنڈ"
 * into clean English and Urdu parts.
 */
export function splitBilingualOptionText(rawOpt: string): { textEn: string; textUr: string } {
  const cleaned = rawOpt.trim().replace(/[-–—]+$/, "").trim();
  if (!cleaned) return { textEn: "", textUr: "" };

  // 1. Explicit pipe separator: "Diamond | ڈائمنڈ"
  if (cleaned.includes("|")) {
    const parts = cleaned
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return { textEn: parts[0], textUr: parts[1] };
    }
  }

  // 2. Parenthesized Urdu translation at end: "Diamond (ڈائمنڈ)"
  const parenMatch = cleaned.match(/^(.+?)\s*\(([^()]*[\u0600-\u06FF][^()]*)\)\s*$/);
  if (parenMatch && /[A-Za-z0-9]/.test(parenMatch[1])) {
    return {
      textEn: parenMatch[1].trim(),
      textUr: parenMatch[2].trim(),
    };
  }

  return { textEn: cleaned, textUr: cleaned };
}

/**
 * Extracts inline MCQ options from a single line in English, Urdu, or Bilingual format.
 * Supports:
 *   "(الف) وہ   (ب) جا   (ج) رہا ہے   (د) ہے"
 *   "(A) Diamond (ڈائمنڈ)   (B) Rectangle (مستطیل)   (C) Oval (بیضوی)   (D) Parallelogram (متوازی الاضلاع)"
 *   "A) First   B) Second   C) Third   D) Fourth"
 */
export function extractInlineOptionsFromLine(line: string): {
  stemPrefix: string;
  options: { key: string; textUr: string; textEn: string }[];
} | null {
  const markerRegex =
    /(?:^|\s)(?:[(\[]\s*([A-Da-d1-4]|الف|ب|ج|د)\s*[)\]][\.\:۔\-]?|([A-Da-d]|الف|ب|ج|د)\s*[)\]]|(?:^|\s{2,})([A-Da-d]|الف|ب|ج|د)\s*[\.\:۔\-])\s*/g;

  const matches: { rawKey: string; markerStart: number; contentStart: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = markerRegex.exec(line)) !== null) {
    const rawKey = (m[1] || m[2] || m[3] || "").trim();
    if (!rawKey) continue;
    matches.push({
      rawKey,
      markerStart: m.index,
      contentStart: m.index + m[0].length,
    });
  }

  if (matches.length < 2) return null;

  const stemPrefix = line.slice(0, matches[0].markerStart).trim();
  const options: { key: string; textUr: string; textEn: string }[] = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].contentStart;
    const end = i + 1 < matches.length ? matches[i + 1].markerStart : line.length;
    const rawSlice = line.slice(start, end).trim();
    const { textEn, textUr } = splitBilingualOptionText(rawSlice);
    options.push({
      key: normalizeOptionKey(matches[i].rawKey, i),
      textEn,
      textUr,
    });
  }

  return options.length >= 2 ? { stemPrefix, options } : null;
}

/**
 * Serializes structured ExamPaperData back into clean raw text for the live editor.
 */
export function serializeExamDataToRawText(
  data: ExamPaperData,
  langMode: "Urdu" | "English" | "Bilingual" = "Bilingual"
): string {
  const lines: string[] = [];

  for (const sec of data.sections) {
    const secHeader =
      langMode === "Urdu"
        ? sec.titleUr || sec.titleEn || "حصہ سوالات"
        : langMode === "English"
        ? sec.titleEn || sec.titleUr || "SECTION"
        : sec.titleEn && sec.titleUr && sec.titleEn !== sec.titleUr
        ? `${sec.titleEn} / ${sec.titleUr}`
        : sec.titleEn || sec.titleUr || "SECTION";

    lines.push(`${secHeader}${sec.marks ? ` (Marks: ${sec.marks})` : ""}`);

    for (let idx = 0; idx < sec.questions.length; idx++) {
      const q = sec.questions[idx];
      const qNumPrefix = q.customNumber
        ? `${q.customNumber.replace(/[:.\-۔]+$/, "")}.`
        : `${q.number || idx + 1}.`;

      const qEn = (q.questionEn || "").trim();
      const qUr = (q.questionUr || "").trim();

      const qBody =
        langMode === "Urdu"
          ? qUr || qEn
          : langMode === "English"
          ? qEn || qUr
          : qEn && qUr && qEn !== qUr
          ? `${qEn} | ${qUr}`
          : qEn || qUr;

      lines.push(`${qNumPrefix} ${qBody}`);

      if (q.poetryLines && q.poetryLines.length > 0) {
        for (const pLine of q.poetryLines) {
          lines.push(pLine);
        }
      }

      if (q.options && q.options.length > 0) {
        const optParts = q.options.map((o, oIdx) => {
          const oEn = (o.textEn || "").trim();
          const oUr = (o.textUr || "").trim();
          const keyLabel =
            langMode === "Urdu" || (isPureUrduText(oUr) && oEn === oUr)
              ? getUrduOptionLabel(o.key, oIdx)
              : normalizeOptionKey(o.key, oIdx);

          const optText =
            langMode === "Urdu"
              ? oUr || oEn
              : langMode === "English"
              ? oEn || oUr
              : oEn && oUr && oEn !== oUr
              ? `${oEn} (${oUr})`
              : oEn || oUr;

          return `(${keyLabel}) ${optText}`;
        });
        lines.push(optParts.join("   "));
      }
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}

/**
 * Intelligent Bilingual & Pakistani Board Exam Parser.
 * Handles both English and Urdu/Bilingual papers, MCQs with (A)/(B)/(C)/(D) or (الف)/(ب)/(ج)/(د) options,
 * Section headers with marks, and subjective questions.
 */
export function parseRawTextToExam(rawText: string): ExamPaperData {
  const rawLines = rawText.split(/\r?\n/);
  const lines = rawLines.map((l) => cleanUrduText(l)).filter(Boolean);

  // Detect predominant language of the input
  let urduCharCount = 0;
  let englishCharCount = 0;
  for (const line of lines) {
    for (const char of line) {
      if (/[\u0600-\u06FF]/.test(char)) urduCharCount++;
      else if (/[a-zA-Z]/.test(char)) englishCharCount++;
    }
  }

  const detectedLanguage: "Urdu" | "English" | "Bilingual" =
    urduCharCount > 20 && englishCharCount > 20
      ? "Bilingual"
      : urduCharCount > englishCharCount
      ? "Urdu"
      : "English";

  const isEnglishPaper = detectedLanguage === "English";

  const institutionName = "SEEKACADEMY";
  const title = isEnglishPaper
    ? "ENGLISH ASSESSMENT / EXAMINATION"
    : "مطالعہ پاکستان / PAKISTAN STUDIES";
  const subject = isEnglishPaper ? "English" : "مطالعہ پاکستان";
  const grade = "10th";
  const timeAllowed = "1:00 Hour";
  let totalMarks = 25;

  const sections: ExamSection[] = [];
  let currentSection: ExamSection | null = null;
  let currentQuestion: ExamQuestion | null = null;
  let qCounter = 1;

  // Single option line e.g. "A) Strong", "B) Delicate", "A. Noun", "(A) Took", "(الف) وہ"
  const singleOptionRegex = /^[(\[]?\s*([A-Da-d]|الف|ب|ج|د)\s*[)\]\.\:۔\-]\s*(.+)$/;

  // Question numbering regex: "1. What is...", "1.The beggar...", "(i) ...", "Q. 2: ...", "سوال نمبر 1:"
  const questionNumberRegex =
    /^(?:(Q\.?\s*\d+|سوال\s*(?:نمبر)?\s*\d+)\s*[:\-۔.]?\s*|\(?(\d+)\)?\s*[\.\)\-۔:]\s*|\(?(i{1,3}|iv|v|vi|vii|viii|ix|x)\)?\s*[\.\)\-۔:]\s*)(.*)$/i;

  // Header extraction for marks: e.g. "Marks : 05", "Marks:10", "(5 Marks)", "(نمبر: 10)"
  const extractMarks = (str: string): number | undefined => {
    const m =
      str.match(/marks?\s*[:\-]?\s*(\d+)/i) ||
      str.match(/[-–—]?\s*\(\s*(\d+)\s*(?:نمبر|marks)?\s*\)/i) ||
      str.match(/نمبر\s*[:\-]\s*(\d+)/);
    return m ? parseInt(m[1], 10) : undefined;
  };

  const splitBilingualTitle = (rawTitle: string): { titleEn: string; titleUr: string } => {
    if (rawTitle.includes("/")) {
      const parts = rawTitle.split("/").map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2 && hasUrduScript(parts[1]) && !hasUrduScript(parts[0])) {
        return { titleEn: parts[0], titleUr: parts[1] };
      }
      if (parts.length >= 2 && hasUrduScript(parts[0]) && !hasUrduScript(parts[1])) {
        return { titleEn: parts[1], titleUr: parts[0] };
      }
    }
    if (rawTitle.includes("|")) {
      const parts = rawTitle.split("|").map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        return { titleEn: parts[0], titleUr: parts[1] };
      }
    }
    return { titleEn: rawTitle, titleUr: rawTitle };
  };

  // Section header matcher
  const isSectionHeader = (line: string): boolean => {
    if (extractInlineOptionsFromLine(line)) return false;
    if (line.match(singleOptionRegex)) return false;

    if (/^(?:section|part|حصہ)\s*[-:\s]*([a-d]|i{1,4}|[1-6]|اول|دوم|سوم|چہارم)/i.test(line)) return true;
    if (/^سوال\s*(?:نمبر)?\s*[1-9]\s*[۔:\-]\s*(?:درست جواب|درج ذیل|مختصر|تفصیلی)/i.test(line)) return true;
    if (
      /^(?:choose\s+the\s+correct\s+option|multiple\s+choice|change\s+the\s+narration|translate|write\s+an\s+essay|short\s+questions|long\s+questions|detailed\s+questions|give\s+short\s+answers)/i.test(
        line
      )
    )
      return true;
    if (/درست جواب کے گرد|کثیر الانتخابی|معروضی سوالات|انشائیہ سوالات|مختصر سوالات|تفصیلی سوالات/i.test(line))
      return true;

    if (/marks?\s*[:\-]?\s*\d+/i.test(line) && !line.match(questionNumberRegex)) return true;

    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineMarks = extractMarks(line);

    // 1. Check for inline options on a single line (or question stem + inline options on same line)
    const inlineExtracted = extractInlineOptionsFromLine(line);
    if (inlineExtracted) {
      if (!inlineExtracted.stemPrefix && currentQuestion) {
        if (!currentQuestion.options) currentQuestion.options = [];
        currentQuestion.options.push(...inlineExtracted.options);
        if (currentSection) currentSection.type = "mcq";
        continue;
      } else if (inlineExtracted.stemPrefix) {
        if (currentQuestion && currentSection) {
          currentSection.questions.push(currentQuestion);
        }
        if (!currentSection) {
          currentSection = {
            id: "sec-1",
            type: "mcq",
            titleUr: "حصہ اول: کثیر الانتخابی سوالات (MCQs)",
            titleEn: "SECTION-I: MULTIPLE CHOICE QUESTIONS",
            marks: 5,
            questions: [],
          };
        } else {
          currentSection.type = "mcq";
        }
        const qMatch = inlineExtracted.stemPrefix.match(questionNumberRegex);
        const rawStem = qMatch ? (qMatch[4] || inlineExtracted.stemPrefix).trim() : inlineExtracted.stemPrefix;
        const parts = rawStem.split("|").map((s) => s.trim()).filter(Boolean);
        currentQuestion = {
          number: qCounter++,
          customNumber: qMatch?.[1] || qMatch?.[2] || qMatch?.[3] || undefined,
          questionEn: parts[0] || rawStem,
          questionUr: parts.length > 1 ? parts[1] : rawStem,
          marks: 1,
          options: inlineExtracted.options,
        };
        continue;
      }
    }

    // 2. Check for single option line: "A) Strong", "(الف) وہ"
    const singleOpt = line.match(singleOptionRegex);
    if (singleOpt && currentQuestion) {
      if (!currentQuestion.options) currentQuestion.options = [];
      const optIdx = currentQuestion.options.length;
      const { textEn, textUr } = splitBilingualOptionText(singleOpt[2]);
      currentQuestion.options.push({
        key: normalizeOptionKey(singleOpt[1], optIdx),
        textUr,
        textEn,
      });
      if (currentSection) currentSection.type = "mcq";
      continue;
    }

    // 3. Standalone Marks line attached to previous section or question
    if (/^marks?\s*[:\-]?\s*\d+\s*$/i.test(line)) {
      if (lineMarks !== undefined) {
        if (currentQuestion && !currentQuestion.marks) {
          currentQuestion.marks = lineMarks;
        } else if (currentSection && !currentSection.marks) {
          currentSection.marks = lineMarks;
        }
      }
      continue;
    }

    // 4. Check for explicit Section Header or instruction line
    if (isSectionHeader(line)) {
      if (currentQuestion && currentSection) {
        currentSection.questions.push(currentQuestion);
        currentQuestion = null;
      }
      if (currentSection && currentSection.questions.length > 0) {
        sections.push(currentSection);
      }

      const isMcq = /choose\s+the\s+correct|multiple\s+choice|mcq|درست جواب|معروضی|کثیر الانتخابی|section[-\s]*[1i]\b/i.test(
        line
      );
      const isLong = /detailed|long\s+questions|تفصیلی|section[-\s]*(?:3|iii)\b|حصہ سوم/i.test(line);
      const isEssay = /essay|مضمون/i.test(line);
      const isPoetry = /شعر|اشعار|poetry/i.test(line);
      const cleanTitle = line
        .replace(/[-–—]?\s*\(?\s*marks?\s*[:\-]?\s*\d+\s*\)?/gi, "")
        .replace(/[-–—]?\s*\(\s*\d+\s*(?:نمبر|marks)?\s*\)/gi, "")
        .trim();

      const defaultTitleEn = isMcq
        ? "SECTION-I: MULTIPLE CHOICE QUESTIONS"
        : isEssay
        ? "SECTION-III: ESSAY WRITING"
        : isLong
        ? "SECTION-III: DETAILED QUESTIONS"
        : "SECTION-II: SHORT QUESTIONS";

      const defaultTitleUr = isMcq
        ? "حصہ اول: کثیر الانتخابی سوالات"
        : isEssay
        ? "حصہ سوم: مضمون نویسی"
        : isLong
        ? "حصہ سوم: تفصیلی سوالات"
        : "حصہ دوم: مختصر سوالات";

      const { titleEn: parsedEn, titleUr: parsedUr } = splitBilingualTitle(cleanTitle);
      const titleHasUrdu = hasUrduScript(cleanTitle);

      currentSection = {
        id: `sec-${sections.length + 1}`,
        type: isMcq ? "mcq" : isEssay ? "essay" : isPoetry ? "poetry" : isLong ? "long" : "short",
        titleUr: parsedUr !== parsedEn ? parsedUr : titleHasUrdu ? cleanTitle : defaultTitleUr,
        titleEn: parsedEn !== parsedUr ? parsedEn : !titleHasUrdu && cleanTitle ? cleanTitle : defaultTitleEn,
        marks: lineMarks || (isMcq ? 5 : 10),
        questions: [],
      };
      qCounter = 1;
      continue;
    }

    // If no section exists yet, create Section-I
    if (!currentSection) {
      currentSection = {
        id: "sec-1",
        type: "mcq",
        titleUr: "حصہ اول: کثیر الانتخابی سوالات",
        titleEn: "SECTION-I: MULTIPLE CHOICE QUESTIONS",
        marks: 5,
        questions: [],
      };
    }

    // 5. Check for Major Question / Subjective Question with "Q. 2: ...", "Q3. ..."
    const majorQMatch = line.match(/^Q\.?\s*(\d+)\s*[:\-۔]?\s*(.*)$/i);
    if (majorQMatch && currentSection.questions.length > 0 && currentSection.type === "mcq") {
      if (currentQuestion && currentSection) {
        currentSection.questions.push(currentQuestion);
        currentQuestion = null;
      }
      const majorNum = parseInt(majorQMatch[1], 10);
      const qText = majorQMatch[2].trim();
      const isEssay = /essay|مضمون/i.test(qText);
      const isLetter = /letter|خط/i.test(qText);

      if (currentSection && currentSection.questions.length > 0) {
        sections.push(currentSection);
      }

      currentSection = {
        id: `sec-${sections.length + 1}`,
        type: isEssay ? "essay" : isLetter ? "letter" : "short",
        questionNumber: `Q.${majorNum}`,
        titleUr: `سوال نمبر ${majorNum}: ${qText || (isEssay ? "مضمون نویسی" : "انشائیہ سوالات")}`,
        titleEn: `Q. ${majorNum}: ${qText || (isEssay ? "Essay Writing" : "Subjective Questions")}`,
        marks: lineMarks || 10,
        questions: [],
      };
      currentQuestion = {
        number: 1,
        customNumber: `Q.${majorNum}`,
        questionUr: qText || line,
        questionEn: qText || line,
        marks: lineMarks || 10,
      };
      qCounter = 1;
      continue;
    }

    // 6. Check for standard individual question starter: "1. ...", "(i) ...", "Q.2: ..."
    const qMatch = line.match(questionNumberRegex);
    if (qMatch) {
      if (currentQuestion) {
        currentSection.questions.push(currentQuestion);
      }

      const customLabel = (qMatch[1] || qMatch[2] || qMatch[3] || "").trim();
      const explicitNum = qMatch[2] ? parseInt(qMatch[2], 10) : undefined;
      const qText = (qMatch[4] || line).trim();
      const parts = qText.split("|").map((s) => s.trim()).filter(Boolean);
      const qEn = parts[0] || qText;
      const qUr = parts.length > 1 ? parts[1] : qText;

      currentQuestion = {
        number: explicitNum || qCounter++,
        customNumber: customLabel || undefined,
        questionUr: qUr,
        questionEn: qEn,
        marks: lineMarks || (currentSection.type === "mcq" ? 1 : currentSection.type === "long" ? 5 : 2),
        options: currentSection.type === "mcq" ? [] : undefined,
      };
      continue;
    }

    // 7. Urdu individual subjective question: "سوال - درج ذیل اشعار..."
    if (line.startsWith("سوال")) {
      if (currentSection.type === "mcq") {
        if (currentQuestion) {
          currentSection.questions.push(currentQuestion);
          currentQuestion = null;
        }
        if (currentSection.questions.length > 0) {
          sections.push(currentSection);
        }

        currentSection = {
          id: `sec-${sections.length + 1}`,
          type: "short",
          titleUr: "حصہ دوم: انشائیہ سوالات",
          titleEn: "SECTION-II: SUBJECTIVE QUESTIONS",
          marks: 15,
          questions: [],
        };
        qCounter = 1;
      }

      if (currentQuestion) {
        currentSection.questions.push(currentQuestion);
      }

      const cleanQText = line
        .replace(/^سوال\s*(?:نمبر\s*\d+)?\s*[\-\:۔]?\s*/, "")
        .replace(/[-–—]?\s*\(\s*\d+\s*(?:نمبر|marks)?\s*\)/gi, "")
        .trim();
      currentQuestion = {
        number: qCounter++,
        questionUr: cleanQText,
        questionEn: cleanQText,
        marks: lineMarks || 5,
      };
      continue;
    }

    // 8. Poetry verses
    if (/کعبے کی رونق|خیرالامم|شعر|مصرع/i.test(line)) {
      if (currentQuestion) {
        if (!currentQuestion.poetryLines) currentQuestion.poetryLines = [];
        currentQuestion.poetryLines.push(line);
      } else {
        currentQuestion = {
          number: qCounter++,
          questionUr: "اشعار کی تشریح کریں",
          poetryLines: [line],
          marks: lineMarks || 5,
        };
      }
      continue;
    }

    // 9. Continuation line or standalone prompt
    if (currentQuestion) {
      if (currentQuestion.options && currentQuestion.options.length > 0) {
        currentSection.questions.push(currentQuestion);
        currentQuestion = {
          number: qCounter++,
          questionUr: line,
          questionEn: line,
          marks: lineMarks,
        };
      } else {
        currentQuestion.questionUr += " " + line;
        if (currentQuestion.questionEn) currentQuestion.questionEn += " " + line;
      }
    } else {
      currentQuestion = {
        number: qCounter++,
        questionUr: line,
        questionEn: line,
        marks: currentSection.type === "mcq" ? 1 : 5,
      };
    }
  }

  // Push final question and section
  if (currentQuestion && currentSection) {
    currentSection.questions.push(currentQuestion);
  }
  if (currentSection && currentSection.questions.length > 0) {
    sections.push(currentSection);
  }

  // Calculate total marks accurately
  const sumMarks = sections.reduce((acc, sec) => {
    if (sec.marks) return acc + sec.marks;
    const qSum = sec.questions.reduce((qAcc, q) => qAcc + (q.marks || 0), 0);
    return acc + (qSum || (sec.type === "mcq" ? sec.questions.length : 10));
  }, 0);

  if (sumMarks > 0) {
    totalMarks = sumMarks;
  }

  return {
    title,
    institutionName,
    subject,
    grade,
    timeAllowed,
    totalMarks,
    date: new Date().toLocaleDateString("en-GB"),
    sections,
    detectedLanguage,
  };
}
