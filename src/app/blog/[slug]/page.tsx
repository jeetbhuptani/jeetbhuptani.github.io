import { getBlogPosts, getPost } from "@/data/blog";
import { DATA } from "@/data/resume";
import { Reveal } from "@/components/motion/reveal";
import { extractHeadings, readingTime } from "@/lib/blog-utils";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const post = await getPost(params.slug);
  if (!post) return;
  const { title, publishedAt: publishedTime, summary: description, image } = post.metadata;
  // When the post supplies its own image, use it; otherwise the
  // opengraph-image.tsx file convention generates one automatically.
  const images = image ? [{ url: `${DATA.url}${image}` }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${DATA.url}/blog/${post.slug}`,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

export default async function Blog({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const headings = extractHeadings(post.source);
  const minutes = readingTime(post.source);
  const ogImage = post.metadata.image
    ? `${DATA.url}${post.metadata.image}`
    : `${DATA.url}/blog/${post.slug}/opengraph-image`;

  return (
    <main className="flex flex-col gap-8">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: ogImage,
            url: `${DATA.url}/blog/${post.slug}`,
            author: { "@type": "Person", name: DATA.name },
          }),
        }}
      />

      <Reveal>
        <Link
          href="/blog"
          data-cursor
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Blog
        </Link>
        <h1 className="mt-4 font-sans text-3xl font-semibold tracking-tight sm:text-4xl">
          {post.metadata.title}
        </h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {formatDate(post.metadata.publishedAt)} · {minutes} min read
        </p>
      </Reveal>

      {headings.length >= 3 ? (
        <nav aria-label="Table of contents" className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            On this page
          </p>
          <ul className="flex flex-col gap-1.5">
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? "pl-3" : undefined}>
                <a
                  href={`#${h.id}`}
                  data-cursor
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <article
        className="prose prose-neutral max-w-none font-sans dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-sans prose-headings:tracking-tight prose-a:text-foreground prose-a:underline-offset-2 prose-pre:rounded-lg prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: post.source }}
      />
    </main>
  );
}
