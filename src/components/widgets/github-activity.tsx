"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GithubResult } from "@/lib/github";
import { WidgetShell } from "@/components/widgets/widget-shell";

const LEVEL_BG = [
  "bg-secondary",
  "bg-brand/30",
  "bg-brand/50",
  "bg-brand/75",
  "bg-brand",
];

export function GithubActivity() {
  const [data, setData] = useState<GithubResult | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/github")
      .then((r) => r.json())
      .then((d) => active && setData(d))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, []);

  const loading = !data && !failed;
  const errored = failed || data?.status === "error";
  // Last 119 days (17 weeks) for a compact heatmap.
  const recent = (data?.contributions ?? []).slice(-119);
  const weeks: typeof recent[] = [];
  for (let i = 0; i < recent.length; i += 7) weeks.push(recent.slice(i, i + 7));

  return (
    <WidgetShell
      label="GitHub"
      action={
        <Link
          href="https://github.com/jeetbhuptani"
          target="_blank"
          data-cursor
          className="font-mono text-[10px] text-muted-foreground hover:text-brand"
        >
          @jeetbhuptani
        </Link>
      }
      loading={loading}
      error={errored ? "Couldn’t load GitHub." : undefined}
    >
      <div className="flex flex-col gap-3">
        {data?.total ? (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{data.total.toLocaleString()}</span>{" "}
            contributions in the last year
          </p>
        ) : null}
        <div className="flex gap-[3px] overflow-hidden">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <span
                  key={day.date}
                  title={`${day.count} on ${day.date}`}
                  className={`size-[9px] rounded-[2px] ${LEVEL_BG[day.level] ?? LEVEL_BG[0]}`}
                />
              ))}
            </div>
          ))}
        </div>
        {data?.repos?.length ? (
          <ul className="flex flex-col gap-1.5 pt-1">
            {data.repos.slice(0, 3).map((r) => (
              <li key={r.name}>
                <Link
                  href={r.url}
                  target="_blank"
                  data-cursor
                  className="flex items-center justify-between gap-2 text-xs hover:text-brand"
                >
                  <span className="truncate font-medium">{r.name}</span>
                  {r.language ? (
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {r.language}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </WidgetShell>
  );
}
