/**
 * Content model for the DB-backed sections of the site.
 *
 * Every type here has two sources: Supabase (live, edited from /admin) and a
 * committed seed file (src/lib/content/seed.ts). The adapter in ./index.ts
 * picks Supabase when it is configured and falls back to the seed otherwise,
 * so the site renders identically before and after the DB exists.
 *
 * Field names match the Postgres columns 1:1 (snake_case) to keep the
 * PostgREST mapping trivial — no per-row rename layer.
 */

/** A person on the /life page — family, friends, the people around the work. */
export type LifeEntry = {
  id: string;
  /** Display name, or a place/moment title. */
  title: string;
  /** "Family" | "Friends" | "Places" | ... — drives the page's grouping. */
  category: string;
  /** Free text; rendered as the card body. */
  note: string | null;
  /** Cloudinary public_id, not a URL — the URL is built at render time so we
   *  can apply f_auto/q_auto and pick a width per breakpoint. */
  media_id: string | null;
  media_type: "image" | "video" | null;
  /** Human date like "Aug 2026"; free text on purpose, dates here are fuzzy. */
  date_label: string | null;
  sort_order: number;
  published: boolean;
};

/** One entry on the /work timeline. Written to be publicly safe by
 *  construction: there is no field for a client or ticket id. */
export type WorkEntry = {
  id: string;
  title: string;
  /** "Backend" | "Data & Observability" | "Integrations" | ... */
  track: string;
  /** ISO yyyy-mm; the page buckets by month, so no day precision needed. */
  period_start: string;
  period_end: string | null;
  summary: string;
  /** Bullet points — the "what I actually did" detail. */
  highlights: string[];
  /** Quantified outcomes, e.g. "1,423-test suite". Rendered as stat chips. */
  metrics: string[];
  tech: string[];
  sort_order: number;
  published: boolean;
};

/** A skill chip, grouped into a named category. */
export type Skill = {
  id: string;
  name: string;
  /** "Languages" | "Backend" | "Data" | "Cloud & Infra" | "AI" | "Frontend" */
  category: string;
  /** 1–3: how prominently to render it. 3 = daily driver. */
  weight: number;
  sort_order: number;
};

/** Per-book overrides layered on top of the Hardcover API response.
 *  Keyed by a slug of the title so it survives Hardcover id changes. */
export type BookOverride = {
  slug: string;
  /** Your own 1–5 rating, used when Hardcover has none (it currently has none). */
  rating: number | null;
  /** Overrides the genre derived from Hardcover's cached_tags. */
  genre: string | null;
  note: string | null;
  /** Pin to the front of its shelf. */
  featured: boolean;
};

// ---------------------------------------------------------------------------
// The rest of the site content, migrated out of src/data/resume.tsx and
// content/*.mdx. Same rule as above: field names mirror the Postgres columns.
// ---------------------------------------------------------------------------

/**
 * A link rendered on a card. `icon` is a *name*, resolved to a component at
 * render time by iconByName() — a database cannot store a component reference,
 * and putting JSX in the data layer is what made resume.tsx a .tsx file.
 */
export type ContentLink = {
  label: string;
  href: string;
  icon?: string;
};

/** Singleton row: who the site is about. */
export type Profile = {
  id: string;
  name: string;
  initials: string;
  url: string;
  location: string;
  location_link: string | null;
  /** ISO date; the hero computes a live age from it. */
  birth_date: string | null;
  description: string;
  summary: string;
  avatar_url: string | null;
  email: string;
  tel: string | null;
};

export type SocialLink = {
  id: string;
  name: string;
  url: string;
  icon: string;
  /** Whether it appears in the navbar dock and the hero row. */
  navbar: boolean;
  sort_order: number;
};

export type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: string;
  sort_order: number;
};

/** work / volunteer / education share a shape: org, role, period, blurb. */
export type TimelineEntry = {
  id: string;
  kind: "work" | "volunteer" | "education";
  org: string;
  /** Job title, or the degree for education rows. */
  role: string;
  href: string | null;
  logo_url: string | null;
  location: string | null;
  period_start: string;
  period_end: string | null;
  description: string | null;
  badges: string[];
  sort_order: number;
  published: boolean;
};

/** `showcase` renders under Work; `project` renders in the Projects rail. */
export type Project = {
  id: string;
  kind: "project" | "showcase";
  title: string;
  href: string | null;
  dates: string;
  active: boolean;
  description: string;
  technologies: string[];
  links: ContentLink[];
  image: string | null;
  video: string | null;
  motif: string | null;
  sort_order: number;
  published: boolean;
};

export type Hackathon = {
  id: string;
  title: string;
  dates: string;
  location: string;
  description: string;
  image: string | null;
  links: ContentLink[];
  sort_order: number;
  published: boolean;
};

export type Certificate = {
  id: string;
  title: string;
  issuer: string;
  date_label: string;
  description: string | null;
  image: string | null;
  credential_id: string | null;
  links: ContentLink[];
  sort_order: number;
  published: boolean;
};

/** Blog post. `body` is raw markdown, rendered through the same unified chain
 *  the .mdx files used — only the source moved. */
export type Post = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  image: string | null;
  published_at: string;
  published: boolean;
};
