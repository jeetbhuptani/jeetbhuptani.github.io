import { getPublicClient } from "@/lib/supabase/server";

import {
  SEED_BOOK_OVERRIDES,
  SEED_LIFE,
  SEED_SKILLS,
  SEED_WORK,
  SKILL_CATEGORY_ORDER,
  TRACK_ORDER,
} from "./seed";
import {
  RESUME_CERTIFICATES,
  RESUME_HACKATHONS,
  RESUME_NAV,
  RESUME_PROFILE,
  RESUME_PROJECTS,
  RESUME_SOCIALS,
  RESUME_TIMELINE,
} from "./from-resume";
import type {
  BookOverride,
  Certificate,
  Hackathon,
  LifeEntry,
  NavItem,
  Post,
  Profile,
  Project,
  Skill,
  SocialLink,
  TimelineEntry,
  WorkEntry,
} from "./types";

/**
 * The content adapter every page reads through.
 *
 * Reads Supabase when it is configured, and falls back to the committed seed
 * data otherwise — including when Supabase is configured but *fails*, which
 * matters because the Supabase free tier pauses a project after 7 days idle.
 * A paused DB degrades to the seed content rather than to an error page.
 */

/** Shared cache window. Content changes rarely and /admin revalidates the
 *  affected paths on write, so a long window costs nothing in freshness. */
const REVALIDATE_SECONDS = 3600;

async function fromTable<T>(
  table: string,
  order: string,
  fallback: T[],
  fresh = false
): Promise<T[]> {
  const supabase = getPublicClient(fresh);
  if (!supabase) return fallback;

  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("published", true)
      .order(order, { ascending: true });

    if (error) throw error;
    // An empty table on a fresh project is not a reason to show nothing —
    // fall back so the site never renders a blank section by accident.
    return data?.length ? (data as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export async function getWork(fresh = false): Promise<WorkEntry[]> {
  return fromTable<WorkEntry>("work_entries", "sort_order", SEED_WORK, fresh);
}

export async function getLife(fresh = false): Promise<LifeEntry[]> {
  return fromTable<LifeEntry>("life_entries", "sort_order", SEED_LIFE, fresh);
}

export async function getSkills(fresh = false): Promise<Skill[]> {
  const supabase = getPublicClient(fresh);
  if (!supabase) return SEED_SKILLS;
  try {
    // No `published` column on skills — every row is public by definition.
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data?.length ? (data as Skill[]) : SEED_SKILLS;
  } catch {
    return SEED_SKILLS;
  }
}

export async function getBookOverrides(fresh = false): Promise<Map<string, BookOverride>> {
  const supabase = getPublicClient(fresh);
  const rows = await (async (): Promise<BookOverride[]> => {
    if (!supabase) return SEED_BOOK_OVERRIDES;
    try {
      const { data, error } = await supabase.from("book_overrides").select("*");
      if (error) throw error;
      return (data as BookOverride[]) ?? SEED_BOOK_OVERRIDES;
    } catch {
      return SEED_BOOK_OVERRIDES;
    }
  })();
  return new Map(rows.map((r) => [r.slug, r]));
}

// ---- grouping helpers (pure, unit-tested) ----

/** Stable slug used to join Hardcover titles to book_overrides rows. */
export function bookSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/**
 * Group rows by a key, ordering groups by an explicit preference list first and
 * then alphabetically. Keeps a category added from /admin from disappearing.
 */
export function groupOrdered<T>(
  rows: T[],
  keyOf: (row: T) => string,
  preferred: string[]
): { key: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = keyOf(row);
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  }

  return Array.from(groups.entries())
    .map(([key, items]) => ({ key, items }))
    .sort((a, b) => {
      const ai = preferred.indexOf(a.key);
      const bi = preferred.indexOf(b.key);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.key.localeCompare(b.key);
    });
}

export { REVALIDATE_SECONDS, SKILL_CATEGORY_ORDER, TRACK_ORDER };
export type {
  BookOverride,
  Certificate,
  Hackathon,
  LifeEntry,
  NavItem,
  Post,
  Profile,
  Project,
  Skill,
  SocialLink,
  TimelineEntry,
  WorkEntry,
};

// ---------------------------------------------------------------------------
// The rest of the site content (migration 0002). Same contract as above: read
// Supabase when configured, fall back to the committed projection of DATA.
// ---------------------------------------------------------------------------

export async function getProfile(fresh = false): Promise<Profile> {
  const supabase = getPublicClient(fresh);
  if (!supabase) return RESUME_PROFILE;
  try {
    const { data, error } = await supabase.from("profile").select("*").limit(1).maybeSingle();
    if (error) throw error;
    return (data as Profile) ?? RESUME_PROFILE;
  } catch {
    return RESUME_PROFILE;
  }
}

export async function getSocials(fresh = false): Promise<SocialLink[]> {
  return fromTableUnpublished<SocialLink>("social_links", RESUME_SOCIALS, fresh);
}

export async function getNavItems(fresh = false): Promise<NavItem[]> {
  return fromTableUnpublished<NavItem>("nav_items", RESUME_NAV, fresh);
}

export async function getTimeline(fresh = false): Promise<TimelineEntry[]> {
  return fromTable<TimelineEntry>("timeline_entries", "sort_order", RESUME_TIMELINE, fresh);
}

export async function getProjects(fresh = false): Promise<Project[]> {
  return fromTable<Project>("projects", "sort_order", RESUME_PROJECTS, fresh);
}

export async function getHackathons(fresh = false): Promise<Hackathon[]> {
  return fromTable<Hackathon>("hackathons", "sort_order", RESUME_HACKATHONS, fresh);
}

export async function getCertificates(fresh = false): Promise<Certificate[]> {
  return fromTable<Certificate>("certificates", "sort_order", RESUME_CERTIFICATES, fresh);
}

/** Tables with no `published` column — every row is public by definition. */
async function fromTableUnpublished<T>(
  table: string,
  fallback: T[],
  fresh = false
): Promise<T[]> {
  const supabase = getPublicClient(fresh);
  if (!supabase) return fallback;
  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data?.length ? (data as T[]) : fallback;
  } catch {
    return fallback;
  }
}

/** Convenience: timeline filtered to one kind, which is how pages consume it. */
export function byKind<T extends { kind: string }>(rows: T[], kind: T["kind"]): T[] {
  return rows.filter((r) => r.kind === kind);
}
