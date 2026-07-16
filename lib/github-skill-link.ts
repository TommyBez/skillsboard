export type ParsedGitHubSkillLink =
  | { kind: "not_direct" }
  | { kind: "content"; action: "blob" | "tree"; refAndPath: string[] }
  | { kind: "invalid" }

export type GitHubSkillLinkResolution =
  | { kind: "skill"; path: string; ref: string }
  | { kind: "unsupported_ref" }
  | { kind: "invalid_skill_path" }

interface RefCandidate {
  ref: string
  segments: string[]
}

function startsWithSegments(value: string[], prefix: string[]) {
  return prefix.length <= value.length
    && prefix.every((segment, index) => value[index] === segment)
}

function refCandidates(refs: string[]) {
  const candidates: RefCandidate[] = []
  const seen = new Set<string>()

  for (const ref of refs) {
    const variants = [ref.split("/")]

    // Some URLs percent-encode a slash in the ref instead of representing it
    // as separate pathname segments.
    if (ref.includes("/")) variants.push([ref])

    for (const segments of variants) {
      const key = `${ref}\0${segments.join("\0")}`
      if (seen.has(key)) continue
      seen.add(key)
      candidates.push({ ref, segments })
    }
  }

  return candidates.sort((left, right) => (
    right.segments.length - left.segments.length
    || right.ref.length - left.ref.length
  ))
}

export function parseGitHubSkillLink(value: string): ParsedGitHubSkillLink {
  try {
    const url = new URL(value)
    if (url.hostname !== "github.com") return { kind: "not_direct" }

    const segments = url.pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment))
    const action = segments[2]
    if (action !== "blob" && action !== "tree") return { kind: "not_direct" }

    return {
      kind: "content",
      action,
      refAndPath: segments.slice(3),
    }
  } catch {
    return { kind: "invalid" }
  }
}

export function resolveGitHubSkillLink(
  link: Extract<ParsedGitHubSkillLink, { kind: "content" }>,
  refs: string[],
): GitHubSkillLinkResolution {
  const ref = refCandidates(refs).find((candidate) => (
    startsWithSegments(link.refAndPath, candidate.segments)
  ))
  if (!ref) return { kind: "unsupported_ref" }

  const pathSegments = link.refAndPath.slice(ref.segments.length)
  if (link.action === "blob") {
    if (pathSegments.at(-1) !== "SKILL.md") return { kind: "invalid_skill_path" }
    pathSegments.pop()
  }

  return {
    kind: "skill",
    path: pathSegments.join("/"),
    ref: ref.ref,
  }
}
