import type { Metadata } from "next";
import Link from "next/link";

import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { TRACK_ORDER, getWork, groupOrdered } from "@/lib/content";
import type { WorkEntry } from "@/lib/content/types";
import { DATA } from "@/data/resume";

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
  const entries = await getWork();
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
            {DATA.work[0].title} at{" "}
            <Link
              href={DATA.work[0].href}
              target="_blank"
              data-cursor
              className="text-foreground underline underline-offset-2"
            >
              Ignosis
            </Link>{" "}
            since {DATA.work[0].start}, after converting from an internship that started{" "}
            {DATA.work[1].start}. This is what the work adds up to, grouped by the kind of
            problem rather than by quarter.
          </p>
          <p className="max-w-lg text-xs leading-relaxed text-muted-foreground/70">
            Capability and scale only — no client names, no ticket references, no internal
            systems.
          </p>

          <dl className="flex flex-wrap gap-x-6 gap-y-2 pt-2 font-mono text-[11px] text-muted-foreground">
            <div className="flex items-baseline gap-1.5">
              <dt className="tabular-nums text-foreground">{entries.length}</dt>
              <dd>threads of work</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="tabular-nums text-foreground">{tracks.length}</dt>
              <dd>tracks</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="tabular-nums text-foreground">{totalMetrics}</dt>
              <dd>measured outcomes</dd>
            </div>
          </dl>
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
