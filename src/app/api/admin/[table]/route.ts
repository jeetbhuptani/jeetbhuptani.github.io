import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { AdminAuthError, requireAdmin } from "@/lib/supabase/auth";
import { CONTENT_TAG, getServiceClient } from "@/lib/supabase/server";

/**
 * The single write path for all admin content mutations.
 *
 * Every request is re-authorised server-side with requireAdmin(), which
 * demands both the right email and an AAL2 (2FA-verified) session. Only after
 * that do we reach for the service-role client, which bypasses RLS. A tampered
 * browser session gets nowhere because the browser never holds a write key.
 *
 * Payloads are validated per-table with zod and then written by explicit field,
 * so an extra key in the request body cannot set a column we did not intend
 * (e.g. flipping `published` on a row the UI never exposes).
 */

export const dynamic = "force-dynamic";

const workSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  track: z.string().min(1).max(60),
  period_start: z.string().regex(/^\d{4}-\d{2}$/, "expected yyyy-MM"),
  period_end: z.string().regex(/^\d{4}-\d{2}$/).nullable().optional(),
  summary: z.string().max(2000).default(""),
  highlights: z.array(z.string().max(600)).max(20).default([]),
  metrics: z.array(z.string().max(120)).max(12).default([]),
  tech: z.array(z.string().max(60)).max(30).default([]),
  sort_order: z.number().int().default(100),
  published: z.boolean().default(true),
});

const lifeSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(60),
  note: z.string().max(1000).nullable().optional(),
  media_id: z.string().max(300).nullable().optional(),
  media_type: z.enum(["image", "video"]).nullable().optional(),
  date_label: z.string().max(60).nullable().optional(),
  sort_order: z.number().int().default(100),
  published: z.boolean().default(true),
});

const skillSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(60),
  category: z.string().min(1).max(60),
  weight: z.number().int().min(1).max(3).default(2),
  sort_order: z.number().int().default(100),
});

const bookSchema = z.object({
  slug: z.string().min(1).max(80),
  rating: z.number().min(0).max(5).nullable().optional(),
  genre: z.string().max(60).nullable().optional(),
  note: z.string().max(600).nullable().optional(),
  featured: z.boolean().default(false),
});


// ---- migration 0002 collections ----

const linkSchema = z.object({
  label: z.string().min(1).max(60),
  href: z.string().min(1).max(500),
  icon: z.string().max(80).optional(),
});

const profileSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  initials: z.string().max(8).default(""),
  url: z.string().max(200).default(""),
  location: z.string().max(120).default(""),
  location_link: z.string().max(500).nullable().optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  description: z.string().max(1000).default(""),
  summary: z.string().max(4000).default(""),
  avatar_url: z.string().max(500).nullable().optional(),
  email: z.string().max(200).default(""),
  tel: z.string().max(40).nullable().optional(),
  // The unique index on this column is what keeps profile a singleton.
  singleton: z.literal(true).default(true),
});

const socialSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(60),
  url: z.string().min(1).max(500),
  icon: z.string().max(80).default("globe"),
  navbar: z.boolean().default(true),
  sort_order: z.number().int().default(100),
});

const navSchema = z.object({
  id: z.string().uuid().optional(),
  href: z.string().min(1).max(200),
  label: z.string().min(1).max(60),
  icon: z.string().max(80).default("globe"),
  sort_order: z.number().int().default(100),
});

const timelineSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["work", "volunteer", "education"]),
  org: z.string().min(1).max(200),
  role: z.string().max(200).default(""),
  href: z.string().max(500).nullable().optional(),
  logo_url: z.string().max(500).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  period_start: z.string().max(40).default(""),
  period_end: z.string().max(40).nullable().optional(),
  description: z.string().max(3000).nullable().optional(),
  badges: z.array(z.string().max(60)).max(10).default([]),
  sort_order: z.number().int().default(100),
  published: z.boolean().default(true),
});

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["project", "showcase"]).default("project"),
  title: z.string().min(1).max(200),
  href: z.string().max(500).nullable().optional(),
  dates: z.string().max(80).default(""),
  active: z.boolean().default(true),
  description: z.string().max(3000).default(""),
  technologies: z.array(z.string().max(60)).max(40).default([]),
  links: z.array(linkSchema).max(10).default([]),
  image: z.string().max(500).nullable().optional(),
  video: z.string().max(500).nullable().optional(),
  motif: z.string().max(60).nullable().optional(),
  sort_order: z.number().int().default(100),
  published: z.boolean().default(true),
});

const hackathonSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  dates: z.string().max(80).default(""),
  location: z.string().max(120).default(""),
  description: z.string().max(3000).default(""),
  image: z.string().max(500).nullable().optional(),
  links: z.array(linkSchema).max(10).default([]),
  sort_order: z.number().int().default(100),
  published: z.boolean().default(true),
});

const certificateSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  issuer: z.string().max(120).default(""),
  date_label: z.string().max(60).default(""),
  description: z.string().max(2000).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  credential_id: z.string().max(200).nullable().optional(),
  links: z.array(linkSchema).max(10).default([]),
  sort_order: z.number().int().default(100),
  published: z.boolean().default(true),
});

const postSchema = z.object({
  id: z.string().uuid().optional(),
  // Slugs are the URL, so restrict them rather than accepting free text.
  slug: z.string().min(1).max(120).regex(/^[A-Za-z0-9_-]+$/, "letters, numbers, - and _ only"),
  title: z.string().min(1).max(300),
  summary: z.string().max(1000).default(""),
  body: z.string().max(200000).default(""),
  image: z.string().max(500).nullable().optional(),
  published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected yyyy-MM-dd"),
  published: z.boolean().default(true),
});

/** Table registry: schema, primary key, and which public paths to bust. */
const TABLES = {
  work_entries: { schema: workSchema, pk: "id", paths: ["/work", "/"] },
  life_entries: { schema: lifeSchema, pk: "id", paths: ["/life"] },
  skills: { schema: skillSchema, pk: "id", paths: ["/", "/work"] },
  book_overrides: { schema: bookSchema, pk: "slug", paths: ["/bookshelf"] },
  // migration 0002. `profile`, socials and nav render in the root layout, so a
  // change to any of them has to bust every page, not just one.
  profile: { schema: profileSchema, pk: "singleton", paths: ["/", "/work", "/blog", "/life", "/bookshelf", "/certificate"] },
  social_links: { schema: socialSchema, pk: "id", paths: ["/", "/work", "/blog", "/life", "/bookshelf", "/certificate"] },
  nav_items: { schema: navSchema, pk: "id", paths: ["/", "/work", "/blog", "/life", "/bookshelf", "/certificate"] },
  timeline_entries: { schema: timelineSchema, pk: "id", paths: ["/", "/work"] },
  projects: { schema: projectSchema, pk: "id", paths: ["/"] },
  hackathons: { schema: hackathonSchema, pk: "id", paths: ["/"] },
  certificates: { schema: certificateSchema, pk: "id", paths: ["/certificate"] },
  // The post's own page is /blog/<slug>, which the static list cannot name —
  // without this an edit would refresh the index and leave the post itself
  // showing the pre-edit content.
  posts: { schema: postSchema, pk: "id", paths: ["/blog"], dynamicPath: (row: any) => `/blog/${row.slug}` },
} as const;

type TableName = keyof typeof TABLES;

function isTable(name: string): name is TableName {
  return name in TABLES;
}

function authFailure(err: unknown) {
  if (err instanceof AdminAuthError) {
    const code = err.reason === "anonymous" ? 401 : 403;
    return NextResponse.json({ error: err.reason }, { status: code });
  }
  return null;
}

export async function POST(req: NextRequest, { params }: { params: { table: string } }) {
  try {
    await requireAdmin();
  } catch (err) {
    const fail = authFailure(err);
    if (fail) return fail;
    throw err;
  }

  if (!isTable(params.table)) {
    return NextResponse.json({ error: "unknown table" }, { status: 404 });
  }
  const config = TABLES[params.table];

  const body = await req.json().catch(() => null);
  const parsed = config.schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }

  // `config` is a union across the four tables, so the payload type is a union
  // too and PostgREST's generated overloads cannot resolve it. The row has
  // already been validated against this table's schema, so the cast is safe.
  const { error, data } = await supabase
    .from(params.table)
    .upsert(parsed.data as Record<string, unknown>, { onConflict: config.pk })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Both are needed: revalidateTag drops the cached Supabase *fetch*, and
  // revalidatePath drops the rendered *route*. Without the tag the page would
  // re-render against a stale cached query and show the pre-edit content.
  revalidateTag(CONTENT_TAG);
  config.paths.forEach((p) => revalidatePath(p));
  if ("dynamicPath" in config && data) {
    revalidatePath((config.dynamicPath as (r: any) => string)(data));
  }
  return NextResponse.json({ ok: true, row: data });
}

export async function DELETE(req: NextRequest, { params }: { params: { table: string } }) {
  try {
    await requireAdmin();
  } catch (err) {
    const fail = authFailure(err);
    if (fail) return fail;
    throw err;
  }

  if (!isTable(params.table)) {
    return NextResponse.json({ error: "unknown table" }, { status: 404 });
  }
  const config = TABLES[params.table];

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }

  const { error } = await supabase.from(params.table).delete().eq(config.pk, id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateTag(CONTENT_TAG);
  config.paths.forEach((p) => revalidatePath(p));
  return NextResponse.json({ ok: true });
}
