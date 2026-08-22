import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * config.ts reads process.env at module load, so each case needs a fresh module
 * registry rather than a re-import of the cached one.
 */
async function loadWith(env: Record<string, string | undefined>) {
  vi.resetModules();
  const previous = { ...process.env };
  Object.assign(process.env, env);
  try {
    return await import("./config");
  } finally {
    process.env = previous;
  }
}

afterEach(() => vi.resetModules());

describe("SUPABASE_URL normalisation", () => {
  it("strips the /rest/v1/ path that is easy to copy from the dashboard", async () => {
    // Regression: this exact value made every call, including sign-in, 404 by
    // producing /rest/v1/rest/v1/... once supabase-js appended its own path.
    const { SUPABASE_URL } = await loadWith({
      NEXT_PUBLIC_SUPABASE_URL: "https://abc123.supabase.co/rest/v1/",
    });
    expect(SUPABASE_URL).toBe("https://abc123.supabase.co");
  });

  it("strips a bare trailing slash", async () => {
    const { SUPABASE_URL } = await loadWith({
      NEXT_PUBLIC_SUPABASE_URL: "https://abc123.supabase.co/",
    });
    expect(SUPABASE_URL).toBe("https://abc123.supabase.co");
  });

  it("leaves an already-correct origin alone", async () => {
    const { SUPABASE_URL } = await loadWith({
      NEXT_PUBLIC_SUPABASE_URL: "https://abc123.supabase.co",
    });
    expect(SUPABASE_URL).toBe("https://abc123.supabase.co");
  });

  it("returns empty when unset, so isSupabaseConfigured() stays false", async () => {
    const { SUPABASE_URL, isSupabaseConfigured } = await loadWith({
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
    });
    expect(SUPABASE_URL).toBe("");
    expect(isSupabaseConfigured()).toBe(false);
  });
});

describe("key selection", () => {
  it("prefers the new publishable key over the legacy anon key", async () => {
    const { SUPABASE_ANON_KEY } = await loadWith({
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_new",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy_anon",
    });
    expect(SUPABASE_ANON_KEY).toBe("sb_publishable_new");
  });

  it("falls back to the legacy anon key, which is what Vercel injects", async () => {
    const { SUPABASE_ANON_KEY } = await loadWith({
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy_anon",
    });
    expect(SUPABASE_ANON_KEY).toBe("legacy_anon");
  });

  it("prefers the new secret key over the legacy service_role key", async () => {
    const { SUPABASE_SERVICE_KEY } = await loadWith({
      SUPABASE_SECRET_KEY: "sb_secret_new",
      SUPABASE_SERVICE_ROLE_KEY: "legacy_service",
    });
    expect(SUPABASE_SERVICE_KEY).toBe("sb_secret_new");
  });
});
