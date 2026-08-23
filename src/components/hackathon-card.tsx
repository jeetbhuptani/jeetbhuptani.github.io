import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ContentIcon } from "@/components/icon-by-name";

interface Props {
  /** Root element. The home page reel wraps each card in an animated <li>, so
   *  it renders the card as a plain <div> to avoid nesting a list item. */
  as?: "li" | "div";
  title: string;
  description: string;
  dates: string;
  location: string;
  image?: string | null;
  links?: readonly {
    icon?: string | null;
    label: string;
    href: string;
  }[];
}

export function HackathonCard({
  as: Root = "li",
  title,
  description,
  dates,
  location,
  image,
  links,
}: Props) {
  return (
    <Root className="relative ml-10 py-4">
      <div className="absolute -left-16 top-2 flex items-center justify-center bg-white rounded-full">
        <Avatar className="border size-12 m-auto">
          <AvatarImage src={image ?? undefined} alt={title} className="object-contain" />
          <AvatarFallback>{title[0]}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-1 flex-col justify-start gap-1">
        {dates && (
          <time className="text-xs text-muted-foreground">{dates}</time>
        )}
        <h2 className="font-semibold leading-none">{title}</h2>
        {location && (
          <p className="text-sm text-muted-foreground">{location}</p>
        )}
        {description && (
          <span className="prose dark:prose-invert text-sm text-muted-foreground">
            {description}
          </span>
        )}
      </div>
      {links && links.length > 0 && (
        <div className="mt-2 flex flex-row flex-wrap items-start gap-2">
          {links?.map((link, idx) => (
            <Link href={link.href} key={idx}>
              <Badge key={idx} title={link.label} className="flex gap-2">
                <ContentIcon name={link.icon} className="h-4 w-4" />
                {link.label}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </Root>
  );
}
