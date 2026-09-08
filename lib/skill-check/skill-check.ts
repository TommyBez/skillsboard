/**
 * The format check behind `/check`.
 *
 * One pure function reads a SKILL.md the way an agent's loader would and
 * reports where the file departs from the Agent Skills specification. It is
 * the same body of rules `/skill-creator` applies to a draft, reached from the
 * other side: the creator holds the fields and renders a file, the checker
 * holds a file and recovers the fields.
 *
 * Two deliberate limits on what this is. It reads format only, so it says
 * nothing about whether the instructions in the body are good, safe, or worth
 * running. And it separates errors, which are rules the specification states,
 * from warnings, which are conventions Anthropic's authoring guidance
 * recommends and the specification does not require.
 *
 * Pure, synchronous, and free of `server-only`: the rules run in a unit test
 * and could run in the browser unchanged.
 */

import { parseDocument } from "yaml"

import { sanitizeAgentSkillText } from "@/lib/agent-skill-text"
import {
  SKILL_FILE_NAME,
  validateSkillDraft,
  type SkillDraft,
  type SkillFieldName,
  type SkillIssue,
} from "@/lib/skill-creator/skill-md"

/** The per-file ceiling the repository reader already enforces. */
export const SKILL_CHECK_MAX_FILE_BYTES = 256 * 1024

/** The six frontmatter keys the specification defines, and nothing else. */
export const SKILL_FRONTMATTER_KEYS = [
  "name",
  "description",
  "license",
  "compatibility",
  "allowed-tools",
  "metadata",
] as const

export interface SkillCheckIssue {
  /** Stable identifier, safe to branch on. Snake case, never localized. */
  code: string
  message: string
  /** The frontmatter key or document part the issue is about. */
  field?: string
  /** One-based line in the file, when the issue can be placed on one. */
  line?: number
}

export interface SkillCheckResult {
  /** Repository-relative path of the file that was read. */
  path: string
  /** The `name` field, sanitized, when the file has a usable one. */
  name: string | null
  /** The fields recovered from the frontmatter, when they could be recovered. */
  draft: SkillDraft | null
  errors: SkillCheckIssue[]
  warnings: SkillCheckIssue[]
}

export interface SkillCheckContext {
  /** Repository-relative path, for example `skills/release-notes/SKILL.md`. */
  path: string
  /** The directory the file sits in, which the specification ties to `name`. */
  folderName?: string
  /** Size on disk when the reader knows it, otherwise measured from the text. */
  sizeBytes?: number
}

interface Collector {
  errors: SkillCheckIssue[]
  warnings: SkillCheckIssue[]
}

function fail(collector: Collector, issue: SkillCheckIssue) {
  collector.errors.push(issue)
}

function warn(collector: Collector, issue: SkillCheckIssue) {
  collector.warnings.push(issue)
}

/** A value quoted back into a message, stripped of anything a terminal reads. */
function quoted(value: unknown) {
  const text = typeof value === "string" ? value : String(value)
  const safe = sanitizeAgentSkillText(text)
  return safe.length > 80 ? `${safe.slice(0, 77)}...` : safe
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length
}

/**
 * The one-based line a frontmatter key sits on, so a report can point at it.
 * The frontmatter opens on line 1, so its first key is line 2.
 */
function keyLine(frontmatterLines: string[], key: string) {
  // The key comes out of somebody else's frontmatter, so it can hold regular
  // expression syntax. It is matched literally, never compiled as a pattern.
  const literal = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const pattern = new RegExp(`^\\s*(?:"${literal}"|'${literal}'|${literal})\\s*:`)
  const index = frontmatterLines.findIndex((line) => pattern.test(line))
  return index < 0 ? undefined : index + 2
}

function describeYamlError(message: string) {
  return sanitizeAgentSkillText(message).replace(/\s+/g, " ")
}

