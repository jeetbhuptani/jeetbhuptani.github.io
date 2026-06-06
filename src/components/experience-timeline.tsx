import Image from "next/image";
import Link from "next/link";

export type TimelineItem = {
  org: string;
  href?: string;
  logoUrl?: string;
  location?: string;
  role: string;
  period: string;
  description?: string;
};

type Group = {
  org: string;
  href?: string;
  logoUrl?: string;
  location?: string;
  roles: TimelineItem[];
};

/** Group consecutive entries from the same org so one company shows once with its roles nested. */
function group(items: TimelineItem[]): Group[] {
  const groups: Group[] = [];
  for (const it of items) {
    const last = groups[groups.length - 1];
    if (last && last.org === it.org) last.roles.push(it);
    else
      groups.push({
        org: it.org,
        href: it.href,
        logoUrl: it.logoUrl,
        location: it.location,
        roles: [it],
      });
  }
  return groups;
}

/**
 * Vertical timeline for Work / Community / Education. Same company (e.g. both
 * Ignosis roles) collapses to one node with the roles stacked beneath it.
 */
export function ExperienceTimeline({ items }: { items: TimelineItem[] }) {
  const groups = group(items);
  return (
    <ol className="relative ml-3 border-l border-border">
      {groups.map((g) => (
        <li key={g.org + g.roles[0].period} className="relative pb-8 pl-7 last:pb-0">
          <span className="absolute -left-[13px] top-0 grid size-6 place-items-center overflow-hidden rounded-md border border-border bg-card">
            {g.logoUrl ? (
              <Image src={g.logoUrl} alt={g.org} width={24} height={24} className="size-full object-contain p-0.5" />
            ) : (
              <span className="text-[8px] text-muted-foreground">{g.org.slice(0, 2).toUpperCase()}</span>
            )}
          </span>
          <div className="flex items-baseline justify-between gap-3">
            {g.href ? (
              <Link href={g.href} target="_blank" data-cursor className="text-sm font-medium hover:underline">
                {g.org}
              </Link>
            ) : (
              <span className="text-sm font-medium">{g.org}</span>
            )}
            {g.location ? (
              <span className="shrink-0 text-[11px] text-muted-foreground">{g.location}</span>
            ) : null}
          </div>
          <ul className="mt-2.5 flex flex-col gap-3">
            {g.roles.map((r) => (
              <li key={r.role + r.period} className="border-l border-dashed border-border/70 pl-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-foreground/90">{r.role}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{r.period}</span>
                </div>
                {r.description ? (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
