import { absoluteUrl, siteConfig } from "@/lib/site"

/**
 * The shape a data-driven page has to expose to get a Markdown twin.
 * Structural on purpose, the same way resource-article-schema works: a content
 * module keeps its own definition type and satisfies this without importing
 * anything from here, so a page added to the resource registry later inherits
 * a twin with no extra wiring.
 */
export interface MarkdownContentEntry {
  path: string
  /**
   * Where the twin is published, when appending `.md` to `path` does not
   * produce a URL. Only the home page needs it: `/` + `.md` is not a path.
   */
  markdownPath?: string
  title: string
  description: string
  publishedAt: string
  modifiedAt: string
}

/** Fields that carry presentation or routing metadata rather than page copy. */
const skippedKeys = new Set([
  "path",
  "markdownPath",
  "contentType",
  "topics",
  "eyebrow",
  "title",
  "seoTitle",
  "socialTitle",
  "cardSummary",
  "description",
  "emailCaptureSource",
  "subject",
  "subjectHref",
  "relatedGuidePaths",
  "citations",
  "id",
  "og",
  "ogAlt",
  "publishedAt",
  "modifiedAt",
  // Chrome rather than copy: an eyebrow label above a column, the button and
  // screen-reader strings for a copy control, and the noun the page prints in
  // its own sourcing note. A reader of the Markdown sees none of that UI.
  "eyebrowLabel",
  "templateCopy",
  "editorialSubject",
])

/** Verbatim blocks: templates and directory trees are read as code, not prose. */
const codeKeys = new Set(["template", "copyTemplate", "tree"])

/**
 * The language a fenced block is tagged with when its owner does not name one.
 *
 * A fence with no tag tells a reader nothing about what it is holding, and the
 * readers that matter here copy from it: agents lift lines out of code blocks
 * verbatim. Templates are almost always a SKILL.md or another Markdown
 * document, and a tree is a directory listing rather than a language, so those
 * are the defaults. A block that is something else names it with a sibling
 * `<key>Language` field, which is read here and never rendered as copy.
 */
const defaultCodeLanguages: Record<string, string> = {
  template: "markdown",
  copyTemplate: "markdown",
  tree: "text",
}

/** `templateLanguage` names the tag on `template`; it is metadata, not copy. */
function isCodeLanguageKey(key: string): boolean {
  return (
    key.endsWith("Language") && codeKeys.has(key.slice(0, -"Language".length))
  )
}

/** The tag a fenced block carries, from its own field or from the default. */
function codeLanguageFor(
  key: string,
  record: Record<string, unknown>,
): string | undefined {
  if (!codeKeys.has(key)) return undefined
  const named = record[`${key}Language`]
  return typeof named === "string" ? named : defaultCodeLanguages[key]
}

/** String arrays that are paragraphs rather than bullets. */
const proseArrayKeys = new Set([
  "intro",
  "summary",
  "body",
  "notes",
  "answerNotes",
])

/** Values that belong to the opening of the document, so they carry no heading. */
const leadKeys = new Set(["intro", "summary"])

/** Sub-values inside a section that read fine without a label of their own. */
const unlabeledKeys = new Set([
  "intro",
  "caption",
  "body",
  "notes",
  "points",
  "steps",
  "entries",
  "rows",
  "link",
  "template",
  "tree",
])

const headingOverrides: Record<string, string> = {
  answer: "In short",
  faq: "Frequently asked questions",
  sources: "Sources",
  related: "Related resources",
  checklist: "Checklist",
  intro: "Overview",
}

const labelOverrides: Record<string, string> = {
  skillsBoard: "Skills Board",
  faq: "FAQ",
  href: "Link",
  seoTitle: "SEO title",
  mcp: "MCP",
}

