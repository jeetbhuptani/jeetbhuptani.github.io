import Image from "next/image";

import { cldBlur, cldImage, cldVideo, cldVideoPoster } from "@/lib/cloudinary";
import { printWidth } from "@/lib/life-album";
import type { LifeEntry } from "@/lib/content/types";

export type Dimensions = { width: number; height: number } | null;

/** Used when Cloudinary cannot be asked for the real shape — a plain 3:2 frame
 *  is a safer guess than a square, which would letterbox almost every photo. */
const FALLBACK_RATIO = 3 / 2;

/**
 * One memory, mounted like a photographic print: the picture at its own
 * proportions, on paper with a deeper margin at the foot where the writing goes.
 *
 * Nothing here crops. The old page forced every entry into a fixed-height
 * masonry cell, which is what made a wall of family photographs read as a
 * component gallery — a portrait and a panorama came out the same size and the
 * subject was cut off in both. The trade is that the column has a ragged right
 * edge, which is the point.
 */
export function Print({ entry, dims }: { entry: LifeEntry; dims: Dimensions }) {
  const ratio = dims ? dims.width / dims.height : FALLBACK_RATIO;
  const hasMedia = Boolean(entry.media_id);

  return (
    <figure
      className="print-mat w-full max-w-full border border-border p-2.5 sm:w-[var(--print-w)]"
      style={{ "--print-w": hasMedia ? printWidth(ratio) : "68%" } as React.CSSProperties}
    >
      {hasMedia && entry.media_type === "video" ? (
        <video
          // Poster means the print paints immediately; the video bytes only load
          // on interaction, which is what keeps the Cloudinary credits intact.
          poster={cldVideoPoster(entry.media_id!, 1200)}
          preload="none"
          controls
          playsInline
          style={{ aspectRatio: ratio }}
          className="w-full bg-secondary"
        >
          <source src={cldVideo(entry.media_id!)} />
        </video>
      ) : hasMedia ? (
        <Image
          src={cldImage(entry.media_id!, 1600)}
          alt={entry.title}
          // The real pixel dimensions, so next/image reserves the right box and
          // the page does not reflow as each photograph arrives.
          width={dims?.width ?? 1200}
          height={dims?.height ?? 800}
          placeholder="blur"
          blurDataURL={cldBlur(entry.media_id!)}
          sizes="(min-width: 1024px) 800px, 92vw"
          className="h-auto w-full"
        />
      ) : null}

      <figcaption className="space-y-2 px-1 pb-4 pt-4">
        <h3 className="font-serif text-xl leading-tight sm:text-2xl">{entry.title}</h3>

        {entry.note ? (
          <p className="max-w-prose font-serif text-[15px] italic leading-relaxed text-muted-foreground sm:text-base">
            {entry.note}
          </p>
        ) : null}

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5 font-mono text-[10px] text-muted-foreground/70">
          {entry.date_label ? <span>{entry.date_label}</span> : null}
          {entry.date_label ? <span aria-hidden>/</span> : null}
          <span className="uppercase tracking-[0.14em]">{entry.category}</span>
        </p>
      </figcaption>
    </figure>
  );
}
