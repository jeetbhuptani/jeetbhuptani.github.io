import Image from "next/image";

import { cldBlur, cldImage } from "@/lib/cloudinary";
import type { LifeEntry } from "@/lib/content/types";

/**
 * The "Life" wall — a personal gallery of random things (people, places,
 * moments) with optional pictures and notes. Renders a tidy card grid, or a
 * gentle placeholder when there's nothing yet so the section never looks broken.
 */
export function LifeWall({ entries }: { entries: readonly LifeEntry[] }) {
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

  return (
    <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
      {entries.map((e) => (
        <figure
          key={e.title}
          className="break-inside-avoid overflow-hidden rounded-xl border border-border bg-card"
        >
          {e.media_id && e.media_type !== "video" ? (
            <Image
              src={cldImage(e.media_id, 400)}
              alt={e.title}
              width={400}
              height={500}
              placeholder="blur"
              blurDataURL={cldBlur(e.media_id)}
              className="w-full object-cover"
            />
          ) : null}
          <figcaption className="flex flex-col gap-1 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium">{e.title}</span>
              {e.date_label ? (
                <span className="shrink-0 text-[10px] text-muted-foreground">{e.date_label}</span>
              ) : null}
            </div>
            {e.note ? <p className="text-xs leading-relaxed text-muted-foreground">{e.note}</p> : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
