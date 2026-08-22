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
    title: "Third-party dialer integration, end to end",
    track: "Integrations",
    period_start: "2026-06",
    period_end: null,
    summary:
      "Owned the full integration with an external telephony/dialer platform — campaign and agent modelling, call lifecycle, dispositions, and the automation that keeps them in sync — from vendor evaluation through to production operation.",
    highlights: [
      "Designed the campaign / agent / queue entity model that the integration hangs off, and reconciled it with the vendor's own model where the two disagreed.",
      "Ran the root-cause analysis on a duplicate-dialing incident and fixed the repeat-dial burst behaviour behind it.",
      "Wrote the vendor decision brief and questionnaire that the integration was signed off against.",
      "Fixed agent-facing defects in the embedded dialer, including a disposition-submit flow that closed the frame mid-write.",
    ],
    metrics: ["~5.6k-line SOLID/DRY refactor pass over the integration layer"],
    tech: ["Java", "Spring Boot", "Feign", "REST", "Webhooks", "Telephony"],
    sort_order: 10,
    published: true,
  },
  {
    id: "seed-observability",
    title: "Collections analytics & alerting pipeline",
    track: "Data & Observability",
    period_start: "2026-07",
    period_end: null,
    summary:
      "Built the analytics layer the collections business actually runs its day on: a ClickHouse-backed event pipeline feeding live Grafana dashboards, plus tag-based coverage alerting on top of it.",
    highlights: [
      "Built a live monitoring dashboard of 93 panels across 13 rows, generated from code rather than edited in the UI — UI edits were being silently clobbered on every re-export.",
      "Rewrote the panel generator to drop every join-backed query, so panel cost stays flat as event volume grows.",
      "Pushed tenant filtering through all ClickHouse targets so one dashboard serves every tenant safely.",
      "Made the dashboard document its own blind spots in a definitions panel — the real failure mode is two panels quietly disagreeing on what a metric means, not broken SQL.",
    ],
    metrics: ["93 panels / 13 rows", "29 tenant-filtered query targets"],
    tech: ["ClickHouse", "Grafana", "SQL", "Prometheus", "Dashboards-as-code"],
    sort_order: 20,
    published: true,
  },
  {
    id: "seed-backend",
    title: "Multi-tenant backend & data-model work",
    track: "Backend",
    period_start: "2026-01",
    period_end: null,
    summary:
      "Core service work on a multi-tenant Spring Boot platform for collections — schema and partitioning design, query cost on a shared RDS instance, and tenant configuration as the single source of truth.",
    highlights: [
      "Redesigned a partition key that would have produced ~6,000 partitions of ~22 rows each per year, down to ~24 partitions of ~5,500 rows.",
      "Moved feature behaviour out of hardcoded branches and into tenant configuration.",
      "Tightened transaction boundaries and query shapes against a shared multi-tenant RDS, where the scarce resource is planner work rather than round-trips.",
    ],
    metrics: ["~6,000 → ~24 partitions", "1,423-test backend suite kept green"],
    tech: ["Java", "Spring Boot", "JPA", "PostgreSQL", "RDS", "Multi-tenancy"],
    sort_order: 30,
    published: true,
  },
  {
    id: "seed-scoring",
    title: "ML scoring API contract versioning",
    track: "Backend",
    period_start: "2026-08",
    period_end: null,
    summary:
      "Owned the v3 request/response contract between the collections platform and its ML scoring service, including the migration path off v2 without a coordinated deploy.",
    highlights: [
      "Mapped real consent-based financial data onto the scoring service's transaction and date fields, and caught a date-format mismatch before it reached production.",
      "Verified the implementation against the shared written contract rather than against the previous implementation.",
      "Landed the change with the existing scoring test suite passing unchanged — the signal that the migration was genuinely backwards compatible.",
    ],
    metrics: ["39 pre-existing scoring tests passing unchanged"],
    tech: ["Java", "Spring Boot", "REST", "API versioning", "Account Aggregator"],
    sort_order: 40,
    published: true,
  },
  {
    id: "seed-jobs",
    title: "Job scheduling & concurrency correctness",
    track: "Backend",
    period_start: "2026-06",
    period_end: null,
    summary:
      "The least visible and most load-bearing thread of the year: making scheduled work correct under concurrency — lead prioritisation, allocation ordering, retry semantics, and the boot-time failures that surface when configuration is missing.",
    highlights: [
      "Reworked hot-lead prioritisation so the newest record wins deterministically, instead of relying on a mutable priority column.",
      "Made optional scheduling inputs explicit rather than defaulting them, so 'skip' means skip instead of silently meaning 'now'.",
      "Made services fail loudly at boot on missing configuration rather than degrading silently at runtime.",
    ],
    metrics: [],
    tech: ["Java", "Spring Boot", "Concurrency", "Schedulers", "Sentry"],
    sort_order: 50,
    published: true,
  },
  {
    id: "seed-voice",
    title: "Voice AI platform support",
    track: "AI",
    period_start: "2026-06",
    period_end: null,
    summary:
      "Contributed to a compliance-first voice-AI platform for regulated financial workflows — tenant-scoped observability, call-outcome analytics, and speech-vendor integration.",
    highlights: [
      "Added tenant filtering to the voice dashboards so per-tenant call outcomes are separable.",
      "Worked on hangup-cause and answering-machine-detection reporting so call analytics reflect what actually happened on the line.",
    ],
    metrics: [],
    tech: ["Voice AI", "LLMs", "Real-time speech", "Telephony", "Compliance"],
    sort_order: 60,
    published: true,
  },
  {
    id: "seed-craft",
    title: "Review discipline & engineering craft",
    track: "Craft",
    period_start: "2026-08",
    period_end: null,
    summary:
      "Mined every reviewer comment across two years of merge requests into a written rule set, then used it as a pre-push checklist. The point was to stop re-learning the same feedback.",
    highlights: [
      "Analysed 154 merge requests — 36 carrying reviewer feedback, 123 comments in total — and distilled them into 64 cited rules.",
      "Each rule quotes the original comment and cites the MRs it came from, because a cited pattern is arguable and a generic lint opinion is not.",
      "Surfaced the honest finding: fixing the flagged line instead of the pattern was costing a second review round almost every time.",
    ],
    metrics: ["154 MRs analysed", "123 review comments", "64 rules distilled"],
    tech: ["Code review", "Static analysis", "Technical writing"],
    sort_order: 70,
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
export const TRACK_ORDER = ["Backend", "Data & Observability", "Integrations", "AI", "Craft"];
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
