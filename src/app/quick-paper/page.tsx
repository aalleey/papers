"use client";

import React, { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { parseRawTextToExam, ExamPaperData, ExamSection, ExamQuestion } from "@/lib/quick-paper-parser";
import { MathRenderer } from "@/components/MathRenderer";

export interface PaperTemplate {
  id: string;
  name: string;
  institutionName: string;
  title: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  totalMarks: number;
  headerStyle: "classic" | "modern" | "board" | "minimal";
  layout: "standard" | "bilingual-split" | "two-column";
  fontFamily: "urdu" | "serif" | "sans";
  fontSize: number;
  showBorder: boolean;
  borderStyle: "double" | "single" | "ornate";
  showRollNo: boolean;
  showWatermark: boolean;
  watermarkText: string;
}

const DEFAULT_TEMPLATES: PaperTemplate[] = [
  {
    id: "punjab-board",
    name: "BISE Punjab Board Standard",
    institutionName: "گورنمنٹ ہائر سیکنڈری سکول / کالج",
    title: "سالانہ امتحان و تعلیمی ٹیسٹ 2026",
    subject: "اردو لازمی",
    grade: "جماعت دہم (10th)",
    timeAllowed: "2:30 گھنٹے",
    totalMarks: 75,
    headerStyle: "board",
    layout: "standard",
    fontFamily: "urdu",
    fontSize: 12,
    showBorder: true,
    borderStyle: "double",
    showRollNo: true,
    showWatermark: false,
    watermarkText: "BISE EXAM",
  },
  {
    id: "academy-classic",
    name: "Academy / Coaching Classic",
    institutionName: "الٹیمیٹ اکیڈمی آف سائنسز اینڈ آرٹس",
    title: "ماہانہ ٹیسٹ سیریز (گرینڈ ٹیسٹ)",
    subject: "اردو لازمی",
    grade: "جماعت نہم / دہم",
    timeAllowed: "1:30 گھنٹہ",
    totalMarks: 50,
    headerStyle: "modern",
    layout: "standard",
    fontFamily: "urdu",
    fontSize: 12,
    showBorder: true,
    borderStyle: "single",
    showRollNo: true,
    showWatermark: true,
    watermarkText: "ACADEMY TEST",
  },
  {
    id: "fbise-federal",
    name: "Federal Board (FBISE) Style",
    institutionName: "ISLAMABAD MODEL COLLEGE FOR BOYS/GIRLS",
    title: "FIRST TERM EXAMINATION 2026",
    subject: "Urdu Compulsory / اردو",
    grade: "Class SSC-II (10th)",
    timeAllowed: "3:00 Hours",
    totalMarks: 75,
    headerStyle: "classic",
    layout: "standard",
    fontFamily: "urdu",
    fontSize: 12,
    showBorder: true,
    borderStyle: "double",
    showRollNo: true,
    showWatermark: false,
    watermarkText: "FBISE MODEL",
  },
  {
    id: "minimal-clean",
    name: "Clean & Compact (Eco Print)",
    institutionName: "SCHOOL EXAMINATION DEPARTMENT",
    title: "CLASS TEST / REVISION ASSESSMENT",
    subject: "اردو",
    grade: "10th",
    timeAllowed: "45 Minutes",
    totalMarks: 25,
    headerStyle: "minimal",
    layout: "two-column",
    fontFamily: "urdu",
    fontSize: 11,
    showBorder: false,
    borderStyle: "single",
    showRollNo: false,
    showWatermark: false,
    watermarkText: "",
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
  const [isEditMode, setIsEditMode] = useState<boolean>(true); // Inline editable toggle

  // Active Template State
  const [templates, setTemplates] = useState<PaperTemplate[]>(DEFAULT_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<PaperTemplate>(DEFAULT_TEMPLATES[0]);

  // Paper Display / Customization settings (driven by template & individual tweaks)
  const [paperLayout, setPaperLayout] = useState<"standard" | "bilingual-split" | "two-column">(
    activeTemplate.layout
  );
  const [fontSize, setFontSize] = useState<number>(activeTemplate.fontSize);
  const [showWatermark, setShowWatermark] = useState(activeTemplate.showWatermark);
  const [watermarkText, setWatermarkText] = useState(activeTemplate.watermarkText);
  const [showBorder, setShowBorder] = useState(activeTemplate.showBorder);
  const [borderStyle, setBorderStyle] = useState<"double" | "single" | "ornate">(activeTemplate.borderStyle);
  const [includeStudentInfo, setIncludeStudentInfo] = useState(activeTemplate.showRollNo);
  const [paperCode, setPaperCode] = useState("A-101");

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

      // Merge refined data
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

      // Local Tesseract.js fallback
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

  // --- QUESTION & SECTION DIRECT EDITING HANDLERS ---
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
      titleUr: "سوال نمبر: مختصر سوالات کے جوابات تحریر کریں",
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Header (Standalone from PaperWala) */}
      <header className="no-print bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50 shadow-md">
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
              Full Inline Editing &middot; Board Templates &middot; OCR &middot; Urdu Translation
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
            <span>Template: {activeTemplate.name.split(" ")[0]}</span>
          </button>

          {/* Edit Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isEditMode
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
            }`}
            title="Toggle inline editing of every text, question, and marks on the preview sheet"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditMode ? "Edit Mode: ON" : "Edit Mode: OFF"}</span>
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

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Paper</span>
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
                  Select & Configure Paper Template
                </h3>
                <p className="text-xs text-slate-400">
                  Pick a pre-configured template or customize how your paper converts.
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
                    <span>{tpl.headerStyle} Header</span>
                    <span>&bull;</span>
                    <span>{tpl.borderStyle} Border</span>
                    <span>&bull;</span>
                    <span>{tpl.totalMarks} Marks</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span>All text, headings, and marks remain 100% editable on the preview sheet.</span>
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
            <div className="p-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Raw Paper Text
              </span>

              <div className="flex items-center gap-2">
                {/* Upload Image for OCR */}
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

                {/* Translation dropdown */}
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleTranslate("Urdu")}
                    disabled={isTranslating}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 flex items-center gap-1 border-r border-slate-700"
                    title="Translate questions into Urdu Nastaliq"
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

                {/* AI Refine Button */}
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

            {/* Add Section Button */}
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
          <div className="flex-1 bg-slate-900/30 overflow-y-auto flex flex-col items-center p-4 sm:p-8">
            {/* Formatting Toolbar */}
            <div className="no-print w-full max-w-[210mm] bg-slate-900 border border-slate-800 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400">Layout:</span>
                <select
                  value={paperLayout}
                  onChange={(e) => setPaperLayout(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-slate-200 font-medium"
                >
                  <option value="standard">Standard Board Paper</option>
                  <option value="two-column">Compact Two-Column</option>
                </select>

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
                    checked={showBorder}
                    onChange={(e) => setShowBorder(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Border</span>
                </label>

                {showBorder && (
                  <select
                    value={borderStyle}
                    onChange={(e) => setBorderStyle(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-200"
                  >
                    <option value="double">Double</option>
                    <option value="single">Single</option>
                    <option value="ornate">Ornate</option>
                  </select>
                )}

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStudentInfo}
                    onChange={(e) => setIncludeStudentInfo(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Roll No. Box</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-0"
                  />
                  <span>Watermark</span>
                </label>
              </div>
            </div>

            {/* A4 PRINT SHEET CONTAINER (100% Editable) */}
            <div
              id="printable-paper"
              className={`bg-white text-black shadow-2xl transition-all relative print:m-0 print:p-0 print:shadow-none print:w-full ${
                showBorder
                  ? borderStyle === "double"
                    ? "p-8 sm:p-10 border-4 border-double border-black"
                    : borderStyle === "ornate"
                    ? "p-8 sm:p-10 border-4 border-black outline outline-2 outline-offset-2 outline-black"
                    : "p-8 sm:p-10 border-2 border-black"
                  : "p-8 sm:p-10"
              }`}
              style={{
                width: "210mm",
                minHeight: "297mm",
                fontSize: `${fontSize}px`,
                boxSizing: "border-box",
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

              {/* PAPER HEADER (Fully Editable) */}
              <header className="relative z-10 border-b-2 border-black pb-3 mb-4 text-center">
                {isEditMode ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={paperData.institutionName}
                      onChange={(e) => setPaperData({ ...paperData, institutionName: e.target.value })}
                      className="w-full text-center text-2xl font-black uppercase tracking-tight font-serif bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-black focus:outline-none py-0.5"
                      placeholder="ادارہ / سکول کا نام درج کریں"
                    />
                    <input
                      type="text"
                      value={paperData.title}
                      onChange={(e) => setPaperData({ ...paperData, title: e.target.value })}
                      className="w-full text-center text-sm font-bold tracking-wider uppercase text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-black focus:outline-none py-0.5"
                      placeholder="امتحان کی ہیڈنگ درج کریں"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-black uppercase tracking-tight font-serif">
                      {paperData.institutionName || "NAME OF INSTITUTION"}
                    </h1>
                    <p className="text-sm font-bold tracking-wider uppercase mt-0.5 text-slate-800">
                      {paperData.title || "EXAMINATION / ASSESSMENT"}
                    </p>
                  </>
                )}

                {/* Sub-header row: Class, Subject, Date, Marks, Time (Editable) */}
                <div className="mt-3 pt-2 border-t border-slate-300 grid grid-cols-3 text-xs font-semibold uppercase text-slate-800">
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">Subject:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={paperData.subject}
                          onChange={(e) => setPaperData({ ...paperData, subject: e.target.value })}
                          className="bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none w-32"
                        />
                      ) : (
                        <span>{paperData.subject}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">Class:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={paperData.grade}
                          onChange={(e) => setPaperData({ ...paperData, grade: e.target.value })}
                          className="bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none w-24"
                        />
                      ) : (
                        <span>{paperData.grade}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-bold">Date:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={paperData.date || ""}
                          onChange={(e) => setPaperData({ ...paperData, date: e.target.value })}
                          className="bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none w-24 text-center"
                        />
                      ) : (
                        <span>{paperData.date || new Date().toLocaleDateString("en-GB")}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-bold">Code:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={paperCode}
                          onChange={(e) => setPaperCode(e.target.value)}
                          className="bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none w-20 text-center"
                        />
                      ) : (
                        <span>{paperCode}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-bold">Total Marks:</span>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={paperData.totalMarks}
                          onChange={(e) => setPaperData({ ...paperData, totalMarks: Number(e.target.value) })}
                          className="bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none w-16 text-right"
                        />
                      ) : (
                        <span>{paperData.totalMarks}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-bold">Time Allowed:</span>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={paperData.timeAllowed}
                          onChange={(e) => setPaperData({ ...paperData, timeAllowed: e.target.value })}
                          className="bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none w-28 text-right"
                        />
                      ) : (
                        <span>{paperData.timeAllowed}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Info row */}
                {includeStudentInfo && (
                  <div className="mt-2.5 pt-2 border-t border-dashed border-slate-400 flex items-center justify-between text-xs font-medium text-slate-700">
                    <div>Name: ______________________</div>
                    <div>Roll No: [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</div>
                    <div>Section: __________</div>
                  </div>
                )}
              </header>

              {/* SECTIONS & QUESTIONS (100% Editable) */}
              <div className="relative z-10 space-y-6" dir="rtl">
                {paperData.sections.map((section, sIdx) => (
                  <div key={section.id || sIdx} className="space-y-3 group/sec">
                    {/* Section Title Banner (Editable) */}
                    <div className="bg-slate-100 border-y-2 border-black py-1.5 px-3 flex items-center justify-between">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={section.titleUr}
                          onChange={(e) => handleUpdateSectionTitle(sIdx, e.target.value)}
                          className="font-urdu font-bold text-base text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:border-black focus:outline-none flex-1 ml-4"
                        />
                      ) : (
                        <div className="font-urdu font-bold text-base text-slate-900">
                          {section.titleUr}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {isEditMode ? (
                          <div className="flex items-center gap-1 text-xs font-bold font-urdu bg-white px-2 py-0.5 border border-slate-700 rounded">
                            <span>نمبر:</span>
                            <input
                              type="number"
                              value={section.marks || ""}
                              onChange={(e) => handleUpdateSectionMarks(sIdx, Number(e.target.value))}
                              className="w-12 bg-transparent text-center focus:outline-none"
                            />
                          </div>
                        ) : (
                          section.marks && (
                            <div className="text-xs font-bold bg-white px-2.5 py-0.5 border border-slate-700 rounded font-urdu">
                              (نمبر: {section.marks})
                            </div>
                          )
                        )}

                        {/* Section deletion in Edit Mode */}
                        {isEditMode && (
                          <button
                            onClick={() => handleDeleteSection(sIdx)}
                            className="no-print p-1 rounded hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete this entire section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Poetry Section Rendering */}
                    {section.type === "poetry" ? (
                      <div className="space-y-4 py-2">
                        {section.questions.map((q, qIdx) => (
                          <div key={qIdx} className="space-y-2 break-inside-avoid">
                            {q.poetryLines && q.poetryLines.length > 0 ? (
                              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 space-y-2">
                                <div className="text-xs font-bold font-urdu text-slate-600 mb-1 flex items-center justify-between">
                                  <span>{`شعر نمبر (${qIdx + 1}):`}</span>
                                  {isEditMode && (
                                    <button
                                      onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                                      className="no-print text-rose-500 hover:text-rose-700 text-xs"
                                    >
                                      حذف
                                    </button>
                                  )}
                                </div>
                                {q.poetryLines.map((line, pIdx) => (
                                  <div key={pIdx} className="py-0.5">
                                    {isEditMode ? (
                                      <input
                                        type="text"
                                        value={line}
                                        onChange={(e) => {
                                          const updated = [...paperData.sections];
                                          if (updated[sIdx].questions[qIdx].poetryLines) {
                                            updated[sIdx].questions[qIdx].poetryLines![pIdx] = e.target.value;
                                            setPaperData({ ...paperData, sections: updated });
                                          }
                                        }}
                                        className="font-urdu text-center text-base font-bold text-slate-900 tracking-wide w-full bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none"
                                      />
                                    ) : (
                                      <div className="font-urdu text-center text-base font-bold text-slate-900 tracking-wide">
                                        &ldquo;{line}&rdquo;
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="font-urdu text-base font-bold text-center py-1">
                                {q.questionUr}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* MCQ and Subjective Questions List */
                      <div
                        className={`space-y-3 ${
                          paperLayout === "two-column" ? "grid grid-cols-2 gap-4 space-y-0" : ""
                        }`}
                      >
                        {section.questions.map((q, qIdx) => (
                          <div
                            key={qIdx}
                            className="space-y-2 pb-2.5 border-b border-slate-200 last:border-b-0 break-inside-avoid relative group/q"
                          >
                            {/* Question Title Line (Editable) */}
                            <div className="flex items-start justify-between gap-3 font-urdu">
                              <div className="flex-1 text-right text-base font-medium text-slate-900 leading-loose flex items-start">
                                <span className="font-bold ml-2 text-slate-950 whitespace-nowrap">
                                  {`(${q.number || qIdx + 1})`}
                                </span>
                                {isEditMode ? (
                                  <textarea
                                    value={q.questionUr}
                                    rows={1}
                                    onChange={(e) => handleUpdateQuestionText(sIdx, qIdx, e.target.value)}
                                    className="font-urdu text-base font-medium text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-black focus:outline-none w-full resize-none leading-relaxed"
                                  />
                                ) : (
                                  <span>{q.questionUr}</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 pt-1">
                                {isEditMode ? (
                                  <div className="flex items-center gap-1 text-xs text-slate-700">
                                    <input
                                      type="number"
                                      value={q.marks || ""}
                                      onChange={(e) => handleUpdateQuestionMarks(sIdx, qIdx, Number(e.target.value))}
                                      className="w-10 bg-transparent border-b border-dashed border-slate-400 text-center font-bold focus:outline-none"
                                      placeholder="نمبر"
                                    />
                                    <span>نمبر</span>
                                  </div>
                                ) : (
                                  q.marks && (
                                    <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
                                      [{q.marks} نمبر]
                                    </span>
                                  )
                                )}

                                {isEditMode && (
                                  <button
                                    onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                                    className="no-print opacity-40 hover:opacity-100 text-rose-500 p-1 transition-opacity"
                                    title="Delete question"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* MCQ Options grid (Editable) */}
                            {section.type === "mcq" && q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 px-1">
                                {q.options.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className="flex items-center gap-2 p-1.5 rounded bg-slate-50 border border-slate-300"
                                  >
                                    <span className="font-bold text-xs min-w-5 h-5 rounded-full bg-slate-200 border border-slate-400 flex items-center justify-center text-slate-950 font-urdu">
                                      ({opt.key})
                                    </span>
                                    {isEditMode ? (
                                      <input
                                        type="text"
                                        value={opt.textUr}
                                        onChange={(e) =>
                                          handleUpdateOption(sIdx, qIdx, oIdx, "textUr", e.target.value)
                                        }
                                        className="font-urdu text-xs font-medium text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-black focus:outline-none w-full"
                                      />
                                    ) : (
                                      <span className="font-urdu text-xs font-medium text-slate-900 leading-normal">
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
                    )}

                    {/* Add Question Button inside section in Edit Mode */}
                    {isEditMode && (
                      <div className="no-print pt-2 flex justify-end">
                        <button
                          onClick={() => handleAddQuestion(sIdx)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>نیا سوال شامل کریں</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* End of paper indicator */}
              <div className="mt-8 pt-4 border-t border-slate-300 text-center text-xs font-semibold tracking-widest text-slate-500 uppercase font-urdu">
                *** اختتام پیپر / Best of Luck ***
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
