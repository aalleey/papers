import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Packer,
  ShadingType,
  TableLayoutType,
  VerticalAlign,
  ImageRun,
  PageOrientation,
} from "docx";
import { ExamPaperData, ExamQuestion } from "@/lib/quick-paper-parser";

export interface WordExportOptions {
  paperData: ExamPaperData;
  languageMode: "Urdu" | "English" | "Bilingual";
  syllabus: string;
  testNo: string;
  paperCode: string;
  note: string;
  noteUr?: string;
  paperTypeBanner?: string;
  logoBase64?: string | null;
  headerStyle?: "style1" | "style2" | "punjab-board-style1" | "minimal";
  includeStudentInfo?: boolean;
  includeBubbleSheet?: boolean;
  includeAnswerKey?: boolean;
  answerKeyItems?: { number: number; question: string; answer: string }[];
}

// Printable A4 width in Twips (DXA):
// A4 width = 11906 DXA (210mm). Margins = 480 DXA left + 480 DXA right = 960 DXA.
// Exact printable content width = 10946 DXA (~193mm) so exams fit cleanly on 1 single page!
const PAGE_WIDTH_DXA = 11906;
const PAGE_HEIGHT_DXA = 16838;
const MARGIN_X_DXA = 480;
const MARGIN_Y_DXA = 340;
const CONTENT_WIDTH_DXA = PAGE_WIDTH_DXA - MARGIN_X_DXA * 2; // 10946 DXA
const HALF_WIDTH_DXA = Math.floor(CONTENT_WIDTH_DXA / 2); // 5473 DXA

const ENGLISH_FONT = "Calibri";
const ENGLISH_HEADING_FONT = "Arial";
const URDU_FONT = "Jameel Noori Nastaleeq";

// Convert numbers 1, 2, 3 to Roman numerals (i), (ii), (iii), (iv), (v)
function toRoman(num: number): string {
  const lookup: [number, string][] = [
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];
  let res = "";
  let n = Math.max(1, num);
  for (const [val, str] of lookup) {
    while (n >= val) {
      res += str;
      n -= val;
    }
  }
  return res || "i";
}

// Map option letters A, B, C, D to authentic Urdu letters (الف), (ب), (ج), (د)
function getUrduOptionKey(key: string): string {
  const k = key.trim().toUpperCase();
  if (k === "A" || k === "1" || k === "الف") return "الف";
  if (k === "B" || k === "2" || k === "ب") return "ب";
  if (k === "C" || k === "3" || k === "ج") return "ج";
  if (k === "D" || k === "4" || k === "د") return "د";
  return key;
}

// Convert LaTeX math expressions into clean, readable Unicode symbols for Microsoft Word
function formatMathForWord(input: string): string {
  if (!input) return "";
  let s = input.trim();

  // Remove outer $...$ or $$...$$ delimiters while keeping inner math
  s = s.replace(/\$\$(.*?)\$\$/g, "$1").replace(/\$(.*?)\$/g, "$1");

  // Common LaTeX fractions & roots
  s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1/$2)");
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, "√($1)");
  s = s.replace(/\\overline\{([^{}]+)\}/g, "$1̄");
  s = s.replace(/\\vec\{([^{}]+)\}/g, "$1⃗");
  s = s.replace(/\\text\{([^{}]+)\}/g, "$1");
  s = s.replace(/\\mathrm\{([^{}]+)\}/g, "$1");

  // Superscripts and subscripts
  const supMap: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "+": "⁺",
    "-": "⁻",
    "n": "ⁿ",
  };
  const subMap: Record<string, string> = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "⁸",
    "9": "₉",
  };

  s = s.replace(/\^\{([0-9+\-n]+)\}/g, (_, exp: string) =>
    exp
      .split("")
      .map((ch) => supMap[ch] || `^${ch}`)
      .join("")
  );
  s = s.replace(/\^([0-9])/g, (_, d: string) => supMap[d] || `^${d}`);

  s = s.replace(/_\{([0-9]+)\}/g, (_, sub: string) =>
    sub
      .split("")
      .map((ch) => subMap[ch] || `_${ch}`)
      .join("")
  );
  s = s.replace(/_([0-9])/g, (_, d: string) => subMap[d] || `_${d}`);

  const replacements: [RegExp, string][] = [
    [/\\times/g, "×"],
    [/\\div/g, "÷"],
    [/\\pm/g, "±"],
    [/\\cdot/g, "·"],
    [/\\leq|\\le/g, "≤"],
    [/\\geq|\\ge/g, "≥"],
    [/\\neq|\\ne/g, "≠"],
    [/\\approx/g, "≈"],
    [/\\equiv/g, "≡"],
    [/\\infty/g, "∞"],
    [/\\rightarrow|\\to/g, "→"],
    [/\\leftarrow/g, "←"],
    [/\\leftrightarrow/g, "↔"],
    [/\\Rightarrow/g, "⇒"],
    [/\\degree|\\circ/g, "°"],
    [/\\alpha/g, "α"],
    [/\\beta/g, "β"],
    [/\\gamma/g, "γ"],
    [/\\delta/g, "δ"],
    [/\\Delta/g, "Δ"],
    [/\\theta/g, "θ"],
    [/\\lambda/g, "λ"],
    [/\\mu/g, "μ"],
    [/\\pi/g, "π"],
    [/\\sigma/g, "σ"],
    [/\\omega/g, "ω"],
    [/\\Omega/g, "Ω"],
    [/\\sum/g, "∑"],
    [/\\prod/g, "∏"],
    [/\\int/g, "∫"],
    [/\\cup/g, "∪"],
    [/\\cap/g, "∩"],
    [/\\subset/g, "⊂"],
    [/\\subseteq/g, "⊆"],
    [/\\in/g, "∈"],
    [/\\notin/g, "∉"],
    [/\\emptyset/g, "∅"],
    [/\\forall/g, "∀"],
    [/\\exists/g, "∃"],
    [/\\angle/g, "∠"],
    [/\\perp/g, "⊥"],
    [/\\parallel/g, "∥"],
    [/\\triangle/g, "△"],
  ];

  for (const [regex, symbol] of replacements) {
    s = s.replace(regex, symbol);
  }

  s = s.replace(/\\([a-zA-Z]+)/g, "$1");
  return s;
}

