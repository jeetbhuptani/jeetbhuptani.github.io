import { Age } from "@/components/age";
import { AsciiAvatar } from "@/components/ascii-avatar";
import { ExperienceTimeline, type TimelineItem } from "@/components/experience-timeline";
import { HackathonCard } from "@/components/hackathon-card";
import { ReactiveHero } from "@/components/hero/reactive-hero";
import { LifeWall } from "@/components/life-wall";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/project-card";
import { Section } from "@/components/section";
import { Bookshelf } from "@/components/widgets/bookshelf";
import { SocialsHub } from "@/components/widgets/socials-hub";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";

const socials = Object.entries(DATA.contact.social).filter(([, s]) => "navbar" in s && s.navbar);

const workItems: TimelineItem[] = DATA.work.map((w) => ({
  org: w.company,
  href: w.href,
  logoUrl: w.logoUrl,
  location: w.location,
  role: w.title,
  period: `${w.start} — ${w.end ?? "Present"}`,
  description: w.description,
}));

const volunteerItems: TimelineItem[] = DATA.volunteer.map((w) => ({
  org: w.company,
  href: w.href,
  logoUrl: w.logoUrl,
  location: w.location,
  role: w.title,
  period: `${w.start} — ${w.end ?? "Present"}`,
  description: w.description,
}));

const educationItems: TimelineItem[] = DATA.education.map((e) => ({
  org: e.school,
  href: e.href,
  logoUrl: e.logoUrl,
  role: e.degree,
  period: `${e.start} — ${e.end}`,
}));

export default function Page() {
  return (
    <main className="flex flex-col gap-16 sm:gap-20">
      {/* Hero */}
      <section id="hero" className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[-2rem] -top-16 -z-10 h-[340px] [mask-image:radial-gradient(58%_60%_at_50%_38%,black,transparent_85%)]"
        >
          <ReactiveHero />
        </div>

        <Reveal>
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            {DATA.work[0].title} @ {DATA.work[0].company} · {DATA.location}
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
                <Age birth={DATA.birthDate} />-year-old Computer Engineer building products, not
                just projects — I love learning new technologies and shipping them.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <AsciiAvatar src={DATA.avatarUrl} alt={DATA.name} />
          </Reveal>
        </div>

        <Reveal delay={0.18}>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {socials.map(([name, s]) => {
              const Icon = s.icon;
              return (
                <Magnetic key={name} strength={0.4}>
                  <Link
                    href={s.url}
                    target="_blank"
                    data-cursor
                    aria-label={name}
                    className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </Link>
                </Magnetic>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* About */}
      <Reveal>
        <Section id="about" label="About">
          <div className="prose prose-sm max-w-full text-pretty font-mono text-muted-foreground dark:prose-invert prose-a:text-foreground prose-a:underline prose-a:underline-offset-2">
            <Markdown>{DATA.summary}</Markdown>
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
              {DATA.showcase.map((p) => (
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

      {/* Skills */}
      <Reveal>
        <Section id="skills" label="Stack">
          <StaggerGroup className="flex flex-wrap gap-2">
            {DATA.skills.map((skill) => (
              <StaggerItem key={skill}>
                <span className="rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground">
                  {skill}
                </span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Section>
      </Reveal>

      {/* Currently — live account views */}
      <Reveal>
        <Section id="now" label="Currently">
          <SocialsHub />
        </Section>
      </Reveal>

      {/* Bookshelf — full shelf */}
      <Reveal>
        <Section id="bookshelf" label="Bookshelf" title="Everything I’ve read">
          <Bookshelf />
        </Section>
      </Reveal>

      {/* Projects */}
      <Reveal>
        <Section id="projects" label="Projects" title="Things I’ve built">
          <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DATA.projects.map((p) => (
              <div key={p.title} className="w-[280px] shrink-0 snap-start sm:w-[300px]">
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
          <LifeWall entries={DATA.life} />
        </Section>
      </Reveal>

      {/* Hackathons */}
      <Reveal>
        <Section id="hackathons" label="Hackathons" title="Building under pressure">
          <ul className="ml-4 divide-y divide-dashed border-l border-border">
            {DATA.hackathons.map((h) => (
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
              <Link href={DATA.contact.social.X.url} target="_blank" data-cursor className="text-foreground underline underline-offset-2">
                X
              </Link>{" "}
              or an email.
            </p>
            <Magnetic strength={0.25}>
              <Link
                href={`mailto:${DATA.contact.email}`}
                data-cursor
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                {DATA.contact.email}
              </Link>
            </Magnetic>
          </div>
        </Section>
      </Reveal>
    </main>
  );
}