/** Citation keys point at sources by id, and the sources render on their own. */
function isSkippedKey(key: string): boolean {
  return (
    skippedKeys.has(key) ||
    /SourceIds$/.test(key) ||
    key === "sourceIds" ||
    isCodeLanguageKey(key)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isStringArray(value: readonly unknown[]): value is readonly string[] {
  return value.every((item) => typeof item === "string")
}

function isRecordArray(
  value: readonly unknown[],
): value is readonly Record<string, unknown>[] {
  return value.every(isRecord)
}

function humanize(key: string): string {
  const override = labelOverrides[key]
  if (override) return override

  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase()

  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function absoluteHref(href: string): string {
  return href.startsWith("/") ? absoluteUrl(href) : href
}

function link(label: string, href: string): string {
  return `[${prose(label)}](${absoluteHref(href)})`
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

/**
 * A Markdown renderer reads `<name>` as a raw HTML element and drops it, so a
 * placeholder path such as `~/.claude/skills/<name>/SKILL.md` would render as
 * `~/.claude/skills//SKILL.md`. Prose escapes the opening bracket to keep the
 * placeholder visible; a fenced block is left alone, since nothing inside a
 * fence is parsed as markup.
 */
function escapeMarkup(value: string): string {
  return value.replace(/</g, "\\<")
}

/** Collapsed page copy, safe to place in the body of the document. */
function prose(value: string): string {
  return escapeMarkup(collapse(value))
}

function heading(level: number, text: string): string {
  return `${"#".repeat(Math.min(level, 6))} ${prose(text)}`
}

function paragraph(text: string): string {
  return prose(text)
}

function bulletList(items: readonly string[]): string {
  return items.map((item) => `- ${collapse(item)}`).join("\n")
}

function orderedList(items: readonly string[]): string {
  return items.map((item, index) => `${index + 1}. ${collapse(item)}`).join("\n")
}

function codeBlock(value: string, language = ""): string {
  const fence = value.includes("```") ? "````" : "```"
  return [`${fence}${language}`, value, fence].join("\n")
}

function cell(value: unknown): string {
  if (typeof value !== "string") return ""
  return prose(value).replace(/\|/g, "\\|")
}

function table(
  columns: readonly string[],
  rows: readonly (readonly unknown[])[],
): string {
  const header = `| ${columns.map(cell).join(" | ")} |`
  const divider = `| ${columns.map(() => "---").join(" | ")} |`
  const body = rows.map(
    (row) =>
      `| ${columns.map((_, index) => cell(row[index])).join(" | ")} |`,
  )

  return [header, divider, ...body].join("\n")
}

/** `{ lead, label, href, trail }`: one contextual link rendered as a sentence. */
function isInlineLink(value: Record<string, unknown>): boolean {
  return (
    typeof value.lead === "string" &&
    typeof value.label === "string" &&
    typeof value.href === "string"
  )
}

function inlineLinkSentence(value: Record<string, unknown>): string {
  const lead = typeof value.lead === "string" ? value.lead : ""
  const label = typeof value.label === "string" ? value.label : ""
  const href = typeof value.href === "string" ? value.href : ""
  const trail = typeof value.trail === "string" ? value.trail : ""

  // `prose` trims, so a trail written as " covers ownership" would weld itself
  // to the closing bracket of the link. Keep the separator the author wrote.
  const trailText = prose(trail)
  const spacer = trailText && /^\s/.test(trail) ? " " : ""

  return collapse(`${prose(lead)} ${link(label, href)}${spacer}${trailText}`)
}

function linkLabelOf(item: Record<string, unknown>): string | undefined {
  for (const key of ["label", "linkLabel", "name", "title"]) {
    const value = item[key]
    if (typeof value === "string") return value
  }
  return undefined
}

function remainingStrings(
  item: Record<string, unknown>,
  used: readonly string[],
): { key: string; value: string }[] {
  return Object.entries(item)
    .filter(
      ([key, value]) =>
        typeof value === "string" &&
        !used.includes(key) &&
        !isSkippedKey(key),
    )
    .map(([key, value]) => ({ key, value: value as string }))
}

function describedLine(entry: { key: string; value: string }): string {
  if (unlabeledKeys.has(entry.key) || entry.key === "answer" || entry.key === "description") {
    return paragraph(entry.value)
  }
  return `**${humanize(entry.key)}:** ${prose(entry.value)}`
}

function renderRecordArray(
  items: readonly Record<string, unknown>[],
  level: number,
): string[] {
  // Link collections (sources, related reading, ecosystem entries).
  if (items.every((item) => typeof item.href === "string" && linkLabelOf(item))) {
    return [
      bulletList(
        items.map((item) => {
          const label = linkLabelOf(item) ?? ""
          const href = item.href as string
          const note = remainingStrings(item, ["label", "linkLabel", "name", "title", "href"])
          const suffix = note.length > 0 ? `: ${prose(note[0].value)}` : ""
          return `${link(label, href)}${suffix}`
        }),
      ),
    ]
  }

  // Question and answer pairs stay as headings so they extract cleanly.
  if (items.every((item) => typeof item.question === "string")) {
    return items.flatMap((item) => [
      heading(level, item.question as string),
      ...remainingStrings(item, ["question"]).map((entry) =>
        paragraph(entry.value),
      ),
    ])
  }

  if (items.every((item) => typeof item.title === "string")) {
    return items.flatMap((item) => [
      heading(level, item.title as string),
      ...renderRecordFields(item, ["title"], level + 1),
    ])
  }

  const labelKey = items.every((item) => typeof item.label === "string")
    ? "label"
    : items.every((item) => typeof item.name === "string")
      ? "name"
      : undefined

  if (labelKey) {
    const compact = items.every(
      (item) => remainingStrings(item, [labelKey]).length === 1,
    )

    if (compact) {
      return [
        bulletList(
          items.map((item) => {
            const rest = remainingStrings(item, [labelKey])
            return `**${prose(item[labelKey] as string)}:** ${prose(rest[0].value)}`
          }),
        ),
      ]
    }

    return items.flatMap((item) => [
      heading(level, item[labelKey] as string),
      ...renderRecordFields(item, [labelKey], level + 1),
    ])
  }

  // Flat string records become a table keyed on their own field names.
  const columnKeys = Object.entries(items[0])
    .filter(([key, value]) => typeof value === "string" && !isSkippedKey(key))
    .map(([key]) => key)

  if (
    columnKeys.length > 1 &&
    items.every((item) =>
      columnKeys.every((key) => typeof item[key] === "string"),
    )
  ) {
    return [
      table(
        columnKeys.map(humanize),
        items.map((item) => columnKeys.map((key) => item[key])),
      ),
    ]
  }

  return items.flatMap((item) => renderRecordFields(item, [], level))
}

/** `level` is the heading level used by the immediate children of `record`. */
function renderRecordFields(
  record: Record<string, unknown>,
  used: readonly string[],
  level: number,
): string[] {
  const blocks: string[] = []
  const columns = Array.isArray(record.columns) && isStringArray(record.columns)
    ? record.columns
    : undefined

  // A section that carries its own link renders it as one, rather than as a
  // bare path beside a label.
  const consumed = [...used]
  const href = typeof record.href === "string" ? record.href : undefined
  const hrefLabelKey = href
    ? ["linkLabel", "label", "name", "title"].find(
        (key) => typeof record[key] === "string" && !consumed.includes(key),
      )
    : undefined
  if (href) {
    consumed.push("href")
    if (hrefLabelKey) consumed.push(hrefLabelKey)
  }

  for (const [key, value] of Object.entries(record)) {
    if (consumed.includes(key) || isSkippedKey(key)) continue
    if (value === undefined || value === null) continue
    if (key === "columns" && columns) continue

    if (key === "rows" && Array.isArray(value) && isRecordArray(value)) {
      blocks.push(renderRows(value, columns))
      continue
    }

    if (typeof value === "string" && !codeKeys.has(key)) {
      if (value.trim()) blocks.push(describedLine({ key, value }))
      continue
    }

    const labelled =
      !unlabeledKeys.has(key) &&
      (Array.isArray(value) || isRecord(value)) &&
      !(isRecord(value) && isInlineLink(value))

    if (labelled) blocks.push(heading(level, humanize(key)))
    blocks.push(
      ...renderValue(
        key,
        value,
        labelled ? level + 1 : level,
        codeLanguageFor(key, record),
      ),
    )
  }

  if (href) {
    const label = hrefLabelKey ? (record[hrefLabelKey] as string) : href
    blocks.push(link(label, href))
  }

  return blocks
}

function renderRows(
  rows: readonly Record<string, unknown>[],
  columns: readonly string[] | undefined,
): string {
  if (columns) {
    return table(
      columns,
      rows.map((row) => [
        // A row that names where it lives is a link rather than a path in
        // monospace. The documents an agent fetches are found by following a
        // link far more often than by guessing the path, so a table of
        // documents that renders them as text is a table it cannot use.
        typeof row.href === "string" && typeof row.label === "string"
          ? link(row.label, row.href)
          : row.label,
        ...(Array.isArray(row.cells) ? row.cells : []),
      ]),
    )
  }

  const columnKeys = Object.entries(rows[0] ?? {})
    .filter(([key, value]) => typeof value === "string" && !isSkippedKey(key))
    .map(([key]) => key)

  return table(
    columnKeys.map(humanize),
    rows.map((row) => columnKeys.map((key) => row[key])),
  )
}

function renderValue(
  key: string,
  value: unknown,
  level: number,
  language?: string,
): string[] {
  if (typeof value === "string") {
    if (!value.trim()) return []
    return codeKeys.has(key) ? [codeBlock(value, language)] : [paragraph(value)]
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return []
    if (isStringArray(value)) {
      if (proseArrayKeys.has(key)) return value.map(paragraph)
      const items = value.map(prose)
      return [key === "steps" ? orderedList(items) : bulletList(items)]
    }
    if (isRecordArray(value)) return renderRecordArray(value, level)
    return []
  }

  if (isRecord(value)) {
    if (isInlineLink(value)) return [inlineLinkSentence(value)]

    const blocks: string[] = []
    const used: string[] = []

    if (typeof value.title === "string") {
      blocks.push(heading(level, value.title))
      used.push("title")
    }

    blocks.push(...renderRecordFields(value, used, level + 1))
    return blocks
  }

  return []
}

/**
 * Walks a content definition in declaration order and turns it into sections.
 * Shape driven rather than page driven: `<name>Title` fields become headings,
 * a `<name>Columns` array pairs with the matching `<name>Rows`, and nested
 * sections use their own `title`.
 */
function renderBody(entry: Record<string, unknown>): string[] {
  const titlesByBase = new Map<string, string>()
  const columnsByBase = new Map<string, readonly string[]>()

  for (const [key, value] of Object.entries(entry)) {
    if (key.endsWith("Title") && typeof value === "string") {
      titlesByBase.set(key.slice(0, -"Title".length), value)
    }
    if (key.endsWith("Columns") && Array.isArray(value) && isStringArray(value)) {
      columnsByBase.set(key.slice(0, -"Columns".length), value)
    }
  }

  const bases = [...titlesByBase.keys(), ...columnsByBase.keys()]
  const blocks: string[] = []
  let lastBase: string | undefined

  for (const [key, value] of Object.entries(entry)) {
    if (isSkippedKey(key)) continue
    if (value === undefined || value === null) continue
    if (key.endsWith("Title") && titlesByBase.has(key.slice(0, -"Title".length))) {
      continue
    }
    if (
      key.endsWith("Columns") &&
      columnsByBase.has(key.slice(0, -"Columns".length))
    ) {
      continue
    }

    const base = baseKeyFor(key, bases)
    if (!bases.includes(base)) bases.push(base)

    if (base !== lastBase && !leadKeys.has(base)) {
      const sectionTitle =
        titlesByBase.get(base) ??
        (isRecord(value) && typeof value.title === "string"
          ? value.title
          : undefined) ??
        headingOverrides[base] ??
        humanize(base)
      blocks.push(heading(2, sectionTitle))
    }
    lastBase = base

    const columns = key.endsWith("Rows")
      ? columnsByBase.get(key.slice(0, -"Rows".length))
      : undefined

    if (columns && Array.isArray(value) && isRecordArray(value)) {
      blocks.push(renderRows(value, columns))
      continue
    }

    if (isRecord(value) && typeof value.title === "string") {
      blocks.push(...renderRecordFields(value, ["title"], 3))
      continue
    }

    blocks.push(...renderValue(key, value, 3, codeLanguageFor(key, entry)))
  }

  return blocks
}

/** `answerNotes` belongs to `answer`, `templateFields` belongs to `template`. */
function baseKeyFor(key: string, bases: readonly string[]): string {
  for (const base of bases) {
    if (key === base) return base
    if (
      key.length > base.length &&
      key.startsWith(base) &&
      key[base.length] === key[base.length].toUpperCase() &&
      key[base.length] !== key[base.length].toLowerCase()
    ) {
      return base
    }
  }
  return key
}

/** Where a page's twin is served, defaulting to the page path plus `.md`. */
export function markdownPathOf(entry: MarkdownContentEntry): string {
  return entry.markdownPath ?? `${entry.path}.md`
}

/** The full Markdown twin of a data driven page, header included. */
export function buildContentMarkdown(entry: MarkdownContentEntry): string {
  const record = entry as unknown as Record<string, unknown>
  const canonical = absoluteUrl(entry.path)
  const topics = Array.isArray(record.topics) && isStringArray(record.topics)
    ? record.topics
    : undefined
  // Comparison pages name what they are compared with, and the twin says so
  // in the header rather than opening with a one word section.
  const subject =
    typeof record.subject === "string"
      ? typeof record.subjectHref === "string"
        ? link(record.subject, record.subjectHref)
        : prose(record.subject)
      : undefined

  const header = [
    heading(1, entry.title),
    `> ${paragraph(entry.description)}`,
    bulletList([
      `Canonical URL: ${canonical}`,
      `Markdown URL: ${absoluteUrl(markdownPathOf(entry))}`,
      `Publisher: ${siteConfig.name} (${siteConfig.url})`,
      `Published: ${entry.publishedAt}`,
      `Last updated: ${entry.modifiedAt}`,
      ...(subject ? [`Compared with: ${subject}`] : []),
      ...(topics ? [`Topics: ${prose(topics.join(", "))}`] : []),
    ]),
  ]

  return `${[...header, ...renderBody(record)].join("\n\n")}\n`
}
