import { describe, expect, it } from "vitest";

import { bookSlug, groupOrdered } from "@/lib/content";
import { SEED_IMPACT, SEED_WORK, TRACK_ORDER } from "@/lib/content/seed";
import {
  RESUME_HACKATHONS,
  RESUME_NAV,
  RESUME_PROJECTS,
  RESUME_SOCIALS,
  RESUME_TIMELINE,
} from "@/lib/content/from-resume";

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

describe("work seed content", () => {
  it("puts every entry on a known track", () => {
    // A typo in `track` doesn't fail anything — groupOrdered just files the
    // entry at the end under its own heading, which reads as a rendering bug.
    for (const entry of SEED_WORK) {
      expect(TRACK_ORDER, `${entry.title} is on an unlisted track`).toContain(entry.track);
    }
  });

  it("leads with the two highest-scale threads", () => {
    const ordered = [...SEED_WORK].sort((a, b) => a.sort_order - b.sort_order);
    expect(ordered.slice(0, 2).map((e) => e.track)).toEqual(["Integrations", "AI"]);
  });

  it("states an outcome, not just an activity, in every summary", () => {
    for (const entry of SEED_WORK) {
      expect(entry.summary.length, `${entry.title} has no summary`).toBeGreaterThan(40);
      expect(entry.highlights.length, `${entry.title} has no highlights`).toBeGreaterThan(0);
    }
  });

  it("carries the headline business numbers", () => {
    expect(SEED_IMPACT).toHaveLength(3);
    for (const stat of SEED_IMPACT) {
      expect(stat.value).toBeTruthy();
      expect(stat.label).toBeTruthy();
    }
  });
});

describe("resume fallback projection", () => {
  it("gives every project a title", () => {
    // Artha AI shipped with `label:` instead of `title:` and rendered with a
    // blank name for months. DATA.projects is mapped through `(p: any)`, so the
    // compiler had nothing to check — this is the check.
    for (const project of RESUME_PROJECTS) {
      expect(project.title, `project ${project.id} has no title`).toBeTruthy();
    }
  });

  it("gives every timeline entry and hackathon a name", () => {
    for (const entry of RESUME_TIMELINE) {
      expect(entry.org, `timeline ${entry.id} has no org`).toBeTruthy();
    }
    for (const hack of RESUME_HACKATHONS) {
      expect(hack.title, `hackathon ${hack.id} has no title`).toBeTruthy();
    }
  });

  it("points every social and nav item somewhere", () => {
    for (const social of RESUME_SOCIALS) {
      expect(social.url, `social ${social.name} has no url`).toBeTruthy();
    }
    for (const item of RESUME_NAV) {
      expect(item.href, `nav ${item.label} has no href`).toBeTruthy();
    }
  });
});
