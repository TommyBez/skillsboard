/**
 * The SKILL.md generator behind `/skill-creator`.
 *
 * Everything here is pure and synchronous so the tool can run entirely in the
 * browser: no request leaves the page, and the same functions are what the
 * unit tests assert against.
 *
 * The generator emits only the six frontmatter fields the Agent Skills
 * specification defines. That is a deliberate limit rather than a missing
 * feature: claude.ai uploads, the Skills API, and packaging with
 * `package_skill.py` reject any other key with an unexpected-key error, so a
 * file built here is accepted on every documented distribution path.
 */

/** Specification limits, each read from the frontmatter table on agentskills.io. */
export const SKILL_NAME_MAX_LENGTH = 64
export const SKILL_DESCRIPTION_MAX_LENGTH = 1024
export const SKILL_COMPATIBILITY_MAX_LENGTH = 500

/** Guidance rather than a limit: the specification recommends staying under it. */
export const SKILL_BODY_LINE_BUDGET = 500

/** The file name the specification requires inside the skill directory. */
export const SKILL_FILE_NAME = "SKILL.md"

export type SkillFieldName =
  | "name"
  | "description"
  | "license"
  | "compatibility"
  | "allowed-tools"
  | "metadata"
  | "body"

export interface SkillMetadataEntry {
  key: string
  value: string
}

export interface SkillDraft {
  name: string
  description: string
  license: string
  compatibility: string
  allowedTools: string
  metadata: readonly SkillMetadataEntry[]
  body: string
}

export const emptySkillDraft: SkillDraft = {
  name: "",
  description: "",
  license: "",
  compatibility: "",
  allowedTools: "",
  metadata: [],
  body: "",
}

export type SkillIssueLevel = "error" | "warning"

export interface SkillIssue {
  field: SkillFieldName
  level: SkillIssueLevel
  message: string
}

/* -------------------------------------------------------------------------- */
/* YAML                                                                        */
/* -------------------------------------------------------------------------- */

/** Indicators that change how a scalar parses when they open it. */
const YAML_UNSAFE_FIRST_CHARACTER = /^[-?:,[\]{}#&*!|>'"%@`]/

/**
 * Words a YAML parser reads as a boolean, as null, or as a special float
 * rather than as text. `.inf` and `.nan` carry no digits, so the number
 * pattern below never sees them.
 */
const YAML_RESERVED_WORD =
  /^(?:y|n|yes|no|true|false|on|off|null|~|[-+]?\.inf|\.nan)$/i

/** Anything a parser would hand back as a number instead of a string. */
const YAML_NUMBER_LIKE =
  /^[-+]?(?:0x[\da-f]+|0o[0-7]+|\d[\d_]*(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i

/**
 * A control character cannot appear in a plain scalar. Tested by code point
 * rather than by a character class, so the rule stays readable in a file that
 * is itself plain text.
 */
function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0
    if (code < 32 || code === 127) return true
  }
  return false
}

/**
 * Whether a value survives being written without quotes.
 *
 * Conservative on purpose. A false negative costs a pair of quotes; a false
 * positive ships frontmatter that parses into the wrong type, or does not
 * parse at all, and a skill whose frontmatter fails to parse loads with empty
 * metadata and never triggers on its own.
 */
export function isPlainYamlScalar(value: string): boolean {
  if (value.length === 0) return false
  if (value !== value.trim()) return false
  if (hasControlCharacter(value)) return false
  if (YAML_UNSAFE_FIRST_CHARACTER.test(value)) return false
  // `: ` opens a mapping and ` #` opens a comment, wherever they appear.
  if (value.includes(": ") || value.includes(" #")) return false
  if (value.endsWith(":")) return false
  if (YAML_RESERVED_WORD.test(value)) return false
  if (YAML_NUMBER_LIKE.test(value)) return false
  return true
}

/**
 * One YAML scalar, quoted only when it has to be.
 *
 * The quoted form is the JSON string form. Every escape JSON produces is also
 * a YAML double-quoted escape, so the two spellings agree and a value carrying
 * a quote, a newline, or a control character round-trips.
 */
export function formatYamlScalar(value: string): string {
  return isPlainYamlScalar(value) ? value : JSON.stringify(value)
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

const NAME_ALLOWED_CHARACTERS = /^[a-z0-9-]+$/
const METADATA_KEY = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/

/**
 * Words Anthropic's authoring guidance asks you to keep out of a skill name.
 * A warning rather than an error: the specification itself allows them.
 */
const RESERVED_NAME_WORDS = ["anthropic", "claude"] as const

/** A description with no timing in it gives an agent nothing to match against. */
const TRIGGER_CUE = /\b(?:when|whenever)\b/i

/**
 * Anthropic's authoring guidance states that neither the name nor the
 * description may contain XML tags. The Agent Skills specification does not
 * repeat the rule, so a match is reported as a warning.
 */
const XML_TAG = /<\/?[A-Za-z][^>]*>/

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n?/g, "\n")
}

/**
 * The body as it will be written: normalized newlines, no trailing blank run.
 *
 * Only the terminal run of blank lines goes. Trailing spaces inside the body
 * stay, because two of them at the end of a line are how Markdown spells a
 * hard line break, and stripping them would silently rewrite the text.
 */
