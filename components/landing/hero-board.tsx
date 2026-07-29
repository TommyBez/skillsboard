import type { CSSProperties } from "react"
import { GitForkIcon, SearchIcon, StarIcon } from "lucide-react"

import styles from "@/components/landing/styles/hero.module.css"

/**
 * Decorative skill dossiers. Visual examples only — they mirror the real
 * SkillDossier information hierarchy (name, stars, source, description, tags,
 * install command) so the hero reads as the actual app UI.
 *
 * `source` is split into owner / repo because it is a *provenance* line, not a
 * caption: the fork mark is printed in the accent (as it is in the product),
 * the owner is set back, and the repository carries the weight. The same
 * treatment is used for the source feed that draws itself once a card is filed,
 * so the "after" state reads as a list of sources rather than grey mono text.
 *
 * The card's top strip is deliberately a complete, self-sufficient index row:
 * once the deck is filed the card folds shut on that strip and becomes a row
 * of the Team library listing. Same element, two legible states.
 *
 * The whole board is aria-hidden; the hero copy carries the message.
 */
/* Star counts are three digits on every card on purpose. A thousands separator
   set in the card's 10px mono reads as a decimal point — "1,204" was being read
   as 1.2 — and mixing separated and unseparated values in the same column makes
   the whole set ambiguous. One numeral width, one column, no punctuation. */
const dossiers = [
  {
    name: "code-review",
    owner: "acme",
    repo: "eng-skills",
    stars: "412",
    // One line at every card width down to 1024 — the scattered deck is a
    // composition of five equal cards, so their heights must not vary.
    description: "Reviews PRs for missing tests.",
    tags: ["review", "ci"],
    command: "npx skills add acme/eng-skills",
    depth: "12px",
  },
  {
    name: "pdf-extraction",
    owner: "anthropic",
    repo: "skills",
    stars: "938",
    description: "Pulls tables out of PDF files.",
    tags: ["documents"],
    command: "npx skills add anthropic/skills",
    depth: "7px",
  },
  {
    name: "brand-voice",
    owner: "acme",
    repo: "brand-kit",
    stars: "271",
    description: "Rewrites copy to brand voice.",
    tags: ["writing", "brand"],
    command: "npx skills add acme/brand-kit",
    depth: "14px",
  },
  {
    name: "sql-migrations",
    owner: "drizzle",
    repo: "skills",
    stars: "864",
    description: "Drafts safe schema migrations.",
    tags: ["database"],
    command: "npx skills add drizzle/skills",
    depth: "6px",
  },
  {
    name: "release-notes",
    owner: "vercel",
    repo: "skills",
    stars: "590",
    description: "Turns merged PRs into notes.",
    tags: ["shipping", "docs"],
    command: "npx skills add vercel/skills",
    depth: "10px",
  },
] as const

type Dossier = (typeof dossiers)[number]

/** owner / repo, set as a provenance line. */
function SourceRef({
  dossier,
  className,
  iconClassName,
}: {
  dossier: Dossier
  className: string
  iconClassName: string
}) {
  return (
    <span className={className}>
      <GitForkIcon className={iconClassName} aria-hidden="true" />
      <span className={styles.sourceText}>
        <span className={styles.sourceOwner}>{dossier.owner}</span>
        <span className={styles.sourceSlash}>/</span>
        <span className={styles.sourceRepo}>{dossier.repo}</span>
      </span>
    </span>
  )
}

/* No index badge. The page already numbers its chapters 01…06 in this exact
   mono at this exact size; five more numerals 780px away were a second
   numbering system saying nothing the row's own position does not. */
function DossierRow({ dossier }: { dossier: Dossier }) {
  return (
    <div className={styles.dossierRow}>
      <span className={styles.dossierName}>{dossier.name}</span>
      <span className={styles.dossierStars}>
        <StarIcon className={styles.dossierStar} aria-hidden="true" />
        {dossier.stars}
      </span>
    </div>
  )
}

function DossierCard({ dossier }: { dossier: Dossier }) {
  return (
    <div className={styles.dossier}>
      <DossierRow dossier={dossier} />
      <div className={styles.dossierBody}>
        <SourceRef
          dossier={dossier}
          className={styles.dossierSource}
          iconClassName={styles.dossierFork}
        />
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

/* The panel says three things and each of them is a different fact: what it is
   (head), that it is searchable (filter), and how many repositories feed it
   (base). It used to say "5 SKILLS" in the head as well, 40px above a filter
   row already reading "Filter 5 skills" — the same number three times in one
   340px column. */
function LibraryHead() {
  return (
    <div className={styles.libraryHead}>
      <span className={styles.libraryDot} />
      <span className={styles.libraryLabel}>Team library</span>
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

/* One mark, not two. The base used to print "5 SOURCES" and "MCP READY", the
   second of which carried the chapter's *second* green dot 620px from the
   first — two status lights doing two different jobs inside one panel. The
   sources count is the one fact the head does not already state. */
function LibraryFoot() {
  return (
    <div className={styles.libraryFoot}>
      <span>5 sources</span>
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
                <SourceRef
                  dossier={dossier}
                  className={styles.libraryFeedLabel}
                  iconClassName={styles.libraryFeedIcon}
                />
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
                  <DossierCard dossier={dossier} />
                  <div className={styles.dossierPeek}>
                    <DossierCard dossier={dossier} />
                    <span className={styles.dossierLeader} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Small screens: the same story, told as a static before / after.
          All five dossiers appear in both halves, in the same order. */}
      <div className={styles.heroBoardMobile} aria-hidden="true">
        <p className={styles.mobileMark}>Scattered</p>
        <div className={styles.mobileChaos}>
          {dossiers.map((dossier) => (
            <div key={dossier.name} className={styles.mobileChaosCard}>
              <DossierCard dossier={dossier} />
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
            {dossiers.map((dossier) => (
              <div key={dossier.name} className={styles.mobileRow}>
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
