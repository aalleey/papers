# Paper Maker - Pakistani School Exam Paper Generator (Phase 1)

Paper Maker is a web application designed for Pakistani school teachers to pick questions from a verified question bank and generate customized examination papers with answer keys.

This repository contains **Phase 1: Question Bank & Admin Management Portal**.

---

## Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS (Responsive mobile & desktop design)
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Row-Level Security)
- **Math Engine:** KaTeX for LaTeX equations (e.g. `$x^2 + \frac{1}{2} = 0$`)
- **Urdu Typography:** Google Font Noto Nastaliq Urdu via `next/font/google` with `dir="rtl"`
- **CSV Ingestion:** Papa Parse for fast client-side CSV parsing
- **Validation:** Zod schemas for forms, API endpoints, and CSV rows
- **Icons:** Lucide React

---

## Environment Variables (`.env.local`)
Create a `.env.local` file in the root directory (copied from `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-here
```

> **Note:** The application includes a persistent development repository seeded with 30 sample questions, Punjab Board, and Class 10 Math chapters. If Supabase keys are not yet configured or left as placeholders, the app runs out-of-the-box in local development mode.

---

## Supabase Database Setup & Migration

1. In your Supabase project SQL Editor, run:
   - `supabase/migrations/20240101000000_phase1_init.sql` (Creates all tables, types, triggers, and RLS policies)
2. To load Punjab Board, Class 10 (Old) Mathematics chapters, and 30 sample questions:
   - Run `supabase/seed.sql` in the Supabase SQL Editor.

### Row Level Security (RLS) Rules:
- Only users with `role = 'admin'` can write to any table.
- `questions` and `question_translations` are **NOT** publicly readable. Logged-out visitors cannot query or read questions.
- The `SUPABASE_SERVICE_ROLE_KEY` is strictly server-side and never exposed to the browser.

---

## Running the Application Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   - Public Landing Page: [http://localhost:3000](http://localhost:3000)
   - Admin Login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
   - Questions Bank: [http://localhost:3000/admin/questions](http://localhost:3000/admin/questions)
   - CSV Import: [http://localhost:3000/admin/import](http://localhost:3000/admin/import)

### Default Admin Credentials:
- **Email:** `admin@papermaker.pk`
- **Password:** `admin123`

---

## Phase 1 Feature Checklist
- [x] Database migration with RLS ON for all tables (`profiles`, `boards`, `classes`, `courses`, `subjects`, `chapters`, `topics`, `questions`, `question_translations`, `paper_patterns`)
- [x] Seed data with Punjab Board, Classes 9-12, Class 10 (Old) Math, and 30 sample questions (all marked with `source_note = 'SAMPLE - delete before launch'`)
- [x] Admin authentication at `/admin/login` with role verification and redirect
- [x] Admin CRUD management screens for Boards, Courses, Subjects, Chapters, and Topics with Urdu name fields
- [x] Cascading dropdowns (Board > Class > Course > Subject > Chapter), filters, search, and table view
- [x] Question Form Modal with dynamic fields by type (options/answers for MCQ), bilingual tabs (English/Urdu), and real-time live preview
- [x] KaTeX mathematical rendering for equations like `$x^2 + \frac{1}{2}$`
- [x] Noto Nastaliq Urdu with `dir="rtl"` right-to-left layout
- [x] CSV Import with row-by-row preview, bad row flagging, duplicate detection, and downloadable template
