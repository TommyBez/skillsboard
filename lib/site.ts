export const siteConfig = {
  name: "Skills Board",
  url: "https://skillsboard.sh",
  description:
    "Build a shared library of AI skills your team recommends. Connect your agent through MCP, or use the source, command, or ZIP that fits your setup.",
  tagline: "Your team’s skills. All in one place.",
  ogDescription: "Keep team-recommended AI skills in one searchable library and connect it to your agent through MCP.",
  githubUrl: "https://github.com/TommyBez/skillsboard",
  locale: "en_US",
} as const

export function absoluteUrl(path = "/") {
  if (path === "/" || path === "") return siteConfig.url
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`
}
