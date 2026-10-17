export interface ExamQuestion {
  number: number;
  questionUr: string;
  questionEn?: string;
  poetryLines?: string[];
  options?: { key: string; textUr: string; textEn?: string }[];
  marks?: number;
}

export interface ExamSection {
  id: string;
  type: "mcq" | "poetry" | "short" | "long" | "essay" | "letter" | "general";
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

/**
 * Intelligent Bilingual & Pakistani Board Exam Parser.
 * Handles both English and Urdu/Bilingual papers, MCQs with (A)/(B)/(C)/(D) or inline options,
 * Section headers with marks, and subjective questions.
 */
export function parseRawTextToExam(rawText: string): ExamPaperData {
  const rawLines = rawText.split(/\r?\n/);
  const lines = rawLines
    .map((l) => cleanUrduText(l))
    .filter(Boolean);

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

  let institutionName = "SEEKACADEMY";
  let title = isEnglishPaper ? "ENGLISH ASSESSMENT / EXAMINATION" : "مطالعہ پاکستان / PAKISTAN STUDIES";
  let subject = isEnglishPaper ? "English" : "مطالعہ پاکستان";
  let grade = "10th";
  let timeAllowed = "40 Mins";
  let totalMarks = 25;

  const sections: ExamSection[] = [];
  let currentSection: ExamSection | null = null;
  let currentQuestion: ExamQuestion | null = null;
  let qCounter = 1;

  // Single option line e.g. "A) Strong", "B) Delicate", "A. Noun", "(A) Took", "(الف) وہ"
  const singleOptionRegex = /^[(\[]?\s*([A-Da-d]|الف|ب|ج|د)\s*[)\]\.\:۔\-]\s*(.+)$/;

  // Inline options e.g. "(A) took (B) take (C) will take (D) Have taken"
  const inlineOptionRegex = /[(\[]?\s*([A-Da-d]|الف|ب|ج|د)\s*[)\]\.\:۔\-]\s*([^(\[A-Da-dالفبجد]+)/g;

  // Question numbering regex: "1. What is...", "1.The beggar...", "(i) ...", "Q. 2: ...", "Q2: ..."
  const questionNumberRegex = /^(?:Q\.?\s*(\d+)\s*[:\-۔]?\s*|\(?(\d+)\)?\s*[\.\)\-۔:]\s*|\(?(i{1,3}|iv|v|vi|vii|viii|ix|x)\)?\s*[\.\)\-۔:]\s*)(.*)$/i;

  // Header extraction for marks: e.g. "Marks : 05", "Marks:10", "(5 Marks)", "(نمبر: 10)"
  const extractMarks = (str: string): number | undefined => {
    const m = str.match(/marks?\s*[:\-]?\s*(\d+)/i) || 
              str.match(/[-–—]?\s*\(\s*(\d+)\s*(?:نمبر|marks)?\s*\)/i) || 
              str.match(/نمبر\s*[:\-]\s*(\d+)/);
    return m ? parseInt(m[1], 10) : undefined;
  };

  // Section header matcher
  const isSectionHeader = (line: string): boolean => {
    // If it's a single option line, it's not a section header
    if (line.match(singleOptionRegex)) return false;
    
    // Explicit section keywords
    if (/^(?:section|part|حصہ)\s*([a-c]|i{1,3}|[1-3])/i.test(line)) return true;
    if (/^سوال\s*(?:نمبر)?\s*[1-3][\s*:\-۔]*/i.test(line)) return true;
    if (/^(?:choose\s+the\s+correct\s+option|change\s+the\s+narration|translate|write\s+an\s+essay|short\s+questions|long\s+questions|give\s+short\s+answers)/i.test(line)) return true;
    if (/درست جواب|معروضی|انشائیہ|مختصر سوالات|تفصیلی سوالات/i.test(line)) return true;

    // Line ending with or containing Marks e.g. "Change the narration in the following sentences: Marks :10"
    if (/marks?\s*[:\-]?\s*\d+/i.test(line) && !line.match(questionNumberRegex)) return true;

    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineMarks = extractMarks(line);

    // 1. Check for single option: "A) Strong", "B) Delicate"
    const singleOpt = line.match(singleOptionRegex);
    if (singleOpt && currentQuestion) {
      if (!currentQuestion.options) currentQuestion.options = [];
      currentQuestion.options.push({
        key: singleOpt[1].trim().toUpperCase(),
        textUr: singleOpt[2].trim(),
        textEn: singleOpt[2].trim(),
      });
      if (currentSection) currentSection.type = "mcq";
      continue;
    }

    // 2. Check for inline options on a single line
    const foundOptions = [...line.matchAll(inlineOptionRegex)];
    if (foundOptions.length >= 2 && currentQuestion) {
      if (!currentQuestion.options) currentQuestion.options = [];
      for (const m of foundOptions) {
        const key = m[1].trim().toUpperCase();
        const optText = m[2].trim().replace(/[-–—]+$/, "");
        currentQuestion.options.push({ key, textUr: optText, textEn: optText });
      }
      if (currentSection) currentSection.type = "mcq";
      continue;
    }

    // 3. Standalone Marks line attached to previous section or question (e.g. line is just "Marks : 10")
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

      const isMcq = /choose\s+the\s+correct|mcq|درست جواب|معروضی|section[-\s]*[1i]/i.test(line);
      const isEssay = /essay|مضمون/i.test(line);
      const isPoetry = /شعر|اشعار|poetry/i.test(line);
      const cleanTitle = line.replace(/[-–—]?\s*(?:marks?\s*[:\-]?)?\s*\(?\s*\d+\s*(?:نمبر|marks)?\s*\)?/gi, "").trim();

      const defaultTitle = isEnglishPaper
        ? (isMcq ? "SECTION-I (OBJECTIVE / MCQs)" : isEssay ? "SECTION-III (ESSAY WRITING)" : "SECTION-II (SUBJECTIVE)")
        : (isMcq ? "Section-I (معروضی سوالات)" : "Section-II (انشائیہ سوالات)");

      currentSection = {
        id: `sec-${sections.length + 1}`,
        type: isMcq ? "mcq" : isEssay ? "essay" : isPoetry ? "poetry" : "short",
        titleUr: cleanTitle || defaultTitle,
        titleEn: cleanTitle || defaultTitle,
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
        titleUr: isEnglishPaper ? "SECTION-I (OBJECTIVE / MCQs)" : "Section-I (معروضی سوالات)",
        titleEn: isEnglishPaper ? "SECTION-I (OBJECTIVE / MCQs)" : "Section-I (معروضی سوالات)",
        marks: 5,
        questions: [],
      };
    }

    // 5. Check for Major Question / Subjective Question with "Q. 2: ...", "Q3. ..."
    const majorQMatch = line.match(/^Q\.?\s*(\d+)\s*[:\-۔]?\s*(.*)$/i);
    if (majorQMatch) {
      // If we have an active question, save it
      if (currentQuestion && currentSection) {
        currentSection.questions.push(currentQuestion);
        currentQuestion = null;
      }
      // If previous section had questions and this is a major Q, treat it as a new section or major question
      const majorNum = parseInt(majorQMatch[1], 10);
      const qText = majorQMatch[2].trim();
      const isEssay = /essay|مضمون/i.test(qText);
      const isLetter = /letter|خط/i.test(qText);

      // Create a section for major subjective question
      if (currentSection && currentSection.questions.length > 0) {
        sections.push(currentSection);
      }

      currentSection = {
        id: `sec-${sections.length + 1}`,
        type: isEssay ? "essay" : isLetter ? "letter" : "short",
        titleUr: `Q. ${majorNum}: ${qText || (isEssay ? "Essay Writing" : "Subjective Question")}`,
        titleEn: `Q. ${majorNum}: ${qText || (isEssay ? "Essay Writing" : "Subjective Question")}`,
        marks: lineMarks || 10,
        questions: [],
      };
      currentQuestion = {
        number: 1,
        questionUr: qText || line,
        questionEn: qText || line,
        marks: lineMarks || 10,
      };
      qCounter = 1;
      continue;
    }

    // 6. Check for standard individual question starter: "1. The beggar...", "2. Fill in the blank...", "(i) ..."
    const qMatch = line.match(questionNumberRegex);
    if (qMatch) {
      if (currentQuestion) {
        currentSection.questions.push(currentQuestion);
      }

      const explicitNum = qMatch[2] ? parseInt(qMatch[2], 10) : undefined;
      const qText = (qMatch[4] || line).trim();
      const parts = qText.split("|").map((s) => s.trim()).filter(Boolean);
      const qEn = parts[0] || qText;
      const qUr = parts.length > 1 ? parts[1] : qText;

      currentQuestion = {
        number: explicitNum || qCounter++,
        questionUr: qUr,
        questionEn: qEn,
        marks: lineMarks || (currentSection.type === "mcq" ? 1 : undefined),
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
          titleUr: "Section-II (انشائیہ سوالات)",
          titleEn: "Section-II (Subjective)",
          marks: 15,
          questions: [],
        };
        qCounter = 1;
      }

      if (currentQuestion) {
        currentSection.questions.push(currentQuestion);
      }

      const cleanQText = line.replace(/^سوال\s*[\-\:۔]?\s*/, "").trim();
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
      // If the current question already has options and we hit a non-matching line that looks like a prompt
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
