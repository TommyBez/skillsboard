export const siteConfig = {
  name: "Skills Board",
  url: "https://www.skillsboard.sh",
  description:
    "Skills Board is the agent-native skills registry for teams. Keep your team's AI skills in one place, and reach them from your agent through MCP.",
  tagline: "Your team’s skills. All in one place.",
  ogDescription:
    "The agent-native skills registry for teams. Keep your team's AI skills in one place, and reach them from your agent through MCP.",
  githubUrl: "https://github.com/TommyBez/skillsboard",
  contactEmail: "tommaso@skillsboard.sh",
  postalAddress: "15 Giuseppe Verdi Avenue, Suite 150, Capraia Innovation Park, CA 50050",
  /**
   * The same postal address in its parts, for the `PostalAddress` in the
   * Organization JSON-LD. Written out rather than parsed back out of the
   * one-line spelling above: an address is not reliably recoverable from its
   * own comma separated form, and a structured address is what lets an agent
   * answer "where is this company" without guessing which comma meant what.
   * The `mailingAddress` test asserts the two spellings agree.
   */
  address: {
    streetAddress: "15 Giuseppe Verdi Avenue, Suite 150",
    addressLocality: "Capraia Innovation Park",
    addressRegion: "CA",
    postalCode: "50050",
    addressCountry: "US",
  },
  locale: "en_US",
} as const

export function absoluteUrl(path = "/") {
  if (path === "/" || path === "") return siteConfig.url
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`
}
