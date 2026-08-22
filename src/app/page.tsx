import { Age } from "@/components/age";
import { ASCII_AVATAR } from "@/data/ascii-avatar";
import { ExperienceTimeline, type TimelineItem } from "@/components/experience-timeline";
import { HackathonCard } from "@/components/hackathon-card";
import { ReactiveHero } from "@/components/hero/reactive-hero";
import { LifeWall } from "@/components/life-wall";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/project-card";
import { Section } from "@/components/section";
import { Bookshelf } from "@/components/widgets/bookshelf";
import { ContentIcon } from "@/components/icon-by-name";
import { MoreLink } from "@/components/more-link";
import { SkillGrid } from "@/components/skill-grid";
import {
  byKind,
  getHackathons,
  getLife,
  getProfile,
  getProjects,
  getSkills,
  getSocials,
  getTimeline,
} from "@/lib/content";
import Link from "next/link";
import Markdown from "react-markdown";


/** Maps a timeline row to the shape ExperienceTimeline renders. */
function toTimelineItems(rows: Awaited<ReturnType<typeof getTimeline>>): TimelineItem[] {
  return rows.map((e) => ({
    org: e.org,
    href: e.href ?? undefined,
    logoUrl: e.logo_url ?? undefined,
    location: e.location ?? undefined,
    role: e.role,
    period: `${e.period_start} — ${e.period_end ?? "Present"}`,
    description: e.description ?? undefined,
  }));
}

