import { ADMIN_EMAIL } from "./config";
import { getServerClient } from "./server";

/**
 * Admin session guard.
 *
 * Two independent conditions must both hold before any write is allowed:
 *
 *  1. The signed-in user's email matches ADMIN_EMAIL. Supabase Auth will happily
 *     authenticate any row in auth.users; this narrows it to exactly one person.
 *  2. The session is at AAL2 — i.e. a TOTP factor has been verified for *this*
 *     session, not merely enrolled on the account. Checking `nextLevel` rather
 *     than only `currentLevel` is what makes 2FA mandatory instead of optional:
 *     once a factor is enrolled, nextLevel becomes "aal2" forever, so a
 *     password-only session is detectable and rejected.
 */

export type AdminState =
  | { status: "anonymous" }
  | { status: "needs-enrollment"; email: string }
  | { status: "needs-2fa"; email: string }
  | { status: "forbidden"; email: string }
  | { status: "ok"; email: string; userId: string };

export async function getAdminState(): Promise<AdminState> {
  const supabase = getServerClient();
  if (!supabase) return { status: "anonymous" };

  // getUser() revalidates the JWT against Supabase; getSession() trusts the
  // cookie and is therefore not safe to authorise on.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { status: "anonymous" };

  if (ADMIN_EMAIL && user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return { status: "forbidden", email: user.email };
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  // No factor enrolled yet — first run. Let them through to the enrollment
  // screen only; writes stay blocked because status !== "ok".
  if (aal?.nextLevel !== "aal2") {
    return { status: "needs-enrollment", email: user.email };
  }
  if (aal.currentLevel !== "aal2") {
    return { status: "needs-2fa", email: user.email };
  }

  return { status: "ok", email: user.email, userId: user.id };
}

/** Throwing guard for route handlers. Returns the verified admin or throws. */
export async function requireAdmin(): Promise<{ email: string; userId: string }> {
  const state = await getAdminState();
  if (state.status !== "ok") {
    throw new AdminAuthError(state.status);
  }
  return { email: state.email, userId: state.userId };
}

export class AdminAuthError extends Error {
  constructor(public readonly reason: Exclude<AdminState["status"], "ok">) {
    super(`Admin auth failed: ${reason}`);
    this.name = "AdminAuthError";
  }
}
