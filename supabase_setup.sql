-- ============================================================
-- Ambrosia — Supabase Setup
-- Paste this entire file into Supabase SQL Editor and run it.
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================


-- ── 1. supplements ──────────────────────────────────────────
create table if not exists supplements (
  id            uuid        default gen_random_uuid() primary key,
  device_id     text        not null,
  name          text        not null,
  dosage        text,
  frequency     text        default 'daily',
  reminder_times text[]     default '{}',
  notes         text,
  created_at    timestamptz default now()
);

alter table supplements enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'supplements' and policyname = 'device access'
  ) then
    create policy "device access" on supplements for all using (true) with check (true);
  end if;
end $$;


-- ── 2. nutrients ─────────────────────────────────────────────
create table if not exists nutrients (
  id                uuid        default gen_random_uuid() primary key,
  device_id         text,
  name_en           text        not null,
  name_ko           text        not null,
  description_en    text        default '',
  description_ko    text        default '',
  unit              text        not null default 'mg',
  recommended_daily numeric,
  category          text        default 'Other',
  created_at        timestamptz default now()
);

alter table nutrients enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'nutrients' and policyname = 'open'
  ) then
    create policy "open" on nutrients for all using (true) with check (true);
  end if;
end $$;


-- ── 3. supplement_nutrients ──────────────────────────────────
create table if not exists supplement_nutrients (
  id                 uuid    default gen_random_uuid() primary key,
  supplement_id      uuid    not null references supplements(id) on delete cascade,
  nutrient_id        uuid    not null references nutrients(id)   on delete cascade,
  amount_per_serving numeric not null default 0,
  unique(supplement_id, nutrient_id)
);

alter table supplement_nutrients enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'supplement_nutrients' and policyname = 'open'
  ) then
    create policy "open" on supplement_nutrients for all using (true) with check (true);
  end if;
end $$;


-- ── 4. intake_logs ───────────────────────────────────────────
create table if not exists intake_logs (
  id            uuid  default gen_random_uuid() primary key,
  device_id     text  not null,
  supplement_id uuid  not null references supplements(id) on delete cascade,
  taken_date    date  not null default current_date,
  created_at    timestamptz default now(),
  unique(device_id, supplement_id, taken_date)
);

alter table intake_logs enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'intake_logs' and policyname = 'open'
  ) then
    create policy "open" on intake_logs for all using (true) with check (true);
  end if;
end $$;
