import { ImageResponse } from "next/og";
import { getPost } from "@/data/blog";

export const alt = "Blog post — Jeet Bhuptani";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  const title = post?.metadata?.title ?? "Blog";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#100e0c",
          color: "#ece7df",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, color: "#9b958c" }}>
          JEETBHUPTANI.ME / BLOG
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#9b958c" }}>Jeet Bhuptani</div>
      </div>
    ),
    { ...size }
  );
}
