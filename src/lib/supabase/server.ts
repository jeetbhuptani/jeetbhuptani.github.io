import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  assertServiceKey,
  isSupabaseConfigured,
} from "./config";

/**
 * Server-side Supabase clients.
 *
 * - `getServerClient()` carries the caller's auth cookies, so RLS applies and
 *   `auth.getUser()` reflects the signed-in admin. Use it for anything that
 *   depends on who is asking.
 * - `getServiceClient()` bypasses RLS with the service-role key. Only ever call
 *   it after `requireAdmin()` has verified an AAL2 session.
 * - `getPublicClient()` is anon + no cookies, for reading published content
 *   during static/ISR rendering where there is no request context.
 */

/** Cache tag for all public content reads. The admin write path revalidates it,
 *  which is what makes an edit show up immediately instead of after the TTL. */
export const CONTENT_TAG = "content";

/** How long a content read may be served from Next's fetch cache. */
export const CONTENT_REVALIDATE = 3600;

/**
 * supabase-js issues plain `fetch` calls, and Next's App Router caches those
 * indefinitely by default. That default is wrong here in a way that fails
 * silently: the first render of an empty table gets cached forever, and since
 * the content adapter treats "no rows" as "fall back to seed data", the site
 * keeps rendering seed content after the database is populated — looking
 * correct while being stale.
 *
 * Opting into an explicit revalidate window + a cache tag makes the caching
 * intentional and, crucially, bustable from the admin write path.
 */
const cachedFetch: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    next: { revalidate: CONTENT_REVALIDATE, tags: [CONTENT_TAG] },
  } as RequestInit);

/** Never cache: writes, and the reads the admin makes to render its editors. */
const freshFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

/** Cookie-bound client. Must be called inside a request scope. */
export function getServerClient() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    // Auth state must never be served from a cache.
    global: { fetch: freshFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware refreshes the session instead, so this is safe to skip.
        }
      },
    },
  });
}

/**
 * Anon client for public content reads.
 * @param fresh bypass the fetch cache — used by /admin so its editors always
 *              show current rows rather than a cached copy of them.
 */
export function getPublicClient(fresh = false) {
  if (!isSupabaseConfigured()) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fresh ? freshFetch : cachedFetch },
  });
}

/** Full-access client. Guard every call site with requireAdmin(). */
export function getServiceClient() {
  if (!isSupabaseConfigured()) return null;
  return createClient(SUPABASE_URL, assertServiceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: freshFetch },
  });
}
