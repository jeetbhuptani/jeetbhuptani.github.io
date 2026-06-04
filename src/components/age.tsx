"use client";

/**
 * Computes the author's age in the visitor's browser at render time, so it is
 * always current — the previous build-time computation froze at deploy and went
 * stale (see U3 / R16). suppressHydrationWarning covers the once-a-year case
 * where the server build value and the client clock differ across a birthday.
 */
export function computeAge(birth: string): number {
  const birthDate = new Date(birth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function Age({ birth }: { birth: string }) {
  return <span suppressHydrationWarning>{computeAge(birth)}</span>;
}
