import { z } from "zod";

export const BoardSchema = z.object({
  name: z.string().trim().min(1, "Board name in English is required"),
  name_ur: z.string().trim().optional().nullable(),
});

export const CourseSchema = z.object({
  board_id: z.string().min(1, "Please select a valid board"),
  class_id: z.string().min(1, "Please select a valid class"),
  name: z.string().trim().min(1, "Course name is required"),
  is_active: z.boolean().default(true),
});

export const SubjectSchema = z.object({
  course_id: z.string().min(1, "Please select a valid course"),
  name: z.string().trim().min(1, "Subject name in English is required"),
  name_ur: z.string().trim().optional().nullable(),
});

export const ChapterSchema = z.object({
  subject_id: z.string().min(1, "Please select a valid subject"),
  number: z.coerce.number().int().positive("Chapter number must be a positive integer"),
  title: z.string().trim().min(1, "Chapter title in English is required"),
  title_ur: z.string().trim().optional().nullable(),
});

export const TopicSchema = z.object({
  chapter_id: z.string().min(1, "Please select a valid chapter"),
  number: z.coerce.number().int().positive("Topic number must be a positive integer"),
  title: z.string().trim().min(1, "Topic title in English is required"),
  title_ur: z.string().trim().optional().nullable(),
});

export const QuestionTranslationSchema = z.object({
  language: z.enum(["en", "ur"]),
  text: z.string().trim().min(1, "Question text cannot be empty"),
  options: z.array(z.string().trim()).optional().nullable(),
  answer: z.string().trim().optional().nullable(),
});

export const QuestionSchema = z
  .object({
    id: z.string().optional(),
    chapter_id: z.string().min(1, "Please select a valid chapter"),
    topic_id: z.string().optional().nullable(),
    type: z.enum(["mcq", "short", "long"]),
    source: z.enum(["exercise", "extra", "past_paper"]).default("exercise"),
    source_ref: z.string().trim().optional().nullable(),
    concept_tag: z.string().trim().optional().nullable(),
    correct_option: z.coerce.number().int().min(1).max(4).optional().nullable(),
    marks: z.coerce.number().int().min(1, "Marks must be at least 1"),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    is_active: z.boolean().default(true),
    source_note: z.string().trim().optional().nullable(),
    text_en: z.string().trim().min(1, "English question text is required"),
    answer_en: z.string().trim().optional().nullable(),
    options_en: z.array(z.string().trim()).optional().nullable(),
    text_ur: z.string().trim().optional().nullable(),
    answer_ur: z.string().trim().optional().nullable(),
    options_ur: z.array(z.string().trim()).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "mcq") {
      if (!data.correct_option) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Correct option (1-4) is required for MCQ",
          path: ["correct_option"],
        });
      }
      if (!data.options_en || data.options_en.length < 4 || data.options_en.some((opt) => !opt.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "All 4 options (A, B, C, D) are required for English MCQ",
          path: ["options_en"],
        });
      }
    }
  });

export const CsvRowRawSchema = z.object({
  chapter_number: z.coerce.number().int().positive("Chapter number must be a positive integer"),
  topic_number: z.coerce.number().int().positive().optional().nullable(),
  type: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.enum(["mcq", "short", "long"])
  ),
  source: z.preprocess(
    (v) => (typeof v === "string" && v.trim() ? v.trim().toLowerCase() : "exercise"),
    z.enum(["exercise", "extra", "past_paper"])
  ),
  source_ref: z.string().trim().optional().nullable(),
  concept_tag: z.string().trim().optional().nullable(),
  text_en: z.string().trim().min(1, "English question text is required"),
  option_a: z.string().trim().optional().nullable(),
  option_b: z.string().trim().optional().nullable(),
  option_c: z.string().trim().optional().nullable(),
  option_d: z.string().trim().optional().nullable(),
  text_ur: z.string().trim().optional().nullable(),
  correct_option: z.coerce.number().int().optional().nullable(),
  answer_en: z.string().trim().optional().nullable(),
  marks: z.coerce.number().int().positive().default(1),
  difficulty: z.preprocess(
    (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
    z.enum(["easy", "medium", "hard"])
  ),
});

export const AdminLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
