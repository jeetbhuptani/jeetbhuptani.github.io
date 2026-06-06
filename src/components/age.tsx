"use client";

import { computeAge } from "@/lib/age";

/**
 * Renders the author's age in the visitor's browser at render time, so it is
 * always current — the previous build-time computation froze at deploy and went
 * stale (see U3 / R16). suppressHydrationWarning covers the once-a-year case
 * where the server build value and the client clock differ across a birthday.
 * The pure calc lives in @/lib/age for unit testing.
 */
export function Age({ birth }: { birth: string }) {
  return <span suppressHydrationWarning>{computeAge(birth)}</span>;
}