export default async function Page() {
  const [profile, socials, timeline, projects, skills, hackathons, life] =
    await Promise.all([
      getProfile(),
      getSocials(),
      getTimeline(),
      getProjects(),
      getSkills(),
      getHackathons(),
      getLife(),
    ]);

  const navSocials = socials.filter((s) => s.navbar);
  const workItems = toTimelineItems(byKind(timeline, "work"));
  const volunteerItems = toTimelineItems(byKind(timeline, "volunteer"));
  const educationItems = toTimelineItems(byKind(timeline, "education"));
  const showcase = byKind(projects, "showcase");
  const sideProjects = byKind(projects, "project");
  const currentRole = workItems[0];

  return (
    <main className="flex flex-col gap-16 sm:gap-20">
      {/* Hero */}
      <section id="hero" className="relative">
        {/* -1.5rem matches the body's px-6, so the glow reaches exactly the
            viewport edge on phones. At -2rem it spilled 8px past it and gave
            the whole page a sideways scroll; from `sm` up the centred
            max-w-2xl container has margin to spare, so -2rem is safe there. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[-1.5rem] -top-16 -z-10 h-[340px] sm:inset-x-[-2rem] [mask-image:radial-gradient(58%_60%_at_50%_38%,black,transparent_85%)]"
        >
          <ReactiveHero />
        </div>

        <Reveal>
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            {currentRole ? `${currentRole.role} @ ${currentRole.org}` : profile.name} · {profile.location}
          </span>
        </Reveal>

        <div className="mt-4 flex items-start justify-between gap-6">
          <div className="flex flex-1 flex-col gap-4">
            <Reveal delay={0.05}>
              <h1 className="text-glow font-sans text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Jeet <span className="font-serif font-normal italic">Bhuptani</span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                {profile.birth_date ? <><Age birth={profile.birth_date} />-year-old </> : null}
                {profile.description}
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <pre
              aria-label={`ASCII portrait of ${profile.name}`}
              className="w-fit shrink-0 overflow-hidden rounded-xl border border-border bg-card p-1.5 font-mono text-[2.5px] leading-[2.5px] text-foreground sm:text-[3px] sm:leading-[3px]"
            >
              {ASCII_AVATAR}
            </pre>
          </Reveal>
        </div>

        <Reveal delay={0.18}>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {navSocials.map((s) => (
              <Magnetic key={s.id} strength={0.4}>
                <Link
                  href={s.url}
                  target="_blank"
                  data-cursor
                  aria-label={s.name}
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ContentIcon name={s.icon} className="size-4" />
                </Link>
              </Magnetic>
            ))}
          </div>
        </Reveal>
      </section>

      {/* About */}
      <Reveal>
        <Section id="about" label="About">
          <div className="prose prose-sm max-w-full text-pretty font-mono text-muted-foreground dark:prose-invert prose-a:text-foreground prose-a:underline prose-a:underline-offset-2">
            <Markdown>{profile.summary}</Markdown>
          </div>
        </Section>
      </Reveal>

      {/* Work — timeline + Ignosis showcase */}
      <Reveal>
        <Section id="work" label="Work">
          <ExperienceTimeline items={workItems} />
          <div className="mt-6">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Selected work at Ignosis
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {showcase.map((p) => (
                <ProjectCard
                  key={p.title}
                  href={p.href}
                  title={p.title}
                  description={p.description}
                  dates={p.dates}
                  tags={p.technologies}
                  motif={p.motif}
                  links={p.links}
                />
              ))}
            </div>
            <MoreLink href="/work">The full work timeline</MoreLink>
          </div>
        </Section>
      </Reveal>

      {/* Community + Education */}
      <Reveal>
        <Section id="community" label="Community">
          <ExperienceTimeline items={volunteerItems} />
        </Section>
      </Reveal>
      <Reveal>
        <Section id="education" label="Education">
          <ExperienceTimeline items={educationItems} />
        </Section>
      </Reveal>

      {/* Skills — grouped by category, weighted by how much I actually use them */}
      <Reveal>
        <Section id="skills" label="Stack">
          <SkillGrid skills={skills} />
        </Section>
      </Reveal>

      {/* Bookshelf — teaser; the full shelf lives at /bookshelf */}
      <Reveal>
        <Section id="bookshelf" label="Bookshelf" title="Everything I’ve read">
          <Bookshelf />
          <MoreLink href="/bookshelf">Browse the shelves by genre</MoreLink>
        </Section>
      </Reveal>

      {/* Projects */}
      <Reveal>
        <Section id="projects" label="Projects" title="Things I’ve built">
          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sideProjects.map((p) => (
              <div key={p.title} className="flex w-[280px] shrink-0 snap-start sm:w-[300px]">
                <ProjectCard
                  href={p.href}
                  title={p.title}
                  description={p.description}
                  dates={p.dates}
                  tags={p.technologies}
                  links={p.links}
                />
              </div>
            ))}
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            scroll →
          </p>
        </Section>
      </Reveal>

      {/* Life */}
      <Reveal>
        <Section id="life" label="Life" title="The rest of it">
          <LifeWall entries={life} />
          <MoreLink href="/life">The people around the work</MoreLink>
        </Section>
      </Reveal>

      {/* Hackathons */}
      <Reveal>
        <Section id="hackathons" label="Hackathons" title="Building under pressure">
          <ul className="ml-4 divide-y divide-dashed border-l border-border">
            {hackathons.map((h) => (
              <HackathonCard
                key={h.title + h.dates}
                title={h.title}
                description={h.description}
                location={h.location}
                dates={h.dates}
                image={h.image}
                links={h.links}
              />
            ))}
          </ul>
        </Section>
      </Reveal>

      {/* Contact */}
      <Reveal>
        <Section id="contact" label="Contact">
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
              Let’s build something.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Got an idea, a role, or just want to talk shop? The fastest way to reach me is a DM
              on{" "}
              <Link
                href={navSocials.find((s) => s.name === "X")?.url ?? "#"}
                target="_blank"
                data-cursor
                className="text-foreground underline underline-offset-2"
              >
                X
              </Link>{" "}
              or an email.
            </p>
            <Magnetic strength={0.25}>
              <Link
                href={`mailto:${profile.email}`}
                data-cursor
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                {profile.email}
              </Link>
            </Magnetic>
          </div>
        </Section>
      </Reveal>
    </main>
  );
}
