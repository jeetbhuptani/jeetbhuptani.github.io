/**
 * Pushes the rest of the committed content into Supabase.
 *
 *   pnpm seed:full          # only writes to tables that are empty
 *   pnpm seed:full --force  # overwrite: deletes existing rows first
 *
 * Source of truth is the same projection the app falls back to
 * (src/lib/content/from-resume.ts) plus the content/*.mdx files, so what lands
 * in the database is exactly what the site renders today — not a retype.
 *
 * Same idempotency rule as scripts/seed-supabase.mts: refuse to touch a
 * non-empty table rather than upsert, because the seed rows carry readable ids
 * while the columns are uuid-with-default.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import {
  RESUME_CERTIFICATES,
  RESUME_HACKATHONS,
  RESUME_NAV,
  RESUME_PROFILE,
  RESUME_PROJECTS,
  RESUME_SOCIALS,
  RESUME_TIMELINE,
} from "../src/lib/content/from-resume.ts";

const force = process.argv.includes("--force");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Run via `pnpm seed:full`.");
  process.exit(1);
}
const origin = (() => {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
})();

const supabase = createClient(origin, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function withoutId<T extends { id: string }>(rows: T[]): Omit<T, "id">[] {
  return rows.map(({ id, ...rest }) => rest);
}

async function seed(table: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    console.log(`  ${table.padEnd(18)} — nothing to seed, skipped`);
    return;
  }
  const { count, error: countError } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (countError) {
    console.error(`  ${table.padEnd(18)} ✗ ${countError.message}`);
    process.exitCode = 1;
    return;
  }
  if (count && !force) {
    console.log(`  ${table.padEnd(18)} — already has ${count} rows, left alone (--force to replace)`);
    return;
  }
  if (count && force) {
    const { error } = await supabase.from(table).delete().not("id", "is", null);
    if (error) {
      console.error(`  ${table.padEnd(18)} ✗ clearing failed: ${error.message}`);
      process.exitCode = 1;
      return;
    }
  }
  const { error, count: inserted } = await supabase.from(table).insert(rows, { count: "exact" });
  if (error) {
    console.error(`  ${table.padEnd(18)} ✗ ${error.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`  ${table.padEnd(18)} ✓ inserted ${inserted ?? rows.length} rows`);
}

/** Blog frontmatter dates are RFC-2822 ("Sat, 18 April 2026 07:30:00 GMT");
 *  the column is a date, so normalise before inserting. */
function toIsoDate(value: string | undefined): string {
  if (!value) return new Date(0).toISOString().slice(0, 10);
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? new Date(0).toISOString().slice(0, 10)
    : d.toISOString().slice(0, 10);
}

function readPosts() {
  const dir = path.join(process.cwd(), "content");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      return {
        slug: f.replace(/\.mdx$/, ""),
        title: (data as any).title ?? f,
        summary: (data as any).summary ?? "",
        body: content,
        image: (data as any).image ?? null,
        published_at: toIsoDate((data as any).publishedAt),
        published: true,
      };
    });
}

console.log(`Seeding ${origin}${force ? " (--force: replacing existing rows)" : ""}\n`);

// profile is a singleton guarded by a unique index, so it is upserted on the
// `singleton` column rather than going through the empty-table check.
const { error: profileError } = await supabase
  .from("profile")
  .upsert({ ...withoutId([RESUME_PROFILE])[0], singleton: true }, { onConflict: "singleton" });
console.log(
  profileError ? `  profile            ✗ ${profileError.message}` : "  profile            ✓ upserted"
);
if (profileError) process.exitCode = 1;

await seed("social_links", withoutId(RESUME_SOCIALS));
await seed("nav_items", withoutId(RESUME_NAV));
await seed("timeline_entries", withoutId(RESUME_TIMELINE));
await seed("projects", withoutId(RESUME_PROJECTS));
await seed("hackathons", withoutId(RESUME_HACKATHONS));
await seed("certificates", withoutId(RESUME_CERTIFICATES));
await seed("posts", readPosts());

console.log("\nDone.");
