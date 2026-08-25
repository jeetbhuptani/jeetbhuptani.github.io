import { getServiceClient } from "@/lib/supabase/server";

/**
 * Table reads for /admin only. Three deliberate differences from the readers in
 * ./index.ts, each of which was causing a real bug:
 *
 * 1. **No seed fallback.** When a table is empty the public adapter substitutes
 *    the committed projection so the site never renders a blank section. The
 *    admin then rendered those projected rows as if they were database records
 *    — but their ids are `"seed-project-0"`, not uuids, so every save failed
 *    the API's `z.string().uuid()` check with a 422. The editor looked full and
 *    could not save a single row.
 *
 * 2. **No `published` filter.** The public reader selects `published = true`.
 *    Applied here, saving a row with Published unticked made it vanish from the
 *    editor as well as the site, with no way to reach it again short of the
 *    Supabase dashboard.
 *
 * 3. **Service-role client.** RLS grants anonymous SELECT on published rows
 *    only, so drafts are invisible to the anon key regardless of the filter.
 *    Safe here because /admin has already cleared `requireAdmin()` at AAL2.
 *
 * The result: what the editor shows is exactly what is in the table. An empty
 * table renders as empty — which is the truth, and is what tells you to seed it.
 */

export type AdminRows<T> = {
  rows: T[];
  /** False when the table is missing or errored — distinct from "no rows yet". */
  reachable: boolean;
  error?: string;
};

const EMPTY = <T,>(error?: string): AdminRows<T> => ({ rows: [], reachable: false, error });

export async function getAdminRows<T>(
  table: string,
  order: string | null = "sort_order"
): Promise<AdminRows<T>> {
  const supabase = getServiceClient();
  if (!supabase) return EMPTY<T>("supabase not configured");

  let query = supabase.from(table).select("*");
  if (order) query = query.order(order, { ascending: true });

  const { data, error } = await query;
  if (error) return EMPTY<T>(error.message);
  return { rows: (data ?? []) as T[], reachable: true };
}

/** Profile is a single row; return it or null rather than a one-item array. */
export async function getAdminSingleton<T>(
  table: string
): Promise<{ row: T | null; reachable: boolean; error?: string }> {
  const { rows, reachable, error } = await getAdminRows<T>(table, null);
  return { row: rows[0] ?? null, reachable, error };
}
