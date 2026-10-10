# Paper Maker - Project Plan & Specification

## Overview
"Paper Maker" is a web application designed for Pakistani school teachers to pick questions from a question bank and generate high-quality examination papers as downloadable PDFs with answer keys.

---

## Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS (responsive, clean modern dashboard styling)
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Row-Level Security / RLS)
- **Math Rendering:** KaTeX (inline math wrapped in `$...$` and block math in `$$...$$`)
- **Urdu Typography:** Google Font Noto Nastaliq Urdu via `next/font/google` with RTL direction support
- **Data Ingestion:** Papa Parse (CSV parsing & validation)
- **Validation:** Zod (Server & Client schema validation)
- **Version Control:** Git repository initialized from the beginning, with atomic commits after each working milestone

---

## Product Flow (Complete Vision Context)
1. **Curriculum Hierarchy:** Board -> Class -> Course -> Subject -> Chapter checkboxes (Select All, "n/8 selected")
2. **Question Selection:** Filterable Question Bank screen with rich previews (KaTeX + Urdu RTL)
3. **Paper Generation:** Configure paper pattern, marks, sections
4. **Export & Print:** High quality PDF generation with answer keys and bilingual layouts
5. **Saved Papers:** Personal library of created exam papers

*Note:* Boards include Punjab, Federal, KPK, Sindh, etc. Courses represent curriculum versions (e.g., "Class 10 (Old)", "10th (New) 2026-27", "9th Tech"). Names are bilingual (English + Urdu). Questions can be English, Urdu, or bilingual.

---

## Phase 1 Scope (Current Milestone)

### 1. Database & Migrations (Supabase + RLS)
Tables to establish with RLS turned ON:
- `profiles` (`id` references `auth.users`, `role` enum `'admin' | 'teacher'`, default `'teacher'`, `created_at`)
- `boards` (`id` uuid, `name` text, `name_ur` text, `created_at`)
- `classes` (`id` uuid, `name` text [e.g. "Class 5" to "Class 12"], `numeric_order` int, `created_at`)
- `courses` (`id` uuid, `board_id` uuid references `boards`, `class_id` uuid references `classes`, `name` text, `is_active` boolean, `created_at`)
- `subjects` (`id` uuid, `course_id` uuid references `courses`, `name` text, `name_ur` text, `created_at`)
- `chapters` (`id` uuid, `subject_id` uuid references `subjects`, `number` int, `title` text, `title_ur` text, `created_at`)
- `topics` (`id` uuid, `chapter_id` uuid references `chapters`, `number` int, `title` text, `title_ur` text, `created_at`)
- `questions` (
    `id` uuid, 
    `chapter_id` uuid references `chapters`, 
    `topic_id` uuid nullable references `topics`, 
    `type` enum `'mcq' | 'short' | 'long'`, 
    `source` enum `'exercise' | 'extra' | 'past_paper'`, 
    `source_ref` text, 
    `concept_tag` text, 
    `correct_option` int nullable (1-4 for MCQ), 
    `marks` int, 
    `difficulty` enum `'easy' | 'medium' | 'hard'`, 
    `is_active` boolean default true, 
    `source_note` text, 
    `created_at` timestamp
  )
- `question_translations` (
    `id` uuid,
    `question_id` uuid references `questions` on delete cascade, 
    `language` enum `'en' | 'ur'`, 
    `text` text, 
    `options` jsonb nullable, 
    `answer` text, 
    unique(`question_id`, `language`)
  )
- `paper_patterns` (`id` uuid, `course_id` uuid references `courses`, `subject_id` uuid references `subjects`, `name` text, `sections` jsonb, `created_at`)

#### Security Rules & RLS
- Only users with `role = 'admin'` can insert, update, or delete in any table.
- `questions` and `question_translations` are **NOT** publicly readable (only authenticated users with admin role or verified teacher permissions can read).
- Service role key is strictly kept on the server and never exposed to client browsers.

---

