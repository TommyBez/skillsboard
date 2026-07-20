import type { CSSProperties } from "react"

import styles from "@/components/landing/landing-motion.module.css"

/**
 * Decorative skill dossiers. Visual examples only — restrained interface
 * fragments (name, source, file reference), never marketing claims.
 * The whole board is aria-hidden; the hero copy carries the message.
 */
const dossiers = [
  {
    name: "code-review",
    source: "github.com/acme/skills",
    ref: "SKILL.md",
    dir: "left",
  },
  {
    name: "pdf-extraction",
    source: "internal / tools",
    ref: "SKILL.md",
    dir: "top",
  },
  {
    name: "brand-voice",
    source: "notion export",
    ref: "SKILL.md",
    dir: "right",
  },
  {
    name: "sql-migrations",
    source: "skills/sql-migrations",
    ref: "SKILL.md",
    dir: "right",
  },
  {
    name: "release-notes",
    source: "github.com/acme/skills",
    ref: "SKILL.md",
    dir: "bottom",
  },
] as const

type Dossier = (typeof dossiers)[number]

function DossierCard({ dossier }: { dossier: Dossier }) {
  return (
    <div className={styles.dossier}>
      <div className={styles.dossierTop}>
        <p className={styles.dossierName}>{dossier.name}</p>
      </div>
      <p className={styles.dossierSource}>{dossier.source}</p>
      <p className={styles.dossierRef}>{dossier.ref}</p>
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
