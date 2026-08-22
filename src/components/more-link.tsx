import Link from "next/link";

/**
 * "Continue to the full page" affordance used at the foot of the home-page
 * sections that now have a dedicated page behind them. The arrow nudges on
 * hover via transform only, so it never triggers layout.
 */
export function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      data-cursor
      className="group mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}
