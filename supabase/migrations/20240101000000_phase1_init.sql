-- ==============================================================================
-- Migration: Phase 1 Initial Schema
-- Tables: profiles, boards, classes, courses, subjects, chapters, topics,
--         questions, question_translations, paper_patterns
-- Row Level Security (RLS) enabled on all tables
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Custom Types / Enums
do $$ begin
  create type public.user_role as enum ('admin', 'teacher');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.question_type as enum ('mcq', 'short', 'long');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.question_source as enum ('exercise', 'extra', 'past_paper');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.question_difficulty as enum ('easy', 'medium', 'hard');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.translation_language as enum ('en', 'ur');
exception
  when duplicate_object then null;
end $$;

-- 2. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role public.user_role not null default 'teacher',
  full_name text,
  created_at timestamptz not null default now()
);

-- Helper function to check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Trigger to create profile when auth.users is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    case
      -- You can set a specific bootstrap admin email or default to teacher
      when new.email in ('admin@papermaker.pk', 'admin@example.com') then 'admin'::public.user_role
      else 'teacher'::public.user_role
    end,
    coalesce(new.raw_user_meta_data->>'full_name', 'Teacher')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Boards Table
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ur text,
  created_at timestamptz not null default now()
);

-- 4. Classes Table (Classes 5 to 12)
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  numeric_order int not null,
  created_at timestamptz not null default now()
);

-- 5. Courses Table (Curriculum versions inside a class)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 6. Subjects Table
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null,
  name_ur text,
  created_at timestamptz not null default now()
);

-- 7. Chapters Table
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  number int not null,
  title text not null,
  title_ur text,
  created_at timestamptz not null default now()
);

-- 8. Topics Table
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  number int not null,
  title text not null,
  title_ur text,
  created_at timestamptz not null default now()
);

-- 9. Questions Table
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,
  type public.question_type not null,
  source public.question_source not null default 'exercise',
  source_ref text,
  concept_tag text,
  correct_option int check (correct_option is null or (correct_option >= 1 and correct_option <= 4)),
  marks int not null default 1,
  difficulty public.question_difficulty not null default 'medium',
  is_active boolean not null default true,
  source_note text,
  created_at timestamptz not null default now()
);

-- 10. Question Translations Table
create table if not exists public.question_translations (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  language public.translation_language not null,
  text text not null,
  options jsonb, -- e.g. ["A", "B", "C", "D"]
  answer text,
  created_at timestamptz not null default now(),
  constraint uq_question_language unique (question_id, language)
);

-- 11. Paper Patterns Table (table only for Phase 1)
create table if not exists public.paper_patterns (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  sections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on every table
alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.classes enable row level security;
alter table public.courses enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.question_translations enable row level security;
alter table public.paper_patterns enable row level security;

-- PROFILES Policies
drop policy if exists "Profiles are readable by owner or admin" on public.profiles;
create policy "Profiles are readable by owner or admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (public.is_admin());

-- CURRICULUM READ POLICIES:
-- Authenticated users (admins & teachers) can read boards, classes, courses, subjects, chapters, topics
drop policy if exists "Authenticated users can read boards" on public.boards;
create policy "Authenticated users can read boards"
  on public.boards for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can read classes" on public.classes;
create policy "Authenticated users can read classes"
  on public.classes for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can read courses" on public.courses;
create policy "Authenticated users can read courses"
  on public.courses for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can read subjects" on public.subjects;
create policy "Authenticated users can read subjects"
  on public.subjects for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can read chapters" on public.chapters;
create policy "Authenticated users can read chapters"
  on public.chapters for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can read topics" on public.topics;
create policy "Authenticated users can read topics"
  on public.topics for select
  using (auth.role() = 'authenticated');

-- CURRICULUM WRITE POLICIES: Only role = 'admin' can insert/update/delete
create policy "Only admin can insert boards" on public.boards for insert with check (public.is_admin());
create policy "Only admin can update boards" on public.boards for update using (public.is_admin());
create policy "Only admin can delete boards" on public.boards for delete using (public.is_admin());

create policy "Only admin can insert classes" on public.classes for insert with check (public.is_admin());
create policy "Only admin can update classes" on public.classes for update using (public.is_admin());
create policy "Only admin can delete classes" on public.classes for delete using (public.is_admin());

create policy "Only admin can insert courses" on public.courses for insert with check (public.is_admin());
create policy "Only admin can update courses" on public.courses for update using (public.is_admin());
create policy "Only admin can delete courses" on public.courses for delete using (public.is_admin());

create policy "Only admin can insert subjects" on public.subjects for insert with check (public.is_admin());
create policy "Only admin can update subjects" on public.subjects for update using (public.is_admin());
create policy "Only admin can delete subjects" on public.subjects for delete using (public.is_admin());

create policy "Only admin can insert chapters" on public.chapters for insert with check (public.is_admin());
create policy "Only admin can update chapters" on public.chapters for update using (public.is_admin());
create policy "Only admin can delete chapters" on public.chapters for delete using (public.is_admin());

create policy "Only admin can insert topics" on public.topics for insert with check (public.is_admin());
create policy "Only admin can update topics" on public.topics for update using (public.is_admin());
create policy "Only admin can delete topics" on public.topics for delete using (public.is_admin());

-- QUESTIONS & QUESTION_TRANSLATIONS POLICIES:
-- "Questions and translations are NOT publicly readable. Only role = 'admin' can write."
-- Logged-out visitor cannot read questions.
drop policy if exists "Only admin can read questions" on public.questions;
create policy "Only admin can read questions"
  on public.questions for select
  using (public.is_admin());

drop policy if exists "Only admin can insert questions" on public.questions;
create policy "Only admin can insert questions"
  on public.questions for insert
  with check (public.is_admin());

drop policy if exists "Only admin can update questions" on public.questions;
create policy "Only admin can update questions"
  on public.questions for update
  using (public.is_admin());

drop policy if exists "Only admin can delete questions" on public.questions;
create policy "Only admin can delete questions"
  on public.questions for delete
  using (public.is_admin());

-- QUESTION TRANSLATIONS POLICIES
drop policy if exists "Only admin can read translations" on public.question_translations;
create policy "Only admin can read translations"
  on public.question_translations for select
  using (public.is_admin());

drop policy if exists "Only admin can insert translations" on public.question_translations;
create policy "Only admin can insert translations"
  on public.question_translations for insert
  with check (public.is_admin());

drop policy if exists "Only admin can update translations" on public.question_translations;
create policy "Only admin can update translations"
  on public.question_translations for update
  using (public.is_admin());

drop policy if exists "Only admin can delete translations" on public.question_translations;
create policy "Only admin can delete translations"
  on public.question_translations for delete
  using (public.is_admin());

-- PAPER PATTERNS POLICIES
drop policy if exists "Authenticated users can read paper patterns" on public.paper_patterns;
create policy "Authenticated users can read paper patterns"
  on public.paper_patterns for select
  using (auth.role() = 'authenticated');

drop policy if exists "Only admin can manage paper patterns" on public.paper_patterns;
create policy "Only admin can manage paper patterns"
  on public.paper_patterns for all
  using (public.is_admin())
  with check (public.is_admin());
