import { getPosts } from "@/lib/content/posts";
import { Reveal } from "@/components/motion/reveal";
import { readingTime } from "@/lib/blog-utils";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Blog",
  description: "Writing on software, building, and the occasional detour.",
};

export default async function BlogPage() {
  // getPosts() already returns newest-first, from the database when it has
  // posts and from the committed .mdx files otherwise.
  const posts = await getPosts();

  return (
    <main className="flex flex-col gap-8">
      <Reveal>
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Blog
          </span>
        </div>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight">Writing</h1>
      </Reveal>

      <Reveal delay={0.05}>
        <ul className="flex flex-col">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                data-cursor
                className="group flex items-baseline justify-between gap-4 border-b border-border py-4"
              >
                <span className="font-medium text-foreground/90 transition-colors group-hover:text-foreground">
                  {post.metadata.title}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {formatDate(post.metadata.publishedAt)} · {readingTime(post.source)} min
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </main>
  );
}
