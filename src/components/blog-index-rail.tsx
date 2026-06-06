import Link from "next/link";

type RailPost = { slug: string; metadata: Record<string, any> };

/**
 * Fixed left-margin index of all posts, shown on blog post pages (lg+) so the
 * reader can browse to another post while reading. The current post is
 * highlighted. Hidden on smaller screens, where the "← Blog" link covers it.
 */
export function BlogIndexRail({ posts, current }: { posts: RailPost[]; current: string }) {
  return (
    <nav
      aria-label="All posts"
      className="fixed left-5 top-28 z-40 hidden w-44 flex-col gap-3 xl:flex"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Posts
      </span>
      <ul className="flex flex-col gap-2.5">
        {posts.map((p) => {
          const on = p.slug === current;
          return (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                data-cursor
                aria-current={on ? "page" : undefined}
                className={`flex gap-1.5 text-xs leading-snug transition-colors ${
                  on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={on ? "text-foreground" : "text-border"}>—</span>
                <span className="line-clamp-2">{p.metadata.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
