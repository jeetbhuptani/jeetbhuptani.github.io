import Link from "next/link";
import { SpotifyNowPlaying } from "@/components/widgets/spotify-now-playing";
import { CurrentlyReading } from "@/components/widgets/currently-reading";
import { GithubActivity } from "@/components/widgets/github-activity";
import { InstagramEmbeds } from "@/components/widgets/instagram-embed";
import { WidgetShell } from "@/components/widgets/widget-shell";
import { DATA } from "@/data/resume";

/**
 * Socials hub (plan U15). A fixed responsive grid so it stays cohesive whatever
 * each widget's state. GitHub spans full width (richest); Spotify + Books sit
 * beside a connect tile. Instagram's live feed (U12) slots in later — for now
 * the connect tile carries the link-outs that have no live feed.
 */
export function SocialsHub() {
  const x = DATA.contact.social.X;
  const linkedin = DATA.contact.social.LinkedIn;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <GithubActivity />
      </div>
      <SpotifyNowPlaying />
      <CurrentlyReading />
      {DATA.instagram.posts.length ? (
        <div className="sm:col-span-2">
          <WidgetShell label="Instagram">
            <InstagramEmbeds posts={DATA.instagram.posts} />
          </WidgetShell>
        </div>
      ) : null}
      <div className="sm:col-span-2">
        <WidgetShell label="Elsewhere">
          <div className="flex flex-wrap gap-2">
            {[
              { name: "X / Twitter", url: x.url },
              { name: "LinkedIn", url: linkedin.url },
              { name: "Email", url: `mailto:${DATA.contact.email}` },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.url}
                target="_blank"
                data-cursor
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </WidgetShell>
      </div>
    </div>
  );
}
