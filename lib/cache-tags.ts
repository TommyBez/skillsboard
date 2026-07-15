export const cacheTags = {
  catalog: "skills-catalog",
  catalogView: (view: string) => `skills-catalog:${view}`,
  organizationSkills: (organizationId: string) => `organization-skills:${organizationId}`,
  githubRepository: (owner: string, repo: string) => `github:${owner}/${repo}`,
}
