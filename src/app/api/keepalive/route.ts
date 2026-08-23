import { NextResponse } from "next/server";

import { getPublicClient } from "@/lib/supabase/server";

/**
 * Keeps the Supabase project awake.
 *
 * The free tier pauses a project after 7 consecutive days with no database
 * activity, and an un-pausing project fails reads — which would drop the whole
 * site back to seed content until someone noticed. A single cheap query a day
 * resets that timer. Wired to Vercel Cron in vercel.json.
 *
 * The content adapter already falls back to seed data on failure, so this is
 * belt-and-braces rather than the only defence.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getPublicClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, skipped: "supabase not configured" });
  }

  // head:true sends no rows back — the point is only to touch the database.
  const { error } = await supabase
    .from("skills")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
