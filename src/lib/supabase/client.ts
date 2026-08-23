"use client";

import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Browser Supabase client, used only by /admin.
 *
 * Auth (password sign-in, TOTP enrollment and challenge) has to run in the
 * browser because Supabase's MFA flow issues a challenge bound to the client
 * session. Content writes deliberately do NOT go through this client — they
 * post to route handlers that re-verify AAL2 server-side, so a tampered browser
 * session cannot write.
 */
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  if (!cached) cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}
