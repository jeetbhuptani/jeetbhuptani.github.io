/**
 * One-shot seeder: pushes the committed seed content into Supabase.
 *
 *   pnpm seed                                    # only writes to empty tables
 *   pnpm seed --force                            # overwrite: deletes rows first
 *   pnpm seed --force --only=work_entries        # ...just one table
 *
 * Why this exists: without it the first visit to /admin shows empty editors,
 * and the seven work entries and thirty-five skills would have to be retyped by
 * hand to get back to what the site already renders from seed.ts.
 *
 * Idempotency is by refusing to touch a non-empty table rather than by upsert,
 * because the seed rows carry human ids ("seed-dialer") while the columns are
 * uuid-with-default — there is no natural key to conflict on. Refusing is the
 * honest behaviour: re-running can't silently double the content.
 *
 * Run with plain `node` — Node 24 strips the TypeScript types natively, so the
 * script imports seed.ts directly and stays in sync with what the app renders.
 * The .mts extension marks it as ESM explicitly; adding "type": "module" to
 * package.json instead would break the CommonJS next.config.js.
 */
import { createClient } from "@supabase/supabase-js";

import { SEED_LIFE, SEED_SKILLS, SEED_WORK } from "../src/lib/content/seed.ts";

const force = process.argv.includes("--force");

/**
 * Restrict the run to named tables.
 *
 * Rewriting the work entries should not also blow away skills that were edited
 * from /admin, and without this `--force` is all-or-nothing across every table
 * the script knows about.
 */
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const only = onlyArg
  ? new Set(onlyArg.slice("--only=".length).split(",").map((t) => t.trim()).filter(Boolean))
  : null;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY.\n" +
      "Run via `pnpm seed`, which loads .env.local."
  );
  process.exit(1);
}

// Same normalisation as src/lib/supabase/config.ts: a URL with /rest/v1/ baked
// in produces a doubled path and every call 404s.
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

/** Seed rows carry readable ids ("seed-dialer"); the columns are uuid with a
 *  default, so the id must be dropped and left to Postgres. */
function withoutId<T extends { id: string }>(rows: T[]): Omit<T, "id">[] {
  return rows.map(({ id, ...rest }) => rest);
}

async function seed(table: string, rows: Record<string, unknown>[]) {
  if (only && !only.has(table)) {
    console.log(`  ${table.padEnd(14)} — not in --only, skipped`);
    return;
  }
  if (!rows.length) {
    console.log(`  ${table.padEnd(14)} — nothing to seed, skipped`);
    return;
  }

  const { count, error: countError } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error(`  ${table.padEnd(14)} ✗ ${countError.message}`);
    process.exitCode = 1;
    return;
  }

  if (count && !force) {
    console.log(`  ${table.padEnd(14)} — already has ${count} rows, left alone (--force to replace)`);
    return;
  }

  if (count && force) {
    // No `delete()` without a filter in PostgREST; `not.is.null` on the pk
    // matches every row.
    const { error } = await supabase.from(table).delete().not("id", "is", null);
    if (error) {
      console.error(`  ${table.padEnd(14)} ✗ clearing failed: ${error.message}`);
      process.exitCode = 1;
      return;
    }
  }

  const { error, count: inserted } = await supabase
    .from(table)
    .insert(rows, { count: "exact" });

  if (error) {
    console.error(`  ${table.padEnd(14)} ✗ ${error.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`  ${table.padEnd(14)} ✓ inserted ${inserted ?? rows.length} rows`);
}

console.log(
  `Seeding ${origin}${force ? " (--force: replacing existing rows)" : ""}` +
    `${only ? ` (--only: ${[...only].join(", ")})` : ""}\n`
);

await seed("work_entries", withoutId(SEED_WORK));
await seed("skills", withoutId(SEED_SKILLS));
await seed("life_entries", withoutId(SEED_LIFE));

console.log(
  "\nDone. book_overrides is intentionally not seeded — ratings come from" +
    "\nHardcover and are only overridden per-book from /admin."
);
