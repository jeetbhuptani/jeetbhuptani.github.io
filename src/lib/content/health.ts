import { getPublicClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Which content tables actually exist and answer queries.
 *
 * The content adapter swallows every read error on purpose — a paused free-tier
 * project or a table that was never created falls back to the committed seed so
 * the public site keeps rendering. That is right for visitors and wrong for the
 * admin: an editor bound to a table that returns 404 looks completely normal,
 * shows seed content as though it came from the database, and silently drops
 * every save. "A few tables aren't working" is exactly what that feels like.
 *
 * This probe re-runs the same reads *without* the fallback, so /admin can name
 * the broken tables instead of quietly pretending they are fine.
 */

export const CONTENT_TABLES = [
  "profile",
  "social_links",
  "nav_items",
  "timeline_entries",
  "work_entries",
  "projects",
  "posts",
  "life_entries",
  "skills",
  "book_overrides",
  "hackathons",
  "certificates",
] as const;

export type ContentTable = (typeof CONTENT_TABLES)[number];

export type TableHealth = {
  table: ContentTable;
  ok: boolean;
  /** Rows present, when the table answered. */
  count: number | null;
  /** PostgREST error code, e.g. PGRST205 for "table not found". */
  code?: string;
  message?: string;
};

export type ContentHealth = {
  configured: boolean;
  tables: TableHealth[];
  missing: TableHealth[];
  /** True when every table answered — the only state that needs no banner. */
  healthy: boolean;
};

/**
 * PostgREST reports an absent table as PGRST205 ("Could not find the table … in
 * the schema cache"). It is worth distinguishing, because that one has a single
 * cause — the migration was never run — while anything else is a live problem
 * with a working database.
 */
export const TABLE_MISSING_CODE = "PGRST205";

export async function getContentHealth(): Promise<ContentHealth> {
  if (!isSupabaseConfigured()) {
    return { configured: false, tables: [], missing: [], healthy: false };
  }

  // fresh: a cached probe would keep reporting a table as broken for an hour
  // after the migration that fixed it.
  const supabase = getPublicClient(true);
  if (!supabase) {
    return { configured: false, tables: [], missing: [], healthy: false };
  }

  const tables = await Promise.all(
    CONTENT_TABLES.map(async (table): Promise<TableHealth> => {
      try {
        // head:true asks for the count and no rows, so the probe stays cheap
        // even once these tables have real content in them.
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        if (error) {
          return { table, ok: false, count: null, code: error.code, message: error.message };
        }
        return { table, ok: true, count: count ?? 0 };
      } catch (err) {
        return {
          table,
          ok: false,
          count: null,
          message: err instanceof Error ? err.message : "probe failed",
        };
      }
    })
  );

  const missing = tables.filter((t) => !t.ok);
  return { configured: true, tables, missing, healthy: missing.length === 0 };
}
