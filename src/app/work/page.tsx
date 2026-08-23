import type { Metadata } from "next";
import Link from "next/link";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SEED_IMPACT, TRACK_ORDER, byKind, getTimeline, getWork, groupOrdered } from "@/lib/content";
import type { WorkEntry } from "@/lib/content/types";


export const metadata: Metadata = {
  title: "Work",
  description:
    "What I've actually built since starting at Ignosis — capability and scale, no confidential detail.",
};

export const revalidate = 3600;

/** "2026-06" -> "Jun 2026". Kept local because these are yyyy-MM strings, not
 *  dates — constructing a Date would introduce a timezone bug for no gain. */
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
function formatPeriod(start: string, end: string | null): string {
  const fmt = (s: string) => {
    const [y, m] = s.split("-");
    const label = MONTHS[Number(m) - 1];
    return label ? `${label} ${y}` : y;
  };
  return `${fmt(start)} — ${end ? fmt(end) : "Present"}`;
}

function WorkCard({ entry }: { entry: WorkEntry }) {
  return (
    <article className="relative pl-6">
      {/* Timeline rail + node */}
      <span
        aria-hidden
        className="absolute left-0 top-2 size-1.5 rounded-full bg-foreground ring-4 ring-background"
      />
      <span aria-hidden className="absolute left-[2.5px] top-4 h-full w-px bg-border" />

      <div className="space-y-3 pb-10">
        <header className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {formatPeriod(entry.period_start, entry.period_end)}
          </p>
          <h3 className="text-base font-medium tracking-tight sm:text-lg">{entry.title}</h3>
        </header>

        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
          {entry.summary}
        </p>

        {entry.metrics.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {entry.metrics.map((m) => (
              <li
                key={m}
                className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[10px] tabular-nums text-foreground"
              >
                {m}
              </li>
            ))}
          </ul>
        ) : null}

        {entry.highlights.length ? (
          <ul className="max-w-prose space-y-1.5 pt-1">
            {entry.highlights.map((h) => (
              <li
                key={h}
                className="relative pl-4 text-[13px] leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-[0.6em] before:size-1 before:rounded-full before:bg-border"
              >
                {h}
              </li>
            ))}
          </ul>
        ) : null}

        {entry.tech.length ? (
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {entry.tech.map((t) => (
              <li key={t} className="font-mono text-[10px] text-muted-foreground/80">
                {t}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export default async function WorkPage() {
  const [entries, timeline] = await Promise.all([getWork(), getTimeline()]);
  // The employment history drives the intro sentence; the work *threads* below
  // are a separate collection with its own tracks.
  const roles = byKind(timeline, "work");
  const current = roles[0];
  const first = roles[roles.length - 1];
  const tracks = groupOrdered(entries, (e) => e.track, TRACK_ORDER);

  // Roll every metric up into the header so the page leads with scale.
  const totalMetrics = entries.reduce((n, e) => n + e.metrics.length, 0);

  return (
    <main className="flex flex-col gap-14">
      <Reveal>
        <header className="space-y-3">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Work
          </span>
          <h1 className="text-glow font-sans text-3xl font-semibold tracking-tight sm:text-5xl">
            Since I started{" "}
            <span className="font-serif font-normal italic">shipping</span>
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            {current?.role ?? "Software Engineer"} at{" "}
            <Link
              href={current?.href ?? "#"}
              target="_blank"
              data-cursor
              className="text-foreground underline underline-offset-2"
            >
              {current?.org ?? "Ignosis"}
            </Link>{" "}
            since {current?.period_start}
            {first && first !== current
              ? `, after converting from an internship that started ${first.period_start}`
              : ""}
            . This is what the work adds up to, grouped by the kind of problem rather
            than by quarter.
          </p>
          {/* Business outcome first, engineering detail second. The old header
              counted its own threads and tracks, which measures the page rather
              than the work. */}
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
            {SEED_IMPACT.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1 bg-card p-4">
                <dt className="font-sans text-2xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </dt>
                <dd className="text-xs leading-snug text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>

          <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground/70">
            <span>
              <span className="tabular-nums text-muted-foreground">{entries.length}</span>{" "}
              threads
            </span>
            <span>
              <span className="tabular-nums text-muted-foreground">{tracks.length}</span> tracks
            </span>
            <span>
              <span className="tabular-nums text-muted-foreground">{totalMetrics}</span> measured
              outcomes
            </span>
          </p>
        </header>
      </Reveal>

      {tracks.map((track) => (
        <Reveal key={track.key}>
          <section className="space-y-6">
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {track.key}
              </h2>
              <span className="h-px flex-1 bg-border" />
            </div>

            <StaggerGroup className="space-y-0">
              {track.items.map((entry) => (
                <StaggerItem key={entry.id}>
                  <WorkCard entry={entry} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        </Reveal>
      ))}
    </main>
  );
}
