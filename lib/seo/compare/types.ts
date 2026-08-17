import type { OgTemplateContent } from "@/lib/og/template"

/**
 * The comparison hub sits at its own top-level path rather than under
 * /resources: these pages answer a "X vs Y" query about the primitives a
 * reader already has, not a task-shaped question about running a team
 * library. The hub exists so the set stays crawlable as more pairs land.
 */
export const compareIndexPath = "/compare" as const

export const comparePaths = {
  skillsVsSubagents: "/compare/claude-skills-vs-subagents",
  skillsVsMcp: "/compare/claude-skills-vs-mcp",
  skillsVsPlugins: "/compare/claude-skills-vs-plugins",
  skillsVsSlashCommands: "/compare/claude-skills-vs-slash-commands",
} as const

export type CompareIndexPath = typeof compareIndexPath

export type ComparePath = (typeof comparePaths)[keyof typeof comparePaths]

/** One value per comparison page, used as the analytics location prefix. */
export type ComparisonCtaLocation =
  | "compare_skills_subagents"
  | "compare_skills_mcp"
  | "compare_skills_plugins"
  | "compare_skills_slash_commands"

/**
 * The sticky shell CTA for a comparison page. It is per page rather than per
 * hub, which is why every comparison route mounts its own ResourceShell inside
 * a route group instead of sharing one /compare layout.
 */
export type ComparisonHeaderLocation = `${ComparisonCtaLocation}_header`

/**
 * The three in-page CTA placements, kept in sync with the landing_cta_clicked
 * union. Together with the header location that is four per comparison page,
 * matching what every resource article already reports.
 */
export type ComparisonCtaPlacement =
  `${ComparisonCtaLocation}_${"hero" | "inline" | "closing"}`

export interface ComparisonSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface ComparisonFaqEntry {
  question: string
  answer: string
}

export interface ComparisonRelatedLink {
  label: string
  href: string
  description: string
}

/** One contextual link out of a section, rendered as a sentence. */
export interface ComparisonInlineLink {
  lead: string
  label: string
  href: string
  trail: string
}

export interface ComparisonSideBySide {
  title: string
  intro: string
  /** Table caption, since the dimensions differ from pair to pair. */
  caption: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  sourceIds: readonly string[]
}

/**
 * One half of the verdict: the situations where a primitive is the right
 * choice, plus the counterweight that says when it is not. Both halves carry
 * the counterweight so neither section reads as a recommendation.
 *
 * `leftCase` and `rightCase` on the definition line up with the second and
 * third column of the side-by-side table, in that order.
 */
export interface ComparisonPrimitiveCase {
  /** Section eyebrow, named after the primitive rather than the page. */
  eyebrowLabel: string
  title: string
  intro: string
  cases: readonly {
    title: string
    body: string
  }[]
  counterweightTitle: string
  counterweight: readonly string[]
  sourceIds: readonly string[]
}

/** Copy on the button that duplicates a section's code template. */
export interface ComparisonTemplateCopy {
  buttonLabel: string
  ariaLabel: string
  copiedAriaLabel: string
}

export interface ComparisonTogether {
  title: string
  intro: string
  caption: string
  directions: {
    columns: readonly string[]
    rows: readonly {
      label: string
      cells: readonly string[]
    }[]
  }
  notes: readonly string[]
  template: string
  templateLabel: string
  templateCopy: ComparisonTemplateCopy
  link: ComparisonInlineLink
  sourceIds: readonly string[]
}

/**
 * Optional section for pairs where the team-level answer is a route rather
 * than a primitive: the ordered paths a team walks, starting with the ones
 * that need no product at all.
 */
export interface ComparisonTeamSection {
  title: string
  intro: string
  paths: readonly {
    title: string
    body: string
  }[]
  notes: readonly string[]
  sourceIds: readonly string[]
}

export interface ComparisonDefinition {
  path: ComparePath
  ctaLocation: ComparisonCtaLocation
  /** Short label used on the hub card and in the breadcrumb. */
  subject: string
  eyebrow: string
  title: string
  /** Full document title, including the brand suffix. */
  seoTitle: string
  socialTitle: string
  description: string
  cardSummary: string
  /** Scannable positioning above the fold. */
  intro: readonly string[]
  /** Answer-first verdict, sized for extraction. */
  answer: string
  answerNotes: readonly string[]
  answerSourceIds: readonly string[]
  sideBySide: ComparisonSideBySide
  leftCase: ComparisonPrimitiveCase
  rightCase: ComparisonPrimitiveCase
  together: ComparisonTogether
  team?: ComparisonTeamSection
  faq: readonly ComparisonFaqEntry[]
  sources: readonly ComparisonSource[]
  related: readonly ComparisonRelatedLink[]
  /** Fills "every claim about how <subject> behave comes from ...". */
  editorialSubject: string
  closing: {
    title: string
    body: string
  }
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}
