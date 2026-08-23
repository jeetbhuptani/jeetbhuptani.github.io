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
    summary:
      "Outbound human calling was the bottleneck in collections. I owned the dialer integration across its whole surface — campaigns, lead import, agent provisioning, the screen agents live in, and the reconciliation that closes the loop after a call — and took it to a 30,000-call-a-day operation.",
    highlights: [
      "Scaled human-agent outbound calling from ~3,000 to 30,000 calls a day by integrating a predictive dialer end to end: campaign creation, bulk lead import, agent provisioning, the agent calling interface, and post-call reconciliation.",
      "Cut wasted dials by promoting a borrower to an immediate callback the moment an AI call or a customer reply signals intent, instead of leaving them to the next scheduled batch.",
      "Stopped borrowers being dialed twice by root-causing a duplicate-dialing incident to a repeat-dial burst and fixing the behaviour behind it.",
      "Kept agents on the phone rather than on a support ticket by fixing a disposition-submit flow that closed the call frame mid-write.",
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
    summary:
      "The AI callers carry the bulk of the outreach — over 600,000 calls a day across clients. I shipped across the whole speech-to-text → LLM → text-to-speech path, and the layer that decides what the AI actually says on the line.",
    highlights: [
      "Supported 600K+ AI calls a day across clients by shipping across the voice pipeline: call orchestration and retries, recording and transcription, and disposition mapping.",
      "Made AI calls sound like a person instead of a template by building a dynamic variable layer that fills each prompt with the borrower's real numbers and speaks amounts and dates as words rather than digits.",
      "Made per-client outcomes separable by pushing tenant filtering through the voice dashboards, so one client's answer rate stops hiding inside another's.",
      "Made call analytics reflect what actually happened on the line by reporting hangup cause and answering-machine detection instead of a single undifferentiated 'not connected'.",
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
    summary:
      "None of the calling works if the numbers are burnt. I built and hardened the rotation system that keeps a shared pool of roughly 400 numbers dialable across both AI and human calling.",
    highlights: [
      "Kept a shared pool of ~400 numbers dialable by automating the whole lifecycle — spam detection, provider synchronisation, replacement purchasing, and nightly churn.",
      "Prevented three clients on separate databases from burning the same number by designing a lock-free coordination protocol, so no client has to know the others exist.",
      "Protected regulated number series from the automation after one that should never have been touched was destroyed at the provider.",
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
    period_end: null,
    summary:
      "Every lending client wants the platform to behave slightly differently. This turned that from a release into a database change, and made “can we tune this for one client?” a five-minute answer instead of a next-sprint answer.",
    highlights: [
      "Turned routine per-client tuning from a release into a database update, so a behaviour change ships in minutes instead of waiting on a deploy window.",
      "Made every client independently tunable by routing ~40 existing call sites through a single configuration seam, rather than forking behaviour per client.",
      "Took feature behaviour out of hardcoded branches, so onboarding a client stopped meaning adding another if-statement.",
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
    period_end: null,
    summary:
      "Core service work on the shared collections platform: schema and partitioning design, and what a query actually costs when every client lives on the same instance.",
    highlights: [
      "Cut a table from ~6,000 partitions of ~22 rows each per year down to ~24 partitions of ~5,500, by redesigning the partition key before it reached production.",
      "Kept a 1,423-test backend suite green throughout — the only real evidence that a refactor this size preserved behaviour.",
      "Reduced planner work on a shared multi-tenant instance by tightening transaction boundaries and query shapes; there, round-trips are cheap and planning is not.",
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
    summary:
      "The view the collections team runs its day on: a ClickHouse-backed event pipeline feeding live dashboards, with alerting on the numbers that actually indicate something is wrong.",
    highlights: [
      "Gave the collections team one live view of the day — 93 panels across 13 rows — generated from code rather than edited in the UI, after UI edits were being silently clobbered on every re-export.",
      "Kept panel cost flat as event volume grows by rewriting the generator to drop every join-backed query.",
      "Made one dashboard safe to serve every tenant by pushing tenant filtering through all 29 query targets.",
      "Documented the dashboard's own blind spots in a definitions panel, because two panels quietly disagreeing on what a metric means is a worse failure than broken SQL.",
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
    summary:
      "The least visible thread of the year and the most load-bearing: making the jobs behind allocation, prioritisation and retries behave the same way every single time they run.",
    highlights: [
      "Made hot-lead prioritisation deterministic — newest record wins — instead of depending on a mutable priority column two jobs could race on.",
      "Stopped “skip” quietly meaning “now” by making optional scheduling inputs explicit rather than defaulted.",
      "Turned silent runtime degradation into a loud failure at boot when configuration is missing, so a misconfigured service never half-works in production.",
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
    period_end: null,
    summary:
      "Mined two years of merge-request feedback into a written rule set and used it as a pre-push checklist. The point was to stop re-learning the same comment.",
    highlights: [
      "Cut repeat review rounds by distilling 123 reviewer comments across 154 merge requests into 64 cited rules, then running them as a pre-push checklist.",
      "Made each rule arguable by quoting the original comment and citing the MRs it came from — a cited pattern can be discussed, a generic lint opinion cannot.",
      "Surfaced the uncomfortable finding behind it: fixing the flagged line instead of the pattern was costing a second review round almost every time.",
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
