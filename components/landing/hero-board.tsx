import { GitForkIcon } from "lucide-react"

import styles from "@/components/landing/sections/hero.module.css"

/**
 * Decorative skill cards. Visual examples only — they mirror the real
 * SkillDossier information hierarchy (source, stars, name, description,
 * tags, install command) so the hero reads as the actual app UI.
 * The whole cluster is aria-hidden; the hero copy carries the message.
 *
 * Ordered back to front: the last entry is the fully visible card, and the
 * two behind it show only their source row. At 390px only the front card
 * renders, at the same width it has on desktop, cropped by the viewport
 * (direction §4B law 2) — scaling it down is what made it illegible.
 */
const skills = [
  {
    name: "brand-voice",
    source: "acme/brand-kit",
    stars: "312 stars",
    description: "Rewrite copy to match the team brand voice guide.",
    tags: ["writing", "brand"],
    command:
      "npx skills add https://github.com/acme/brand-kit --skill brand-voice",
  },
  {
    name: "pdf-extraction",
    source: "anthropics/skills",
    stars: "8.4k stars",
    description: "Pull text, tables, and metadata from PDF documents.",
    tags: ["documents"],
    command:
      "npx skills add https://github.com/anthropics/skills --skill pdf-extraction",
  },
  {
    name: "code-review",
    source: "acme/engineering-skills",
    stars: "1.2k stars",
    description: "Review PRs for correctness, style, and missing tests.",
    tags: ["review", "ci"],
    command:
      "npx skills add https://github.com/acme/engineering-skills --skill code-review",
  },
] as const

type Skill = (typeof skills)[number]

function SkillCard({ skill, className }: { skill: Skill; className: string }) {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.cardBody}>
        <p className={styles.cardMeta}>
          <GitForkIcon className={styles.cardFork} aria-hidden="true" />
          <span className={`${styles.cardSource} lp-code`}>{skill.source}</span>
          <span className={`${styles.cardStars} lp-micro`}>{skill.stars}</span>
        </p>
        <p className={`${styles.cardName} lp-h2`}>{skill.name}</p>
        <p className={`${styles.cardDesc} lp-small`}>{skill.description}</p>
        <div className={styles.cardTags}>
          {skill.tags.map((tag) => (
            <span key={tag} className={`${styles.cardTag} lp-micro`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.cardFooter}>
        <code className={`${styles.cardCmd} lp-code`}>{skill.command}</code>
      </div>
    </div>
  )
}

export function HeroBoard() {
  const front = skills[skills.length - 1]
  const behind = skills.slice(0, -1)

  return (
    <div className={styles.cluster} aria-hidden="true" data-reveal>
      {behind.map((skill, i) => (
        <SkillCard
          key={skill.name}
          skill={skill}
          className={`${styles.cardBehind} ${i === 0 ? styles.cardBack : styles.cardMiddle}`}
        />
      ))}
      <SkillCard skill={front} className={styles.cardFront} />
    </div>
  )
}
