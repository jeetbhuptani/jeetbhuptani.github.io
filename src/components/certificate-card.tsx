import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";

interface Props {
  title: string;
  issuer: string;
  date: string;
  description?: string;
  image?: string;
  credentialId?: string;
  links?: readonly {
    type: string;
    href: string;
    icon: React.ReactNode;
  }[];
  className?: string;
}

export function CertificateCard({
  title,
  issuer,
  date,
  description,
  image,
  credentialId,
  links,
  className,
}: Props) {
  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden border hover:shadow-lg transition-all duration-300 ease-out h-full",
        className
      )}
    >
      <Link href={links?.[0]?.href || "#"} className="block">
        {image && (
          <div className="relative h-40 w-full overflow-hidden bg-muted/10">
            <Image
              src={image}
              alt={title}
              fill
              className="object-contain transition-transform duration-300 ease-out hover:scale-105"
            />
          </div>
        )}
      </Link>
      <CardHeader className="px-2">
        <div className="space-y-1">
          <CardTitle className="mt-1 text-base">{title}</CardTitle>
          <div className="text-sm text-muted-foreground">{issuer}</div>
          <time className="font-sans text-xs text-muted-foreground">{date}</time>
          {credentialId && (
            <div className="font-mono text-xs text-muted-foreground">
              ID: {credentialId}
            </div>
          )}
          
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex flex-col px-2">
        <div className="flex items-center justify-between">
          {description && (
            <Markdown className="prose max-w-full text-pretty font-sans text-xs text-muted-foreground dark:prose-invert">
              {description}
            </Markdown>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-2 pb-2">
        {links && links.length > 0 && (
          <div className="flex flex-row flex-wrap items-start gap-1">
            {links?.map((link, idx) => (
              <Link href={link?.href} key={idx} target="_blank">
                <Badge key={idx} className="flex gap-2 px-2 py-1 text-[10px]">
                  {link.icon}
                  {link.type}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}