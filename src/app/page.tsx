import { Age } from "@/components/age";
import { ExperienceItem } from "@/components/experience-item";
import { HackathonCard } from "@/components/hackathon-card";
import { ReactiveHero } from "@/components/hero/reactive-hero";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/project-card";
import { Section } from "@/components/section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";

const socials = Object.entries(DATA.contact.social).filter(
  ([, s]) => "navbar" in s && s.navbar
);

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
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            {DATA.location} · open to work
          </span>
        </Reveal>

        <div className="mt-4 flex items-start justify-between gap-6">
          <div className="flex flex-1 flex-col gap-4">
            <Reveal delay={0.05}>
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Jeet{" "}
                <span className="font-serif font-normal italic text-brand">
                  Bhuptani
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                <Age birth={DATA.birthDate} />-year-old Computer Engineer building
                products, not just projects — I love learning new technologies and
                shipping them.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Avatar className="size-24 border border-border sm:size-28">
              <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
              <AvatarFallback>{DATA.initials}</AvatarFallback>
            </Avatar>
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
                    className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand"
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
          <div className="prose prose-sm max-w-full text-pretty font-sans text-muted-foreground dark:prose-invert prose-a:text-brand prose-a:no-underline hover:prose-a:underline">
            <Markdown>{DATA.summary}</Markdown>
          </div>
        </Section>
      </Reveal>

      {/* Work */}
      <Reveal>
        <Section id="work" label="Work">
          <StaggerGroup className="flex flex-col gap-5">
            {DATA.work.map((w) => (
              <StaggerItem key={`${w.company}-${w.start}`}>
                <ExperienceItem
                  logoUrl={w.logoUrl}
                  altText={w.company}
                  title={w.company}
                  subtitle={w.title}
                  href={w.href}
                  period={`${w.start} — ${w.end ?? "Present"}`}
                  description={w.description}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Section>
      </Reveal>

      {/* Volunteer */}
      <Reveal>
        <Section id="volunteer" label="Community">
          <StaggerGroup className="flex flex-col gap-5">
            {DATA.volunteer.map((w) => (
              <StaggerItem key={`${w.company}-${w.start}`}>
                <ExperienceItem
                  logoUrl={w.logoUrl}
                  altText={w.company}
                  title={w.company}
                  subtitle={w.title}
                  href={w.href}
                  period={`${w.start} — ${w.end ?? "Present"}`}
                  description={w.description}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Section>
      </Reveal>

      {/* Education */}
      <Reveal>
        <Section id="education" label="Education">
          <StaggerGroup className="flex flex-col gap-5">
            {DATA.education.map((e) => (
              <StaggerItem key={e.school}>
                <ExperienceItem
                  logoUrl={e.logoUrl}
                  altText={e.school}
                  title={e.school}
                  subtitle={e.degree}
                  href={e.href}
                  period={`${e.start} — ${e.end}`}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
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

      {/* Projects */}
      <Reveal>
        <Section id="projects" label="Projects" title="Things I’ve built">
          <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DATA.projects.map((p) => (
              <StaggerItem key={p.title}>
                <ProjectCard
                  href={p.href}
                  title={p.title}
                  description={p.description}
                  dates={p.dates}
                  tags={p.technologies}
                  image={p.image}
                  video={p.video}
                  links={p.links}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </Section>
      </Reveal>

      {/* Hackathons */}
      <Reveal>
        <Section id="hackathons" label="Hackathons" title="I like building under pressure">
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
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Let’s build something.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Got an idea, a role, or just want to talk shop? The fastest way to
              reach me is a DM on{" "}
              <Link
                href={DATA.contact.social.X.url}
                target="_blank"
                data-cursor
                className="text-brand hover:underline"
              >
                X
              </Link>{" "}
              or an email.
            </p>
            <Magnetic strength={0.25}>
              <Link
                href={`mailto:${DATA.contact.email}`}
                data-cursor
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
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
