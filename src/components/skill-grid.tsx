import type { Skill } from "@/lib/content/types";
import { SKILL_CATEGORY_ORDER } from "@/lib/content/seed";
import { groupOrdered } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Skills grouped by category, with `weight` driving emphasis rather than a
 * progress bar. Self-assessed percentage bars claim a precision nobody has;
 * three tiers of contrast say "daily driver / working knowledge / touched it"
 * without pretending to measure anything.
 */
export function SkillGrid({ skills }: { skills: Skill[] }) {
  const groups = groupOrdered(skills, (s) => s.category, SKILL_CATEGORY_ORDER);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <p className="shrink-0 pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:w-28">
            {group.key}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {group.items.map((skill) => (
              <li
                key={skill.id}
                className={cn(
                  "rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors",
                  skill.weight >= 3
                    ? "border-foreground/25 bg-secondary text-foreground"
                    : skill.weight === 2
                      ? "border-border bg-card text-muted-foreground"
                      : "border-border/60 bg-transparent text-muted-foreground/70"
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
