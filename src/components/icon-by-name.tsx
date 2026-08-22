import {
  BriefcaseIcon,
  HeartIcon,
  HomeIcon,
  LibraryIcon,
  NotebookIcon,
  type LucideIcon,
} from "lucide-react";

import { Icons } from "@/components/icons";

/**
 * Resolves an icon *name* stored in Postgres to a component.
 *
 * The data layer holds strings because a database cannot store a component
 * reference — this map is the one place that translation happens. Adding an
 * icon means adding a key here and typing that key in the admin panel.
 *
 * Unknown names fall back to the globe rather than throwing: a typo in the
 * admin should render a slightly wrong icon, not blank the page.
 */
const ICONS: Record<string, LucideIcon | ((props: any) => JSX.Element)> = {
  // brand / social
  github: Icons.github,
  linkedin: Icons.linkedin,
  x: Icons.x,
  youtube: Icons.youtube,
  notion: Icons.notion,
  openai: Icons.openai,
  whatsapp: Icons.whatsapp,
  googledrive: Icons.googleDrive,
  // tech
  nextjs: Icons.nextjs,
  react: Icons.react,
  typescript: Icons.typescript,
  tailwindcss: Icons.tailwindcss,
  framermotion: Icons.framermotion,
  // site
  globe: Icons.globe,
  email: Icons.email,
  resume: Icons.resume,
  certificate: Icons.certificate,
  projects: Icons.projects,
  trophy: Icons.trophy,
  // nav
  home: HomeIcon,
  notebook: NotebookIcon,
  briefcase: BriefcaseIcon,
  library: LibraryIcon,
  heart: HeartIcon,
};

/** Every valid icon name, for the admin panel's datalist. */
export const ICON_NAMES = Object.keys(ICONS).sort();

export function iconByName(name: string | undefined | null) {
  return ICONS[(name ?? "").toLowerCase().trim()] ?? Icons.globe;
}

/**
 * Renders an icon by name, or by path.
 *
 * A name starting with "/" is treated as an image in /public (or any uploaded
 * asset), which is how the Devfolio mark survives the move to the database
 * without needing a code change per brand logo.
 */
export function ContentIcon({
  name,
  className = "size-3",
}: {
  name?: string | null;
  className?: string;
}) {
  if (name?.startsWith("/")) {
    // A fixed-size inline mark (~1KB of SVG); next/image would add a
    // request-time optimiser round-trip for no benefit at this size.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={name} alt="" aria-hidden className={className} />;
  }
  const Icon = iconByName(name);
  return <Icon className={className} />;
}
