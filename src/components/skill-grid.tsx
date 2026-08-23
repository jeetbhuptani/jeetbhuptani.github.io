import type { Skill } from "@/lib/content/types";
import { SKILL_CATEGORY_ORDER } from "@/lib/content/seed";
import { groupOrdered } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Skills grouped by category, with `weight` driving emphasis rather than a
 * progress bar. Self-assessed percentage bars claim a precision nobody has;
 * three tiers of contrast say "daily driver / working knowledge / touched it"
 * without pretending to measure anything.
 *
 * The tiers run dark to light: the strongest skill is the highest-contrast
 * chip. That inverts correctly in dark mode — `bg-foreground` is near-black on
 * a light page and near-white on a dark one, so "strongest = loudest" holds in
 * both themes without a second palette.
 */

/** Weight 3 → 1, darkest → lightest. Index 0 is unused so `TIERS[weight]` reads
 *  directly off the stored value. */
const TIERS = [
  "",
  "border-border bg-transparent text-muted-foreground/80",
  "border-foreground/15 bg-foreground/[0.07] text-foreground/90",
  "border-transparent bg-foreground text-background shadow-[0_1px_2px_rgb(0_0_0/0.18)]",
] as const;

const LEGEND = [
  { weight: 3, label: "Daily driver" },
  { weight: 2, label: "Working knowledge" },
  { weight: 1, label: "Touched it" },
];

function tier(weight: number) {
  return TIERS[Math.min(3, Math.max(1, weight))];
}

export function SkillGrid({ skills }: { skills: Skill[] }) {
  const groups = groupOrdered(skills, (s) => s.category, SKILL_CATEGORY_ORDER);

  return (
    <div className="space-y-5">
      {/* Without this the shading is just decoration — a visitor has no way to
          know a darker chip means anything at all. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
          Darker = stronger
        </span>
        <ul className="flex flex-wrap items-center gap-1.5">
          {LEGEND.map((l) => (
            <li
              key={l.weight}
              className={cn(
                "rounded-md border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]",
                tier(l.weight)
              )}
            >
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <p className="shrink-0 pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:w-28">
            {group.key}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {group.items.map((skill) => (
              <li
                key={skill.id}
                title={LEGEND.find((l) => l.weight === skill.weight)?.label}
                className={cn(
                  "rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors",
                  tier(skill.weight)
                )}
              >
                {skill.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
