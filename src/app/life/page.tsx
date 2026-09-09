import type { Metadata } from "next";

import { Print, type Dimensions } from "@/components/life/print";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { cldDimensions } from "@/lib/cloudinary";
import { getLife } from "@/lib/content";
import { chapters, span } from "@/lib/life-album";

export const metadata: Metadata = {
  title: "Life",
  description: "Family, friends, the places I keep going back to, and the moments worth keeping.",
};

export const revalidate = 3600;

/**
 * The album breaks out of the site's 672px measure — a photograph shown at
 * reading width is a thumbnail. `calc(100vw - 3rem)` keeps the same 1.5rem
 * gutters the body already has, and staying under 100vw means a classic
 * scrollbar can never push the page sideways.
 */
const BREAKOUT = "relative left-1/2 w-[min(56rem,calc(100vw_-_3rem))] -translate-x-1/2";

export default async function LifePage() {
  const entries = await getLife();

  // Every photograph is laid out at its own aspect ratio, and the only thing
  // stored per entry is a Cloudinary public_id — so the shapes are resolved
  // here, once, in parallel, and handed down. Each lookup is cached for a day
  // (see cldDimensions), so this costs nothing on a warm render.
  const shapes = new Map<string, Dimensions>(
    await Promise.all(
      entries
        .filter((e) => e.media_id)
        .map(
          async (e) =>
            [e.id, await cldDimensions(e.media_id!, e.media_type ?? "image")] as const
        )
    )
  );

  const album = chapters(entries);
  const years = span(entries);

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
            keeping. This is the part of life the work leaves out.
          </p>
          {entries.length ? (
            <p className="font-mono text-[10px] tabular-nums text-muted-foreground/70">
              {entries.length} {entries.length === 1 ? "memory" : "memories"}
              {years ? (
                <> &middot; {years.from === years.to ? years.from : `${years.from}–${years.to}`}</>
              ) : null}
            </p>
          ) : null}
        </header>
      </Reveal>

      {!entries.length ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">The album starts here.</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Add a photo and a line about it from the admin panel — no redeploy needed.
          </p>
        </div>
      ) : (
        <div className={BREAKOUT}>
          {album.map((chapter, chapterIndex) => (
            <section
              key={chapter.year ?? "undated"}
              className="lg:grid lg:grid-cols-[5.5rem_minmax(0,1fr)] lg:gap-12"
            >
              {/* The year rides along in the margin while its memories scroll
                  past, so you always know where in the story you are. On narrow
                  screens the grid collapses and it becomes a chapter heading.

                  5.5rem + gap-12 is 136px, which is exactly how far the breakout
                  overhangs the site's text column — so the rail lands on the
                  same left edge as the heading above it and the year sits in the
                  margin the page already had. Change one and change the other. */}
              <div className="mb-5 flex items-baseline gap-3 lg:sticky lg:top-24 lg:mb-0 lg:h-fit lg:flex-col lg:items-start lg:gap-1 lg:self-start">
                <span className="font-serif text-3xl leading-none text-muted-foreground/60 lg:text-[2.6rem]">
                  {chapter.year ?? "Undated"}
                </span>
                <span aria-hidden className="h-px flex-1 bg-border lg:hidden" />
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                  {chapter.items.length}
                </span>
              </div>

              <StaggerGroup
                className="relative border-l border-border pb-16 pl-6 sm:pl-10"
                stagger={0.08}
              >
                {chapter.items.map((entry) => (
                  <StaggerItem key={entry.id} className="relative pb-14 last:pb-0">
                    <Node />
                    <Print entry={entry} dims={shapes.get(entry.id) ?? null} />
                  </StaggerItem>
                ))}

                {/* The rail has to stop somewhere; ending it on a mark reads as
                    deliberate where a border that just runs out does not. */}
                {chapterIndex === album.length - 1 ? <RailEnd /> : null}
              </StaggerGroup>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

/** Where a memory attaches to the rail. The offsets are the column's own
 *  indent (pl-6 / sm:pl-10) plus half the node, so the dot sits centred on the
 *  line — they have to move together with that padding. */
function Node() {
  return (
    <span
      aria-hidden
      className="absolute -left-[27px] top-2 size-1.5 rounded-full bg-foreground/40 ring-4 ring-background sm:-left-[43px]"
    />
  );
}

function RailEnd() {
  return (
    <p className="absolute bottom-0 -left-[3px] flex items-center gap-3 font-mono text-[10px] text-muted-foreground/50">
      <span aria-hidden className="size-1.5 rounded-full bg-border ring-4 ring-background" />
      <span>More to come</span>
    </p>
  );
}
