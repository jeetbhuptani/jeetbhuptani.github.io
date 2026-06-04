import { describe, it, expect } from "vitest";
import { normalizeGraphql, normalizeJogruber } from "./github";

describe("normalizeGraphql", () => {
  it("flattens calendar weeks and maps levels + pins", () => {
    const data = {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: 5,
            weeks: [
              {
                contributionDays: [
                  { date: "2026-01-01", contributionCount: 0, contributionLevel: "NONE" },
                  { date: "2026-01-02", contributionCount: 4, contributionLevel: "THIRD_QUARTILE" },
                ],
              },
            ],
          },
        },
        pinnedItems: {
          nodes: [
            {
              name: "arthaai",
              description: "wealth ai",
              url: "https://github.com/jeetbhuptani/arthaai",
              stargazerCount: 3,
              primaryLanguage: { name: "TypeScript", color: "#3178c6" },
            },
          ],
        },
      },
    };
    const r = normalizeGraphql(data);
    expect(r.total).toBe(5);
    expect(r.contributions).toEqual([
      { date: "2026-01-01", count: 0, level: 0 },
      { date: "2026-01-02", count: 4, level: 3 },
    ]);
    expect(r.repos[0]).toMatchObject({ name: "arthaai", stars: 3, language: "TypeScript" });
  });
});

describe("normalizeJogruber", () => {
  it("maps the token-free contributions shape and sums total", () => {
    const data = {
      contributions: [
        { date: "2026-01-01", count: 2, level: 1 },
        { date: "2026-01-02", count: 3, level: 2 },
      ],
    };
    const r = normalizeJogruber(data);
    expect(r.total).toBe(5);
    expect(r.repos).toEqual([]);
    expect(r.contributions).toHaveLength(2);
  });
});
