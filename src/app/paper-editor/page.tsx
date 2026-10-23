"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Question, ClientUser, SubscriptionPlanId, UserPaperTemplate, isPaidSubscriber } from "@/lib/types";
import { MathRenderer } from "@/components/MathRenderer";
import { getUrduTranslation } from "@/lib/urdu-translations";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { ClientAuthModal } from "@/components/ClientAuthModal";
import { BrandEmblem, generatePaperWalaCrestDataUrl } from "@/components/BrandLogo";
import { exportPaperToDocx } from "@/lib/docx-export";
import { ExamSection } from "@/lib/quick-paper-parser";
import {
  ArrowLeft,
  Printer,
  Settings,
  Sparkles,
  Sliders,
  Type,
  Building2,
  HelpCircle,
  Shuffle,
  Trash2,
  Check,
  X,
  ChevronDown,
  Crown,
  Lock,
  LogIn,
  Columns,
  FileText,
  Star,
  Bookmark,
  Image as ImageIcon,
  Shield,
  ShieldCheck,
  Layers,
  Scissors,
  Languages,
  Loader2,
  RefreshCw,
} from "lucide-react";

// Roman numeral converter
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

// Clean question text of leading numbers or punctuation
function cleanQuestionText(text: string): string {
  if (!text) return "";
  return text.replace(/^(\d+[\.\)]|\([a-zA-Z0-9]+\))\s*/, "").trim();
}

