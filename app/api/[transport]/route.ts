import { mcpHandler } from "@better-auth/oauth-provider"
import { and, eq } from "drizzle-orm"
import { createMcpHandler } from "mcp-handler"
import { revalidateTag } from "next/cache"
import { z } from "zod"

import { cacheTags } from "@/lib/cache-tags"
import { db } from "@/lib/db"
import {
  getUserCollection,
  getUserSkill,
  listCollectionSkills,
  listUserCollections,
  listUserOrganizations,
  listUserSkills,
} from "@/lib/db/queries"
import { collection, collectionSkill } from "@/lib/db/schema"
import {
  discoverGitHubSkills,
  GitHubSkillDiscoveryError,
} from "@/lib/github-skill-discovery"
import { buildInstallCommand } from "@/lib/install-command"
import { capturePostHogEvent, captureTeamEvent } from "@/lib/posthog-server"
import { saveSkillToLibrary } from "@/lib/save-skill"
import { getLeaderboard, searchCatalog } from "@/lib/skills-sh"

function getOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https"
  return forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(request.url).origin
}

type McpToolName =
  | "add_skill"
  | "add_skill_to_collection"
  | "create_collection"
  | "discover_repository_skills"
  | "discover_skills"
  | "get_collection_skills"
  | "get_skill_command"
  | "list_collections"
  | "list_skills"
  | "remove_skill_from_collection"
  | "search_collections"
  | "search_skills"

function captureMcpToolUsed(userId: string, toolName: McpToolName, succeeded: boolean) {
  capturePostHogEvent({
    distinctId: userId,
    event: "mcp_tool_used",
    properties: { succeeded, tool_name: toolName },
  })
}

async function trackMcpToolCall<Result>(
  userId: string,
  toolName: McpToolName,
  execute: () => Promise<Result>,
) {
  try {
    const result = await execute()
    captureMcpToolUsed(userId, toolName, true)
    return result
  } catch (error) {
    captureMcpToolUsed(userId, toolName, false)
    throw error
  }
}

function textResult(text: string, isError = false) {
  return { content: [{ type: "text" as const, text }], isError }
}

function tokenHasScope(claims: Record<string, unknown>, scope: string) {
  return typeof claims.scope === "string" && claims.scope.split(" ").includes(scope)
}

async function resolveWriteOrganization(userId: string, organizationId?: string) {
  const organizations = await listUserOrganizations(userId)
  if (!organizations.length) {
    return {
      ok: false as const,
      error: "You are not a member of any team yet. Create or join a team in Skills Board first.",
    }
  }
  const teamList = organizations.map((org) => `${org.name} (organizationId: ${org.id})`).join(", ")
  if (organizationId) {
    const match = organizations.find((org) => org.id === organizationId)
    if (!match) {
      return {
        ok: false as const,
        error: `You are not a member of that team. Your teams: ${teamList}`,
      }
    }
    return { ok: true as const, organization: match }
  }
  if (organizations.length === 1) return { ok: true as const, organization: organizations[0] }
  return {
    ok: false as const,
    error: `You belong to multiple teams, so pass organizationId to pick the library. Your teams: ${teamList}`,
  }
}

async function resolveSkillPath(githubUrl: string, skillPath?: string) {
  if (skillPath !== undefined) return { ok: true as const, skillPath }
  const repository = await discoverGitHubSkills(githubUrl)
  if (!repository.skills.length) {
    return {
      ok: false as const,
      error: "We couldn’t find a valid SKILL.md in this repository.",
    }
  }
  if (repository.linkedSkillPath !== null) {
    return { ok: true as const, skillPath: repository.linkedSkillPath }
  }
  if (repository.skills.length === 1) {
    return { ok: true as const, skillPath: repository.skills[0].path }
  }
  const options = repository.skills
    .map((found) => `${found.name} (skillPath: ${JSON.stringify(found.path)})`)
    .join(", ")
  return {
    ok: false as const,
    error: `This repository contains multiple skills, so pass skillPath to pick one: ${options}`,
  }
}

