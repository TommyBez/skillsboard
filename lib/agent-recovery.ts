import { discoveryUrl } from "@/lib/agent-discovery"

/**
 * Where to send a client that asked for something this site does not have.
 *
 * A 404 that only says "not found" makes a reader — a person or an agent —
 * guess at the next URL, and an agent guessing produces another 404. These are
 * the four places every wrong URL can be recovered from, and they are listed
 * once here so the HTML 404 page and the Markdown one cannot offer different
 * advice.
 */
export const recoveryLinks = [
  {
    label: "Home",
    href: "/",
    description: "What Skills Board is, what it costs, and how a team uses it.",
  },
  {
    label: "Sitemap",
    href: "/sitemap.xml",
    description: "Every public URL on this site.",
  },
  {
    label: "llms.txt",
    href: "/llms.txt",
    description: "The same index written for agents, with a Markdown twin behind every entry.",
  },
  {
    label: "Developer docs",
    href: "/developers",
    description: "The MCP endpoint, the OAuth flow, and the machine-readable documents.",
  },
] as const

/**
 * The Markdown body of a 404, for a client that asked for Markdown.
 *
 * Short on purpose: it exists to be read by whatever is retrying, so it says
 * what happened and where to look next, and nothing else.
 */
export function buildNotFoundMarkdown(path?: string): string {
  const subject = path ? `\`${path}\`` : "The requested path"

  return [
    "# 404: page not found",
    "",
    `${subject} does not exist on Skills Board. Nothing was moved silently: this path has no page, and retrying it will return this document again.`,
    "",
    "## Where to look next",
    "",
    ...recoveryLinks.map(
      (link) => `- [${link.label}](${discoveryUrl(link.href)}): ${link.description}`,
    ),
    "",
    "Every public page also answers with Markdown: append `.md` to its path, or send `Accept: text/markdown`.",
    "",
  ].join("\n")
}
