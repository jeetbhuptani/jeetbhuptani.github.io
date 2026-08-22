/**
 * "Currently reading" data (plan U13/R10/R11).
 * Primary source: Hardcover GraphQL (status_id 2 = currently-reading), schema
 * confirmed against the live API. Fallback: Goodreads per-shelf RSS (no auth,
 * public API is dead since 2020). Pure normalizers are exported for unit tests;
 * the network functions wrap them.
 */

export type Book = {
  title: string;
  author: string;
  cover?: string;
  accent?: string;
};

export type BooksResult = {
  status: "ok" | "empty" | "error";
  source: "hardcover" | "goodreads" | "none";
  books: Book[];
};

export type ShelfBook = Book & {
  status: "reading" | "read" | "dnf";
  /** Primary genre, picked as the highest-`count` Hardcover genre tag. */
  genre?: string;
  /** Jeet's own 1-5 rating. Hardcover returns null unless he has rated the
   *  book there, so this is frequently absent and must render conditionally. */
  rating?: number;
  year?: number;
  pages?: number;
};
export type ShelfResult = { status: "ok" | "empty" | "error"; books: ShelfBook[] };

const HARDCOVER_ENDPOINT = "https://api.hardcover.app/v1/graphql";
const GOODREADS_USER = "200870435-jeet-bhuptani";
const CURRENTLY_READING_QUERY = `query CurrentlyReading {
  me {
    user_books(where: { status_id: { _eq: 2 } }) {
      book {
        title
        contributions { author { name } }
        image { url }
        cached_image
      }
    }
  }
}`;

// ---- pure normalizers (unit-tested) ----

export function normalizeHardcover(data: any): Book[] {
  const userBooks = data?.me?.[0]?.user_books ?? [];
  return userBooks
    .map((ub: any): Book | null => {
      const book = ub?.book;
      if (!book?.title) return null;
      return {
        title: book.title,
        author: book.contributions?.[0]?.author?.name ?? "Unknown",
        cover: book.image?.url ?? book.cached_image?.url,
        accent: book.cached_image?.color,
      };
    })
    .filter(Boolean) as Book[];
}

const SHELF_QUERY = `query Shelf {
  me {
    user_books(where: { status_id: { _in: [2, 3, 5] } }) {
      status_id
      rating
      book {
        title
        contributions { author { name } }
        image { url }
        cached_image
        cached_tags
        release_year
        pages
      }
    }
  }
}`;

/**
 * Genre tags Hardcover applies so broadly that they say nothing about a book.
 * "Fiction" on a novel is not a shelf worth having; the next tag down is.
 */
const UNINFORMATIVE_GENRES = new Set([
  "fiction",
  "nonfiction",
  "non-fiction",
  "general",
  "books",
  "adult",
  "spanish",
]);

/**
 * Pick one display genre from Hardcover's `cached_tags.Genre` array.
 *
 * Tags come back ordered arbitrarily with a crowd-sourced `count`, so we take
 * the highest count and fall back down the list when the winner is a
 * catch-all. Returns undefined rather than "Unknown" so callers can decide how
 * an ungenred book is shelved.
 */
export function pickGenre(cachedTags: any): string | undefined {
  const genres: any[] = cachedTags?.Genre ?? [];
  const ranked = [...genres]
    .filter((g) => typeof g?.tag === "string")
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));

  const specific = ranked.find((g) => !UNINFORMATIVE_GENRES.has(g.tag.toLowerCase()));
  return (specific ?? ranked[0])?.tag;
}

export function normalizeShelf(data: any): ShelfBook[] {
  const userBooks = data?.me?.[0]?.user_books ?? [];
  return userBooks
    .map((ub: any): ShelfBook | null => {
      const book = ub?.book;
      if (!book?.title) return null;
      // status_id: 2 = reading, 3 = read, 5 = did-not-finish
      const status = ub.status_id === 2 ? "reading" : ub.status_id === 5 ? "dnf" : "read";
      return {
        title: book.title,
        author: book.contributions?.[0]?.author?.name ?? "Unknown",
        cover: book.image?.url ?? book.cached_image?.url,
        accent: book.cached_image?.color,
        status,
        genre: pickGenre(book.cached_tags),
        // Hardcover returns null until the book is rated there; keep it absent
        // rather than 0 so "no rating" and "rated zero" stay distinguishable.
        rating: typeof ub.rating === "number" ? ub.rating : undefined,
        year: typeof book.release_year === "number" ? book.release_year : undefined,
        pages: typeof book.pages === "number" ? book.pages : undefined,
      };
    })
    .filter(Boolean) as ShelfBook[];
}

export async function getBookshelf(): Promise<ShelfResult> {
  const token = process.env.HARDCOVER_API_TOKEN;
  if (!token) return { status: "empty", books: [] };
  try {
    const res = await fetch(HARDCOVER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
      body: JSON.stringify({ query: SHELF_QUERY }),
      next: { revalidate: 3600 }, // shelf reflects Hardcover changes within ~1h

    });
    if (!res.ok) throw new Error(`Hardcover ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error("Hardcover GraphQL error");
    const books = normalizeShelf(json.data);
    // currently-reading first, then finished, then did-not-finish
    const rank = { reading: 0, read: 1, dnf: 2 } as const;
    books.sort((a, b) => rank[a.status] - rank[b.status] || a.title.localeCompare(b.title));
    return books.length ? { status: "ok", books } : { status: "empty", books: [] };
  } catch {
    return { status: "error", books: [] };
  }
}

export function parseGoodreadsRss(xml: string): Book[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const pick = (block: string, tag: string) => {
    const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
    if (!m) return undefined;
    return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
  };
  return items
    .map((block): Book | null => {
      const title = pick(block, "title");
      if (!title) return null;
      return {
        title,
        author: pick(block, "author_name") ?? "Unknown",
        cover:
          pick(block, "book_large_image_url") ??
          pick(block, "book_image_url") ??
          pick(block, "book_medium_image_url"),
      };
    })
    .filter(Boolean) as Book[];
}

// ---- network ----

async function fromHardcover(token: string): Promise<Book[]> {
  const res = await fetch(HARDCOVER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    },
    body: JSON.stringify({ query: CURRENTLY_READING_QUERY }),
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Hardcover ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error("Hardcover GraphQL error");
  return normalizeHardcover(json.data);
}

async function fromGoodreads(): Promise<Book[]> {
  const res = await fetch(
    `https://www.goodreads.com/review/list_rss/${GOODREADS_USER}?shelf=currently-reading&per_page=10`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) throw new Error(`Goodreads ${res.status}`);
  return parseGoodreadsRss(await res.text());
}

export async function getCurrentlyReading(): Promise<BooksResult> {
  const token = process.env.HARDCOVER_API_TOKEN;
  if (token) {
    try {
      const books = await fromHardcover(token);
      if (books.length) return { status: "ok", source: "hardcover", books };
    } catch {
      /* fall through to Goodreads */
    }
  }
  try {
    const books = await fromGoodreads();
    return books.length
      ? { status: "ok", source: "goodreads", books }
      : { status: "empty", source: "none", books: [] };
  } catch {
    return { status: "error", source: "none", books: [] };
  }
}
