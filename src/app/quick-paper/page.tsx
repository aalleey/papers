"use client";

import React, { useState, useRef } from "react";
import {
  FileText,
  Printer,
  Sparkles,
  Camera,
  Languages,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Check,
  Settings,
  HelpCircle,
  Eye,
  Edit3,
  Download,
  UploadCloud,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layout,
  Maximize2,
  Type,
  FileSpreadsheet,
  Bookmark,
  Sliders,
  AlignRight,
  Save,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { parseRawTextToExam, ExamPaperData, ExamSection, ExamQuestion } from "@/lib/quick-paper-parser";
import { MathRenderer } from "@/components/MathRenderer";
import { exportPaperToDocx } from "@/lib/docx-export";

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
  headerStyle: "punjab-board-style1" | "classic" | "minimal";
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

const DEFAULT_TEMPLATES: PaperTemplate[] = [
  {
    id: "seek-academy-style1",
    name: "Style 1: Punjab Boards / Seek Academy (User Choice)",
    institutionName: "SEEKACADEMY",
    paperTypeBanner: "EXAMINATION 2026-27",
    title: "مطالعہ پاکستان / PAKISTAN STUDIES",
    subject: "مطالعہ پاکستان",
    grade: "10th",
    syllabus: "Chapter 1-3 Complete",
    timeAllowed: "40 Mins",
    totalMarks: 25,
    testNo: "15",
    headerStyle: "punjab-board-style1",
    layout: "standard",
    fontFamily: "sans",
    fontSize: 12,
    showBorder: true,
    borderStyle: "none",
    showRollNo: true,
    showWatermark: false,
    watermarkText: "SEEKACADEMY",
    paperCode: "3044",
    instructionNoteEn:
      "Four possible answer a,b,c and d to each question are given. The choice which you think is correct, fill that circle in front of that questions with Marker or Pen ink, Cutting or filling two or more circles will result in zero mark in that question.",
    instructionNoteUr:
      "ہر سوال کے چار ممکنہ جوابات a, b, c اور d دیے گئے ہیں۔ جس جواب کو آپ درست سمجھتے ہیں، مارکر یا پین کی سیاہی سے اس کا دائرہ پُر کریں۔",
  },
  {
    id: "punjab-board-official",
    name: "BISE Punjab Board Standard",
    institutionName: "گورنمنٹ ہائر سیکنڈری سکول / کالج",
    paperTypeBanner: "ANNUAL EXAMINATION 2026",
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
    fontSize: 12,
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
    id: "minimal-clean",
    name: "Clean & Compact (Eco Print)",
    institutionName: "SCHOOL EXAMINATION DEPARTMENT",
    paperTypeBanner: "CLASS TEST",
    title: "CLASS ASSESSMENT",
    subject: "General Subject",
    grade: "10th",
    syllabus: "Unit Assessment",
    timeAllowed: "45 Minutes",
    totalMarks: 25,
    testNo: "03",
    headerStyle: "minimal",
    layout: "two-column",
    fontFamily: "sans",
    fontSize: 11,
    showBorder: false,
    borderStyle: "none",
    showRollNo: true,
    showWatermark: false,
    watermarkText: "",
    paperCode: "1001",
    instructionNoteEn: "Attempt all questions within the given time.",
    instructionNoteUr: "تمام سوالات لازمی ہیں۔",
  },
];

export default function QuickPaperPage() {
  // Input State
  const [rawText, setRawText] = useState("");
  const [targetLang, setTargetLang] = useState<"Urdu" | "Bilingual" | "English">("Urdu");
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Status flags
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAiStructuring, setIsAiStructuring] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");

  // View state
  const [activeTab, setActiveTab] = useState<"input" | "preview" | "split">("split");
  const [isEditMode, setIsEditMode] = useState<boolean>(false); // Starts in clean pristine print preview mode

  // Active Template State (defaults to SeekAcademy Style 1)
  const [templates, setTemplates] = useState<PaperTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<PaperTemplate>(DEFAULT_TEMPLATES[0]);

  // Paper Display / Customization settings
  const [paperLanguageMode, setPaperLanguageMode] = useState<"Urdu" | "English" | "Bilingual">("Urdu");
  const [paperLayout, setPaperLayout] = useState<"standard" | "two-column">(activeTemplate.layout);
  const [fontSize, setFontSize] = useState<number>(activeTemplate.fontSize);
  const [showWatermark, setShowWatermark] = useState(activeTemplate.showWatermark);
  const [watermarkText, setWatermarkText] = useState(activeTemplate.watermarkText);
  const [showBorder, setShowBorder] = useState(activeTemplate.showBorder);
  const [borderStyle, setBorderStyle] = useState<"double" | "single" | "none">(activeTemplate.borderStyle);
  const [includeStudentInfo, setIncludeStudentInfo] = useState(activeTemplate.showRollNo);
  const [paperCode, setPaperCode] = useState(activeTemplate.paperCode);
  const [syllabusText, setSyllabusText] = useState(activeTemplate.syllabus);
  const [testNoText, setTestNoText] = useState(activeTemplate.testNo);
  const [paperTypeBanner, setPaperTypeBanner] = useState(activeTemplate.paperTypeBanner);
  const [instructionNote, setInstructionNote] = useState(activeTemplate.instructionNoteEn);
  const [includeNote, setIncludeNote] = useState(true);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Structured Paper Data (100% Editable)
  const [paperData, setPaperData] = useState<ExamPaperData>(() =>
    parseRawTextToExam(`سوال نمبر 1۔ درست جواب کے گرد کا نشان لگائیں
*وہ جا رہا ہے - اس میں امدادی فعل کون سا ہے؟ -i-
(الف) وہ (ب) جا (ج) رہا ہے (د) ہے

*درج ذیل میں سے امدادی فعل کی مثال ہے -ii-
(الف) کتاب (ب) لڑکا (ج) سوتا (د) کھاتا ہے

*امدادی فعل ہمیشہ آتا ہے -iii-
(الف) ہمیشہ (ب) جملے کے آخر میں (ج) اصل فعل کے بعد (د) اصل فعل سے پہلے

*وہ اچانک ہنس پڑا - اس میں امدادی فعل ہے -iv-
(الف) پڑا (ب) وہ (ج) ہنس (د) اچانک

*نعت میں توصیف کی جاتی ہے -v-
(الف) اولیاء کی (ب) صحابہ کی (ج) حضرت محمد ﷺ کی (د) اللہ کی

سوال - درج ذیل اشعار کی تشریح کریں - (5)
(i) کعبے کی رونق کعبے کا منظر اللہ اکبر اللہ اکبر
دیکھوں تو دیکھوں جاؤں برابر اللہ اکبر اللہ اکبر
(ii) دلوں کے سا تو جبیں جو ختم نہیں کرتے
وہ پایِ مدحت خیرالامم نہیں کرتے

سوال - سیرت النبی صلی اللہ علیہ وآلہ وسلم کے عنوان پر ایک تفصیلی مضمون تحریر کریں - (10)

سوال - دوست کے نام خط امتحان میں کامیابی کا ذکر کرنا (5)`)
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Apply a template to the current paper
  const handleApplyTemplate = (tpl: PaperTemplate) => {
    setActiveTemplate(tpl);
    setPaperLayout(tpl.layout);
    setFontSize(tpl.fontSize);
    setShowBorder(tpl.showBorder);
    setBorderStyle(tpl.borderStyle);
    setIncludeStudentInfo(tpl.showRollNo);
    setShowWatermark(tpl.showWatermark);
    setWatermarkText(tpl.watermarkText);
    setPaperCode(tpl.paperCode);
    setSyllabusText(tpl.syllabus);
    setTestNoText(tpl.testNo);
    setPaperTypeBanner(tpl.paperTypeBanner);
    setInstructionNote(tpl.instructionNoteEn);

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
  };

  // Convert pasted raw text into printable exam instantly
  const handleInstantParse = () => {
    if (!rawText.trim()) return;
    const parsed = parseRawTextToExam(rawText);
    setPaperData((prev) => ({
      ...parsed,
      institutionName: activeTemplate.institutionName || parsed.institutionName,
      title: activeTemplate.title || parsed.title,
    }));
  };

  // AI Structured Parsing with Gemini
  const handleAiRefine = async () => {
    if (!rawText.trim()) {
      alert("Please paste text or write your questions first.");
      return;
    }
    setIsAiStructuring(true);
    try {
      const res = await fetch("/api/quick-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "format_exam",
          text: rawText,
          apiKey,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

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
      setActiveTab("preview");
    } catch (err: any) {
      alert("AI structuring error: " + err.message + "\nUsing instant smart parser instead.");
      handleInstantParse();
    } finally {
      setIsAiStructuring(false);
    }
  };

  // OCR using Browser Tesseract or Gemini API fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingOcr(true);
    setOcrStatus("Processing document...");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setOcrStatus("Running Gemini Vision OCR with high precision...");
      try {
        const res = await fetch("/api/quick-paper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ocr",
            imageBase64: base64Data,
            mimeType: file.type || "image/jpeg",
            apiKey,
          }),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setRawText((prev) => (prev ? prev + "\n\n" + json.result : json.result));
        const parsed = parseRawTextToExam(json.result);
        setPaperData(parsed);
        setOcrStatus("OCR completed successfully!");
        setIsProcessingOcr(false);
        return;
      } catch (err: any) {
        console.warn("Gemini OCR fallback to browser Tesseract:", err.message);
      }

      try {
        setOcrStatus("Running local OCR engine (Tesseract)...");
        const Tesseract = await import("tesseract.js");
        const { data } = await Tesseract.recognize(base64Data, "eng+urd", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setOcrStatus(`Extracting text: ${Math.round((m.progress || 0) * 100)}%`);
            }
          },
        });
        const extracted = data.text.trim();
        setRawText((prev) => (prev ? prev + "\n\n" + extracted : extracted));
        const parsed = parseRawTextToExam(extracted);
        setPaperData(parsed);
        setOcrStatus("OCR completed!");
      } catch (err: any) {
        alert("OCR failed: " + err.message);
      } finally {
        setIsProcessingOcr(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Translation with Gemini
  const handleTranslate = async (lang: "Urdu" | "Bilingual" | "English") => {
    if (!rawText.trim()) {
      alert("Please paste some paper text first to translate.");
      return;
    }
    setIsTranslating(true);
    setTargetLang(lang);
    try {
      const res = await fetch("/api/quick-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "translate",
          text: rawText,
          targetLang: lang,
          apiKey,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setRawText(json.result);
      const parsed = parseRawTextToExam(json.result);
      setPaperData(parsed);
    } catch (err: any) {
      alert("Translation error: " + err.message);
    } finally {
      setIsTranslating(false);
    }
  };

  // Editable question handlers
  const handleUpdateSectionTitle = (sIdx: number, val: string) => {
    const updated = [...paperData.sections];
    updated[sIdx].titleUr = val;
    setPaperData({ ...paperData, sections: updated });
  };

  const handleUpdateSectionMarks = (sIdx: number, val: number) => {
    const updated = [...paperData.sections];
    updated[sIdx].marks = val;
    setPaperData({ ...paperData, sections: updated });
  };

  const handleUpdateQuestionText = (sIdx: number, qIdx: number, val: string) => {
    const updated = [...paperData.sections];
    updated[sIdx].questions[qIdx].questionUr = val;
    setPaperData({ ...paperData, sections: updated });
  };

  const handleUpdateQuestionMarks = (sIdx: number, qIdx: number, val: number) => {
    const updated = [...paperData.sections];
    updated[sIdx].questions[qIdx].marks = val;
    setPaperData({ ...paperData, sections: updated });
  };

  const handleUpdateOption = (
    sIdx: number,
    qIdx: number,
    oIdx: number,
    field: "key" | "textUr",
    val: string
  ) => {
    const updated = [...paperData.sections];
    const opts = updated[sIdx].questions[qIdx].options;
    if (opts && opts[oIdx]) {
      opts[oIdx][field] = val;
      setPaperData({ ...paperData, sections: updated });
    }
  };

  const handleAddQuestion = (sIdx: number) => {
    const updated = [...paperData.sections];
    const sec = updated[sIdx];
    const newNum = sec.questions.length + 1;
    sec.questions.push({
      number: newNum,
      questionUr: "نیا سوال درج کریں",
      marks: sec.type === "mcq" ? 1 : 5,
      options:
        sec.type === "mcq"
          ? [
              { key: "الف", textUr: "اختیار 1" },
              { key: "ب", textUr: "اختیار 2" },
              { key: "ج", textUr: "اختیار 3" },
              { key: "د", textUr: "اختیار 4" },
            ]
          : undefined,
    });
    setPaperData({ ...paperData, sections: updated });
  };

  const handleDeleteQuestion = (sIdx: number, qIdx: number) => {
    const updated = [...paperData.sections];
    updated[sIdx].questions.splice(qIdx, 1);
    setPaperData({ ...paperData, sections: updated });
  };

  const handleAddSection = () => {
    const newSection: ExamSection = {
      id: `sec-${paperData.sections.length + 1}`,
      type: "short",
      titleUr: "Section-II / حصہ دوم: مختصر سوالات",
      marks: 10,
      questions: [
        {
          number: 1,
          questionUr: "مختصر سوال کا متن یہاں لکھیں",
          marks: 2,
        },
      ],
    };
    setPaperData({ ...paperData, sections: [...paperData.sections, newSection] });
  };

  const handleDeleteSection = (sIdx: number) => {
    const updated = [...paperData.sections];
    updated.splice(sIdx, 1);
    setPaperData({ ...paperData, sections: updated });
  };

  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const handleDownloadWord = async () => {
    try {
      setIsExportingDocx(true);
      const blob = await exportPaperToDocx({
        paperData,
        languageMode: paperLanguageMode,
        syllabus: syllabusText,
        testNo: testNoText,
        paperCode,
        note: includeNote ? instructionNote : "",
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
    } catch (err) {
      console.error("Word export failed:", err);
      alert("Failed to export Word document. Please try again.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Format 4-digit paper code into array
  const formattedCodeDigits = (paperCode || "3044").padEnd(4, "0").slice(0, 4).split("");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="no-print bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black text-xl">
            PF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">PaperForge</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Quick Paper Converter
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Style 1: Punjab Boards &middot; Full Inline Editing &middot; OCR &middot; Urdu Translation
            </p>
          </div>
        </div>

        {/* View toggles & Quick actions */}
        <div className="flex items-center gap-2">
          {/* Template Selector Button */}
          <button
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-xs transition-all shadow-sm"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Template: {activeTemplate.name.split(":")[0]}</span>
          </button>

          {/* Logo upload trigger */}
          <input
            type="file"
            ref={logoInputRef}
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <button
            onClick={() => logoInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold"
            title="Upload institution or academy logo"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>{logoBase64 ? "Change Logo" : "Upload Logo"}</span>
          </button>

          {/* Clean View vs Edit Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm ${
              isEditMode
                ? "bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/30"
                : "bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700 hover:border-emerald-500/50"
            }`}
            title={isEditMode ? "Switch to Clean Print Preview" : "Enable Inline Text Editing"}
          >
            {isEditMode ? (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editing Active (Click for Clean View)</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Clean View (Click to Edit)</span>
              </>
            )}
          </button>

          {/* View Mode Buttons */}
          <div className="bg-slate-800/80 p-1 rounded-lg flex items-center border border-slate-700/60">
            <button
              onClick={() => setActiveTab("input")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "input" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              Text & OCR
            </button>
            <button
              onClick={() => setActiveTab("split")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "split" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "preview" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              Paper Preview
            </button>
          </div>

          {/* Download Word (.docx) Button */}
          <button
            onClick={handleDownloadWord}
            disabled={isExportingDocx}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
            title="Download editable Microsoft Word file (.docx)"
          >
            {isExportingDocx ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-blue-200" />
                <span>Word (.docx)</span>
              </>
            )}
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </header>

      {/* TEMPLATE SETTINGS MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-400" />
                  Select Paper Template
                </h3>
                <p className="text-xs text-slate-400">
                  Choose a template design for your examination paper.
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            {/* Template Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    activeTemplate.id === tpl.id
                      ? "bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-200">{tpl.name}</span>
                    {activeTemplate.id === tpl.id && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{tpl.institutionName}</p>
                  <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-500 uppercase font-semibold">
                    <span>{tpl.headerStyle}</span>
                    <span>&bull;</span>
                    <span>{tpl.totalMarks} Marks</span>
                    <span>&bull;</span>
                    <span>Code: {tpl.paperCode}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>All elements remain 100% editable on the preview sheet.</span>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* LEFT PANEL: Paste Text, OCR, Translate, Format */}
        {(activeTab === "input" || activeTab === "split") && (
          <div
            className={`no-print flex-1 border-r border-slate-800 flex flex-col bg-slate-900/50 overflow-y-auto ${
              activeTab === "split" ? "max-w-full md:max-w-[48%] lg:max-w-[45%]" : "w-full"
            }`}
          >
            {/* Action Bar */}
            <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Raw Paper Text
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingOcr}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Extract text from image using Gemini Vision OCR"
                >
                  {isProcessingOcr ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{isProcessingOcr ? "Scanning..." : "OCR Scan"}</span>
                </button>

                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleTranslate("Urdu")}
                    disabled={isTranslating}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 flex items-center gap-1 border-r border-slate-700"
                    title="Translate questions into Urdu"
                  >
                    <Languages className="w-3.5 h-3.5 text-blue-400" />
                    <span>Urdu</span>
                  </button>
                  <button
                    onClick={() => handleTranslate("Bilingual")}
                    disabled={isTranslating}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                    title="Format with English + Urdu translations"
                  >
                    <span>Bilingual</span>
                  </button>
                </div>

                <button
                  onClick={handleAiRefine}
                  disabled={isAiStructuring}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-xs font-bold text-white shadow-md shadow-emerald-900/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isAiStructuring ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>AI Standardize</span>
                </button>
              </div>
            </div>

            {/* Status notification */}
            {ocrStatus && (
              <div className="bg-emerald-950/40 border-b border-emerald-900/50 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between">
                <span>{ocrStatus}</span>
                <button
                  onClick={() => setOcrStatus("")}
                  className="text-emerald-500 hover:text-white"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Textarea for pasting */}
            <div className="flex-1 p-4 flex flex-col gap-2">
              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  const p = parseRawTextToExam(e.target.value);
                  setPaperData(p);
                }}
                placeholder="Paste your exam text here... (All Urdu and English questions are automatically identified and separated into MCQs and Questions)"
                className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:border-emerald-500 shadow-inner"
              />

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>
                  {rawText.length} characters &middot; {paperData.sections.reduce((acc, s) => acc + s.questions.length, 0)} questions detected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInstantParse}
                    className="hover:text-emerald-400 font-semibold transition-colors"
                  >
                    Re-convert Text
                  </button>
                  <span>&bull;</span>
                  <button
                    onClick={() => {
                      setRawText("");
                      setPaperData(parseRawTextToExam(""));
                    }}
                    className="hover:text-rose-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Manual Structure Controls:</span>
              <button
                onClick={handleAddSection}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Section</span>
              </button>
            </div>
          </div>
        )}

        {/* RIGHT PANEL: Live Printable Paper Sheet */}
        {(activeTab === "preview" || activeTab === "split") && (
          <div className="flex-1 bg-slate-900/30 overflow-y-auto flex flex-col items-center p-4 sm:p-6">
            {/* Formatting Toolbar */}
            <div className="no-print w-full max-w-[210mm] bg-slate-900 border border-slate-800 rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400">Language:</span>
                <select
                  value={paperLanguageMode}
                  onChange={(e) => setPaperLanguageMode(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-200 font-bold"
                >
                  <option value="Urdu">Urdu (دائیں سے بائیں - RTL)</option>
                  <option value="English">English (Left to Right - LTR)</option>
                  <option value="Bilingual">Bilingual (English + Urdu)</option>
                </select>

                <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                  <span className="text-xs font-semibold text-slate-400">Header:</span>
                  <select
                    value={activeTemplate.headerStyle}
                    onChange={(e) => {
                      const hStyle = e.target.value as any;
                      setActiveTemplate({ ...activeTemplate, headerStyle: hStyle });
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 font-medium"
                  >
                    <option value="punjab-board-style1">Style 1: Punjab Boards</option>
                    <option value="minimal">Minimal / Simple</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                  <span className="text-xs font-semibold text-slate-400">Font:</span>
                  <button
                    onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                    className="w-6 h-6 rounded bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700"
                  >
                    -
                  </button>
                  <span className="text-xs text-slate-300 w-5 text-center">{fontSize}</span>
                  <button
                    onClick={() => setFontSize(Math.min(16, fontSize + 1))}
                    className="w-6 h-6 rounded bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNote}
                    onChange={(e) => setIncludeNote(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Note / Instructions</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStudentInfo}
                    onChange={(e) => setIncludeStudentInfo(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Student Box</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBorder}
                    onChange={(e) => setShowBorder(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Border</span>
                </label>
              </div>
            </div>

            {/* A4 PRINT SHEET CONTAINER (Style 1: Punjab Boards / Seek Academy) */}
            <div
              id="printable-paper"
              className={`bg-white text-black shadow-2xl transition-all relative print:m-0 print:p-0 print:shadow-none print:w-full print:border-0 ${
                showBorder ? "p-4 sm:p-6 border-2 border-black" : "p-4 sm:p-6"
              }`}
              style={{
                width: "210mm",
                minHeight: "297mm",
                fontSize: `${fontSize}px`,
                boxSizing: "border-box",
                lineHeight: "1.35",
              }}
            >
              {/* Optional Watermark */}
              {showWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none overflow-hidden z-0">
                  <span className="text-8xl font-black rotate-45 uppercase tracking-widest text-slate-900">
                    {watermarkText || paperData.institutionName}
                  </span>
                </div>
              )}

              {/* ===================================================================
                  STYLE 1: PUNJAB BOARDS / SEEK ACADEMY HEADER
                  =================================================================== */}
              {activeTemplate.headerStyle === "punjab-board-style1" ? (
                <header className="relative z-10 mb-2 font-sans select-text">
                  {/* Top Outer Header Box */}
                  <div className="border-2 border-black flex items-stretch w-full bg-white box-border mb-0">
                    {/* Left: Logo Box */}
                    <div className="w-24 min-w-[96px] border-r-2 border-black flex flex-col items-center justify-center p-1.5 bg-white shrink-0">
                      {logoBase64 ? (
                        <img
                          src={logoBase64}
                          alt="Logo"
                          className="max-h-20 max-w-[85px] object-contain"
                        />
                      ) : (
                        <div className="w-16 h-16 border-2 border-emerald-600 rounded-full flex flex-col items-center justify-center p-1 bg-emerald-50 text-emerald-800 text-center font-bold">
                          <span className="text-[10px] leading-tight">SEEK</span>
                          <span className="text-[8px] uppercase tracking-tighter">ACADEMY</span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Institution Name + Dark Blue Banner + Subject/Class */}
                    <div className="flex-1 flex flex-col justify-between text-center border-r-2 border-black">
                      {/* Institution Title */}
                      <div className="py-1 px-2 font-black text-2xl text-[#1a365d] uppercase tracking-wider font-serif">
                        {isEditMode ? (
                          <>
                            <input
                              type="text"
                              value={paperData.institutionName}
                              onChange={(e) =>
                                setPaperData({ ...paperData, institutionName: e.target.value })
                              }
                              className="w-full text-center font-black text-2xl text-[#1a365d] bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none uppercase no-print"
                            />
                            <span className="print-only">
                              {paperData.institutionName}
                            </span>
                          </>
                        ) : (
                          paperData.institutionName
                        )}
                      </div>

                      {/* Dark Blue Center Banner (EXAMINATION 2026-27) */}
                      <div className="bg-[#1a365d] text-white font-black text-xs sm:text-sm py-1 px-4 border-y border-black tracking-widest uppercase">
                        {isEditMode ? (
                          <>
                            <input
                              type="text"
                              value={paperTypeBanner}
                              onChange={(e) => setPaperTypeBanner(e.target.value)}
                              className="w-full text-center font-black text-xs sm:text-sm text-white bg-transparent border-b border-dashed border-white/50 focus:border-white focus:outline-none uppercase no-print"
                            />
                            <span className="print-only">
                              {paperTypeBanner}
                            </span>
                          </>
                        ) : (
                          paperTypeBanner
                        )}
                      </div>

                      {/* Subject & Class Row */}
                      <div className="py-1 px-3 text-xs font-bold text-black flex items-center justify-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold">Subject:</span>
                          {isEditMode ? (
                            <>
                              <input
                                type="text"
                                value={paperData.subject}
                                onChange={(e) => setPaperData({ ...paperData, subject: e.target.value })}
                                className="font-bold text-xs bg-transparent border-b border-dashed border-slate-400 focus:border-black focus:outline-none w-32 text-center no-print"
                              />
                              <span className="print-only">
                                {paperData.subject}
                              </span>
                            </>
                          ) : (
                            <span>{paperData.subject}</span>
                          )}
                        </div>
                        <span>|</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold">Class:</span>
                          {isEditMode ? (
                            <>
                              <input
                                type="text"
                                value={paperData.grade}
                                onChange={(e) => setPaperData({ ...paperData, grade: e.target.value })}
                                className="font-bold text-xs bg-transparent border-b border-dashed border-slate-400 focus:border-black focus:outline-none w-20 text-center no-print"
                              />
                              <span className="print-only">
                                {paperData.grade}
                              </span>
                            </>
                          ) : (
                            <span>{paperData.grade}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Paper Code Box */}
                    <div className="w-28 min-w-[110px] flex flex-col items-center justify-center p-2 bg-white shrink-0 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-tight text-black mb-1">
                        PAPER CODE
                      </div>
                      <div className="flex justify-center gap-1">
                        {formattedCodeDigits.map((digit, dIdx) => (
                          <div
                            key={dIdx}
                            className="w-5 h-6 sm:w-6 sm:h-7 border-2 border-black flex items-center justify-center font-black font-mono text-sm sm:text-base bg-white"
                          >
                            {isEditMode ? (
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
                                  className="w-full h-full text-center font-black font-mono bg-transparent focus:outline-none no-print"
                                />
                                <span className="print-only">
                                  {digit}
                                </span>
                              </>
                            ) : (
                              digit
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Student Details & Syllabus Table (Exact style from reference screenshot) */}
                  {includeStudentInfo && (
                    <table
                      className="w-full border-2 border-black border-t-0 border-collapse text-xs font-bold"
                      dir="ltr"
                    >
                      <tbody>
                        {/* Row 1: Student Name & Syllabus */}
                        <tr className="border-b border-black h-7">
                          <td className="w-28 bg-[#f8f9fa] border-r border-black px-2 text-left whitespace-nowrap text-slate-800">
                            Student Name:
                          </td>
                          <td className="border-r-2 border-black px-2 bg-white">
                            <span className="border-b border-dotted border-slate-500 inline-block w-full min-h-[16px]" />
                          </td>
                          <td className="w-24 bg-[#fff3e0] border-r border-black px-2 text-left text-[#e65100] whitespace-nowrap">
                            Syllabus:
                          </td>
                          <td className="px-2 bg-white text-slate-800">
                            {isEditMode ? (
                              <>
                                <input
                                  type="text"
                                  value={syllabusText}
                                  onChange={(e) => setSyllabusText(e.target.value)}
                                  className="w-full bg-transparent focus:outline-none font-medium text-xs text-slate-800 no-print"
                                />
                                <span className="print-only font-medium">
                                  {syllabusText}
                                </span>
                              </>
                            ) : (
                              <span className="font-medium">{syllabusText}</span>
                            )}
                          </td>
                        </tr>

                        {/* Row 2: Roll No | Time | Marks | Date | Test No. (Light blue row) */}
                        <tr className="bg-[#e3f2fd] text-[#0d47a1] h-7">
                          <td colSpan={4} className="px-3 py-1">
                            <div className="flex items-center justify-between gap-3 text-xs flex-wrap font-bold">
                              <div className="flex items-center gap-1">
                                <span>Roll No:</span>
                                <span className="border-b border-dotted border-[#0d47a1] w-20 inline-block" />
                              </div>
                              <span className="text-slate-400">|</span>
                              <div className="flex items-center gap-1">
                                <span>Time:</span>
                                {isEditMode ? (
                                  <>
                                    <input
                                      type="text"
                                      value={paperData.timeAllowed}
                                      onChange={(e) =>
                                        setPaperData({ ...paperData, timeAllowed: e.target.value })
                                      }
                                      className="w-16 bg-transparent border-b border-dotted border-[#0d47a1] text-center font-bold focus:outline-none no-print"
                                    />
                                    <span className="print-only">
                                      {paperData.timeAllowed}
                                    </span>
                                  </>
                                ) : (
                                  <span>{paperData.timeAllowed}</span>
                                )}
                              </div>
                              <span className="text-slate-400">|</span>
                              <div className="flex items-center gap-1">
                                <span>Marks:</span>
                                {isEditMode ? (
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
                                      className="w-12 bg-transparent border-b border-dotted border-[#0d47a1] text-center font-bold focus:outline-none no-print"
                                    />
                                    <span className="print-only">
                                      {paperData.totalMarks}
                                    </span>
                                  </>
                                ) : (
                                  <span>{paperData.totalMarks}</span>
                                )}
                              </div>
                              <span className="text-slate-400">|</span>
                              <div className="flex items-center gap-1">
                                <span>Date:</span>
                                {isEditMode ? (
                                  <>
                                    <input
                                      type="text"
                                      value={paperData.date || ""}
                                      onChange={(e) =>
                                        setPaperData({ ...paperData, date: e.target.value })
                                      }
                                      className="w-24 bg-transparent border-b border-dotted border-[#0d47a1] text-center font-bold focus:outline-none no-print"
                                    />
                                    <span className="print-only">
                                      {paperData.date || "11-10-2026"}
                                    </span>
                                  </>
                                ) : (
                                  <span>{paperData.date || "11-10-2026"}</span>
                                )}
                              </div>
                              <span className="text-slate-400">|</span>
                              <div className="flex items-center gap-1">
                                <span>Test No.:</span>
                                {isEditMode ? (
                                  <>
                                    <input
                                      type="text"
                                      value={testNoText}
                                      onChange={(e) => setTestNoText(e.target.value)}
                                      className="w-10 bg-transparent border-b border-dotted border-[#0d47a1] text-center font-bold focus:outline-none no-print"
                                    />
                                    <span className="print-only">
                                      {testNoText}
                                    </span>
                                  </>
                                ) : (
                                  <span>{testNoText}</span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  {/* Note / Instruction Banner (Light Green Badge) */}
                  {includeNote && (
                    <div className="mt-2 text-xs flex items-start gap-1.5 leading-snug">
                      <span className="bg-[#d4efdf] text-[#196f3d] px-1.5 py-0.5 rounded text-[11px] font-bold shrink-0">
                        Note:
                      </span>
                      {isEditMode ? (
                        <>
                          <textarea
                            rows={2}
                            value={instructionNote}
                            onChange={(e) => setInstructionNote(e.target.value)}
                            className="w-full text-slate-800 text-[11px] bg-transparent border-b border-dashed border-slate-300 focus:outline-none resize-none leading-relaxed no-print"
                          />
                          <span className="print-only text-slate-800 text-[11px] leading-relaxed">
                            {instructionNote}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-800 text-[11px] leading-relaxed">
                          {instructionNote}
                        </span>
                      )}
                    </div>
                  )}
                </header>
              ) : (
                /* Simple Minimal Header fallback */
                <header className="relative z-10 border-b-2 border-black pb-2 mb-3 text-center">
                  <h1 className="text-2xl font-black uppercase tracking-tight font-serif">
                    {paperData.institutionName}
                  </h1>
                  <p className="text-xs font-bold uppercase text-slate-700">{paperData.title}</p>
                </header>
              )}

              {/* ===================================================================
                  SECTIONS & QUESTIONS (RTL for Urdu / LTR for English)
                  =================================================================== */}
              <div
                className={`relative z-10 space-y-3 pt-1 ${
                  paperLanguageMode === "Urdu" ? "font-urdu" : "font-sans"
                }`}
                dir={paperLanguageMode === "Urdu" ? "rtl" : "ltr"}
              >
                {paperData.sections.map((section, sIdx) => {
                  const isMcqSection = section.type === "mcq";

                  return (
                    <div key={section.id || sIdx} className="space-y-1.5">
                      {/* Section Title Banner e.g. "Section-I (20 Marks)" or "حصہ اول (20 نمبر)" */}
                      <div className="text-center pt-1 pb-0.5 border-b-2 border-black flex items-center justify-between px-1">
                        <div
                          className={`font-black uppercase tracking-wider text-black ${
                            paperLanguageMode === "Urdu" ? "text-sm sm:text-base font-urdu" : "text-xs sm:text-sm"
                          }`}
                        >
                          {isEditMode ? (
                            <>
                              <input
                                type="text"
                                value={section.titleUr || ""}
                                onChange={(e) => handleUpdateSectionTitle(sIdx, e.target.value)}
                                className="font-black uppercase text-black bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none no-print"
                              />
                              <span className="print-only">
                                {section.titleUr || (section.type === "mcq" ? "Section-I (معروضی سوالات)" : "Section-II (انشائیہ سوالات)")}
                              </span>
                            </>
                          ) : (
                            section.titleUr || (section.type === "mcq" ? "Section-I (معروضی سوالات)" : "Section-II (انشائیہ سوالات)")
                          )}
                        </div>
                        {section.marks && (
                          <div
                            className={`text-xs font-bold text-slate-800 ${
                              paperLanguageMode === "Urdu" ? "font-urdu" : ""
                            }`}
                          >
                            {paperLanguageMode === "Urdu" ? `(${section.marks} نمبر)` : `(${section.marks} Marks)`}
                          </div>
                        )}
                      </div>

                      {/* Section Instructions if any */}
                      {section.instructionsUr && (
                        <div
                          className={`text-[11px] font-bold text-slate-800 italic px-0.5 ${
                            paperLanguageMode === "Urdu" ? "font-urdu text-right not-italic" : "text-left"
                          }`}
                        >
                          {section.instructionsUr}
                        </div>
                      )}

                      {/* MCQs Option Layout */}
                      {isMcqSection ? (
                        <div className="space-y-2.5 pt-1">
                          {section.questions.map((q, qIdx) => (
                            <div key={qIdx} className="space-y-1 text-xs break-inside-avoid pb-1.5 border-b border-slate-100 last:border-b-0">
                              {/* Question line */}
                              <div
                                className={`flex items-start justify-between gap-2 font-bold text-slate-950 ${
                                  paperLanguageMode === "Urdu"
                                    ? "text-sm sm:text-base font-urdu text-right leading-loose sm:leading-loose"
                                    : "text-xs sm:text-sm text-left leading-normal"
                                }`}
                              >
                                <div className="flex-1 flex items-start gap-2">
                                  <span className="font-extrabold whitespace-nowrap shrink-0 mt-0.5">
                                    {paperLanguageMode === "Urdu"
                                      ? `(${q.number || qIdx + 1})`
                                      : `${q.number || qIdx + 1}.`}
                                  </span>
                                  {/* In Edit mode, show textarea on screen; in print or preview show clean flowing text */}
                                  {isEditMode ? (
                                    <>
                                      <textarea
                                        rows={1}
                                        value={q.questionUr || ""}
                                        onChange={(e) =>
                                          handleUpdateQuestionText(sIdx, qIdx, e.target.value)
                                        }
                                        className={`w-full bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none resize-none font-bold no-print ${
                                          paperLanguageMode === "Urdu" ? "font-urdu text-sm leading-relaxed" : "text-xs"
                                        }`}
                                      />
                                      <span
                                        className={`print-only font-bold ${
                                          paperLanguageMode === "Urdu" ? "font-urdu text-sm leading-relaxed" : "text-xs"
                                        }`}
                                      >
                                        {q.questionUr}
                                      </span>
                                    </>
                                  ) : (
                                    <span
                                      className={`font-bold flex-1 ${
                                        paperLanguageMode === "Urdu" ? "font-urdu text-sm sm:text-base leading-loose" : "text-xs sm:text-sm"
                                      }`}
                                    >
                                      {q.questionUr}
                                    </span>
                                  )}
                                </div>
                                {isEditMode && (
                                  <button
                                    onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                                    className="no-print text-rose-500 hover:text-rose-700 text-xs shrink-0 self-start p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* 4 Options Grid (Clean & compact with proper spacing) */}
                              {q.options && q.options.length > 0 && (
                                <div
                                  className={`grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 pt-1 text-xs font-medium text-slate-900 ${
                                    paperLanguageMode === "Urdu" ? "pr-6 font-urdu" : "pl-6"
                                  }`}
                                  dir={paperLanguageMode === "Urdu" ? "rtl" : "ltr"}
                                >
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-1.5 min-w-0">
                                      <span className="font-bold text-xs shrink-0">({opt.key})</span>
                                      {isEditMode ? (
                                        <>
                                          <input
                                            type="text"
                                            value={opt.textUr || ""}
                                            onChange={(e) =>
                                              handleUpdateOption(sIdx, qIdx, oIdx, "textUr", e.target.value)
                                            }
                                            className={`w-full bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none text-xs no-print ${
                                              paperLanguageMode === "Urdu" ? "font-urdu text-xs" : ""
                                            }`}
                                          />
                                          <span
                                            className={`print-only truncate ${
                                              paperLanguageMode === "Urdu" ? "font-urdu text-xs" : ""
                                            }`}
                                          >
                                            {opt.textUr}
                                          </span>
                                        </>
                                      ) : (
                                        <span className={`truncate ${paperLanguageMode === "Urdu" ? "font-urdu text-xs sm:text-sm" : ""}`}>
                                          {opt.textUr}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : section.type === "poetry" ? (
                        /* Poetry section: formatted in neat couplets */
                        <div className="space-y-2 py-1 font-urdu" dir="rtl">
                          {section.questions.map((q, qIdx) => (
                            <div key={qIdx} className="space-y-1 break-inside-avoid bg-slate-50/50 p-2.5 border border-slate-200 rounded">
                              <div className="text-xs font-bold text-slate-700 text-right">
                                {`شعر (${toRomanLower(q.number || qIdx + 1)}):`}
                              </div>
                              {q.poetryLines?.map((line, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="font-urdu text-center text-sm font-bold text-slate-950 py-0.5 tracking-wide leading-relaxed"
                                >
                                  &ldquo;{line}&rdquo;
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Subjective Questions: Clean full-width list or 2-column based on paperLayout */
                        <div
                          className={`grid gap-2.5 pt-1 text-xs ${
                            paperLayout === "two-column" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                          }`}
                        >
                          {section.questions.map((q, qIdx) => (
                            <div
                              key={qIdx}
                              className="flex items-start justify-between gap-2 break-inside-avoid pb-1.5 border-b border-slate-200 last:border-b-0"
                            >
                              <div
                                className={`flex-1 flex items-start gap-2 font-bold text-slate-950 ${
                                  paperLanguageMode === "Urdu"
                                    ? "font-urdu text-sm sm:text-base text-right leading-loose"
                                    : "text-xs sm:text-sm text-left leading-normal"
                                }`}
                              >
                                <span className="font-extrabold whitespace-nowrap shrink-0 mt-0.5">
                                  {`(${toRomanLower(q.number || qIdx + 1)})`}
                                </span>
                                {isEditMode ? (
                                  <>
                                    <textarea
                                      rows={1}
                                      value={q.questionUr || ""}
                                      onChange={(e) =>
                                        handleUpdateQuestionText(sIdx, qIdx, e.target.value)
                                      }
                                      className={`w-full bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none resize-none font-bold no-print ${
                                        paperLanguageMode === "Urdu" ? "font-urdu text-sm leading-relaxed" : "text-xs"
                                      }`}
                                    />
                                    <span
                                      className={`print-only font-bold ${
                                        paperLanguageMode === "Urdu" ? "font-urdu text-sm leading-relaxed" : "text-xs"
                                      }`}
                                    >
                                      {q.questionUr}
                                    </span>
                                  </>
                                ) : (
                                  <span className={paperLanguageMode === "Urdu" ? "font-urdu text-sm sm:text-base leading-loose" : ""}>
                                    {q.questionUr}
                                  </span>
                                )}
                              </div>
                              {isEditMode && (
                                <button
                                  onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                                  className="no-print text-rose-500 hover:text-rose-700 text-xs shrink-0 self-start p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Question Button in Edit Mode */}
                      {isEditMode && (
                        <div
                          className={`no-print pt-0.5 flex ${
                            paperLanguageMode === "Urdu" ? "justify-start" : "justify-end"
                          }`}
                        >
                          <button
                            onClick={() => handleAddQuestion(sIdx)}
                            className="px-2 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-300 flex items-center gap-1 font-sans"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{paperLanguageMode === "Urdu" ? "نیا سوال شامل کریں" : "Add Question"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
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