### 2. Seed Script
Seed data file (`supabase/seed.sql` or executable seed script):
- Punjab Board, classes 9 to 12.
- Course: "Class 10 (Old)".
- Subject: Mathematics (with realistic chapters: Quadratic Equations, Theory of Quadratic Equations, Variations, Partial Fractions, Sets & Functions, Basic Statistics, Introduction to Trigonometry, etc.).
- 30 sample questions:
  - Mixed types: MCQ, Short Questions, Long Questions.
  - Mixed difficulties: Easy, Medium, Hard.
  - At least 5 questions with mathematical LaTeX (e.g., $x^2 - 5x + 6 = 0$, $\frac{a}{b}$, $\sqrt{b^2 - 4ac}$).
  - At least 5 questions with Urdu translations.
  - Every seeded question has `source_note = 'SAMPLE - delete before launch'`.

---

### 3. Admin Area (`/admin`)
- **Authentication & Authorization:**
  - Login at `/admin/login` (email + password).
  - Middleware / server checks to ensure only users with `profiles.role = 'admin'` access `/admin/*`. Redirect unauthenticated users to login, non-admins to unauthorized message.
- **Hierarchy Management CRUD:**
  - Dedicated management screens for Boards, Courses, Subjects, Chapters, Topics with English and Urdu input fields.
- **Question Bank Management:**
  - Cascading dropdowns: Board > Class > Course > Subject > Chapter.
  - Filters: Question Type (`mcq`, `short`, `long`), Difficulty (`easy`, `medium`, `hard`), Source (`exercise`, `extra`, `past_paper`), Topic.
  - Search input for question text.
  - Table view displaying question details, marks, difficulty, preview badge, and status.
  - Actions: Add new question, Edit question, Duplicate question, Toggle active/inactive status.
- **Question Editor Modal / Form:**
  - Dynamic fields switching based on question type:
    - Options (A, B, C, D) & correct option selector displayed only for MCQ.
    - Marks field defaults based on type (e.g. MCQ = 1, Short = 2, Long = 4/5) but editable.
  - Dual language tabs: English (`en`) and Urdu (`ur`).
  - Live Preview side-by-side or tabbed: Real-time KaTeX mathematical rendering and Urdu RTL typography rendering.

---

### 4. Mathematical & Urdu Rendering Engine
- **KaTeX:** Robust parser rendering inline `$...$` and display `$$...$$` equations properly formatted.
- **Noto Nastaliq Urdu:** Integrated via `next/font/google`, applying `dir="rtl"` and Nastaliq styling whenever Urdu text is rendered.

---

### 5. CSV Import & Export Template
- **Columns:**
  `chapter_number`, `topic_number`, `type`, `source`, `source_ref`, `concept_tag`, `text_en`, `option_a`, `option_b`, `option_c`, `option_d`, `text_ur`, `correct_option`, `answer_en`, `marks`, `difficulty`
- **Features:**
  - Downloadable sample CSV template with instructions.
  - Client/Server parsing using Papa Parse and Zod row validation.
  - Interactive row-by-row preview prior to submission, flagging validation errors clearly on specific rows.
  - Duplicate detection: skips duplicates matching existing questions with the same chapter and English text.
  - Bulk insertion with proper transaction handling.

---

## Out of Scope for Phase 1 (DO NOT BUILD YET)
- Teacher-facing public question browser or paper maker workflow.
- Paper generation algorithm & layout configuration.
- PDF export engine (Puppeteer / React-PDF / print CSS).
- Payment gateways, subscription plans, user quotas.
- Mobile native application.
- Auto/Board pattern blueprint generator.

---

## Verification Checklist (Before Completion)
- [ ] Logged-out visitor cannot read questions (tested via API / Supabase RLS)
- [ ] Admin login works with proper session and role verification
- [ ] Ability to add one question of each type (MCQ, Short, Long) and edit them
- [ ] LaTeX like `$x^2 + \frac{1}{2}$` renders correctly via KaTeX
- [ ] Urdu questions display properly in right-to-left (RTL) with Noto Nastaliq Urdu
- [ ] 20-row CSV imports properly, with invalid rows flagged for correction
- [ ] Git repository initialized with atomic commits for all steps
