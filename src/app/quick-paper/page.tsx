"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Sparkles,
  Camera,
  Languages,
  Plus,
  Trash2,
  Check,
  Eye,
  Edit3,
  Loader2,
  Palette,
  Image as ImageIcon,
  Columns,
  Scissors,
  ArrowLeft,
  Wand2,
  BookOpen,
  RotateCcw,
  AlertCircle,
  SlidersHorizontal,
  Save,
  Layers,
  X,
} from "lucide-react";
import {
  parseRawTextToExam,
  serializeExamDataToRawText,
  getUrduOptionLabel,
  normalizeOptionKey,
  hasUrduScript,
  isPureUrduText,
  splitBilingualOptionText,
  ExamPaperData,
  ExamSection,
  ExamQuestion,
} from "@/lib/quick-paper-parser";
import { MathRenderer } from "@/components/MathRenderer";
import { exportPaperToDocx } from "@/lib/docx-export";
import { BrandEmblem, generatePaperWalaCrestDataUrl } from "@/components/BrandLogo";

export interface PaperTemplate {
  id: string;
  name: string;
  institutionName: string;
  paperTypeBanner: string;
  title: string;
  subject: string;
  grade: string;
  syllabus: string;
  timeAllowed: string;
  totalMarks: number;
  testNo: string;
  headerStyle: "punjab-board-style1" | "fbise-style2" | "minimal";
  layout: "standard" | "two-column";
  fontFamily: "urdu" | "serif" | "sans";
  fontSize: number;
  showBorder: boolean;
  borderStyle: "double" | "single" | "none";
  showRollNo: boolean;
  showWatermark: boolean;
  watermarkText: string;
  paperCode: string;
  instructionNoteEn: string;
  instructionNoteUr: string;
}

interface ModalQuestionDraft {
  questionNo: string;
  questionTextEn: string;
  questionTextUr: string;
  marks: number;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

const DEFAULT_TEMPLATES: PaperTemplate[] = [
  {
    id: "seek-academy-style1",
    name: "Style 1: Punjab Boards (BISE)",
    institutionName: "SEEKACADEMY",
    paperTypeBanner: "EXAMINATION 2026-27",
    title: "کمپیوٹر سائنس / COMPUTER SCIENCE",
    subject: "Computer Science",
    grade: "10th",
    syllabus: "Chapter 1-3 Complete",
    timeAllowed: "1:00 Hour",
    totalMarks: 25,
    testNo: "15",
    headerStyle: "punjab-board-style1",
    layout: "standard",
    fontFamily: "sans",
    fontSize: 12,
    showBorder: true,
    borderStyle: "single",
    showRollNo: true,
    showWatermark: false,
    watermarkText: "SEEKACADEMY",
    paperCode: "3044",
    instructionNoteEn:
      "Four possible answers A, B, C and D to each question are given. Fill the correct circle with Marker or Pen ink. Cutting or filling two or more circles will result in zero mark in that question.",
    instructionNoteUr:
      "ہر سوال کے چار ممکنہ جوابات الف، ب، ج اور د دیے گئے ہیں۔ درست جواب کا انتخاب کریں اور کٹنگ سے گریز کریں۔",
  },
  {
    id: "punjab-board-official",
    name: "Style 2: BISE Urdu Medium Board",
    institutionName: "گورنمنٹ ہائر سیکنڈری سکول / کالج",
    paperTypeBanner: "سالانہ امتحان و تعلیمی ٹیسٹ 2026-27",
    title: "سالانہ امتحان و تعلیمی ٹیسٹ 2026",
    subject: "اردو لازمی",
    grade: "جماعت دہم (10th)",
    syllabus: "مکمل نصاب (Full Syllabus)",
    timeAllowed: "2:30 گھنٹے",
    totalMarks: 75,
    testNo: "01",
    headerStyle: "punjab-board-style1",
    layout: "standard",
    fontFamily: "urdu",
    fontSize: 13,
    showBorder: true,
    borderStyle: "double",
    showRollNo: true,
    showWatermark: false,
    watermarkText: "BISE LAHORE",
    paperCode: "3041",
    instructionNoteEn:
      "Write your Roll Number on the bubble sheet and question paper. Attempt all questions.",
    instructionNoteUr:
      "تمام سوالات کے جوابات دی گئی جوابی کاپی پر تحریر کریں۔ کٹائی اور اوور رائٹنگ سے گریز کریں۔",
  },
  {
    id: "fbise-official",
    name: "Style 3: Federal Board (FBISE Boxed)",
    institutionName: "APEX SCIENCE COLLEGE ISLAMABAD",
    paperTypeBanner: "SECTIONAL ASSESSMENT 2026-27",
    title: "FEDERAL BOARD PATTERN",
    subject: "Physics / فزکس",
    grade: "10th",
    syllabus: "Unit 1-4",
    timeAllowed: "1:30 Hours",
    totalMarks: 30,
    testNo: "02",
    headerStyle: "fbise-style2",
    layout: "standard",
    fontFamily: "sans",
    fontSize: 11.5,
    showBorder: true,
    borderStyle: "single",
    showRollNo: true,
    showWatermark: false,
    watermarkText: "FBISE",
    paperCode: "2045",
    instructionNoteEn: "Attempt all sections within the provided time limit.",
    instructionNoteUr: "مقررہ وقت کے اندر تمام سوالات حل کریں۔",
  },
  {
    id: "minimal-clean",
    name: "Style 4: Compact Eco Class Test",
    institutionName: "APEX SCIENCE ACADEMY",
    paperTypeBanner: "WEEKLY UNIT ASSESSMENT",
    title: "UNIT TEST",
    subject: "Physics / فزکس",
    grade: "9th",
    syllabus: "Unit 2: Kinematics",
    timeAllowed: "45 Mins",
    totalMarks: 25,
    testNo: "04",
    headerStyle: "minimal",
    layout: "two-column",
    fontFamily: "sans",
    fontSize: 11,
    showBorder: true,
    borderStyle: "single",
    showRollNo: true,
    showWatermark: false,
    watermarkText: "APEX ACADEMY",
    paperCode: "1009",
    instructionNoteEn: "Attempt all questions within the given time.",
    instructionNoteUr: "تمام سوالات لازمی ہیں۔",
  },
];

const SAMPLE_PAPERS: Record<"Bilingual" | "Urdu" | "English", string> = {
  Bilingual: `SECTION-I: MULTIPLE CHOICE QUESTIONS (Marks: 5)
1. Which symbol is used for decision making in a flowchart? | فلو چارٹ میں فیصلہ سازی کے لیے کون سی علامت استعمال ہوتی ہے؟
(A) Diamond (ڈائمنڈ)   (B) Rectangle (مستطیل)   (C) Oval (بیضوی)   (D) Parallelogram (متوازی الاضلاع)
2. A step-by-step procedure to solve a problem is called: | کسی مسئلے کو حل کرنے کے مرحلہ وار طریقہ کار کو کیا کہتے ہیں؟
(A) Algorithm (الگورتھم)   (B) Flowchart (فلو چارٹ)   (C) Trace Table (ٹریس ٹیبل)   (D) Compiler (کمپائلر)
3. Which operator is used to assign a value to a variable in C? | سی لینگویج میں ویری ایبل کو قیمت دینے کے لیے کون سا آپریٹر استعمال ہوتا ہے؟
(A) =   (B) ==   (C) !=   (D) &&
4. How many bytes are reserved for an int data type in C? | سی لینگویج میں int ڈیٹا ٹائپ کے لیے کتنے بائٹس مختص ہوتے ہیں؟
(A) 4 Bytes   (B) 1 Byte   (C) 8 Bytes   (D) 16 Bytes
5. Which function is used to display output on the screen in C? | سی لینگویج میں سکرین پر آؤٹ پٹ دکھانے کے لیے کون سا فنکشن استعمال ہوتا ہے؟
(A) printf()   (B) scanf()   (C) main()   (D) getch()

SECTION-II: SHORT QUESTIONS (Marks: 10)
1. Define an Algorithm and write its two advantages. | الگورتھم کی تعریف کریں اور اس کے دو فوائد لکھیں۔
2. Differentiate between verification and validation. | تصدیق (Verification) اور توثیق (Validation) میں فرق واضح کریں۔
3. What is meant by IDE in C programming? | سی پروگرامنگ میں IDE سے کیا مراد ہے؟
4. Define variable initialization with an example. | ویری ایبل انیشلائزیشن کی مثال کے ساتھ تعریف کریں۔
5. What is the purpose of format specifiers in C language? | سی لینگویج میں فارمیٹ سپیسیفائرز کا کیا مقصد ہے؟

SECTION-III: DETAILED QUESTIONS (Marks: 10)
1. Explain the standard symbols of a Flowchart in detail with examples. | فلو چارٹ کی معیاری علامات کی مثالوں کے ساتھ تفصیلی وضاحت کریں۔
2. Describe the structure of a C program and explain header files and main() function. | سی پروگرام کی ساخت بیان کریں نیز ہیڈر فائلز اور main() فنکشن کی وضاحت کریں۔`,

  Urdu: `سوال نمبر 1۔ درست جواب کے گرد نشان لگائیں (Marks: 5)
1. وہ جا رہا ہے - اس میں امدادی فعل کون سا ہے؟
(الف) وہ   (ب) جا   (ج) رہا ہے   (د) ہے
2. درج ذیل میں سے امدادی فعل کی مثال ہے:
(الف) کتاب   (ب) لڑکا   (ج) سوتا   (د) کھاتا ہے
3. امدادی فعل ہمیشہ آتا ہے:
(الف) ہمیشہ   (ب) جملے کے آخر میں   (ج) اصل فعل کے بعد   (د) اصل فعل سے پہلے
4. وہ اچانک ہنس پڑا - اس میں امدادی فعل ہے:
(الف) پڑا   (ب) وہ   (ج) ہنس   (د) اچانک
5. نعت میں توصیف کی جاتی ہے:
(الف) اولیاء کی   (ب) صحابہ کی   (ج) حضرت محمد ﷺ کی   (د) اللہ کی

حصہ دوم: مختصر سوالات (Marks: 10)
1. حمد اور نعت میں بنیادی فرق واضح کریں۔
2. امدادی فعل کی تعریف کریں اور دو مثالیں دیں۔
3. مرزا غالب کے طرزِ تحریر کی دو خصوصیات لکھیں۔
4. محاورہ اور روزمرہ میں کیا فرق ہے؟
5. مطلع اور مقطع کی تعریف مع مثال تحریر کریں۔

حصہ سوم: تفصیلی سوالات (Marks: 10)
1. سیرت النبی صلی اللہ علیہ وآلہ وسلم کے عنوان پر ایک جامع مضمون تحریر کریں۔
2. اپنے دوست کے نام خط لکھیں جس میں امتحان میں شاندار کامیابی پر مبارکباد دیں۔`,

  English: `SECTION-I: MULTIPLE CHOICE QUESTIONS (Marks: 5)
1. The rate of change of velocity of a body is called:
(A) Acceleration   (B) Speed   (C) Displacement   (D) Momentum
2. Which of the following is a vector quantity?
(A) Velocity   (B) Distance   (C) Time   (D) Mass
3. First equation of motion is represented by the formula:
(A) $v_f = v_i + at$   (B) $S = v_i t + \\frac{1}{2}at^2$   (C) $2aS = v_f^2 - v_i^2$   (D) $F = ma$
4. The area under a speed-time graph represents:
(A) Distance covered   (B) Acceleration   (C) Force   (D) Work done
5. Value of gravitational acceleration $g$ near the surface of Earth is:
(A) $9.8\\text{ ms}^{-2}$   (B) $98\\text{ ms}^{-2}$   (C) $1.6\\text{ ms}^{-2}$   (D) $0\\text{ ms}^{-2}$

SECTION-II: SHORT QUESTIONS (Marks: 10)
1. Differentiate between scalar and vector quantities with examples.
2. Define uniform velocity and uniform acceleration.
3. Why can a body moving with constant speed have variable velocity?
4. Sketch a speed-time graph for a body moving with uniform acceleration.
5. Derive the first equation of motion $v_f = v_i + at$.

SECTION-III: DETAILED QUESTIONS (Marks: 10)
1. Derive the second equation of motion $S = v_i t + \\frac{1}{2}at^2$ graphically.
2. Explain the motion of freely falling bodies and solve for height when initial velocity is zero.`,
};

export default function QuickPaperPage() {
  // Initial Raw Text & Structured Paper State (Synchronized on load)
  const [rawText, setRawText] = useState<string>(SAMPLE_PAPERS.Bilingual);
  const [paperLanguageMode, setPaperLanguageMode] = useState<"Urdu" | "English" | "Bilingual">("Bilingual");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Add Section / Question Modal State
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [modalTargetMode, setModalTargetMode] = useState<"new_section" | "existing_section">("new_section");
  const [modalTargetSectionIdx, setModalTargetSectionIdx] = useState<number>(0);
  const [modalSectionType, setModalSectionType] = useState<ExamSection["type"]>("short");
  const [modalSectionTitleEn, setModalSectionTitleEn] = useState("SECTION-II: SHORT QUESTIONS");
  const [modalSectionTitleUr, setModalSectionTitleUr] = useState("حصہ دوم: مختصر سوالات");
  const [modalSectionMarks, setModalSectionMarks] = useState<number>(10);
  const [modalQuestions, setModalQuestions] = useState<ModalQuestionDraft[]>([
    {
      questionNo: "(i)",
      questionTextEn: "",
      questionTextUr: "",
      marks: 2,
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
    },
  ]);

  // AI Topic Generator State
  const [topicPrompt, setTopicPrompt] = useState("");
  const [aiMcqCount, setAiMcqCount] = useState(5);
  const [aiShortCount, setAiShortCount] = useState(4);
  const [aiLongCount, setAiLongCount] = useState(2);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);

