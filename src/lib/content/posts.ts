import { getBlogPosts, getPost as getFilePost, markdownToHTML } from "@/data/blog";
import { getPublicClient } from "@/lib/supabase/server";

import type { Post } from "./types";

/**
 * Blog posts, from Postgres with the `content/*.mdx` files as the fallback.
 *
 * Only the *source* of the markdown moved. Rendering still runs through the
 * same unified/remark/rehype chain in src/data/blog.ts, so Shiki syntax
 * highlighting, GFM tables and heading slugs behave exactly as before.
 *
 * Note the trade-off this makes: posts in a database are no longer versioned
 * by git. The .mdx files stay in the repo as the fallback, but once a post is
 * edited from /admin the database is authoritative and that edit has no diff.
 */

export type RenderedPost = {
  slug: string;
  metadata: { title: string; publishedAt: string; summary: string; image?: string };
  source: string;
};

/** Frontmatter dates are RFC-2822 strings ("Sat, 18 April 2026 07:30:00 GMT")
 *  while the column is a date. Normalise both to ISO for sorting and display. */
export function toIsoDate(value: string | undefined): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().slice(0, 10);
}

function toRendered(row: Post, html: string): RenderedPost {
  return {
    slug: row.slug,
    metadata: {
      title: row.title,
      publishedAt: toIsoDate(row.published_at),
      summary: row.summary,
      image: row.image ?? undefined,
    },
    source: html,
  };
}

/** Raw rows — used by /admin, which needs the markdown rather than the HTML. */
export async function getPostRows(fresh = false): Promise<Post[]> {
  const supabase = getPublicClient(fresh);
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data as Post[]) ?? [];
  } catch {
    return [];
  }
}

export async function getPosts(): Promise<RenderedPost[]> {
  const supabase = getPublicClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      if (data?.length) {
        return Promise.all(
          (data as Post[]).map(async (row) => toRendered(row, await markdownToHTML(row.body)))
        );
      }
    } catch {
      // fall through to the committed .mdx files
    }
  }

  const files = await getBlogPosts();
  return files
    .map((p: any) => ({
      slug: p.slug,
      metadata: { ...p.metadata, publishedAt: toIsoDate(p.metadata.publishedAt) },
      source: p.source,
    }))
    .sort((a, b) => (a.metadata.publishedAt < b.metadata.publishedAt ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<RenderedPost | null> {
  const supabase = getPublicClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      if (data) return toRendered(data as Post, await markdownToHTML((data as Post).body));
    } catch {
      // fall through
    }
  }

  try {
    const p: any = await getFilePost(slug);
    return {
      slug,
      metadata: { ...p.metadata, publishedAt: toIsoDate(p.metadata.publishedAt) },
      source: p.source,
    };
  } catch {
    return null;
  }
}
