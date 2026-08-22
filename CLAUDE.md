# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (CI uses `pnpm install --frozen-lockfile`); `package-lock.json` also exists but `pnpm-lock.yaml` is authoritative.

- `pnpm dev` — run the dev server (http://localhost:3000)
- `pnpm build` — Next build; `postbuild` runs `next-sitemap` to emit `sitemap.xml` / `robots.txt`
- `pnpm start` — serve the built output locally
- `pnpm lint` — Next.js ESLint
- `pnpm test` — Vitest (`src/**/*.test.ts`)

## Architecture

A Next.js 14 **App Router** personal portfolio + blog deployed to **Vercel**, forked from the magicui / dillionverma portfolio template. It was originally a static export to GitHub Pages; that migration is done, so route handlers, ISR and `next/og` all work. Production domain is **jeetbhuptani.tech** (`.me` expired).

### Content: two sources, one adapter
Static, rarely-changing content (bio, education, projects, hackathons, certificates, navbar) still lives in `DATA` in `src/data/resume.tsx`.

Everything editable from `/admin` — work timeline, life entries, skills, book overrides — goes through **`src/lib/content/`**:

- `types.ts` — field names match the Postgres columns 1:1 (snake_case).
- `seed.ts` — committed fallback content. Real data, not placeholders.
- `index.ts` — reads Supabase when configured, falls back to `seed.ts` otherwise **and on failure**. The Supabase free tier pauses after 7 days idle, so a paused DB must degrade to seed content, not to an error. `/api/keepalive` + a daily Vercel cron reset that timer.

This means the site builds and renders correctly with no Supabase env vars at all.

### Admin + auth (`/admin`)
Supabase Auth with **mandatory TOTP**. `src/lib/supabase/auth.ts` returns an `AdminState` requiring both the right `ADMIN_EMAIL` *and* an AAL2 session — it checks `nextLevel`, not just `currentLevel`, which is what stops a password-only session sliding through once a factor is enrolled.

**All writes go through `src/app/api/admin/[table]/route.ts`.** It re-runs `requireAdmin()` server-side, validates with a per-table zod schema, and only then uses the service-role client. The browser never holds a write credential. RLS grants public `SELECT` on published rows and **no write policy**, so the service-role path is the only way in — deliberately, so there is one thing to audit.

Schema lives in `supabase/migrations/0001_content_schema.sql`; run it in the Supabase SQL editor.

### Media
Cloudinary, via `src/lib/cloudinary.ts`. Store the `public_id` in Postgres, never a URL, so the transform is chosen at render time (`f_auto,q_auto` + an explicit width). Uploads are signed by `/api/admin/upload-signature` and go browser→Cloudinary directly, bypassing the Vercel body limit.

### Single source of truth: `src/data/resume.tsx`
Nearly all page content (name, bio, skills, work history, education, projects, hackathons, social links, navbar items) lives in the exported `DATA` object. **To change site content, edit `DATA` — not the JSX in `src/app/page.tsx`.** `src/app/page.tsx` is a presentation layer that maps over `DATA` into card components (`ResumeCard`, `ProjectCard`, `HackathonCard`). The bio `description` field computes the author's age inline from a birthdate at build time.

### Blog pipeline (`src/data/blog.ts`)
Posts are `.mdx` files in `content/`. The slug is the filename (minus extension). The pipeline reads files with `gray-matter` (frontmatter → `metadata`: `title`, `publishedAt`, `summary`, optional `image`) and converts the body to an **HTML string** via a `unified` chain (`remarkParse` → `remarkGfm` → `remarkRehype` → `rehypePrettyCode` with `min-light`/`min-dark` Shiki themes → `rehypeStringify`). Note: posts are rendered as HTML strings injected with `dangerouslySetInnerHTML` inside a `prose` container — **not** via MDX component rendering. `src/app/blog/[slug]/page.tsx` uses `generateStaticParams` over all posts and emits per-post OpenGraph + JSON-LD metadata.

To add a blog post: drop a new `.mdx` file in `content/` with the frontmatter fields above. No registration needed.

### UI components
- `src/components/ui/*` — shadcn/ui (New York style, `neutral` base, configured in `components.json`). Add new ones with the shadcn CLI; aliases: `@/components`, `@/components/ui`, `@/lib/utils`.
- `src/components/magicui/*` — animation primitives (`BlurFade`, `BlurFadeText`, `Dock`) built on `framer-motion` / `motion`.
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge) and `formatDate()` (relative "Xd/w/mo/y ago" formatting used by the blog).
- Theming via `next-themes` (`ThemeProvider`, `ModeToggle`); Tailwind with CSS variables.

### Animation budget
`framer-motion` is the only animation library — GSAP was removed (the custom cursor was its only consumer and it now uses a raw rAF lerp that parks itself when the pointer is at rest). The ambient wash and film grain in `globals.css` are pure CSS with no image request. Prefer `transform`/`opacity` for hover states; never animate `box-shadow`.

### Deployment
Vercel git deploys. `master` is the mainline and pushing to it is a production deploy. Note `origin/main` exists but is a stale unrelated branch — do not target it.
