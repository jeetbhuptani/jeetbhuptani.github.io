import { TABLE_MISSING_CODE, type ContentHealth } from "@/lib/content/health";

/**
 * Names the tables that are not answering, at the top of /admin.
 *
 * Without this the failure is invisible: the editor renders seed content, the
 * form saves, the request 500s somewhere the eye does not go, and the site
 * never changes. Naming the table and the exact fix turns "a few tables aren't
 * working" into one command to run.
 */
export function HealthBanner({ health }: { health: ContentHealth }) {
  if (!health.configured || health.healthy) return null;

  const allMissing = health.missing.every((t) => t.code === TABLE_MISSING_CODE);

  return (
    <div className="space-y-2.5 rounded-2xl border border-destructive/40 bg-destructive/[0.06] p-4">
      <p className="text-xs font-medium">
        {health.missing.length} of {health.tables.length} tables aren&rsquo;t answering.
      </p>

      <ul className="flex flex-wrap gap-1.5">
        {health.missing.map((t) => (
          <li
            key={t.table}
            title={t.message}
            className="rounded-md border border-destructive/40 px-1.5 py-0.5 font-mono text-[10px]"
          >
            {t.table}
            {t.code ? <span className="ml-1 text-muted-foreground">{t.code}</span> : null}
          </li>
        ))}
      </ul>

      {allMissing ? (
        <div className="space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
          <p>
            Every one of these is missing from the schema, which has a single cause: the
            migration that creates them has not been run. Their editors below are showing
            committed fallback content, and saving to them will fail.
          </p>
          <p>
            Paste{" "}
            <code className="font-mono text-foreground">
              supabase/migrations/20260822120000_full_content_schema.sql
            </code>{" "}
            into the Supabase SQL editor, run it, then run{" "}
            <code className="font-mono text-foreground">pnpm seed:full</code>.
          </p>
        </div>
      ) : (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          These are erroring rather than absent — hover a chip for the message. The public
          site is falling back to committed content for them, so nothing looks broken to
          visitors.
        </p>
      )}
    </div>
  );
}

/** Small marker for a panel whose table is not answering. */
export function PanelStatus({
  table,
  health,
}: {
  table: string;
  health: ContentHealth;
}) {
  const row = health.tables.find((t) => t.table === table);
  if (!row || row.ok) return null;
  return (
    <span className="rounded-md border border-destructive/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-destructive">
      {row.code === TABLE_MISSING_CODE ? "table missing" : "not answering"}
    </span>
  );
}

/**
 * Tables that exist but hold no rows.
 *
 * Distinct from the health banner above: nothing is broken here. But an empty
 * editor and a broken one look identical, and the public site is meanwhile
 * rendering committed fallback content for these — so the site looks populated
 * while the database is bare. That gap is the confusing part, and it has a
 * one-command fix.
 */
export function EmptyTablesNotice({ tables }: { tables: string[] }) {
  if (!tables.length) return null;
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium">
        {tables.length} table{tables.length === 1 ? " is" : "s are"} empty.
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {tables.map((t) => (
          <li
            key={t}
            className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
          >
            {t}
          </li>
        ))}
      </ul>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        The site is showing committed fallback content for these, so it looks fine from the
        outside while there is nothing here to edit. Run{" "}
        <code className="font-mono text-foreground">pnpm seed:full</code> to import that
        content into the database, then edit it here.
      </p>
    </div>
  );
}
