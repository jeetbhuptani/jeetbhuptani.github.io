import { cn } from "@/lib/utils";

/**
 * Section shell for the rebuilt portfolio: a small monospaced eyebrow label
 * with a leading brand tick, an optional heading, and the section body.
 * Replaces the template's plain `<h2 class="text-xl font-bold">` headers.
 */
export function Section({
  id,
  label,
  title,
  className,
  children,
}: {
  id?: string;
  label: string;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      <div className="mb-5 flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      {title ? (
        <h2 className="mb-6 font-mono text-xl font-medium tracking-tight sm:text-2xl">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
