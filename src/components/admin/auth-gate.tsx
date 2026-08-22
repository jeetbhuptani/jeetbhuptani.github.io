"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getBrowserClient } from "@/lib/supabase/client";

/**
 * The three auth screens for /admin, chosen by the server-computed AdminState:
 * sign in -> enrol a TOTP factor (first run only) -> verify a code each session.
 *
 * All three live in one client component because they share the Supabase
 * browser client and the same "submit, show error, refresh" shape; splitting
 * them would mean three copies of that plumbing.
 */

function Shell({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col justify-center gap-6">
      <header className="space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Admin
        </span>
        <h1 className="font-sans text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      </header>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-foreground/40";
const buttonClass =
  "w-full rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50";

function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

export function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserClient();
    if (!supabase) return setError("Supabase is not configured.");

    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    // A correct password lands at AAL1; the server then decides whether a TOTP
    // step is still owed. Refreshing re-runs that decision.
    if (error) setError(error.message);
    else router.refresh();
  }

  return (
    <Shell title="Sign in" hint="This panel is restricted to a single account.">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          required
          autoComplete="username"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <ErrorNote message={error} />
        <button type="submit" disabled={busy} className={buttonClass}>
          {busy ? "Signing in…" : "Continue"}
        </button>
      </form>
    </Shell>
  );
}

export function EnrollTotp() {
  const router = useRouter();
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function begin() {
    const supabase = getBrowserClient();
    if (!supabase) return setError("Supabase is not configured.");
    setBusy(true);
    setError(null);

    // Re-enrolling leaves unverified factors behind, which then block future
    // enrollment with "factor already exists" — clear them first.
    const { data: existing } = await supabase.auth.mfa.listFactors();
    for (const f of existing?.all ?? []) {
      if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `portfolio-admin-${Date.now()}`,
    });
    setBusy(false);
    if (error) return setError(error.message);

    setFactorId(data.id);
    setQr(data.totp.qr_code); // an SVG data URL — no QR library needed
    setSecret(data.totp.secret);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserClient();
    if (!supabase || !factorId) return;
    setBusy(true);
    setError(null);

    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr) {
      setBusy(false);
      return setError(cErr.message);
    }
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    setBusy(false);
    if (vErr) setError(vErr.message);
    else router.refresh();
  }

  return (
    <Shell
      title="Set up 2FA"
      hint="Scan this with an authenticator app. Writes stay blocked until a code is verified."
    >
      {!qr ? (
        <>
          <ErrorNote message={error} />
          <button onClick={begin} disabled={busy} className={buttonClass}>
            {busy ? "Preparing…" : "Generate QR code"}
          </button>
        </>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL from
              Supabase; next/image cannot optimise it and would only add cost. */}
          <img
            src={qr}
            alt="TOTP enrollment QR code"
            className="mx-auto size-44 rounded-lg border border-border bg-white p-2"
          />
          {secret ? (
            <p className="break-all text-center font-mono text-[10px] text-muted-foreground">
              {secret}
            </p>
          ) : null}
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className={`${inputClass} text-center font-mono tracking-[0.4em]`}
          />
          <ErrorNote message={error} />
          <button type="submit" disabled={busy || code.length !== 6} className={buttonClass}>
            {busy ? "Verifying…" : "Verify & enable"}
          </button>
        </form>
      )}
    </Shell>
  );
}

export function ChallengeTotp() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);

    const { data: factors, error: fErr } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp?.[0];
    if (fErr || !factor) {
      setBusy(false);
      return setError(fErr?.message ?? "No TOTP factor found on this account.");
    }

    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });
    if (cErr) {
      setBusy(false);
      return setError(cErr.message);
    }

    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code,
    });
    setBusy(false);
    if (vErr) setError(vErr.message);
    else router.refresh();
  }

  return (
    <Shell title="Two-factor" hint="Enter the current code from your authenticator app.">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoFocus
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className={`${inputClass} text-center font-mono text-lg tracking-[0.4em]`}
        />
        <ErrorNote message={error} />
        <button type="submit" disabled={busy || code.length !== 6} className={buttonClass}>
          {busy ? "Verifying…" : "Verify"}
        </button>
      </form>
    </Shell>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await getBrowserClient()?.auth.signOut();
        router.refresh();
      }}
      className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
    >
      Sign out
    </button>
  );
}
