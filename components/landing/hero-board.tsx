import type { CSSProperties } from "react"

import styles from "@/components/landing/landing-motion.module.css"

/**
 * Decorative skill dossiers. Visual examples only — restrained interface
 * fragments (name, source, recommendation marker, command/file reference),
 * never marketing claims. The whole board is aria-hidden; the hero copy
 * carries the message.
 */
const dossiers = [
  {
    idx: "001",
    name: "code-review",
    source: "github.com/acme/skills",
    ref: "SKILL.md",
    rec: true,
    dir: "left",
    density: "wide",
  },
  {
    idx: "002",
    name: "pdf-extraction",
    source: "internal / tools",
    cmd: "npx skills add pdf-extraction",
    rec: false,
    dir: "top",
    density: "regular",
  },
  {
    idx: "003",
    name: "brand-voice",
    source: "notion export",
    rec: true,
    dir: "right",
    density: "compact",
  },
  {
    idx: "004",
    name: "sql-migrations",
    source: "skills/sql-migrations",
    ref: "SKILL.md",
    rec: true,
    dir: "right",
    density: "regular",
  },
  {
    idx: "005",
    name: "release-notes",
    source: "github.com/acme/skills",
    cmd: "npx skills add release-notes",
    rec: false,
    dir: "bottom",
    density: "wide",
  },
] as const

type Dossier = (typeof dossiers)[number]

function DossierCard({ dossier }: { dossier: Dossier }) {
  return (
    <div className={styles.dossier} data-density={dossier.density}>
      <div className={styles.dossierMeta}>
        <span className={styles.dossierIdx}>{dossier.idx}</span>
        {dossier.rec ? (
          <span className={styles.dossierRec}>
            <span className={styles.dossierRecDot} />
            REC
          </span>
        ) : null}
      </div>
      <p className={styles.dossierName}>{dossier.name}</p>
      <p className={styles.dossierSource}>{dossier.source}</p>
      {"cmd" in dossier && dossier.cmd ? (
        <p className={styles.dossierCmd}>{dossier.cmd}</p>
      ) : null}
      {"ref" in dossier && dossier.ref ? (
        <p className={styles.dossierRef}>{dossier.ref}</p>
      ) : null}
    </div>
  )
}

/** The Skills Board “S” used as a large routing device with a signal spine. */
function BoardMark() {
  return (
    <svg
      className={styles.boardMark}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z"
        className={styles.boardMarkOutline}
        pathLength={1}
      />
      <path
        d="M32 6.5H7V16h18v9.5H0"
        className={styles.boardSpine}
        pathLength={1}
      />
    </svg>
  )
}

export function HeroBoard() {
  return (
    <>
      {/* Desktop / large tablet: scattered dossiers orbiting the mark, converging on scroll. */}
      <div className={styles.heroBoard} data-hero-board aria-hidden="true">
        <BoardMark />
        <div className={styles.heroCards}>
          {dossiers.map((dossier, i) => (
            <div
              key={dossier.idx}
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

      {/* Small screens & reduced motion: a static before/after — scattered
          artifacts routed through the mark into an indexed stack. */}
      <div className={styles.heroBoardMobile} aria-hidden="true">
        <div className={styles.mobileChaos}>
          {dossiers.slice(0, 3).map((dossier) => (
            <div key={dossier.idx} className={styles.mobileChaosCard}>
              <DossierCard dossier={dossier} />
            </div>
          ))}
        </div>
        <div className={styles.mobileRouteLine}>
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className={styles.mobileRouteMark}
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <ul className={styles.mobileStack}>
          {dossiers.map((dossier) => (
            <li key={dossier.idx} className={styles.mobileStackRow}>
              <span className={styles.mobileStackIdx}>{dossier.idx}</span>
              <span className={styles.mobileStackName}>{dossier.name}</span>
              {dossier.rec ? (
                <span className={styles.mobileStackRec}>REC</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