async function route(request: Request) {
  const origin = getOrigin(request)
  const resource = `${origin}/api/mcp`
  return mcpHandler({ jwksUrl: `${origin}/api/auth/jwks`, verifyOptions: { issuer: `${origin}/api/auth`, audience: resource } }, async (req, jwt) => {
    if (!jwt.sub) return new Response("Token subject is required", { status: 401 })
    return createMcpHandler((server) => {
      server.registerTool("list_skills", {
        title: "List team skills",
        description: "List every skill saved across the authenticated user's team libraries",
        inputSchema: {},
      }, async () => trackMcpToolCall(jwt.sub!, "list_skills", async () => ({
        content: [{ type: "text" as const, text: JSON.stringify(await listUserSkills(jwt.sub!), null, 2) }],
      })))

      server.registerTool("search_skills", {
        title: "Search team skills",
        description: "Search saved team skills by name, description, note, example prompt, repository, or tag",
        inputSchema: { query: z.string().min(1) },
      }, async ({ query }) => trackMcpToolCall(jwt.sub!, "search_skills", async () => {
        const skills = await listUserSkills(jwt.sub!)
        const normalized = query.toLowerCase()
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(skills.filter((skill) => (
              `${skill.title} ${skill.description ?? ""} ${skill.note ?? ""} ${skill.examplePrompts.join(" ")} ${skill.repoOwner}/${skill.repoName} ${skill.tags.join(" ")}`
                .toLowerCase()
                .includes(normalized)
            )), null, 2),
          }],
        }
      }))

      server.registerTool("get_skill_command", { title: "Get install command", description: "Return the skills.sh CLI command for a saved skill", inputSchema: { skillId: z.uuid() } }, async ({ skillId }) => {
        const found = await getUserSkill(jwt.sub!, skillId)
        const payload = {
          content: [{
            type: "text" as const,
            text: found ? buildInstallCommand(found.githubUrl, found.skillName) : "Skill not found",
          }],
          isError: !found,
        }

        captureMcpToolUsed(jwt.sub!, "get_skill_command", Boolean(found))

        if (found) {
          captureTeamEvent({
            distinctId: jwt.sub!,
            event: "skill_usage_path_selected",
            properties: {
              actor_is_skill_creator: found.createdBy === jwt.sub,
              method: "command",
              skill_id: found.id,
              skill_name: found.skillName,
              surface: "mcp",
            },
            teamId: found.organizationId,
          })
        }

        return payload
      })

      server.registerTool("discover_skills", {
        title: "Discover public skills",
        description: "Search skills.sh or browse a leaderboard",
        inputSchema: {
          query: z.string().optional(),
          view: z.enum(["trending", "hot", "all-time"]).optional(),
          page: z.number().int().min(0).optional(),
        },
      }, async ({ query, view, page }) => {
        try {
          return await trackMcpToolCall(jwt.sub!, "discover_skills", async () => ({
            content: [{
              type: "text" as const,
              text: JSON.stringify(
                query ? await searchCatalog(query) : await getLeaderboard(view ?? "trending", page ?? 0),
                null,
                2,
              ),
            }],
          }))
        } catch (error) {
          console.error("Unable to load the skills catalog from MCP", error)
          return textResult("The public skills catalog is unavailable. Try again in a moment.", true)
        }
      })

      server.registerTool("discover_repository_skills", {
        title: "Inspect a repository for skills",
        description: "List the installable skills (SKILL.md definitions) found in a GitHub repository, with the skillPath to use when saving one",
        inputSchema: { githubUrl: z.url().describe("GitHub repository URL or direct skill link") },
      }, async ({ githubUrl }) => {
        try {
          const repository = await discoverGitHubSkills(githubUrl)
          captureMcpToolUsed(jwt.sub!, "discover_repository_skills", true)
          if (!repository.skills.length) {
            return textResult("We couldn’t find a valid SKILL.md in this repository.", true)
          }
          return textResult(JSON.stringify({
            githubUrl: repository.githubUrl,
            repoOwner: repository.repoOwner,
            repoName: repository.repoName,
            linkedSkillPath: repository.linkedSkillPath,
            skills: repository.skills.map(({ name, description, path }) => ({ name, description, skillPath: path })),
          }, null, 2))
        } catch (error) {
          console.error("Unable to discover repository skills over MCP", error)
          captureMcpToolUsed(jwt.sub!, "discover_repository_skills", false)
          return textResult(
            error instanceof GitHubSkillDiscoveryError
              ? error.message
              : "We couldn’t inspect this repository. Check the URL and try again.",
            true,
          )
        }
      })

      server.registerTool("add_skill", {
        title: "Add a skill",
        description: "Save a skill from a GitHub repository to a team library. When the repository contains multiple skills, use discover_repository_skills first and pass the chosen skillPath.",
        inputSchema: {
          githubUrl: z.url().describe("GitHub repository URL or direct skill link"),
          skillPath: z.string().max(512).optional().describe("Repository-relative folder containing SKILL.md (\"\" for the repository root). Optional when the repository contains a single skill."),
          tags: z.array(z.string().trim().min(1).max(30)).max(10).optional().describe("Up to 10 team tags"),
          note: z.string().trim().max(500).optional().describe("Optional note for teammates"),
          examplePrompts: z.array(z.string().trim().min(1).max(800)).max(8).optional().describe("Up to 8 example prompts for teammates"),
          organizationId: z.string().optional().describe("Team library to save into. Optional when you belong to a single team."),
        },
      }, async ({ githubUrl, skillPath, tags, note, examplePrompts, organizationId }) => {
        if (!tokenHasScope(jwt, "skills:write")) {
          captureMcpToolUsed(jwt.sub!, "add_skill", false)
          return textResult("This connection is missing the skills:write scope. Reconnect Skills Board from your MCP client to grant write access.", true)
        }

        const organization = await resolveWriteOrganization(jwt.sub!, organizationId)
        if (!organization.ok) {
          captureMcpToolUsed(jwt.sub!, "add_skill", false)
          return textResult(organization.error, true)
        }

        let resolvedPath
        try {
          resolvedPath = await resolveSkillPath(githubUrl, skillPath)
        } catch (error) {
          console.error("Unable to discover repository skills over MCP", error)
          captureMcpToolUsed(jwt.sub!, "add_skill", false)
          return textResult(
            error instanceof GitHubSkillDiscoveryError
              ? error.message
              : "We couldn’t inspect this repository. Check the URL and try again.",
            true,
          )
        }
        if (!resolvedPath.ok) {
          captureMcpToolUsed(jwt.sub!, "add_skill", false)
          return textResult(resolvedPath.error, true)
        }

        const result = await saveSkillToLibrary({
          organizationId: organization.organization.id,
          userId: jwt.sub!,
          githubUrl,
          skillPath: resolvedPath.skillPath,
          tags: tags ?? [],
          note,
          examplePrompts: examplePrompts ?? [],
          surface: "mcp",
        })
        captureMcpToolUsed(jwt.sub!, "add_skill", result.ok)
        if (!result.ok) return textResult(result.error, true)

        revalidateTag(cacheTags.organizationSkills(organization.organization.id), { expire: 0 })
        return textResult(JSON.stringify({
          saved: true,
          organizationName: organization.organization.name,
          skill: {
            id: result.skill.id,
            organizationId: result.skill.organizationId,
            githubUrl: result.skill.githubUrl,
            skillName: result.skill.skillName,
            title: result.skill.title,
            description: result.skill.description,
            skillPath: result.skill.skillPath,
            tags: result.skill.tags,
            note: result.skill.note,
            examplePrompts: result.skill.examplePrompts,
          },
        }, null, 2))
      })
      server.registerTool("list_collections", {
        title: "List team collections",
        description: "List every skill collection across the authenticated user's team libraries, with skill counts",
        inputSchema: {},
      }, async () => trackMcpToolCall(jwt.sub!, "list_collections", async () => ({
        content: [{ type: "text" as const, text: JSON.stringify(await listUserCollections(jwt.sub!), null, 2) }],
      })))

      server.registerTool("search_collections", {
        title: "Search team collections",
        description: "Search team skill collections by title, description, or tag",
        inputSchema: { query: z.string().min(1) },
      }, async ({ query }) => trackMcpToolCall(jwt.sub!, "search_collections", async () => {
        const collections = await listUserCollections(jwt.sub!)
        const normalized = query.toLowerCase()
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify(collections.filter((item) => (
              `${item.title} ${item.description ?? ""} ${item.tags.join(" ")}`
                .toLowerCase()
                .includes(normalized)
            )), null, 2),
          }],
        }
      }))

      server.registerTool("get_collection_skills", {
        title: "Get collection skills",
        description: "List the skills grouped in a collection, with their install commands",
        inputSchema: { collectionId: z.uuid() },
      }, async ({ collectionId }) => {
        const found = await getUserCollection(jwt.sub!, collectionId)
        captureMcpToolUsed(jwt.sub!, "get_collection_skills", Boolean(found))
        if (!found) return textResult("Collection not found", true)

        const skills = await listCollectionSkills(found.organizationId, found.id)
        return textResult(JSON.stringify({
          collection: {
            id: found.id,
            organizationId: found.organizationId,
            title: found.title,
            description: found.description,
            tags: found.tags,
          },
          skills: skills.map((item) => ({
            id: item.id,
            title: item.title,
            skillName: item.skillName,
            description: item.description,
            githubUrl: item.githubUrl,
            repoOwner: item.repoOwner,
            repoName: item.repoName,
            tags: item.tags,
            note: item.note,
            examplePrompts: item.examplePrompts,
            installCommand: buildInstallCommand(item.githubUrl, item.skillName),
          })),
        }, null, 2))
      })

      server.registerTool("create_collection", {
        title: "Create a collection",
        description: "Create a team collection that groups saved skills by use case or project. Collections are visible to the whole team.",
        inputSchema: {
          title: z.string().trim().min(1).max(80).describe("Collection title"),
          description: z.string().trim().max(500).optional().describe("What these skills have in common"),
          tags: z.array(z.string().trim().min(1).max(30)).max(10).optional().describe("Up to 10 team tags"),
          organizationId: z.string().optional().describe("Team library to create the collection in. Optional when you belong to a single team."),
        },
      }, async ({ title, description, tags, organizationId }) => {
        if (!tokenHasScope(jwt, "skills:write")) {
          captureMcpToolUsed(jwt.sub!, "create_collection", false)
          return textResult("This connection is missing the skills:write scope. Reconnect Skills Board from your MCP client to grant write access.", true)
        }

        const organization = await resolveWriteOrganization(jwt.sub!, organizationId)
        if (!organization.ok) {
          captureMcpToolUsed(jwt.sub!, "create_collection", false)
          return textResult(organization.error, true)
        }

        const normalizedTags = [...new Set(tags ?? [])]
        let createdId: string
        try {
          const [created] = await db
            .insert(collection)
            .values({
              organizationId: organization.organization.id,
              createdBy: jwt.sub!,
              title,
              description: description || null,
              tags: normalizedTags,
            })
            .returning({ id: collection.id })
          createdId = created.id
        } catch (error) {
          console.error("Unable to create collection over MCP", error)
          captureMcpToolUsed(jwt.sub!, "create_collection", false)
          return textResult("We couldn’t create this collection. Try again.", true)
        }

        captureMcpToolUsed(jwt.sub!, "create_collection", true)
        captureTeamEvent({
          distinctId: jwt.sub!,
          event: "collection_created",
          properties: {
            collection_id: createdId,
            has_description: Boolean(description),
            surface: "mcp",
            tag_count: normalizedTags.length,
          },
          teamId: organization.organization.id,
        })
        revalidateTag(cacheTags.organizationCollections(organization.organization.id), { expire: 0 })
        return textResult(JSON.stringify({
          created: true,
          organizationName: organization.organization.name,
          collection: {
            id: createdId,
            organizationId: organization.organization.id,
            title,
            description: description || null,
            tags: normalizedTags,
          },
        }, null, 2))
      })

      server.registerTool("add_skill_to_collection", {
        title: "Add a skill to a collection",
        description: "Add a saved team skill to a collection. Use list_skills and list_collections to find the IDs.",
        inputSchema: { collectionId: z.uuid(), skillId: z.uuid() },
      }, async ({ collectionId, skillId }) => {
        if (!tokenHasScope(jwt, "skills:write")) {
          captureMcpToolUsed(jwt.sub!, "add_skill_to_collection", false)
          return textResult("This connection is missing the skills:write scope. Reconnect Skills Board from your MCP client to grant write access.", true)
        }

        const [foundCollection, foundSkill] = await Promise.all([
          getUserCollection(jwt.sub!, collectionId),
          getUserSkill(jwt.sub!, skillId),
        ])
        if (!foundCollection || !foundSkill || foundCollection.organizationId !== foundSkill.organizationId) {
          captureMcpToolUsed(jwt.sub!, "add_skill_to_collection", false)
          return textResult("Collection or skill not found in the same team library", true)
        }

        try {
          await db
            .insert(collectionSkill)
            .values({ collectionId, skillId, addedBy: jwt.sub! })
            .onConflictDoNothing()
        } catch (error) {
          console.error("Unable to add skill to collection over MCP", error)
          captureMcpToolUsed(jwt.sub!, "add_skill_to_collection", false)
          return textResult("We couldn’t add this skill to the collection. Try again.", true)
        }

        captureMcpToolUsed(jwt.sub!, "add_skill_to_collection", true)
        captureTeamEvent({
          distinctId: jwt.sub!,
          event: "collection_skill_added",
          properties: { collection_id: collectionId, skill_id: skillId, surface: "mcp" },
          teamId: foundCollection.organizationId,
        })
        revalidateTag(cacheTags.organizationCollections(foundCollection.organizationId), { expire: 0 })
        return textResult(JSON.stringify({ added: true, collectionTitle: foundCollection.title }, null, 2))
      })

      server.registerTool("remove_skill_from_collection", {
        title: "Remove a skill from a collection",
        description: "Remove a skill from a collection. The skill stays in the team library.",
        inputSchema: { collectionId: z.uuid(), skillId: z.uuid() },
      }, async ({ collectionId, skillId }) => {
        if (!tokenHasScope(jwt, "skills:write")) {
          captureMcpToolUsed(jwt.sub!, "remove_skill_from_collection", false)
          return textResult("This connection is missing the skills:write scope. Reconnect Skills Board from your MCP client to grant write access.", true)
        }

        const foundCollection = await getUserCollection(jwt.sub!, collectionId)
        if (!foundCollection) {
          captureMcpToolUsed(jwt.sub!, "remove_skill_from_collection", false)
          return textResult("Collection not found", true)
        }

        try {
          await db
            .delete(collectionSkill)
            .where(and(
              eq(collectionSkill.collectionId, collectionId),
              eq(collectionSkill.skillId, skillId),
            ))
        } catch (error) {
          console.error("Unable to remove skill from collection over MCP", error)
          captureMcpToolUsed(jwt.sub!, "remove_skill_from_collection", false)
          return textResult("We couldn’t remove this skill from the collection. Try again.", true)
        }

        captureMcpToolUsed(jwt.sub!, "remove_skill_from_collection", true)
        captureTeamEvent({
          distinctId: jwt.sub!,
          event: "collection_skill_removed",
          properties: { collection_id: collectionId, skill_id: skillId, surface: "mcp" },
          teamId: foundCollection.organizationId,
        })
        revalidateTag(cacheTags.organizationCollections(foundCollection.organizationId), { expire: 0 })
        return textResult(JSON.stringify({ removed: true, collectionTitle: foundCollection.title }, null, 2))
      })
    }, { serverInfo: { name: "skills-board", version: "1.0.0" } }, { basePath: "/api", disableSse: true })(req)
  })(request)
}

export { route as GET, route as POST, route as DELETE }
