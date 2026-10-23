import { UserPaperTemplate } from "./types";

export const DEFAULT_ENG_INSTRUCTION =
  "Four possible answer a,b,c and d to each question are given. The choice which you think is correct, fill that circle in front of that questions with Marker or Pen ink, Cutting or filling two or more circles will result in zero mark in that question.";

export const DEFAULT_PAPER_TEMPLATE: UserPaperTemplate = {
  institutionName: "",
  logoBase64: null,
  logoSize: 70,
  headerStyle: "style1",
  paperTypeBanner: "EXAMINATION 2026-27",
  languageMode: "Bilingual",
  paperSize: "a4",
  testDensity: "1_per_page",
  timeDuration: "2:30 hrs",
  instFontSize: 24,
  objFontSize: 12,
  subFontSize: 12,
  boldHeadingsOnly: true,
  entireContentBold: false,
  includeHeaderSection: true,
  includeStudentSection: true,
  includeBubbleSheet: true,
  includeMcqAnswerKey: true,
  includeInstructions: true,
  instructionText: DEFAULT_ENG_INSTRUCTION,
  includePaperBorder: false,
  includeWatermark: false,
  watermarkType: "text",
  watermarkOpacity: 0.12,
  includePaperCode: true,
};

const MAX_LOGO_CHARS = 700_000;

function str(v: unknown, fallback: string, max: number): string {
  return typeof v === "string" ? v.slice(0, max) : fallback;
}
function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}
function num(v: unknown, fallback: number, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
function pick<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

/** Validates untrusted input and returns a complete, safe template (missing fields use defaults). */
export function sanitizePaperTemplate(input: unknown): UserPaperTemplate {
  const d = DEFAULT_PAPER_TEMPLATE;
  const i = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const logo =
    typeof i.logoBase64 === "string" &&
    i.logoBase64.startsWith("data:image/") &&
    i.logoBase64.length <= MAX_LOGO_CHARS
      ? i.logoBase64
      : null;

  return {
    institutionName: str(i.institutionName, d.institutionName, 150),
    logoBase64: logo,
    logoSize: num(i.logoSize, d.logoSize, 30, 140),
    headerStyle: pick(i.headerStyle, ["style1", "style2"] as const, d.headerStyle),
    paperTypeBanner: str(i.paperTypeBanner, d.paperTypeBanner, 80),
    languageMode: pick(i.languageMode, ["Bilingual", "English", "Urdu"] as const, d.languageMode),
    paperSize: pick(i.paperSize, ["a4", "letter", "legal"] as const, d.paperSize),
    testDensity: pick(i.testDensity, ["1_per_page", "2_per_page"] as const, d.testDensity),
    timeDuration: str(i.timeDuration, d.timeDuration, 30),
    instFontSize: num(i.instFontSize, d.instFontSize, 12, 40),
    objFontSize: num(i.objFontSize, d.objFontSize, 8, 20),
    subFontSize: num(i.subFontSize, d.subFontSize, 8, 20),
    boldHeadingsOnly: bool(i.boldHeadingsOnly, d.boldHeadingsOnly),
    entireContentBold: bool(i.entireContentBold, d.entireContentBold),
    includeHeaderSection: bool(i.includeHeaderSection, d.includeHeaderSection),
    includeStudentSection: bool(i.includeStudentSection, d.includeStudentSection),
    includeBubbleSheet: bool(i.includeBubbleSheet, d.includeBubbleSheet),
    includeMcqAnswerKey: bool(i.includeMcqAnswerKey, d.includeMcqAnswerKey),
    includeInstructions: bool(i.includeInstructions, d.includeInstructions),
    instructionText: str(i.instructionText, d.instructionText, 1000),
    includePaperBorder: bool(i.includePaperBorder, d.includePaperBorder),
    includeWatermark: bool(i.includeWatermark, d.includeWatermark),
    watermarkType: pick(i.watermarkType, ["text", "image"] as const, d.watermarkType),
    watermarkOpacity: num(i.watermarkOpacity, d.watermarkOpacity, 0.03, 0.4),
    includePaperCode: bool(i.includePaperCode, d.includePaperCode),
  };
}
