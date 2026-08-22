// Relative rather than the "@/" alias: the seed scripts run under plain Node,
// which does not resolve TypeScript path aliases.
import { DATA } from "../../data/resume.ts";

import type {
  Certificate,
  ContentLink,
  Hackathon,
  NavItem,
  Profile,
  Project,
  SocialLink,
  TimelineEntry,
} from "./types";

/**
 * Projects the committed `DATA` object into the database row shapes.
 *
 * This is the seed/fallback for everything in migration 0002. It is a
 * projection rather than a second copy of the content: duplicating ~500 lines
 * of resume data into a seed file would guarantee the two drift, and the drift
 * would only surface the day Supabase is unreachable — the exact moment the
 * fallback needs to be right.
 *
 * `DATA` is now plain data (icon *names*, no JSX), which is what makes this
 * projection possible at all.
 */

/** Seed rows carry readable ids; the columns are uuid-with-default, so the
 *  seeder drops them. They exist only to give React a stable key. */
const id = (prefix: string, i: number) => `${prefix}-${i}`;

function links(raw: readonly any[] | undefined): ContentLink[] {
  return (raw ?? []).map((l) => ({
    label: l.label ?? l.type ?? l.title ?? "Link",
    href: l.href,
    icon: typeof l.icon === "string" ? l.icon : undefined,
  }));
}

export const RESUME_PROFILE: Profile = {
  id: "seed-profile",
  name: DATA.name,
  initials: DATA.initials,
  url: DATA.url,
  location: DATA.location,
  location_link: DATA.locationLink ?? null,
  birth_date: DATA.birthDate ?? null,
  description: DATA.description,
  summary: DATA.summary,
  avatar_url: DATA.avatarUrl ?? null,
  email: DATA.contact.email,
  tel: DATA.contact.tel ?? null,
};

export const RESUME_SOCIALS: SocialLink[] = Object.entries(DATA.contact.social).map(
  ([key, s]: [string, any], i) => ({
    id: id("seed-social", i),
    name: s.name ?? key,
    url: s.url,
    icon: typeof s.icon === "string" ? s.icon : "globe",
    navbar: Boolean(s.navbar),
    sort_order: (i + 1) * 10,
  })
);

export const RESUME_NAV: NavItem[] = DATA.navbar.map((n: any, i: number) => ({
  id: id("seed-nav", i),
  href: n.href,
  label: n.label,
  icon: typeof n.icon === "string" ? n.icon : "globe",
  sort_order: (i + 1) * 10,
}));

export const RESUME_TIMELINE: TimelineEntry[] = [
  ...DATA.work.map((w: any, i: number) => ({
    id: id("seed-work", i),
    kind: "work" as const,
    org: w.company,
    role: w.title,
    href: w.href ?? null,
    logo_url: w.logoUrl ?? null,
    location: w.location ?? null,
    period_start: w.start,
    period_end: w.end === "Present" ? null : (w.end ?? null),
    description: w.description ?? null,
    badges: [...(w.badges ?? [])],
    sort_order: (i + 1) * 10,
    published: true,
  })),
  ...DATA.volunteer.map((w: any, i: number) => ({
    id: id("seed-vol", i),
    kind: "volunteer" as const,
    org: w.company,
    role: w.title,
    href: w.href ?? null,
    logo_url: w.logoUrl ?? null,
    location: w.location ?? null,
    period_start: w.start,
    period_end: w.end === "Present" ? null : (w.end ?? null),
    description: w.description ?? null,
    badges: [...(w.badges ?? [])],
    sort_order: (i + 1) * 10,
    published: true,
  })),
  ...DATA.education.map((e: any, i: number) => ({
    id: id("seed-edu", i),
    kind: "education" as const,
    org: e.school,
    // Education has no "role"; the degree is what belongs on that line.
    role: e.degree,
    href: e.href ?? null,
    logo_url: e.logoUrl ?? null,
    location: null,
    period_start: e.start,
    period_end: e.end ?? null,
    description: null,
    badges: [],
    sort_order: (i + 1) * 10,
    published: true,
  })),
];

export const RESUME_PROJECTS: Project[] = [
  ...DATA.showcase.map((p: any, i: number) => ({
    id: id("seed-showcase", i),
    kind: "showcase" as const,
    title: p.title,
    href: p.href ?? null,
    dates: p.dates,
    active: Boolean(p.active),
    description: p.description,
    technologies: [...(p.technologies ?? [])],
    links: links(p.links),
    image: p.image || null,
    video: p.video || null,
    motif: p.motif ?? null,
    sort_order: (i + 1) * 10,
    published: true,
  })),
  ...DATA.projects.map((p: any, i: number) => ({
    id: id("seed-project", i),
    kind: "project" as const,
    title: p.title,
    href: p.href ?? null,
    dates: p.dates,
    active: Boolean(p.active),
    description: p.description,
    technologies: [...(p.technologies ?? [])],
    links: links(p.links),
    image: p.image || null,
    video: p.video || null,
    motif: null,
    sort_order: (i + 1) * 10,
    published: true,
  })),
];

export const RESUME_HACKATHONS: Hackathon[] = DATA.hackathons.map((h: any, i: number) => ({
  id: id("seed-hack", i),
  title: h.title,
  dates: h.dates,
  location: h.location,
  description: h.description,
  image: h.image || null,
  links: links(h.links),
  sort_order: (i + 1) * 10,
  published: true,
}));

export const RESUME_CERTIFICATES: Certificate[] = DATA.certificates.map(
  (c: any, i: number) => ({
    id: id("seed-cert", i),
    title: c.title,
    issuer: c.issuer,
    date_label: c.date,
    description: c.description ?? null,
    image: c.image || null,
    credential_id: c.credentialId || null,
    links: links(c.links),
    sort_order: (i + 1) * 10,
    published: true,
  })
);
