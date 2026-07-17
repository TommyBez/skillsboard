export const siteConfig = {
  name: "Skills Board",
  url: "https://skillsboard.sh",
  description:
    "Build a shared library of AI skills your team recommends. Give teammates the source, command, or ZIP so they can choose what fits their setup.",
  tagline: "One shared library. Different agents.",
  ogDescription: "Keep your team’s recommended AI skills in one searchable place.",
  githubUrl: "https://github.com/TommyBez/skillsboard",
  locale: "en_US",
} as const

export function absoluteUrl(path = "/") {
  if (path === "/" || path === "") return siteConfig.url
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`
}
