/**
 * Supabase configuration + the single "is the DB wired up yet?" predicate.
 *
 * Everything else in the app branches on `isSupabaseConfigured()` rather than
 * reading env vars directly, so there is exactly one place that decides
 * whether we are in DB mode or seed mode.
 *
 * Key naming: Supabase replaced the JWT `anon` / `service_role` keys with
 * `sb_publishable_…` / `sb_secret_…`, and the legacy pair is deprecated at the
 * end of 2026. Both forms are accepted as drop-in values, so we read the new
 * variable names first and fall back to the legacy ones. The legacy names are
 * also what the Vercel<->Supabase integration auto-injects, which is why they
 * are still supported here rather than removed.
 */

const pick = (...values: (string | undefined)[]) => values.find(Boolean) ?? "";

/**
 * Normalise the project URL to its origin.
 *
 * The Supabase dashboard surfaces several URLs and the REST one
 * (`https://<ref>.supabase.co/rest/v1/`) is the easiest to copy by mistake.
 * supabase-js appends its own `/rest/v1/` and `/auth/v1/` paths, so a URL with
 * a path baked in produces `/rest/v1/rest/v1/...` and every call — including
 * sign-in — 404s, with no error message that points at the cause.
 *
 * Trimming to the origin makes the right thing happen whichever URL was
 * pasted, rather than failing in a way that looks like an auth bug.
 */
function normaliseUrl(raw: string | undefined): string {
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    // Not a parseable URL — hand it back untouched so the failure surfaces as
    // "bad configuration" rather than being silently swallowed to "".
    return raw;
  }
}

export const SUPABASE_URL = normaliseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);

/** Client-side key. Safe to expose — RLS is what protects the data. */
export const SUPABASE_ANON_KEY = pick(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Server-only. Bypasses RLS, so it must never be NEXT_PUBLIC_ and must never
 *  be imported into a client component. Used solely by admin write paths after
 *  the session has been verified at AAL2. */
export const SUPABASE_SERVICE_KEY = pick(
  process.env.SUPABASE_SECRET_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** The one email allowed to sign in to /admin. Anything else is rejected before
 *  a password is even checked, so the admin surface is not a general login. */
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function assertServiceKey(): string {
  if (!SUPABASE_SERVICE_KEY) {
    throw new Error(
      "Set SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) — admin writes are disabled."
    );
  }
  return SUPABASE_SERVICE_KEY;
}
