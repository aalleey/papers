# Paper Maker

**A exam paper generator for Pakistani schools.** Teachers select questions from a verified, curriculum-aligned question bank and produce print-ready examination papers with answer keys, in English and Urdu.

![Status](https://img.shields.io/badge/phase-1%20(Question%20Bank%20%26%20Admin)-blue)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ecf8e)

---

## Table of Contents

1. [Overview](#overview)
2. [Roadmap](#roadmap)
3. [Features (Phase 1)](#features-phase-1)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Database Setup](#database-setup)
8. [Security Model](#security-model)
9. [CSV Import Guide](#csv-import-guide)
10. [Bilingual & Math Support](#bilingual--math-support)
11. [Available Scripts](#available-scripts)
12. [Pre-Launch Checklist](#pre-launch-checklist)
13. [Troubleshooting](#troubleshooting)

---

## Overview

Paper Maker removes the manual work of preparing exams. Content administrators curate a structured question bank organised by **Board → Class → Course → Subject → Chapter → Topic**, and teachers (in later phases) build papers from it in minutes.

**Phase 1** delivers the foundation: the question bank, the data model, and a secure admin portal for managing content at scale.

## Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| **1** | Question bank, admin portal, bilingual content, CSV import | ✅ Complete |
| 2 | Teacher accounts, question selection, paper builder | Planned |
| 3 | Paper patterns, PDF/Print export, answer keys | Planned |
| 4 | Subscriptions, analytics, school workspaces | Planned |

## Features (Phase 1)

### Content Management
- **Hierarchical curriculum CRUD**: Boards, Courses, Subjects, Chapters and Topics, each with an Urdu name field.
- **Question management**: create, edit, search and filter questions in a table view.
- **Cascading filters**: Board → Class → Course → Subject → Chapter.
- **Dynamic question form**: fields adapt to question type (e.g. options and correct answer for MCQs).

### Bilingual & Mathematical Content
- English / Urdu tabs per question with **real-time live preview**.
- **KaTeX** rendering for equations, e.g. `$x^2 + \frac{1}{2} = 0$`.
- **Noto Nastaliq Urdu** typography with proper `dir="rtl"` layout.

### Bulk Import
- Client-side CSV parsing with **row-by-row preview**.
- **Bad-row flagging** with validation messages and **duplicate detection**.
- Downloadable CSV template.

### Security
- Admin authentication at `/admin/login` with role verification.
- Row-Level Security enabled on every table.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS (responsive, mobile and desktop) |
| Database & Auth | Supabase (PostgreSQL, Auth, Row-Level Security) |
| Math rendering | KaTeX |
| Urdu typography | Noto Nastaliq Urdu via `next/font/google` |
| CSV parsing | Papa Parse |
| Validation | Zod (forms, API endpoints, CSV rows) |
| Icons | Lucide React |

## Project Structure

> Adjust to match your repository layout.

```
paper-maker/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Public landing page
│   │   └── admin/
│   │       ├── login/            # Admin sign-in
│   │       ├── questions/        # Question bank
│   │       └── import/           # CSV import
│   ├── components/               # Shared UI components
│   └── lib/                      # Supabase clients, Zod schemas, utilities
├── supabase/
│   ├── migrations/
│   │   └── 20240101000000_phase1_init.sql
│   └── seed.sql
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm
- A [Supabase](https://supabase.com) project (optional for local development, see below)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description | Exposed to browser |
|----------|-------------|:------------------:|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key, **server-side only** | **No** |

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-here
```

> **Local development mode:** if the Supabase keys are missing or left as placeholders, the app runs out of the box using a persistent development repository pre-seeded with Punjab Board, Class 10 Math chapters and 30 sample questions.

### 3. Run the app

```bash
npm run dev
```

| Page | URL |
|------|-----|
| Landing page | http://localhost:3000 |
| Admin login | http://localhost:3000/admin/login |
| Question bank | http://localhost:3000/admin/questions |
| CSV import | http://localhost:3000/admin/import |

### Development admin credentials

| Field | Value |
|-------|-------|
| Email | `admin@papermaker.pk` |
| Password | `admin123` |

> ⚠️ **For local development only.** Never use these credentials in staging or production. Create a real admin user in Supabase and change or remove the default account before deploying.

## Database Setup

Run the following in the Supabase **SQL Editor**, in order:

1. **Schema migration**: `supabase/migrations/20240101000000_phase1_init.sql`
   Creates all tables, enum types, triggers and RLS policies.
2. **Seed data** *(optional)*: `supabase/seed.sql`
   Loads Punjab Board, Classes 9–12, Class 10 (Old) Mathematics chapters and 30 sample questions.

### Tables

`profiles` · `boards` · `classes` · `courses` · `subjects` · `chapters` · `topics` · `questions` · `question_translations` · `paper_patterns`

### Creating an admin user

1. Create a user in **Supabase → Authentication → Users**.
2. Set that user's `role` to `admin` in the `profiles` table:

```sql
update profiles set role = 'admin' where id = '<user-uuid>';
```

## Security Model

| Rule | Detail |
|------|--------|
| RLS everywhere | Row-Level Security is enabled on all tables. |
| Admin-only writes | Only users with `role = 'admin'` can write to any table. |
| Protected question bank | `questions` and `question_translations` are **not publicly readable**; logged-out visitors cannot query them. |
| Secret isolation | `SUPABASE_SERVICE_ROLE_KEY` is used strictly server-side and is never sent to the browser. |
| Input validation | All forms, API routes and CSV rows are validated with Zod. |

## CSV Import Guide

1. Open **Admin → Import** and download the CSV template.
2. Fill in one question per row, following the template headers.
3. Upload the file. Papa Parse reads it in the browser.
4. Review the preview: invalid rows are flagged with reasons and duplicates are detected.
5. Confirm to import the valid rows.

> Tip: keep Urdu text in UTF-8 encoding. When saving from Excel, choose **CSV UTF-8**.

## Bilingual & Math Support

- **Math:** wrap LaTeX in `$...$` for inline equations, e.g. `$\frac{a}{b}$`.
- **Urdu:** enter text in the Urdu tab; it renders in Noto Nastaliq Urdu with right-to-left direction.
- The live preview shows exactly how each question will appear.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |

## Pre-Launch Checklist

- [ ] Delete all sample questions: `delete from questions where source_note = 'SAMPLE - delete before launch';`
- [ ] Remove or change the default admin credentials
- [ ] Configure real Supabase keys in the production environment
- [ ] Confirm RLS is enabled on every table
- [ ] Verify the service role key is not exposed in client bundles

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Urdu text shows as disconnected letters | Ensure the Urdu field uses `dir="rtl"` and the Noto Nastaliq font is loaded. |
| Equations show raw LaTeX | Check the `$...$` delimiters and that KaTeX CSS is imported. |
| Cannot log in as admin | Confirm the user's `role` is `admin` in `profiles`. |
| Questions not loading | Verify Supabase keys in `.env.local` and restart the dev server. |
| CSV import rejects rows | Compare headers to the downloadable template and check the preview's error messages. |

---

© Paper Maker. All rights reserved.