// Convert base64 data URI to Uint8Array for docx ImageRun
function base64ToUint8Array(dataUrl?: string | null): {
  bytes: Uint8Array;
  type: "png" | "jpg" | "gif" | "bmp";
} | null {
  if (!dataUrl || typeof window === "undefined") return null;
  try {
    const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,(.+)$/i);
    const rawBase64 = match ? match[2] : dataUrl.includes(",") ? dataUrl.split(",")[1] : null;
    if (!rawBase64) return null;
    const ext = match ? match[1].toLowerCase() : "png";
    if (ext === "webp") return null;
    const type: "png" | "jpg" | "gif" | "bmp" =
      ext === "jpeg" || ext === "jpg" ? "jpg" : ext === "gif" ? "gif" : ext === "bmp" ? "bmp" : "png";

    const binaryString = window.atob(rawBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return { bytes, type };
  } catch {
    return null;
  }
}

export async function exportPaperToDocx(options: WordExportOptions): Promise<Blob> {
  const {
    paperData,
    languageMode,
    syllabus,
    testNo,
    paperCode,
    note,
    noteUr,
    paperTypeBanner = "EXAMINATION 2026-27",
    logoBase64,
    headerStyle = "style1",
    includeStudentInfo = true,
    includeBubbleSheet = false,
    includeAnswerKey = false,
    answerKeyItems = [],
  } = options;

  const isUrduOnly = languageMode === "Urdu";
  const isEnglishOnly = languageMode === "English";
  const isBilingual = languageMode === "Bilingual";
  const isFbiseStyle = headerStyle === "style2";

  // Calculate content density so font sizes and spacing compress automatically to fit on 1 page
  const totalQuestions = paperData.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalChars = paperData.sections.reduce(
    (sum, s) =>
      sum +
      s.questions.reduce(
        (qSum, q) =>
          qSum +
          (q.questionEn?.length || 0) +
          (q.questionUr?.length || 0) +
          (q.options?.reduce((oSum, o) => oSum + (o.textEn?.length || 0) + (o.textUr?.length || 0), 0) || 0),
        0
      ),
    0
  );

  const isDensePaper = totalChars > 1400 || totalQuestions > 11;
  // Font sizes in half-points (18 = 9pt, 19 = 9.5pt, 20 = 10pt, 21 = 10.5pt)
  const EN_Q_SIZE = isDensePaper ? 18 : 19;
  const UR_Q_SIZE = isDensePaper ? 20 : 21;
  const EN_OPT_SIZE = isDensePaper ? 17 : 18;
  const UR_OPT_SIZE = isDensePaper ? 18 : 19;

  const docChildren: (Paragraph | Table)[] = [];

  // Reusable border presets
  const borderSolidThick = {
    top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
  };

  const borderSolidThin = {
    top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
  };

  const borderSubtle = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  };

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  const tableBordersNone = {
    ...borderNone,
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  const compactCellMargins = {
    top: 24,
    bottom: 24,
    left: 80,
    right: 80,
  };

  // =========================================================================
  // 1. INSTITUTION & BOARD HEADER BOX (Compact 1-Page Board Style)
  // =========================================================================
  // Column widths: Left (1750) + Center (7446) + Right (1750) = 10946 DXA
  const leftColWidth = 1750;
  const centerColWidth = CONTENT_WIDTH_DXA - leftColWidth * 2;
  const rightColWidth = 1750;

  const parsedLogo = base64ToUint8Array(logoBase64);
  const leftHeaderChildren: Paragraph[] = [];

  if (parsedLogo) {
    leftHeaderChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 15, after: 15 },
        children: [
          new ImageRun({
            data: parsedLogo.bytes,
            transformation: { width: 48, height: 48 },
            type: parsedLogo.type,
          }),
        ],
      })
    );
  } else {
    leftHeaderChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 10 },
        children: [
          new TextRun({
            text: "TEST NO.",
            bold: true,
            size: 15,
            font: ENGLISH_HEADING_FONT,
            color: "334155",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: testNo || "01",
            bold: true,
            size: 22,
            font: ENGLISH_HEADING_FONT,
            color: "0F172A",
          }),
        ],
      })
    );
  }

  const codeDigits = (paperCode || "3044").padEnd(4, "0").slice(0, 4).split("").join(" ");

  const headerTable = new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [leftColWidth, centerColWidth, rightColWidth],
    layout: TableLayoutType.FIXED,
    borders: borderSolidThick,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: leftColWidth, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            borders: borderSolidThick,
            margins: compactCellMargins,
            shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
            children: leftHeaderChildren,
          }),

          new TableCell({
            width: { size: centerColWidth, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            borders: borderSolidThick,
            margins: { top: 25, bottom: 25, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 10, after: 15 },
                children: [
                  new TextRun({
                    text: (paperData.institutionName || "SEEK ACADEMY").toUpperCase(),
                    bold: true,
                    size: 26, // 13pt
                    font: ENGLISH_HEADING_FONT,
                    color: "1A365D",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 15, after: 15 },
                shading: { fill: "1A365D", type: ShadingType.CLEAR },
                children: [
                  new TextRun({
                    text: `  ${(paperTypeBanner || "EXAMINATION 2026-27").toUpperCase()}  `,
                    bold: true,
                    size: 16, // 8pt
                    color: "FFFFFF",
                    font: ENGLISH_HEADING_FONT,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 15, after: 10 },
                children: [
                  new TextRun({
                    text: "Subject: ",
                    bold: true,
                    size: 18,
                    font: ENGLISH_HEADING_FONT,
                  }),
                  new TextRun({
                    text: `${paperData.subject || "Computer Science"}`,
                    bold: true,
                    size: 18,
                    font: URDU_FONT,
                  }),
                  new TextRun({
                    text: "   |   Class: ",
                    bold: true,
                    size: 18,
                    font: ENGLISH_HEADING_FONT,
                  }),
                  new TextRun({
                    text: `${paperData.grade || "10th"}`,
                    bold: true,
                    size: 18,
                    font: ENGLISH_HEADING_FONT,
                  }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: { size: rightColWidth, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            borders: borderSolidThick,
            margins: compactCellMargins,
            shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 15, after: 15 },
                children: [
                  new TextRun({
                    text: "PAPER CODE",
                    bold: true,
                    size: 14,
                    font: ENGLISH_HEADING_FONT,
                    color: "334155",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 10, after: 15 },
                border: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                  left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                  right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
                },
                shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
                children: [
                  new TextRun({
                    text: codeDigits,
                    bold: true,
                    size: 20,
                    font: "Courier New",
                    color: "000000",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
  docChildren.push(headerTable);

  // =========================================================================
  // 2. STUDENT DETAILS & SYLLABUS METADATA TABLE
  // =========================================================================
  if (includeStudentInfo) {
    // 4 Columns: 1450 + 4023 + 1250 + 4223 = 10946 DXA
    const c1 = 1450;
    const c2 = 4023;
    const c3 = 1250;
    const c4 = CONTENT_WIDTH_DXA - (c1 + c2 + c3);

    const infoTable = new Table({
      width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
      columnWidths: [c1, c2, c3, c4],
      layout: TableLayoutType.FIXED,
      borders: borderSolidThin,
      rows: [
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: c1, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              borders: borderSolidThin,
              margins: compactCellMargins,
              shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Student Name:",
                      bold: true,
                      size: 17,
                      font: ENGLISH_HEADING_FONT,
                      color: "1E293B",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: c2, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              borders: borderSolidThin,
              margins: compactCellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "__________________________________",
                      size: 17,
                      font: ENGLISH_FONT,
                      color: "64748B",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: c3, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              borders: borderSolidThin,
              margins: compactCellMargins,
              shading: { fill: "FFF3E0", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Syllabus:",
                      bold: true,
                      size: 17,
                      font: ENGLISH_HEADING_FONT,
                      color: "E65100",
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: c4, type: WidthType.DXA },
              verticalAlign: VerticalAlign.CENTER,
              borders: borderSolidThin,
              margins: compactCellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: syllabus || "Full Syllabus",
                      bold: true,
                      size: 17,
                      font: URDU_FONT,
                      color: "0F172A",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
              columnSpan: 4,
              verticalAlign: VerticalAlign.CENTER,
              borders: borderSolidThin,
              margins: compactCellMargins,
              shading: { fill: "E3F2FD", type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: "Roll No: ______________   |   ",
                      bold: true,
                      size: 17,
                      font: ENGLISH_HEADING_FONT,
                      color: "0D47A1",
                    }),
                    new TextRun({
                      text: `Time: ${paperData.timeAllowed || "1:00 Hour"}   |   `,
                      bold: true,
                      size: 17,
                      font: ENGLISH_HEADING_FONT,
                      color: "0D47A1",
                    }),
                    new TextRun({
                      text: `Total Marks: ${paperData.totalMarks || 25}   |   `,
                      bold: true,
                      size: 17,
                      font: ENGLISH_HEADING_FONT,
                      color: "0D47A1",
                    }),
                    new TextRun({
                      text: `Date: ${paperData.date || "17-10-2026"}`,
                      bold: true,
                      size: 17,
                      font: ENGLISH_HEADING_FONT,
                      color: "0D47A1",
                    }),
                    ...(testNo
                      ? [
                          new TextRun({
                            text: `   |   Test No: ${testNo}`,
                            bold: true,
                            size: 17,
                            font: ENGLISH_HEADING_FONT,
                            color: "0D47A1",
                          }),
                        ]
                      : []),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    docChildren.push(infoTable);
  }

  // =========================================================================
  // 3. INSTRUCTIONS / NOTE CALLOUT BOX
  // =========================================================================
  if (note || noteUr) {
    const noteParagraphs: Paragraph[] = [];
    if (note && !isUrduOnly) {
      noteParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { before: 10, after: noteUr && isBilingual ? 15 : 10 },
          children: [
            new TextRun({
              text: "Note: ",
              bold: true,
              size: 16,
              font: ENGLISH_HEADING_FONT,
              color: "166534",
            }),
            new TextRun({
              text: note,
              italics: true,
              size: 16,
              font: ENGLISH_FONT,
              color: "1E293B",
            }),
          ],
        })
      );
    }
    if ((noteUr && (isUrduOnly || isBilingual)) || (note && isUrduOnly)) {
      noteParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
          spacing: { before: 10, after: 10 },
          children: [
            new TextRun({
              text: "نوٹ: ",
              bold: true,
              size: 18,
              font: URDU_FONT,
              color: "166534",
            }),
            new TextRun({
              text: noteUr || note,
              size: 18,
              font: URDU_FONT,
              color: "1E293B",
            }),
          ],
        })
      );
    }

    if (noteParagraphs.length > 0) {
      docChildren.push(
        new Table({
          width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
          columnWidths: [CONTENT_WIDTH_DXA],
          layout: TableLayoutType.FIXED,
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: "BBF7D0" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "BBF7D0" },
            left: { style: BorderStyle.SINGLE, size: 16, color: "16A34A" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "BBF7D0" },
          },
          rows: [
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
                  margins: { top: 18, bottom: 18, left: 70, right: 70 },
                  shading: { fill: "F0FDF4", type: ShadingType.CLEAR },
                  children: noteParagraphs,
                }),
              ],
            }),
          ],
        })
      );
    }
  }

  // =========================================================================
  // 4. OPTIONAL OMR BUBBLE SHEET GRID (FOR OBJECTIVE SECTION)
  // =========================================================================
  const firstMcqSection = paperData.sections.find((s) => s.type === "mcq");
  if (includeBubbleSheet && firstMcqSection && firstMcqSection.questions.length > 0) {
    const mcqTotal = firstMcqSection.questions.length;
    const colsPerRow = 5;
    const colW = Math.floor(CONTENT_WIDTH_DXA / colsPerRow);
    const colWidths = [colW, colW, colW, colW, CONTENT_WIDTH_DXA - colW * 4];
    const numRows = Math.ceil(mcqTotal / colsPerRow);

    const bubbleRows: TableRow[] = [];
    for (let r = 0; r < numRows; r++) {
      const cells: TableCell[] = [];
      for (let c = 0; c < colsPerRow; c++) {
        const qIdx = r * colsPerRow + c;
        const qNumStr = (qIdx + 1).toString().padStart(2, "0");
        cells.push(
          new TableCell({
            width: { size: colWidths[c], type: WidthType.DXA },
            borders: borderSolidThin,
            margins: { top: 20, bottom: 20, left: 40, right: 40 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children:
                  qIdx < mcqTotal
                    ? [
                        new TextRun({
                          text: `${qNumStr}. `,
                          bold: true,
                          size: 16,
                          font: ENGLISH_HEADING_FONT,
                        }),
                        new TextRun({
                          text: "Ⓐ Ⓑ Ⓒ Ⓓ",
                          size: 16,
                          font: "Segoe UI Symbol",
                        }),
                      ]
                    : [],
              }),
            ],
          })
        );
      }
      bubbleRows.push(new TableRow({ cantSplit: true, children: cells }));
    }

    docChildren.push(
      new Table({
        width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
        columnWidths: colWidths,
        layout: TableLayoutType.FIXED,
        borders: borderSolidThin,
        rows: bubbleRows,
      })
    );
  }

  // =========================================================================
  // 5. SECTIONS & QUESTIONS (BILINGUAL, ENGLISH & URDU — 1-PAGE COMPACT)
  // =========================================================================
  paperData.sections.forEach((section, sIdx) => {
    const isMcq = section.type === "mcq";
    const defaultTitleEn = isMcq
      ? "SECTION-I: OBJECTIVE (MCQs)"
      : section.type === "long" || section.type === "essay"
      ? `SECTION-${toRoman(sIdx + 1).toUpperCase()}: LONG QUESTIONS`
      : `SECTION-${toRoman(sIdx + 1).toUpperCase()}: SUBJECTIVE QUESTIONS`;

    const defaultTitleUr = isMcq
      ? "حصہ اول: معروضی سوالات"
      : section.type === "long" || section.type === "essay"
      ? "حصہ سوم: تفصیلی سوالات"
      : "حصہ دوم: انشائیہ سوالات";

    const secTitleEn = section.titleEn || defaultTitleEn;
    const secTitleUr = section.titleUr || defaultTitleUr;
    const marksBadgeEn = section.marks ? `[ Marks: ${section.marks} ]` : "";
    const marksBadgeUr = section.marks ? `(${section.marks} نمبر)` : "";

    // --- SECTION HEADER BAR TABLE (with keepNext: true so it never orphans at page bottom) ---
    const sectionBannerBorders = {
      top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
    };

    if (isBilingual) {
      // 3-Column Section Bar: Left English (4700) | Center Marks (1546) | Right Urdu (4700) = 10946 DXA
      docChildren.push(
        new Table({
          width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
          columnWidths: [4700, 1546, 4700],
          layout: TableLayoutType.FIXED,
          borders: sectionBannerBorders,
          rows: [
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: 4700, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 28, bottom: 28, left: 60, right: 40 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      keepNext: true,
                      alignment: AlignmentType.LEFT,
                      children: [
                        new TextRun({
                          text: secTitleEn.toUpperCase(),
                          bold: true,
                          size: 19,
                          font: ENGLISH_HEADING_FONT,
                          color: "0F172A",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 1546, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 28, bottom: 28, left: 20, right: 20 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      keepNext: true,
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: marksBadgeEn,
                          bold: true,
                          size: 18,
                          font: ENGLISH_HEADING_FONT,
                          color: "1E293B",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 4700, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 28, bottom: 28, left: 40, right: 60 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      keepNext: true,
                      alignment: AlignmentType.RIGHT,
                      bidirectional: true,
                      children: [
                        new TextRun({
                          text: secTitleUr,
                          bold: true,
                          size: 21,
                          font: URDU_FONT,
                          color: "0F172A",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    } else if (isUrduOnly) {
      docChildren.push(
        new Table({
          width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
          columnWidths: [2400, CONTENT_WIDTH_DXA - 2400],
          layout: TableLayoutType.FIXED,
          borders: sectionBannerBorders,
          rows: [
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: 2400, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 28, bottom: 28, left: 60, right: 40 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      keepNext: true,
                      alignment: AlignmentType.LEFT,
                      children: [
                        new TextRun({
                          text: marksBadgeUr,
                          bold: true,
                          size: 19,
                          font: URDU_FONT,
                          color: "0F172A",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: CONTENT_WIDTH_DXA - 2400, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 28, bottom: 28, left: 40, right: 60 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      keepNext: true,
                      alignment: AlignmentType.RIGHT,
                      bidirectional: true,
                      children: [
                        new TextRun({
                          text: secTitleUr,
                          bold: true,
                          size: 21,
                          font: URDU_FONT,
                          color: "0F172A",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    } else {
      docChildren.push(
        new Table({
          width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
          columnWidths: [CONTENT_WIDTH_DXA - 2400, 2400],
          layout: TableLayoutType.FIXED,
          borders: sectionBannerBorders,
          rows: [
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: CONTENT_WIDTH_DXA - 2400, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 28, bottom: 28, left: 60, right: 40 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      keepNext: true,
                      alignment: AlignmentType.LEFT,
                      children: [
                        new TextRun({
                          text: secTitleEn.toUpperCase(),
                          bold: true,
                          size: 19,
                          font: ENGLISH_HEADING_FONT,
                          color: "0F172A",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 2400, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 28, bottom: 28, left: 40, right: 60 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      keepNext: true,
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: marksBadgeEn,
                          bold: true,
                          size: 18,
                          font: ENGLISH_HEADING_FONT,
                          color: "0F172A",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    }

    // =======================================================================
    // 5A. MCQ QUESTIONS RENDERING
    // =======================================================================
    if (isMcq) {
      if (isFbiseStyle) {
        // --- STYLE 2: FEDERAL BOARD (FBISE) MASTER MCQ TABLE ---
        const fbColWidths = [5346, 1400, 1400, 1400, 1400];
        const fbRows: TableRow[] = [
          new TableRow({
            cantSplit: true,
            tableHeader: true,
            children: [
              new TableCell({
                width: { size: 5346, type: WidthType.DXA },
                borders: borderSolidThin,
                margins: compactCellMargins,
                shading: { fill: "E2E8F0", type: ShadingType.CLEAR },
                children: [
                  new Paragraph({
                    keepNext: true,
                    alignment: isUrduOnly ? AlignmentType.RIGHT : AlignmentType.LEFT,
                    bidirectional: isUrduOnly,
                    children: [
                      new TextRun({
                        text: isUrduOnly
                          ? "سوال"
                          : isBilingual
                          ? "Question / سوال"
                          : "Question",
                        bold: true,
                        size: 18,
                        font: isUrduOnly ? URDU_FONT : ENGLISH_HEADING_FONT,
                      }),
                    ],
                  }),
                ],
              }),
              ...["(A)", "(B)", "(C)", "(D)"].map(
                (label) =>
                  new TableCell({
                    width: { size: 1400, type: WidthType.DXA },
                    borders: borderSolidThin,
                    margins: compactCellMargins,
                    shading: { fill: "E2E8F0", type: ShadingType.CLEAR },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        keepNext: true,
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: label,
                            bold: true,
                            size: 17,
                            font: ENGLISH_HEADING_FONT,
                          }),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          }),
        ];

        section.questions.forEach((q, qIdx) => {
          const qNum = qIdx + 1;
          const qEn = formatMathForWord(q.questionEn || q.questionUr || "");
          const qUr = formatMathForWord(q.questionUr || q.questionEn || "");
          const hasDistinctUr = Boolean(qUr && qUr !== qEn);

          const stemParas: Paragraph[] = [];
          if (!isUrduOnly && qEn) {
            stemParas.push(
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { after: isBilingual && hasDistinctUr ? 15 : 0 },
                children: [
                  new TextRun({
                    text: `${qNum}. `,
                    bold: true,
                    size: EN_Q_SIZE,
                    font: ENGLISH_HEADING_FONT,
                  }),
                  new TextRun({
                    text: qEn,
                    bold: true,
                    size: EN_Q_SIZE,
                    font: ENGLISH_FONT,
                  }),
                ],
              })
            );
          }
          if (isUrduOnly || (isBilingual && hasDistinctUr)) {
            stemParas.push(
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                children: [
                  ...(isUrduOnly
                    ? [
                        new TextRun({
                          text: `(${qNum}) `,
                          bold: true,
                          size: EN_Q_SIZE,
                          font: ENGLISH_HEADING_FONT,
                        }),
                      ]
                    : []),
                  new TextRun({
                    text: qUr,
                    bold: true,
                    size: UR_Q_SIZE,
                    font: URDU_FONT,
                  }),
                ],
              })
            );
          }

          const opts = q.options || [];
          const optCells = [0, 1, 2, 3].map((oIdx) => {
            const opt = opts[oIdx];
            const oEn = formatMathForWord(opt?.textEn || opt?.textUr || "");
            const oUr = formatMathForWord(opt?.textUr || opt?.textEn || "");
            const optHasUr = Boolean(oUr && oUr !== oEn);

            const cellParas: Paragraph[] = [];
            if (!isUrduOnly && oEn) {
              cellParas.push(
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: oEn,
                      size: EN_OPT_SIZE,
                      font: ENGLISH_FONT,
                    }),
                  ],
                })
              );
            }
            if (isUrduOnly || (isBilingual && optHasUr)) {
              cellParas.push(
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  bidirectional: true,
                  children: [
                    new TextRun({
                      text: oUr,
                      size: UR_OPT_SIZE,
                      font: URDU_FONT,
                    }),
                  ],
                })
              );
            }

            return new TableCell({
              width: { size: 1400, type: WidthType.DXA },
              borders: borderSolidThin,
              margins: compactCellMargins,
              verticalAlign: VerticalAlign.CENTER,
              children: cellParas.length > 0 ? cellParas : [new Paragraph({ children: [] })],
            });
          });

          fbRows.push(
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: 5346, type: WidthType.DXA },
                  borders: borderSolidThin,
                  margins: compactCellMargins,
                  verticalAlign: VerticalAlign.CENTER,
                  children: stemParas,
                }),
                ...optCells,
              ],
            })
          );
        });

        docChildren.push(
          new Table({
            width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
            columnWidths: fbColWidths,
            layout: TableLayoutType.FIXED,
            borders: borderSolidThin,
            rows: fbRows,
          })
        );
      } else {
        // --- STYLE 1: PUNJAB BOARDS COMPACT MCQ TABLE ---
        // 4 equal option columns: 2736 + 2736 + 2737 + 2737 = 10946 DXA
        const optColWidths = [2736, 2737, 2736, 2737];
        const allMcqRows: TableRow[] = [];

        section.questions.forEach((q, qIdx) => {
          const qNum = qIdx + 1;
          const qEn = formatMathForWord(q.questionEn || q.questionUr || "");
          const qUr = formatMathForWord(q.questionUr || q.questionEn || "");
          const hasDistinctUr = Boolean(qUr && qUr !== qEn);

          // Row 1: Question Stem (with keepNext: true so stem is never separated from its options!)
          if (isBilingual && hasDistinctUr) {
            allMcqRows.push(
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({
                    width: { size: HALF_WIDTH_DXA, type: WidthType.DXA },
                    columnSpan: 2,
                    borders: borderNone,
                    margins: { top: 28, bottom: 12, left: 40, right: 60 },
                    verticalAlign: VerticalAlign.TOP,
                    children: [
                      new Paragraph({
                        keepNext: true,
                        alignment: AlignmentType.LEFT,
                        children: [
                          new TextRun({
                            text: `${qNum}. `,
                            bold: true,
                            size: EN_Q_SIZE,
                            font: ENGLISH_HEADING_FONT,
                            color: "0F172A",
                          }),
                          new TextRun({
                            text: qEn,
                            bold: true,
                            size: EN_Q_SIZE,
                            font: ENGLISH_FONT,
                            color: "0F172A",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: CONTENT_WIDTH_DXA - HALF_WIDTH_DXA, type: WidthType.DXA },
                    columnSpan: 2,
                    borders: borderNone,
                    margins: { top: 28, bottom: 12, left: 60, right: 40 },
                    verticalAlign: VerticalAlign.TOP,
                    children: [
                      new Paragraph({
                        keepNext: true,
                        alignment: AlignmentType.RIGHT,
                        bidirectional: true,
                        children: [
                          new TextRun({
                            text: qUr,
                            bold: true,
                            size: UR_Q_SIZE,
                            font: URDU_FONT,
                            color: "0F172A",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              })
            );
          } else {
            const stemText = isUrduOnly ? qUr || qEn : qEn || qUr;
            allMcqRows.push(
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({
                    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
                    columnSpan: 4,
                    borders: borderNone,
                    margins: { top: 28, bottom: 12, left: 40, right: 40 },
                    children: [
                      new Paragraph({
                        keepNext: true,
                        alignment: isUrduOnly ? AlignmentType.RIGHT : AlignmentType.LEFT,
                        bidirectional: isUrduOnly,
                        children: [
                          new TextRun({
                            text: isUrduOnly ? `(${qNum}) ` : `${qNum}. `,
                            bold: true,
                            size: EN_Q_SIZE,
                            font: ENGLISH_HEADING_FONT,
                            color: "0F172A",
                          }),
                          new TextRun({
                            text: stemText,
                            bold: true,
                            size: isUrduOnly ? UR_Q_SIZE : EN_Q_SIZE,
                            font: isUrduOnly ? URDU_FONT : ENGLISH_FONT,
                            color: "0F172A",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              })
            );
          }

          // Row 2: Options Row (4 columns if short/medium, or 2x2 if any option is > 28 chars)
          if (q.options && q.options.length > 0) {
            const rawOptions = q.options.slice(0, 4);
            while (rawOptions.length < 4) {
              rawOptions.push({
                key: String.fromCharCode(65 + rawOptions.length),
                textEn: "",
                textUr: "",
              });
            }

            const buildOptionCell = (
              opt: { key: string; textEn?: string; textUr?: string },
              colWidth: number,
              colSpan: number,
              hasBottomBorder: boolean
            ) => {
              const oEn = formatMathForWord(opt.textEn || opt.textUr || "");
              const oUr = formatMathForWord(opt.textUr || opt.textEn || "");
              const optHasDistinctUr = Boolean(oUr && oUr !== oEn);
              const optKeyLabel = isUrduOnly
                ? `(${getUrduOptionKey(opt.key)}) `
                : `(${opt.key}) `;

              const optionRuns: TextRun[] = [
                new TextRun({
                  text: optKeyLabel,
                  bold: true,
                  size: isUrduOnly ? UR_OPT_SIZE : EN_OPT_SIZE,
                  font: isUrduOnly ? URDU_FONT : ENGLISH_HEADING_FONT,
                  color: "0F172A",
                }),
              ];

              if (isUrduOnly) {
                optionRuns.push(
                  new TextRun({
                    text: oUr,
                    size: UR_OPT_SIZE,
                    font: URDU_FONT,
                    color: "1E293B",
                  })
                );
              } else if (isEnglishOnly || !optHasDistinctUr) {
                optionRuns.push(
                  new TextRun({
                    text: oEn,
                    size: EN_OPT_SIZE,
                    font: ENGLISH_FONT,
                    color: "1E293B",
                  })
                );
              } else {
                optionRuns.push(
                  new TextRun({
                    text: `${oEn} `,
                    size: EN_OPT_SIZE,
                    font: ENGLISH_FONT,
                    color: "1E293B",
                  }),
                  new TextRun({
                    text: `(${oUr})`,
                    size: UR_OPT_SIZE,
                    font: URDU_FONT,
                    color: "334155",
                  })
                );
              }

              return new TableCell({
                width: { size: colWidth, type: WidthType.DXA },
                columnSpan: colSpan > 1 ? colSpan : undefined,
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  bottom: hasBottomBorder
                    ? { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" }
                    : { style: BorderStyle.NONE, size: 0, color: "auto" },
                  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                },
                margins: { top: 8, bottom: hasBottomBorder ? 26 : 10, left: 60, right: 60 },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: isUrduOnly ? AlignmentType.RIGHT : AlignmentType.LEFT,
                    bidirectional: isUrduOnly,
                    children: optionRuns,
                  }),
                ],
              });
            };

            const maxOptLen = Math.max(
              ...rawOptions.map((o) => {
                const en = o.textEn || "";
                const ur = o.textUr || "";
                return isBilingual && ur !== en ? en.length + ur.length + 3 : (isUrduOnly ? ur : en).length;
              })
            );

            if (maxOptLen > 28) {
              // 2x2 grid (2 columns per row, each spanning 2 columns = 5473 DXA) so long bilingual options don't wrap into 3 lines
              const row1Opts = isUrduOnly ? [rawOptions[1], rawOptions[0]] : [rawOptions[0], rawOptions[1]];
              const row2Opts = isUrduOnly ? [rawOptions[3], rawOptions[2]] : [rawOptions[2], rawOptions[3]];

              allMcqRows.push(
                new TableRow({
                  cantSplit: true,
                  children: [
                    buildOptionCell(row1Opts[0], HALF_WIDTH_DXA, 2, false),
                    buildOptionCell(row1Opts[1], CONTENT_WIDTH_DXA - HALF_WIDTH_DXA, 2, false),
                  ],
                }),
                new TableRow({
                  cantSplit: true,
                  children: [
                    buildOptionCell(row2Opts[0], HALF_WIDTH_DXA, 2, true),
                    buildOptionCell(row2Opts[1], CONTENT_WIDTH_DXA - HALF_WIDTH_DXA, 2, true),
                  ],
                })
              );
            } else {
              // All 4 options on 1 single horizontal row
              const orderedOptions = isUrduOnly ? [...rawOptions].reverse() : rawOptions;
              allMcqRows.push(
                new TableRow({
                  cantSplit: true,
                  children: orderedOptions.map((opt, cIdx) =>
                    buildOptionCell(opt, optColWidths[cIdx], 1, true)
                  ),
                })
              );
            }
          }
        });

        if (allMcqRows.length > 0) {
          docChildren.push(
            new Table({
              width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
              columnWidths: optColWidths,
              layout: TableLayoutType.FIXED,
              borders: tableBordersNone,
              rows: allMcqRows,
            })
          );
        }
      }
    } else if (section.type === "poetry") {
      // =====================================================================
      // 5B. POETRY STANZAS RENDERING
      // =====================================================================
      section.questions.forEach((q, qIdx) => {
        const romanNum = toRoman(qIdx + 1);
        docChildren.push(
          new Paragraph({
            keepNext: true,
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 40, after: 15 },
            children: [
              new TextRun({
                text: `شعر (${romanNum}):`,
                bold: true,
                size: 19,
                font: URDU_FONT,
              }),
            ],
          })
        );
        q.poetryLines?.forEach((line) => {
          docChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              spacing: { before: 12, after: 12 },
              children: [
                new TextRun({
                  text: `"${line}"`,
                  bold: true,
                  size: 20,
                  font: URDU_FONT,
                }),
              ],
            })
          );
        });
      });
    } else {
      // =====================================================================
      // 5C. SUBJECTIVE QUESTIONS (SHORT & LONG QUESTIONS)
      // =====================================================================
      const isLongSection = section.type === "long" || section.type === "essay";
      const subRows: TableRow[] = [];

      section.questions.forEach((q: ExamQuestion, qIdx: number) => {
        const romanLabel = isLongSection
          ? `Q.${qIdx + 3}:`
          : `(${toRoman(qIdx + 1)})`;

        const qEn = formatMathForWord(q.questionEn || q.questionUr || "");
        const qUr = formatMathForWord(q.questionUr || q.questionEn || "");
        const hasDistinctUr = Boolean(qUr && qUr !== qEn);
        const marksSuffixEn = isLongSection && q.marks ? `  [${q.marks}]` : "";
        const marksSuffixUr = isLongSection && q.marks ? `  (${q.marks})` : "";

        const rowBottomBorder = {
          top: { style: BorderStyle.NONE, size: 0, color: "auto" },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
          left: { style: BorderStyle.NONE, size: 0, color: "auto" },
          right: { style: BorderStyle.NONE, size: 0, color: "auto" },
        };

        if (isBilingual && hasDistinctUr) {
          // Side-by-Side 2-Column Row: Left English (5473 DXA, LTR) | Right Urdu (5473 DXA, RTL)
          subRows.push(
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: HALF_WIDTH_DXA, type: WidthType.DXA },
                  borders: rowBottomBorder,
                  margins: { top: 28, bottom: 28, left: 50, right: 70 },
                  verticalAlign: VerticalAlign.TOP,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.LEFT,
                      children: [
                        new TextRun({
                          text: `${romanLabel} `,
                          bold: true,
                          size: EN_Q_SIZE,
                          font: ENGLISH_HEADING_FONT,
                          color: "0F172A",
                        }),
                        new TextRun({
                          text: qEn,
                          bold: isLongSection,
                          size: EN_Q_SIZE,
                          font: ENGLISH_FONT,
                          color: "0F172A",
                        }),
                        ...(marksSuffixEn
                          ? [
                              new TextRun({
                                text: marksSuffixEn,
                                bold: true,
                                size: 17,
                                font: ENGLISH_HEADING_FONT,
                                color: "334155",
                              }),
                            ]
                          : []),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: CONTENT_WIDTH_DXA - HALF_WIDTH_DXA, type: WidthType.DXA },
                  borders: rowBottomBorder,
                  margins: { top: 28, bottom: 28, left: 70, right: 50 },
                  verticalAlign: VerticalAlign.TOP,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      bidirectional: true,
                      children: [
                        new TextRun({
                          text: `${romanLabel} `,
                          bold: true,
                          size: EN_Q_SIZE,
                          font: ENGLISH_HEADING_FONT,
                          color: "0F172A",
                        }),
                        new TextRun({
                          text: qUr,
                          bold: true,
                          size: UR_Q_SIZE,
                          font: URDU_FONT,
                          color: "0F172A",
                        }),
                        ...(marksSuffixUr
                          ? [
                              new TextRun({
                                text: marksSuffixUr,
                                bold: true,
                                size: 18,
                                font: ENGLISH_HEADING_FONT,
                                color: "334155",
                              }),
                            ]
                          : []),
                      ],
                    }),
                  ],
                }),
              ],
            })
          );
        } else {
          const singleText = isUrduOnly ? qUr || qEn : qEn || qUr;
          subRows.push(
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
                  columnSpan: 2,
                  borders: rowBottomBorder,
                  margins: { top: 28, bottom: 28, left: 50, right: 50 },
                  verticalAlign: VerticalAlign.TOP,
                  children: [
                    new Paragraph({
                      alignment: isUrduOnly ? AlignmentType.RIGHT : AlignmentType.LEFT,
                      bidirectional: isUrduOnly,
                      children: [
                        new TextRun({
                          text: `${romanLabel} `,
                          bold: true,
                          size: EN_Q_SIZE,
                          font: ENGLISH_HEADING_FONT,
                          color: "0F172A",
                        }),
                        new TextRun({
                          text: singleText,
                          bold: isUrduOnly || isLongSection,
                          size: isUrduOnly ? UR_Q_SIZE : EN_Q_SIZE,
                          font: isUrduOnly ? URDU_FONT : ENGLISH_FONT,
                          color: "0F172A",
                        }),
                        ...(isLongSection && q.marks
                          ? [
                              new TextRun({
                                text: isUrduOnly ? marksSuffixUr : marksSuffixEn,
                                bold: true,
                                size: 17,
                                font: ENGLISH_HEADING_FONT,
                                color: "334155",
                              }),
                            ]
                          : []),
                      ],
                    }),
                  ],
                }),
              ],
            })
          );
        }
      });

      if (subRows.length > 0) {
        docChildren.push(
          new Table({
            width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
            columnWidths: [HALF_WIDTH_DXA, CONTENT_WIDTH_DXA - HALF_WIDTH_DXA],
            layout: TableLayoutType.FIXED,
            borders: tableBordersNone,
            rows: subRows,
          })
        );
      }
    }
  });

  // =========================================================================
  // 6. OPTIONAL OFFICIAL ANSWER KEY & RUBRIC SECTION
  // =========================================================================
  if (includeAnswerKey && answerKeyItems.length > 0) {
    docChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 80 },
        children: [
          new TextRun({
            text: `OFFICIAL ANSWER KEY — ${(paperData.institutionName || "EXAM PAPER").toUpperCase()} (CODE: ${paperCode || "3044"})`,
            bold: true,
            size: 22,
            font: ENGLISH_HEADING_FONT,
            color: "1A365D",
          }),
        ],
      })
    );

    const keyRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 1200, type: WidthType.DXA },
            borders: borderSolidThin,
            margins: compactCellMargins,
            shading: { fill: "E2E8F0", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Q. No", bold: true, size: 17, font: ENGLISH_HEADING_FONT }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: CONTENT_WIDTH_DXA - 4000, type: WidthType.DXA },
            borders: borderSolidThin,
            margins: compactCellMargins,
            shading: { fill: "E2E8F0", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Question Stem", bold: true, size: 17, font: ENGLISH_HEADING_FONT }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 2800, type: WidthType.DXA },
            borders: borderSolidThin,
            margins: compactCellMargins,
            shading: { fill: "E2E8F0", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Correct Answer", bold: true, size: 17, font: ENGLISH_HEADING_FONT }),
                ],
              }),
            ],
          }),
        ],
      }),
    ];

    answerKeyItems.forEach((item) => {
      keyRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: 1200, type: WidthType.DXA },
              borders: borderSubtle,
              margins: compactCellMargins,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `${item.number}`,
                      bold: true,
                      size: 17,
                      font: ENGLISH_HEADING_FONT,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: CONTENT_WIDTH_DXA - 4000, type: WidthType.DXA },
              borders: borderSubtle,
              margins: compactCellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: formatMathForWord(item.question),
                      size: 17,
                      font: ENGLISH_FONT,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 2800, type: WidthType.DXA },
              borders: borderSubtle,
              margins: compactCellMargins,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: formatMathForWord(item.answer),
                      bold: true,
                      size: 17,
                      font: ENGLISH_HEADING_FONT,
                      color: "166534",
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
    });

    docChildren.push(
      new Table({
        width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
        columnWidths: [1200, CONTENT_WIDTH_DXA - 4000, 2800],
        layout: TableLayoutType.FIXED,
        borders: borderSolidThin,
        rows: keyRows,
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: PAGE_WIDTH_DXA,
              height: PAGE_HEIGHT_DXA,
              orientation: PageOrientation.PORTRAIT,
            },
            margin: {
              top: MARGIN_Y_DXA, // ~0.24 inch (6mm)
              right: MARGIN_X_DXA, // ~0.33 inch (8.5mm)
              bottom: MARGIN_Y_DXA,
              left: MARGIN_X_DXA,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
