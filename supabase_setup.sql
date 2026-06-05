-- ============================================================
-- Ambrosia — Supabase Setup
-- Paste this entire file into Supabase SQL Editor and run it.
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================


-- ── 1. supplements ──────────────────────────────────────────
create table if not exists supplements (
  id             uuid        default gen_random_uuid() primary key,
  device_id      text,
  name           text        not null,
  manufacturer   text,
  pills_per_dose numeric     default 1,
  doses_per_day  numeric     default 1,
  frequency      text        default 'daily',
  reminder_times text[]      default '{}',
  notes          text,
  created_at     timestamptz default now()
);

-- Add new columns if supplements table already exists
alter table supplements add column if not exists manufacturer   text;
alter table supplements add column if not exists pills_per_dose numeric default 1;
alter table supplements add column if not exists doses_per_day  numeric default 1;
alter table supplements add column if not exists created_by uuid references auth.users(id);

alter table supplements enable row level security;

-- Drop old open policies and create auth-based ones
do $$ begin
  drop policy if exists "device access" on supplements;
  drop policy if exists "open" on supplements;
exception when others then null; end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'supplements' and policyname = 'authenticated read'
  ) then
    create policy "authenticated read" on supplements for select using (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'supplements' and policyname = 'creator write'
  ) then
    create policy "creator write" on supplements for insert with check (auth.uid() = created_by);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'supplements' and policyname = 'creator update'
  ) then
    create policy "creator update" on supplements for update using (auth.uid() = created_by);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'supplements' and policyname = 'creator delete'
  ) then
    create policy "creator delete" on supplements for delete using (auth.uid() = created_by);
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

alter table nutrients add column if not exists created_by uuid references auth.users(id);

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
  device_id     text,
  supplement_id uuid  not null references supplements(id) on delete cascade,
  taken_date    date  not null default current_date,
  created_at    timestamptz default now()
);

alter table intake_logs add column if not exists user_id uuid references auth.users(id);

alter table intake_logs enable row level security;

do $$ begin
  drop policy if exists "open" on intake_logs;
exception when others then null; end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'intake_logs' and policyname = 'own'
  ) then
    create policy "own" on intake_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;


-- ── 5. user_supplements ──────────────────────────────────────
create table if not exists user_supplements (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        references auth.users(id) not null,
  supplement_id uuid        references supplements(id) on delete cascade not null,
  frequency     text        default 'daily',
  reminder_times text[]     default '{}',
  notes         text,
  created_at    timestamptz default now(),
  unique(user_id, supplement_id)
);

alter table user_supplements enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'user_supplements' and policyname = 'own'
  ) then
    create policy "own" on user_supplements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
