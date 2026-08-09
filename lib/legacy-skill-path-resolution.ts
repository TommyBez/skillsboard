export interface LegacySkillIdentity {
  id: string
  skillName: string
}

export interface LegacySkillCandidate {
  name: string
  path: string
}

export type LegacySkillPathResolution =
  | {
      ok: true
      resolved: Array<{
        canonicalName: string
        id: string
        skillPath: string
      }>
    }
  | {
      ok: false
      code: "ambiguous_candidates" | "no_candidates" | "path_collision"
      skillId: string
      skillName: string
    }

function canonicalSkillName(value: string) {
  return value.trim().toLowerCase()
}

/**
 * Recovers paths for skills saved before Skills Board persisted their exact
 * SKILL.md folder. The saved name is the only per-skill identity those rows
 * retained, so multi-skill repositories require one exact canonical match.
 */
export function resolveLegacySkillPaths(input: {
  candidates: LegacySkillCandidate[]
  claimedPaths?: string[]
  legacySkills: LegacySkillIdentity[]
}): LegacySkillPathResolution {
  const fallbackSkill = input.legacySkills[0]
  if (!fallbackSkill) return { ok: true, resolved: [] }

  const claimedPaths = new Set<string>()
  for (const path of input.claimedPaths ?? []) {
    if (claimedPaths.has(path)) {
      return {
        ok: false,
        code: "path_collision",
        skillId: fallbackSkill.id,
        skillName: fallbackSkill.skillName,
      }
    }
    claimedPaths.add(path)
  }

  const candidatePaths = new Set<string>()
  for (const candidate of input.candidates) {
    if (candidatePaths.has(candidate.path)) {
      return {
        ok: false,
        code: "path_collision",
        skillId: fallbackSkill.id,
        skillName: fallbackSkill.skillName,
      }
    }
    candidatePaths.add(candidate.path)
  }

  const resolved: Extract<LegacySkillPathResolution, { ok: true }>["resolved"] = []
  const unresolved: LegacySkillIdentity[] = []
  for (const legacySkill of input.legacySkills) {
    const savedName = canonicalSkillName(legacySkill.skillName)
    const exactMatches = input.candidates.filter((candidate) => (
      canonicalSkillName(candidate.name) === savedName
    ))

    if (exactMatches.length === 1) {
      const [candidate] = exactMatches
      if (claimedPaths.has(candidate.path)) {
        return {
          ok: false,
          code: "path_collision",
          skillId: legacySkill.id,
          skillName: legacySkill.skillName,
        }
      }
      claimedPaths.add(candidate.path)
      resolved.push({
        canonicalName: candidate.name,
        id: legacySkill.id,
        skillPath: candidate.path,
      })
      continue
    }
    if (exactMatches.length > 1) {
      return {
        ok: false,
        code: "ambiguous_candidates",
        skillId: legacySkill.id,
        skillName: legacySkill.skillName,
      }
    }
    unresolved.push(legacySkill)
  }

  if (!unresolved.length) return { ok: true, resolved }

  const unclaimedCandidates = input.candidates.filter((candidate) => (
    !claimedPaths.has(candidate.path)
  ))
  if (unresolved.length === 1 && unclaimedCandidates.length === 1) {
    const [legacySkill] = unresolved
    const [candidate] = unclaimedCandidates
    resolved.push({
      canonicalName: candidate.name,
      id: legacySkill.id,
      skillPath: candidate.path,
    })
    return { ok: true, resolved }
  }

  const [unresolvedSkill] = unresolved
  if (!input.candidates.length) {
    return {
      ok: false,
      code: "no_candidates",
      skillId: unresolvedSkill.id,
      skillName: unresolvedSkill.skillName,
    }
  }
  if (!unclaimedCandidates.length) {
    return {
      ok: false,
      code: "path_collision",
      skillId: unresolvedSkill.id,
      skillName: unresolvedSkill.skillName,
    }
  }

  return {
    ok: false,
    code: "ambiguous_candidates",
    skillId: unresolvedSkill.id,
    skillName: unresolvedSkill.skillName,
  }
}

export type LegacySkillPathPersistenceDecision = "conflict" | "repair" | "unchanged"

/** Keeps a concurrent repair idempotent while rejecting any different source. */
export function decideLegacySkillPathPersistence(input: {
  currentPath: string | null
  expectedPath: string
  recoveredPath: string | null
}): LegacySkillPathPersistenceDecision {
  if (input.currentPath === input.expectedPath) return "unchanged"
  if (input.currentPath === null && input.recoveredPath === input.expectedPath) return "repair"
  return "conflict"
}

/** Detects a repository change between legacy discovery and final packaging. */
export function matchesRecoveredCanonicalName(input: {
  actualName: string
  expectedName: string | null
}) {
  return input.expectedName === null || input.actualName === input.expectedName
}
