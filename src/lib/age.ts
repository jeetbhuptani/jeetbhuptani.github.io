/**
 * Pure age computation, split out of the JSX component so it can be unit-tested
 * without a JSX transform. `now` is injectable for deterministic tests.
 */
export function computeAge(birth: string, now: Date = new Date()): number {
  const birthDate = new Date(birth);
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
