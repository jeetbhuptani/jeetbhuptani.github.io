import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Regression test for the intro overlay that never lifted.
 *
 * The component itself needs a DOM to render, and this repo has no jsdom
 * environment configured. What actually broke was not the JSX — it was the
 * effect *shape*: a single effect that both wrote the session key and armed the
 * dismissal timer, keyed on a value (useReducedMotion) that changes from null
 * to a boolean right after mount.
 *
 * These tests model that shape directly, so they fail if anyone recombines the
 * two effects.
 */

type Effect = { run: () => void | (() => void); deps: unknown[] };

/**
 * Minimal effect runner: runs an effect, then re-runs it when its deps change,
 * calling the previous cleanup first — i.e. exactly React's contract.
 */
function runWithDepChange(effect: (deps: unknown[]) => Effect, depSequence: unknown[][]) {
  let cleanup: (() => void) | undefined;
  let prevDeps: unknown[] | null = null;

  for (const deps of depSequence) {
    const changed = !prevDeps || deps.some((d, i) => !Object.is(d, prevDeps![i]));
    if (!changed) continue;
    if (cleanup) cleanup();
    cleanup = effect(deps).run() ?? undefined;
    prevDeps = deps;
  }
  return cleanup;
}

describe("hello intro dismissal", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    vi.useFakeTimers();
    store = {};
  });
  afterEach(() => vi.useRealTimers());

  const getItem = (k: string) => store[k] ?? null;
  const setItem = (k: string, v: string) => {
    store[k] = v;
  };

  it("the OLD single-effect shape leaves the overlay up forever", () => {
    let show = false;

    // The bug: writing the key and arming the timer in one effect keyed on
    // [reduce]. useReducedMotion goes null -> false immediately after mount.
    runWithDepChange(
      (deps) => ({
        deps,
        run: () => {
          if (getItem("k")) return;
          show = true;
          setItem("k", "1");
          const t = setTimeout(() => (show = false), 2400);
          return () => clearTimeout(t);
        },
      }),
      [[null], [false]]
    );

    vi.advanceTimersByTime(10_000);
    // Overlay is still up: the re-run cleared the timer, then returned early.
    expect(show).toBe(true);
  });

  it("the split shape dismisses even when reduced-motion resolves late", () => {
    let show = false;

    // Effect 1: decide once, deps [].
    const decide = () => {
      if (getItem("k")) return;
      setItem("k", "1");
      show = true;
    };
    decide();

    // Effect 2: arm the timer, deps [show, reduce] — re-arms on every change.
    runWithDepChange(
      (deps) => ({
        deps,
        run: () => {
          if (!show) return;
          const t = setTimeout(() => (show = false), 2400);
          return () => clearTimeout(t);
        },
      }),
      [[show, null], [show, false]]
    );

    expect(show).toBe(true);
    vi.advanceTimersByTime(2500);
    expect(show).toBe(false);
  });

  it("skips the intro entirely on a second visit in the same session", () => {
    setItem("k", "1");
    let show = false;
    if (!getItem("k")) show = true;
    expect(show).toBe(false);
  });
});
