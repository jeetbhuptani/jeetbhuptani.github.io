import Image from "next/image";

import { cldBlur, cldImage, cldVideoPoster } from "@/lib/cloudinary";
import type { LifeEntry } from "@/lib/content/types";

/**
 * The Life teaser on the home page: the most recent entry, full size, with the
 * rest reduced to a thumbnail strip.
 *
 * Same reasoning as the bookshelf teaser — the full masonry wall lives at
 * /life, and reproducing it here cost a screen of height to say the same thing.
 * "Most recent" is the first row as ordered by `sort_order`, which is what the
 * admin panel controls; the date labels are free text ("last summer") and
 * cannot be sorted on.
 */
export function LifeLatest({ entries }: { entries: readonly LifeEntry[] }) {
  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          A wall for the rest of life — friends, family, fellow builders, and small moments.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">Filling this in soon.</p>
      </div>
    );
  }

  const [latest, ...rest] = entries;

  return (
    <div className="space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Most recent
      </p>

      <figure className="flex gap-3.5 overflow-hidden rounded-2xl border border-border bg-card p-3.5">
        <MediaThumb entry={latest} className="h-[132px] w-[110px] shrink-0" />
        <figcaption className="flex min-w-0 flex-col gap-1 self-center">
          <span className="w-fit rounded-sm bg-secondary px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
            {latest.category}
          </span>
          <span className="text-sm font-medium leading-snug">{latest.title}</span>
          {latest.date_label ? (
            <span className="font-mono text-[10px] text-muted-foreground/70">
              {latest.date_label}
            </span>
          ) : null}
          {latest.note ? (
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {latest.note}
            </p>
          ) : null}
        </figcaption>
      </figure>

      {rest.length ? (
        <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rest.slice(0, 8).map((entry) => (
            <li key={entry.id} className="shrink-0">
              <MediaThumb
                entry={entry}
                className="size-14 rounded-lg"
                width={112}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MediaThumb({
  entry,
  className,
  width = 240,
}: {
  entry: LifeEntry;
  className?: string;
  width?: number;
}) {
  const base = `relative overflow-hidden rounded-md border border-border bg-secondary ${className ?? ""}`;

  if (!entry.media_id) {
    return (
      <div className={base}>
        <span className="flex h-full items-center justify-center p-1 text-center font-mono text-[8px] leading-tight text-muted-foreground">
          {entry.title}
        </span>
      </div>
    );
  }

  // Videos use their poster frame here: the teaser must never pull video bytes
  // for something the visitor has not asked to play.
  const src =
    entry.media_type === "video"
      ? cldVideoPoster(entry.media_id, width)
      : cldImage(entry.media_id, width);

  return (
    <div className={base}>
      <Image
        src={src}
        alt={entry.title}
        fill
        sizes={`${width}px`}
        placeholder={entry.media_type === "video" ? "empty" : "blur"}
        blurDataURL={entry.media_type === "video" ? undefined : cldBlur(entry.media_id)}
        className="object-cover"
      />
    </div>
  );
}
