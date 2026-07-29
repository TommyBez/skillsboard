import type { CSSProperties } from "react"
import { GitForkIcon, SearchIcon, StarIcon } from "lucide-react"

import styles from "@/components/landing/styles/hero.module.css"

/**
 * Decorative skill dossiers. Visual examples only — they mirror the real
 * SkillDossier information hierarchy (index, name, stars, source, description,
 * tags, install command) so the hero reads as the actual app UI.
 *
 * The card's top strip is deliberately a complete, self-sufficient index row:
 * once the deck is filed the card folds shut on that strip and becomes a row
 * of the Team library listing. Same element, two legible states.
 *
 * The whole board is aria-hidden; the hero copy carries the message.
 */
const dossiers = [
  {
    name: "code-review",
    source: "acme/eng-skills",
    stars: "1.2k",
    description: "Review PRs for correctness, style, and missing tests.",
    tags: ["review", "ci"],
    command: "npx skills add acme/eng-skills",
    depth: "12px",
  },
  {
    name: "pdf-extraction",
    source: "anthropic/skills",
    stars: "8.4k",
    description: "Pull text, tables, and metadata out of PDF documents.",
    tags: ["documents"],
    command: "npx skills add anthropic/skills",
    depth: "7px",
  },
  {
    name: "brand-voice",
    source: "acme/brand-kit",
    stars: "312",
    description: "Rewrite copy to match the team brand voice guide.",
    tags: ["writing", "brand"],
    command: "npx skills add acme/brand-kit",
    depth: "14px",
  },
  {
    name: "sql-migrations",
    source: "drizzle/skills",
    stars: "964",
    description: "Draft safe schema migrations and rollback plans.",
    tags: ["database"],
    command: "npx skills add drizzle/skills",
    depth: "6px",
  },
  {
    name: "release-notes",
    source: "vercel/skills",
    stars: "2.1k",
    description: "Turn merged PRs into customer-facing release notes.",
    tags: ["shipping", "docs"],
    command: "npx skills add vercel/skills",
    depth: "10px",
  },
] as const

type Dossier = (typeof dossiers)[number]

const index = (i: number) => String(i + 1).padStart(2, "0")

function DossierRow({ dossier, i }: { dossier: Dossier; i: number }) {
  return (
    <div className={styles.dossierRow}>
      <span className={styles.dossierIndex}>{index(i)}</span>
      <span className={styles.dossierName}>{dossier.name}</span>
      <span className={styles.dossierStars}>
        <StarIcon className={styles.dossierStar} aria-hidden="true" />
        {dossier.stars}
      </span>
    </div>
  )
}

function DossierCard({ dossier, i }: { dossier: Dossier; i: number }) {
  return (
    <div className={styles.dossier}>
      <DossierRow dossier={dossier} i={i} />
      <div className={styles.dossierBody}>
        <p className={styles.dossierSource}>
          <GitForkIcon className={styles.dossierFork} aria-hidden="true" />
          <span>{dossier.source}</span>
        </p>
        <p className={styles.dossierDesc}>{dossier.description}</p>
        <div className={styles.dossierTags}>
          {dossier.tags.map((tag) => (
            <span key={tag} className={styles.dossierTag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.dossierFoot}>
        <span className={styles.dossierPrompt}>$</span>
        <code className={styles.dossierCmd}>{dossier.command}</code>
      </div>
    </div>
  )
}

function LibraryHead() {
  return (
    <div className={styles.libraryHead}>
      <span className={styles.libraryDot} />
      <span className={styles.libraryLabel}>Team library</span>
      <span className={styles.libraryCount}>5 skills</span>
      <span className={styles.libraryScan} />
    </div>
  )
}

function LibraryFilter() {
  return (
    <div className={styles.libraryFilter}>
      <SearchIcon className={styles.libraryFilterIcon} aria-hidden="true" />
      <span className={styles.libraryFilterText}>Filter 5 skills</span>
      <span className={styles.libraryKbd}>⌘K</span>
    </div>
  )
}

function LibraryFoot() {
  return (
    <div className={styles.libraryFoot}>
      <span>5 sources</span>
      <span className={styles.libraryFootLive}>mcp ready</span>
    </div>
  )
}

export function HeroBoard() {
  return (
    <>
      {/* Desktop / large tablet: a composed scatter of dossiers that files,
          card by card, into the team library panel across the sticky runway.
          Hovering a filed row pulls its full dossier back out of the drawer. */}
      <div className={styles.heroBoard} data-hero-board aria-hidden="true">
        <div className={styles.heroCards}>
          <div className={styles.libraryFrame}>
            <LibraryHead />
            <LibraryFilter />
            <div className={styles.libraryRows} />
            <LibraryFoot />
          </div>

          <div className={styles.libraryFeed}>
            {dossiers.map((dossier, i) => (
              <div
                key={dossier.name}
                className={styles.libraryFeedRow}
                data-slot={i + 1}
              >
                <span className={styles.libraryFeedLabel}>
                  <GitForkIcon
                    className={styles.libraryFeedIcon}
                    aria-hidden="true"
                  />
                  <span>{dossier.source}</span>
                </span>
                <span className={styles.libraryFeedLine} />
              </div>
            ))}
          </div>

          {dossiers.map((dossier, i) => (
            <div
              key={dossier.name}
              className={styles.dossierSlot}
              data-slot={i + 1}
            >
              <div className={styles.dossierEnter}>
                <div
                  className={styles.dossierParallax}
                  style={{ "--depth": dossier.depth } as CSSProperties}
                >
                  <DossierCard dossier={dossier} i={i} />
                  <div className={styles.dossierPeek}>
                    <DossierCard dossier={dossier} i={i} />
                    <span className={styles.dossierLeader} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Small screens: the same story, told as a static before / after. */}
      <div className={styles.heroBoardMobile} aria-hidden="true">
        <p className={styles.mobileMark}>Scattered</p>
        <div className={styles.mobileChaos}>
          {dossiers.slice(0, 3).map((dossier, i) => (
            <div key={dossier.name} className={styles.mobileChaosCard}>
              <DossierCard dossier={dossier} i={i} />
            </div>
          ))}
        </div>

        <div className={styles.mobileArrow}>
          <span className={styles.mobileArrowLine} />
        </div>

        <p className={`${styles.mobileMark} ${styles.mobileMarkFiled}`}>Filed</p>
        <div className={styles.mobileLibrary}>
          <LibraryHead />
          <div className={styles.mobileFilter}>
            <LibraryFilter />
          </div>
          <div className={styles.mobileRows}>
            {dossiers.map((dossier, i) => (
              <div key={dossier.name} className={styles.mobileRow}>
                <span className={styles.dossierIndex}>{index(i)}</span>
                <span className={styles.dossierName}>{dossier.name}</span>
                <span className={styles.dossierStars}>
                  <StarIcon className={styles.dossierStar} aria-hidden="true" />
                  {dossier.stars}
                </span>
              </div>
            ))}
          </div>
          <LibraryFoot />
        </div>
      </div>
    </>
  )
}
