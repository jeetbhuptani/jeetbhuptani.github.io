/**
 * Marks a row that exists in the database but is hidden from the site.
 *
 * The publish checkbox lives at the bottom of an expanded form, so a row saved
 * with it unticked looked identical to a published one in the collapsed list —
 * it just never appeared on the site, with nothing anywhere explaining why.
 */
export function DraftBadge({ published }: { published: boolean }) {
  if (published) return null;
  return (
    <span
      title="Saved, but not visible on the site. Tick “Published” to show it."
      className="shrink-0 rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground"
    >
      draft
    </span>
  );
}

/** The hint shown next to the publish checkbox inside an open form. */
export function PublishHint({ published }: { published: boolean }) {
  return (
    <span className="font-mono text-[9px] normal-case tracking-normal text-muted-foreground/70">
      {published ? "visible on the site" : "hidden until published"}
    </span>
  );
}
