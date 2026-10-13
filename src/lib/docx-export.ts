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
  TabStopType,
} from "docx";
import { ExamPaperData } from "@/lib/quick-paper-parser";

interface WordExportOptions {
  paperData: ExamPaperData;
  languageMode: "Urdu" | "English" | "Bilingual";
  syllabus: string;
  testNo: string;
  paperCode: string;
  note: string;
}

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
  for (const [val, str] of lookup) {
    while (num >= val) {
      res += str;
      num -= val;
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

export async function exportPaperToDocx(options: WordExportOptions): Promise<Blob> {
  const { paperData, languageMode, syllabus, testNo, paperCode, note } = options;
  const isUrdu = languageMode === "Urdu";

  const URDU_FONT = "Jameel Noori Nastaleeq";
  const SECONDARY_URDU_FONT = "Noto Nastaliq Urdu";

  const docChildren: (Paragraph | Table)[] = [];

  const borderSingle = {
    top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
    left: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
    right: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
  };

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  // 1. Institution Header Box (Board Style)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderSingle,
    rows: [
      new TableRow({
        children: [
          // Left: Paper Code
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: borderSingle,
            shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({
                    text: "PAPER CODE",
                    bold: true,
                    size: 16,
                    font: "Arial",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: paperCode || "3044",
                    bold: true,
                    size: 26,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
          // Center: Academy Title + Banner + Subject
          new TableCell({
            width: { size: 64, type: WidthType.PERCENTAGE },
            borders: borderSingle,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 30 },
                children: [
                  new TextRun({
                    text: paperData.institutionName || "SEEK ACADEMY",
                    bold: true,
                    size: 32,
                    font: "Arial Black",
                    color: "1A365D",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [
                  new TextRun({
                    text: "EXAMINATION 2026-27",
                    bold: true,
                    size: 18,
                    color: "0D47A1",
                    font: "Arial",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: `${paperData.subject || "مطالعہ پاکستان"}   |   Class: ${paperData.grade || "10th"}`,
                    bold: true,
                    size: 20,
                    font: URDU_FONT,
                  }),
                ],
              }),
            ],
          }),
          // Right: Test Info
          new TableCell({
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: borderSingle,
            shading: { fill: "FAFAFA", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 40 },
                children: [
                  new TextRun({
                    text: "TEST NO.",
                    bold: true,
                    size: 16,
                    font: "Arial",
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: testNo || "15",
                    bold: true,
                    size: 26,
                    font: "Arial",
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

  // 2. Student Info & Details Table
  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderSingle,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: borderSingle,
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({ text: "  Student Name: ", bold: true, size: 18, font: "Arial" }),
                  new TextRun({ text: "___________________________", size: 18 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: borderSingle,
            children: [
              new Paragraph({
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({ text: "  Syllabus: ", bold: true, size: 18, font: "Arial" }),
                  new TextRun({ text: syllabus || "Full Syllabus", size: 18, font: URDU_FONT }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnSpan: 2,
            borders: borderSingle,
            shading: { fill: "E3F2FD", type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 40 },
                children: [
                  new TextRun({ text: "Roll No: ____________   |   ", bold: true, size: 18, font: "Arial", color: "0D47A1" }),
                  new TextRun({ text: `Time: ${paperData.timeAllowed || "40 Mins"}   |   `, bold: true, size: 18, font: "Arial", color: "0D47A1" }),
                  new TextRun({ text: `Marks: ${paperData.totalMarks || 25}   |   `, bold: true, size: 18, font: "Arial", color: "0D47A1" }),
                  new TextRun({ text: `Date: ${paperData.date || "11-10-2026"}`, bold: true, size: 18, font: "Arial", color: "0D47A1" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
  docChildren.push(infoTable);

  // 3. Instructions Note
  if (note) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({ text: "Note: ", bold: true, size: 18, font: "Arial", color: "196F3D" }),
          new TextRun({ text: note, italics: true, size: 18, font: URDU_FONT }),
        ],
      })
    );
  }

  // 4. Sections & Questions
  paperData.sections.forEach((section, sIdx) => {
    const isMcq = section.type === "mcq";
    const sectionTitleText =
      section.titleUr ||
      (isMcq
        ? "Section-I (معروضی سوالات)"
        : "Section-II (انشائیہ سوالات)");

    // Section Bar with clean underline
    const sectionTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "auto" },
        left: { style: BorderStyle.NONE, size: 0, color: "auto" },
        right: { style: BorderStyle.NONE, size: 0, color: "auto" },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              borders: borderNone,
              children: [
                new Paragraph({
                  alignment: isUrdu ? AlignmentType.RIGHT : AlignmentType.LEFT,
                  bidirectional: isUrdu,
                  spacing: { before: 140, after: 40 },
                  children: [
                    new TextRun({
                      text: sectionTitleText,
                      bold: true,
                      size: 22,
                      font: URDU_FONT,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: borderNone,
              children: [
                new Paragraph({
                  alignment: isUrdu ? AlignmentType.LEFT : AlignmentType.RIGHT,
                  spacing: { before: 140, after: 40 },
                  children: [
                    new TextRun({
                      text: section.marks ? `(${section.marks} Marks / نمبر)` : "",
                      bold: true,
                      size: 20,
                      font: "Arial",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    docChildren.push(sectionTable);

    if (section.instructionsUr) {
      docChildren.push(
        new Paragraph({
          alignment: isUrdu ? AlignmentType.RIGHT : AlignmentType.LEFT,
          bidirectional: isUrdu,
          spacing: { before: 40, after: 80 },
          children: [
            new TextRun({
              text: section.instructionsUr,
              size: 18,
              font: URDU_FONT,
              italics: true,
            }),
          ],
        })
      );
    }

    // Questions Rendering
    if (isMcq) {
      section.questions.forEach((q, qIdx) => {
        // All numbering in Roman form: (i), (ii), (iii)...
        const romanNum = toRoman(q.number || qIdx + 1);

        // MCQ Question Title Line
        docChildren.push(
          new Paragraph({
            alignment: isUrdu ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isUrdu,
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: `(${romanNum}) `,
                bold: true,
                size: 22,
                font: "Arial",
              }),
              new TextRun({
                text: q.questionUr || "",
                bold: true,
                size: 22,
                font: URDU_FONT,
              }),
            ],
          })
        );

        // Options: Display as a pure text paragraph with tab-stops (NO table cells = ZERO vertical black lines)
        // With authentic Urdu options (الف), (ب), (ج), (د)
        if (q.options && q.options.length > 0) {
          if (isUrdu) {
            // In Urdu RTL, standard flow from right-to-left:
            // (الف) optionText      (ب) optionText      (ج) optionText      (د) optionText
            const optionRuns: TextRun[] = [];

            q.options.forEach((opt, oIdx) => {
              const urduKey = getUrduOptionKey(opt.key);
              optionRuns.push(
                new TextRun({
                  text: `(${urduKey}) `,
                  bold: true,
                  size: 20,
                  font: URDU_FONT,
                })
              );
              optionRuns.push(
                new TextRun({
                  text: `${opt.textUr || ""}        `,
                  size: 20,
                  font: URDU_FONT,
                })
              );
            });

            docChildren.push(
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                bidirectional: true,
                spacing: { before: 30, after: 90 },
                children: optionRuns,
              })
            );
          } else {
            // English / Bilingual LTR options
            const optionRuns: TextRun[] = [];
            q.options.forEach((opt) => {
              optionRuns.push(
                new TextRun({
                  text: `(${opt.key}) `,
                  bold: true,
                  size: 19,
                  font: "Arial",
                })
              );
              optionRuns.push(
                new TextRun({
                  text: `${opt.textUr || ""}       `,
                  size: 19,
                  font: "Arial",
                })
              );
            });

            docChildren.push(
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 30, after: 90 },
                children: optionRuns,
              })
            );
          }
        }
      });
    } else if (section.type === "poetry") {
      section.questions.forEach((q, qIdx) => {
        const romanNum = toRoman(q.number || qIdx + 1);
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            bidirectional: true,
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: `شعر (${romanNum}): `,
                bold: true,
                size: 20,
                font: "Arial",
              }),
            ],
          })
        );
        q.poetryLines?.forEach((line) => {
          docChildren.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              bidirectional: true,
              spacing: { before: 30, after: 30 },
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
      // Subjective Questions: All numbered with Roman numerals (i), (ii), (iii)...
      section.questions.forEach((q, qIdx) => {
        const romanNum = toRoman(q.number || qIdx + 1);
        docChildren.push(
          new Paragraph({
            alignment: isUrdu ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isUrdu,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: `(${romanNum}) `,
                bold: true,
                size: 22,
                font: "Arial",
              }),
              new TextRun({
                text: q.questionUr || "",
                bold: true,
                size: 22,
                font: URDU_FONT,
              }),
            ],
          })
        );
      });
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch (36pt)
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
