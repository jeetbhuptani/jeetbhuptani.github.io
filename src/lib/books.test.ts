import { describe, it, expect } from "vitest";
import { normalizeHardcover, parseGoodreadsRss, normalizeShelf, pickGenre } from "./books";

describe("normalizeHardcover", () => {
  it("maps the live Hardcover currently-reading shape", () => {
    const data = {
      me: [
        {
          user_books: [
            {
              book: {
                title: "Corporate Chanakya",
                contributions: [{ author: { name: "Radhakrishnan Pillai" } }],
                image: { url: "https://assets.hardcover.app/cover.jpeg" },
                cached_image: { color: "#f6f5f2" },
              },
            },
          ],
        },
      ],
    };
    expect(normalizeHardcover(data)).toEqual([
      {
        title: "Corporate Chanakya",
        author: "Radhakrishnan Pillai",
        cover: "https://assets.hardcover.app/cover.jpeg",
        accent: "#f6f5f2",
      },
    ]);
  });

  it("returns [] for an empty shelf and falls back gracefully on missing fields", () => {
    expect(normalizeHardcover({ me: [{ user_books: [] }] })).toEqual([]);
    expect(normalizeHardcover({})).toEqual([]);
    const noAuthor = { me: [{ user_books: [{ book: { title: "X" } }] }] };
    expect(normalizeHardcover(noAuthor)[0].author).toBe("Unknown");
  });
});

describe("parseGoodreadsRss", () => {
  it("extracts title/author/cover from an RSS item with CDATA", () => {
    const xml = `<rss><channel><item>
      <title><![CDATA[The Pragmatic Programmer]]></title>
      <author_name><![CDATA[Andy Hunt]]></author_name>
      <book_large_image_url><![CDATA[https://i.gr-assets.com/cover.jpg]]></book_large_image_url>
    </item></channel></rss>`;
    expect(parseGoodreadsRss(xml)).toEqual([
      {
        title: "The Pragmatic Programmer",
        author: "Andy Hunt",
        cover: "https://i.gr-assets.com/cover.jpg",
      },
    ]);
  });

  it("returns [] when there are no items", () => {
    expect(parseGoodreadsRss("<rss><channel></channel></rss>")).toEqual([]);
  });
});

describe("normalizeShelf", () => {
  it("labels status_id 5 as dnf, not as read", () => {
    const shelf = normalizeShelf({
      me: [
        {
          user_books: [
            { status_id: 5, book: { title: "Abandoned", contributions: [] } },
          ],
        },
      ],
    });
    expect(shelf[0]).toMatchObject({ title: "Abandoned", status: "dnf" });
  });

  it("carries the rating through only when Hardcover returns a number", () => {
    const shelf = normalizeShelf({
      me: [
        {
          user_books: [
            { status_id: 3, rating: 4.5, book: { title: "Rated" } },
            { status_id: 3, rating: null, book: { title: "Unrated" } },
          ],
        },
      ],
    });
    expect(shelf.find((b) => b.title === "Rated")?.rating).toBe(4.5);
    // null must not become 0 — "unrated" and "rated zero" are different.
    expect(shelf.find((b) => b.title === "Unrated")?.rating).toBeUndefined();
  });

  it("labels status_id 2 as reading and 3 as read", () => {
    const data = {
      me: [
        {
          user_books: [
            { status_id: 3, book: { title: "The Metamorphosis", contributions: [{ author: { name: "Kafka" } }] } },
            { status_id: 2, book: { title: "Corporate Chanakya" } },
          ],
        },
      ],
    };
    const shelf = normalizeShelf(data);
    expect(shelf).toHaveLength(2);
    expect(shelf[0]).toMatchObject({ title: "The Metamorphosis", author: "Kafka", status: "read" });
    expect(shelf[1]).toMatchObject({ title: "Corporate Chanakya", status: "reading" });
  });
});

describe("pickGenre", () => {
  const tag = (t: string, count: number) => ({ tag: t, count });

  it("prefers the highest-count genre", () => {
    expect(pickGenre({ Genre: [tag("Finance", 4), tag("Money", 1)] })).toBe("Finance");
  });

  it("skips catch-all genres in favour of something specific", () => {
    // "Fiction" wins on count but says nothing about the book.
    expect(pickGenre({ Genre: [tag("Fiction", 9), tag("Suspense", 2)] })).toBe("Suspense");
  });

  it("falls back to the catch-all when it is the only tag", () => {
    expect(pickGenre({ Genre: [tag("Fiction", 9)] })).toBe("Fiction");
  });

  it("returns undefined when there are no genre tags", () => {
    expect(pickGenre({ Genre: [] })).toBeUndefined();
    expect(pickGenre(undefined)).toBeUndefined();
    expect(pickGenre({})).toBeUndefined();
  });
});
