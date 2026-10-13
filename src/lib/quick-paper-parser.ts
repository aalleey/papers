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

export function cleanUrduText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*{1,3}/g, "") // strip markdown asterisks
    .replace(/[`_]/g, "")
    .replace(/[✓✔√]/g, "") // strip checkmarks
    .trim();
}

/**
 * Intelligent Pakistani board exam parser.
 * Grouping rules:
 * - Major question 1 / Section-I: MCQs
 * - Major question 2 / Section-II: Subjective (Ash'aar, Essay, Letter, Tashreeh)
 */
export function parseRawTextToExam(rawText: string): ExamPaperData {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => cleanUrduText(l))
    .filter(Boolean);

  let institutionName = "SEEKACADEMY";
  let title = "مطالعہ پاکستان / PAKISTAN STUDIES";
  let subject = "مطالعہ پاکستان";
  let grade = "10th";
  let timeAllowed = "40 Mins";
  let totalMarks = 25;

  const sections: ExamSection[] = [];
  let currentSection: ExamSection | null = null;
  let currentQuestion: ExamQuestion | null = null;
  let qCounter = 1;

  // Patterns
  const subIndexRegex = /^(?:-?\s*\(?(i{1,3}|iv|v|vi|vii|viii|ix|x)\)?\s*[\.\)\-۔:]|-?\s*\(?(\d+)\)?\s*[\.\)\-۔:])\s*(.*)$/i;
  const inlineOptionRegex = /[(\[]?\s*(الف|ب|ج|د|[A-Da-d])\s*[)\]\.\:۔\-]\s*([^(\[الفبجدA-Da-d]+)/g;
  const singleOptionRegex = /^[(\[]?\s*(الف|ب|ج|د|[A-Da-d])\s*[)\]\.\:۔\-]\s*(.+)$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect marks e.g. -(5), (10 Marks), (نمبر: 10)
    const marksMatch = line.match(/[-–—]?\s*\(\s*(\d+)\s*(?:نمبر|marks)?\s*\)/i) || line.match(/نمبر\s*[:\-]\s*(\d+)/);
    const lineMarks = marksMatch ? parseInt(marksMatch[1], 10) : undefined;

    // Check for inline options: (الف) ... (ب) ... (ج) ... (د) ...
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

    // Check for single option line: "الف) وہ"
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

    // Check if line is an explicit Major Section Switch
    // Only switch major section if it explicitly says Section / Part / سوال نمبر 1 / سوال نمبر 2
    const isExplicitSectionSwitch =
      /^(?:section|part|حصہ)\s*([a-c]|i{1,3}|[1-3])/i.test(line) ||
      /^سوال\s*(?:نمبر)?\s*[1-3][\s*:\-۔]*/i.test(line) ||
      (/درست جواب|معروضی|mcq/i.test(line) && sections.length === 0);

    if (isExplicitSectionSwitch) {
      if (currentQuestion && currentSection) {
        currentSection.questions.push(currentQuestion);
        currentQuestion = null;
      }
      if (currentSection && currentSection.questions.length > 0) {
        sections.push(currentSection);
      }

      const isMcq = /درست جواب|معروضی|mcq|section[-\s]*[1i]/i.test(line);
      const cleanTitle = line.replace(/[-–—]?\s*\(\s*\d+\s*(?:نمبر|marks)?\s*\)/i, "").trim();

      currentSection = {
        id: `sec-${sections.length + 1}`,
        type: isMcq ? "mcq" : "short",
        titleUr: cleanTitle || (isMcq ? "Section-I (معروضی سوالات)" : "Section-II (انشائیہ سوالات)"),
        marks: lineMarks || (isMcq ? 10 : 15),
        questions: [],
      };
      qCounter = 1;
      continue;
    }

    // If no section exists yet, initialize Section-I
    if (!currentSection) {
      currentSection = {
        id: "sec-1",
        type: "mcq",
        titleUr: "Section-I (معروضی سوالات)",
        marks: 10,
        questions: [],
      };
    }

    // Check if line is an individual subjective question inside Section-II:
    // e.g. "سوال - درج ذیل اشعار کی تشریح کریں - (5)"
    // e.g. "سوال - سیرت النبی ﷺ کے عنوان پر ایک تفصیلی مضمون تحریر کریں - (10)"
    // e.g. "سوال - دوست کے نام خط امتحان میں کامیابی کا ذکر کرتے ہوئے خط تحریر (10)"
    if (line.startsWith("سوال") && !isExplicitSectionSwitch) {
      // If we are currently in MCQ section, switch to Section-II for subjective
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
        marks: lineMarks || 5,
      };
      continue;
    }

    // Sub-index matching: (i), -ii-, 1., 2.
    const subMatch = line.match(subIndexRegex);
    if (subMatch) {
      if (currentQuestion) {
        currentSection.questions.push(currentQuestion);
      }

      const qText = (subMatch[3] || line).trim();
      currentQuestion = {
        number: qCounter++,
        questionUr: qText,
        marks: currentSection.type === "mcq" ? 1 : lineMarks,
        options: currentSection.type === "mcq" ? [] : undefined,
      };
      continue;
    }

    // Poetry verses
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

    // Continuation line
    if (currentQuestion) {
      currentQuestion.questionUr += " " + line;
    } else {
      currentQuestion = {
        number: qCounter++,
        questionUr: line,
        marks: currentSection.type === "mcq" ? 1 : 5,
      };
    }
  }

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
  };
}
