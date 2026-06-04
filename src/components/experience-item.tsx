import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * One row in the Work / Volunteer / Education timelines. Replaces the template's
 * collapsible ResumeCard with a flat, scannable row (logo, title, role, period).
 */
export function ExperienceItem({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  period,
  description,
}: {
  logoUrl?: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  period: string;
  description?: string;
}) {
  const heading = (
    <span className="font-medium leading-tight transition-colors group-hover:text-brand">
      {title}
    </span>
  );

  return (
    <div className="group flex gap-4">
      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={altText}
            width={40}
            height={40}
            className="size-full object-contain p-1.5"
          />
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {altText.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 border-b border-border/60 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            {href ? (
              <Link href={href} target="_blank" data-cursor>
                {heading}
              </Link>
            ) : (
              heading
            )}
            {subtitle ? (
              <span className="text-sm text-muted-foreground">{subtitle}</span>
            ) : null}
          </div>
          <span className="shrink-0 whitespace-nowrap pt-0.5 font-mono text-xs text-muted-foreground">
            {period}
          </span>
        </div>
        {description ? (
          <p className={cn("mt-2 text-sm leading-relaxed text-muted-foreground")}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
