import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ShowcaseMotif } from "@/components/showcase-motif";

type ProjectLink = { type: string; href: string; icon?: React.ReactNode };

/**
 * Rebuilt project card: media on top, mono date, description, monospace tech
 * chips, and link pills. Replaces the template card; borders warm to the brand
 * accent on hover.
 */
export function ProjectCard({
  title,
  href,
  description,
  dates,
  tags,
  image,
  video,
  motif,
  links,
}: {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags?: readonly string[];
  image?: string;
  video?: string;
  motif?: "collections" | "voice";
  links?: readonly ProjectLink[];
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-300 hover:border-brand/50">
      {motif ? (
        <ShowcaseMotif variant={motif} />
      ) : video ? (
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="aspect-video w-full object-cover"
        />
      ) : image ? (
        <Image
          src={image}
          alt={title}
          width={600}
          height={338}
          className="aspect-video w-full object-cover"
        />
      ) : null}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-medium leading-tight">
            {href ? (
              <Link
                href={href}
                target="_blank"
                data-cursor
                className="transition-colors hover:text-brand"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {dates}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        {tags && tags.length ? (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        {links && links.length ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {links.map((link) => (
              <Link
                key={link.type}
                href={link.href}
                target="_blank"
                data-cursor
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border border-border px-2 py-1",
                  "text-xs transition-colors hover:border-brand/50 hover:text-brand"
                )}
              >
                {link.icon}
                {link.type}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