export function normalizeSkillBody(body: string): string {
  const normalized = normalizeNewlines(body)
  if (/^[ \t]*(?:\n[ \t]*)*$/.test(normalized)) return ""
  return normalized.replace(/(?:\n[ \t]*)+$/, "")
}

export function countBodyLines(body: string): number {
  const normalized = normalizeSkillBody(body)
  return normalized.length === 0 ? 0 : normalized.split("\n").length
}

function validateName(name: string, issues: SkillIssue[]): void {
  const value = name.trim()

  if (value.length === 0) {
    issues.push({
      field: "name",
      level: "error",
      message:
        "A name is required. It is one of the two fields the specification marks required, and it has to match the directory the skill sits in.",
    })
    return
  }

  if (value.length > SKILL_NAME_MAX_LENGTH) {
    issues.push({
      field: "name",
      level: "error",
      message: `The name is ${value.length} characters. The specification caps it at ${SKILL_NAME_MAX_LENGTH}.`,
    })
  }

  if (!NAME_ALLOWED_CHARACTERS.test(value)) {
    const rejected = [
      ...new Set(value.split("").filter((character) => !/[a-z0-9-]/.test(character))),
    ]
    issues.push({
      field: "name",
      level: "error",
      message: `The name accepts lowercase letters, numbers, and hyphens only. Remove or replace: ${rejected
        .map((character) => (character === " " ? "space" : character))
        .join(" ")}`,
    })
  }

  if (value.startsWith("-") || value.endsWith("-")) {
    issues.push({
      field: "name",
      level: "error",
      message: "The name cannot start or end with a hyphen.",
    })
  }

  if (value.includes("--")) {
    issues.push({
      field: "name",
      level: "error",
      message: "The name cannot contain two hyphens in a row.",
    })
  }

  const reserved = RESERVED_NAME_WORDS.filter((word) => value.includes(word))
  if (reserved.length > 0) {
    issues.push({
      field: "name",
      level: "warning",
      message: `Anthropic's authoring guidance asks you to keep ${reserved.join(
        " and ",
      )} out of a skill name. The specification allows it, so this is a convention rather than a rule.`,
    })
  }
}

function validateDescription(description: string, issues: SkillIssue[]): void {
  const value = description.trim()

  if (value.length === 0) {
    issues.push({
      field: "description",
      level: "error",
      message:
        "A description is required. It is the only text an agent reads before it decides whether to load the skill at all.",
    })
    return
  }

  if (value.length > SKILL_DESCRIPTION_MAX_LENGTH) {
    issues.push({
      field: "description",
      level: "error",
      message: `The description is ${value.length} characters. The specification caps it at ${SKILL_DESCRIPTION_MAX_LENGTH}.`,
    })
  }

  if (XML_TAG.test(value)) {
    issues.push({
      field: "description",
      level: "warning",
      message:
        "Anthropic's authoring guidance states that a description cannot contain XML tags. The Agent Skills specification does not repeat the rule, so a file with one still validates against the specification.",
    })
  }

  if (!TRIGGER_CUE.test(value)) {
    issues.push({
      field: "description",
      level: "warning",
      message:
        "The description says what the skill does but not when to use it. The specification asks for both, and the published examples add the timing as a sentence that starts with Use when.",
    })
  }
}

function validateCompatibility(compatibility: string, issues: SkillIssue[]): void {
  const value = compatibility.trim()
  if (value.length === 0) return

  if (value.length > SKILL_COMPATIBILITY_MAX_LENGTH) {
    issues.push({
      field: "compatibility",
      level: "error",
      message: `Compatibility is ${value.length} characters. The specification caps it at ${SKILL_COMPATIBILITY_MAX_LENGTH}.`,
    })
  }
}

function validateAllowedTools(allowedTools: string, issues: SkillIssue[]): void {
  const value = allowedTools.trim()
  if (value.length === 0) return

  issues.push({
    field: "allowed-tools",
    level: "warning",
    message:
      "allowed-tools is the one field the specification marks experimental, so support varies between agents. Claude Code turns it into a permission grant that lasts for the turn that invoked the skill.",
  })

  if (value.includes(",")) {
    issues.push({
      field: "allowed-tools",
      level: "warning",
      message:
        "The specification defines allowed-tools as a space-separated string. Claude Code also reads a comma-separated one, but an agent that follows the specification may not.",
    })
  }
}

function validateMetadata(
  metadata: readonly SkillMetadataEntry[],
  issues: SkillIssue[],
): void {
  const seen = new Set<string>()

  for (const entry of metadata) {
    const key = entry.key.trim()
    const value = entry.value.trim()

    if (key.length === 0 && value.length === 0) continue

    if (key.length === 0) {
      issues.push({
        field: "metadata",
        level: "error",
        message: "A metadata value needs a key beside it.",
      })
      continue
    }

    if (!METADATA_KEY.test(key)) {
      issues.push({
        field: "metadata",
        level: "error",
        message: `The metadata key ${key} is not a plain key. Use letters, numbers, dots, hyphens, and underscores, starting with a letter or a number.`,
      })
      continue
    }

    if (seen.has(key)) {
      issues.push({
        field: "metadata",
        level: "error",
        message: `The metadata key ${key} appears twice. A YAML map keeps the last one and drops the rest.`,
      })
      continue
    }

    seen.add(key)

    if (value.length === 0) {
      issues.push({
        field: "metadata",
        level: "warning",
        message: `The metadata key ${key} has no value, so it is left out of the file.`,
      })
    }
  }
}

