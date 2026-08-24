import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { cacheTags } from "@/lib/cache-tags"
import { parseGitHubUrl } from "@/lib/github-url"

export { parseGitHubUrl }

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

export async function getGitHubMetadata(value: string): Promise<GitHubMetadata> {
  "use cache"
  cacheLife("hours")

  const parsed = parseGitHubUrl(value)
  cacheTag(cacheTags.githubRepository(parsed.repoOwner, parsed.repoName))
  const response = await fetch(`https://api.github.com/repos/${parsed.repoOwner}/${parsed.repoName}`, {
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
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
