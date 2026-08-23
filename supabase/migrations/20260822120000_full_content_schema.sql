-- Everything else that was hardcoded in src/data/resume.tsx and content/*.mdx.
--
-- Same security model as 0001: RLS on, public SELECT of published rows, and no
-- write policy for anon or authenticated. Writes reach the database only via
-- the service-role key behind the AAL2 admin guard.
--
-- Two shape decisions worth stating, because they halve the number of tables:
--
--  * work / volunteer / education are the same record — an organisation, a
--    role, a period and a blurb — so they share `timeline_entries` with a
--    `kind` discriminator rather than living in three near-identical tables.
--  * projects and the Ignosis showcase differ only in where they render, so
--    they share `projects` with a `kind` discriminator.
--
-- `links` is JSONB rather than a child table. It is always read as a whole,
-- never queried into, and a child table would mean a join on every card render.
-- Shape: [{ "label": "Source", "href": "https://…", "icon": "github" }]
-- `icon` is a key into the Icons map, resolved at render time — a database must
-- not store a component reference.

-- --------------------------------------------------------------------- profile
-- Single row. The `singleton` column + unique index is what stops a second
-- profile ever being inserted; without it a stray insert silently changes which
-- identity the site renders depending on row order.
create table if not exists public.profile (
  id            uuid primary key default gen_random_uuid(),
  singleton     boolean not null default true,
  name          text not null default '',
  initials      text not null default '',
  url           text not null default '',
  location      text not null default '',
  location_link text,
  birth_date    date,
  description   text not null default '',
  summary       text not null default '',
  avatar_url    text,
  email         text not null default '',
  tel           text,
  updated_at    timestamptz not null default now(),
  constraint profile_is_singleton check (singleton)
);
create unique index if not exists profile_singleton_idx on public.profile (singleton);

-- ---------------------------------------------------------------- social_links
create table if not exists public.social_links (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  url        text not null,
  icon       text not null default 'globe',
  navbar     boolean not null default true,
  sort_order integer not null default 100,
  unique (name)
);

-- ------------------------------------------------------------------- nav_items
create table if not exists public.nav_items (
  id         uuid primary key default gen_random_uuid(),
  href       text not null,
  label      text not null,
  icon       text not null default 'globe',
  sort_order integer not null default 100,
  unique (href)
);

-- ------------------------------------------------------------ timeline_entries
create table if not exists public.timeline_entries (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('work', 'volunteer', 'education')),
  org          text not null,
  role         text not null default '',
  href         text,
  logo_url     text,
  location     text,
  period_start text not null default '',
  period_end   text,
  description  text,
  badges       text[] not null default '{}',
  sort_order   integer not null default 100,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -------------------------------------------------------------------- projects
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null default 'project' check (kind in ('project', 'showcase')),
  title        text not null,
  href         text,
  dates        text not null default '',
  active       boolean not null default true,
  description  text not null default '',
  technologies text[] not null default '{}',
  links        jsonb not null default '[]'::jsonb,
  image        text,
  video        text,
  motif        text,
  sort_order   integer not null default 100,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------ hackathons
create table if not exists public.hackathons (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  dates       text not null default '',
  location    text not null default '',
  description text not null default '',
  image       text,
  links       jsonb not null default '[]'::jsonb,
  sort_order  integer not null default 100,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- certificates
create table if not exists public.certificates (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  issuer        text not null default '',
  date_label    text not null default '',
  description   text,
  image         text,
  credential_id text,
  links         jsonb not null default '[]'::jsonb,
  sort_order    integer not null default 100,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------- posts
-- `body` is raw markdown. It is rendered through the same unified/remark chain
-- the .mdx files used, so Shiki syntax highlighting is preserved — only the
-- source moves from the filesystem to Postgres.
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  summary      text not null default '',
  body         text not null default '',
  image        text,
  published_at date not null default current_date,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------------- RLS
alter table public.profile          enable row level security;
alter table public.social_links     enable row level security;
alter table public.nav_items        enable row level security;
alter table public.timeline_entries enable row level security;
alter table public.projects         enable row level security;
alter table public.hackathons       enable row level security;
alter table public.certificates     enable row level security;
alter table public.posts            enable row level security;

drop policy if exists "public reads profile" on public.profile;
create policy "public reads profile" on public.profile for select using (true);

drop policy if exists "public reads social links" on public.social_links;
create policy "public reads social links" on public.social_links for select using (true);

drop policy if exists "public reads nav items" on public.nav_items;
create policy "public reads nav items" on public.nav_items for select using (true);

drop policy if exists "public reads published timeline" on public.timeline_entries;
create policy "public reads published timeline"
  on public.timeline_entries for select using (published = true);

drop policy if exists "public reads published projects" on public.projects;
create policy "public reads published projects"
  on public.projects for select using (published = true);

drop policy if exists "public reads published hackathons" on public.hackathons;
create policy "public reads published hackathons"
  on public.hackathons for select using (published = true);

drop policy if exists "public reads published certificates" on public.certificates;
create policy "public reads published certificates"
  on public.certificates for select using (published = true);

drop policy if exists "public reads published posts" on public.posts;
create policy "public reads published posts"
  on public.posts for select using (published = true);

-- -------------------------------------------------------------------- triggers
drop trigger if exists profile_touch on public.profile;
create trigger profile_touch before update on public.profile
  for each row execute function public.touch_updated_at();

drop trigger if exists timeline_entries_touch on public.timeline_entries;
create trigger timeline_entries_touch before update on public.timeline_entries
  for each row execute function public.touch_updated_at();

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists hackathons_touch on public.hackathons;
create trigger hackathons_touch before update on public.hackathons
  for each row execute function public.touch_updated_at();

drop trigger if exists certificates_touch on public.certificates;
create trigger certificates_touch before update on public.certificates
  for each row execute function public.touch_updated_at();

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

-- --------------------------------------------------------------------- indexes
create index if not exists timeline_kind_sort_idx
  on public.timeline_entries (kind, sort_order) where published;
create index if not exists projects_kind_sort_idx
  on public.projects (kind, sort_order) where published;
create index if not exists posts_published_at_idx
  on public.posts (published_at desc) where published;
