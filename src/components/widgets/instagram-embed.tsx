"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/**
 * Instagram embed-only (plan U12/R18) — token-free `embed.js` blockquotes for a
 * curated set of public post permalinks. No API, no token, no cron. If the
 * script is blocked, each blockquote degrades to a plain link. Renders nothing
 * when there are no posts (tile omitted, never an empty frame).
 */
export function InstagramEmbeds({ posts }: { posts: readonly string[] }) {
  useEffect(() => {
    if (!posts.length) return;
    const process = () => window.instgrm?.Embeds.process();
    const existing = document.getElementById("instagram-embed-js");
    if (existing) {
      process();
      return;
    }
    const s = document.createElement("script");
    s.id = "instagram-embed-js";
    s.async = true;
    s.src = "https://www.instagram.com/embed.js";
    s.onload = process;
    document.body.appendChild(s);
  }, [posts]);

  if (!posts.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {posts.map((url) => (
        <blockquote
          key={url}
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-width="100%"
        >
          <a href={url} target="_blank" rel="noreferrer">
            View on Instagram
          </a>
        </blockquote>
      ))}
    </div>
  );
}
