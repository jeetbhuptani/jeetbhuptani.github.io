import { describe, it, expect } from "vitest";
import { computeAge } from "./age";

describe("computeAge", () => {
  it("computes age for a birthday already passed this year", () => {
    expect(computeAge("2004-08-01", new Date("2026-09-15"))).toBe(22);
  });
  it("does not count the birthday year before it lands", () => {
    expect(computeAge("2004-08-01", new Date("2026-07-31"))).toBe(21);
  });
  it("ticks over exactly on the birthday", () => {
    expect(computeAge("2004-08-01", new Date("2026-08-01"))).toBe(22);
  });
  it("returns 0 in the first year of life", () => {
    expect(computeAge("2026-01-01", new Date("2026-06-06"))).toBe(0);
  });
});
