import type { Metadata } from "next";
import Image from "next/image";

import { Reveal } from "@/components/motion/reveal";
import { cldBlur, cldImage, cldVideo, cldVideoPoster } from "@/lib/cloudinary";
import { getLife, groupOrdered } from "@/lib/content";
import type { LifeEntry } from "@/lib/content/types";

export const metadata: Metadata = {
  title: "Life",
  description: "Family, friends, the places I keep going back to, and the moments worth keeping.",
};

export const revalidate = 3600;

const CATEGORY_ORDER = ["Family", "Friends", "Places", "Moments"];

function Tile({ entry }: { entry: LifeEntry }) {
  const hasMedia = Boolean(entry.media_id);

  return (
    <figure className="group break-inside-avoid overflow-hidden rounded-xl border border-border bg-card">
      {hasMedia && entry.media_type === "video" ? (
        <video
          // Poster means the tile paints immediately; the video bytes only load
          // on interaction, which is what keeps the Cloudinary credits intact.
          poster={cldVideoPoster(entry.media_id!)}
          preload="none"
          controls
          playsInline
          className="w-full"
        >
          <source src={cldVideo(entry.media_id!)} />
        </video>
      ) : hasMedia ? (
        <div className="relative overflow-hidden">
          <Image
            src={cldImage(entry.media_id!)}
            alt={entry.title}
            width={600}
            height={750}
            placeholder="blur"
            blurDataURL={cldBlur(entry.media_id!)}
            sizes="(min-width: 640px) 33vw, 50vw"
            className="w-full object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.02]"
          />
        </div>
      ) : null}

      <figcaption className="flex flex-col gap-1 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium">{entry.title}</span>
          {entry.date_label ? (
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
              {entry.date_label}
            </span>
          ) : null}
        </div>
        {entry.note ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{entry.note}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}

export default async function LifePage() {
  const entries = await getLife();
  const groups = groupOrdered(entries, (e) => e.category, CATEGORY_ORDER);

  return (
    <main className="flex flex-col gap-14">
      <Reveal>
        <header className="space-y-3">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Life
          </span>
          <h1 className="text-glow font-sans text-3xl font-semibold tracking-tight sm:text-5xl">
            The people and places I{" "}
            <span className="font-serif font-normal italic">keep</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Family, friends, the places I keep going back to, and the moments worth
            keeping. This is the part of life the rest of the site leaves out.
          </p>
        </header>
      </Reveal>

      {!entries.length ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Photos and notes get added from the admin panel — no redeploy needed.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <Reveal key={group.key}>
            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {group.key}
                </h2>
                <span className="h-px flex-1 bg-border" />
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {group.items.length}
                </span>
              </div>

              <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
                {group.items.map((entry) => (
                  <Tile key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          </Reveal>
        ))
      )}
    </main>
  );
}