  // AI & Processing Status Flags
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAiStructuring, setIsAiStructuring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "info" | "success" | "error" } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View State
  const [activeTab, setActiveTab] = useState<"input" | "preview" | "split">("split");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Active Template State
  const [templates] = useState<PaperTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<PaperTemplate>(DEFAULT_TEMPLATES[0]);

  // Paper Display / Customization Settings
  const [paperLayout, setPaperLayout] = useState<"standard" | "two-column">(activeTemplate.layout);
  const [fontSize, setFontSize] = useState<number>(activeTemplate.fontSize);
  const [showWatermark, setShowWatermark] = useState(activeTemplate.showWatermark);
  const [watermarkText, setWatermarkText] = useState(activeTemplate.watermarkText);
  const [showBorder, setShowBorder] = useState(activeTemplate.showBorder);
  const [includeStudentInfo, setIncludeStudentInfo] = useState(activeTemplate.showRollNo);
  const [paperCode, setPaperCode] = useState(activeTemplate.paperCode);
  const [syllabusText, setSyllabusText] = useState(activeTemplate.syllabus);
  const [testNoText, setTestNoText] = useState(activeTemplate.testNo);
  const [paperTypeBanner, setPaperTypeBanner] = useState(activeTemplate.paperTypeBanner);
  const [instructionNote, setInstructionNote] = useState(activeTemplate.instructionNoteEn);
  const [includeNote, setIncludeNote] = useState(true);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [printDensity, setPrintDensity] = useState<"1_per_page" | "2_per_page">("1_per_page");
  const [fitToOnePage, setFitToOnePage] = useState<boolean>(true);
  const [printScale, setPrintScale] = useState<number>(1);
  const sheetMeasureRef = useRef<HTMLDivElement>(null);

  // Structured Paper Data
  const [paperData, setPaperData] = useState<ExamPaperData>(() => {
    const parsed = parseRawTextToExam(SAMPLE_PAPERS.Bilingual);
    return {
      ...parsed,
      institutionName: DEFAULT_TEMPLATES[0].institutionName,
      subject: DEFAULT_TEMPLATES[0].subject,
      grade: DEFAULT_TEMPLATES[0].grade,
      timeAllowed: DEFAULT_TEMPLATES[0].timeAllowed,
      totalMarks: DEFAULT_TEMPLATES[0].totalMarks,
    };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Apply the logged-in user's saved paper template (institution, logo, print density)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/client/template")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const t = d?.template;
        if (cancelled || !t) return;
        if (t.logoBase64) setLogoBase64(t.logoBase64);
        if (t.testDensity) setPrintDensity(t.testDensity);
        if (t.institutionName) setPaperData((prev) => ({ ...prev, institutionName: t.institutionName }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to get default question number label for a given section type and index
  const getDefaultQuestionNo = (type: ExamSection["type"], index: number, totalSections: number = 2): string => {
    if (type === "mcq") return `${index + 1}`;
    if (type === "short") return `(${toRomanLower(index + 1)})`;
    if (type === "long" || type === "essay" || type === "letter") {
      return paperLanguageMode === "Urdu"
        ? `سوال نمبر ${index + Math.max(3, totalSections + 1)}`
        : `Q.${index + Math.max(3, totalSections + 1)}`;
    }
    if (type === "poetry") return `(${toRomanLower(index + 1)})`;
    return `${index + 1}`;
  };

  // Open the "Add Section" Modal (either for a brand-new section or adding a question to an existing section)
  const openAddSectionModal = (mode: "new_section" | "existing_section" = "new_section", sectionIdx?: number) => {
    const nextSecNum = paperData.sections.length + 1;
    const romanSec = toRomanLower(nextSecNum).toUpperCase();

    if (mode === "existing_section" && sectionIdx !== undefined && paperData.sections[sectionIdx]) {
      const targetSec = paperData.sections[sectionIdx];
      const nextQIdx = targetSec.questions.length;
      setModalTargetMode("existing_section");
      setModalTargetSectionIdx(sectionIdx);
      setModalSectionType(targetSec.type);
      setModalSectionTitleEn(targetSec.titleEn || "");
      setModalSectionTitleUr(targetSec.titleUr || "");
      setModalSectionMarks(targetSec.marks || 10);
      setModalQuestions([
        {
          questionNo: getDefaultQuestionNo(targetSec.type, nextQIdx, paperData.sections.length),
          questionTextEn: "",
          questionTextUr: "",
          marks: targetSec.type === "mcq" ? 1 : targetSec.type === "long" ? 5 : 2,
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
        },
      ]);
    } else {
      const defaultType: ExamSection["type"] =
        paperData.sections.length === 0
          ? "mcq"
          : paperData.sections.length === 1
          ? "short"
          : "long";
      const defaultTitleEn =
        defaultType === "mcq"
          ? `SECTION-${romanSec}: MULTIPLE CHOICE QUESTIONS`
          : defaultType === "short"
          ? `SECTION-${romanSec}: SHORT QUESTIONS`
          : `SECTION-${romanSec}: DETAILED QUESTIONS`;
      const defaultTitleUr =
        defaultType === "mcq"
          ? `حصہ ${getUrduSectionOrdinal(nextSecNum)}: کثیر الانتخابی سوالات`
          : defaultType === "short"
          ? `حصہ ${getUrduSectionOrdinal(nextSecNum)}: مختصر سوالات`
          : `حصہ ${getUrduSectionOrdinal(nextSecNum)}: تفصیلی سوالات`;

      setModalTargetMode("new_section");
      setModalTargetSectionIdx(Math.max(0, paperData.sections.length - 1));
      setModalSectionType(defaultType);
      setModalSectionTitleEn(defaultTitleEn);
      setModalSectionTitleUr(defaultTitleUr);
      setModalSectionMarks(defaultType === "mcq" ? 5 : 10);
      setModalQuestions([
        {
          questionNo: getDefaultQuestionNo(defaultType, 0, nextSecNum),
          questionTextEn: "",
          questionTextUr: "",
          marks: defaultType === "mcq" ? 1 : defaultType === "long" ? 5 : 2,
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
        },
      ]);
    }

    setShowAddSectionModal(true);
  };

  // Handle changing section type inside the Add Section Modal
  const handleModalSectionTypeChange = (newType: ExamSection["type"]) => {
    setModalSectionType(newType);
    const nextSecNum = paperData.sections.length + 1;
    const romanSec = toRomanLower(nextSecNum).toUpperCase();
    const urduOrd = getUrduSectionOrdinal(nextSecNum);

    if (newType === "mcq") {
      setModalSectionTitleEn(`SECTION-${romanSec}: MULTIPLE CHOICE QUESTIONS`);
      setModalSectionTitleUr(`حصہ ${urduOrd}: کثیر الانتخابی سوالات`);
      setModalSectionMarks(5);
    } else if (newType === "short") {
      setModalSectionTitleEn(`SECTION-${romanSec}: SHORT QUESTIONS`);
      setModalSectionTitleUr(`حصہ ${urduOrd}: مختصر سوالات`);
      setModalSectionMarks(10);
    } else if (newType === "long") {
      setModalSectionTitleEn(`SECTION-${romanSec}: DETAILED QUESTIONS`);
      setModalSectionTitleUr(`حصہ ${urduOrd}: تفصیلی سوالات`);
      setModalSectionMarks(10);
    } else if (newType === "poetry") {
      setModalSectionTitleEn(`SECTION-${romanSec}: POETRY EXPLANATION`);
      setModalSectionTitleUr(`حصہ ${urduOrd}: اشعار کی تشریح`);
      setModalSectionMarks(5);
    } else {
      setModalSectionTitleEn(`SECTION-${romanSec}: ESSAY / APPLICATION`);
      setModalSectionTitleUr(`حصہ ${urduOrd}: مضمون / درخواست`);
      setModalSectionMarks(10);
    }

    setModalQuestions((prev) =>
      prev.map((q, idx) => ({
        ...q,
        questionNo: getDefaultQuestionNo(newType, idx, nextSecNum),
        marks: newType === "mcq" ? 1 : newType === "long" || newType === "essay" ? 5 : 2,
      }))
    );
  };

  const handleAddModalQuestionRow = () => {
    const baseIdx =
      modalTargetMode === "existing_section" && paperData.sections[modalTargetSectionIdx]
        ? paperData.sections[modalTargetSectionIdx].questions.length + modalQuestions.length
        : modalQuestions.length;

    const activeType =
      modalTargetMode === "existing_section" && paperData.sections[modalTargetSectionIdx]
        ? paperData.sections[modalTargetSectionIdx].type
        : modalSectionType;

    setModalQuestions((prev) => [
      ...prev,
      {
        questionNo: getDefaultQuestionNo(activeType, baseIdx, paperData.sections.length + 1),
        questionTextEn: "",
        questionTextUr: "",
        marks: activeType === "mcq" ? 1 : activeType === "long" || activeType === "essay" ? 5 : 2,
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
      },
    ]);
  };

  const handleRemoveModalQuestionRow = (idx: number) => {
    if (modalQuestions.length <= 1) return;
    setModalQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateModalQuestionRow = (
    idx: number,
    field: keyof ModalQuestionDraft,
    value: string | number
  ) => {
    setModalQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  // Submit handler for Add Section & Questions Modal
  const handleConfirmAddSectionModal = (e: React.FormEvent) => {
    e.preventDefault();

    const activeType =
      modalTargetMode === "existing_section" && paperData.sections[modalTargetSectionIdx]
        ? paperData.sections[modalTargetSectionIdx].type
        : modalSectionType;

    const validDrafts = modalQuestions.filter(
      (q) => q.questionTextEn.trim() !== "" || q.questionTextUr.trim() !== ""
    );

    if (validDrafts.length === 0) {
      setStatusMessage({
        text: "Please enter at least one question before adding to the paper.",
        type: "error",
      });
      return;
    }

    const builtQuestions: ExamQuestion[] = validDrafts.map((draft, idx) => {
      const rawPrimary = draft.questionTextEn.trim();
      const rawSecondary = draft.questionTextUr.trim();

      let qEn = rawPrimary;
      let qUr = rawSecondary;

      // Support "English | اردو" in a single field as well
      if (rawPrimary.includes("|") && !rawSecondary) {
        const parts = rawPrimary.split("|").map((s) => s.trim()).filter(Boolean);
        qEn = parts[0] || rawPrimary;
        qUr = parts[1] || parts[0] || rawPrimary;
      } else if (!qEn && qUr) {
        qEn = qUr;
      } else if (qEn && !qUr) {
        qUr = qEn;
      }

      let options: ExamQuestion["options"] = undefined;
      if (activeType === "mcq") {
        const rawOpts = [draft.optionA, draft.optionB, draft.optionC, draft.optionD];
        options = rawOpts.map((rawOpt, oIdx) => {
          const fallbackEn = `Option ${["A", "B", "C", "D"][oIdx]}`;
          const fallbackUr = `آپشن ${["الف", "ب", "ج", "د"][oIdx]}`;
          const trimmed = rawOpt.trim();
          if (!trimmed) {
            return {
              key: ["A", "B", "C", "D"][oIdx],
              textEn: paperLanguageMode === "Urdu" ? fallbackUr : fallbackEn,
              textUr: paperLanguageMode === "English" ? fallbackEn : fallbackUr,
            };
          }
          const { textEn, textUr } = splitBilingualOptionText(trimmed);
          return {
            key: ["A", "B", "C", "D"][oIdx],
            textEn: textEn || textUr,
            textUr: textUr || textEn,
          };
        });
      }

      return {
        number: idx + 1,
        customNumber: draft.questionNo.trim() || undefined,
        questionEn: qEn,
        questionUr: qUr,
        marks: Number(draft.marks) || (activeType === "mcq" ? 1 : 2),
        options,
        poetryLines:
          activeType === "poetry"
            ? (qUr || qEn)
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean)
            : undefined,
      };
    });

    const updatedSections = [...paperData.sections];

    if (modalTargetMode === "existing_section" && updatedSections[modalTargetSectionIdx]) {
      const targetSec = { ...updatedSections[modalTargetSectionIdx] };
      const startNum = targetSec.questions.length;
      const renumbered = builtQuestions.map((q, idx) => ({
        ...q,
        number: startNum + idx + 1,
      }));
      targetSec.questions = [...targetSec.questions, ...renumbered];
      const addedMarks = renumbered.reduce((sum, q) => sum + (q.marks || 0), 0);
      targetSec.marks = (targetSec.marks || 0) + addedMarks;
      updatedSections[modalTargetSectionIdx] = targetSec;
    } else {
      const computedSecMarks =
        Number(modalSectionMarks) ||
        builtQuestions.reduce((sum, q) => sum + (q.marks || 0), 0) ||
        10;

      const newSec: ExamSection = {
        id: `sec-${Date.now()}`,
        type: modalSectionType,
        titleEn: modalSectionTitleEn.trim() || `SECTION-${updatedSections.length + 1}`,
        titleUr: modalSectionTitleUr.trim() || modalSectionTitleEn.trim() || "نیا حصہ",
        marks: computedSecMarks,
        questions: builtQuestions,
      };
      updatedSections.push(newSec);
    }

    const newTotalMarks = updatedSections.reduce((acc, s) => acc + (Number(s.marks) || 0), 0);
    const nextPaperData: ExamPaperData = {
      ...paperData,
      sections: updatedSections,
      totalMarks: newTotalMarks || paperData.totalMarks,
    };

    setPaperData(nextPaperData);
    setRawText(serializeExamDataToRawText(nextPaperData, paperLanguageMode));
    setShowAddSectionModal(false);
    showToast(
      modalTargetMode === "existing_section"
        ? `Added ${builtQuestions.length} question(s) to section!`
        : `Added new section with ${builtQuestions.length} question(s) to the paper!`
    );
  };

  // Load Sample Preset
  const handleLoadSample = (mode: "Bilingual" | "Urdu" | "English") => {
    const text = SAMPLE_PAPERS[mode];
    setRawText(text);
    setPaperLanguageMode(mode);
    const parsed = parseRawTextToExam(text);
    setInstructionNote(
      mode === "Urdu" ? activeTemplate.instructionNoteUr : activeTemplate.instructionNoteEn
    );
    setPaperData((prev) => ({
      ...parsed,
      institutionName: prev.institutionName || activeTemplate.institutionName,
      subject: mode === "Urdu" ? "اردو لازمی" : mode === "English" ? "Physics" : "Computer Science",
      grade: prev.grade || "10th",
    }));
    showToast(`Loaded ${mode} sample examination paper`);
  };

  // Apply Template
  const handleApplyTemplate = (tpl: PaperTemplate) => {
    setActiveTemplate(tpl);
    setPaperLayout(tpl.layout);
    setFontSize(tpl.fontSize);
    setShowBorder(tpl.showBorder);
    setIncludeStudentInfo(tpl.showRollNo);
    setShowWatermark(tpl.showWatermark);
    setWatermarkText(tpl.watermarkText);
    setPaperCode(tpl.paperCode);
    setSyllabusText(tpl.syllabus);
    setTestNoText(tpl.testNo);
    setPaperTypeBanner(tpl.paperTypeBanner);
    setInstructionNote(paperLanguageMode === "Urdu" ? tpl.instructionNoteUr : tpl.instructionNoteEn);

    setPaperData((prev) => ({
      ...prev,
      institutionName: tpl.institutionName || prev.institutionName,
      title: tpl.title || prev.title,
      subject: tpl.subject || prev.subject,
      grade: tpl.grade || prev.grade,
      timeAllowed: tpl.timeAllowed || prev.timeAllowed,
      totalMarks: tpl.totalMarks || prev.totalMarks,
    }));
    setShowTemplateModal(false);
    showToast(`Applied template: ${tpl.name}`);
  };

  // Convert Pasted Raw Text Into Printable Exam Instantly
  const handleInstantParse = () => {
    if (!rawText.trim()) {
      setStatusMessage({ text: "Please paste or type exam questions in the editor first.", type: "error" });
      return;
    }
    const parsed = parseRawTextToExam(rawText);
    if (parsed.detectedLanguage) {
      setPaperLanguageMode(parsed.detectedLanguage);
      setInstructionNote(
        parsed.detectedLanguage === "Urdu"
          ? activeTemplate.instructionNoteUr
          : activeTemplate.instructionNoteEn
      );
    }
    setPaperData((prev) => ({
      ...parsed,
      institutionName: prev.institutionName || activeTemplate.institutionName,
      title: prev.title || parsed.title,
      subject: parsed.subject || prev.subject,
      totalMarks: parsed.totalMarks || prev.totalMarks,
    }));
    showToast("Converted raw text into formatted paper");
  };

  // 1. AI Generate Paper from Topic / Prompt
  const handleAiGenerateTopic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicPrompt.trim()) {
      setStatusMessage({
        text: "Enter a topic or chapter (e.g. '10th Computer Science Chapter 2' or '9th Physics Kinematics') to generate with AI.",
        type: "error",
      });
      return;
    }

    setIsGeneratingTopic(true);
    setStatusMessage({ text: `Generating ${paperLanguageMode} exam paper for "${topicPrompt}" with AI...`, type: "info" });

    try {
      const res = await fetch("/api/quick-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_topic",
          topicPrompt: topicPrompt.trim(),
          targetLang: paperLanguageMode,
          mcqCount: aiMcqCount,
          shortCount: aiShortCount,
          longCount: aiLongCount,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to generate topic paper");

      if (json.rawText) {
        setRawText(json.rawText);
      }
      if (json.result) {
        setPaperData((prev) => ({
          ...json.result,
          institutionName: prev.institutionName || activeTemplate.institutionName,
        }));
      }
      setStatusMessage({ text: "AI Exam Paper generated! Click any text on the sheet to edit.", type: "success" });
      showToast("AI Exam Paper generated!");
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Could not generate paper.", type: "error" });
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  // 2. AI Smart Standardize Raw Text
  const handleAiRefine = async () => {
    if (!rawText.trim()) {
      setStatusMessage({ text: "Please paste text or write your questions first.", type: "error" });
      return;
    }
    setIsAiStructuring(true);
    setStatusMessage({ text: "AI is standardizing sections, options, marks, and math formulas...", type: "info" });

    try {
      const res = await fetch("/api/quick-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "format_exam",
          text: rawText,
          targetLang: paperLanguageMode,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "AI formatting failed");

      if (json.rawText) {
        setRawText(json.rawText);
      }
      if (json.result) {
        setPaperData((prev) => ({
          ...prev,
          title: json.result.title || prev.title,
          subject: json.result.subject || prev.subject,
          grade: json.result.grade || prev.grade,
          timeAllowed: json.result.timeAllowed || prev.timeAllowed,
          totalMarks: json.result.totalMarks || prev.totalMarks,
          instructions: json.result.instructions || prev.instructions,
          sections: json.result.sections || prev.sections,
        }));
      }
      setStatusMessage({ text: "Paper standardized into Board format!", type: "success" });
      showToast("AI standardization complete!");
    } catch (err: any) {
      console.warn("AI structuring fallback to smart local parser:", err.message);
      handleInstantParse();
      setStatusMessage({ text: "Formatted using smart board parser.", type: "success" });
    } finally {
      setIsAiStructuring(false);
    }
  };

  // 3. OCR Using Gemini Vision API + Browser Tesseract Fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingOcr(true);
    setStatusMessage({ text: "Scanning image with Gemini Vision OCR...", type: "info" });

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const res = await fetch("/api/quick-paper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ocr",
            imageBase64: base64Data,
            mimeType: file.type || "image/jpeg",
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || "Vision OCR fallback");

        setRawText(json.result);
        const parsed = json.paperData || parseRawTextToExam(json.result);
        if (parsed.detectedLanguage) setPaperLanguageMode(parsed.detectedLanguage);
        setPaperData((prev) => ({
          ...parsed,
          institutionName: prev.institutionName || activeTemplate.institutionName,
        }));
        setStatusMessage({ text: "Gemini Vision OCR extracted questions accurately!", type: "success" });
        showToast("OCR scan complete!");
        setIsProcessingOcr(false);
        return;
      } catch (err: any) {
        console.warn("Gemini OCR fallback to browser Tesseract:", err.message);
      }

      try {
        setStatusMessage({ text: "Running local OCR engine (Tesseract)...", type: "info" });
        const Tesseract = await import("tesseract.js");
        const { data } = await Tesseract.recognize(base64Data, "eng+urd", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setStatusMessage({
                text: `Extracting text from image: ${Math.round((m.progress || 0) * 100)}%`,
                type: "info",
              });
            }
          },
        });
        const extracted = data.text.trim();
        setRawText(extracted);
        const parsed = parseRawTextToExam(extracted);
        if (parsed.detectedLanguage) setPaperLanguageMode(parsed.detectedLanguage);
        setPaperData((prev) => ({
          ...parsed,
          institutionName: prev.institutionName || activeTemplate.institutionName,
        }));
        setStatusMessage({ text: "OCR text extraction completed!", type: "success" });
        showToast("OCR extraction complete!");
      } catch (err: any) {
        setStatusMessage({ text: "OCR could not read image: " + err.message, type: "error" });
      } finally {
        setIsProcessingOcr(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // 4. AI Translate Paper (Urdu / English / Bilingual)
  const handleTranslate = async (lang: "Urdu" | "Bilingual" | "English") => {
    if (!rawText.trim()) {
      setStatusMessage({ text: "Please paste or enter exam text first to translate.", type: "error" });
      return;
    }
    setIsTranslating(true);
    setPaperLanguageMode(lang);
    setStatusMessage({ text: `Translating examination paper to ${lang}...`, type: "info" });

    try {
      const res = await fetch("/api/quick-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          text: rawText,
          targetLang: lang,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Translation failed");

      if (json.result) {
        setRawText(json.result);
      }
      if (json.paperData) {
        setPaperData((prev) => ({
          ...json.paperData,
          institutionName: prev.institutionName || activeTemplate.institutionName,
        }));
      } else if (json.result) {
        const parsed = parseRawTextToExam(json.result);
        setPaperData((prev) => ({
          ...parsed,
          institutionName: prev.institutionName || activeTemplate.institutionName,
        }));
      }
      setInstructionNote(
        lang === "Urdu" ? activeTemplate.instructionNoteUr : activeTemplate.instructionNoteEn
      );
      setStatusMessage({ text: `Translated paper to ${lang} mode!`, type: "success" });
      showToast(`Switched & translated to ${lang}`);
    } catch (err: any) {
      setStatusMessage({ text: "Translation error: " + err.message, type: "error" });
    } finally {
      setIsTranslating(false);
    }
  };

  // Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoBase64(reader.result as string);
      showToast("Academy logo updated on paper sheet");
    };
    reader.readAsDataURL(file);
  };

  // Editable Question Handlers
  const handleUpdateSectionTitle = (sIdx: number, field: "titleUr" | "titleEn", val: string) => {
    const updated = [...paperData.sections];
    updated[sIdx] = { ...updated[sIdx], [field]: val };
    setPaperData({ ...paperData, sections: updated });
  };

  const handleUpdateQuestionText = (
    sIdx: number,
    qIdx: number,
    field: "questionUr" | "questionEn" | "customNumber",
    val: string
  ) => {
    const updated = [...paperData.sections];
    const q = { ...updated[sIdx].questions[qIdx], [field]: val };
    if (field === "questionUr" && !q.questionEn) q.questionEn = val;
    if (field === "questionEn" && !q.questionUr) q.questionUr = val;
    updated[sIdx].questions[qIdx] = q;
    setPaperData({ ...paperData, sections: updated });
  };

  const handleUpdateOption = (
    sIdx: number,
    qIdx: number,
    oIdx: number,
    field: "key" | "textUr" | "textEn",
    val: string
  ) => {
    const updated = [...paperData.sections];
    const opts = updated[sIdx].questions[qIdx].options;
    if (opts && opts[oIdx]) {
      opts[oIdx] = { ...opts[oIdx], [field]: val };
      setPaperData({ ...paperData, sections: updated });
    }
  };

  const handleDeleteQuestion = (sIdx: number, qIdx: number) => {
    const updated = [...paperData.sections];
    updated[sIdx].questions.splice(qIdx, 1);
    const nextData = { ...paperData, sections: updated };
    setPaperData(nextData);
    setRawText(serializeExamDataToRawText(nextData, paperLanguageMode));
  };

  const handleDeleteSection = (sIdx: number) => {
    const updated = [...paperData.sections];
    updated.splice(sIdx, 1);
    const nextData = { ...paperData, sections: updated };
    setPaperData(nextData);
    setRawText(serializeExamDataToRawText(nextData, paperLanguageMode));
    showToast("Removed section from paper");
  };

  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const handleDownloadWord = async () => {
    try {
      setIsExportingDocx(true);
      const blob = await exportPaperToDocx({
        paperData: {
          ...paperData,
          date: paperData.date || "17-10-2026",
        },
        languageMode: paperLanguageMode,
        syllabus: syllabusText,
        testNo: testNoText,
        paperCode,
        note: includeNote ? instructionNote : "",
        noteUr: includeNote ? activeTemplate.instructionNoteUr : "",
        paperTypeBanner,
        logoBase64,
        headerStyle:
          activeTemplate.headerStyle === "fbise-style2"
            ? "style2"
            : activeTemplate.headerStyle === "punjab-board-style1"
            ? "style1"
            : "minimal",
        includeStudentInfo,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const cleanTitle = (paperData.institutionName || "Exam_Paper").replace(/\s+/g, "_");
      link.download = `${cleanTitle}_${paperCode || "Paper"}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Downloaded editable Word (.docx) file");
    } catch (err) {
      console.error("Word export failed:", err);
      setStatusMessage({ text: "Failed to export Word document. Please try again.", type: "error" });
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    if (sheetMeasureRef.current && fitToOnePage) {
      const h = sheetMeasureRef.current.scrollHeight;
      const targetMaxPx = printDensity === "2_per_page" ? 695 : 1015;
      const computedScale = h > targetMaxPx ? Math.max(0.55, Number((targetMaxPx / h).toFixed(3))) : 1;
      setPrintScale(computedScale);
    } else {
      setPrintScale(1);
    }
    setTimeout(() => {
      window.print();
    }, 60);
  };

  const formattedCodeDigits = (paperCode || "3044").padEnd(4, "0").slice(0, 4).split("");
  const totalQuestionsCount = paperData.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const questionSummary = paperData.sections.reduce(
    (summary, section) => {
      summary[section.type] = (summary[section.type] || 0) + section.questions.length;
      return summary;
    },
    {} as Record<string, number>
  );

  useEffect(() => {
    try {
      localStorage.setItem("paperwala_quick_paper_draft", rawText);
    } catch {
      // Draft saving is an optional browser convenience.
    }
  }, [rawText]);

  const restoreDraft = () => {
    try {
      const draft = localStorage.getItem("paperwala_quick_paper_draft");
      if (!draft) {
        showToast("No saved draft found on this device");
        return;
      }
      setRawText(draft);
      const parsed = parseRawTextToExam(draft);
      setPaperData((previous) => ({ ...previous, ...parsed }));
      showToast("Restored your saved quick-paper draft");
    } catch {
      setStatusMessage({ text: "Your browser could not restore the saved draft.", type: "error" });
    }
  };

  // Compute total character volume so base font size adapts automatically when Fit-to-1-Page is enabled
  const totalContentChars = paperData.sections.reduce(
    (sum, sec) =>
      sum +
      sec.questions.reduce(
        (qSum, q) =>
          qSum +
          (q.questionEn?.length || 0) +
          (q.questionUr?.length || 0) +
          (q.options?.reduce((oSum, o) => oSum + (o.textEn?.length || 0) + (o.textUr?.length || 0), 0) || 0),
        0
      ),
    0
  );

  // Measure actual rendered sheet height and update printScale automatically
  useEffect(() => {
    if (!fitToOnePage) {
      setPrintScale(1);
      return;
    }
    const el = sheetMeasureRef.current;
    if (!el) return;

    const updateScale = () => {
      const h = el.scrollHeight;
      const targetMaxPx = printDensity === "2_per_page" ? 695 : 1015;
      if (h > targetMaxPx) {
        const nextScale = Math.max(0.55, Number((targetMaxPx / h).toFixed(3)));
        setPrintScale(nextScale);
      } else {
        setPrintScale(1);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    fitToOnePage,
    printDensity,
    paperLanguageMode,
    fontSize,
    includeStudentInfo,
    includeNote,
    showBorder,
    totalQuestionsCount,
    totalContentChars,
  ]);

  // ===========================================================================
  // REUSABLE EXAMINATION PAPER SHEET RENDERER (Supports Urdu, English & Bilingual)
  // ===========================================================================
  const renderPaperContent = (copyIndex: number = 1) => {
    const isSecondCopy = copyIndex === 2;
    const isUrduOnly = paperLanguageMode === "Urdu";
    const isEnglishOnly = paperLanguageMode === "English";
    const isBilingual = paperLanguageMode === "Bilingual";
    const is2Up = printDensity === "2_per_page";
    const isFbiseStyle = activeTemplate.headerStyle === "fbise-style2";

    // Calculate adaptive base font size so content stays compact on 1 page
    let basePx = is2Up ? Math.min(fontSize, 9.5) : fontSize;
    if (fitToOnePage) {
      if (is2Up) {
        if (totalContentChars > 1600 || totalQuestionsCount > 12) basePx = Math.min(basePx, 8.5);
        else if (totalContentChars > 1000 || totalQuestionsCount > 8) basePx = Math.min(basePx, 9);
      } else {
        if (totalContentChars > 2400 || totalQuestionsCount > 16) basePx = Math.min(basePx, 10.2);
        else if (totalContentChars > 1600 || totalQuestionsCount > 11) basePx = Math.min(basePx, 11);
      }
    }

    return (
      <div
        ref={copyIndex === 1 ? sheetMeasureRef : undefined}
        className={`printable-paper-sheet bg-white text-black transition-all relative ${
          showBorder ? "border-2 border-black" : "border border-slate-300"
        } ${
          is2Up
            ? "p-2.5 sm:p-3"
            : "p-4 sm:p-6 shadow-xl print:shadow-none"
        }`}
        style={{
          boxSizing: "border-box",
          lineHeight: is2Up ? "1.3" : "1.38",
          fontSize: `${basePx}px`,
        }}
      >
        {/* Optional Background Watermark */}
        {showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none overflow-hidden z-0">
            <span className="text-[4.2em] font-black -rotate-45 uppercase tracking-widest text-slate-900">
              {watermarkText || paperData.institutionName}
            </span>
          </div>
        )}

        {/* ===================================================================
            HEADER SECTION: STYLE 1 (PUNJAB BOARDS) / STYLE 2 (FBISE) / MINIMAL
            =================================================================== */}
        {activeTemplate.headerStyle === "punjab-board-style1" || activeTemplate.headerStyle === "fbise-style2" ? (
          <header className="relative z-10 mb-2 font-sans select-text" dir="ltr">
            <div className="border-2 border-black flex items-stretch w-full bg-white box-border mb-0">
              {/* Left: Logo Box */}
              <div
                className={`${
                  is2Up ? "w-14 min-w-[52px] p-1" : "w-16 sm:w-20 min-w-[58px] sm:min-w-[76px] p-1.5"
                } border-r-2 border-black flex flex-col items-center justify-center bg-white shrink-0`}
              >
                {logoBase64 ? (
                  <img
                    src={logoBase64}
                    alt="Logo"
                    className={`${
                      is2Up ? "max-h-10 max-w-[44px]" : "max-h-12 sm:max-h-14 max-w-[52px] sm:max-w-[66px]"
                    } object-contain`}
                  />
                ) : (
                  <div
                    className={`${
                      is2Up ? "w-9 h-9" : "w-10 h-10 sm:w-12 sm:h-12"
                    } border-2 border-[#1a365d] rounded-full flex flex-col items-center justify-center p-0.5 bg-slate-50 text-[#1a365d] text-center font-black`}
                  >
                    <span className="text-[0.72em] leading-none">
                      {isFbiseStyle ? "FBISE" : "BISE"}
                    </span>
                    <span className="text-[0.52em] uppercase tracking-tighter leading-none mt-0.5">
                      BOARD
                    </span>
                  </div>
                )}
              </div>

              {/* Center: Institution Name + Dark Blue Banner + Subject/Class */}
              <div className="flex-1 min-w-0 flex flex-col justify-between text-center border-r-2 border-black">
                <div
                  className={`py-1 px-2 font-black text-[1.28em] text-[#1a365d] uppercase tracking-wide leading-tight ${
                    hasUrduScript(paperData.institutionName) ? "font-urdu text-[1.35em] leading-[1.6]" : "font-serif"
                  }`}
                >
                  {isEditMode && !isSecondCopy ? (
                    <>
                      <input
                        type="text"
                        value={paperData.institutionName}
                        onChange={(e) =>
                          setPaperData({ ...paperData, institutionName: e.target.value })
                        }
                        className="w-full text-center font-black text-[1em] text-[#1a365d] bg-amber-50/60 border-b border-dashed border-amber-500 focus:outline-none uppercase no-print"
                      />
                      <span className="print-only">{paperData.institutionName}</span>
                    </>
                  ) : (
                    paperData.institutionName
                  )}
                </div>

                {/* Dark Blue Examination Banner */}
                <div
                  className={`bg-[#1a365d] text-white font-black text-[0.85em] py-0.5 px-2 border-y border-black tracking-widest uppercase leading-tight ${
                    hasUrduScript(paperTypeBanner) ? "font-urdu text-[0.95em] tracking-normal leading-[1.5]" : ""
                  }`}
                >
                  {isEditMode && !isSecondCopy ? (
                    <>
                      <input
                        type="text"
                        value={paperTypeBanner}
                        onChange={(e) => setPaperTypeBanner(e.target.value)}
                        className="w-full text-center font-black text-[1em] text-white bg-transparent border-b border-dashed border-white/60 focus:outline-none uppercase no-print"
                      />
                      <span className="print-only">{paperTypeBanner}</span>
                    </>
                  ) : (
                    paperTypeBanner
                  )}
                </div>

                {/* Subject & Class Row */}
                <div className="py-1 px-2 text-[0.95em] font-bold text-black flex items-center justify-center gap-3 flex-wrap leading-tight bg-slate-50/50">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-slate-700">
                      {isUrduOnly ? "مضمون:" : "Subject:"}
                    </span>
                    {isEditMode && !isSecondCopy ? (
                      <>
                        <input
                          type="text"
                          value={paperData.subject}
                          onChange={(e) => setPaperData({ ...paperData, subject: e.target.value })}
                          className="font-bold text-[1em] bg-amber-50/60 border-b border-dashed border-amber-500 focus:outline-none w-32 text-center no-print"
                        />
                        <span className="print-only">{paperData.subject}</span>
                      </>
                    ) : (
                      <span className={hasUrduScript(paperData.subject) ? "font-urdu text-[1.08em]" : ""}>
                        {paperData.subject}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400">|</span>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-slate-700">
                      {isUrduOnly ? "جماعت:" : "Class:"}
                    </span>
                    {isEditMode && !isSecondCopy ? (
                      <>
                        <input
                          type="text"
                          value={paperData.grade}
                          onChange={(e) => setPaperData({ ...paperData, grade: e.target.value })}
                          className="font-bold text-[1em] bg-amber-50/60 border-b border-dashed border-amber-500 focus:outline-none w-20 text-center no-print"
                        />
                        <span className="print-only">{paperData.grade}</span>
                      </>
                    ) : (
                      <span className={hasUrduScript(paperData.grade) ? "font-urdu text-[1.05em]" : ""}>
                        {paperData.grade}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: 4-Digit Paper Code Box */}
              <div
                className={`${
                  is2Up ? "w-18 min-w-[66px] p-1" : "w-20 sm:w-24 min-w-[72px] sm:min-w-[88px] p-1.5"
                } flex flex-col items-center justify-center bg-white shrink-0 text-center`}
              >
                <div className="text-[0.7em] sm:text-[0.75em] font-extrabold uppercase tracking-tight text-black mb-1 leading-none">
                  PAPER CODE
                </div>
                <div className="flex justify-center gap-0.5">
                  {formattedCodeDigits.map((digit, dIdx) => (
                    <div
                      key={dIdx}
                      className={`${
                        is2Up ? "w-3.5 h-4" : "w-4 sm:w-4.5 h-5 sm:h-5.5"
                      } border-[1.5px] border-black flex items-center justify-center font-black font-mono text-[0.92em] sm:text-[0.98em] bg-white tabular-nums`}
                    >
                      {isEditMode && !isSecondCopy ? (
                        <>
                          <input
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const arr = [...formattedCodeDigits];
                              arr[dIdx] = e.target.value;
                              setPaperCode(arr.join(""));
                            }}
                            className="w-full h-full text-center font-black font-mono bg-amber-50/60 focus:outline-none no-print"
                          />
                          <span className="print-only">{digit}</span>
                        </>
                      ) : (
                        digit
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Details & Syllabus Table */}
            {includeStudentInfo && (
              <table
                className="w-full border-2 border-black border-t-0 border-collapse text-[0.92em] font-bold"
                dir="ltr"
              >
                <tbody>
                  <tr className="border-b border-black">
                    <td className="w-24 bg-[#f8f9fa] border-r border-black px-2 py-1 text-left whitespace-nowrap text-slate-900">
                      Student Name:
                    </td>
                    <td className="border-r-2 border-black px-2 py-1 bg-white w-1/3">
                      <span className="border-b border-dotted border-slate-500 inline-block w-full min-h-[12px]" />
                    </td>
                    <td className="w-18 bg-[#fff3e0] border-r border-black px-2 py-1 text-left text-[#e65100] whitespace-nowrap">
                      Syllabus:
                    </td>
                    <td className="px-2 py-1 bg-white text-slate-900">
                      {isEditMode && !isSecondCopy ? (
                        <>
                          <input
                            type="text"
                            value={syllabusText}
                            onChange={(e) => setSyllabusText(e.target.value)}
                            className="w-full bg-amber-50/60 border-b border-dashed border-amber-500 focus:outline-none font-bold text-[1em] text-slate-900 no-print"
                          />
                          <span className="print-only font-bold">{syllabusText}</span>
                        </>
                      ) : (
                        <span className={`font-semibold ${hasUrduScript(syllabusText) ? "font-urdu" : ""}`}>
                          {syllabusText}
                        </span>
                      )}
                    </td>
                  </tr>

                  <tr className="bg-[#e3f2fd] text-[#0d47a1]">
                    <td colSpan={4} className="px-2 py-1">
                      <div className="flex items-center justify-between gap-2 text-[0.94em] flex-wrap font-bold leading-tight">
                        <div className="flex items-center gap-1">
                          <span>Roll No:</span>
                          <span className="border-b border-dotted border-[#0d47a1] w-14 inline-block" />
                        </div>
                        <span className="text-slate-400">|</span>
                        <div className="flex items-center gap-1">
                          <span>Time Allowed:</span>
                          {isEditMode && !isSecondCopy ? (
                            <>
                              <input
                                type="text"
                                value={paperData.timeAllowed}
                                onChange={(e) =>
                                  setPaperData({ ...paperData, timeAllowed: e.target.value })
                                }
                                className="w-16 bg-amber-50 border-b border-dotted border-[#0d47a1] text-center font-bold focus:outline-none no-print"
                              />
                              <span className="print-only">{paperData.timeAllowed}</span>
                            </>
                          ) : (
                            <span className={hasUrduScript(paperData.timeAllowed) ? "font-urdu" : ""}>
                              {paperData.timeAllowed}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400">|</span>
                        <div className="flex items-center gap-1">
                          <span>Total Marks:</span>
                          {isEditMode && !isSecondCopy ? (
                            <>
                              <input
                                type="number"
                                value={paperData.totalMarks}
                                onChange={(e) =>
                                  setPaperData({
                                    ...paperData,
                                    totalMarks: Number(e.target.value),
                                  })
                                }
                                className="w-12 bg-amber-50 border-b border-dotted border-[#0d47a1] text-center font-bold focus:outline-none no-print tabular-nums"
                              />
                              <span className="print-only">{paperData.totalMarks}</span>
                            </>
                          ) : (
                            <span className="tabular-nums font-black">{paperData.totalMarks}</span>
                          )}
                        </div>
                        <span className="text-slate-400">|</span>
                        <div className="flex items-center gap-1">
                          <span>Date:</span>
                          <span className="tabular-nums">{paperData.date || "17-10-2026"}</span>
                        </div>
                        <span className="text-slate-400">|</span>
                        <div className="flex items-center gap-1">
                          <span>Test No.:</span>
                          {isEditMode && !isSecondCopy ? (
                            <>
                              <input
                                type="text"
                                value={testNoText}
                                onChange={(e) => setTestNoText(e.target.value)}
                                className="w-9 bg-amber-50 border-b border-dotted border-[#0d47a1] text-center font-bold focus:outline-none no-print"
                              />
                              <span className="print-only">{testNoText}</span>
                            </>
                          ) : (
                            <span className="tabular-nums">{testNoText}</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* Instruction / Note Row */}
            {includeNote && (
              <div
                className={`mt-1.5 px-2 py-1 bg-emerald-50/50 border border-emerald-200/90 rounded text-[0.88em] flex items-start gap-1.5 ${
                  isUrduOnly || isPureUrduText(instructionNote)
                    ? "flex-row-reverse text-right font-urdu leading-[1.75]"
                    : "text-left leading-snug"
                }`}
                dir={isUrduOnly || isPureUrduText(instructionNote) ? "rtl" : "ltr"}
              >
                <span className="bg-[#d4efdf] text-[#196f3d] px-1.5 py-0.5 rounded text-[0.9em] font-extrabold shrink-0 font-sans">
                  {isUrduOnly || isPureUrduText(instructionNote) ? "نوٹ:" : "Note:"}
                </span>
                {isEditMode && !isSecondCopy ? (
                  <>
                    <textarea
                      rows={1}
                      value={instructionNote}
                      onChange={(e) => setInstructionNote(e.target.value)}
                      className="w-full text-slate-900 bg-amber-50/60 border-b border-dashed border-amber-500 focus:outline-none resize-none leading-tight no-print"
                    />
                    <span className="print-only text-slate-900">{instructionNote}</span>
                  </>
                ) : (
                  <span className="text-slate-900 font-medium">{instructionNote}</span>
                )}
              </div>
            )}
          </header>
        ) : (
          <header className="relative z-10 border-b-2 border-black pb-2 mb-2.5 text-center" dir="ltr">
            <h1 className="text-[1.35em] font-black uppercase tracking-tight font-serif leading-tight text-[#1a365d]">
              {paperData.institutionName}
            </h1>
            <p className="text-[0.92em] font-bold uppercase text-slate-800 leading-tight mt-0.5">
              {paperTypeBanner} &bull; {paperData.subject} (Class: {paperData.grade}) &bull; Marks:{" "}
              {paperData.totalMarks} &bull; Time: {paperData.timeAllowed}
            </p>
          </header>
        )}

        {/* ===================================================================
            SECTIONS & QUESTIONS (Supports Bilingual, English & Urdu)
            =================================================================== */}
        <div className="relative z-10 space-y-2.5 pt-0.5">
          {paperData.sections.map((section, sIdx) => {
            const isMcqSection = section.type === "mcq";
            const isLongSection = section.type === "long" || section.type === "essay" || section.type === "letter";
            const secTitleEn =
              section.titleEn ||
              (isMcqSection
                ? "SECTION-I: MULTIPLE CHOICE QUESTIONS"
                : isLongSection
                ? "SECTION-III: DETAILED QUESTIONS"
                : "SECTION-II: SHORT QUESTIONS");
            const secTitleUr =
              section.titleUr ||
              (isMcqSection
                ? "حصہ اول: کثیر الانتخابی سوالات"
                : isLongSection
                ? "حصہ سوم: تفصیلی سوالات"
                : "حصہ دوم: مختصر سوالات");

            const sectionIsPureUrdu =
              isUrduOnly ||
              (section.questions.length > 0 &&
                section.questions.every((q) => isPureUrduText(q.questionUr) && q.questionEn === q.questionUr));

            return (
              <div key={section.id || sIdx} className="space-y-1.5">
                {/* Official Board Section Header Banner */}
                <div
                  className="section-header-keep bg-slate-100/95 border-y-2 border-black px-2 py-1 flex items-center justify-between gap-2"
                  dir={isUrduOnly ? "rtl" : "ltr"}
                >
                  {/* Left: English Title (or Urdu Title in Urdu-Only Mode) */}
                  <div className="flex-1 min-w-0 flex items-center justify-between gap-2 flex-wrap">
                    {!isUrduOnly && (
                      <div className="font-black uppercase tracking-wider text-slate-950 text-[0.95em] leading-tight font-sans">
                        {isEditMode && !isSecondCopy ? (
                          <>
                            <input
                              type="text"
                              value={secTitleEn}
                              onChange={(e) => handleUpdateSectionTitle(sIdx, "titleEn", e.target.value)}
                              className="font-black uppercase text-black bg-amber-50/80 border-b border-dashed border-amber-500 focus:outline-none no-print min-w-[200px]"
                            />
                            <span className="print-only">{secTitleEn}</span>
                          </>
                        ) : (
                          secTitleEn
                        )}
                      </div>
                    )}

                    {/* Center/Side Marks Badge */}
                    {section.marks !== undefined && (
                      <div className="text-[0.9em] font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 tabular-nums shrink-0 font-sans">
                        {isUrduOnly ? `کل نمبر: ${section.marks}` : `Marks: ${section.marks}`}
                      </div>
                    )}

                    {/* Right: Urdu Section Title */}
                    {(isUrduOnly || isBilingual || sectionIsPureUrdu) && (
                      <div
                        className="font-bold text-slate-950 text-[1.08em] font-urdu leading-[1.65]"
                        dir="rtl"
                      >
                        {isEditMode && !isSecondCopy ? (
                          <>
                            <input
                              type="text"
                              value={secTitleUr}
                              onChange={(e) => handleUpdateSectionTitle(sIdx, "titleUr", e.target.value)}
                              className="font-bold text-black bg-amber-50/80 border-b border-dashed border-amber-500 focus:outline-none no-print text-right font-urdu"
                            />
                            <span className="print-only">{secTitleUr}</span>
                          </>
                        ) : (
                          secTitleUr
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Section Action Buttons (Add Question Modal & Delete Section) */}
                  {!isSecondCopy && (
                    <div className="no-print flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openAddSectionModal("existing_section", sIdx)}
                        className="px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-300 flex items-center gap-1 font-sans cursor-pointer transition-colors"
                        title="Add a question with Question No. to this section"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Q</span>
                      </button>
                      {paperData.sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(sIdx)}
                          className="text-rose-600 hover:bg-rose-100 p-1 rounded cursor-pointer transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* =============================================================
                    1. MCQs SECTION (Board-Standard 4-Column / 2x2 / FBISE Grid)
                    ============================================================= */}
                {isMcqSection ? (
                  isFbiseStyle ? (
                    /* STYLE 2: FBISE BOXED MCQ TABLE */
                    <table className="fb-table w-full text-[0.94em]">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="w-[44%] text-left font-extrabold">
                            {isUrduOnly ? "سوال (Question)" : "Question / سوال"}
                          </th>
                          {["A / الف", "B / ب", "C / ج", "D / د"].map((col, cIdx) => (
                            <th key={cIdx} className="w-[14%] text-center font-extrabold">
                              ({col})
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.questions.map((q, qIdx) => {
                          const qTextEn = (q.questionEn || q.questionUr || "").trim();
                          const qTextUr = (q.questionUr || q.questionEn || "").trim();
                          const qIsPureUrdu = isUrduOnly || (isPureUrduText(qTextUr) && qTextEn === qTextUr);
                          const hasDistinctUrdu = Boolean(qTextUr && qTextUr !== qTextEn);
                          const qLabel = q.customNumber || `${qIdx + 1}`;
                          const opts = q.options || [];

                          return (
                            <tr key={qIdx} className="break-inside-avoid">
                              <td className="align-middle">
                                <div className="space-y-1">
                                  {!qIsPureUrdu && (
                                    <div className="font-bold text-left leading-snug" dir="ltr">
                                      <span className="font-extrabold mr-1">{qLabel}.</span>
                                      <MathRenderer content={qTextEn} />
                                    </div>
                                  )}
                                  {(qIsPureUrdu || (isBilingual && hasDistinctUrdu)) && (
                                    <div
                                      className="font-bold font-urdu text-right text-[1.06em] leading-[1.8]"
                                      dir="rtl"
                                    >
                                      {qIsPureUrdu && (
                                        <span className="font-extrabold font-sans ml-1">({qLabel})</span>
                                      )}
                                      <MathRenderer content={qTextUr} />
                                    </div>
                                  )}
                                </div>
                              </td>
                              {[0, 1, 2, 3].map((oIdx) => {
                                const opt = opts[oIdx];
                                const oEn = (opt?.textEn || opt?.textUr || "").trim();
                                const oUr = (opt?.textUr || opt?.textEn || "").trim();
                                const optIsPureUrdu = isUrduOnly || (isPureUrduText(oUr) && oEn === oUr);
                                const optHasDistinctUr = Boolean(oUr && oUr !== oEn);

                                return (
                                  <td key={oIdx} className="text-center align-middle">
                                    {!optIsPureUrdu && oEn && (
                                      <div className="font-medium leading-snug" dir="ltr">
                                        <MathRenderer content={oEn} />
                                      </div>
                                    )}
                                    {(optIsPureUrdu || (isBilingual && optHasDistinctUr)) && oUr && (
                                      <div
                                        className="font-urdu text-[1.04em] leading-[1.75] text-slate-900"
                                        dir="rtl"
                                      >
                                        <MathRenderer content={oUr} />
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    /* STYLE 1: PUNJAB BOARDS (BISE) STRUCTURED MCQ LAYOUT */
                    <div className="divide-y divide-slate-200/90">
                      {section.questions.map((q, qIdx) => {
                        const qTextEn = (q.questionEn || q.questionUr || "").trim();
                        const qTextUr = (q.questionUr || q.questionEn || "").trim();
                        const qIsPureUrdu =
                          isUrduOnly || (isPureUrduText(qTextUr) && qTextEn === qTextUr);
                        const hasDistinctUrdu = Boolean(qTextUr && qTextUr !== qTextEn);
                        const qLabel = q.customNumber
                          ? q.customNumber.replace(/[:.\-۔]+$/, "")
                          : `${qIdx + 1}`;

                        // Determine whether options need 2x2 grid or 4-column grid
                        const opts = q.options || [];
                        const maxOptionLength = opts.reduce((max, o) => {
                          const en = o.textEn || "";
                          const ur = o.textUr || "";
                          const len =
                            isBilingual && ur && ur !== en
                              ? en.length + ur.length + 3
                              : (qIsPureUrdu ? ur : en).length;
                          return Math.max(max, len);
                        }, 0);
                        const use2x2OptionGrid = maxOptionLength > 30;

                        return (
                          <div
                            key={qIdx}
                            className="py-1.5 first:pt-1 last:pb-0.5 text-[0.96em] break-inside-avoid group relative"
                          >
                            {/* Question Stem Row */}
                            <div
                              className={`flex items-start justify-between gap-3 font-bold text-slate-950 ${
                                qIsPureUrdu ? "flex-row-reverse" : ""
                              }`}
                            >
                              {/* English Stem (shown when English or Bilingual with English text) */}
                              {!qIsPureUrdu && (isEnglishOnly || isBilingual) && (
                                <div
                                  className="flex-1 flex items-start gap-1.5 text-left leading-[1.35] font-sans"
                                  dir="ltr"
                                >
                                  {isEditMode && !isSecondCopy ? (
                                    <input
                                      type="text"
                                      value={qLabel}
                                      onChange={(e) =>
                                        handleUpdateQuestionText(sIdx, qIdx, "customNumber", e.target.value)
                                      }
                                      className="w-8 font-extrabold bg-amber-50 border-b border-dashed border-amber-500 text-center no-print"
                                      title="Question No."
                                    />
                                  ) : null}
                                  <span
                                    className={`font-extrabold shrink-0 tabular-nums ${
                                      isEditMode && !isSecondCopy ? "print-only" : ""
                                    }`}
                                  >
                                    {qLabel}.
                                  </span>
                                  {isEditMode && !isSecondCopy ? (
                                    <>
                                      <textarea
                                        rows={1}
                                        value={qTextEn}
                                        onChange={(e) =>
                                          handleUpdateQuestionText(sIdx, qIdx, "questionEn", e.target.value)
                                        }
                                        className="w-full bg-amber-50/60 border-b border-dashed border-amber-500 focus:outline-none resize-none font-bold no-print"
                                      />
                                      <span className="print-only font-bold">
                                        <MathRenderer content={qTextEn} />
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-bold flex-1">
                                      <MathRenderer content={qTextEn} />
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Urdu Stem (shown when Urdu-only, pure Urdu question, or Bilingual with distinct Urdu) */}
                              {(qIsPureUrdu || (isBilingual && hasDistinctUrdu)) && (
                                <div
                                  className="flex-1 flex items-start gap-1.5 font-urdu text-right text-[1.08em] leading-[1.82]"
                                  dir="rtl"
                                >
                                  {qIsPureUrdu && (
                                    <span className="font-extrabold shrink-0 font-sans tabular-nums text-[0.92em]">
                                      ({qLabel})
                                    </span>
                                  )}
                                  {isEditMode && !isSecondCopy ? (
                                    <>
                                      <textarea
                                        rows={1}
                                        value={qTextUr}
                                        onChange={(e) =>
                                          handleUpdateQuestionText(sIdx, qIdx, "questionUr", e.target.value)
                                        }
                                        className="w-full bg-amber-50/60 border-b border-dashed border-amber-500 focus:outline-none resize-none font-bold font-urdu text-right no-print"
                                      />
                                      <span className="print-only font-bold font-urdu">
                                        <MathRenderer content={qTextUr} />
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-bold flex-1 font-urdu">
                                      <MathRenderer content={qTextUr} />
                                    </span>
                                  )}
                                </div>
                              )}

                              {!isSecondCopy && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                                  className={`no-print text-rose-500 hover:text-rose-700 text-xs shrink-0 p-0.5 transition-opacity ${
                                    isEditMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                  }`}
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Structured 4-Column or 2x2 Board MCQ Options Grid */}
                            {opts.length > 0 && (
                              <div
                                className={`grid ${
                                  use2x2OptionGrid
                                    ? "grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-4 gap-y-1"
                                    : "grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-x-3 gap-y-1"
                                } pt-1 mt-0.5 text-[0.93em] font-medium text-slate-900 ${
                                  qIsPureUrdu ? "pr-4 font-urdu" : "pl-4"
                                }`}
                                dir={qIsPureUrdu ? "rtl" : "ltr"}
                              >
                                {opts.map((opt, oIdx) => {
                                  const oTextEn = (opt.textEn || opt.textUr || "").trim();
                                  const oTextUr = (opt.textUr || opt.textEn || "").trim();
                                  const optIsPureUrdu =
                                    qIsPureUrdu || (isPureUrduText(oTextUr) && oTextEn === oTextUr);
                                  const optHasDistinctUrdu = Boolean(oTextUr && oTextUr !== oTextEn);

                                  const badgeLabel = optIsPureUrdu
                                    ? getUrduOptionLabel(opt.key, oIdx)
                                    : normalizeOptionKey(opt.key, oIdx);

                                  return (
                                    <div
                                      key={oIdx}
                                      className={`flex items-baseline gap-1.5 min-w-0 py-0.5 px-1.5 rounded bg-slate-50/70 border border-slate-200/80 ${
                                        optIsPureUrdu
                                          ? "text-right font-urdu leading-[1.8]"
                                          : "text-left leading-[1.35]"
                                      }`}
                                      dir={optIsPureUrdu ? "rtl" : "ltr"}
                                    >
                                      <span
                                        className={`font-extrabold shrink-0 text-slate-950 ${
                                          optIsPureUrdu ? "font-urdu text-[0.98em]" : "font-sans text-[0.92em]"
                                        }`}
                                      >
                                        ({badgeLabel})
                                      </span>

                                      {isEditMode && !isSecondCopy ? (
                                        <>
                                          <input
                                            type="text"
                                            value={optIsPureUrdu ? oTextUr : oTextEn}
                                            onChange={(e) =>
                                              handleUpdateOption(
                                                sIdx,
                                                qIdx,
                                                oIdx,
                                                optIsPureUrdu ? "textUr" : "textEn",
                                                e.target.value
                                              )
                                            }
                                            className="w-full bg-amber-50/60 border-b border-dashed border-amber-500 focus:outline-none text-[1em] no-print"
                                          />
                                          <span className="print-only break-words">
                                            <MathRenderer content={optIsPureUrdu ? oTextUr : oTextEn} />
                                          </span>
                                        </>
                                      ) : optIsPureUrdu ? (
                                        <span className="break-words font-urdu text-[1.05em] leading-[1.8]">
                                          <MathRenderer content={oTextUr} />
                                        </span>
                                      ) : isEnglishOnly || !optHasDistinctUrdu ? (
                                        <span className="break-words font-sans">
                                          <MathRenderer content={oTextEn} />
                                        </span>
                                      ) : (
                                        <span className="inline-flex flex-wrap items-baseline gap-1 break-words">
                                          <span className="font-sans">
                                            <MathRenderer content={oTextEn} />
                                          </span>
                                          <span
                                            className="font-urdu text-[1.04em] text-slate-800 leading-[1.75]"
                                            dir="rtl"
                                          >
                                            (<MathRenderer content={oTextUr} />)
                                          </span>
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : section.type === "poetry" ? (
                  /* =============================================================
                     2. POETRY / STANZAS SECTION
                     ============================================================= */
                  <div className="space-y-1.5 py-1 font-urdu" dir="rtl">
                    {section.questions.map((q, qIdx) => {
                      const qLabel = q.customNumber || `(${toRomanLower(qIdx + 1)})`;
                      return (
                        <div
                          key={qIdx}
                          className="space-y-1 break-inside-avoid bg-slate-50/70 p-2 border border-slate-200 rounded group relative"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-[0.95em] font-bold text-slate-800 text-right leading-[1.6]">
                              {`شعر ${qLabel}:`}
                            </div>
                            {!isSecondCopy && (
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                                className="no-print opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {q.poetryLines && q.poetryLines.length > 0 ? (
                            q.poetryLines.map((line, pIdx) => (
                              <div
                                key={pIdx}
                                className="font-urdu text-center text-[1.08em] font-bold text-slate-950 py-0.5 tracking-wide leading-[1.85]"
                              >
                                &ldquo;{line}&rdquo;
                              </div>
                            ))
                          ) : (
                            <div className="font-urdu text-center text-[1.08em] font-bold text-slate-950 py-0.5 leading-[1.85]">
                              <MathRenderer content={q.questionUr || q.questionEn || ""} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* =============================================================
                     3. SUBJECTIVE QUESTIONS (SHORT / LONG / ESSAY / LETTER)
                     ============================================================= */
                  <div
                    className={`divide-y divide-slate-200/80 text-[0.96em] ${
                      paperLayout === "two-column" && !isBilingual
                        ? "grid grid-cols-1 sm:grid-cols-2 gap-x-4 divide-y-0"
                        : ""
                    }`}
                  >
                    {section.questions.map((q, qIdx) => {
                      const qTextEn = (q.questionEn || q.questionUr || "").trim();
                      const qTextUr = (q.questionUr || q.questionEn || "").trim();
                      const qIsPureUrdu =
                        isUrduOnly || (isPureUrduText(qTextUr) && qTextEn === qTextUr);
                      const hasDistinctUrdu = Boolean(qTextUr && qTextUr !== qTextEn);

                      // Respect custom question number or generate standard board label
                      const defaultSubLabelEn =
                        section.questions.length === 1 && section.type === "essay"
                          ? "Q."
                          : isLongSection
                          ? `Q.${qIdx + 3}:`
                          : `(${toRomanLower(qIdx + 1)})`;

                      const defaultSubLabelUr =
                        section.questions.length === 1 && section.type === "essay"
                          ? "سوال:"
                          : isLongSection
                          ? `سوال نمبر ${qIdx + 3}:`
                          : `(${toRomanLower(qIdx + 1)})`;

                      const displayLabelEn = q.customNumber || defaultSubLabelEn;
                      const displayLabelUr = q.customNumber || defaultSubLabelUr;

                      return (
                        <div
                          key={qIdx}
                          className={`py-1.5 first:pt-1 last:pb-0.5 flex items-start justify-between gap-3 break-inside-avoid group ${
                            qIsPureUrdu ? "flex-row-reverse" : ""
                          }`}
                        >
                          {/* English Side */}
                          {!qIsPureUrdu && (isEnglishOnly || isBilingual) && (
                            <div
                              className="flex-1 flex items-start gap-1.5 font-bold text-slate-950 text-left leading-[1.38] font-sans"
                              dir="ltr"
                            >
                              {isEditMode && !isSecondCopy ? (
                                <input
                                  type="text"
                                  value={displayLabelEn}
                                  onChange={(e) =>
                                    handleUpdateQuestionText(sIdx, qIdx, "customNumber", e.target.value)
                                  }
                                  className="w-12 font-extrabold bg-amber-50 border-b border-dashed border-amber-500 text-center no-print shrink-0"
                                  title="Question No."
                                />
                              ) : null}
                              {displayLabelEn && (
                                <span
                                  className={`font-extrabold shrink-0 tabular-nums text-slate-900 ${
                                    isEditMode && !isSecondCopy ? "print-only" : ""
                                  }`}
                                >
                                  {displayLabelEn}
                                </span>
                              )}
                              {isEditMode && !isSecondCopy ? (
                                <>
                                  <textarea
                                    rows={1}
                                    value={qTextEn}
                                    onChange={(e) =>
                                      handleUpdateQuestionText(sIdx, qIdx, "questionEn", e.target.value)
                                    }
                                    className="w-full bg-amber-50/60 border-b border-dashed border-amber-500 focus:outline-none resize-none font-bold no-print"
                                  />
                                  <span className="print-only font-bold flex-1">
                                    <MathRenderer content={qTextEn} />
                                  </span>
                                </>
                              ) : (
                                <span className="flex-1">
                                  <MathRenderer content={qTextEn} />
                                  {isLongSection && q.marks && !hasDistinctUrdu && (
                                    <span className="ml-1.5 text-[0.88em] font-extrabold text-slate-600 tabular-nums">
                                      [{q.marks}]
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Urdu Side */}
                          {(qIsPureUrdu || (isBilingual && hasDistinctUrdu)) && (
                            <div
                              className="flex-1 flex items-start gap-1.5 font-bold text-slate-950 font-urdu text-[1.08em] text-right leading-[1.85]"
                              dir="rtl"
                            >
                              {displayLabelUr && (
                                <span
                                  className={`font-extrabold shrink-0 tabular-nums ${
                                    hasUrduScript(displayLabelUr)
                                      ? "font-urdu text-[0.98em]"
                                      : "font-sans text-[0.9em]"
                                  }`}
                                >
                                  {displayLabelUr}
                                </span>
                              )}
                              {isEditMode && !isSecondCopy ? (
                                <>
                                  <textarea
                                    rows={1}
                                    value={qTextUr}
                                    onChange={(e) =>
                                      handleUpdateQuestionText(sIdx, qIdx, "questionUr", e.target.value)
                                    }
                                    className="w-full bg-amber-50/60 border-b border-dashed border-amber-500 focus:outline-none resize-none font-bold font-urdu text-right no-print"
                                  />
                                  <span className="print-only font-bold font-urdu flex-1">
                                    <MathRenderer content={qTextUr} />
                                  </span>
                                </>
                              ) : (
                                <span className="font-urdu flex-1">
                                  <MathRenderer content={qTextUr} />
                                  {isLongSection && q.marks && (
                                    <span className="mr-1.5 font-sans text-[0.84em] font-extrabold text-slate-700 tabular-nums">
                                      ({q.marks})
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          )}

                          {!isSecondCopy && (
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                              className={`no-print text-rose-500 hover:text-rose-700 text-xs shrink-0 p-0.5 transition-opacity ${
                                isEditMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                              }`}
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* On-Sheet Quick "Add Section" Button (Hidden when printing) */}
          {!isSecondCopy && (
            <div className="no-print pt-3 border-t border-dashed border-slate-300 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => openAddSectionModal("new_section")}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Add Section &amp; Questions</span>
              </button>
              {paperData.sections.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    openAddSectionModal("existing_section", paperData.sections.length - 1)
                  }
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Add Question to Current Section</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen print:min-h-0 print:h-auto bg-slate-100 print:bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-slate-900/95 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold border border-white/15 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =====================================================================
          TOP 3D LIQUID GLASS COMMAND HEADER
          ===================================================================== */}
      <header className="no-print sticky top-0 z-40 bg-gradient-to-b from-white/85 via-white/75 to-white/85 backdrop-blur-2xl saturate-150 border-b border-white/90 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.1),0_4px_0_0_rgba(226,232,240,0.85),inset_0_2px_2px_0_#ffffff] px-3 sm:px-6 py-2.5">
        <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back Navigation + Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/select-questions"
              className="p-2 rounded-xl bg-white/85 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 shadow-2xs transition-all shrink-0"
              title="Back to Question Bank"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <BrandEmblem size="sm" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 truncate">
                  Quick Paper AI Studio
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  AI + OCR + Live Print
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 truncate hidden md:block">
                {paperData.sections.length} Sections &bull; {totalQuestionsCount} Questions &bull;{" "}
                {paperData.totalMarks} Marks ({paperLanguageMode})
              </p>
            </div>
          </div>

          {/* Center: Workspace View Switcher (Split / Editor / Preview) */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-300/70 shadow-inner">
            <button
              onClick={() => setActiveTab("input")}
              className={`px-2.5 sm:px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                activeTab === "input"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              AI &amp; Text
            </button>
            <button
              onClick={() => setActiveTab("split")}
              className={`px-2.5 sm:px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                activeTab === "split"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Split Studio
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-2.5 sm:px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Print Sheet
            </button>
          </div>

          {/* Right: Add Section Modal Button, Templates, Logo, Edit, Word & Print */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => openAddSectionModal("new_section")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-[0_3px_0_0_#312e81] active:translate-y-0.5 transition-all cursor-pointer"
              title="Add a new section with Question No. and Questions"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Section</span>
            </button>

            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-800 text-xs font-bold shadow-2xs cursor-pointer"
              title="Change Board Header & Paper Style"
            >
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden lg:inline">Templates</span>
            </button>

            <input
              type="file"
              ref={logoInputRef}
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 text-slate-800 text-xs font-bold shadow-2xs cursor-pointer"
              title="Upload custom school or academy logo"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden xl:inline">{logoBase64 ? "Change Logo" : "Upload Logo"}</span>
            </button>

            <button
              onClick={() => {
                if (logoBase64) {
                  setLogoBase64(null);
                  showToast("Paper logo removed");
                } else {
                  const crest = generatePaperWalaCrestDataUrl();
                  if (crest) {
                    setLogoBase64(crest);
                    showToast("Official PaperWala Academic Crest applied!");
                  }
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-extrabold shadow-2xs cursor-pointer transition-all ${
                logoBase64
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-amber-50/90 hover:bg-amber-100 text-amber-900 border-amber-300/90"
              }`}
              title={
                logoBase64
                  ? "Click to remove crest/logo from paper"
                  : "Stamp Official PaperWala Board Crest onto Paper & Word (.docx)"
              }
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline">{logoBase64 ? "Clear Crest" : "Official Crest"}</span>
            </button>

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all shadow-2xs cursor-pointer ${
                isEditMode
                  ? "bg-amber-500 text-white border-amber-600"
                  : "bg-white/90 hover:bg-white text-slate-800 border-slate-200/90"
              }`}
              title="Toggle Inline Editing on Paper Sheet"
            >
              {isEditMode ? (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Editing On</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Inline Edit</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadWord}
              disabled={isExportingDocx}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-[0_3px_0_0_#1e3a8a] active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
              title="Download editable Microsoft Word file (.docx)"
            >
              {isExportingDocx ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Word (.docx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="relative overflow-hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-white font-extrabold text-xs border border-emerald-200/80 shadow-[0_3px_0_0_#065f46,0_8px_16px_-3px_rgba(16,185,129,0.45),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          ADD SECTION & QUESTIONS MODAL
          ===================================================================== */}
      {showAddSectionModal && (
        <div
          className="no-print fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setShowAddSectionModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Add Section &amp; Questions to Paper</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter the Question No. and Question text below to add directly onto your examination paper.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSectionModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAddSectionModal} className="space-y-4">
              {/* Target Mode Selector: New Section vs Existing Section */}
              {paperData.sections.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-extrabold">
                  <button
                    type="button"
                    onClick={() => setModalTargetMode("new_section")}
                    className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer ${
                      modalTargetMode === "new_section"
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    + Create New Section
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTargetMode("existing_section")}
                    className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer ${
                      modalTargetMode === "existing_section"
                        ? "bg-white text-emerald-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    + Add to Existing Section ({paperData.sections.length})
                  </button>
                </div>
              )}

              {/* Section Configuration */}
              {modalTargetMode === "new_section" ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Section Type
                      </label>
                      <select
                        value={modalSectionType}
                        onChange={(e) =>
                          handleModalSectionTypeChange(e.target.value as ExamSection["type"])
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="short">Short Questions (مختصر سوالات)</option>
                        <option value="long">Long / Detailed Questions (تفصیلی سوالات)</option>
                        <option value="mcq">Multiple Choice Questions - MCQs (معروضی سوالات)</option>
                        <option value="poetry">Poetry Explanation (اشعار کی تشریح)</option>
                        <option value="essay">Essay / Letter / Application (مضمون / خط)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Section Marks
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={modalSectionMarks}
                        onChange={(e) => setModalSectionMarks(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Section Heading (English)
                      </label>
                      <input
                        type="text"
                        value={modalSectionTitleEn}
                        onChange={(e) => setModalSectionTitleEn(e.target.value)}
                        placeholder="e.g., SECTION-II: SHORT QUESTIONS"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
                        Section Heading (Urdu / اردو)
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={modalSectionTitleUr}
                        onChange={(e) => setModalSectionTitleUr(e.target.value)}
                        placeholder="مثال: حصہ دوم: مختصر سوالات"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold font-urdu text-slate-900 text-right outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-emerald-900">
                    Select Section to Add Questions Into
                  </label>
                  <select
                    value={modalTargetSectionIdx}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setModalTargetSectionIdx(idx);
                      const sec = paperData.sections[idx];
                      if (sec) {
                        setModalSectionType(sec.type);
                        setModalQuestions((prev) =>
                          prev.map((q, qRowIdx) => ({
                            ...q,
                            questionNo: getDefaultQuestionNo(
                              sec.type,
                              sec.questions.length + qRowIdx,
                              paperData.sections.length
                            ),
                            marks: sec.type === "mcq" ? 1 : sec.type === "long" ? 5 : 2,
                          }))
                        );
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {paperData.sections.map((sec, idx) => (
                      <option key={sec.id || idx} value={idx}>
                        Section {idx + 1}: {sec.titleEn || sec.titleUr} ({sec.questions.length} Qs)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Questions List: Question No. + Question Text (+ Options if MCQ) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Questions to Add ({modalQuestions.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddModalQuestionRow}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Question</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {modalQuestions.map((qDraft, qIdx) => {
                    const isMcqDraft =
                      (modalTargetMode === "existing_section" &&
                        paperData.sections[modalTargetSectionIdx]?.type === "mcq") ||
                      (modalTargetMode === "new_section" && modalSectionType === "mcq");

                    const primaryHasUrdu = hasUrduScript(qDraft.questionTextEn);

                    return (
                      <div
                        key={qIdx}
                        className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-2.5 relative"
                      >
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5">
                          {/* Question No. Input */}
                          <div className="w-full sm:w-28 shrink-0">
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                              Question No.
                            </label>
                            <input
                              type="text"
                              value={qDraft.questionNo}
                              onChange={(e) =>
                                handleUpdateModalQuestionRow(qIdx, "questionNo", e.target.value)
                              }
                              placeholder="e.g. 1, (i), Q.3"
                              className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-indigo-900 text-center outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Question Text (English or Urdu or Bilingual) */}
                          <div className="flex-1 min-w-0">
                            <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                              Question (English, Urdu, or &ldquo;English | اردو&rdquo;)
                            </label>
                            <textarea
                              rows={2}
                              dir={primaryHasUrdu ? "rtl" : "ltr"}
                              value={qDraft.questionTextEn}
                              onChange={(e) =>
                                handleUpdateModalQuestionRow(qIdx, "questionTextEn", e.target.value)
                              }
                              placeholder="Write your question here (e.g., Define an Algorithm. | الگورتھم کی تعریف کریں۔)"
                              className={`w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 resize-y ${
                                primaryHasUrdu ? "font-urdu text-right leading-[1.75]" : ""
                              }`}
                              required={qIdx === 0}
                            />
                          </div>

                          {/* Marks Input & Delete Row */}
                          <div className="w-full sm:w-20 shrink-0 flex sm:block items-center justify-between gap-2">
                            <div className="flex-1">
                              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                                Marks
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={qDraft.marks}
                                onChange={(e) =>
                                  handleUpdateModalQuestionRow(qIdx, "marks", Number(e.target.value))
                                }
                                className="w-full px-2 py-2 rounded-xl bg-white border border-slate-300 text-xs font-black text-center text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                              />
                            </div>
                            {modalQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveModalQuestionRow(qIdx)}
                                className="mt-4 sm:mt-1.5 text-rose-500 hover:text-rose-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                title="Remove Question Row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="sm:hidden">Remove</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Optional Separate Urdu Translation Line */}
                        <div>
                          <input
                            type="text"
                            dir="rtl"
                            value={qDraft.questionTextUr}
                            onChange={(e) =>
                              handleUpdateModalQuestionRow(qIdx, "questionTextUr", e.target.value)
                            }
                            placeholder="اختیاری اردو ترجمہ یہاں لکھیں (Optional Urdu question text for Bilingual paper)"
                            className="w-full px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200 text-xs font-urdu text-right text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        {/* MCQ Options (Shown when Section Type is MCQ) */}
                        {isMcqDraft && (
                          <div className="pt-1 border-t border-slate-200/80">
                            <span className="block text-[10px] font-extrabold uppercase text-emerald-800 mb-1.5">
                              MCQ Options — Supports English, Urdu (الف، ب، ج، د), or &ldquo;English (اردو)&rdquo;
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(
                                [
                                  { field: "optionA", label: "(A) / (الف)" },
                                  { field: "optionB", label: "(B) / (ب)" },
                                  { field: "optionC", label: "(C) / (ج)" },
                                  { field: "optionD", label: "(D) / (د)" },
                                ] as const
                              ).map((optMeta) => {
                                const val = qDraft[optMeta.field];
                                const optUrdu = isPureUrduText(val);
                                return (
                                  <div key={optMeta.field} className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-extrabold text-slate-600 w-16 shrink-0">
                                      {optMeta.label}
                                    </span>
                                    <input
                                      type="text"
                                      dir={optUrdu ? "rtl" : "ltr"}
                                      value={val}
                                      onChange={(e) =>
                                        handleUpdateModalQuestionRow(qIdx, optMeta.field, e.target.value)
                                      }
                                      placeholder={`Option ${optMeta.label}`}
                                      className={`flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 ${
                                        optUrdu ? "font-urdu text-right" : ""
                                      }`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Add to Paper</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          TEMPLATE SELECTION MODAL
          ===================================================================== */}
      {showTemplateModal && (
        <div
          className="no-print fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTemplateModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  Select Examination Paper Template
                </h3>
                <p className="text-xs text-slate-500">
                  Switch between official Punjab Board, Urdu BISE, Federal Board (FBISE), and Compact Class Test headers.
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    activeTemplate.id === tpl.id
                      ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/30"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-xs text-slate-900">{tpl.name}</span>
                    {activeTemplate.id === tpl.id && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-bold truncate">{tpl.institutionName}</p>
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                    <span>{tpl.totalMarks} Marks</span>
                    <span>&bull;</span>
                    <span>Code: {tpl.paperCode}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
              <span>All headers, questions, and marks remain 100% editable on the sheet.</span>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MAIN WORKSPACE (Print-Safe Flex/Grid Container)
          ===================================================================== */}
      <main className="flex-1 flex flex-col lg:flex-row print:block max-w-[1800px] w-full mx-auto">
        {/* ===================================================================
            LEFT PANEL: AI TOPIC GENERATOR, OCR, TRANSLATE & RAW TEXT EDITOR
            =================================================================== */}
        {(activeTab === "input" || activeTab === "split") && (
          <div
            className={`no-print flex flex-col bg-white/80 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-slate-200/90 ${
              activeTab === "split"
                ? "w-full lg:w-[44%] xl:w-[42%] shrink-0"
                : "w-full max-w-4xl mx-auto my-4 rounded-3xl border shadow-lg"
            }`}
          >
            {/* 1. AI Topic / Chapter Exam Generator Card */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-cyan-50/40 border-b border-emerald-200/70">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-emerald-600" />
                  AI Instant Topic Paper Generator
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                  Gemini AI
                </span>
              </div>

              <form onSubmit={handleAiGenerateTopic} className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={topicPrompt}
                    onChange={(e) => setTopicPrompt(e.target.value)}
                    placeholder="e.g., 10th Computer Ch 2 User Interaction, or 9th Physics Kinematics..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-emerald-200/90 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={isGeneratingTopic}
                    className="px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-[0_3px_0_0_#065f46] active:translate-y-0.5 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isGeneratingTopic ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Paper</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Question Count Controls & Quick Topic Chips */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2 font-bold text-slate-700">
                    <label className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-lg border border-emerald-200/80">
                      <span className="text-slate-500">MCQs:</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={aiMcqCount}
                        onChange={(e) => setAiMcqCount(Number(e.target.value))}
                        className="w-8 text-center font-black text-emerald-700 bg-transparent outline-none tabular-nums"
                      />
                    </label>
                    <label className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-lg border border-emerald-200/80">
                      <span className="text-slate-500">Shorts:</span>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={aiShortCount}
                        onChange={(e) => setAiShortCount(Number(e.target.value))}
                        className="w-8 text-center font-black text-emerald-700 bg-transparent outline-none tabular-nums"
                      />
                    </label>
                    <label className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-lg border border-emerald-200/80">
                      <span className="text-slate-500">Longs:</span>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        value={aiLongCount}
                        onChange={(e) => setAiLongCount(Number(e.target.value))}
                        className="w-8 text-center font-black text-emerald-700 bg-transparent outline-none tabular-nums"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-slate-500 font-bold">Samples:</span>
                    {(["Bilingual", "Urdu", "English"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleLoadSample(mode)}
                        className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                          paperLanguageMode === mode
                            ? "bg-emerald-700 text-white"
                            : "bg-white text-slate-600 hover:bg-emerald-100 border border-slate-200"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* 2. AI Action Bar: OCR Scan, Translate, Standardize */}
            <div className="px-3.5 py-2.5 border-b border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                Raw Paper Editor
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingOcr}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                  title="Extract questions from an exam photo using Gemini Vision OCR"
                >
                  {isProcessingOcr ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{isProcessingOcr ? "Scanning..." : "OCR Image"}</span>
                </button>

                {/* Translate Pill Group */}
                <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                  <span className="px-2 py-1 text-[10px] font-bold text-slate-400 border-r border-slate-200 flex items-center gap-1">
                    <Languages className="w-3 h-3 text-indigo-600" />
                    <span className="hidden sm:inline">Translate:</span>
                  </span>
                  {(["Urdu", "English", "Bilingual"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleTranslate(lang)}
                      disabled={isTranslating}
                      className={`px-2 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                        paperLanguageMode === lang
                          ? "bg-indigo-600 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAiRefine}
                  disabled={isAiStructuring}
                  className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg text-xs font-extrabold text-white shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                  title="Clean up messy text, fix numbering, and standardize sections with AI"
                >
                  {isAiStructuring ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>AI Format</span>
                </button>
              </div>
            </div>

            {/* Status / Error Banner */}
            {statusMessage && (
              <div
                className={`px-4 py-2 text-xs font-bold flex items-center justify-between gap-2 border-b ${
                  statusMessage.type === "error"
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : statusMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : "bg-blue-50 text-blue-900 border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{statusMessage.text}</span>
                </div>
                <button
                  onClick={() => setStatusMessage(null)}
                  className="text-slate-500 hover:text-slate-900 font-bold px-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Live Raw Paper Textarea */}
            <div className="flex-1 p-3.5 sm:p-4 flex flex-col gap-2.5 min-h-[360px]">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-2.5 py-2">
                  <div className="text-[10px] font-black uppercase tracking-wide text-blue-700">MCQs</div>
                  <div className="mt-0.5 text-lg font-black text-blue-950 tabular-nums">
                    {questionSummary.mcq || 0}
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-2.5 py-2">
                  <div className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Short</div>
                  <div className="mt-0.5 text-lg font-black text-emerald-950 tabular-nums">
                    {questionSummary.short || 0}
                  </div>
                </div>
                <div className="rounded-xl border border-violet-100 bg-violet-50 px-2.5 py-2">
                  <div className="text-[10px] font-black uppercase tracking-wide text-violet-700">Long</div>
                  <div className="mt-0.5 text-lg font-black text-violet-950 tabular-nums">
                    {questionSummary.long || 0}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-2.5 py-2">
                  <div className="text-[10px] font-black uppercase tracking-wide text-amber-700">Marks</div>
                  <div className="mt-0.5 text-lg font-black text-amber-950 tabular-nums">
                    {paperData.totalMarks || 0}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px]">
                <span className="font-semibold text-slate-600">
                  <strong className="text-slate-900">Quick flow:</strong> paste, generate, or click{" "}
                  <strong>Add Section</strong> &rarr; review live paper &rarr; export Word or print PDF.
                </span>
                <button
                  onClick={restoreDraft}
                  className="inline-flex items-center gap-1 font-black text-indigo-700 hover:text-indigo-900 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Restore draft
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => {
                  const val = e.target.value;
                  setRawText(val);
                  const p = parseRawTextToExam(val);
                  setPaperData((prev) => ({
                    ...p,
                    institutionName: prev.institutionName || p.institutionName,
                    subject: prev.subject || p.subject,
                    totalMarks: p.totalMarks || prev.totalMarks,
                  }));
                }}
                placeholder="Paste or type your exam questions here (English, Urdu, or Bilingual with 'English | اردو'). Everything converts live onto the A4 examination sheet..."
                className="w-full flex-1 min-h-[300px] bg-white border border-slate-300/90 rounded-2xl p-3.5 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500">
                <span className="tabular-nums">
                  {rawText.length} chars &bull; {totalQuestionsCount} questions parsed
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleInstantParse}
                    className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Sync to Sheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAddSectionModal("new_section")}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Section</span>
                  </button>
                  <button
                    onClick={() => {
                      setRawText("");
                      setPaperData((prev) => ({ ...prev, sections: [] }));
                    }}
                    className="text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            RIGHT PANEL: LIVE PRINTABLE A4 EXAMINATION SHEET STUDIO
            =================================================================== */}
        {(activeTab === "preview" || activeTab === "split") && (
          <div className="flex-1 min-w-0 bg-slate-200/60 print:bg-white p-3 sm:p-6 print:p-0 flex flex-col items-center">
            {/* Studio Sheet Formatting Ribbon */}
            <div className="no-print w-full max-w-[210mm] bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 mb-4 flex flex-wrap items-center justify-between gap-2.5 shadow-sm text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-slate-500">Language:</span>
                  <select
                    value={paperLanguageMode}
                    onChange={(e) => {
                      const nextMode = e.target.value as "Bilingual" | "Urdu" | "English";
                      setPaperLanguageMode(nextMode);
                      setInstructionNote(
                        nextMode === "Urdu"
                          ? activeTemplate.instructionNoteUr
                          : activeTemplate.instructionNoteEn
                      );
                    }}
                    className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-extrabold cursor-pointer outline-none"
                  >
                    <option value="Bilingual">Bilingual (EN + UR)</option>
                    <option value="Urdu">Urdu Only (اردو RTL)</option>
                    <option value="English">English Only (LTR)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                  <span className="font-bold text-slate-500">Board Style:</span>
                  <select
                    value={activeTemplate.headerStyle}
                    onChange={(e) => {
                      const hStyle = e.target.value as PaperTemplate["headerStyle"];
                      setActiveTemplate({ ...activeTemplate, headerStyle: hStyle });
                    }}
                    className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 font-bold cursor-pointer outline-none"
                  >
                    <option value="punjab-board-style1">Punjab Board (BISE)</option>
                    <option value="fbise-style2">Federal Board (FBISE)</option>
                    <option value="minimal">Compact Minimal</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                  <span className="font-bold text-slate-500">Font:</span>
                  <button
                    onClick={() => setFontSize(Math.max(9, fontSize - 1))}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-black text-slate-800 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-slate-900 w-5 text-center tabular-nums">
                    {fontSize}
                  </span>
                  <button
                    onClick={() => setFontSize(Math.min(18, fontSize + 1))}
                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-black text-slate-800 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => openAddSectionModal("new_section")}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Section</span>
                </button>

                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-300">
                  <button
                    onClick={() => setPrintDensity("1_per_page")}
                    className={`px-2 py-1 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                      printDensity === "1_per_page"
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    1 / Page
                  </button>
                  <button
                    onClick={() => setPrintDensity("2_per_page")}
                    className={`px-2 py-1 rounded-md text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                      printDensity === "2_per_page"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Columns className="w-3 h-3" />
                    <span>2 / Page</span>
                  </button>
                </div>

                <label
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg border cursor-pointer transition-colors ${
                    fitToOnePage
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                  title="Automatically scale font & spacing so the entire exam fits on 1 single page"
                >
                  <input
                    type="checkbox"
                    checked={fitToOnePage}
                    onChange={(e) => setFitToOnePage(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  <span>Fit 1 Page</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStudentInfo}
                    onChange={(e) => setIncludeStudentInfo(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  <span>Student Info</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNote}
                    onChange={(e) => setIncludeNote(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  <span>Note</span>
                </label>

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBorder}
                    onChange={(e) => setShowBorder(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  <span>Border</span>
                </label>
              </div>
            </div>

            {/* Dynamic Print CSS for 1-Up Portrait vs 2-Up Landscape with 1-Page Auto-Fit */}
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @media print {
                    @page {
                      size: ${printDensity === "2_per_page" ? "A4 landscape" : "A4 portrait"} !important;
                      margin: ${printDensity === "2_per_page" ? "3.5mm 4.5mm" : "4.5mm 6mm"} !important;
                    }
                    html, body, .min-h-screen {
                      background: #ffffff !important;
                      overflow: visible !important;
                      height: auto !important;
                      min-height: 0 !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    #printable-paper {
                      zoom: ${fitToOnePage ? printScale : 1} !important;
                      page-break-inside: ${fitToOnePage ? "avoid" : "auto"} !important;
                      break-inside: ${fitToOnePage ? "avoid" : "auto"} !important;
                      page-break-after: avoid !important;
                      break-after: avoid !important;
                    }
                  }
                `,
              }}
            />

            {/* Responsive Horizontal Viewport Wrapper so A4 Sheet Never Crushes on Narrow Screens */}
            {printDensity === "2_per_page" ? (
              <div className="w-full overflow-x-auto pb-6 print:overflow-visible print:pb-0">
                <div className="min-w-[1060px] print:min-w-0 max-w-[297mm] mx-auto">
                  <div className="no-print mb-3 py-2 px-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between shadow-2xs">
                    <span className="flex items-center gap-1.5">
                      <Columns className="w-4 h-4 text-emerald-600" />
                      <span>
                        2 Papers on 1 Page Mode: Both copies print side-by-side on one Landscape A4 sheet.
                      </span>
                    </span>
                    <span className="text-[11px] bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded font-black">
                      {fitToOnePage && printScale < 1
                        ? `Auto-Fitted (${Math.round(printScale * 100)}%) • 1 Page`
                        : "A4 Landscape (2-Up • 1 Page)"}
                    </span>
                  </div>

                  <div
                    id="printable-paper"
                    className="duplex-print-container grid grid-cols-2 gap-3 items-start w-full relative"
                  >
                    <div className="duplex-print-column relative border-r-2 border-dashed border-slate-400 pr-2">
                      <div className="no-print absolute -top-3 right-0 translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 z-10 shadow">
                        <Scissors className="w-3 h-3 text-amber-400" />
                        <span>Cut Line</span>
                      </div>
                      {renderPaperContent(1)}
                    </div>
                    <div className="duplex-print-column pl-2">{renderPaperContent(2)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full pb-6 print:overflow-visible print:pb-0 flex justify-center">
                <div
                  id="printable-paper"
                  className="w-full min-w-0 max-w-[210mm] print:w-full print:max-w-full print:min-w-0"
                >
                  {renderPaperContent(1)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Convert numbers to lower roman numerals for sub-questions (i), (ii), (iii)
function toRomanLower(num: number): string {
  const lookup: [number, string][] = [
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];
  let roman = "";
  for (const [val, str] of lookup) {
    while (num >= val) {
      roman += str;
      num -= val;
    }
  }
  return roman || "i";
}

function getUrduSectionOrdinal(num: number): string {
  const map: Record<number, string> = {
    1: "اول",
    2: "دوم",
    3: "سوم",
    4: "چہارم",
    5: "پنجم",
    6: "ششم",
  };
  return map[num] || String(num);
}
