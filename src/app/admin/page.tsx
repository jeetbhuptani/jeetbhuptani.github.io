import type { Metadata } from "next";
import Link from "next/link";

import {
  ChallengeTotp,
  EnrollTotp,
  SignIn,
  SignOutButton,
} from "@/components/admin/auth-gate";
import {
  BooksEditor,
  LifeEditor,
  SkillsEditor,
  WorkEditor,
} from "@/components/admin/editors";
import {
  CERTIFICATE_FIELDS,
  HACKATHON_FIELDS,
  NAV_FIELDS,
  POST_FIELDS,
  PROFILE_FIELDS,
  PROJECT_FIELDS,
  SOCIAL_FIELDS,
  TIMELINE_FIELDS,
  BLANKS,
} from "@/components/admin/field-specs";
import { RecordEditor } from "@/components/admin/record-editor";
import { getBookshelf } from "@/lib/books";
import {
  bookSlug,
  getBookOverrides,
  getCertificates,
  getHackathons,
  getLife,
  getNavItems,
  getProfile,
  getProjects,
  getSkills,
  getSocials,
  getTimeline,
  getWork,
} from "@/lib/content";
import { getPostRows } from "@/lib/content/posts";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminState } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Admin",
  // Keep the panel out of search results and out of the sitemap.
  robots: { index: false, follow: false },
};

/** Never cache: what renders depends entirely on the caller's session. */
export const dynamic = "force-dynamic";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "timeline", label: "Timeline" },
  { id: "work", label: "Work threads" },
  { id: "projects", label: "Projects" },
  { id: "posts", label: "Blog" },
  { id: "life", label: "Life" },
  { id: "skills", label: "Skills" },
  { id: "books", label: "Books" },
  { id: "hackathons", label: "Hackathons" },
  { id: "certificates", label: "Certificates" },
  { id: "socials", label: "Socials" },
  { id: "nav", label: "Nav" },
];

function Panel({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 space-y-3">
      <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center gap-3">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Supabase isn&rsquo;t configured yet. Set{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then run
          the migration in{" "}
          <code className="font-mono text-xs">supabase/migrations/</code>.
        </p>
        <p className="text-xs text-muted-foreground/70">
          Until then the site serves its committed seed content, so nothing is broken.
        </p>
      </main>
    );
  }

  const state = await getAdminState();

  if (state.status === "anonymous") return <SignIn />;
  if (state.status === "needs-enrollment") return <EnrollTotp />;
  if (state.status === "needs-2fa") return <ChallengeTotp />;
  if (state.status === "forbidden") {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center gap-3">
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Not allowed</h1>
        <p className="text-sm text-muted-foreground">
          {state.email} is not the admin account.
        </p>
        <SignOutButton />
      </main>
    );
  }

  // Verified admin at AAL2 from here on.
  // fresh=true: the editors must show what is actually in the database right
  // now, never a cached copy — otherwise a save appears to have done nothing.
  const [
    work, life, skills, shelf, overrides,
    profile, socials, navItems, timeline, projects, hackathons, certificates, posts,
  ] = await Promise.all([
    getWork(true),
    getLife(true),
    getSkills(true),
    getBookshelf(),
    getBookOverrides(true),
    getProfile(true),
    getSocials(true),
    getNavItems(true),
    getTimeline(true),
    getProjects(true),
    getHackathons(true),
    getCertificates(true),
    getPostRows(true),
  ]);

  const books = shelf.books.map((b) => ({
    slug: bookSlug(b.title),
    title: b.title,
    author: b.author,
    genre: b.genre,
  }));

  return (
    <main className="flex flex-col gap-8">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Admin · 2FA verified
          </span>
          <h1 className="font-sans text-2xl font-semibold tracking-tight">Content</h1>
          <p className="font-mono text-[10px] text-muted-foreground">{state.email}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <SignOutButton />
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
          >
            View site
          </Link>
        </div>
      </header>

      {/* Anchor nav rather than JS tabs — the editors are all server-rendered
          and the page is short enough that scrolling beats state. */}
      <nav className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className="rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.label}
          </a>
        ))}
      </nav>

      <Panel id="profile" title="Profile — name, bio, contact">
        <RecordEditor
          table="profile"
          fields={PROFILE_FIELDS}
          rows={[profile]}
          blank={BLANKS.profile}
          singleton
        />
      </Panel>

      <Panel id="timeline" title="Timeline — work, volunteering, education">
        <RecordEditor
          table="timeline_entries"
          fields={TIMELINE_FIELDS}
          rows={timeline}
          blank={BLANKS.timeline_entries}
          titleKey="org"
          subtitleKey="role"
        />
      </Panel>

      <section id="work" className="scroll-mt-8 space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Work timeline
        </h2>
        <WorkEditor entries={work} />
      </section>

      <section id="life" className="scroll-mt-8 space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Life — family & friends
        </h2>
        <LifeEditor entries={life} />
      </section>

      <section id="skills" className="scroll-mt-8 space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Skills
        </h2>
        <SkillsEditor skills={skills} />
      </section>

      <section id="books" className="scroll-mt-8 space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Book ratings & genres
        </h2>
        <BooksEditor
          books={books}
          overrides={Object.fromEntries(overrides)}
        />
      </section>

      <Panel id="projects" title="Projects & Ignosis showcase">
        <RecordEditor
          table="projects"
          fields={PROJECT_FIELDS}
          rows={projects}
          blank={BLANKS.projects}
          subtitleKey="kind"
        />
      </Panel>

      <Panel id="posts" title="Blog posts">
        <RecordEditor
          table="posts"
          fields={POST_FIELDS}
          rows={posts}
          blank={BLANKS.posts}
          subtitleKey="slug"
        />
      </Panel>

      <Panel id="hackathons" title="Hackathons">
        <RecordEditor
          table="hackathons"
          fields={HACKATHON_FIELDS}
          rows={hackathons}
          blank={BLANKS.hackathons}
          subtitleKey="dates"
        />
      </Panel>

      <Panel id="certificates" title="Certificates">
        <RecordEditor
          table="certificates"
          fields={CERTIFICATE_FIELDS}
          rows={certificates}
          blank={BLANKS.certificates}
          subtitleKey="issuer"
        />
      </Panel>

      <Panel id="socials" title="Social links">
        <RecordEditor
          table="social_links"
          fields={SOCIAL_FIELDS}
          rows={socials}
          blank={BLANKS.social_links}
          titleKey="name"
          subtitleKey="url"
        />
      </Panel>

      <Panel id="nav" title="Navbar items">
        <RecordEditor
          table="nav_items"
          fields={NAV_FIELDS}
          rows={navItems}
          blank={BLANKS.nav_items}
          titleKey="label"
          subtitleKey="href"
        />
      </Panel>
    </main>
  );
}
