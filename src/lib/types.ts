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
