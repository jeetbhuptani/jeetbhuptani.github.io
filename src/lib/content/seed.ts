/**
 * Committed fallback content, used whenever Supabase is not configured.
 *
 * This is a real, complete dataset — not placeholder text — so the site is
 * fully presentable before the DB exists and stays presentable if Supabase is
 * ever paused or unreachable. Once /admin is live, Supabase becomes the source
 * of truth and these rows are only a safety net.
 *
 * The work entries are distilled from the Obsidian daily notes (Jun–Aug 2026)
 * and deliberately sanitised: no client or vendor names, no ticket ids, no
 * internal service or host names. Capability and scale only.
 */
import type { BookOverride, LifeEntry, Skill, WorkEntry } from "./types";

export const SEED_WORK: WorkEntry[] = [
  {
    id: "seed-dialer",
    title: "Predictive dialer, end to end",
    track: "Integrations",
    period_start: "2026-06",
    period_end: null,
    summary: "Owned the human-calling dialer integration across its whole surface.",
    highlights: [
      "Campaigns, bulk lead import, agent provisioning, the calling screen, post-call reconciliation.",
      "Promoted borrowers to an immediate callback on an intent signal, cutting wasted dials.",
      "Root-caused a duplicate-dialing incident and a disposition submit that closed the call frame mid-write.",
    ],
    metrics: ["~3,000 → 30,000 calls/day", "10× outbound capacity"],
    tech: ["Java", "Spring Boot", "Feign", "REST", "Webhooks", "Telephony"],
    sort_order: 10,
    published: true,
  },
  {
    id: "seed-voice",
    title: "AI voice calling pipeline",
    track: "AI",
    period_start: "2026-06",
    period_end: null,
    summary: "Shipped across the speech → LLM → speech path the AI callers run on.",
    highlights: [
      "Call orchestration and retries, recording, transcription, disposition mapping.",
      "Dynamic prompt variables — each call carries the borrower's real numbers, spoken as words.",
      "Per-tenant dashboards, plus hangup cause and answering-machine detection instead of one flat “not connected”.",
    ],
    metrics: ["600K+ AI calls/day"],
    tech: ["Voice AI", "LLMs", "Real-time speech", "Telephony", "Java", "Spring Boot"],
    sort_order: 20,
    published: true,
  },
  {
    id: "seed-numbers",
    title: "Phone-number rotation and deliverability",
    track: "Integrations",
    period_start: "2026-07",
    period_end: null,
    summary: "Automated the lifecycle that keeps a shared number pool dialable.",
    highlights: [
      "Spam scoring, provider sync, replacement purchasing, nightly churn.",
      "Lock-free coordination so three clients on separate databases never burn the same number.",
      "Fenced off regulated number series after one was destroyed at the provider.",
    ],
    metrics: ["~400-number shared pool", "3 clients, 0 cross-client collisions"],
    tech: ["Java", "Spring Boot", "Schedulers", "Telephony", "Multi-tenancy"],
    sort_order: 30,
    published: true,
  },
  {
    id: "seed-config",
    title: "Per-client configuration without a deploy",
    track: "Backend",
    period_start: "2026-05",
    period_end: "2026-08",
    summary: "Moved per-client behaviour out of releases and into a database row.",
    highlights: [
      "~40 existing call sites routed through a single configuration seam.",
      "Tuning a client ships in minutes instead of waiting on a deploy window.",
      "Onboarding a client stopped meaning another hardcoded branch.",
    ],
    metrics: ["~40 call sites on one seam", "0 redeploys for config changes"],
    tech: ["Java", "Spring Boot", "PostgreSQL", "Multi-tenancy"],
    sort_order: 40,
    published: true,
  },
  {
    id: "seed-backend",
    title: "Multi-tenant data model and query cost",
    track: "Backend",
    period_start: "2026-01",
    period_end: "2026-08",
    summary: "Schema, partitioning and query cost on the shared collections platform.",
    highlights: [
      "Redesigned a partition key before it reached production: ~6,000 partitions of ~22 rows → ~24 of ~5,500.",
      "Kept a 1,423-test backend suite green through the refactor.",
      "Tightened transaction boundaries and query shapes — on a shared instance, planning costs more than round-trips.",
    ],
    metrics: ["~6,000 → ~24 partitions", "1,423-test suite kept green"],
    tech: ["Java", "Spring Boot", "JPA", "PostgreSQL", "RDS", "Multi-tenancy"],
    sort_order: 50,
    published: true,
  },
  {
    id: "seed-observability",
    title: "Collections analytics and alerting",
    track: "Data & Observability",
    period_start: "2026-07",
    period_end: null,
    summary: "The live view the collections team runs its day on.",
    highlights: [
      "93 panels across 13 rows, generated from code after UI edits kept being clobbered on re-export.",
      "Dropped every join-backed query, so panel cost stays flat as event volume grows.",
      "Tenant filtering through all 29 query targets, and the dashboard's blind spots written down in it.",
    ],
    metrics: ["93 panels / 13 rows", "29 tenant-filtered query targets"],
    tech: ["ClickHouse", "Grafana", "SQL", "Prometheus", "Dashboards-as-code"],
    sort_order: 60,
    published: true,
  },
  {
    id: "seed-jobs",
    title: "Scheduled work, correct under concurrency",
    track: "Backend",
    period_start: "2026-06",
    period_end: null,
    summary: "Made the jobs behind allocation, prioritisation and retries behave the same way every run.",
    highlights: [
      "Hot-lead prioritisation made deterministic — newest record wins, no mutable column two jobs can race on.",
      "Optional scheduling inputs made explicit, so “skip” stopped quietly meaning “now”.",
      "Missing configuration now fails loudly at boot rather than half-working in production.",
    ],
    metrics: [],
    tech: ["Java", "Spring Boot", "Concurrency", "Schedulers", "Sentry"],
    sort_order: 70,
    published: true,
  },
  {
    id: "seed-craft",
    title: "Review discipline as a system",
    track: "Craft",
    period_start: "2026-08",
    period_end: "2026-09",
    summary: "Turned two years of merge-request feedback into a pre-push checklist.",
    highlights: [
      "123 reviewer comments across 154 MRs distilled into 64 cited rules.",
      "Every rule quotes the original comment, so it can be argued with rather than obeyed.",
      "The finding behind it: fixing the flagged line instead of the pattern was buying a second review round.",
    ],
    metrics: ["154 MRs analysed", "123 review comments", "64 rules distilled"],
    tech: ["Code review", "Static analysis", "Technical writing"],
    sort_order: 80,
    published: true,
  },
];

