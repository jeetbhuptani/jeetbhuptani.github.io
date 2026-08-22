import { describe, expect, it } from "vitest";

import { bookSlug, groupOrdered } from "@/lib/content";

describe("bookSlug", () => {
  it("is stable across punctuation and case", () => {
    expect(bookSlug("Not a Penny More, Not a Penny Less")).toBe(
      "not-a-penny-more-not-a-penny-less"
    );
  });

  it("strips diacritics so accented titles still match", () => {
    expect(bookSlug("Café Amérique")).toBe("cafe-amerique");
  });

  it("does not leave leading or trailing separators", () => {
    expect(bookSlug("  ...Hello!  ")).toBe("hello");
  });

  it("caps length so it always fits the primary key", () => {
    expect(bookSlug("a".repeat(200)).length).toBe(80);
  });
});

describe("groupOrdered", () => {
  const rows = [
    { k: "Zebra" },
    { k: "Backend" },
    { k: "Apple" },
    { k: "Backend" },
    { k: "AI" },
  ];

  it("puts preferred keys first, in the given order", () => {
    const out = groupOrdered(rows, (r) => r.k, ["Backend", "AI"]);
    expect(out.map((g) => g.key)).toEqual(["Backend", "AI", "Apple", "Zebra"]);
  });

  it("sorts unlisted keys alphabetically after the preferred ones", () => {
    const out = groupOrdered(rows, (r) => r.k, []);
    expect(out.map((g) => g.key)).toEqual(["AI", "Apple", "Backend", "Zebra"]);
  });

  it("collects every row into its group", () => {
    const out = groupOrdered(rows, (r) => r.k, ["Backend"]);
    expect(out[0].items).toHaveLength(2);
    expect(out.reduce((n, g) => n + g.items.length, 0)).toBe(rows.length);
  });
});
