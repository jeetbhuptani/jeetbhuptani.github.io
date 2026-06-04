import { describe, it, expect } from "vitest";
import { readingTime, extractHeadings } from "./blog-utils";

describe("readingTime", () => {
  it("estimates minutes from word count and floors at 1", () => {
    expect(readingTime("<p>" + "word ".repeat(400) + "</p>")).toBe(2);
    expect(readingTime("<p>short</p>")).toBe(1);
  });
});

describe("extractHeadings", () => {
  it("pulls h2/h3 with ids and strips inner tags", () => {
    const html =
      '<h2 id="intro">Intro</h2><p>x</p><h3 id="setup">The <code>setup</code></h3><h2 id="end">End</h2>';
    expect(extractHeadings(html)).toEqual([
      { level: 2, id: "intro", text: "Intro" },
      { level: 3, id: "setup", text: "The setup" },
      { level: 2, id: "end", text: "End" },
    ]);
  });

  it("returns [] when there are no headings with ids", () => {
    expect(extractHeadings("<p>no headings</p>")).toEqual([]);
  });
});
