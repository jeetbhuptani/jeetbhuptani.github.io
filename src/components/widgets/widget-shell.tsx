import { cn } from "@/lib/utils";

/**
 * Shared shell for every account widget (plan U11–U15/R21). Renders a labelled
 * card with a FIXED-min-height body so the socials hub grid never reflows as
 * widgets resolve, and routes the loading / empty / error states explicitly so
 * a failing upstream never breaks the page — it just shows a calm message.
 */
export function WidgetShell({
  label,
  action,
  loading,
  empty,
  error,
  className,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  loading?: boolean;
  empty?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-card p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        {action}
      </div>
      <div className="flex min-h-[92px] flex-1 flex-col justify-center">
        {loading ? (
          <div className="flex animate-pulse flex-col gap-2" aria-hidden>
            <div className="h-3 w-2/3 rounded bg-secondary" />
            <div className="h-3 w-1/2 rounded bg-secondary" />
            <div className="h-3 w-3/5 rounded bg-secondary" />
          </div>
        ) : error ? (
          <p className="text-xs text-muted-foreground">{error}</p>
        ) : empty ? (
          <p className="text-xs text-muted-foreground">{empty}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
