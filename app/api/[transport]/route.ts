import { mcpHandler } from "@better-auth/oauth-provider"
import { createMcpHandler } from "mcp-handler"
import { z } from "zod"

import { listUserSkills } from "@/lib/db/queries"
import { getLeaderboard, searchCatalog } from "@/lib/skills-sh"

function getOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https"
  return forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(request.url).origin
}

async function route(request: Request) {
  const origin = getOrigin(request)
  const resource = `${origin}/api/mcp`
  return mcpHandler({ jwksUrl: `${origin}/api/auth/jwks`, verifyOptions: { issuer: `${origin}/api/auth`, audience: resource } }, async (req, jwt) => {
    if (!jwt.sub) return new Response("Token subject is required", { status: 401 })
    return createMcpHandler((server) => {
      server.registerTool("list_skills", { title: "List team skills", description: "List every skill saved across the authenticated user's team libraries", inputSchema: {} }, async () => ({ content: [{ type: "text", text: JSON.stringify(await listUserSkills(jwt.sub!), null, 2) }] }))
      server.registerTool("search_skills", { title: "Search team skills", description: "Search saved team skills by name, description, repository, or tag", inputSchema: { query: z.string().min(1) } }, async ({ query }) => { const skills = await listUserSkills(jwt.sub!); const normalized = query.toLowerCase(); return { content: [{ type: "text", text: JSON.stringify(skills.filter((skill) => `${skill.title} ${skill.description} ${skill.repoOwner}/${skill.repoName} ${skill.tags.join(" ")}`.toLowerCase().includes(normalized)), null, 2) }] } })
      server.registerTool("get_skill_command", { title: "Get install command", description: "Return the skills.sh CLI command for a saved skill", inputSchema: { skillId: z.uuid() } }, async ({ skillId }) => { const found = (await listUserSkills(jwt.sub!)).find((skill) => skill.id === skillId); return { content: [{ type: "text", text: found ? `npx skills add ${found.githubUrl} --skill ${found.skillName}` : "Skill not found" }], isError: !found } })
      server.registerTool("discover_skills", { title: "Discover public skills", description: "Search skills.sh or browse a leaderboard", inputSchema: { query: z.string().optional(), view: z.enum(["trending", "hot", "all-time"]).optional(), page: z.number().int().min(0).optional() } }, async ({ query, view, page }) => ({ content: [{ type: "text", text: JSON.stringify(query ? await searchCatalog(query) : await getLeaderboard(view ?? "trending", page ?? 0), null, 2) }] }))
    }, { serverInfo: { name: "skills-board", version: "1.0.0" } }, { basePath: "/api", disableSse: true })(req)
  })(request)
}

export { route as GET, route as POST, route as DELETE }
