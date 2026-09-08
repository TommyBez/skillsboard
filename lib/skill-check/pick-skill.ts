/**
 * Which checked skill a GitHub URL was pointing at.
 *
 * `/check` reads every SKILL.md a repository offers, and `/skill-creator?from=`
 * runs the same check to load one of them into the form. When the URL named a
 * file or a folder, the reader means that skill and not the first one the
 * repository happens to list, so the choice is made here rather than guessed
 * inside a component.
 *
 * Pure and free of any Next or Node import: it runs in the browser, and it
 * runs in a unit test unchanged.
 */

/** The part of a report entry this choice needs, and nothing else. */
export interface PickableSkill {
  /** Repository-relative folder holding SKILL.md. The repository root is "". */
  path: string
  filePath: string
  /** Permalink to the exact file that was read, pinned to the commit. */
  sourceUrl: string
}

function normalizePath(value: string) {
  return value.replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase()
}

function normalizeUrl(value: string) {
  return value.trim().split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase()
}

/**
 * Every repository-relative path the URL could be naming.
 *
 * A branch name may hold slashes, so the number of segments the ref takes is
 * not knowable from the URL alone. Rather than guess one, this returns the
 * candidates from the longest to the shortest and lets the caller take the
 * first that matches something the report actually read.
 */
function candidateSubpaths(url: string): string[] {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return []
  }
  if (parsed.hostname.toLowerCase() !== "github.com") return []

  const segments = parsed.pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment)
      } catch {
        return segment
      }
    })

  // owner, repo, then blob, tree or raw, then the ref, then the path.
  const rest = segments.slice(2)
  if (rest.length === 0) return []
  const afterKind = ["blob", "tree", "raw", "blame"].includes(rest[0].toLowerCase())
    ? rest.slice(1)
    : rest

  const candidates: string[] = []
  for (let start = 1; start < afterKind.length; start += 1) {
    candidates.push(afterKind.slice(start).join("/"))
  }
  return candidates.map(normalizePath).filter(Boolean)
}

/** True when `folder` is the skill file itself or a directory above it. */
function isUnder(folder: string, filePath: string) {
  return filePath === folder || filePath.startsWith(`${folder}/`)
}

/**
 * The skill a URL was pointing at, or the first one when it was pointing at
 * the repository. Returns null only for an empty list.
 */
export function pickSkillForUrl<Skill extends PickableSkill>(
  url: string,
  skills: readonly Skill[],
): Skill | null {
  if (skills.length === 0) return null
  const first = skills[0]

  const wanted = normalizeUrl(url)
  const byPermalink = skills.find((skill) => normalizeUrl(skill.sourceUrl) === wanted)
  if (byPermalink) return byPermalink

  for (const subpath of candidateSubpaths(url)) {
    const byFile = skills.find((skill) => normalizePath(skill.filePath) === subpath)
    if (byFile) return byFile

    const byFolder = skills.find((skill) => normalizePath(skill.path) === subpath)
    if (byFolder) return byFolder

    const underFolder = skills.find((skill) =>
      isUnder(subpath, normalizePath(skill.filePath)),
    )
    if (underFolder) return underFolder
  }

  return first
}