/**
 * The `SkillIssue` list from the creator, mapped onto this report's shape.
 *
 * The creator's issues carry a field and a level rather than a code, so the
 * code is derived from both: `name_invalid` for a rule the specification
 * states, `name_convention` for guidance it does not. Fields already reported
 * with a more specific code are dropped so the same problem is not stated
 * twice.
 */
function fromDraftIssue(
  issue: SkillIssue,
  frontmatterLines: string[],
): SkillCheckIssue {
  const field = issue.field.replace(/-/g, "_")
  return {
    code: `${field}_${issue.level === "error" ? "invalid" : "convention"}`,
    // The shared rules interpolate values read out of the file into their
    // messages, so every message crosses the sanitizer before it is exposed.
    message: sanitizeAgentSkillText(issue.message),
    field: issue.field,
    ...(issue.field === "body" ? {} : { line: keyLine(frontmatterLines, issue.field) }),
  }
}

/**
 * The optional fields, read against their declared types.
 *
 * Only `undefined` means the key was left out. A key written with no value
 * after it parses to null, which is the field present and holding something
 * that is not a string, so it is reported like any other wrong type.
 */
function readOptionalString(
  value: unknown,
  key: "license" | "compatibility",
  collector: Collector,
  frontmatterLines: string[],
): string {
  if (value === undefined) return ""
  if (typeof value === "string") return value

  fail(collector, {
    code: `${key}_not_a_string`,
    field: key,
    line: keyLine(frontmatterLines, key),
    message: `The specification defines ${key} as a string. This file declares it as ${describeType(value)}.`,
  })
  return ""
}

function describeType(value: unknown) {
  if (Array.isArray(value)) return "a list"
  if (value === null) return "empty"
  if (typeof value === "object") return "a map"
  return `a ${typeof value}`
}

function readAllowedTools(
  value: unknown,
  collector: Collector,
  frontmatterLines: string[],
): string {
  if (value === undefined) return ""
  if (typeof value === "string") return value

  const line = keyLine(frontmatterLines, "allowed-tools")

  // A list of tool names is what several published skills write, and Claude
  // Code reads it. The specification defines the field as a space-separated
  // string, so this is a portability warning rather than a rule that was
  // broken: an agent that follows the specification may not read the list.
  if (Array.isArray(value) && value.every((entry) => typeof entry === "string")) {
    warn(collector, {
      code: "allowed_tools_not_a_string",
      field: "allowed-tools",
      line,
      message:
        "The specification defines allowed-tools as one space-separated string. This file declares a list, which Claude Code reads and an agent that follows the specification may not.",
    })
    return (value as string[]).join(" ")
  }

  fail(collector, {
    code: "allowed_tools_not_a_string",
    field: "allowed-tools",
    line,
    message: `The specification defines allowed-tools as one space-separated string. This file declares it as ${describeType(value)}.`,
  })
  return ""
}

function readMetadata(
  value: unknown,
  collector: Collector,
  frontmatterLines: string[],
): SkillDraft["metadata"] {
  if (value === undefined) return []
  const line = keyLine(frontmatterLines, "metadata")

  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(collector, {
      code: "metadata_not_a_map",
      field: "metadata",
      line,
      message: `The specification defines metadata as a map of string keys to string values. This file declares it as ${describeType(value)}.`,
    })
    return []
  }

  const entries: { key: string; value: string }[] = []
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry !== "string") {
      fail(collector, {
        code: "metadata_value_not_a_string",
        field: "metadata",
        line,
        message: `The metadata key ${quoted(key)} holds ${describeType(entry)}. Every metadata value has to be a string.`,
      })
      continue
    }
    entries.push({ key, value: entry })
  }
  return entries
}

function emptyResult(
  context: SkillCheckContext,
  collector: Collector,
): SkillCheckResult {
  return {
    path: context.path,
    name: null,
    draft: null,
    errors: collector.errors,
    warnings: collector.warnings,
  }
}

