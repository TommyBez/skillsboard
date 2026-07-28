import {
  CopyIcon,
  GitForkIcon,
  MessageSquareQuoteIcon,
  SearchIcon,
  TagsIcon,
} from "lucide-react"

import styles from "@/components/landing/sections/product-slab.module.css"

/**
 * The evidence module — direction §8.4. Linear beat us here: it puts real
 * product surface under the fold and in every module, and we showed the product
 * nowhere.
 *
 * The contents are synthetic. The chrome is not: this is `/library`'s own
 * structure — the search panel with its tag filter row, then the two-column
 * grid of SkillDossier cards, each carrying source, stars, name, description,
 * the team note, an example prompt, tags, who added it, and the install
 * command. Sizes come off the shared ramp rather than the app's Tailwind
 * classes, because the slab has to belong to the page it sits on.
 */
const filters = ["All", "review", "ci", "documents", "database", "writing", "release"] as const

const skills = [
  {
    name: "code-review",
    source: "acme/engineering-skills",
    stars: "1.2k stars",
    description: "Review PRs for correctness, style, and missing tests before a human ever opens the diff.",
    note: "Use this one on anything touching billing. It caught the rounding bug in #4412.",
    prompt: "Review this PR against our release checklist and flag anything that needs a migration.",
    tags: ["review", "ci"],
    addedBy: "Dana Ruiz",
    initials: "DR",
    command: "npx skills add https://github.com/acme/engineering-skills --skill code-review",
  },
  {
    name: "sql-migrations",
    source: "drizzle-team/skills",
    stars: "4.7k stars",
    description: "Draft safe schema migrations with a rollback plan and a dry-run against a copy.",
    tags: ["database"],
    addedBy: "Marco Ferri",
    initials: "MF",
    command: "npx skills add https://github.com/drizzle-team/skills --skill sql-migrations",
  },
  {
    name: "release-notes",
    source: "acme/brand-kit",
    stars: "312 stars",
    description: "Turn a merged milestone into release notes in the team's own voice.",
    tags: ["writing", "release"],
    addedBy: "Priya Nair",
    initials: "PN",
    command: "npx skills add https://github.com/acme/brand-kit --skill release-notes",
  },
  {
    name: "pdf-extraction",
    source: "anthropics/skills",
    stars: "8.4k stars",
    description: "Pull text, tables, and metadata out of PDF documents.",
    tags: ["documents"],
    addedBy: "Sam Oyelaran",
    initials: "SO",
    command: "npx skills add https://github.com/anthropics/skills --skill pdf-extraction",
  },
] as const

type Skill = (typeof skills)[number]

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardBody}>
        <p className={styles.cardMeta}>
          <GitForkIcon className={styles.fork} aria-hidden="true" />
          <span className={`${styles.cardSource} lp-code`}>{skill.source}</span>
          <span className={`${styles.cardStars} lp-code`}>{skill.stars}</span>
        </p>

        <p className={`${styles.cardName} lp-h2`}>{skill.name}</p>
        <p className={`${styles.cardDesc} lp-small`}>{skill.description}</p>

        {"note" in skill ? (
          <p className={`${styles.cardNote} lp-small`}>{skill.note}</p>
        ) : null}

        {"prompt" in skill ? (
          <div className={styles.cardPrompt}>
            <p className={`${styles.cardPromptLabel} lp-label`}>
              <MessageSquareQuoteIcon className={styles.promptIcon} aria-hidden="true" />
              Example prompts
            </p>
            <p className={`${styles.cardPromptText} lp-small`}>{skill.prompt}</p>
          </div>
        ) : null}

        <div className={styles.cardTags}>
          {skill.tags.map((tag) => (
            <span key={tag} className={`${styles.tag} lp-micro`}>
              {tag}
            </span>
          ))}
        </div>

        <p className={`${styles.cardAdded} lp-micro`}>
          <span className={styles.avatar} aria-hidden="true">
            {skill.initials}
          </span>
          Added by <span className={styles.addedName}>{skill.addedBy}</span>
        </p>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.command}>
          <code className={`${styles.commandText} lp-code`}>{skill.command}</code>
          <CopyIcon className={styles.commandIcon} aria-hidden="true" />
        </span>
      </div>
    </article>
  )
}

export function ProductSlab() {
  return (
    <section aria-labelledby="product-heading" className={`${styles.section} lp-section`}>
      <div className={`${styles.head} lp-container`}>
        <div className={styles.headText}>
          <p className={`${styles.eyebrow} lp-label`}>The library</p>
          <h2 id="product-heading" className={`${styles.heading} lp-d2`}>
            Every saved skill, one search.
          </h2>
        </div>
        <p className={`${styles.lead} lp-lead`}>
          Search by task, repo, or tag. Every result carries the note whoever saved it, an example
          prompt, and the command to install it.
        </p>
      </div>

      <div className={`${styles.viewport} lp-bleed`}>
        <div className={styles.slab} aria-hidden="true">
          <div className={styles.panel}>
            <div className={styles.panelRow}>
              <span className={styles.field}>
                <SearchIcon className={styles.fieldIcon} aria-hidden="true" />
                <span className={`${styles.fieldText} lp-small`}>
                  Search by name, prompt, note, or tag
                </span>
              </span>
              <span className={`${styles.button} lp-small`}>Search</span>
              <span className={styles.stats}>
                <span className={`${styles.statValue} lp-h2`}>18</span>
                <span className={`${styles.statLabel} lp-micro`}>team skills</span>
                <span className={`${styles.statValue} lp-h2`}>7</span>
                <span className={`${styles.statLabel} lp-micro`}>tags</span>
              </span>
            </div>

            <div className={styles.filters}>
              <TagsIcon className={styles.filterIcon} aria-hidden="true" />
              {filters.map((filter) => (
                <span
                  key={filter}
                  className={`${styles.chip} ${filter === "All" ? styles.chipActive : ""} lp-micro`}
                >
                  {filter}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.results}>
            {skills.map((skill) => (
              <SkillCard key={skill.name} skill={skill} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
