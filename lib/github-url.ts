/**
 * The one GitHub URL parser. It runs on the server (metadata fetches, skill
 * discovery) and in the browser (the save-skill dialog recognises a pasted
 * repository URL before it asks the server about it), so this module stays
 * free of `server-only` and of any Node or Next import.
 */

export interface ParsedGitHubUrl {
  githubUrl: string
  repoOwner: string
  repoName: string
}

export function parseGitHubUrl(value: string): ParsedGitHubUrl {
  const url = new URL(value)
  if (url.hostname !== "github.com") throw new Error("Use a github.com repository URL")
  const [repoOwner, rawRepoName] = url.pathname.split("/").filter(Boolean)
  if (!repoOwner || !rawRepoName) throw new Error("Invalid GitHub repository URL")
  const repoName = rawRepoName.replace(/\.git$/, "")
  return { githubUrl: `https://github.com/${repoOwner}/${repoName}`, repoOwner, repoName }
}

/**
 * Non-throwing form for the browser: is this text complete enough that asking
 * the server to inspect it is worth a request? Deliberately the same rule the
 * server applies, so the client never starts work the server would reject.
 */
export function readGitHubUrl(value: string): ParsedGitHubUrl | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    return parseGitHubUrl(trimmed)
  } catch {
    return null
  }
}
