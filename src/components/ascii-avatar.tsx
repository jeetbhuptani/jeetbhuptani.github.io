"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const CHARS = " .:-=+*#%@";

/**
 * Renders the avatar as ASCII art (samples the image luminance into characters)
 * for the mono terminal vibe. Falls back to the plain photo if the image can't
 * be processed (e.g. CORS). Cols controls density.
 */
export function AsciiAvatar({
  src,
  alt,
  cols = 46,
  className,
}: {
  src: string;
  alt: string;
  cols?: number;
  className?: string;
}) {
  const [art, setArt] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      try {
        const ratio = img.height / img.width;
        const rows = Math.round(cols * ratio * 0.5); // monospace cells are ~2:1
        const canvas = document.createElement("canvas");
        canvas.width = cols;
        canvas.height = rows;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no ctx");
        ctx.drawImage(img, 0, 0, cols, rows);
        const { data } = ctx.getImageData(0, 0, cols, rows);
        let out = "";
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = (y * cols + x) * 4;
            const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
            out += CHARS[Math.min(CHARS.length - 1, Math.floor(lum * (CHARS.length - 1)))];
          }
          out += "\n";
        }
        setArt(out);
      } catch {
        setFailed(true);
      }
    };
    img.onerror = () => setFailed(true);
  }, [src, cols]);

  if (failed || !art) {
    return (
      <div className={className}>
        <Image src={src} alt={alt} width={112} height={112} className="size-full rounded-xl border border-border object-cover" />
      </div>
    );
  }

  return (
    <pre
      ref={ref}
      aria-label={alt}
      className={`w-fit overflow-hidden rounded-xl border border-border bg-card p-1.5 font-mono text-[4px] leading-[4px] text-foreground sm:text-[5px] sm:leading-[5px] ${className ?? ""}`}
    >
      {art}
    </pre>
  );
}
