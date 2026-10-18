create table if not exists public.invoices (
  id text primary key,
  invoice_number text not null unique,
  client_id text references public.clients(id) on delete set null,
  client_name text not null,
  client_email text not null,
  academy_name text,
  description text not null,
  amount numeric(12,2) not null,
  status text not null default 'draft',
  due_date date,
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  payment_method text,
  transaction_ref text,
  notes text,
  environment text not null default 'production'
);

create index if not exists idx_invoices_environment_issued on public.invoices(environment, issued_at desc);
alter table public.invoices enable row level security;
create policy "Allow service role full access to invoices" on public.invoices using (true) with check (true);
