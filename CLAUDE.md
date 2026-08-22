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

### Content: one adapter, database first
**All** site content is database-backed and editable from `/admin`. Nothing user-visible is hardcoded in a page any more. Everything goes through **`src/lib/content/`**:

- `types.ts` — field names match the Postgres columns 1:1 (snake_case).
- `seed.ts` — fallback for the collections in migration 0001 (work threads, life, skills, book overrides).
- `from-resume.ts` — fallback for migration 0002, as a *projection* of `DATA` rather than a second copy. Duplicating the resume data would guarantee drift, and the drift would only surface the day Supabase is unreachable.
- `posts.ts` — blog posts, with `content/*.mdx` as the fallback.
- `index.ts` — reads Supabase when configured, falls back **on failure too**. The free tier pauses after 7 days idle, so a paused DB must degrade to seed content, not to an error. `/api/keepalive` + a daily Vercel cron reset that timer.

Every reader takes a `fresh` flag; `/admin` passes `true` so its editors never show a cached copy of what they are editing.

The site builds and renders correctly with no Supabase env vars at all.

### Icons are names, not components
`DATA` and every `links` JSONB column store icon *names* (`"github"`), resolved by `src/components/icon-by-name.tsx`. A name starting with `/` renders as an `<img>`, so uploaded brand marks work without a code change. This is what made the content DB-storable — the old `resume.tsx` held JSX.

### Admin + auth (`/admin`)
Supabase Auth with **mandatory TOTP**. `src/lib/supabase/auth.ts` returns an `AdminState` requiring both the right `ADMIN_EMAIL` *and* an AAL2 session — it checks `nextLevel`, not just `currentLevel`, which is what stops a password-only session sliding through once a factor is enrolled.

**All writes go through `src/app/api/admin/[table]/route.ts`.** It re-runs `requireAdmin()` server-side, validates with a per-table zod schema, and only then uses the service-role client. The browser never holds a write credential. RLS grants public `SELECT` on published rows and **no write policy**, so the service-role path is the only way in — deliberately, so there is one thing to audit.

Schema lives in `supabase/migrations/`; run each in the Supabase SQL editor. Twelve tables. Seed with `pnpm seed` (0001) and `pnpm seed:full` (0002); both refuse to touch a non-empty table unless given `--force`.

The eight collections from 0002 share one schema-driven editor (`record-editor.tsx` + `field-specs.ts`) rather than eight bespoke forms. The four from 0001 stay bespoke because their UIs genuinely differ (media upload, star ratings, chip lists).

### Media
Cloudinary, via `src/lib/cloudinary.ts`. Store the `public_id` in Postgres, never a URL, so the transform is chosen at render time (`f_auto,q_auto` + an explicit width). Uploads are signed by `/api/admin/upload-signature` and go browser→Cloudinary directly, bypassing the Vercel body limit.

### `src/data/resume.ts` is now the *fallback*, not the source
It is plain data (no JSX, hence `.ts`). **To change site content, use `/admin`** — editing `DATA` only changes what renders when Supabase is unavailable. Keep the two in rough sync when making structural changes.

### Blog pipeline
Posts live in the `posts` table (`body` is raw markdown) and are read via `src/lib/content/posts.ts`; the `content/*.mdx` files remain as the fallback. Only the *source* moved — rendering still runs the same `unified` chain in `src/data/blog.ts` (`remarkParse` → `remarkGfm` → `remarkRehype` → `rehypePrettyCode` with Shiki → `rehypeStringify`), injected with `dangerouslySetInnerHTML` inside a `prose` container.

Add a post from `/admin`. **Trade-off worth knowing:** posts in the database are no longer versioned by git, so an edit made in the admin has no diff.

### UI components
- `src/components/ui/*` — shadcn/ui (New York style, `neutral` base, configured in `components.json`). Add new ones with the shadcn CLI; aliases: `@/components`, `@/components/ui`, `@/lib/utils`.
- `src/components/magicui/*` — animation primitives (`BlurFade`, `BlurFadeText`, `Dock`) built on `framer-motion` / `motion`.
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge) and `formatDate()` (relative "Xd/w/mo/y ago" formatting used by the blog).
- Theming via `next-themes` (`ThemeProvider`, `ModeToggle`); Tailwind with CSS variables.

### Removed integrations
Spotify (now-playing rail) was removed — it rendered `hidden xl:flex` at 45% opacity and returned `null` without an active track, so it was effectively never visible. `tsconfig` sets `allowImportingTsExtensions` so `from-resume.ts` can use an explicit `.ts` import that both the Next bundler and plain Node (for the seed scripts) resolve.

### Animation budget
`framer-motion` is the only animation library — GSAP was removed (the custom cursor was its only consumer and it now uses a raw rAF lerp that parks itself when the pointer is at rest). The ambient wash and film grain in `globals.css` are pure CSS with no image request. Prefer `transform`/`opacity` for hover states; never animate `box-shadow`.

### Deployment
Vercel git deploys. `master` is the mainline and pushing to it is a production deploy. Note `origin/main` exists but is a stale unrelated branch — do not target it.
