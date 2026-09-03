/** The parts of a `PostalAddress`, spelled as schema.org names them. */
type PostalAddressParts = {
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: string
}

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
  /**
   * The public postal identity, in one line for prose and in parts for the
   * `PostalAddress` in the Organization JSON-LD. Both are `null` while there
   * is no real address to publish, and every surface omits the address while
   * they are.
   *
   * The CAN SPAM postal address requirement covers commercial messages. The
   * email Skills Board sends today is account setup service email and
   * transactional email, both relationship messages, so no address is needed
   * to start. A made up address is worse than none, so nothing here is ever
   * filled with a placeholder. Set both together, with the operator's real
   * address, before any marketing broadcast goes out.
   *
   * The parts are written out rather than parsed back out of the one-line
   * spelling: an address is not reliably recoverable from its own comma
   * separated form, and a structured address is what lets an agent answer
   * "where is this company" without guessing which comma meant what. The
   * organization node test asserts the two spellings agree whenever they are
   * set, and that neither is set alone.
   */
  postalAddress: null as string | null,
  address: null as PostalAddressParts | null,
  locale: "en_US",
} as const

export function absoluteUrl(path = "/") {
  if (path === "/" || path === "") return siteConfig.url
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`
}