/**
 * Reads one SKILL.md and reports every departure from the specification.
 *
 * The order matters: a file that does not open with frontmatter, or whose
 * frontmatter does not parse, is reported and nothing else is claimed about
 * it. An agent loading that file gets empty metadata, so every later rule
 * would be a guess about a document the loader never saw.
 */
export function checkSkillMarkdown(
  raw: string,
  context: SkillCheckContext,
): SkillCheckResult {
  const collector: Collector = { errors: [], warnings: [] }
  const source = raw.replace(/\r\n?/g, "\n")
  const sizeBytes = context.sizeBytes ?? byteLength(raw)

  if (sizeBytes > SKILL_CHECK_MAX_FILE_BYTES) {
    fail(collector, {
      code: "file_too_large",
      message: `The file is ${Math.round(sizeBytes / 1024)} KB. ${SKILL_FILE_NAME} is read into the agent's context in full once the skill fires, and this checker reads at most ${SKILL_CHECK_MAX_FILE_BYTES / 1024} KB of it.`,
    })
    return emptyResult(context, collector)
  }

  if (source.trim().length === 0) {
    fail(collector, {
      code: "empty_file",
      message: "The file is empty. A skill needs YAML frontmatter with a name and a description.",
    })
    return emptyResult(context, collector)
  }

  const lines = source.split("\n")
  if (lines[0]?.trim() !== "---") {
    fail(collector, {
      code: "missing_frontmatter",
      line: 1,
      message:
        "The file does not open with a --- frontmatter marker on its first line. An agent loads the skill with empty metadata, so it never triggers on its own.",
    })
    return emptyResult(context, collector)
  }

  const closingIndex = lines.findIndex(
    (line, index) => index > 0 && (line.trim() === "---" || line.trim() === "..."),
  )
  if (closingIndex < 0) {
    fail(collector, {
      code: "unterminated_frontmatter",
      line: 1,
      message:
        "The frontmatter opens with --- and is never closed. Add a --- line after the last field, before the instructions.",
    })
    return emptyResult(context, collector)
  }

  const frontmatterLines = lines.slice(1, closingIndex)
  const body = lines.slice(closingIndex + 1).join("\n")

  const document = parseDocument(frontmatterLines.join("\n"), {
    strict: true,
    uniqueKeys: true,
  })

  if (document.errors.length > 0) {
    const first = document.errors[0]
    const duplicate = /unique/i.test(first.message)
    fail(collector, {
      code: duplicate ? "duplicate_frontmatter_key" : "invalid_yaml",
      line: first.linePos ? first.linePos[0].line + 1 : undefined,
      message: duplicate
        ? `The frontmatter declares the same key twice. A YAML map keeps the last one and drops the rest. The parser reported: ${describeYamlError(first.message)}`
        : `The frontmatter is not valid YAML, so an agent loads the skill with empty metadata. The parser reported: ${describeYamlError(first.message)}`,
    })
    return emptyResult(context, collector)
  }

  let metadata: unknown
  try {
    metadata = document.toJS({ maxAliasCount: 20 })
  } catch (error) {
    fail(collector, {
      code: "invalid_yaml",
      line: 1,
      message: `The frontmatter could not be resolved into a map. The parser reported: ${describeYamlError(error instanceof Error ? error.message : String(error))}`,
    })
    return emptyResult(context, collector)
  }

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    fail(collector, {
      code: "frontmatter_not_a_map",
      line: 1,
      message: `The frontmatter has to be a map of fields. This file's frontmatter is ${describeType(metadata)}.`,
    })
    return emptyResult(context, collector)
  }

  const fields = metadata as Record<string, unknown>

  for (const key of Object.keys(fields)) {
    if ((SKILL_FRONTMATTER_KEYS as readonly string[]).includes(key)) continue
    warn(collector, {
      code: "unknown_frontmatter_key",
      field: key,
      line: keyLine(frontmatterLines, key),
      message: `${quoted(key)} is not one of the six fields the specification defines. Claude Code ignores an unknown key, and a claude.ai upload or a packaging script rejects the folder with an unexpected-key error.`,
    })
  }

  /** Fields reported here are excluded from the shared draft rules below. */
  const reported = new Set<SkillFieldName>()

  const rawName = fields.name
  /** The value as written, which is what the specification's rules apply to. */
  let nameAsWritten = ""
  /** The same value with anything a terminal reads stripped, for the report. */
  let name = ""
  if (rawName === undefined || rawName === null) {
    reported.add("name")
    fail(collector, {
      code: "name_missing",
      field: "name",
      message:
        "The frontmatter declares no name. It is one of the two fields the specification marks required, and it has to match the directory the skill sits in.",
    })
  } else if (typeof rawName !== "string") {
    reported.add("name")
    fail(collector, {
      code: "name_not_a_string",
      field: "name",
      line: keyLine(frontmatterLines, "name"),
      message: `The specification defines name as a string. This file declares it as ${describeType(rawName)}, which is what an unquoted value such as true or 1.0 parses to.`,
    })
  } else {
    // The rules below read the value the file declares, not a cleaned copy of
    // it: a control character inside the name breaks the name rule, and
    // sanitizing first would hide it. Only what the report shows is sanitized.
    nameAsWritten = rawName
    name = sanitizeAgentSkillText(rawName)
  }

  const rawDescription = fields.description
  let description = ""
  if (rawDescription === undefined || rawDescription === null) {
    reported.add("description")
    fail(collector, {
      code: "description_missing",
      field: "description",
      message:
        "The frontmatter declares no description. It is required, and it is the only text an agent reads before it decides whether to load the skill at all.",
    })
  } else if (typeof rawDescription !== "string") {
    reported.add("description")
    fail(collector, {
      code: "description_not_a_string",
      field: "description",
      line: keyLine(frontmatterLines, "description"),
      message: `The specification defines description as a string. This file declares it as ${describeType(rawDescription)}.`,
    })
  } else {
    description = sanitizeAgentSkillText(rawDescription)
  }

  const draft: SkillDraft = {
    name: nameAsWritten,
    description,
    license: readOptionalString(fields.license, "license", collector, frontmatterLines),
    compatibility: readOptionalString(
      fields.compatibility,
      "compatibility",
      collector,
      frontmatterLines,
    ),
    allowedTools: readAllowedTools(fields["allowed-tools"], collector, frontmatterLines),
    metadata: readMetadata(fields.metadata, collector, frontmatterLines),
    body,
  }

  for (const issue of validateSkillDraft(draft)) {
    if (reported.has(issue.field)) continue
    const mapped = fromDraftIssue(issue, frontmatterLines)
    if (issue.level === "error") fail(collector, mapped)
    else warn(collector, mapped)
  }

  /**
   * The specification requires the name and the parent directory to carry the
   * same string, so a mismatch is an error rather than a convention: it passes
   * where Claude Code reads the folder from disk and fails the first time the
   * same folder is uploaded or packaged. A file at the repository root has no
   * skill directory to compare against, so the rule does not apply to it.
   */
  const folderName = context.folderName?.trim()
  if (folderName && name && nameAsWritten.trim() !== folderName) {
    fail(collector, {
      code: "name_directory_mismatch",
      field: "name",
      line: keyLine(frontmatterLines, "name"),
      message: `The name is ${quoted(name)} and the directory is ${quoted(folderName)}. The specification requires the two to match.`,
    })
  }

  return {
    path: context.path,
    name: name || null,
    // The rules ran against the name as written; what leaves this function
    // carries the sanitized copy.
    draft: { ...draft, name },
    errors: collector.errors,
    warnings: collector.warnings,
  }
}

/** A file that broke no rule the specification states. */
export function passesFormatCheck(result: SkillCheckResult) {
  return result.errors.length === 0
}
