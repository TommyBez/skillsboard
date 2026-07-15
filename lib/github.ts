import "server-only"

interface GitHubRepo {
  description: string | null
  stargazers_count: number
  updated_at: string
}

export interface GitHubMetadata {
  githubUrl: string
  description: string | null
  repoOwner: string
  repoName: string
  repoStars: number
  repoUpdatedAt: Date
}

export function parseGitHubUrl(value: string) {
  const url = new URL(value)
  if (url.hostname !== "github.com") throw new Error("Use a github.com repository URL")
  const [repoOwner, rawRepoName] = url.pathname.split("/").filter(Boolean)
  if (!repoOwner || !rawRepoName) throw new Error("Invalid GitHub repository URL")
  const repoName = rawRepoName.replace(/\.git$/, "")
  return { githubUrl: `https://github.com/${repoOwner}/${repoName}`, repoOwner, repoName }
}

export async function getGitHubMetadata(value: string): Promise<GitHubMetadata> {
  const parsed = parseGitHubUrl(value)
  const response = await fetch(`https://api.github.com/repos/${parsed.repoOwner}/${parsed.repoName}`, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
    next: { revalidate: 3600 },
  })
  if (!response.ok) throw new Error("GitHub repository not found or unavailable")
  const repo = (await response.json()) as GitHubRepo
  return {
    ...parsed,
    description: repo.description,
    repoStars: repo.stargazers_count,
    repoUpdatedAt: new Date(repo.updated_at),
  }
}
