import { discoveryUrl } from "@/lib/agent-discovery"
import {
  INSTALLABLE_COLLECTION_SCHEMA_URL,
  type Sha256Digest,
} from "@/lib/installable-collection-protocol"

/** Path the published copy of a skill is served from, relative to the origin. */
export const TEAM_SKILL_LIBRARY_SKILL_PATH = "/skills/team-skill-library/SKILL.md"

/**
 * Source of truth for the file at `public${TEAM_SKILL_LIBRARY_SKILL_PATH}`,
 * which is a copy of `plugin/skills/team-skill-library/SKILL.md`. The
 * `agent-skills-index` unit test hashes both files, so a skill edited in the
 * plugin without republishing the copy fails before it ships a digest that no
 * longer matches what the URL serves.
 */
export const TEAM_SKILL_LIBRARY_DIGEST: Sha256Digest =
  "sha256:a716079df32364777dec7bd4a1abfcb4e6ee7fb3053ea50df14a0e131e1303ba"

/** Verbatim from the skill's own frontmatter; the same test asserts the match. */
export const TEAM_SKILL_LIBRARY_DESCRIPTION =
  "Work with a team's shared Agent Skills library on Skills Board through the Skills Board MCP server at https://www.skillsboard.sh/api/mcp. Use when the user asks which skills their team recommends, wants to search or list the team library or its collections, needs the install command for a saved skill or for a published collection, wants to check a GitHub repository for installable skills, or wants to save a skill to the team library. Do not use it to write or edit SKILL.md files, to install unrelated npm packages or MCP servers, to edit or delete skills already saved on Skills Board, or when the Skills Board MCP server is not connected to this client."

/**
 * The Agent Skills Discovery index for this site (RFC v0.2.0).
 *
 * This lists the skills Skills Board itself publishes — one, today — and is
 * deliberately not a view of any team's library: those are private, and the
 * per-collection manifests under `/p/<share id>/.well-known/agent-skills/`
 * already serve the shareable ones.
 */
export function buildAgentSkillsIndex() {
  return {
    $schema: INSTALLABLE_COLLECTION_SCHEMA_URL,
    skills: [
      {
        name: "team-skill-library",
        type: "skill-md" as const,
        description: TEAM_SKILL_LIBRARY_DESCRIPTION,
        url: discoveryUrl(TEAM_SKILL_LIBRARY_SKILL_PATH),
        digest: TEAM_SKILL_LIBRARY_DIGEST,
        license: "MIT",
      },
    ],
  }
}
