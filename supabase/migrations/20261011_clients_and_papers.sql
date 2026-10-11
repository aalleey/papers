-- ==============================================================================
-- Migration: Clients, Papers History, and Email Outbox Isolation
-- Separates live production data from localhost development data.
-- ==============================================================================

-- 1. Clients Table (Educator Profiles and Subscriptions)
create table if not exists public.clients (
  id text primary key,
  email text not null,
  full_name text not null,
  academy_name text,
  phone text,
  role text not null default 'client',
  subscription jsonb not null default '{}'::jsonb,
  notes text,
  environment text not null default 'production', -- 'production' or 'development'
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Index for searching clients by email and environment
create index if not exists idx_clients_email_env on public.clients(email, environment);
create index if not exists idx_clients_env on public.clients(environment);

-- 2. Papers History Table
create table if not exists public.papers (
  id text primary key,
  client_id text references public.clients(id) on delete cascade,
  title text not null,
  institution text not null,
  subject text not null,
  class_name text not null,
  syllabus text,
  mcq_count integer default 0,
  short_count integer default 0,
  long_count integer default 0,
  question_count integer default 0,
  total_marks integer default 0,
  language_mode text default 'Bilingual',
  version text default 'A',
  export_mode text default 'all',
  environment text not null default 'production', -- 'production' or 'development'
  created_at timestamptz not null default now()
);

create index if not exists idx_papers_client_env on public.papers(client_id, environment);
create index if not exists idx_papers_env on public.papers(environment);

-- 3. Email Outbox Table
create table if not exists public.email_outbox (
  id text primary key,
  recipient_email text not null,
  recipient_name text not null,
  subject text not null,
  template text not null default 'welcome',
  status text not null default 'sent',
  preview_text text,
  html_content text,
  error text,
  environment text not null default 'production', -- 'production' or 'development'
  created_at timestamptz not null default now()
);

create index if not exists idx_email_outbox_env on public.email_outbox(environment);

-- 4. Enable Row Level Security (RLS)
alter table public.clients enable row level security;
alter table public.papers enable row level security;
alter table public.email_outbox enable row level security;

-- Policies allowing service role / admin full access
create policy "Allow service role full access to clients"
  on public.clients
  using (true)
  with check (true);

create policy "Allow service role full access to papers"
  on public.papers
  using (true)
  with check (true);

create policy "Allow service role full access to email_outbox"
  on public.email_outbox
  using (true)
  with check (true);