export const SEED_SKILLS: Skill[] = [
  // Languages
  { id: "s1", name: "Java", category: "Languages", weight: 3, sort_order: 10 },
  { id: "s2", name: "TypeScript", category: "Languages", weight: 3, sort_order: 20 },
  { id: "s3", name: "Python", category: "Languages", weight: 2, sort_order: 30 },
  { id: "s4", name: "SQL", category: "Languages", weight: 3, sort_order: 40 },
  { id: "s5", name: "C++", category: "Languages", weight: 1, sort_order: 50 },
  { id: "s6", name: "C#", category: "Languages", weight: 1, sort_order: 60 },
  // Backend
  { id: "s10", name: "Spring Boot", category: "Backend", weight: 3, sort_order: 10 },
  { id: "s11", name: "JPA / Hibernate", category: "Backend", weight: 3, sort_order: 20 },
  { id: "s12", name: "REST & API design", category: "Backend", weight: 3, sort_order: 30 },
  { id: "s13", name: "Microservices", category: "Backend", weight: 2, sort_order: 40 },
  { id: "s14", name: "Multi-tenancy", category: "Backend", weight: 3, sort_order: 50 },
  { id: "s15", name: "Concurrency", category: "Backend", weight: 2, sort_order: 60 },
  { id: "s16", name: "Node / Express", category: "Backend", weight: 2, sort_order: 70 },
  { id: "s17", name: ".NET", category: "Backend", weight: 1, sort_order: 80 },
  // Data
  { id: "s20", name: "PostgreSQL", category: "Data", weight: 3, sort_order: 10 },
  { id: "s21", name: "ClickHouse", category: "Data", weight: 3, sort_order: 20 },
  { id: "s22", name: "MongoDB", category: "Data", weight: 2, sort_order: 30 },
  { id: "s23", name: "Redis", category: "Data", weight: 1, sort_order: 40 },
  { id: "s24", name: "Partitioning & query cost", category: "Data", weight: 3, sort_order: 50 },
  // Cloud & Infra
  { id: "s30", name: "AWS", category: "Cloud & Infra", weight: 2, sort_order: 10 },
  { id: "s31", name: "GCP", category: "Cloud & Infra", weight: 2, sort_order: 20 },
  { id: "s32", name: "Docker", category: "Cloud & Infra", weight: 2, sort_order: 30 },
  { id: "s33", name: "Grafana", category: "Cloud & Infra", weight: 3, sort_order: 40 },
  { id: "s34", name: "Prometheus", category: "Cloud & Infra", weight: 2, sort_order: 50 },
  { id: "s35", name: "Sentry", category: "Cloud & Infra", weight: 2, sort_order: 60 },
  { id: "s36", name: "GitLab CI", category: "Cloud & Infra", weight: 2, sort_order: 70 },
  // AI
  { id: "s40", name: "LLM app design", category: "AI", weight: 3, sort_order: 10 },
  { id: "s41", name: "Agentic systems", category: "AI", weight: 3, sort_order: 20 },
  { id: "s42", name: "Voice AI", category: "AI", weight: 2, sort_order: 30 },
  { id: "s43", name: "Claude Code", category: "AI", weight: 3, sort_order: 40 },
  // Frontend
  { id: "s50", name: "React", category: "Frontend", weight: 3, sort_order: 10 },
  { id: "s51", name: "Next.js", category: "Frontend", weight: 3, sort_order: 20 },
  { id: "s52", name: "Tailwind CSS", category: "Frontend", weight: 3, sort_order: 30 },
  { id: "s53", name: "Flutter", category: "Frontend", weight: 1, sort_order: 40 },
];

/** Order the /work and /skills pages render categories in. Anything not listed
 *  falls to the end, alphabetically — so a new category added from /admin still
 *  appears without a code change. */
export const TRACK_ORDER = ["Integrations", "AI", "Backend", "Data & Observability", "Craft"];

/**
 * The three numbers the work actually adds up to, for the top of /work.
 *
 * Deliberately not a database table: these change once or twice a year, and
 * adding a twelfth collection (plus a migration) to hold three strings would
 * cost more than it saves. If they start changing per quarter, promote them.
 */
export const SEED_IMPACT = [
  { value: "₹50 Cr+", label: "principal outstanding supported" },
  { value: "93%", label: "resolution in the AI-led pilot" },
  { value: "630K+", label: "calls placed per day, AI and human" },
];
export const SKILL_CATEGORY_ORDER = [
  "Languages",
  "Backend",
  "Data",
  "Cloud & Infra",
  "AI",
  "Frontend",
];

/** Empty by design — the /life page renders its own invitation state until
 *  entries are added from /admin with real photos. */
export const SEED_LIFE: LifeEntry[] = [];

/** Empty by design — Hardcover currently returns rating: null for every book,
 *  so ratings only appear once they are set here or in Supabase. */
export const SEED_BOOK_OVERRIDES: BookOverride[] = [];
