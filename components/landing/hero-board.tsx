import type { CSSProperties } from "react"
import { GitForkIcon } from "lucide-react"

import styles from "@/components/landing/landing-motion.module.css"

/**
 * Decorative skill dossiers. Visual examples only — they mirror the real
 * SkillDossier information hierarchy (source, stars, name, description,
 * tags, install command) so the hero reads as the actual app UI.
 * The whole board is aria-hidden; the hero copy carries the message.
 */
const dossiers = [
  {
    name: "code-review",
    source: "acme/engineering-skills",
    stars: "1.2k stars",
    description: "Review PRs for correctness, style, and missing tests.",
    tags: ["review", "ci"],
    command: "npx skills add https://github.com/acme/engineering-skills --skill code-review",
    dir: "left",
  },
  {
    name: "pdf-extraction",
    source: "anthropics/skills",
    stars: "8.4k stars",
    description: "Pull text, tables, and metadata from PDF documents.",
    tags: ["documents"],
    command: "npx skills add https://github.com/anthropics/skills --skill pdf-extraction",
    dir: "top",
  },
  {
    name: "brand-voice",
    source: "acme/brand-kit",
    stars: "312 stars",
    description: "Rewrite copy to match the team brand voice guide.",
    tags: ["writing", "brand"],
    command: "npx skills add https://github.com/acme/brand-kit --skill brand-voice",
    dir: "right",
  },
  {
    name: "sql-migrations",
    source: "drizzle-team/skills",
    stars: "964 stars",
    description: "Draft safe schema migrations and rollback plans.",
    tags: ["database"],
    command: "npx skills add https://github.com/drizzle-team/skills --skill sql-migrations",
    dir: "right",
  },
  {
    name: "release-notes",
    source: "vercel/skills",
    stars: "2.1k stars",
    description: "Turn merged PRs into clear, customer-facing release notes.",
    tags: ["shipping", "docs"],
    command: "npx skills add https://github.com/vercel/skills --skill release-notes",
    dir: "bottom",
  },
] as const

type Dossier = (typeof dossiers)[number]

function DossierCard({ dossier }: { dossier: Dossier }) {
  return (
    <div className={styles.dossier}>
      <div className={styles.dossierBody}>
        <div className={styles.dossierMeta}>
          <p className={styles.dossierSource}>
            <GitForkIcon className={styles.dossierFork} aria-hidden="true" />
            <span>{dossier.source}</span>
          </p>
          <span className={styles.dossierStars}>{dossier.stars}</span>
        </div>
        <p className={styles.dossierName}>{dossier.name}</p>
        <p className={styles.dossierDesc}>{dossier.description}</p>
        <div className={styles.dossierTags}>
          {dossier.tags.map((tag) => (
            <span key={tag} className={styles.dossierTag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.dossierFooter}>
        <div className={styles.dossierCmdStrip}>
          <code className={styles.dossierCmd}>{dossier.command}</code>
        </div>
      </div>
    </div>
  )
}

export function HeroBoard() {
  return (
    <>
      {/* Desktop / large tablet: scattered dossiers converging on scroll. */}
      <div className={styles.heroBoard} data-hero-board aria-hidden="true">
        <div className={styles.heroCards}>
          {dossiers.map((dossier, i) => (
            <div
              key={dossier.name}
              className={styles.dossierSlot}
              data-slot={i + 1}
            >
              <div className={styles.dossierEnter} data-dir={dossier.dir}>
                <div
                  className={styles.dossierParallax}
                  style={{ "--depth": `${(i % 3) + 2}px` } as CSSProperties}
                >
                  <DossierCard dossier={dossier} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Small screens & reduced motion: scattered artifacts into an aligned stack. */}
      <div className={styles.heroBoardMobile} aria-hidden="true">
        <div className={styles.mobileChaos}>
          {dossiers.slice(0, 3).map((dossier) => (
            <div key={dossier.name} className={styles.mobileChaosCard}>
              <DossierCard dossier={dossier} />
            </div>
          ))}
        </div>
        <ul className={styles.mobileStack}>
          {dossiers.map((dossier) => (
            <li key={dossier.name} className={styles.mobileStackRow}>
              <span className={styles.mobileStackName}>{dossier.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
