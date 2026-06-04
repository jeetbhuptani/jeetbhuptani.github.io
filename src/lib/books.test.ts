import { describe, it, expect } from "vitest";
import { normalizeHardcover, parseGoodreadsRss, normalizeShelf } from "./books";

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
