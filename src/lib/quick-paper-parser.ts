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
}

// Clean markdown bold stars, ticks, quotes, and normalize arabic/urdu numerals
export function cleanUrduText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*{1,3}/g, "") // strip asterisks **
    .replace(/[`_]/g, "")
    .replace(/[✓✔√]/g, "") // strip checkmarks from "گرد (✓) کا نشان"
    .trim();
}

/**
 * High-Precision Pakistani Board Exam Parser for Urdu / English test papers.
 */
export function parseRawTextToExam(rawText: string): ExamPaperData {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => cleanUrduText(l))
    .filter(Boolean);

  let institutionName = "گورنمنٹ / پرائیویٹ ہائر سیکنڈری سکول";
  let title = "امتحان و ماہانہ ٹیسٹ 2026 / ASSESSMENT EXAMINATION";
  let subject = "اردو لازمی (Urdu Compulsory)";
  let grade = "جماعت دہم (10th)";
  let timeAllowed = "2:30 گھنٹے";
  let totalMarks = 75;

  const sections: ExamSection[] = [];
  let currentSection: ExamSection | null = null;
  let currentQuestion: ExamQuestion | null = null;
  let qCounter = 1;

  // Patterns
  // 1. Major Section/Question Header:
  // e.g. "سوال نمبر 1۔ درست جواب کے گرد کا نشان لگائیں"
  // e.g. "سوال - درج ذیل اشعار کی تشریح کریں - (5)"
  // e.g. "سوال - سیرت النبی صلی اللہ علیہ وآلہ وسلم کے عنوان پر ایک تفصیلی مضمون تحریر کریں - (10)"
  // e.g. "سوال - دوست کے نام خط امتحان میں کامیابی کا ذکر کرنا (5)"
  const majorSectionRegex = /^(?:سوال\s*(?:نمبر)?\s*[\d\u06F0-\u06F9]*\s*[\.\:۔\-]*)\s*(.+)$/i;

  // 2. Sub-question markers:
  // Roman numerals: -i-, -ii-, -iii-, -iv-, -v- OR i), ii), iii) OR (i), (ii)
  // Numbered: 1-, 1., 1), (1)
  const subIndexRegex = /^(?:-?\s*(?:i{1,3}|iv|v|vi|vii|viii|ix|x)\s*[\.\)\-۔:]|-?\s*(\d+)\s*[\.\)\-۔:])\s*(.*)$/i;

  // 3. Urdu Options: (الف) (ب) (ج) (د)
  // Can be in one line: "(الف) وہ (ب) جا (ج) رہا ہے (د) ہے"
  // Or separate lines: "الف) وہ"
  const inlineOptionRegex = /[(\[]?\s*(الف|ب|ج|د)\s*[)\]\.\:۔\-]\s*([^(\[الفبجد]+)/g;
  const singleOptionRegex = /^[(\[]?\s*(الف|ب|ج|د)\s*[)\]\.\:۔\-]\s*(.+)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains marks like "(5)", "-(10)", "(نمبر: 10)"
    const marksMatch = line.match(/[-–—]?\s*\(\s*(\d+)\s*(?:نمبر)?\s*\)/) || line.match(/نمبر\s*[:\-]\s*(\d+)/);
    const lineMarks = marksMatch ? parseInt(marksMatch[1], 10) : undefined;

    // Check for inline Urdu options (الف) ... (ب) ... (ج) ... (د) ...
    const foundOptions = [...line.matchAll(inlineOptionRegex)];
    if (foundOptions.length >= 2) {
      if (currentQuestion) {
        if (!currentQuestion.options) currentQuestion.options = [];
        for (const m of foundOptions) {
          const key = m[1].trim();
          const textUr = m[2].trim().replace(/[-–—]+$/, "");
          currentQuestion.options.push({ key, textUr });
        }
        if (currentSection) currentSection.type = "mcq";
      }
      continue;
    }

    // Check for single Urdu option line: "الف) وہ"
    const singleOpt = line.match(singleOptionRegex);
    if (singleOpt && currentQuestion) {
      if (!currentQuestion.options) currentQuestion.options = [];
      currentQuestion.options.push({
        key: singleOpt[1].trim(),
        textUr: singleOpt[2].trim(),
      });
      if (currentSection) currentSection.type = "mcq";
      continue;
    }

    // Check if this line is a Major Question / Section Header
    const isMajorHeading =
      line.startsWith("سوال") &&
      (/درست جواب|اشعار|تشریح|مضمون|خط|درخواست|خلاصہ|مختصر سوال|تفصیلی/i.test(line) ||
        lineMarks !== undefined ||
        /^سوال\s*(?:نمبر)?\s*\d+/i.test(line));

    if (isMajorHeading) {
      if (currentQuestion && currentSection) {
        currentSection.questions.push(currentQuestion);
        currentQuestion = null;
      }
      if (currentSection && currentSection.questions.length > 0) {
        sections.push(currentSection);
      }

      // Determine Section Type
      let secType: ExamSection["type"] = "general";
      if (/درست جواب|معروضی|انتخاب|mcq/i.test(line)) secType = "mcq";
      else if (/اشعار|شعر|تشریح/i.test(line)) secType = "poetry";
      else if (/مضمون/i.test(line)) secType = "essay";
      else if (/خط|درخواست/i.test(line)) secType = "letter";
      else if (/تفصیلی|انشائیہ/i.test(line)) secType = "long";
      else if (/مختصر/i.test(line)) secType = "short";

      // Strip marks from title display if present
      const cleanTitle = line.replace(/[-–—]?\s*\(\s*\d+\s*(?:نمبر)?\s*\)/, "").trim();

      currentSection = {
        id: `sec-${sections.length + 1}`,
        type: secType,
        titleUr: cleanTitle,
        marks: lineMarks,
        questions: [],
      };
      qCounter = 1;
      continue;
    }

    // Check if line is a Sub-Question / Part (e.g. -i-, -ii-, -iii-, 1., 2.)
    const subMatch = line.match(subIndexRegex);
    if (subMatch) {
      if (currentQuestion && currentSection) {
        currentSection.questions.push(currentQuestion);
      }

      const qText = subMatch[2] ? subMatch[2].trim() : line;
      currentQuestion = {
        number: qCounter++,
        questionUr: qText,
        marks: currentSection?.type === "mcq" ? 1 : undefined,
        options: currentSection?.type === "mcq" ? [] : undefined,
      };
      continue;
    }

    // Poetry verses check: lines inside poetry section or quoted lines
    if (currentSection?.type === "poetry") {
      if (currentQuestion) {
        if (!currentQuestion.poetryLines) currentQuestion.poetryLines = [];
        currentQuestion.poetryLines.push(line);
      } else {
        currentQuestion = {
          number: qCounter++,
          questionUr: "شعر",
          poetryLines: [line],
          marks: currentSection.marks,
        };
      }
      continue;
    }

    // General continuation or individual questions inside subjective sections
    if (currentSection && (currentSection.type === "essay" || currentSection.type === "letter" || currentSection.type === "long")) {
      if (!currentQuestion) {
        currentQuestion = {
          number: qCounter++,
          questionUr: line,
          marks: currentSection.marks,
        };
      } else {
        currentQuestion.questionUr += " " + line;
      }
      continue;
    }

    // If within an MCQ section without explicit numbering, check if line ends with '؟' or is a question
    if (currentSection && currentSection.type === "mcq") {
      if (currentQuestion && (!currentQuestion.options || currentQuestion.options.length === 0)) {
        currentQuestion.questionUr += " " + line;
      } else {
        if (currentQuestion) {
          currentSection.questions.push(currentQuestion);
        }
        currentQuestion = {
          number: qCounter++,
          questionUr: line,
          marks: 1,
          options: [],
        };
      }
      continue;
    }

    // Fallback if no section yet
    if (!currentSection) {
      currentSection = {
        id: "sec-1",
        type: "general",
        titleUr: "امتحان / سوالات",
        questions: [],
      };
    }

    if (currentQuestion) {
      currentQuestion.questionUr += " " + line;
    } else {
      currentQuestion = {
        number: qCounter++,
        questionUr: line,
      };
    }
  }

  if (currentQuestion && currentSection) {
    currentSection.questions.push(currentQuestion);
  }
  if (currentSection && currentSection.questions.length > 0) {
    sections.push(currentSection);
  }

  // Calculate total marks accurately if unspecified
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
  };
}