export default function PaperEditorPage() {
  const router = useRouter();

  // Client authentication & subscription state
  const [clientUser, setClientUser] = useState<ClientUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subModalTitle, setSubModalTitle] = useState("Unlock Full Examination Features");
  const [subModalSubtitle, setSubModalSubtitle] = useState(
    "Choose a subscription plan to generate board-standard papers with your academy branding and answer keys."
  );
  const [subModalHighlight, setSubModalHighlight] = useState<SubscriptionPlanId | undefined>("standard");
  const [authChecked, setAuthChecked] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // --- PAPER METADATA & PARAMETERS ---
  const [paperTitle, setPaperTitle] = useState("Paper Preview");
  const [institutionName, setInstitutionName] = useState("Your Institution Name");
  const [paperTypeBanner, setPaperTypeBanner] = useState("EXAMINATION 2026-27");
  const [subjectTitle, setSubjectTitle] = useState("Computer کمپوٹر");
  const [classNameText, setClassNameText] = useState("10th");
  const [syllabusText, setSyllabusText] = useState("Unit-2 System Recovery and Advanced Maintenance");
  const [totalMarks, setTotalMarks] = useState<number>(75);
  const [timeDuration, setTimeDuration] = useState("2:30 hrs");
  const [paperDate, setPaperDate] = useState("12-10-2026");
  const [testNoText, setTestNoText] = useState("");

  // --- MODEL & HEADER DESIGN STYLES ---
  // style1: Punjab Boards (Default) | style2: Federal Board (FBISE)
  const [headerStyle, setHeaderStyle] = useState<"style1" | "style2">("style1");
  const [languageMode, setLanguageMode] = useState<"Bilingual" | "English" | "Urdu">("Bilingual");

  // Custom Banner Header
  const [useCustomHeaderImage, setUseCustomHeaderImage] = useState(false);
  const [customHeaderImage, setCustomHeaderImage] = useState<string | null>(null);
  const [customHeaderWidth, setCustomHeaderWidth] = useState<number>(100);

  // Logo file
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(70);
  const [instFontSize, setInstFontSize] = useState<number>(24);

  // --- VERSION STATE (Version A, B, C, D) ---
  const [paperVersion, setPaperVersion] = useState<"A" | "B" | "C" | "D">("A");
  const [paperCodes, setPaperCodes] = useState<Record<string, string>>({
    A: "3041",
    B: "3042",
    C: "3043",
    D: "3044",
  });
  const [includePaperCode, setIncludePaperCode] = useState(true);

  // --- SIZING & FONTS ---
  const [objFontSize, setObjFontSize] = useState<number>(12); // MCQ font size in px
  const [subFontSize, setSubFontSize] = useState<number>(12); // Subjective font size in px
  const [boldHeadingsOnly, setBoldHeadingsOnly] = useState<boolean>(true);
  const [entireContentBold, setEntireContentBold] = useState<boolean>(false);

  // --- CONTENT OPTIONS TOGGLES ---
  const [includeHeaderSection, setIncludeHeaderSection] = useState(true);
  const [includeStudentSection, setIncludeStudentSection] = useState(true);
  const [useBoardHeadings, setUseBoardHeadings] = useState(false);
  const [includeMcqs, setIncludeMcqs] = useState(true);
  const [includeShort, setIncludeShort] = useState(true);
  const [includeLong, setIncludeLong] = useState(true);
  const [includeBubbleSheet, setIncludeBubbleSheet] = useState(true);
  const [includeMcqAnswerKey, setIncludeMcqAnswerKey] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [includePaperBorder, setIncludePaperBorder] = useState(false);
  const [printShortLongSeparatePage, setPrintShortLongSeparatePage] = useState(false);
  const [enableAutoDuplication, setEnableAutoDuplication] = useState(false);

  // --- WATERMARK SETTINGS ---
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [watermarkImageBase64, setWatermarkImageBase64] = useState<string | null>(null);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.12);

  // --- INSTRUCTIONS / QUICK NOTES ---
  const [includeInstructions, setIncludeInstructions] = useState(true);
  const defaultEngInstruction =
    "Four possible answer a,b,c and d to each question are given. The choice which you think is correct, fill that circle in front of that questions with Marker or Pen ink, Cutting or filling two or more circles will result in zero mark in that question.";
  const defaultUrduInstruction =
    "ہر سوال کے چار ممکنہ جوابات A، B، C اور D دیے گئے ہیں۔ جس جواب کو آپ درست سمجھتے ہیں، مارکر یا پین کی سیاہی سے اس کا دائرہ پُر کریں۔ کٹائی کرنے یا ایک سے زیادہ دائرے بھرنے کی صورت میں اس سوال کا کوئی نمبر نہیں دیا جائے گا۔";
  const [instructionText, setInstructionText] = useState(defaultEngInstruction);

  // Paper Size & Print Density
  const [paperSize, setPaperSize] = useState<"a4" | "letter" | "legal">("a4");
  const [testDensity, setTestDensity] = useState<"1_per_page" | "2_per_page">("1_per_page");

  // Popovers & Drawer
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"general" | "branding" | "fonts" | "content" | "watermark">("general");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Language Translation / Bilingual Conversion State
  const [isAiTranslating, setIsAiTranslating] = useState(false);
  const [translatingQuestionId, setTranslatingQuestionId] = useState<string | null>(null);
  const [translationBannerDismissed, setTranslationBannerDismissed] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load layout preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPaperSize = localStorage.getItem("paperwala_paper_size");
      if (savedPaperSize === "a4" || savedPaperSize === "letter" || savedPaperSize === "legal") {
        setPaperSize(savedPaperSize);
      }
      const savedDensity = localStorage.getItem("paperwala_test_density");
      if (savedDensity === "1_per_page" || savedDensity === "2_per_page") {
        setTestDensity(savedDensity);
      }
      const savedHeaderStyle = localStorage.getItem("paperwala_header_style");
      if (savedHeaderStyle === "style1" || savedHeaderStyle === "style2") {
        setHeaderStyle(savedHeaderStyle);
      }
      const savedBorder = localStorage.getItem("paperwala_paper_border");
      if (savedBorder !== null) setIncludePaperBorder(savedBorder === "true");
      const savedWm = localStorage.getItem("paperwala_watermark");
      if (savedWm !== null) setIncludeWatermark(savedWm === "true");
      const savedLogo = localStorage.getItem("paperwala_logo");
      if (savedLogo) setLogoBase64(savedLogo);
    } catch {
      // ignore
    }
  }, []);

  const updatePaperSize = (size: "a4" | "letter" | "legal") => {
    setPaperSize(size);
    try {
      localStorage.setItem("paperwala_paper_size", size);
    } catch {
      // ignore
    }
  };

  const updateTestDensity = (density: "1_per_page" | "2_per_page") => {
    setTestDensity(density);
    try {
      localStorage.setItem("paperwala_test_density", density);
    } catch {
      // ignore
    }
  };

  const updateHeaderStyle = (style: "style1" | "style2") => {
    setHeaderStyle(style);
    try {
      localStorage.setItem("paperwala_header_style", style);
    } catch {
      // ignore
    }
  };

  // Apply the user's saved paper template (set in Profile > Paper Template) over the defaults
  const applyUserTemplate = (t?: UserPaperTemplate | null) => {
    if (!t) return;
    if (t.institutionName) setInstitutionName(t.institutionName);
    if (t.logoBase64) setLogoBase64(t.logoBase64);
    setLogoSize(t.logoSize);
    setHeaderStyle(t.headerStyle);
    setPaperTypeBanner(t.paperTypeBanner);
    try {
      if (!sessionStorage.getItem("papermaker_language_mode")) setLanguageMode(t.languageMode);
    } catch {
      setLanguageMode(t.languageMode);
    }
    setPaperSize(t.paperSize);
    setTestDensity(t.testDensity);
    setTimeDuration(t.timeDuration);
    setInstFontSize(t.instFontSize);
    setObjFontSize(t.objFontSize);
    setSubFontSize(t.subFontSize);
    setBoldHeadingsOnly(t.boldHeadingsOnly);
    setEntireContentBold(t.entireContentBold);
    setIncludeHeaderSection(t.includeHeaderSection);
    setIncludeStudentSection(t.includeStudentSection);
    setIncludeBubbleSheet(t.includeBubbleSheet);
    setIncludeMcqAnswerKey(t.includeMcqAnswerKey);
    setIncludeInstructions(t.includeInstructions);
    setInstructionText(t.instructionText);
    setIncludePaperBorder(t.includePaperBorder);
    setIncludeWatermark(t.includeWatermark);
    setWatermarkType(t.watermarkType);
    setWatermarkOpacity(t.watermarkOpacity);
    setIncludePaperCode(t.includePaperCode);
  };

  // Image Upload Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setLogoBase64(b64);
      try {
        localStorage.setItem("paperwala_logo", b64);
      } catch {
        // ignore
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomHeaderImage(reader.result as string);
      setUseCustomHeaderImage(true);
    };
    reader.readAsDataURL(file);
  };

  const handleWatermarkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setWatermarkImageBase64(reader.result as string);
      setWatermarkType("image");
      setIncludeWatermark(true);
    };
    reader.readAsDataURL(file);
  };

  // Load editor data helper function
  async function loadEditorData() {
    try {
      setLoading(true);
      const res = await fetch("/api/paper/questions?chapter_id=68fc022a-f4b1-53f8-a133-2946135d88db");
      const data = await res.json();
      if (data.questions?.length) {
        setBankQuestions(data.questions);
      }

      const stored = sessionStorage.getItem("papermaker_selected_questions");
      const storedLang = sessionStorage.getItem("papermaker_language_mode");
      if (storedLang === "Urdu" || storedLang === "English" || storedLang === "Bilingual") {
        setLanguageMode(storedLang);
      }

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setQuestions(parsed);
            const firstQ = parsed[0];
            if (firstQ?.chapter_id && data.chapters) {
              const matchCh = data.chapters.find((c: any) => c.id === firstQ.chapter_id);
              if (matchCh) {
                setSyllabusText(`Unit-${matchCh.number} ${matchCh.title}`);
              }
            }
            return;
          }
        } catch {
          // ignore
        }
      }

      // Default set matching Chapter 2
      if (data.questions?.length) {
        const defaultMcqs = data.questions.filter((q: Question) => q.type === "mcq").slice(0, 7);
        const defaultShorts = data.questions.filter((q: Question) => q.type === "short").slice(0, 5);
        const defaultLongs = data.questions.filter((q: Question) => q.type === "long").slice(0, 1);
        setQuestions([...defaultMcqs, ...defaultShorts, ...defaultLongs]);
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  }

  // Initial Load: Check client authentication
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const res = await fetch("/api/auth/client/me");
        const data = await res.json();
        if (data.client) {
          if (
            data.client.subscription?.status === "pending_verification" ||
            data.client.isVerified === false
          ) {
            router.push("/verification-pending");
            return;
          }
          setClientUser(data.client);
          if (data.client.academyName && data.client.subscription.canCustomBranding) {
            setInstitutionName(data.client.academyName);
          }
          await loadEditorData();
          applyUserTemplate(data.client.subscription?.paperTemplate);
        } else {
          setClientUser(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load client user:", err);
        setLoading(false);
      } finally {
        setAuthChecked(true);
      }
    }

    init();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/client/logout", { method: "POST" });
      setClientUser(null);
    } catch (e) {
      console.error("Failed to logout client", e);
    }
  }

  // Split questions
  const mcqs = useMemo(() => questions.filter((q) => q.type === "mcq"), [questions]);
  const shorts = useMemo(() => questions.filter((q) => q.type === "short"), [questions]);
  const longs = useMemo(() => questions.filter((q) => q.type === "long"), [questions]);

  // Version-shuffled MCQs
  const displayedMcqs = useMemo(() => {
    if (paperVersion === "A") return mcqs;

    const seed = paperVersion === "B" ? 7 : paperVersion === "C" ? 13 : 19;
    return [...mcqs].sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) * seed + a.id.charCodeAt(a.id.length - 1)) % 100;
      const hashB = (b.id.charCodeAt(0) * seed + b.id.charCodeAt(b.id.length - 1)) % 100;
      return hashA - hashB;
    });
  }, [mcqs, paperVersion]);

  const currentPaperCode = paperCodes[paperVersion] || "3041";

  // Marks Calculation
  const effectiveMcqMarks = displayedMcqs.length * 1;
  const effectiveShortMarks = shorts.length * 2;
  const effectiveLongMarks = longs.length * 5;

  // Print Action
  const handlePrint = (layoutType?: "portrait" | "landscape_2up") => {
    if (!clientUser) {
      setSubModalTitle("Client Login & Subscription Required");
      setSubModalSubtitle("Please sign in or select a subscription plan to export and print examination papers.");
      setShowAuthModal(true);
      return;
    }

    if (!isPaidSubscriber(clientUser)) {
      setSubModalTitle("Paid Subscription Required to Print");
      setSubModalSubtitle(
        "Only registered educators with an active paid subscription are eligible to generate, export, and print examination papers. Upgrade your plan to proceed."
      );
      setSubModalHighlight("pay_as_you_go");
      setShowSubModal(true);
      return;
    }

    if (clientUser.subscription.planId === "pay_as_you_go" && clientUser.subscription.paperCredits <= 0) {
      setSubModalTitle("No Paper Credits Left");
      setSubModalSubtitle(
        "You have used all your Go as you pay credits (Rs. 30 per paper). Buy more or switch to Standard / Annual for unlimited papers."
      );
      setSubModalHighlight("standard");
      setShowSubModal(true);
      return;
    }

    // Save history
    fetch("/api/papers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: testNoText ? `${testNoText} - ${subjectTitle}` : `${paperTypeBanner} - ${subjectTitle}`,
        institution: institutionName,
        subject: subjectTitle.replace(/[^\x20-\x7E]/g, "").trim() || subjectTitle,
        className: classNameText,
        syllabus: syllabusText,
        mcqCount: mcqs.length,
        shortCount: shorts.length,
        longCount: longs.length,
        totalMarks,
        languageMode,
        version: paperVersion,
        headerStyle,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.client) setClientUser(d.client);
      })
      .catch((e) => console.error("Failed to record paper history", e));

    const activeLayout = layoutType ?? (testDensity === "2_per_page" ? "landscape_2up" : "portrait");
    if (activeLayout === "landscape_2up") {
      updateTestDensity("2_per_page");
    } else {
      updateTestDensity("1_per_page");
    }

    setActiveDropdown(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Save Favorite Action
  const handleSaveFavorite = () => {
    showToast("⭐ Paper configuration saved to favorites!");
  };

  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Export to Microsoft Word (.docx)
  const handleExportWord = async () => {
    try {
      setIsExportingDocx(true);
      const exportSections: ExamSection[] = [];

      if (includeMcqs && displayedMcqs.length > 0) {
        exportSections.push({
          id: "sec-mcq",
          type: "mcq",
          titleEn: "SECTION-I: OBJECTIVE (MCQs)",
          titleUr: "حصہ اول: معروضی سوالات",
          instructionsEn: "Q.1: Choose the correct answer from the following options.",
          instructionsUr: "سوال نمبر 1: درست جواب کا انتخاب کریں۔",
          marks: effectiveMcqMarks,
          questions: displayedMcqs.map((q, idx) => {
            const enTrans = q.translations?.find((t) => t.language === "en");
            const urTrans = q.translations?.find((t) => t.language === "ur");
            const dynamicUr = getUrduTranslation(enTrans?.text || "", enTrans?.options);
            const enQ = cleanQuestionText(enTrans?.text || "");
            const urQ = cleanQuestionText(urTrans?.text || dynamicUr.text_ur || "");
            const enOpts = enTrans?.options || [];
            const urOpts = urTrans?.options || dynamicUr.options_ur || [];

            return {
              number: idx + 1,
              questionEn: enQ || urQ,
              questionUr: urQ || enQ,
              marks: 1,
              options: [0, 1, 2, 3].map((oIdx) => ({
                key: String.fromCharCode(65 + oIdx),
                textEn: enOpts[oIdx] || "",
                textUr: urOpts[oIdx] || enOpts[oIdx] || "",
              })),
            };
          }),
        });
      }

      if (includeShort && shorts.length > 0) {
        exportSections.push({
          id: "sec-short",
          type: "short",
          titleEn: "SECTION-II: SHORT QUESTIONS",
          titleUr: "حصہ دوم: مختصر سوالات",
          instructionsEn: `Q.2: Write short answers to the following questions. (${shorts.length} × 2 = ${effectiveShortMarks})`,
          instructionsUr: "سوال نمبر 2: درج ذیل سوالات کے مختصر جوابات تحریر کریں۔",
          marks: effectiveShortMarks,
          questions: shorts.map((q, idx) => {
            const en = cleanQuestionText(q.translations?.find((t) => t.language === "en")?.text || "");
            const ur = cleanQuestionText(
              q.translations?.find((t) => t.language === "ur")?.text ||
                getUrduTranslation(en).text_ur ||
                ""
            );
            return {
              number: idx + 1,
              questionEn: en || ur,
              questionUr: ur || en,
              marks: 2,
            };
          }),
        });
      }

      if (includeLong && longs.length > 0) {
        exportSections.push({
          id: "sec-long",
          type: "long",
          titleEn: "SECTION-III: LONG QUESTIONS",
          titleUr: "حصہ سوم: تفصیلی سوالات",
          instructionsEn: `Attempt the following questions in detail. (${longs.length} × 5 = ${effectiveLongMarks})`,
          instructionsUr: "درج ذیل سوالات کے تفصیلی جوابات تحریر کریں۔",
          marks: effectiveLongMarks,
          questions: longs.map((q, idx) => {
            const en = cleanQuestionText(q.translations?.find((t) => t.language === "en")?.text || "");
            const ur = cleanQuestionText(
              q.translations?.find((t) => t.language === "ur")?.text ||
                getUrduTranslation(en).text_ur ||
                ""
            );
            return {
              number: idx + 3,
              questionEn: en || ur,
              questionUr: ur || en,
              marks: 5,
            };
          }),
        });
      }

      const answerKeyItems =
        includeMcqAnswerKey && displayedMcqs.length > 0
          ? displayedMcqs.map((q, idx) => {
              const enTrans = q.translations?.find((t) => t.language === "en");
              const enQ = cleanQuestionText(enTrans?.text || "");
              const ans = enTrans?.answer || q.translations?.[0]?.answer || "A";
              return {
                number: idx + 1,
                question: enQ,
                answer: ans,
              };
            })
          : [];

      const blob = await exportPaperToDocx({
        paperData: {
          title: paperTitle,
          institutionName,
          subject: subjectTitle,
          grade: classNameText,
          totalMarks,
          timeAllowed: timeDuration,
          date: paperDate,
          sections: exportSections,
        },
        languageMode,
        syllabus: syllabusText,
        testNo: testNoText,
        paperCode: currentPaperCode,
        note: includeInstructions ? instructionText : "",
        noteUr: includeInstructions ? defaultUrduInstruction : "",
        paperTypeBanner,
        logoBase64,
        headerStyle,
        includeStudentInfo: includeStudentSection,
        includeBubbleSheet,
        includeAnswerKey: includeMcqAnswerKey,
        answerKeyItems,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const cleanName = (institutionName || "Exam_Paper").replace(/\s+/g, "_");
      link.download = `${cleanName}_${currentPaperCode}_Ver_${paperVersion}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("📄 Downloaded formatted Word (.docx) file!");
    } catch (err) {
      console.error("Failed to export Word file:", err);
      showToast("Failed to export Word file");
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Swap question
  const handleSwapQuestion = (id: string, type: string) => {
    const currentIds = new Set(questions.map((q) => q.id));
    const available = bankQuestions.filter((q) => q.type === type && !currentIds.has(q.id));
    if (available.length > 0) {
      const replacement = available[Math.floor(Math.random() * available.length)];
      setQuestions((prev) => prev.map((q) => (q.id === id ? replacement : q)));
      showToast("Question swapped successfully!");
    } else {
      alert("No additional questions of this type available to swap.");
    }
  };

  // Delete question
  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    showToast("Question removed from paper");
  };

  // Instruction preset changer
  const handleInstructionPresetChange = (preset: string) => {
    if (preset === "english_default") setInstructionText(defaultEngInstruction);
    else if (preset === "urdu_default") setInstructionText(defaultUrduInstruction);
    else if (preset === "bilingual_default") setInstructionText(defaultEngInstruction);
  };

  // Detect whether each question has English and/or Urdu content
  const languageCoverage = useMemo(() => {
    const urduRegex = /[\u0600-\u06FF]/;
    const latinRegex = /[A-Za-z]/;
    let missingEnCount = 0;
    let missingUrCount = 0;
    let missingMcqUrOptions = 0;

    questions.forEach((q) => {
      const enTrans = q.translations?.find((t) => t.language === "en");
      const urTrans = q.translations?.find((t) => t.language === "ur");

      const rawEn = (enTrans?.text || "").trim();
      const rawUr = (urTrans?.text || "").trim();

      const enIsActuallyUrdu =
        urduRegex.test(rawEn) && !latinRegex.test(rawEn.replace(/\\[a-zA-Z]+/g, ""));
      const hasValidEn = Boolean(rawEn && !enIsActuallyUrdu);
      const hasValidUr = Boolean(rawUr && urduRegex.test(rawUr)) || enIsActuallyUrdu;

      if (!hasValidEn) missingEnCount++;
      if (!hasValidUr) missingUrCount++;

      if (q.type === "mcq") {
        const urOpts = urTrans?.options || [];
        const hasAllUrOpts = urOpts.length >= 4 && urOpts.some((o) => Boolean(o && o.trim()));
        if (!hasAllUrOpts) missingMcqUrOptions++;
      }
    });

    const total = questions.length;
    const isCompleteBilingual =
      total > 0 && missingEnCount === 0 && missingUrCount === 0 && missingMcqUrOptions === 0;

    return {
      total,
      missingEnCount,
      missingUrCount,
      missingMcqUrOptions,
      hasMissingUrdu: missingUrCount > 0 || missingMcqUrOptions > 0,
      hasMissingEnglish: missingEnCount > 0,
      isCompleteBilingual,
    };
  }, [questions]);

  // AI Language Conversion Handler (Bulk)
  const handleAiConvertLanguage = async (
    direction: "auto_both" | "en_to_ur" | "ur_to_en",
    targetLanguageMode?: "Bilingual" | "English" | "Urdu",
    forceRetranslate = false
  ) => {
    if (isAiTranslating || questions.length === 0) return;

    try {
      setIsAiTranslating(true);
      setActiveDropdown(null);

      const urduRegex = /[\u0600-\u06FF]/;
      const latinRegex = /[A-Za-z]/;

      const normalizedInput = questions.map((q) => {
        const enTrans = q.translations?.find((t) => t.language === "en");
        const urTrans = q.translations?.find((t) => t.language === "ur");
        const rawEn = (enTrans?.text || "").trim();
        const rawUr = (urTrans?.text || "").trim();

        const enIsActuallyUrdu =
          urduRegex.test(rawEn) && !latinRegex.test(rawEn.replace(/\\[a-zA-Z]+/g, ""));

        if (enIsActuallyUrdu && !rawUr) {
          return {
            ...q,
            translations: [
              {
                language: "en" as const,
                text: "",
                options: [],
                answer: enTrans?.answer || "",
              },
              {
                language: "ur" as const,
                text: rawEn,
                options: enTrans?.options || [],
                answer: enTrans?.answer || "",
              },
            ],
          };
        }
        return q;
      });

      const res = await fetch("/api/paper/translate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: normalizedInput,
          direction,
          subject: subjectTitle,
          className: classNameText,
          forceRetranslate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Translation failed");
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        try {
          sessionStorage.setItem("papermaker_selected_questions", JSON.stringify(data.questions));
        } catch {
          // ignore storage quota errors
        }

        const nextMode =
          targetLanguageMode ||
          (direction === "auto_both"
            ? "Bilingual"
            : direction === "en_to_ur" && languageMode === "English"
            ? "Bilingual"
            : direction === "ur_to_en" && languageMode === "Urdu"
            ? "Bilingual"
            : languageMode);

        setLanguageMode(nextMode);
        try {
          sessionStorage.setItem("papermaker_language_mode", nextMode);
        } catch {
          // ignore
        }

        const label =
          direction === "en_to_ur"
            ? "English → Urdu (Nastaliq)"
            : direction === "ur_to_en"
            ? "Urdu → English"
            : "Bilingual (English & Urdu)";
        showToast(`✨ AI converted ${data.questions.length} questions to ${label}!`);
      }
    } catch (err: any) {
      console.error("AI language conversion error:", err);
      showToast(err?.message || "Failed to convert paper languages with AI.");
    } finally {
      setIsAiTranslating(false);
    }
  };

  // Single Question AI Translation Handler
  const handleTranslateSingleQuestion = async (questionId: string) => {
    const targetQ = questions.find((q) => q.id === questionId);
    if (!targetQ || translatingQuestionId) return;

    try {
      setTranslatingQuestionId(questionId);
      const urduRegex = /[\u0600-\u06FF]/;
      const latinRegex = /[A-Za-z]/;
      const enTrans = targetQ.translations?.find((t) => t.language === "en");
      const urTrans = targetQ.translations?.find((t) => t.language === "ur");
      const rawEn = (enTrans?.text || "").trim();
      const rawUr = (urTrans?.text || "").trim();
      const enIsActuallyUrdu =
        urduRegex.test(rawEn) && !latinRegex.test(rawEn.replace(/\\[a-zA-Z]+/g, ""));

      const preparedQ =
        enIsActuallyUrdu && !rawUr
          ? {
              ...targetQ,
              translations: [
                { language: "en" as const, text: "", options: [], answer: enTrans?.answer || "" },
                {
                  language: "ur" as const,
                  text: rawEn,
                  options: enTrans?.options || [],
                  answer: enTrans?.answer || "",
                },
              ],
            }
          : targetQ;

      const res = await fetch("/api/paper/translate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: [preparedQ],
          direction: "auto_both",
          subject: subjectTitle,
          className: classNameText,
          forceRetranslate: true,
        }),
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data.questions) && data.questions[0]) {
        const updatedQ = data.questions[0];
        setQuestions((prev) => {
          const next = prev.map((q) => (q.id === questionId ? updatedQ : q));
          try {
            sessionStorage.setItem("papermaker_selected_questions", JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
        showToast("✨ Question translated to both English & Urdu!");
      }
    } catch (err) {
      console.error("Single question translation error:", err);
      showToast("Failed to translate question.");
    } finally {
      setTranslatingQuestionId(null);
    }
  };

  if (!authChecked || (loading && clientUser)) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-slate-700">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Formatting Examination Paper...</h2>
        <p className="text-xs text-slate-500 mt-1">Applying Model &amp; Board Layout Options</p>
      </div>
    );
  }

  // LOCKED SCREEN: Shown when user is not logged in
  if (authChecked && !clientUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-teal-500/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-lg w-full bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500 to-rose-600 blur-lg opacity-60 animate-pulse" />
            <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-xl ring-4 ring-blue-500/30">
              <Lock className="w-9 h-9 text-white stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Authentication Required &bull; Everything Locked</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Examination Paper Editor is Locked
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              Please sign in with your educator account to customize questions, edit institution headers, and print examination papers.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-950/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="btn-editor-lock-login"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Unlock Paper Editor</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/pricing"
                className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>View Plans</span>
              </Link>
              <Link
                href="/select-questions"
                className="py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Question Bank</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-800 text-left">
              <span className="text-[11px] font-bold text-slate-400 block mb-2 text-center">
                ⚡ Instant 1-Click Sandbox Login:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth/client/subscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          planId: "standard",
                          email: "demo.teacher@paperwala.world",
                          fullName: "Professor Usman Khan",
                          academyName: "Apex Science Academy Lahore",
                        }),
                      });
                      const d = await res.json();
                      if (d.client) {
                        setClientUser(d.client);
                        if (d.client.academyName && d.client.subscription.canCustomBranding) {
                          setInstitutionName(d.client.academyName);
                        }
                        await loadEditorData();
                      }
                    } catch (e) {
                      console.error("Demo login failed", e);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-extrabold transition-all text-center cursor-pointer"
                >
                  Standard Plan Demo
                </button>

                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/auth/client/subscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          planId: "pay_as_you_go",
                          email: "payg.teacher@paperwala.world",
                          fullName: "Prof. Tariq Mahmood",
                          academyName: "Punjab Cadet College",
                        }),
                      });
                      const d = await res.json();
                      if (d.client) {
                        setClientUser(d.client);
                        await loadEditorData();
                      }
                    } catch (e) {
                      console.error("Demo login failed", e);
                    }
                  }}
                  className="p-2.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Go as you pay Demo (Rs. 30)
                </button>
              </div>
            </div>
          </div>
        </div>

        <ClientAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={async (user) => {
            setClientUser(user);
            setShowAuthModal(false);
            if (user.academyName && user.subscription.canCustomBranding) {
              setInstitutionName(user.academyName);
            }
            if (isPaidSubscriber(user)) {
              await loadEditorData();
            }
          }}
        />
      </div>
    );
  }

  // LOCKED PAYWALL SCREEN: Shown when user is logged in on a FREE account
  if (clientUser && !isPaidSubscriber(clientUser)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-rose-500/15 to-indigo-500/20 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-2xl w-full bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Paid Subscription Required to Print Papers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Examination Paper Printing is Locked
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              Logged in as <strong className="text-white">{clientUser.fullName}</strong> ({clientUser.email}) &bull; Current Status:{" "}
              <span className="text-amber-400 font-bold">{clientUser.subscription.planName}</span>. Free accounts cannot generate or export exam papers. Choose a plan below to unlock:
            </p>
          </div>

          <div className="max-w-lg mx-auto w-full">
            <div className="bg-slate-800/90 border-2 border-emerald-500 rounded-3xl p-6 flex flex-col justify-between shadow-2xl shadow-emerald-950/60 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                UNLIMITED PAPER PRINTING &amp; EXPORT
              </div>
              <div className="space-y-3 text-center pt-2">
                <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider">30 Days Full Access</span>
                <h3 className="font-extrabold text-white text-xl">Monthly Subscription</h3>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-slate-500 line-through text-base font-bold">Rs. 4,000</span>
                  <span className="text-3xl sm:text-4xl font-black text-white">Rs. 2,000</span>
                  <span className="text-xs font-semibold text-slate-400">/ month</span>
                  <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full ml-1">50% OFF</span>
                </div>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Print and export unlimited exam papers, answer keys, bubble sheets, and customize with your academy crest &amp; header.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubModalTitle("Subscribe to Monthly Plan (Rs. 2,000)");
                  setSubModalSubtitle("Enjoy 30 days of unlimited paper printing and exports with your academy branding.");
                  setSubModalHighlight("monthly");
                  setShowSubModal(true);
                }}
                className="mt-6 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>Subscribe Monthly (Rs. 2,000)</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800">
            <Link href="/pricing" className="text-amber-400 hover:underline font-bold flex items-center gap-1">
              <Crown className="w-4 h-4" />
              <span>View Full Pricing &amp; Comparison</span>
            </Link>
            <div className="flex items-center gap-2">
              {clientUser?.email?.toLowerCase() === "ali.khaliq50@gmail.com" && (
                <Link
                  href="/admin/users"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Open Admin Panel"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}
              <Link href="/" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors">
                Back to Home
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <SubscriptionModal
          isOpen={showSubModal}
          onClose={() => setShowSubModal(false)}
          onSuccess={(user) => {
            setClientUser(user);
            setShowSubModal(false);
          }}
          title={subModalTitle}
          subtitle={subModalSubtitle}
          highlightPlan={subModalHighlight}
        />
      </div>
    );
  }

  // =========================================================================
  // MAIN PAPER EDITOR & PREVIEW INTERFACE
  // =========================================================================

  return (
    <div
      onClick={() => setActiveDropdown(null)}
      className={`min-h-screen bg-slate-100/90 print:bg-white text-slate-900 font-sans pb-28 print:pb-0 selection:bg-emerald-500 selection:text-white ${
        entireContentBold ? "font-bold" : ""
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold border border-white/15 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          TOP 3D LIQUID GLASS PAPER STUDIO COMMAND BAR & RIBBON
          ========================================================================= */}
      <div
        className="no-print sticky top-0 z-40 flex flex-col bg-gradient-to-b from-white/85 via-white/75 to-white/85 backdrop-blur-2xl saturate-150 border-b border-white/90 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.12),0_4px_0_0_rgba(226,232,240,0.85),inset_0_2px_2px_0_#ffffff] px-3 sm:px-6 py-2.5 gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Specular Edge */}
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95"
          aria-hidden="true"
        />

        {/* Top Row: Brand, Version Selector, and Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
          {/* Left: Back & Editable Paper Title */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/select-questions"
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-2xs transition-all shrink-0"
              title="Back to Question Selector"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <BrandEmblem size="sm" />
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 leading-none mb-0.5 hidden sm:block">
                Live Paper Studio
              </div>
              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setPaperTitle(e.currentTarget.textContent || paperTitle)}
                className="text-sm sm:text-base font-black text-slate-900 truncate max-w-[180px] sm:max-w-[300px] outline-none hover:bg-white/80 px-1.5 py-0.5 rounded-lg cursor-text border border-transparent hover:border-slate-300"
              >
                {paperTitle}
              </div>
            </div>
          </div>

          {/* Center: Version Selector Pill */}
          <div className="flex items-center gap-1.5 bg-white/85 px-2.5 py-1 rounded-xl border border-slate-200/90 shadow-2xs">
            <label
              htmlFor="paperVersionSelector"
              className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap"
            >
              Version:
            </label>
            <select
              id="paperVersionSelector"
              value={paperVersion}
              onChange={(e) => setPaperVersion(e.target.value as "A" | "B" | "C" | "D")}
              className="h-7 font-black text-emerald-700 bg-transparent rounded-md px-1.5 text-xs cursor-pointer outline-none tabular-nums"
            >
              <option value="A">Version A (Code: {paperCodes.A})</option>
              <option value="B">Version B (Code: {paperCodes.B})</option>
              <option value="C">Version C (Code: {paperCodes.C})</option>
              <option value="D">Version D (Code: {paperCodes.D})</option>
            </select>
          </div>

          {/* Right: Studio Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/quick-paper"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white text-slate-700 hover:text-emerald-700 font-bold text-xs flex items-center gap-1 border border-slate-200/90 shadow-2xs transition-all"
              title="Create or Paste Instant Paper"
            >
              <span>⚡</span>
              <span className="hidden md:inline">Quick Paper</span>
            </Link>

            <Link
              href="/profile"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white text-slate-700 font-bold text-xs flex items-center gap-1 border border-slate-200/90 shadow-2xs transition-colors"
              title="Saved Papers Library"
            >
              <span>📂</span>
              <span className="hidden md:inline">Library</span>
            </Link>

            <button
              onClick={() => setIsSettingsDrawerOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/85 hover:bg-white text-slate-800 font-bold text-xs flex items-center gap-1 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
              id="btnOpenSettings"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={handleSaveFavorite}
              className="relative overflow-hidden px-3 py-1.5 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-600 hover:from-emerald-300 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1 border border-emerald-200/80 shadow-[0_3px_0_0_#065f46,0_6px_14px_-3px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              id="btnSaveFavorite"
            >
              <span>⭐</span>
              <span className="hidden sm:inline">Save Paper</span>
            </button>

            <button
              onClick={handleExportWord}
              disabled={isExportingDocx}
              className="relative overflow-hidden px-3 py-1.5 rounded-xl bg-gradient-to-b from-indigo-500 via-indigo-600 to-violet-700 hover:from-indigo-400 hover:to-violet-600 text-white font-extrabold text-xs flex items-center gap-1.5 border border-indigo-300/60 shadow-[0_3px_0_0_#312e81,inset_0_1px_1px_rgba(255,255,255,0.6)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
              title="Download editable Microsoft Word (.docx) file"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingDocx ? "Exporting..." : "Word (.docx)"}</span>
            </button>

            {/* Print 3D Split Button */}
            <div className="relative inline-flex" id="printOptionDropdown">
              <button
                onClick={() => handlePrint()}
                className="relative overflow-hidden px-3.5 py-1.5 rounded-l-xl bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-700 hover:from-blue-400 hover:to-indigo-600 text-white font-extrabold text-xs flex items-center gap-1.5 border border-blue-300/60 shadow-[0_3px_0_0_#1e3a8a,inset_0_1px_1px_rgba(255,255,255,0.6)] transition-all cursor-pointer"
                id="btnPrintNormal"
              >
                <span>🖨️</span>
                <span>Print PDF</span>
              </button>
              <button
                onClick={() => setActiveDropdown(activeDropdown === "print" ? null : "print")}
                className="px-2 py-1.5 rounded-r-xl bg-gradient-to-b from-blue-600 to-indigo-800 hover:from-blue-500 hover:to-indigo-700 text-white font-bold text-xs border-y border-r border-blue-300/60 border-l border-l-blue-400/50 shadow-[0_3px_0_0_#1e3a8a] transition-colors cursor-pointer"
                title="Print Options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {activeDropdown === "print" && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-2xl py-1.5 text-xs font-semibold z-50 animate-in fade-in">
                  <button
                    onClick={() => handlePrint("portrait")}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-slate-800"
                  >
                    <span>📄</span> Standard Portrait Print
                  </button>
                  <button
                    onClick={() => handlePrint("landscape_2up")}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 text-blue-700 flex items-center gap-2 cursor-pointer font-bold"
                  >
                    <span>📋</span> Landscape Side-by-Side (2-up)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            RESPONSIVE STUDIO CONFIGURATION RIBBON
            ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/5 border border-slate-200/80 rounded-2xl px-2.5 sm:px-3 py-1.5 text-xs">
          {/* Left Ribbon Group: Header Style, Language, Marks, Time, Date, Density */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full xl:w-auto">
            {/* Header Style Model Selector */}
            <select
              id="headerStyleSelect"
              value={headerStyle}
              onChange={(e) => updateHeaderStyle(e.target.value as "style1" | "style2")}
              className="h-8 px-2.5 rounded-lg border border-slate-300/90 font-bold text-slate-800 bg-white shadow-2xs outline-none focus:border-emerald-600 cursor-pointer text-[11px] sm:text-xs"
              title="Select Examination Header & Question Layout Model"
            >
              <option value="style1">Style 1: Punjab Boards</option>
              <option value="style2">Style 2: Federal Board (FBISE)</option>
            </select>

            {/* Language Mode Selector */}
            <select
              id="languageMode"
              value={languageMode}
              onChange={(e) => {
                const nextLang = e.target.value as "Bilingual" | "English" | "Urdu";
                setLanguageMode(nextLang);
                try {
                  sessionStorage.setItem("papermaker_language_mode", nextLang);
                } catch {
                  // ignore
                }
              }}
              className="h-8 px-2.5 rounded-lg border border-slate-300/90 font-bold text-slate-800 bg-white shadow-2xs outline-none focus:border-emerald-600 cursor-pointer text-[11px] sm:text-xs"
            >
              <option value="Bilingual">Bilingual (EN + UR)</option>
              <option value="English">English Only</option>
              <option value="Urdu">Urdu Only (اردو)</option>
            </select>

            {/* AI Bilingual Converter / Translator Dropdown */}
            <div className="relative">
              <button
                type="button"
                disabled={isAiTranslating}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "ai_translate" ? null : "ai_translate");
                }}
                className={`h-8 px-2.5 rounded-lg font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer border ${
                  !languageCoverage.isCompleteBilingual
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white border-emerald-400/60 shadow-sm"
                    : "bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 border-l-4 border-l-emerald-600"
                }`}
                title="Convert Paper Between English and Urdu using AI"
              >
                {isAiTranslating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Converting...</span>
                  </>
                ) : (
                  <>
                    <Languages className="w-3.5 h-3.5" />
                    <span>✨ AI EN↔UR</span>
                    {!languageCoverage.isCompleteBilingual && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-300 text-slate-950 text-[9px] font-black">
                        Convert
                      </span>
                    )}
                    <ChevronDown className="w-3 h-3 opacity-80" />
                  </>
                )}
              </button>

              {activeDropdown === "ai_translate" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto top-28 sm:top-full sm:mt-2 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in"
                >
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>AI Bilingual Paper Converter</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Automatically translate &amp; generate missing English or Urdu (Nastaliq) questions and MCQ options.
                      </p>
                    </div>
                  </div>

                  {/* Coverage Status Pill */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>English Questions Ready:</span>
                      <span className={languageCoverage.missingEnCount === 0 ? "text-emerald-600 font-black" : "text-amber-600 font-black"}>
                        {languageCoverage.total - languageCoverage.missingEnCount} / {languageCoverage.total}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>Urdu (اردو) Questions Ready:</span>
                      <span className={!languageCoverage.hasMissingUrdu ? "text-emerald-600 font-black" : "text-amber-600 font-black"}>
                        {languageCoverage.total - languageCoverage.missingUrCount} / {languageCoverage.total}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      disabled={isAiTranslating}
                      onClick={() => handleAiConvertLanguage("auto_both", "Bilingual", false)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-between shadow-sm transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Both (English + Urdu)</span>
                      </span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-black">Bilingual</span>
                    </button>

                    <button
                      type="button"
                      disabled={isAiTranslating}
                      onClick={() => handleAiConvertLanguage("en_to_ur", "Bilingual", true)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>🇵🇰 Convert English → Urdu (اردو)</span>
                      <span className="text-[10px] font-extrabold text-emerald-700">EN → UR</span>
                    </button>

                    <button
                      type="button"
                      disabled={isAiTranslating}
                      onClick={() => handleAiConvertLanguage("ur_to_en", "Bilingual", true)}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>🇬🇧 Convert Urdu → English</span>
                      <span className="text-[10px] font-extrabold text-indigo-700">UR → EN</span>
                    </button>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isAiTranslating}
                        onClick={() => handleAiConvertLanguage("en_to_ur", "Urdu", true)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] text-center transition-colors cursor-pointer"
                      >
                        Switch to Urdu Only
                      </button>
                      <button
                        type="button"
                        disabled={isAiTranslating}
                        onClick={() => handleAiConvertLanguage("ur_to_en", "English", true)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] text-center transition-colors cursor-pointer"
                      >
                        Switch to English Only
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-300/90 rounded-lg px-2 h-8 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Marks:</span>
              <input
                type="number"
                id="totalMarks"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                placeholder="75"
                title="Total Marks"
                className="w-12 font-black text-center bg-transparent outline-none tabular-nums text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1 bg-white border border-slate-300/90 rounded-lg px-2 h-8 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Time:</span>
              <input
                type="text"
                id="timeDuration"
                value={timeDuration}
                onChange={(e) => setTimeDuration(e.target.value)}
                placeholder="2:30"
                title="Time Duration"
                className="w-16 font-bold text-center bg-transparent outline-none text-slate-800"
              />
            </div>

            <input
              type="text"
              id="paperDate"
              value={paperDate}
              onChange={(e) => setPaperDate(e.target.value)}
              placeholder="Date"
              title="Paper Date"
              className="h-8 w-24 px-2 rounded-lg border border-slate-300/90 font-bold text-center bg-white shadow-2xs outline-none focus:border-emerald-600 hidden sm:block"
            />

            {/* Paper Size selector */}
            <div className="hidden md:flex items-center gap-1 bg-white border border-slate-300/90 rounded-lg px-2 h-8 shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <select
                value={paperSize}
                onChange={(e) => updatePaperSize(e.target.value as "a4" | "letter" | "legal")}
                className="font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                title="Paper print size"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
            </div>

            {/* 1 Test vs 2 Tests Layout Density Selector */}
            <div className="flex items-center rounded-lg border border-slate-300/90 bg-white p-0.5 shadow-2xs h-8">
              <button
                type="button"
                onClick={() => updateTestDensity("1_per_page")}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  testDensity === "1_per_page"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Single Test per page (Portrait)"
              >
                1 / Page
              </button>
              <button
                type="button"
                onClick={() => updateTestDensity("2_per_page")}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  testDensity === "2_per_page"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Two duplicate tests side-by-side on 1 Landscape sheet"
              >
                <Columns className="w-3 h-3" />
                <span>2 / Page</span>
              </button>
            </div>
          </div>

          {/* Right Ribbon Group: Popovers with viewport-safe anchoring */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 relative w-full xl:w-auto justify-start xl:justify-end pt-1 xl:pt-0 border-t xl:border-t-0 border-slate-200/60">
            {/* 1. Fonts & Sizing Popover */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "fonts" ? null : "fonts");
                }}
                className="h-8 px-2.5 rounded-lg bg-white border border-slate-300/90 border-l-4 border-l-blue-600 font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex items-center gap-1 cursor-pointer text-[11px] sm:text-xs"
              >
                <span>📐 Fonts ▾</span>
              </button>

              {activeDropdown === "fonts" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-28 sm:top-full sm:mt-2 sm:w-72 bg-white border border-slate-300 rounded-2xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in"
                >
                  <div className="font-bold text-slate-800 pb-1 border-b">Layout &amp; Font Sizing</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">MCQ Size (px)</label>
                      <input
                        type="number"
                        min="8"
                        max="22"
                        value={objFontSize}
                        onChange={(e) => setObjFontSize(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-300 rounded-lg text-center font-bold tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Subjective (px)</label>
                      <input
                        type="number"
                        min="8"
                        max="22"
                        value={subFontSize}
                        onChange={(e) => setSubFontSize(Number(e.target.value))}
                        className="w-full p-1.5 border border-slate-300 rounded-lg text-center font-bold tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-semibold text-slate-600">Logo Size ({logoSize}px)</label>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-semibold text-slate-600">Title Size ({instFontSize}px)</label>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="48"
                      value={instFontSize}
                      onChange={(e) => setInstFontSize(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Paper Code (4 Digits)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={currentPaperCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaperCodes((prev) => ({ ...prev, [paperVersion]: val }));
                      }}
                      className="w-full p-1.5 border border-slate-300 rounded-lg font-mono font-bold text-center tracking-widest text-base"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={boldHeadingsOnly}
                        onChange={(e) => setBoldHeadingsOnly(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span className="font-semibold text-slate-700">Bold Headings Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entireContentBold}
                        onChange={(e) => setEntireContentBold(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span className="font-semibold text-slate-700">Entire Content Bold</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Content Options Popover */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "content" ? null : "content");
                }}
                className="h-8 px-2.5 rounded-lg bg-white border border-slate-300/90 border-l-4 border-l-emerald-600 font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex items-center gap-1 cursor-pointer text-[11px] sm:text-xs"
              >
                <span>⚙️ Sections ▾</span>
              </button>

              {activeDropdown === "content" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-28 sm:top-full sm:mt-2 sm:w-72 bg-white border border-slate-300 rounded-2xl shadow-2xl p-4 text-xs space-y-2 z-50 max-h-[380px] overflow-y-auto animate-in fade-in"
                >
                  <div className="font-bold text-slate-800 pb-1 border-b">Display Sections &amp; Layout</div>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Show Header</span>
                    <input
                      type="checkbox"
                      checked={includeHeaderSection}
                      onChange={(e) => setIncludeHeaderSection(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Show Student Info</span>
                    <input
                      type="checkbox"
                      checked={includeStudentSection}
                      onChange={(e) => setIncludeStudentSection(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Use Board Headings</span>
                    <input
                      type="checkbox"
                      checked={useBoardHeadings}
                      onChange={(e) => setUseBoardHeadings(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Include MCQs</span>
                    <input
                      type="checkbox"
                      checked={includeMcqs}
                      onChange={(e) => setIncludeMcqs(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Include Short Qs</span>
                    <input
                      type="checkbox"
                      checked={includeShort}
                      onChange={(e) => setIncludeShort(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Include Long Qs</span>
                    <input
                      type="checkbox"
                      checked={includeLong}
                      onChange={(e) => setIncludeLong(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Include Bubble Sheet</span>
                    <input
                      type="checkbox"
                      checked={includeBubbleSheet}
                      onChange={(e) => setIncludeBubbleSheet(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Include Answer Key</span>
                    <input
                      type="checkbox"
                      checked={includeMcqAnswerKey}
                      onChange={(e) => setIncludeMcqAnswerKey(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Include Watermark</span>
                    <input
                      type="checkbox"
                      checked={includeWatermark}
                      onChange={(e) => setIncludeWatermark(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Include Stylish Border</span>
                    <input
                      type="checkbox"
                      checked={includePaperBorder}
                      onChange={(e) => setIncludePaperBorder(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Separate Subjective Page</span>
                    <input
                      type="checkbox"
                      checked={printShortLongSeparatePage}
                      onChange={(e) => setPrintShortLongSeparatePage(e.target.checked)}
                      className="accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="font-semibold text-slate-700">Auto 2-up Duplication</span>
                    <input
                      type="checkbox"
                      checked={enableAutoDuplication || testDensity === "2_per_page"}
                      onChange={(e) => {
                        setEnableAutoDuplication(e.target.checked);
                        updateTestDensity(e.target.checked ? "2_per_page" : "1_per_page");
                      }}
                      className="accent-blue-600"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* 3. Profile Popover */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "profile" ? null : "profile");
                }}
                className="h-8 px-2.5 rounded-lg bg-white border border-slate-300/90 border-l-4 border-l-amber-500 font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex items-center gap-1 cursor-pointer text-[11px] sm:text-xs"
              >
                <span>🏛️ Branding ▾</span>
              </button>

              {activeDropdown === "profile" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-28 sm:top-full sm:mt-2 sm:w-80 bg-white border border-slate-300 rounded-2xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in"
                >
                  <div className="font-bold text-slate-800 pb-1 border-b flex items-center justify-between">
                    <span>Institution Header &amp; Watermark</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Institution Name</label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="Your Institution"
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Logo / Academic Crest</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const crest = generatePaperWalaCrestDataUrl();
                          if (crest) {
                            setLogoBase64(crest);
                            localStorage.setItem("paperwala_logo", crest);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10.5px] font-extrabold cursor-pointer transition-colors"
                      >
                        ✨ Use Official PaperWala Crest
                      </button>
                      {logoBase64 && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoBase64(null);
                            localStorage.removeItem("paperwala_logo");
                          }}
                          className="text-[10.5px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear Logo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <label className="font-semibold text-slate-700 block mb-1">Custom Banner (6:1 to 8:1)</label>
                    <div className="flex items-center gap-2 mb-1.5">
                      <input
                        type="checkbox"
                        checked={useCustomHeaderImage}
                        onChange={(e) => setUseCustomHeaderImage(e.target.checked)}
                        className="accent-blue-600"
                        id="ribbon-use-custom-banner"
                      />
                      <label htmlFor="ribbon-use-custom-banner" className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                        Enable Custom Banner
                      </label>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomHeaderUpload}
                      className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-500">Width:</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={customHeaderWidth}
                        onChange={(e) => setCustomHeaderWidth(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                      <span className="text-[10px] font-bold">{customHeaderWidth}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <label className="font-semibold text-slate-700 block mb-1">Watermark Settings</label>
                    <div className="flex items-center gap-4 mb-2">
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                        <input
                          type="radio"
                          name="wmType"
                          value="text"
                          checked={watermarkType === "text"}
                          onChange={() => setWatermarkType("text")}
                          className="accent-blue-600"
                        />
                        <span>Text</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                        <input
                          type="radio"
                          name="wmType"
                          value="image"
                          checked={watermarkType === "image"}
                          onChange={() => setWatermarkType("image")}
                          className="accent-blue-600"
                        />
                        <span>Image / Logo</span>
                      </label>
                    </div>

                    {watermarkType === "image" && (
                      <div className="space-y-1.5 mb-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleWatermarkUpload}
                          className="w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-100 cursor-pointer"
                        />
                        <div className="flex gap-2">
                          {logoBase64 && (
                            <button
                              onClick={() => {
                                setWatermarkImageBase64(logoBase64);
                                setWatermarkType("image");
                                setIncludeWatermark(true);
                              }}
                              className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded hover:bg-blue-200 cursor-pointer"
                            >
                              Use Header Logo
                            </button>
                          )}
                          {watermarkImageBase64 && (
                            <button
                              onClick={() => setWatermarkImageBase64(null)}
                              className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded hover:bg-rose-200 cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>Watermark Opacity:</span>
                        <span className="font-bold">{watermarkOpacity}</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.5"
                        step="0.01"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Instructions Popover */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === "inst" ? null : "inst");
                }}
                className="h-8 px-2.5 rounded-lg bg-white border border-slate-300/90 border-l-4 border-l-purple-600 font-bold text-slate-800 shadow-2xs hover:bg-slate-50 flex items-center gap-1 cursor-pointer text-[11px] sm:text-xs"
              >
                <span>📋 Notes ▾</span>
              </button>

              {activeDropdown === "inst" && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-28 sm:top-full sm:mt-2 sm:w-80 bg-white border border-slate-300 rounded-2xl shadow-2xl p-4 text-xs space-y-3 z-50 animate-in fade-in"
                >
                  <div className="font-bold text-slate-800 pb-1 border-b flex items-center justify-between">
                    <span>Note &amp; Instructions</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeInstructions}
                        onChange={(e) => setIncludeInstructions(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span className="font-bold text-blue-700">Enable Notes</span>
                    </label>
                  </div>

                  <select
                    onChange={(e) => handleInstructionPresetChange(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white cursor-pointer"
                  >
                    <option value="">-- Quick Notes Presets --</option>
                    <option value="english_default">English Instruction</option>
                    <option value="urdu_default">Urdu Instruction</option>
                    <option value="bilingual_default">Bilingual Instruction</option>
                  </select>

                  <textarea
                    rows={3}
                    value={instructionText}
                    onChange={(e) => setInstructionText(e.target.value)}
                    placeholder="Note text..."
                    className="w-full p-2 border border-slate-300 rounded-lg text-[11px] leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveDropdown(null)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SETTINGS SLIDE-OUT DRAWER / MODAL
          ========================================================================= */}
      {isSettingsDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in"
          onClick={() => setIsSettingsDrawerOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">Paper Settings &amp; Layout</h3>
              </div>
              <button
                onClick={() => setIsSettingsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-bold bg-white overflow-x-auto">
              <button
                onClick={() => setSettingsTab("general")}
                className={`py-2.5 px-3 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  settingsTab === "general" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Header &amp; Style
              </button>
              <button
                onClick={() => setSettingsTab("fonts")}
                className={`py-2.5 px-3 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  settingsTab === "fonts" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Fonts &amp; Sizes
              </button>
              <button
                onClick={() => setSettingsTab("content")}
                className={`py-2.5 px-3 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  settingsTab === "content" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Sections
              </button>
              <button
                onClick={() => setSettingsTab("watermark")}
                className={`py-2.5 px-3 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  settingsTab === "watermark" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                Watermark &amp; Border
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
              {settingsTab === "general" && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Header Design Style</label>
                    <select
                      value={headerStyle}
                      onChange={(e) => updateHeaderStyle(e.target.value as "style1" | "style2")}
                      className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-blue-700 bg-white"
                    >
                      <option value="style1">Style 1: Punjab Boards (Default)</option>
                      <option value="style2">Style 2: Federal Board (FBISE)</option>
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Federal Board format switches MCQs &amp; short questions to authentic FBISE table grid with OMR bubbles.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Institution Name</label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Examination Title</label>
                    <input
                      type="text"
                      value={paperTypeBanner}
                      onChange={(e) => setPaperTypeBanner(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Syllabus Details</label>
                    <input
                      type="text"
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Institution Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {settingsTab === "fonts" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">MCQ Font Size (px)</label>
                      <input
                        type="number"
                        min="8"
                        max="22"
                        value={objFontSize}
                        onChange={(e) => setObjFontSize(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded-lg font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Subjective Size (px)</label>
                      <input
                        type="number"
                        min="8"
                        max="22"
                        value={subFontSize}
                        onChange={(e) => setSubFontSize(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded-lg font-bold text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Logo Size ({logoSize}px)</label>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Institution Title Size ({instFontSize}px)</label>
                    <input
                      type="range"
                      min="14"
                      max="48"
                      value={instFontSize}
                      onChange={(e) => setInstFontSize(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Paper Code ({paperVersion})</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={currentPaperCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaperCodes((prev) => ({ ...prev, [paperVersion]: val }));
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-center text-lg tracking-widest"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={boldHeadingsOnly}
                        onChange={(e) => setBoldHeadingsOnly(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span className="font-bold text-slate-700">Bold Headings Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={entireContentBold}
                        onChange={(e) => setEntireContentBold(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span className="font-bold text-slate-700">Entire Content Bold</span>
                    </label>
                  </div>
                </div>
              )}

              {settingsTab === "content" && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-700 pb-1 border-b">Toggle Questions &amp; Components</div>
                  {[
                    { label: "Show Header Section", checked: includeHeaderSection, set: setIncludeHeaderSection },
                    { label: "Show Student Details Table", checked: includeStudentSection, set: setIncludeStudentSection },
                    { label: "Use Official Board Headings", checked: useBoardHeadings, set: setUseBoardHeadings },
                    { label: "Include Objective MCQs", checked: includeMcqs, set: setIncludeMcqs },
                    { label: "Include Short Questions", checked: includeShort, set: setIncludeShort },
                    { label: "Include Long Questions", checked: includeLong, set: setIncludeLong },
                    { label: "Include OMR Bubble Sheet", checked: includeBubbleSheet, set: setIncludeBubbleSheet },
                    { label: "Include MCQ Answer Key", checked: includeMcqAnswerKey, set: setIncludeMcqAnswerKey },
                    { label: "Separate Subjective on New Page", checked: printShortLongSeparatePage, set: setPrintShortLongSeparatePage },
                    {
                      label: "Auto 2-up Duplication (Half Page)",
                      checked: testDensity === "2_per_page" || enableAutoDuplication,
                      set: (val: boolean) => {
                        setEnableAutoDuplication(val);
                        updateTestDensity(val ? "2_per_page" : "1_per_page");
                      },
                    },
                  ].map((item, idx) => (
                    <label key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.set(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                    </label>
                  ))}
                </div>
              )}

              {settingsTab === "watermark" && (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeWatermark}
                        onChange={(e) => setIncludeWatermark(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="font-bold text-slate-800">Enable Background Watermark</span>
                    </label>
                  </div>

                  {includeWatermark && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="drawerWmType"
                            checked={watermarkType === "text"}
                            onChange={() => setWatermarkType("text")}
                            className="accent-blue-600"
                          />
                          <span>Text Watermark</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                          <input
                            type="radio"
                            name="drawerWmType"
                            checked={watermarkType === "image"}
                            onChange={() => setWatermarkType("image")}
                            className="accent-blue-600"
                          />
                          <span>Image / Crest</span>
                        </label>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-600 block mb-1">
                          Watermark Opacity ({watermarkOpacity})
                        </label>
                        <input
                          type="range"
                          min="0.05"
                          max="0.5"
                          step="0.01"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePaperBorder}
                        onChange={(e) => setIncludePaperBorder(e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="font-bold text-slate-800">Include Stylish Double Page Border</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1 pl-6">
                      Adds an authentic examination decorative border that frames the paper on every page.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setIsSettingsDrawerOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Apply &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          THE AUTHENTIC EXAMINATION PAPER SHEET (A4 / Letter / Legal Print Layout)
          ========================================================================= */}
      {(() => {
        const is2Up = testDensity === "2_per_page";
        const renderExamPaperSheet = (copyIndex = 1) => (
          <div
            id={copyIndex === 1 ? "paper-outer-container" : `paper-outer-container-copy-${copyIndex}`}
            className={`paper-sheet bg-white relative ${
              includePaperBorder ? "border-none" : "border-2 border-black"
            } ${
              is2Up
                ? "compact-2up p-2.5 sm:p-3 text-[9.5px] space-y-1.5 shadow-md"
                : "p-3 sm:p-6 md:p-8 text-black space-y-3 sm:space-y-3.5 shadow-xl"
            } leading-tight`}
          >
            {/* Stylish Page Border Frame */}
            {includePaperBorder && (
              <div className="page-frame" />
            )}

            {/* Background Watermark */}
            {includeWatermark && (
              <div className="watermark-container print-fixed">
                {watermarkType === "image" && (watermarkImageBase64 || logoBase64) ? (
                  <img
                    src={watermarkImageBase64 || logoBase64 || ""}
                    alt="Watermark"
                    className="watermark-img"
                    style={{ opacity: watermarkOpacity }}
                  />
                ) : (
                  <div className="watermark-text" style={{ opacity: watermarkOpacity }}>
                    {institutionName || "EXAMINATION"}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================
                HEADER SECTION (Style 1: Punjab Boards / Style 2: Federal Board / Custom Banner)
                =================================================================== */}
            {includeHeaderSection && (
              <div>
                {/* 1. Custom Banner Option */}
                {useCustomHeaderImage && customHeaderImage ? (
                  <div className="custom-header-container">
                    <img
                      src={customHeaderImage}
                      alt="Custom Banner"
                      className="custom-header-img-rendered border border-black"
                      style={{ width: `${customHeaderWidth}%` }}
                    />
                  </div>
                ) : headerStyle === "style2" ? (
                  /* 2. Federal Board (FBISE) Header Layout */
                  <div className="border-2 border-black bg-white mb-0 p-2 text-center space-y-1.5 font-sans">
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between border-b border-black pb-1.5 gap-2">
                      {/* Left: FBISE Logo or Crest */}
                      <div className="w-12 sm:w-20 flex items-center justify-center shrink-0">
                        {logoBase64 ? (
                          <img
                            src={logoBase64}
                            alt="Logo"
                            style={{ height: `${Math.min(logoSize, 56)}px`, maxWidth: "100px", objectFit: "contain" }}
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 border border-black rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs bg-slate-50">
                            FBISE
                          </div>
                        )}
                      </div>

                      {/* Center: FBISE Official Title & Institution Name */}
                      <div className="flex-1 min-w-[160px] text-center px-1 sm:px-2">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => setInstitutionName(e.currentTarget.textContent || institutionName)}
                          style={{ fontSize: `${is2Up ? Math.min(instFontSize, 15) : instFontSize}px` }}
                          className="font-black text-slate-900 uppercase tracking-tight outline-none leading-tight"
                        >
                          {institutionName}
                        </div>
                        <div className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-slate-700">
                          FEDERAL BOARD OF INTERMEDIATE &amp; SECONDARY EDUCATION
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600">
                          {paperTypeBanner} &bull; {subjectTitle} (Class: {classNameText})
                        </div>
                      </div>

                      {/* Right: Candidate Registration / Version Code */}
                      <div className="w-20 sm:w-24 border border-black p-1 text-center bg-slate-50 shrink-0 ml-auto sm:ml-0">
                        <div className="text-[8px] sm:text-[9px] font-bold uppercase mb-0.5">VERSION CODE</div>
                        <div className="text-xs sm:text-sm font-black font-mono tracking-widest text-blue-900">
                          {currentPaperCode}
                        </div>
                        <div className="text-[8px] font-semibold text-slate-500 mt-0.5">VERSION {paperVersion}</div>
                      </div>
                    </div>

                    {/* Federal Board Candidate Fill Grid */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] font-bold text-left pt-0.5">
                      <div className="flex items-center gap-1">
                        <span>Roll No:</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 6 }).map((_, rIdx) => (
                            <div key={rIdx} className="w-3.5 sm:w-4 h-4 sm:h-5 border border-black text-center" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <span>Total Marks: {totalMarks}</span>
                        <span>Time: {timeDuration}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 3. Punjab Boards (Default Style 1) Header Layout */
                  <div
                    style={{
                      border: "2px solid #000",
                      display: "flex",
                      alignItems: "stretch",
                      width: "100%",
                      marginBottom: "0px",
                      background: "#fff",
                      boxSizing: "border-box",
                      lineHeight: "1.2",
                    }}
                  >
                    {/* Left Logo Box */}
                    {logoBase64 && (
                      <div
                        className="shrink-0 flex items-center justify-center bg-white border-r-2 border-black p-0.5 sm:p-1"
                        style={{
                          width: is2Up ? `${Math.min(logoSize, 36) + 6}px` : `clamp(48px, 14vw, ${logoSize + 10}px)`,
                        }}
                      >
                        <img
                          src={logoBase64}
                          alt="Logo"
                          style={{
                            maxHeight: `${is2Up ? Math.min(logoSize, 36) : logoSize}px`,
                            width: "100%",
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </div>
                    )}

                    {/* Middle Content Box */}
                    <div
                      style={{
                        flexGrow: 1,
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        textAlign: "center",
                        borderRight: includePaperCode ? "2px solid #000" : "none",
                      }}
                    >
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setInstitutionName(e.currentTarget.textContent || institutionName)}
                        style={{
                          fontSize: is2Up ? `${Math.min(instFontSize, 15)}px` : `clamp(13px, 3.8vw, ${instFontSize}px)`,
                          fontWeight: 800,
                          color: "#1a365d",
                          padding: is2Up ? "3px 2px 2px 2px" : "5px 4px 3px 4px",
                          textTransform: "uppercase",
                          outline: "none",
                          wordBreak: "break-word",
                        }}
                      >
                        {institutionName}
                      </div>

                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setPaperTypeBanner(e.currentTarget.textContent || paperTypeBanner)}
                        style={{
                          backgroundColor: "#1a365d",
                          color: "#ffffff",
                          fontWeight: "bold",
                          fontSize: is2Up ? "10px" : "clamp(10px, 2.6vw, 12px)",
                          padding: is2Up ? "1px 4px" : "2px 6px",
                          borderTop: "1px solid #000",
                          borderBottom: "1px solid #000",
                          textAlign: "center",
                          outline: "none",
                        }}
                      >
                        {paperTypeBanner}
                      </div>

                      <div
                        style={{
                          fontSize: is2Up ? "10px" : "clamp(10px, 2.6vw, 12px)",
                          fontWeight: "bold",
                          padding: is2Up ? "1px 2px" : "2px 4px",
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: is2Up ? "6px" : "10px",
                          color: "#000",
                        }}
                      >
                        <span>
                          Subject:{" "}
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setSubjectTitle(e.currentTarget.textContent || subjectTitle)}
                            className="outline-none"
                          >
                            {subjectTitle}
                          </span>
                        </span>
                        <span>|</span>
                        <span>
                          Class:{" "}
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setClassNameText(e.currentTarget.textContent || classNameText)}
                            className="outline-none"
                          >
                            {classNameText}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Right Paper Code Box */}
                    {includePaperCode && (
                      <div
                        className="shrink-0 flex items-center justify-center bg-white p-0.5 sm:p-1"
                        style={{
                          width: is2Up ? "78px" : "clamp(74px, 20vw, 110px)",
                        }}
                      >
                        <div className="text-center">
                          <div
                            style={{
                              fontSize: is2Up ? "8px" : "clamp(8px, 2vw, 10px)",
                              marginBottom: is2Up ? "2px" : "3px",
                            }}
                            className="font-bold uppercase tracking-tight text-center"
                          >
                            PAPER CODE
                          </div>
                          <div className="flex justify-center gap-0.5">
                            {currentPaperCode.split("").map((digit, dIdx) => (
                              <div
                                key={dIdx}
                                style={{
                                  width: is2Up ? "14px" : "clamp(15px, 4vw, 20px)",
                                  height: is2Up ? "18px" : "clamp(19px, 5vw, 24px)",
                                  border: "1.5px solid #000",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                  fontFamily: "Arial",
                                  fontSize: is2Up ? "10.5px" : "clamp(11px, 3vw, 14px)",
                                }}
                              >
                                {digit}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================
                STUDENT DETAILS TABLE (Exact layout from reference)
                =================================================================== */}
            {includeStudentSection && (
              <table
                className="paper-table"
                dir="ltr"
                style={{
                  width: "100%",
                  border: "2px solid #000",
                  borderTop: includeHeaderSection ? "none" : "2px solid #000",
                  borderCollapse: "collapse",
                  fontWeight: "bold",
                  marginTop: 0,
                  marginBottom: 0,
                  fontSize: is2Up ? "9.5px" : "13px",
                  direction: "ltr",
                }}
              >
                <tbody>
                  <tr style={{ borderBottom: "1px solid #000", height: is2Up ? "21px" : "26px" }}>
                    <td
                      style={{
                        borderRight: "1px solid #000",
                        padding: is2Up ? "1px 3px" : "2px 4px",
                        width: "15%",
                        background: "#f8f9fa",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span>Student Name:</span>
                    </td>
                    <td
                      style={{
                        borderRight: "2px solid #000",
                        padding: is2Up ? "1px 3px" : "2px 4px",
                        width: "35%",
                        background: "#fff",
                      }}
                      contentEditable
                      suppressContentEditableWarning
                    />
                    <td
                      style={{
                        borderRight: "1px solid #000",
                        padding: is2Up ? "1px 3px" : "2px 4px",
                        width: "15%",
                        background: "#fff3e0",
                        textAlign: "left",
                        color: "#e65100",
                      }}
                    >
                      <span>Syllabus:</span>
                    </td>
                    <td
                      style={{
                        padding: is2Up ? "1px 3px" : "2px 4px",
                        width: "35%",
                        background: "#fff",
                        textAlign: "left",
                        color: "#333",
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setSyllabusText(e.currentTarget.textContent || syllabusText)}
                    >
                      {syllabusText}
                    </td>
                  </tr>

                  <tr style={{ backgroundColor: "#e3f2fd", height: is2Up ? "21px" : "auto", minHeight: "26px" }}>
                    <td colSpan={4} style={{ padding: is2Up ? "1px 2px" : "3px 4px", textAlign: "center", color: "#0d47a1" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          alignItems: "center",
                          gap: is2Up ? "4px" : "8px",
                          fontSize: is2Up ? "9.5px" : "clamp(10.5px, 2.7vw, 13px)",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", gap: is2Up ? "2px" : "4px" }}>
                          <span>Roll No:</span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            style={{ minWidth: is2Up ? "30px" : "50px", borderBottom: "1px dotted #0d47a1" }}
                          />
                        </div>
                        <div>
                          <span>Time: </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setTimeDuration(e.currentTarget.textContent || timeDuration)}
                          >
                            {timeDuration}
                          </span>
                        </div>
                        <div>
                          <span>Marks: </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setTotalMarks(Number(e.currentTarget.textContent) || totalMarks)}
                          >
                            {totalMarks}
                          </span>
                        </div>
                        <div>
                          <span>Date: </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setPaperDate(e.currentTarget.textContent || paperDate)}
                          >
                            {paperDate}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: is2Up ? "2px" : "4px" }}>
                          <span>Test No.: </span>
                          <span
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => setTestNoText(e.currentTarget.textContent || "")}
                            style={{ minWidth: is2Up ? "25px" : "40px", borderBottom: "1px dotted #0d47a1" }}
                          >
                            {testNoText}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* ===================================================================
                INSTRUCTION NOTE (High contrast soft-green badge matching reference)
                =================================================================== */}
            {includeInstructions && (
              <div
                className={`instructions-panel ${is2Up ? "py-0.5 text-[9.5px]" : "py-1 text-xs"}`}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setInstructionText(e.currentTarget.textContent || instructionText)}
              >
                <div className="flex flex-col gap-1.5">
                  <div className="text-left flex items-start leading-snug">
                    <span className="bg-[#d4efdf] text-[#196f3d] px-1.5 py-0.5 rounded text-[11px] font-bold mr-1.5 shrink-0">
                      Note:
                    </span>
                    <span className="text-slate-800 font-medium">{instructionText}</span>
                  </div>
                  {languageMode === "Bilingual" && (
                    <div className="text-right flex items-start justify-end leading-relaxed font-urdu" dir="rtl">
                      <span className="bg-[#d4efdf] text-[#196f3d] px-1.5 py-0.5 rounded text-[10px] font-bold ml-1.5 shrink-0 font-sans">
                        نوٹ:
                      </span>
                      <span className="text-slate-800 text-[11px]">{defaultUrduInstruction}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================================
                OBJECTIVE SECTION (MCQs)
                =================================================================== */}
            {includeMcqs && displayedMcqs.length > 0 && (
              <div className="objective-section pt-1" style={{ fontSize: `${is2Up ? Math.min(objFontSize, 10) : objFontSize}px` }}>
                {/* Section Header */}
                <div className={`border-b-2 border-black pb-0.5 mb-1 flex items-center justify-between font-black uppercase tracking-wider ${is2Up ? "text-[11px]" : "text-xs sm:text-sm"}`}>
                  <div className="flex items-center gap-2">
                    <span>SECTION-I</span>
                    {languageMode === "Bilingual" && (
                      <span className="font-urdu text-sm font-bold text-slate-800">حصہ اول</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    [ Marks: {effectiveMcqMarks} ]
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700 font-semibold px-1 mb-1.5">
                  <span className="italic">
                    <strong>Q. 1:</strong> Choose the correct answer from the following.
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">
                    (Marks: {effectiveMcqMarks})
                  </span>
                </div>

                {/* Compact OMR Bubble Sheet Grid */}
                {includeBubbleSheet && (
                  <div className="bubble-sheet-container mb-2">
                    <table className="bubble-sheet-table">
                      <tbody>
                        {Array.from({ length: Math.ceil(displayedMcqs.length / 5) }).map((_, rIdx) => (
                          <tr key={rIdx}>
                            {Array.from({ length: 5 }).map((_, cIdx) => {
                              const qIdx = rIdx * 5 + cIdx;
                              if (qIdx < displayedMcqs.length) {
                                const qNum = (qIdx + 1).toString().padStart(2, "0");
                                return (
                                  <td key={cIdx}>
                                    <span className="q-num-bubble">{qNum}.</span>
                                    <span className="bubble-circle">A</span>
                                    <span className="bubble-circle">B</span>
                                    <span className="bubble-circle">C</span>
                                    <span className="bubble-circle">D</span>
                                  </td>
                                );
                              }
                              return <td key={cIdx} />;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* MCQs Rendering: Federal Board Table vs Punjab Board Standard */}
                {headerStyle === "style2" ? (
                  /* --- STYLE 2: FEDERAL BOARD TABLE (.fb-table) --- */
                  <table className="fb-table">
                    <thead className="bg-[#f2f2f2]">
                      <tr>
                        {languageMode === "Bilingual" ? (
                          <>
                            <th className="w-[24%] text-left">Question</th>
                            <th className="w-[24%] text-right font-urdu" dir="rtl">سوال</th>
                          </>
                        ) : (
                          <th className="w-[48%] text-left">
                            {languageMode === "Urdu" ? "سوال" : "Question"}
                          </th>
                        )}
                        <th className="w-[10%] text-center">A</th>
                        <th className="w-[10%] text-center">B</th>
                        <th className="w-[10%] text-center">C</th>
                        <th className="w-[10%] text-center">D</th>
                        <th className="w-[3%] text-center">A</th>
                        <th className="w-[3%] text-center">B</th>
                        <th className="w-[3%] text-center">C</th>
                        <th className="w-[3%] text-center">D</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedMcqs.map((mcq, idx) => {
                        const enTrans = mcq.translations?.find((t) => t.language === "en");
                        const urTrans = mcq.translations?.find((t) => t.language === "ur");
                        const dynamicUr = getUrduTranslation(enTrans?.text || "", enTrans?.options);

                        const enQ = cleanQuestionText(enTrans?.text || "");
                        const urQ = cleanQuestionText(urTrans?.text || dynamicUr.text_ur || "");
                        const enOpts = enTrans?.options || [];
                        const urOpts = urTrans?.options || dynamicUr.options_ur || [];

                        return (
                          <tr key={mcq.id}>
                            {languageMode === "Bilingual" ? (
                              <>
                                <td className="text-left font-bold">
                                  <span>{idx + 1}. </span>
                                  <MathRenderer content={enQ} />
                                </td>
                                <td className="text-right font-urdu font-bold" dir="rtl">
                                  <span>{idx + 1}. </span>
                                  <MathRenderer content={urQ} />
                                </td>
                              </>
                            ) : languageMode === "Urdu" ? (
                              <td className="text-right font-urdu font-bold" dir="rtl">
                                <span>{idx + 1}. </span>
                                <MathRenderer content={urQ || enQ} />
                              </td>
                            ) : (
                              <td className="text-left font-bold">
                                <span>{idx + 1}. </span>
                                <MathRenderer content={enQ} />
                              </td>
                            )}

                            {/* 4 Option Cells */}
                            {[0, 1, 2, 3].map((optIdx) => (
                              <td key={optIdx} className="text-center align-middle">
                                <div>
                                  {languageMode !== "Urdu" && (
                                    <MathRenderer content={enOpts[optIdx] || urOpts[optIdx] || ""} />
                                  )}
                                  {languageMode === "Urdu" && (
                                    <div className="font-urdu text-[0.95em]" dir="rtl">
                                      <MathRenderer content={urOpts[optIdx] || enOpts[optIdx] || ""} />
                                    </div>
                                  )}
                                  {languageMode === "Bilingual" && urOpts[optIdx] && (
                                    <div className="font-urdu text-[0.85em]" dir="rtl">
                                      <MathRenderer content={urOpts[optIdx]} />
                                    </div>
                                  )}
                                </div>
                              </td>
                            ))}

                            {/* 4 Bubble Circles */}
                            {[0, 1, 2, 3].map((bIdx) => (
                              <td key={bIdx} className="text-center align-middle">
                                <span className="bubble-circle" />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  /* --- STYLE 1: PUNJAB BOARDS STANDARD LAYOUT --- */
                  <div className={is2Up ? "space-y-1 pt-0.5" : "space-y-2 pt-1"}>
                    {displayedMcqs.map((q, idx) => {
                      const enTrans = q.translations?.find((t) => t.language === "en");
                      const urTrans = q.translations?.find((t) => t.language === "ur");
                      const dynamicUr = getUrduTranslation(enTrans?.text || "", enTrans?.options);

                      const enQ = cleanQuestionText(enTrans?.text || "");
                      const urQ = cleanQuestionText(urTrans?.text || dynamicUr.text_ur || "");
                      const enOpts = enTrans?.options || [];
                      const urOpts = urTrans?.options || dynamicUr.options_ur || [];

                      return (
                        <div key={q.id} className="group relative p-1 hover:bg-slate-50/80 rounded transition-colors">
                          {/* Question Action Toolbar */}
                          <div className="no-print absolute top-0 right-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-1 bg-white/95 border border-slate-300 rounded shadow-xs px-1.5 py-0.5 z-10 transition-opacity">
                            <button
                              onClick={() => handleTranslateSingleQuestion(q.id)}
                              disabled={translatingQuestionId === q.id}
                              className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded text-[9.5px] font-extrabold cursor-pointer disabled:opacity-50"
                              title="AI Translate Question (English ↔ Urdu)"
                            >
                              {translatingQuestionId === q.id ? "⏳..." : "✨ EN↔UR"}
                            </button>
                            <button
                              onClick={() => handleSwapQuestion(q.id, "mcq")}
                              className="text-teal-600 hover:text-teal-800 p-0.5 cursor-pointer"
                              title="Swap MCQ"
                            >
                              <Shuffle className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer"
                              title="Delete MCQ"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Question Text */}
                          {languageMode === "Urdu" ? (
                            <div
                              className={`flex items-start justify-end gap-1.5 font-bold font-urdu text-right ${
                                is2Up ? "leading-tight text-xs" : "leading-normal text-sm"
                              }`}
                              dir="rtl"
                            >
                              <span>{idx + 1}.</span>
                              <span className="flex-1 text-right">
                                <MathRenderer content={urQ || enQ} />
                              </span>
                            </div>
                          ) : (
                            <div className={`flex items-start gap-1 font-bold ${is2Up ? "leading-tight text-[10px]" : "leading-normal"}`}>
                              <span>{idx + 1}.</span>
                              <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                                <span>
                                  <MathRenderer content={enQ || urQ} />
                                </span>
                                {languageMode === "Bilingual" && urQ && (
                                  <span className={`font-urdu text-right pr-2 text-slate-800 ${is2Up ? "text-xs" : "text-sm"}`} dir="rtl">
                                    <MathRenderer content={urQ} />
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Options Grid */}
                          {(enOpts.length > 0 || urOpts.length > 0) && (
                            <div
                              className={`flex flex-wrap items-baseline justify-between gap-1 pt-0.5 ${
                                is2Up ? "pl-2 text-[9.5px]" : "pl-4 text-xs"
                              } ${languageMode === "Urdu" ? "font-urdu text-right" : ""}`}
                              dir={languageMode === "Urdu" ? "rtl" : "ltr"}
                            >
                              {[0, 1, 2, 3].map((optIdx) => {
                                const letter = String.fromCharCode(65 + optIdx);
                                const optEn = enOpts[optIdx] || "";
                                const optUr = urOpts[optIdx] || "";

                                return (
                                  <div key={optIdx} className="flex items-baseline gap-1 min-w-[22%]">
                                    <span className="font-bold font-sans">({letter})</span>
                                    {languageMode === "Urdu" ? (
                                      <span className="font-urdu text-right" dir="rtl">
                                        <MathRenderer content={optUr || optEn} />
                                      </span>
                                    ) : (
                                      <>
                                        <span>
                                          <MathRenderer content={optEn || optUr} />
                                        </span>
                                        {languageMode === "Bilingual" && optUr && (
                                          <span className="font-urdu text-[11px] text-slate-700 pr-1" dir="rtl">
                                            <MathRenderer content={optUr} />
                                          </span>
                                        )}
                                      </>
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
                )}
              </div>
            )}

            {/* ===================================================================
                SUBJECTIVE SECTION (Short & Long Questions)
                =================================================================== */}
            {(includeShort || includeLong) && (shorts.length > 0 || longs.length > 0) && (
              <div
                className={`subjective-section ${is2Up ? "pt-1.5" : "pt-3"} ${
                  printShortLongSeparatePage ? "page-break" : ""
                }`}
                style={{
                  fontSize: `${is2Up ? Math.min(subFontSize, 10) : subFontSize}px`,
                  pageBreakBefore: printShortLongSeparatePage ? "always" : "auto",
                }}
              >
                {/* SHORT QUESTIONS */}
                {includeShort && shorts.length > 0 && (
                  <div className={`short-questions-container ${is2Up ? "mb-1.5" : "mb-4"}`}>
                    <div className={`border-b-2 border-black pb-0.5 mb-1 flex items-center justify-between font-black uppercase tracking-wider ${is2Up ? "text-[11px]" : "text-xs sm:text-sm"}`}>
                      <div className="flex items-center gap-2">
                        <span>SECTION-II</span>
                        {languageMode === "Bilingual" && (
                          <span className="font-urdu text-sm font-bold text-slate-800">حصہ دوم</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        [ Marks: {effectiveShortMarks} ]
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-700 font-semibold px-1 mb-1.5">
                      <span className="italic">
                        <strong>Q. 2:</strong> Answer the following short questions.
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        (Attempt all &bull; {shorts.length} &times; 2 = {effectiveShortMarks} Marks)
                      </span>
                    </div>

                    {/* Rendering: Federal Board Table vs Punjab Board Bilingual Table */}
                    {headerStyle === "style2" ? (
                      /* Federal Board FBISE Subjective Table */
                      <table className="fb-table">
                        <tbody>
                          {Array.from({ length: Math.ceil(shorts.length / 2) }).map((_, rIdx) => {
                            const q1 = shorts[rIdx * 2];
                            const q2 = shorts[rIdx * 2 + 1];
                            const roman = `(${toRomanLower(rIdx + 1)})`;

                            const renderFbCell = (q?: Question) => {
                              if (!q) return null;
                              const en = cleanQuestionText(q.translations?.find((t) => t.language === "en")?.text || "");
                              const ur = cleanQuestionText(
                                q.translations?.find((t) => t.language === "ur")?.text ||
                                  getUrduTranslation(en).text_ur ||
                                  ""
                              );

                              return (
                                <div className="fb-question-box">
                                  {languageMode !== "Urdu" && (
                                    <div className="fb-eng-part">
                                      <MathRenderer content={en} />
                                    </div>
                                  )}
                                  {languageMode !== "English" && ur && (
                                    <div className="fb-urdu-part" dir="rtl">
                                      <MathRenderer content={ur} />
                                    </div>
                                  )}
                                </div>
                              );
                            };

                            return (
                              <tr key={rIdx}>
                                <td className="fb-num-col">{roman}</td>
                                <td className="w-[45%]">{renderFbCell(q1)}</td>
                                {q2 ? (
                                  <>
                                    <td className="fb-or-col">OR</td>
                                    <td className="w-[45%]">{renderFbCell(q2)}</td>
                                  </>
                                ) : (
                                  <td colSpan={2} />
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : languageMode === "Bilingual" ? (
                      /* Punjab Board Bilingual 2-Column Table */
                      <table className="bilingual-table">
                        <tbody>
                          {shorts.map((q, idx) => {
                            const en = cleanQuestionText(q.translations?.find((t) => t.language === "en")?.text || "");
                            const ur = cleanQuestionText(
                              q.translations?.find((t) => t.language === "ur")?.text ||
                                getUrduTranslation(en).text_ur ||
                                ""
                            );
                            const num = `(${toRomanLower(idx + 1)})`;

                             return (
                              <tr key={q.id} className="group relative">
                                <td className="bilingual-eng relative">
                                  <b>{num} </b>
                                  <MathRenderer content={en || ur} />
                                </td>
                                <td className="bilingual-urdu relative">
                                  <div className="no-print absolute top-0 left-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-1 bg-white/95 border border-slate-300 rounded shadow-xs px-1 py-0.5 z-10 transition-opacity font-sans" dir="ltr">
                                    <button
                                      onClick={() => handleTranslateSingleQuestion(q.id)}
                                      disabled={translatingQuestionId === q.id}
                                      className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer disabled:opacity-50"
                                      title="AI Translate Question (English ↔ Urdu)"
                                    >
                                      {translatingQuestionId === q.id ? "⏳..." : "✨ EN↔UR"}
                                    </button>
                                  </div>
                                  <b>{num} </b>
                                  <MathRenderer content={ur || en} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      /* Single Language Numbered List */
                      <ol
                        className={`list-decimal space-y-1.5 font-bold ${
                          languageMode === "Urdu" ? "pr-5 font-urdu text-right" : "pl-5 text-left"
                        }`}
                        dir={languageMode === "Urdu" ? "rtl" : "ltr"}
                      >
                        {shorts.map((q) => {
                          const en = cleanQuestionText(q.translations?.find((t) => t.language === "en")?.text || "");
                          const ur = cleanQuestionText(
                            q.translations?.find((t) => t.language === "ur")?.text ||
                              getUrduTranslation(en).text_ur ||
                              ""
                          );
                          return (
                            <li key={q.id} className="group relative">
                              <span className="no-print opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 mr-2 font-sans" dir="ltr">
                                <button
                                  onClick={() => handleTranslateSingleQuestion(q.id)}
                                  disabled={translatingQuestionId === q.id}
                                  className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer disabled:opacity-50"
                                >
                                  {translatingQuestionId === q.id ? "⏳..." : "✨ AI EN↔UR"}
                                </button>
                              </span>
                              <MathRenderer content={languageMode === "Urdu" ? ur || en : en || ur} />
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                )}

                {/* LONG QUESTIONS */}
                {includeLong && longs.length > 0 && (
                  <div className="long-questions-container">
                    <div className="border-b-2 border-black pb-1 mb-2 flex items-center justify-between font-black uppercase tracking-wider text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span>SECTION-III</span>
                        {languageMode === "Bilingual" && (
                          <span className="font-urdu text-sm font-bold text-slate-800">حصہ سوم</span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        [ Marks: {effectiveLongMarks} ]
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-700 font-semibold px-1 mb-1.5">
                      <span className="italic">
                        <strong>Q. 3:</strong> Answer the following questions in detail.
                      </span>
                      <span className="text-[11px] font-bold text-slate-600">
                        ({longs.length} &times; 5 = {effectiveLongMarks} Marks)
                      </span>
                    </div>

                    {/* Rendering: Federal Board Table vs Punjab Board Bilingual */}
                    {headerStyle === "style2" ? (
                      <table className="fb-table">
                        <tbody>
                          {longs.map((q, idx) => {
                            const en = cleanQuestionText(q.translations?.find((t) => t.language === "en")?.text || "");
                            const ur = cleanQuestionText(
                              q.translations?.find((t) => t.language === "ur")?.text ||
                                getUrduTranslation(en).text_ur ||
                                ""
                            );
                            const num = `Q. ${idx + 3}`;

                            return (
                              <tr key={q.id}>
                                <td className="fb-num-col">{num}</td>
                                <td colSpan={3}>
                                  <div className="fb-question-box">
                                    {languageMode !== "Urdu" && (
                                      <div className="fb-eng-part font-bold">
                                        <MathRenderer content={en} />
                                      </div>
                                    )}
                                    {languageMode !== "English" && ur && (
                                      <div className="fb-urdu-part font-bold" dir="rtl">
                                        <MathRenderer content={ur} />
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : languageMode === "Bilingual" ? (
                      <table className="bilingual-table">
                        <tbody>
                          {longs.map((q, idx) => {
                            const en = cleanQuestionText(q.translations?.find((t) => t.language === "en")?.text || "");
                            const ur = cleanQuestionText(
                              q.translations?.find((t) => t.language === "ur")?.text ||
                                getUrduTranslation(en).text_ur ||
                                ""
                            );
                            const num = `Q. ${idx + 3}:`;

                            return (
                              <tr key={q.id} className="group relative">
                                <td className="bilingual-eng font-bold">
                                  <b>{num} </b>
                                  <MathRenderer content={en || ur} />
                                </td>
                                <td className="bilingual-urdu font-bold relative">
                                  <div className="no-print absolute top-0 left-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-1 bg-white/95 border border-slate-300 rounded shadow-xs px-1 py-0.5 z-10 transition-opacity font-sans" dir="ltr">
                                    <button
                                      onClick={() => handleTranslateSingleQuestion(q.id)}
                                      disabled={translatingQuestionId === q.id}
                                      className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer disabled:opacity-50"
                                      title="AI Translate Question (English ↔ Urdu)"
                                    >
                                      {translatingQuestionId === q.id ? "⏳..." : "✨ EN↔UR"}
                                    </button>
                                  </div>
                                  <b>سوال نمبر {idx + 3}: </b>
                                  <MathRenderer content={ur || en} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div
                        className={`space-y-2 ${languageMode === "Urdu" ? "font-urdu text-right" : "text-left"}`}
                        dir={languageMode === "Urdu" ? "rtl" : "ltr"}
                      >
                        {longs.map((q, idx) => {
                          const en = cleanQuestionText(q.translations?.find((t) => t.language === "en")?.text || "");
                          const ur = cleanQuestionText(
                            q.translations?.find((t) => t.language === "ur")?.text ||
                              getUrduTranslation(en).text_ur ||
                              ""
                          );
                          return (
                            <div key={q.id} className="font-bold group relative">
                              <span>{languageMode === "Urdu" ? `سوال نمبر ${idx + 3}: ` : `Q. ${idx + 3}: `}</span>
                              <MathRenderer content={languageMode === "Urdu" ? ur || en : en || ur} />
                              <span className="no-print opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 ml-2 font-sans" dir="ltr">
                                <button
                                  onClick={() => handleTranslateSingleQuestion(q.id)}
                                  disabled={translatingQuestionId === q.id}
                                  className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-extrabold cursor-pointer disabled:opacity-50"
                                >
                                  {translatingQuestionId === q.id ? "⏳..." : "✨ AI EN↔UR"}
                                </button>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================
                ANSWER KEY SECTION (Multi-column boxed table matching reference)
                =================================================================== */}
            {includeMcqAnswerKey && displayedMcqs.length > 0 && (
              <div className="answer-key-section pt-5 page-break">
                <div className="text-center font-black text-sm uppercase tracking-widest mb-0.5">
                  ANSWER KEY
                </div>
                <div className="text-center text-xs text-slate-700 font-bold mb-2">
                  Multiple Choice Questions ({subjectTitle} &bull; Version {paperVersion})
                </div>

                <table className="answer-key-table border border-black text-xs font-sans text-center">
                  <thead>
                    <tr className="bg-slate-200/80 font-bold border-b border-black">
                      <th className="py-1 px-2 border-r border-black w-14">Q. No.</th>
                      <th className="py-1 px-2 border-r border-black text-left">Correct Answer</th>
                      <th className="py-1 px-2 border-r border-black w-14">Q. No.</th>
                      <th className="py-1 px-2 text-left">Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.ceil(displayedMcqs.length / 2) }).map((_, rIdx) => {
                      const q1 = displayedMcqs[rIdx];
                      const q2 = displayedMcqs[rIdx + Math.ceil(displayedMcqs.length / 2)];

                      const getAnsText = (q?: Question) => {
                        if (!q) return "";
                        const en = q.translations?.find((t) => t.language === "en");
                        const optIdx = (q.correct_option || 1) - 1;
                        const letter = String.fromCharCode(65 + optIdx);
                        const optText = en?.options?.[optIdx] || "";
                        return `(${letter}) ${optText}`;
                      };

                      return (
                        <tr key={rIdx} className="border-b border-black/60 text-[11px]">
                          <td className="py-1 border-r border-black font-bold font-mono">
                            {(rIdx + 1).toString().padStart(2, "0")}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-left font-medium">
                            {getAnsText(q1)}
                          </td>
                          <td className="py-1 border-r border-black font-bold font-mono">
                            {q2 ? (rIdx + 1 + Math.ceil(displayedMcqs.length / 2)).toString().padStart(2, "0") : ""}
                          </td>
                          <td className="py-1 px-2 text-left font-medium">{getAnsText(q2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

        const paperSizeClasses =
          paperSize === "letter"
            ? "max-w-[830px]"
            : paperSize === "legal"
            ? "max-w-[850px]"
            : "max-w-[850px]";

        return (
          <main
            className={`mx-auto px-2 sm:px-6 pt-5 print:p-0 transition-all ${
              testDensity === "2_per_page" ? "max-w-[1740px]" : paperSizeClasses
            }`}
          >
            {/* Studio Desk Status Strip (Hidden in Print) */}
            <div className="no-print mb-3.5 px-3.5 py-2 rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2 font-bold text-slate-700">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-black uppercase tracking-wider text-[10px]">
                  {paperSize.toUpperCase()} {testDensity === "2_per_page" ? "Landscape (2-Up)" : "Portrait"}
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="tabular-nums">
                  MCQs: <strong className="text-slate-900">{displayedMcqs.length}</strong>
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="tabular-nums">
                  Shorts: <strong className="text-slate-900">{shorts.length}</strong>
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="tabular-nums">
                  Longs: <strong className="text-slate-900">{longs.length}</strong>
                </span>
              </div>

              {/* Quick AI Bilingual Conversion Strip */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={isAiTranslating}
                  onClick={() => handleAiConvertLanguage("en_to_ur", "Bilingual", true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Convert English questions & options to Urdu using AI"
                >
                  <span>✨ EN → Urdu</span>
                </button>
                <button
                  type="button"
                  disabled={isAiTranslating}
                  onClick={() => handleAiConvertLanguage("ur_to_en", "Bilingual", true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-extrabold text-[11px] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  title="Convert Urdu questions & options to English using AI"
                >
                  <span>✨ Urdu → EN</span>
                </button>
                <button
                  type="button"
                  disabled={isAiTranslating}
                  onClick={() => handleAiConvertLanguage("auto_both", "Bilingual", false)}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  title="Ensure all questions have both English and Urdu (Nastaliq) versions"
                >
                  {isAiTranslating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>AI Converting...</span>
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3" />
                      <span>AI Both (EN + UR)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Smart AI Missing Language / Single-Medium Detection Banner (Hidden in Print) */}
            {(!languageCoverage.isCompleteBilingual || languageMode !== "Bilingual") && !translationBannerDismissed && (
              <div className="no-print mb-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border border-emerald-500/30 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Languages className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-black tracking-tight text-white">
                        {!languageCoverage.isCompleteBilingual
                          ? "Paper is Missing Bilingual (English / Urdu) Translations"
                          : `Paper Currently Set to ${languageMode} Only Mode`}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                        AI Bilingual Engine
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {languageCoverage.hasMissingUrdu && languageCoverage.hasMissingEnglish
                        ? `${languageCoverage.missingEnCount} question(s) need English and ${languageCoverage.missingUrCount} question(s) need Urdu.`
                        : languageCoverage.hasMissingUrdu
                        ? `${
                            languageCoverage.missingUrCount > 0
                              ? `${languageCoverage.missingUrCount} question(s)`
                              : `${languageCoverage.missingMcqUrOptions} MCQ(s)`
                          } contain only English. Convert English → Urdu or generate both with 1 click.`
                        : languageCoverage.hasMissingEnglish
                        ? `${languageCoverage.missingEnCount} question(s) contain only Urdu. Convert Urdu → English or generate both with 1 click.`
                        : "Convert or regenerate English ↔ Urdu translations anytime using AI."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end shrink-0">
                  <button
                    type="button"
                    disabled={isAiTranslating}
                    onClick={() => handleAiConvertLanguage("en_to_ur", "Bilingual", true)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/15 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>🇵🇰 English → Urdu</span>
                  </button>
                  <button
                    type="button"
                    disabled={isAiTranslating}
                    onClick={() => handleAiConvertLanguage("ur_to_en", "Bilingual", true)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 border border-white/15 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>🇬🇧 Urdu → English</span>
                  </button>
                  <button
                    type="button"
                    disabled={isAiTranslating}
                    onClick={() => handleAiConvertLanguage("auto_both", "Bilingual", false)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isAiTranslating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Generate Both (EN + UR)</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTranslationBannerDismissed(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Dismiss banner"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {testDensity === "2_per_page" ? (
              <div className="w-full overflow-x-auto pb-6 print:overflow-visible print:pb-0">
                {/* Informational Banner for 2 Tests on 1 Page Layout */}
                <div className="no-print mb-3 py-2 px-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs min-w-[1120px]">
                  <span className="flex items-center gap-1.5">
                    <Columns className="w-4 h-4 text-emerald-600" />
                    <span>2 Tests on 1 Page Mode: Both copies fit side-by-side on one sheet with scissors cut line.</span>
                  </span>
                  <span className="text-[11px] bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-950 font-black">
                    Paper: {paperSize.toUpperCase()} (Landscape 2-Up)
                  </span>
                </div>

                <div className="duplex-container grid grid-cols-2 gap-4 items-start relative min-w-[1120px] print:min-w-0">
                  <div className="duplex-column relative pr-3 border-r-2 border-dashed border-slate-300">
                    {/* Top Scissors indicator for screen */}
                    <div className="no-print absolute -top-3 right-0 translate-x-1/2 bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-300 flex items-center gap-1 z-10 shadow-2xs">
                      <Scissors className="w-3 h-3" />
                      <span>Cut Line</span>
                    </div>
                    {renderExamPaperSheet(1)}
                  </div>
                  <div className="duplex-column relative pl-3">
                    {renderExamPaperSheet(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full pb-6 print:overflow-visible print:pb-0">
                <div className="single-test-container w-full min-w-0">
                  {renderExamPaperSheet(1)}
                </div>
              </div>
            )}

            {/* Dynamic Print Styles for Paper Size & 2-Up Layout */}
            <style
              id="dynamic-paper-print-styles"
              dangerouslySetInnerHTML={{
                __html: `
                  @media print {
                    @page {
                      size: ${
                        testDensity === "2_per_page"
                          ? `${paperSize === "letter" ? "letter" : paperSize === "legal" ? "legal" : "A4"} landscape`
                          : `${paperSize === "letter" ? "letter" : paperSize === "legal" ? "legal" : "A4"} portrait`
                      } !important;
                      margin: ${testDensity === "2_per_page" ? "4mm 5mm" : "6mm 8mm"} !important;
                    }
                    ${
                      testDensity === "2_per_page"
                        ? `
                      html, body {
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                      }
                      .duplex-container {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        column-gap: 6mm !important;
                        row-gap: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                      }
                      .duplex-column {
                        width: 100% !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                      }
                      .duplex-column:first-child {
                        padding-right: 3mm !important;
                        border-right: 1.5px dashed #000000 !important;
                      }
                      .duplex-column:last-child {
                        padding-left: 3mm !important;
                      }
                      .paper-sheet {
                        padding: 2.5mm 3.5mm !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        border: 1.5px solid #000 !important;
                      }
                    `
                        : `
                      .single-test-container {
                        width: 100% !important;
                        max-width: 100% !important;
                      }
                      .paper-sheet {
                        box-shadow: none !important;
                      }
                    `
                    }
                  }
                `,
              }}
            />
          </main>
        );
      })()}

      {/* Client Authentication Modal */}
      <ClientAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setClientUser(user);
          setShowAuthModal(false);
          if (user.academyName && user.subscription.canCustomBranding) {
            setInstitutionName(user.academyName);
          }
          applyUserTemplate(user.subscription?.paperTemplate);
        }}
      />

      {/* Subscription Plans Modal */}
      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSuccess={(user) => {
          setClientUser(user);
          setShowSubModal(false);
          if (user.academyName && user.subscription.canCustomBranding) {
            setInstitutionName(user.academyName);
          }
        }}
        title={subModalTitle}
        subtitle={subModalSubtitle}
        highlightPlan={subModalHighlight}
      />
    </div>
  );
}
