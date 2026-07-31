/**
 * Shared by the add-skill dialog. Kept free of server-only imports so the
 * selection rules can be unit tested without a GitHub round trip.
 */
export interface SelectableSkill {
  name: string
  path: string
}

export interface PickDiscoveredSkillInput<T extends SelectableSkill> {
  /** Every skill the repository inspection returned. */
  skills: T[]
  /** Path resolved from a direct GitHub skill link, otherwise null. */
  linkedSkillPath: string | null
  /** Catalog slug the dialog was opened for, when it came from Discover. */
  requestedName?: string
}

/**
 * Resolves the one skill a Discover entry points at. Discover always names a
 * single catalog skill, so its repository's other skills must never be pulled
 * in alongside it: everything outside this result stays unselectable.
 *
 * Returns null when the repository no longer publishes the requested skill,
 * which the caller surfaces instead of silently offering the neighbours.
 */
export function pickDiscoveredSkill<T extends SelectableSkill>({
  skills,
  linkedSkillPath,
  requestedName = "",
}: PickDiscoveredSkillInput<T>): T | null {
  const canonicalName = requestedName.trim().toLowerCase()
  const named = canonicalName
    ? skills.find((skill) => skill.name.toLowerCase() === canonicalName)
    : undefined
  if (named) return named

  // A direct skill link already narrowed the inspection to one folder, so it
  // decides when the catalog slug and the SKILL.md name disagree.
  const linked = linkedSkillPath === null
    ? undefined
    : skills.find((skill) => skill.path === linkedSkillPath)
  if (linked) return linked

  return skills.length === 1 ? skills[0] : null
}