function validateBody(body: string, issues: SkillIssue[]): void {
  const normalized = normalizeSkillBody(body)

  if (normalized.length === 0) {
    issues.push({
      field: "body",
      level: "warning",
      message:
        "The body is empty. The file is still valid and the skill will still load, but there is nothing in it for the agent to follow once it does.",
    })
    return
  }

  const lines = countBodyLines(normalized)
  if (lines > SKILL_BODY_LINE_BUDGET) {
    issues.push({
      field: "body",
      level: "warning",
      message: `The body is ${lines} lines. The specification recommends staying under ${SKILL_BODY_LINE_BUDGET} and moving the rest into files beside SKILL.md that the agent opens only when the task reaches them.`,
    })
  }
}

/** Every problem in a draft, in the order the form renders the fields. */
export function validateSkillDraft(draft: SkillDraft): readonly SkillIssue[] {
  const issues: SkillIssue[] = []

  validateName(draft.name, issues)
  validateDescription(draft.description, issues)
  validateCompatibility(draft.compatibility, issues)
  validateAllowedTools(draft.allowedTools, issues)
  validateMetadata(draft.metadata, issues)
  validateBody(draft.body, issues)

  return issues
}

/** A draft with no errors produces a file every documented path accepts. */
export function hasBlockingIssue(issues: readonly SkillIssue[]): boolean {
  return issues.some((issue) => issue.level === "error")
}

/* -------------------------------------------------------------------------- */
/* Rendering                                                                   */
/* -------------------------------------------------------------------------- */

/** The directory a valid skill needs, derived from the name so the two agree. */
export function skillDirectoryName(draft: SkillDraft): string {
  return draft.name.trim()
}

/** `release-notes/SKILL.md`, the path the downloaded folder writes. */
export function skillArchivePath(draft: SkillDraft): string {
  const directory = skillDirectoryName(draft)
  return directory.length > 0 ? `${directory}/${SKILL_FILE_NAME}` : SKILL_FILE_NAME
}

/** The two-line tree the page shows beside the download controls. */
export function skillDirectoryTree(draft: SkillDraft): string {
  const directory = skillDirectoryName(draft) || "skill-name"
  return `${directory}/\n  ${SKILL_FILE_NAME}`
}

function frontmatterLines(draft: SkillDraft): string[] {
  const lines: string[] = []
  const name = draft.name.trim()
  const description = normalizeNewlines(draft.description).replace(/\s+/g, " ").trim()
  const license = draft.license.trim()
  const compatibility = normalizeNewlines(draft.compatibility)
    .replace(/\s+/g, " ")
    .trim()
  const allowedTools = draft.allowedTools.trim().replace(/\s+/g, " ")

  if (name.length > 0) lines.push(`name: ${formatYamlScalar(name)}`)
  if (description.length > 0) {
    lines.push(`description: ${formatYamlScalar(description)}`)
  }
  if (license.length > 0) lines.push(`license: ${formatYamlScalar(license)}`)
  if (compatibility.length > 0) {
    lines.push(`compatibility: ${formatYamlScalar(compatibility)}`)
  }
  if (allowedTools.length > 0) {
    lines.push(`allowed-tools: ${formatYamlScalar(allowedTools)}`)
  }

  const metadata = draft.metadata
    .map((entry) => ({ key: entry.key.trim(), value: entry.value.trim() }))
    .filter((entry) => entry.key.length > 0 && entry.value.length > 0)

  if (metadata.length > 0) {
    // The key runs through the same formatter as the value. A key such as
    // `1.0`, `true`, or `null` is a legal metadata key here, but written raw
    // it parses back as a number, a boolean, or null instead of the string
    // that was typed, and `1.0` would collapse onto `1`.
    const seen = new Set<string>()
    const rendered: string[] = []
    for (const entry of metadata) {
      if (seen.has(entry.key)) continue
      seen.add(entry.key)
      rendered.push(
        `  ${formatYamlScalar(entry.key)}: ${formatYamlScalar(entry.value)}`,
      )
    }
    lines.push("metadata:", ...rendered)
  }

  return lines
}

/**
 * The file itself: YAML frontmatter between two `---` markers, then the body.
 *
 * A draft with errors still renders, because a half-written file in the
 * preview is more useful than an empty pane. The copy and download controls
 * are what the errors gate.
 */
export function buildSkillMd(draft: SkillDraft): string {
  const frontmatter = frontmatterLines(draft)
  const body = normalizeSkillBody(draft.body)
  const document = ["---", ...frontmatter, "---"]

  if (body.length > 0) document.push("", body)

  return `${document.join("\n")}\n`
}
