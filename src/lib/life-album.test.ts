import { describe, it, expect } from "vitest";
import type { LifeEntry } from "@/lib/content/types";
import { chapters, printWidth, span, yearOf } from "./life-album";

function entry(id: string, date_label: string | null): LifeEntry {
  return {
    id,
    title: id,
    category: "Moments",
    note: null,
    media_id: null,
    media_type: null,
    date_label,
    sort_order: 0,
    published: true,
  };
}

describe("yearOf", () => {
  it("reads a year out of a prose date", () => {
    expect(yearOf("8th May 2026")).toBe(2026);
    expect(yearOf("Aug 1999")).toBe(1999);
  });
  it("returns null when the label names no year", () => {
    expect(yearOf("last summer")).toBeNull();
    expect(yearOf(null)).toBeNull();
  });
  it("ignores numbers that are not plausible years", () => {
    expect(yearOf("all 4032 photos")).toBeNull();
  });
});

describe("chapters", () => {
  it("orders years newest first", () => {
    const got = chapters([entry("a", "Jan 2019"), entry("b", "Jun 2026"), entry("c", "2022")]);
    expect(got.map((c) => c.year)).toEqual([2026, 2022, 2019]);
  });

  it("keeps the incoming order within a year", () => {
    const got = chapters([entry("a", "Jan 2026"), entry("b", "Dec 2026")]);
    expect(got[0].items.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("gathers undated memories at the end", () => {
    const got = chapters([entry("a", "someday"), entry("b", "2020")]);
    expect(got.map((c) => c.year)).toEqual([2020, null]);
  });

  it("returns nothing for an empty album", () => {
    expect(chapters([])).toEqual([]);
  });
});

describe("span", () => {
  it("reports the years the album covers", () => {
    expect(span([entry("a", "2019"), entry("b", "2026"), entry("c", "no year")])).toEqual({
      from: 2019,
      to: 2026,
    });
  });
  it("is null when nothing is dated", () => {
    expect(span([entry("a", "one day")])).toBeNull();
  });
});

describe("printWidth", () => {
  it("gives a panorama the full measure and a tall photo the least", () => {
    expect(printWidth(3)).toBe("100%");
    expect(printWidth(9 / 16)).toBe("46%");
  });
  it("narrows monotonically as the picture gets taller", () => {
    const widths = [3, 1.5, 1, 0.75, 0.5].map((r) => Number.parseInt(printWidth(r), 10));
    expect(widths).toEqual([...widths].sort((a, b) => b - a));
  });
});
