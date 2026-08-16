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
} as const

export type CompareIndexPath = typeof compareIndexPath

export type ComparePath = (typeof comparePaths)[keyof typeof comparePaths]

/** One value per comparison page, used as the analytics location prefix. */
export type ComparisonCtaLocation = "compare_skills_subagents"

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
 */
export interface ComparisonPrimitiveCase {
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

export interface ComparisonTogether {
  title: string
  intro: string
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
  link: ComparisonInlineLink
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
  skillCase: ComparisonPrimitiveCase
  subagentCase: ComparisonPrimitiveCase
  together: ComparisonTogether
  faq: readonly ComparisonFaqEntry[]
  sources: readonly ComparisonSource[]
  related: readonly ComparisonRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}
