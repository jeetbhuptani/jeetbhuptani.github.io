-- Portfolio content schema.
--
-- Run this once in the Supabase SQL editor (Dashboard -> SQL -> New query).
--
-- Security model, in one place:
--   * Every table is RLS-enabled with a public SELECT policy limited to
--     published rows. That is what lets the site read with the anon key and
--     ship no API layer for reads.
--   * There is NO insert/update/delete policy for anon or authenticated.
--     Writes therefore go only through the service-role key, which bypasses
--     RLS and lives server-side behind the AAL2 admin guard. This is the
--     deliberate choice: one write path, guarded once, instead of trying to
--     express "is a 2FA-verified admin" in policy SQL.

-- ---------------------------------------------------------------- work_entries
create table if not exists public.work_entries (
  id            uuid primary key default gen_random_uuid(),
  title         text        not null,
  track         text        not null default 'Backend',
  period_start  text        not null,             -- 'yyyy-MM'
  period_end    text,                             -- null = ongoing
  summary       text        not null default '',
  highlights    text[]      not null default '{}',
  metrics       text[]      not null default '{}',
  tech          text[]      not null default '{}',
  sort_order    integer     not null default 100,
  published     boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------- life_entries
create table if not exists public.life_entries (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  category    text        not null default 'Friends',
  note        text,
  media_id    text,                                -- Cloudinary public_id
  media_type  text check (media_type in ('image', 'video')),
  date_label  text,
  sort_order  integer     not null default 100,
  published   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------- skills
create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  category    text        not null default 'Backend',
  weight      integer     not null default 2 check (weight between 1 and 3),
  sort_order  integer     not null default 100,
  created_at  timestamptz not null default now(),
  unique (name, category)
);

-- ------------------------------------------------------------- book_overrides
-- Layered over the live Hardcover response; keyed by a slug of the title so it
-- survives Hardcover changing its internal ids.
create table if not exists public.book_overrides (
  slug       text primary key,
  rating     numeric(2,1) check (rating >= 0 and rating <= 5),
  genre      text,
  note       text,
  featured   boolean     not null default false,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------ RLS
alter table public.work_entries  enable row level security;
alter table public.life_entries  enable row level security;
alter table public.skills        enable row level security;
alter table public.book_overrides enable row level security;

drop policy if exists "public reads published work"  on public.work_entries;
create policy "public reads published work"
  on public.work_entries for select
  using (published = true);

drop policy if exists "public reads published life"  on public.life_entries;
create policy "public reads published life"
  on public.life_entries for select
  using (published = true);

drop policy if exists "public reads skills" on public.skills;
create policy "public reads skills"
  on public.skills for select
  using (true);

drop policy if exists "public reads book overrides" on public.book_overrides;
create policy "public reads book overrides"
  on public.book_overrides for select
  using (true);

-- ------------------------------------------------------------------- triggers
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists work_entries_touch on public.work_entries;
create trigger work_entries_touch before update on public.work_entries
  for each row execute function public.touch_updated_at();

drop trigger if exists life_entries_touch on public.life_entries;
create trigger life_entries_touch before update on public.life_entries
  for each row execute function public.touch_updated_at();

drop trigger if exists book_overrides_touch on public.book_overrides;
create trigger book_overrides_touch before update on public.book_overrides
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------- indexes
create index if not exists work_entries_sort_idx on public.work_entries (sort_order)
  where published;
create index if not exists life_entries_sort_idx on public.life_entries (sort_order)
  where published;
create index if not exists skills_sort_idx on public.skills (category, sort_order);
