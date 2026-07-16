const MAX_SKILL_NAME_LENGTH = 64
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidAgentSkillName(value: string) {
  return value.length <= MAX_SKILL_NAME_LENGTH && SKILL_NAME_PATTERN.test(value)
}
