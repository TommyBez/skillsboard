/**
 * The URLs of the public pages, as literals, for `next.config.ts` only.
 *
 * `lib/site/pages` is the registry and the source of truth. This file is a
 * mirror of two of its fields, and `tests/public-pages.test.mjs` fails if the
 * two ever disagree, so it cannot drift the way the six hand kept lists it
 * replaces did.
 *
 * It exists because a Next.js config cannot reach the registry. Next.js
 * compiles `next.config.ts` with SWC and requires the result through a hook
 * that transforms each imported `.ts` file without telling SWC which file it
 * is transforming. SWC therefore rewrites an `@/...` import to a path relative
 * to the project root rather than to the importing module, which resolves for
 * the config itself, sitting at the root, and for nothing below it:
 *
 *     Error: Cannot find module './lib/seo/alternatives'
 *     Require stack:
 *     - /vercel/path0/lib/site/pages.ts
 *     - /vercel/path0/next.config.compiled.js
 *
 * Every module in this repository addresses its neighbours through the alias,
 * so the whole content graph is out of reach of the config. Two arrays of
 * strings with no imports at all are what a config can read.
 */

/** Every public page, in registry order. */
export const publicPagePathList: readonly string[] = [
  "/",
  "/resources",
  "/guides/shared-mcp-skill-library-for-teams",
  "/guides/ai-skill-use-cases-for-teams",
  "/guides/onboard-new-teammate-ai-skills-checklist",
  "/guides/choose-first-ai-agent-skill-for-your-team",
  "/guides/ai-coding-guidelines-template",
  "/guides/ai-coding-team-onboarding",
  "/guides/share-agent-skills-with-your-team",
  "/guides/manage-skills-across-claude-codex-cursor",
  "/guides/install-claude-skills-in-claude-code",
  "/guides/how-to-write-a-skill-md",
  "/agent-skills",
  "/agent-skills-by-the-numbers",
  "/agent-skills-support",
  "/anthropic-skills",
  "/best-claude-skills",
  "/claude-skills",
  "/codex-skills",
  "/cowork-skills",
  "/cursor-skills",
  "/opencode-skills",
  "/skill-examples",
  "/vercel-skills",
  "/copilot-skills",
  "/agents-md-vs-skill-md",
  "/claude-code-for-teams",
  "/manage-ai-skills",
  "/where-to-find-claude-skills",
  "/alternatives",
  "/alternatives/github-repo",
  "/alternatives/skills-sh",
  "/alternatives/smithery",
  "/alternatives/superpowers",
  "/compare",
  "/compare/claude-skills-vs-subagents",
  "/compare/claude-skills-vs-mcp",
  "/compare/claude-skills-vs-plugins",
  "/compare/claude-skills-vs-slash-commands",
  "/developers",
  "/pricing",
  "/skill-creator",
  "/check",
  "/about",
  "/sign-up",
  "/privacy",
  "/terms",
  "/contact",
]

/** The pages that answer in Markdown, in registry order. */
export const markdownPagePathList: readonly string[] = [
  "/",
  "/resources",
  "/guides/shared-mcp-skill-library-for-teams",
  "/guides/ai-skill-use-cases-for-teams",
  "/guides/onboard-new-teammate-ai-skills-checklist",
  "/guides/choose-first-ai-agent-skill-for-your-team",
  "/guides/ai-coding-guidelines-template",
  "/guides/ai-coding-team-onboarding",
  "/guides/share-agent-skills-with-your-team",
  "/guides/manage-skills-across-claude-codex-cursor",
  "/guides/install-claude-skills-in-claude-code",
  "/guides/how-to-write-a-skill-md",
  "/agent-skills",
  "/agent-skills-by-the-numbers",
  "/agent-skills-support",
  "/anthropic-skills",
  "/best-claude-skills",
  "/claude-skills",
  "/codex-skills",
  "/cowork-skills",
  "/cursor-skills",
  "/opencode-skills",
  "/skill-examples",
  "/vercel-skills",
  "/copilot-skills",
  "/agents-md-vs-skill-md",
  "/claude-code-for-teams",
  "/manage-ai-skills",
  "/where-to-find-claude-skills",
  "/alternatives",
  "/alternatives/github-repo",
  "/alternatives/skills-sh",
  "/alternatives/smithery",
  "/alternatives/superpowers",
  "/compare",
  "/compare/claude-skills-vs-subagents",
  "/compare/claude-skills-vs-mcp",
  "/compare/claude-skills-vs-plugins",
  "/compare/claude-skills-vs-slash-commands",
  "/developers",
  "/pricing",
]
