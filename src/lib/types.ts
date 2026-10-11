export type UserRole = 'admin' | 'teacher';
export type QuestionType = 'mcq' | 'short' | 'long';
export type QuestionSource = 'exercise' | 'extra' | 'past_paper';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type TranslationLanguage = 'en' | 'ur';

export interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
  full_name: string | null;
  created_at?: string;
}

export interface Board {
  id: string;
  name: string;
  name_ur?: string | null;
  created_at?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  numeric_order: number;
  created_at?: string;
}

export interface Course {
  id: string;
  board_id: string;
  class_id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface Subject {
  id: string;
  course_id: string;
  name: string;
  name_ur?: string | null;
  created_at?: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  number: number;
  title: string;
  title_ur?: string | null;
  created_at?: string;
}

export interface Topic {
  id: string;
  chapter_id: string;
  number: number;
  title: string;
  title_ur?: string | null;
  created_at?: string;
}

export interface QuestionTranslation {
  id?: string;
  question_id?: string;
  language: TranslationLanguage;
  text: string;
  options?: string[] | null;
  answer?: string | null;
  created_at?: string;
}

export interface Question {
  id: string;
  chapter_id: string;
  topic_id: string | null;
  type: QuestionType;
  source: QuestionSource;
  source_ref: string | null;
  concept_tag: string | null;
  correct_option: number | null; // 1-4 for MCQ
  marks: number;
  difficulty: QuestionDifficulty;
  is_active: boolean;
  source_note: string | null;
  created_at?: string;
  translations?: QuestionTranslation[];
}

export interface PaperPattern {
  id: string;
  course_id: string;
  subject_id: string;
  name: string;
  sections: unknown;
  created_at?: string;
}

export interface CsvImportRow {
  chapter_number: number;
  topic_number?: number | null;
  type: QuestionType;
  source: QuestionSource;
  source_ref?: string | null;
  concept_tag?: string | null;
  text_en: string;
  option_a?: string | null;
  option_b?: string | null;
  option_c?: string | null;
  option_d?: string | null;
  text_ur?: string | null;
  correct_option?: number | null;
  answer_en?: string | null;
  marks: number;
  difficulty: QuestionDifficulty;
}

export interface CsvRowValidationResult {
  rowNumber: number;
  data: Partial<CsvImportRow>;
  errors: string[];
  isDuplicate?: boolean;
  isValid: boolean;
}

// Client Subscription & Permission System
export type SubscriptionPlanId = "free" | "monthly" | "pay_as_you_go" | "pay_per_paper" | "standard" | "annual";

export interface SubscriptionInfo {
  planId: SubscriptionPlanId;
  planName: string;
  status: "active" | "expired" | "trial" | "suspended";
  expiresAt: string | null;
  paperCredits: number;
  canAutoBoardPattern: boolean;
  canCustomBranding: boolean;
  canExportAnswerKey: boolean;
  canFullBoardPaper: boolean;
  canUnlimitedExport: boolean;
  canAccessAllClasses: boolean;
  maxQuestionsPerPaper: number;
}

export interface ClientUser {
  id: string;
  email: string;
  fullName: string;
  academyName?: string | null;
  phone?: string | null;
  role: "client";
  subscription: SubscriptionInfo;
  createdAt: string;
  updatedAt?: string;
  notes?: string | null;
}

export type PaperExportMode = "all" | "questions" | "key";

// A generated / printed paper in a client's history
export interface PaperRecord {
  id: string;
  clientId: string;
  title: string;
  institution: string;
  subject: string;
  className: string;
  syllabus: string;
  mcqCount: number;
  shortCount: number;
  longCount: number;
  questionCount: number;
  totalMarks: number;
  languageMode: "Bilingual" | "English" | "Urdu";
  version: string;
  exportMode: PaperExportMode;
  createdAt: string;
}

export interface ClientPaperStats {
  totalPapers: number;
  papersThisMonth: number;
  papersThisWeek: number;
  totalQuestions: number;
  totalMarks: number;
  withAnswerKey: number;
  lastPaperAt: string | null;
  bySubject: { subject: string; count: number }[];
  byLanguage: { language: string; count: number }[];
  perDay: { date: string; count: number }[]; // last 14 days
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanDetails {
  id: SubscriptionPlanId;
  name: string;
  tag?: string;
  priceFormatted: string;
  originalPriceFormatted?: string;
  discountBadge?: string;
  billingPeriod: string;
  ctaText: string;
  ctaVariant: "outline" | "orange" | "green" | "blue";
  features: PlanFeature[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, PlanDetails> = {
  free: {
    id: "free",
    name: "Free Account",
    priceFormatted: "Rs. 0",
    billingPeriod: "Browse & Profile Only",
    ctaText: "Free Account",
    ctaVariant: "outline",
    features: [
      { text: "Curriculum & Question Bank Browser", included: true },
      { text: "Educator Profile & Dashboard", included: true },
      { text: "Paper Generation & Export (Paid Only)", included: false },
      { text: "No Academy Branding", included: false },
      { text: "No Auto-Board Pattern (ALP)", included: false },
      { text: "No Answer Keys & Bubble Sheets", included: false },
    ],
  },
  monthly: {
    id: "monthly",
    name: "Monthly Subscription",
    tag: "BEST VALUE & UNLIMITED",
    priceFormatted: "Rs. 2000",
    originalPriceFormatted: "Rs. 4000",
    discountBadge: "50% OFF",
    billingPeriod: "Monthly Access (30 Days)",
    ctaText: "Subscribe Monthly (Rs. 2000)",
    ctaVariant: "green",
    features: [
      { text: "Unlimited Paper Generation", included: true },
      { text: "Auto Board Pattern Generator (ALP)", included: true },
      { text: "Your Academy Name & Crest Branding", included: true },
      { text: "Answer Keys & Student Bubble Sheets", included: true },
      { text: "Access to All Classes (9th, 10th, 11th, 12th)", included: true },
      { text: "High Quality PDF Export (A4 & Legal)", included: true },
      { text: "Priority WhatsApp Customer Support", included: true },
      { text: "Best for All Academies & Schools", included: true },
    ],
  },
  standard: {
    id: "standard",
    name: "Monthly Subscription",
    tag: "BEST VALUE & UNLIMITED",
    priceFormatted: "Rs. 2000",
    originalPriceFormatted: "Rs. 4000",
    discountBadge: "50% OFF",
    billingPeriod: "Monthly Access (30 Days)",
    ctaText: "Subscribe Monthly (Rs. 2000)",
    ctaVariant: "green",
    features: [
      { text: "Unlimited Paper Generation", included: true },
      { text: "Auto Board Pattern Generator (ALP)", included: true },
      { text: "Your Academy Name & Crest Branding", included: true },
      { text: "Answer Keys & Student Bubble Sheets", included: true },
      { text: "Access to All Classes (9th, 10th, 11th, 12th)", included: true },
      { text: "High Quality PDF Export (A4 & Legal)", included: true },
      { text: "Priority WhatsApp Customer Support", included: true },
      { text: "Best for All Academies & Schools", included: true },
    ],
  },
  annual: {
    id: "annual",
    name: "Monthly Subscription",
    tag: "BEST VALUE & UNLIMITED",
    priceFormatted: "Rs. 2000",
    originalPriceFormatted: "Rs. 4000",
    discountBadge: "50% OFF",
    billingPeriod: "Monthly Access (30 Days)",
    ctaText: "Subscribe Monthly (Rs. 2000)",
    ctaVariant: "green",
    features: [
      { text: "Unlimited Paper Generation", included: true },
      { text: "Auto Board Pattern Generator (ALP)", included: true },
      { text: "Your Academy Name & Crest Branding", included: true },
      { text: "Answer Keys & Student Bubble Sheets", included: true },
      { text: "Access to All Classes (9th, 10th, 11th, 12th)", included: true },
      { text: "High Quality PDF Export (A4 & Legal)", included: true },
      { text: "Priority WhatsApp Customer Support", included: true },
      { text: "Best for All Academies & Schools", included: true },
    ],
  },
  pay_as_you_go: {
    id: "pay_as_you_go",
    name: "Monthly Subscription",
    tag: "BEST VALUE & UNLIMITED",
    priceFormatted: "Rs. 2000",
    originalPriceFormatted: "Rs. 4000",
    discountBadge: "50% OFF",
    billingPeriod: "Monthly Access (30 Days)",
    ctaText: "Subscribe Monthly (Rs. 2000)",
    ctaVariant: "green",
    features: [
      { text: "Unlimited Paper Generation", included: true },
      { text: "Auto Board Pattern Generator (ALP)", included: true },
      { text: "Your Academy Name & Crest Branding", included: true },
      { text: "Answer Keys & Student Bubble Sheets", included: true },
      { text: "Access to All Classes (9th, 10th, 11th, 12th)", included: true },
      { text: "High Quality PDF Export (A4 & Legal)", included: true },
      { text: "Priority WhatsApp Customer Support", included: true },
      { text: "Best for All Academies & Schools", included: true },
    ],
  },
  pay_per_paper: {
    id: "pay_per_paper",
    name: "Monthly Subscription",
    tag: "BEST VALUE & UNLIMITED",
    priceFormatted: "Rs. 2000",
    originalPriceFormatted: "Rs. 4000",
    discountBadge: "50% OFF",
    billingPeriod: "Monthly Access (30 Days)",
    ctaText: "Subscribe Monthly (Rs. 2000)",
    ctaVariant: "green",
    features: [
      { text: "Unlimited Paper Generation", included: true },
      { text: "Auto Board Pattern Generator (ALP)", included: true },
      { text: "Your Academy Name & Crest Branding", included: true },
      { text: "Answer Keys & Student Bubble Sheets", included: true },
      { text: "Access to All Classes (9th, 10th, 11th, 12th)", included: true },
      { text: "High Quality PDF Export (A4 & Legal)", included: true },
      { text: "Priority WhatsApp Customer Support", included: true },
      { text: "Best for All Academies & Schools", included: true },
    ],
  },
};

export const PLAN_METADATA = SUBSCRIPTION_PLANS;

export function isPaidSubscriber(client?: ClientUser | null, adminUser?: unknown): boolean {
  if (adminUser) return true;
  if (!client || !client.subscription) return false;
  if (client.subscription.status !== "active") return false;
  const plan = client.subscription.planId;
  if (plan === "free") return false;
  if (plan === "monthly" || plan === "standard" || plan === "annual") {
    return true;
  }
  if (plan === "pay_as_you_go" || plan === "pay_per_paper") {
    return (client.subscription.paperCredits ?? 0) > 0 || true; // covered under active paid
  }
  return true;
}

export function getPlanPermissions(planId: SubscriptionPlanId): SubscriptionInfo {
  switch (planId) {
    case "monthly":
    case "standard":
    case "annual":
    case "pay_as_you_go":
    case "pay_per_paper":
      return {
        planId: "monthly",
        planName: "Monthly Subscription",
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paperCredits: 999999,
        canAutoBoardPattern: true,
        canCustomBranding: true,
        canExportAnswerKey: true,
        canFullBoardPaper: true,
        canUnlimitedExport: true,
        canAccessAllClasses: true,
        maxQuestionsPerPaper: 100,
      };
    case "free":
    default:
      return {
        planId: "free",
        planName: "Free Account",
        status: "active",
        expiresAt: null,
        paperCredits: 0,
        canAutoBoardPattern: false,
        canCustomBranding: false,
        canExportAnswerKey: false,
        canFullBoardPaper: false,
        canUnlimitedExport: false,
        canAccessAllClasses: false,
        maxQuestionsPerPaper: 0,
      };
  }
}

// Outgoing / Transactional Email Record
export interface EmailRecord {
  id: string;
  to: string;
  recipientName: string;
  subject: string;
  template: "welcome" | "subscription_upgrade" | "custom";
  status: "sent" | "delivered" | "failed" | "simulated";
  previewText?: string;
  htmlContent: string;
  sentAt: string;
  error?: string | null;
}

