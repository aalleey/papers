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
// A4 width = 11906 DXA (210mm). Margins = 650 DXA left + 650 DXA right = 1300 DXA.
// Exact printable content width = 10606 DXA.
const PAGE_WIDTH_DXA = 11906;
const PAGE_HEIGHT_DXA = 16838;
const MARGIN_DXA = 650;
const CONTENT_WIDTH_DXA = PAGE_WIDTH_DXA - MARGIN_DXA * 2; // 10606 DXA

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
    "8": "₈",
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

  // Common operators and Greek letters
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

  // Strip remaining stray LaTeX backslashes on simple commands
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
    // Note: docx ImageRun supports png, jpg, gif, bmp
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

  const docChildren: (Paragraph | Table)[] = [];

  // Reusable border presets
  const borderSolidThick = {
    top: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
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

  const defaultCellMargins = {
    top: 60,
    bottom: 60,
    left: 110,
    right: 110,
  };

  const compactCellMargins = {
    top: 45,
    bottom: 45,
    left: 90,
    right: 90,
  };

  // =========================================================================
  // 1. INSTITUTION & BOARD HEADER BOX (Matches Live Preview 1:1)
  // =========================================================================
  // Column widths: Left (1850) + Center (6906) + Right (1850) = 10606 DXA
  const leftColWidth = 1850;
  const centerColWidth = 6906;
  const rightColWidth = 1850;

  const parsedLogo = base64ToUint8Array(logoBase64);
  const leftHeaderChildren: Paragraph[] = [];

  if (parsedLogo) {
    leftHeaderChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [
          new ImageRun({
            data: parsedLogo.bytes,
            transformation: { width: 58, height: 58 },
            type: parsedLogo.type,
          }),
        ],
      })
    );
  } else {
    leftHeaderChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 20 },
        children: [
          new TextRun({
            text: "TEST NO.",
            bold: true,
            size: 16,
            font: ENGLISH_HEADING_FONT,
            color: "334155",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: testNo || "01",
            bold: true,
            size: 26,
            font: ENGLISH_HEADING_FONT,
            color: "0F172A",
          }),
        ],
      })
    );
  }

  const codeDigits = (paperCode || "3044").padEnd(4, "0").slice(0, 4).split("").join("  ");

  const headerTable = new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [leftColWidth, centerColWidth, rightColWidth],
    layout: TableLayoutType.FIXED,
    borders: borderSolidThick,
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          // Left: Academy Logo or Test No Box
          new TableCell({
            width: { size: leftColWidth, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            borders: borderSolidThick,
            margins: compactCellMargins,
            shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
            children: leftHeaderChildren,
          }),

          // Center: Institution Name + Dark Navy Banner + Subject/Class
          new TableCell({
            width: { size: centerColWidth, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            borders: borderSolidThick,
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 20, after: 40 },
                children: [
                  new TextRun({
                    text: (paperData.institutionName || "SEEK ACADEMY").toUpperCase(),
                    bold: true,
                    size: 30, // 15pt
                    font: ENGLISH_HEADING_FONT,
                    color: "1A365D",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 30, after: 30 },
                shading: { fill: "1A365D", type: ShadingType.CLEAR },
                children: [
                  new TextRun({
                    text: `  ${(paperTypeBanner || "EXAMINATION 2026-27").toUpperCase()}  `,
                    bold: true,
                    size: 18, // 9pt
                    color: "FFFFFF",
                    font: ENGLISH_HEADING_FONT,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 20 },
                children: [
                  new TextRun({
                    text: "Subject: ",
                    bold: true,
                    size: 20,
                    font: ENGLISH_HEADING_FONT,
                  }),
                  new TextRun({
                    text: `${paperData.subject || "Computer Science"}`,
                    bold: true,
                    size: 20,
                    font: URDU_FONT,
                  }),
                  new TextRun({
                    text: "    |    Class: ",
                    bold: true,
                    size: 20,
                    font: ENGLISH_HEADING_FONT,
                  }),
                  new TextRun({
                    text: `${paperData.grade || "10th"}`,
                    bold: true,
                    size: 20,
                    font: ENGLISH_HEADING_FONT,
                  }),
                ],
              }),
            ],
          }),

          // Right: Paper Code Box
          new TableCell({
            width: { size: rightColWidth, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            borders: borderSolidThick,
            margins: compactCellMargins,
            shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 30 },
                children: [
                  new TextRun({
                    text: "PAPER CODE",
                    bold: true,
                    size: 16,
                    font: ENGLISH_HEADING_FONT,
                    color: "334155",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 20, after: 40 },
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
                    size: 22,
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
    // 4 Columns: 1500 + 3803 + 1300 + 4003 = 10606 DXA
    const c1 = 1500;
    const c2 = 3803;
    const c3 = 1300;
    const c4 = 4003;

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
                      size: 18,
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
                      size: 18,
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
                      size: 18,
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
                      size: 18,
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
                      text: "Roll No: ______________    |    ",
                      bold: true,
                      size: 18,
                      font: ENGLISH_HEADING_FONT,
                      color: "0D47A1",
                    }),
                    new TextRun({
                      text: `Time Allowed: ${paperData.timeAllowed || "2:30 Hours"}    |    `,
                      bold: true,
                      size: 18,
                      font: ENGLISH_HEADING_FONT,
                      color: "0D47A1",
                    }),
                    new TextRun({
                      text: `Total Marks: ${paperData.totalMarks || 75}    |    `,
                      bold: true,
                      size: 18,
                      font: ENGLISH_HEADING_FONT,
                      color: "0D47A1",
                    }),
                    new TextRun({
                      text: `Date: ${paperData.date || "17-10-2026"}`,
                      bold: true,
                      size: 18,
                      font: ENGLISH_HEADING_FONT,
                      color: "0D47A1",
                    }),
                    ...(testNo
                      ? [
                          new TextRun({
                            text: `    |    Test No: ${testNo}`,
                            bold: true,
                            size: 18,
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
          spacing: { before: 20, after: noteUr && isBilingual ? 30 : 20 },
          children: [
            new TextRun({
              text: "Note: ",
              bold: true,
              size: 18,
              font: ENGLISH_HEADING_FONT,
              color: "166534",
            }),
            new TextRun({
              text: note,
              italics: true,
              size: 18,
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
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({
              text: "نوٹ: ",
              bold: true,
              size: 20,
              font: URDU_FONT,
              color: "166534",
            }),
            new TextRun({
              text: noteUr || note,
              size: 20,
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
            left: { style: BorderStyle.SINGLE, size: 18, color: "16A34A" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "BBF7D0" },
          },
          rows: [
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
                  margins: compactCellMargins,
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

  // Small spacing before first section
  docChildren.push(
    new Paragraph({
      spacing: { before: 60, after: 20 },
      children: [],
    })
  );

  // =========================================================================
  // 4. OPTIONAL OMR BUBBLE SHEET GRID (FOR OBJECTIVE SECTION)
  // =========================================================================
  const firstMcqSection = paperData.sections.find((s) => s.type === "mcq");
  if (includeBubbleSheet && firstMcqSection && firstMcqSection.questions.length > 0) {
    const mcqTotal = firstMcqSection.questions.length;
    const colsPerRow = 5;
    const colW = Math.floor(CONTENT_WIDTH_DXA / colsPerRow); // 2121 DXA each
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
            margins: { top: 40, bottom: 40, left: 60, right: 60 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children:
                  qIdx < mcqTotal
                    ? [
                        new TextRun({
                          text: `${qNumStr}.  `,
                          bold: true,
                          size: 17,
                          font: ENGLISH_HEADING_FONT,
                        }),
                        new TextRun({
                          text: "Ⓐ  Ⓑ  Ⓒ  Ⓓ",
                          size: 18,
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
      }),
      new Paragraph({ spacing: { before: 60, after: 20 }, children: [] })
    );
  }

  // =========================================================================
  // 5. SECTIONS & QUESTIONS (BILINGUAL, ENGLISH & URDU)
  // =========================================================================
  paperData.sections.forEach((section, sIdx) => {
    const isMcq = section.type === "mcq";
    const defaultTitleEn = isMcq
      ? "SECTION-I: OBJECTIVE (MCQs)"
      : section.type === "long" || section.type === "essay"
      ? `SECTION-${toRoman(sIdx + 1).toUpperCase()}: LONG QUESTIONS`
      : `SECTION-${toRoman(sIdx + 1).toUpperCase()}: SHORT QUESTIONS`;

    const defaultTitleUr = isMcq
      ? "حصہ اول: معروضی سوالات"
      : section.type === "long" || section.type === "essay"
      ? "حصہ سوم: تفصیلی سوالات"
      : "حصہ دوم: مختصر سوالات";

    const secTitleEn = section.titleEn || defaultTitleEn;
    const secTitleUr = section.titleUr || defaultTitleUr;
    const marksBadgeEn = section.marks ? `[ Marks: ${section.marks} ]` : "";
    const marksBadgeUr = section.marks ? `(${section.marks} نمبر)` : "";

    // --- SECTION HEADER BAR TABLE ---
    const sectionBannerBorders = {
      top: { style: BorderStyle.SINGLE, size: 10, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
    };

    if (isBilingual) {
      // 3-Column Section Bar: Left English (4500) | Center Marks (1606) | Right Urdu (4500) = 10606 DXA
      docChildren.push(
        new Table({
          width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
          columnWidths: [4500, 1606, 4500],
          layout: TableLayoutType.FIXED,
          borders: sectionBannerBorders,
          rows: [
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: 4500, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 55, bottom: 55, left: 80, right: 60 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.LEFT,
                      children: [
                        new TextRun({
                          text: secTitleEn.toUpperCase(),
                          bold: true,
                          size: 20, // 10pt
                          font: ENGLISH_HEADING_FONT,
                          color: "0F172A",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 1606, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 55, bottom: 55, left: 40, right: 40 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: marksBadgeEn,
                          bold: true,
                          size: 19,
                          font: ENGLISH_HEADING_FONT,
                          color: "1E293B",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 4500, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 55, bottom: 55, left: 60, right: 80 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      bidirectional: true,
                      children: [
                        new TextRun({
                          text: secTitleUr,
                          bold: true,
                          size: 24, // 12pt Nastaliq
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
      // 2-Column Urdu RTL Section Bar: Left Marks (2400) | Right Urdu Title (8206) = 10606 DXA
      docChildren.push(
        new Table({
          width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
          columnWidths: [2400, 8206],
          layout: TableLayoutType.FIXED,
          borders: sectionBannerBorders,
          rows: [
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: 2400, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 55, bottom: 55, left: 80, right: 60 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.LEFT,
                      children: [
                        new TextRun({
                          text: marksBadgeUr,
                          bold: true,
                          size: 20,
                          font: URDU_FONT,
                          color: "0F172A",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 8206, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 55, bottom: 55, left: 60, right: 80 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      bidirectional: true,
                      children: [
                        new TextRun({
                          text: secTitleUr,
                          bold: true,
                          size: 24,
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
      // 2-Column English LTR Section Bar: Left English Title (8206) | Right Marks (2400) = 10606 DXA
      docChildren.push(
        new Table({
          width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
          columnWidths: [8206, 2400],
          layout: TableLayoutType.FIXED,
          borders: sectionBannerBorders,
          rows: [
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: 8206, type: WidthType.DXA },
                  borders: borderNone,
                  margins: { top: 55, bottom: 55, left: 80, right: 60 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.LEFT,
                      children: [
                        new TextRun({
                          text: secTitleEn.toUpperCase(),
                          bold: true,
                          size: 20,
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
                  margins: { top: 55, bottom: 55, left: 60, right: 80 },
                  verticalAlign: VerticalAlign.CENTER,
                  shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({
                          text: marksBadgeEn,
                          bold: true,
                          size: 19,
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

    // Optional Section Sub-Instructions Row
    if (section.instructionsEn || section.instructionsUr) {
      const instEn = section.instructionsEn || "";
      const instUr = section.instructionsUr || "";
      if (isBilingual && instEn && instUr && instEn !== instUr) {
        docChildren.push(
          new Table({
            width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
            columnWidths: [5303, 5303],
            layout: TableLayoutType.FIXED,
            borders: tableBordersNone,
            rows: [
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({
                    width: { size: 5303, type: WidthType.DXA },
                    borders: borderNone,
                    margins: { top: 30, bottom: 40, left: 80, right: 60 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                          new TextRun({
                            text: instEn,
                            italics: true,
                            bold: true,
                            size: 18,
                            font: ENGLISH_FONT,
                            color: "334155",
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 5303, type: WidthType.DXA },
                    borders: borderNone,
                    margins: { top: 30, bottom: 40, left: 60, right: 80 },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        bidirectional: true,
                        children: [
                          new TextRun({
                            text: instUr,
                            bold: true,
                            size: 20,
                            font: URDU_FONT,
                            color: "334155",
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
        const chosenInst = isUrduOnly ? instUr || instEn : instEn || instUr;
        if (chosenInst) {
          docChildren.push(
            new Paragraph({
              alignment: isUrduOnly ? AlignmentType.RIGHT : AlignmentType.LEFT,
              bidirectional: isUrduOnly,
              spacing: { before: 40, after: 60 },
              children: [
                new TextRun({
                  text: chosenInst,
                  italics: !isUrduOnly,
                  bold: true,
                  size: isUrduOnly ? 20 : 18,
                  font: isUrduOnly ? URDU_FONT : ENGLISH_FONT,
                  color: "334155",
                }),
              ],
            })
          );
        }
      }
    }

    // =======================================================================
    // 5A. MCQ QUESTIONS RENDERING
    // =======================================================================
    if (isMcq) {
      if (isFbiseStyle) {
        // --- STYLE 2: FEDERAL BOARD (FBISE) MASTER MCQ TABLE ---
        // Columns: Question (5006) | A (1400) | B (1400) | C (1400) | D (1400) = 10606 DXA
        const fbColWidths = [5006, 1400, 1400, 1400, 1400];
        const fbRows: TableRow[] = [
          new TableRow({
            cantSplit: true,
            tableHeader: true,
            children: [
              new TableCell({
                width: { size: 5006, type: WidthType.DXA },
                borders: borderSolidThin,
                margins: compactCellMargins,
                shading: { fill: "E2E8F0", type: ShadingType.CLEAR },
                children: [
                  new Paragraph({
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
                        size: 19,
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
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: label,
                            bold: true,
                            size: 18,
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
          const qNum = q.number || qIdx + 1;
          const qEn = formatMathForWord(q.questionEn || q.questionUr || "");
          const qUr = formatMathForWord(q.questionUr || q.questionEn || "");
          const hasDistinctUr = Boolean(qUr && qUr !== qEn);

          const stemParas: Paragraph[] = [];
          if (!isUrduOnly && qEn) {
            stemParas.push(
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { after: isBilingual && hasDistinctUr ? 30 : 0 },
                children: [
                  new TextRun({
                    text: `${qNum}. `,
                    bold: true,
                    size: 19,
                    font: ENGLISH_HEADING_FONT,
                  }),
                  new TextRun({
                    text: qEn,
                    bold: true,
                    size: 19,
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
                          size: 20,
                          font: ENGLISH_HEADING_FONT,
                        }),
                      ]
                    : []),
                  new TextRun({
                    text: qUr,
                    bold: true,
                    size: 21,
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
                      size: 18,
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
                      size: 20,
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
                  width: { size: 5006, type: WidthType.DXA },
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
        // --- STYLE 1: PUNJAB BOARDS / ACADEMY STANDARD MCQ CARDS ---
        // Each MCQ is a self-contained 4-column table (2651 | 2651 | 2652 | 2652 = 10606 DXA)
        // Row 1: Stem (2 columns 5303 + 5303 if Bilingual, or 1 full-width 10606 column)
        // Row 2: 4 aligned option cells (2651 DXA each) so options (A), (B), (C), (D) line up down the entire sheet!
        const optColWidths = [2651, 2651, 2652, 2652];

        section.questions.forEach((q, qIdx) => {
          const qNum = q.number || qIdx + 1;
          const qEn = formatMathForWord(q.questionEn || q.questionUr || "");
          const qUr = formatMathForWord(q.questionUr || q.questionEn || "");
          const hasDistinctUr = Boolean(qUr && qUr !== qEn);

          const mcqRows: TableRow[] = [];

          // Row 1: Question Stem
          if (isBilingual && hasDistinctUr) {
            mcqRows.push(
              new TableRow({
                cantSplit: true,
                children: [
                  // Left 50% (colSpan 2 = 5302 DXA): English Stem (LTR)
                  new TableCell({
                    width: { size: 5302, type: WidthType.DXA },
                    columnSpan: 2,
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                    },
                    margins: { top: 65, bottom: 35, left: 60, right: 80 },
                    verticalAlign: VerticalAlign.TOP,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                          new TextRun({
                            text: `${qNum}.  `,
                            bold: true,
                            size: 20, // 10pt
                            font: ENGLISH_HEADING_FONT,
                            color: "0F172A",
                          }),
                          new TextRun({
                            text: qEn,
                            bold: true,
                            size: 20,
                            font: ENGLISH_FONT,
                            color: "0F172A",
                          }),
                        ],
                      }),
                    ],
                  }),
                  // Right 50% (colSpan 2 = 5304 DXA): Urdu Stem (RTL)
                  new TableCell({
                    width: { size: 5304, type: WidthType.DXA },
                    columnSpan: 2,
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                    },
                    margins: { top: 65, bottom: 35, left: 80, right: 60 },
                    verticalAlign: VerticalAlign.TOP,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        bidirectional: true,
                        children: [
                          new TextRun({
                            text: qUr,
                            bold: true,
                            size: 23, // 11.5pt Nastaliq
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
            // Single-language stem (Full width colSpan 4 = 10606 DXA)
            const stemText = isUrduOnly ? qUr || qEn : qEn || qUr;
            mcqRows.push(
              new TableRow({
                cantSplit: true,
                children: [
                  new TableCell({
                    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
                    columnSpan: 4,
                    borders: borderNone,
                    margins: { top: 65, bottom: 35, left: 60, right: 60 },
                    children: [
                      new Paragraph({
                        alignment: isUrduOnly ? AlignmentType.RIGHT : AlignmentType.LEFT,
                        bidirectional: isUrduOnly,
                        children: [
                          new TextRun({
                            text: isUrduOnly ? `(${qNum})  ` : `${qNum}.  `,
                            bold: true,
                            size: 20,
                            font: ENGLISH_HEADING_FONT,
                            color: "0F172A",
                          }),
                          new TextRun({
                            text: stemText,
                            bold: true,
                            size: isUrduOnly ? 23 : 20,
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

          // Row 2: 4-Column Aligned Options Row
          if (q.options && q.options.length > 0) {
            const rawOptions = q.options.slice(0, 4);
            while (rawOptions.length < 4) {
              rawOptions.push({
                key: String.fromCharCode(65 + rawOptions.length),
                textEn: "",
                textUr: "",
              });
            }

            // In Urdu-only mode, order the 4 cells from Right to Left so Column 4 (rightmost) has (الف)
            const orderedOptions = isUrduOnly ? [...rawOptions].reverse() : rawOptions;

            const optionCells = orderedOptions.map((opt, cIdx) => {
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
                  size: isUrduOnly ? 20 : 19,
                  font: isUrduOnly ? URDU_FONT : ENGLISH_HEADING_FONT,
                  color: "0F172A",
                }),
              ];

              if (isUrduOnly) {
                optionRuns.push(
                  new TextRun({
                    text: oUr,
                    size: 21,
                    font: URDU_FONT,
                    color: "1E293B",
                  })
                );
              } else if (isEnglishOnly || !optHasDistinctUr) {
                optionRuns.push(
                  new TextRun({
                    text: oEn,
                    size: 19,
                    font: ENGLISH_FONT,
                    color: "1E293B",
                  })
                );
              } else {
                // Bilingual Option: English + Urdu
                optionRuns.push(
                  new TextRun({
                    text: `${oEn}  `,
                    size: 19,
                    font: ENGLISH_FONT,
                    color: "1E293B",
                  }),
                  new TextRun({
                    text: oUr,
                    size: 20,
                    font: URDU_FONT,
                    color: "334155",
                  })
                );
              }

              return new TableCell({
                width: { size: optColWidths[cIdx], type: WidthType.DXA },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
                  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                },
                margins: { top: 20, bottom: 55, left: 80, right: 80 },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: isUrduOnly ? AlignmentType.RIGHT : AlignmentType.LEFT,
                    bidirectional: isUrduOnly,
                    children: optionRuns,
                  }),
                ],
              });
            });

            mcqRows.push(
              new TableRow({
                cantSplit: true,
                children: optionCells,
              })
            );
          }

          docChildren.push(
            new Table({
              width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
              columnWidths: optColWidths,
              layout: TableLayoutType.FIXED,
              borders: tableBordersNone,
              rows: mcqRows,
            })
          );
        });
      }
    } else if (section.type === "poetry") {
      // =====================================================================
      // 5B. POETRY STANZAS RENDERING
      // =====================================================================
      section.questions.forEach((q, qIdx) => {
        const romanNum = toRoman(q.number || qIdx + 1);
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 100, after: 30 },
            children: [
              new TextRun({
                text: `شعر (${romanNum}):`,
                bold: true,
                size: 20,
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
              spacing: { before: 25, after: 25 },
              children: [
                new TextRun({
                  text: `"${line}"`,
                  bold: true,
                  size: 22,
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
          ? `Q.${q.number || qIdx + 3}:`
          : `(${toRoman(q.number || qIdx + 1)})`;

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
          // Side-by-Side 2-Column Row: Left English (5303 DXA, LTR) | Right Urdu (5303 DXA, RTL)
          subRows.push(
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: 5303, type: WidthType.DXA },
                  borders: rowBottomBorder,
                  margins: { top: 55, bottom: 55, left: 70, right: 90 },
                  verticalAlign: VerticalAlign.TOP,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.LEFT,
                      children: [
                        new TextRun({
                          text: `${romanLabel}  `,
                          bold: true,
                          size: 20, // 10pt
                          font: ENGLISH_HEADING_FONT,
                          color: "0F172A",
                        }),
                        new TextRun({
                          text: qEn,
                          bold: isLongSection,
                          size: 20,
                          font: ENGLISH_FONT,
                          color: "0F172A",
                        }),
                        ...(marksSuffixEn
                          ? [
                              new TextRun({
                                text: marksSuffixEn,
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
                new TableCell({
                  width: { size: 5303, type: WidthType.DXA },
                  borders: rowBottomBorder,
                  margins: { top: 55, bottom: 55, left: 90, right: 70 },
                  verticalAlign: VerticalAlign.TOP,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      bidirectional: true,
                      children: [
                        new TextRun({
                          text: `${romanLabel}  `,
                          bold: true,
                          size: 20,
                          font: ENGLISH_HEADING_FONT,
                          color: "0F172A",
                        }),
                        new TextRun({
                          text: qUr,
                          bold: true,
                          size: 23, // 11.5pt Nastaliq
                          font: URDU_FONT,
                          color: "0F172A",
                        }),
                        ...(marksSuffixUr
                          ? [
                              new TextRun({
                                text: marksSuffixUr,
                                bold: true,
                                size: 19,
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
          // Single-language Full-Width Row (10606 DXA)
          const singleText = isUrduOnly ? qUr || qEn : qEn || qUr;
          subRows.push(
            new TableRow({
              cantSplit: true,
              children: [
                new TableCell({
                  width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
                  columnSpan: 2,
                  borders: rowBottomBorder,
                  margins: { top: 55, bottom: 55, left: 70, right: 70 },
                  verticalAlign: VerticalAlign.TOP,
                  children: [
                    new Paragraph({
                      alignment: isUrduOnly ? AlignmentType.RIGHT : AlignmentType.LEFT,
                      bidirectional: isUrduOnly,
                      children: [
                        new TextRun({
                          text: `${romanLabel}  `,
                          bold: true,
                          size: 20,
                          font: ENGLISH_HEADING_FONT,
                          color: "0F172A",
                        }),
                        new TextRun({
                          text: singleText,
                          bold: isUrduOnly || isLongSection,
                          size: isUrduOnly ? 23 : 20,
                          font: isUrduOnly ? URDU_FONT : ENGLISH_FONT,
                          color: "0F172A",
                        }),
                        ...(isLongSection && q.marks
                          ? [
                              new TextRun({
                                text: isUrduOnly ? marksSuffixUr : marksSuffixEn,
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
        }
      });

      if (subRows.length > 0) {
        docChildren.push(
          new Table({
            width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
            columnWidths: [5303, 5303],
            layout: TableLayoutType.FIXED,
            borders: tableBordersNone,
            rows: subRows,
          })
        );
      }
    }

    // Add spacing after each section
    docChildren.push(
      new Paragraph({
        spacing: { before: 80, after: 20 },
        children: [],
      })
    );
  });

  // =========================================================================
  // 6. OPTIONAL OFFICIAL ANSWER KEY & RUBRIC SECTION
  // =========================================================================
  if (includeAnswerKey && answerKeyItems.length > 0) {
    docChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: `OFFICIAL ANSWER KEY — ${(paperData.institutionName || "EXAM PAPER").toUpperCase()} (CODE: ${paperCode || "3044"})`,
            bold: true,
            size: 24,
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
                  new TextRun({ text: "Q. No", bold: true, size: 18, font: ENGLISH_HEADING_FONT }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 6606, type: WidthType.DXA },
            borders: borderSolidThin,
            margins: compactCellMargins,
            shading: { fill: "E2E8F0", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Question Stem", bold: true, size: 18, font: ENGLISH_HEADING_FONT }),
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
                  new TextRun({ text: "Correct Answer", bold: true, size: 18, font: ENGLISH_HEADING_FONT }),
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
                      size: 18,
                      font: ENGLISH_HEADING_FONT,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 6606, type: WidthType.DXA },
              borders: borderSubtle,
              margins: compactCellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: formatMathForWord(item.question),
                      size: 18,
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
                      size: 18,
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
        columnWidths: [1200, 6606, 2800],
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
              top: 560, // ~0.39 inch
              right: MARGIN_DXA, // ~0.45 inch
              bottom: 560,
              left: MARGIN_DXA,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
