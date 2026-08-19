import { siteConfig } from "@/lib/site"

/**
 * The official plugin's install commands, written once.
 *
 * The plugin, its marketplace entry, and the packaged skill live in this
 * repository, so the repository slug is derived from the same GitHub URL the
 * rest of the site links to rather than typed again here. Both surfaces that
 * quote the commands (the landing band and the MCP settings page) read them
 * from this file, so an install path can never drift between them.
 */
const repositorySlug = siteConfig.githubUrl.replace("https://github.com/", "")

/** Marketplace id and plugin id are both `skills-board`, hence the pair. */
const pluginName = "skills-board"

export const pluginInstall = {
  name: pluginName,
  repositorySlug,
  /** Run in order inside Claude Code. */
  claudeCodeCommands: [
    `/plugin marketplace add ${repositorySlug}`,
    `/plugin install ${pluginName}@${pluginName}`,
  ],
  /** The same directory, for clients the Agent Plugins CLI supports. */
  cliCommand: `npx plugins add ${repositorySlug}`,
} as const

export const claudeCodeInstallSnippet = pluginInstall.claudeCodeCommands.join("\n")
