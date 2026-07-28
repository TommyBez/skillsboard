import Link from "next/link"

import { Brand } from "@/components/brand"
import { siteConfig } from "@/lib/site"

const repoUrl = siteConfig.githubUrl
const repoLabel = repoUrl.replace(/^https:\/\//, "")

/**
 * Interaction default: 160ms on the standard curve (§7.2). Colour only — a
 * footer link is not a surface and gets no fill, no underline, no lift.
 */
const linkClass =
  "text-muted-foreground transition-colors duration-[160ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-foreground focus-visible:rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ring"

type FooterLink = { label: string; href: string; external?: boolean }

/**
 * Three columns of real destinations. Nothing here is a placeholder: every
 * href resolves to a section, a route, or the repository. `span` carries the
 * column's own 12-col placement so the JSX stays a flat map.
 */
const columns: Array<{
  id: string
  heading: string
  span: string
  links: FooterLink[]
}> = [
  {
    id: "footer-product",
    heading: "Product",
    span: "lg:col-span-2 lg:col-start-6",
    links: [
      { label: "How it works", href: "#flow" },
      { label: "MCP access", href: "#mcp" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    id: "footer-resources",
    heading: "Resources",
    span: "lg:col-span-2 lg:col-start-8",
    links: [
      { label: "Guides", href: "/resources" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    id: "footer-open-source",
    heading: "Open source",
    span: "lg:col-span-3 lg:col-start-10",
    // The repository itself lives in the closing line, so this column carries
    // the things you would go looking for once you are already there.
    links: [
      { label: "Issues", href: `${repoUrl}/issues`, external: true },
      { label: "Contributing", href: `${repoUrl}/blob/main/CONTRIBUTING.md`, external: true },
      { label: "Security", href: `${repoUrl}/blob/main/SECURITY.md`, external: true },
    ],
  },
]

function GitHubMark() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.605-3.369-1.343-3.369-1.343-.455-1.159-1.11-1.468-1.11-1.468-.908-.62.069-.608.069-.608 1.003.071 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.221-.253-4.555-1.112-4.555-4.947 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.27.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.38.203 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.844-2.337 4.691-4.566 4.94.359.31.679.923.679 1.86 0 1.343-.012 2.426-.012 2.757 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
    </svg>
  )
}

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.external) {
    return (
      <a className={linkClass} href={link.href} rel="noreferrer" target="_blank">
        {link.label}
      </a>
    )
  }

  // Same-page anchors stay plain anchors so smooth scrolling is not routed.
  return link.href.startsWith("#") ? (
    <a className={linkClass} href={link.href}>
      {link.label}
    </a>
  ) : (
    <Link className={linkClass} href={link.href}>
      {link.label}
    </Link>
  )
}

/**
 * Footer — the open-source colophon (§8.2).
 *
 * Below 1024px the label sits above its links rather than in a left gutter.
 * The gutter version cost 96px of a 350px column, which was exactly enough to
 * push "Pricing" onto a second line on its own with 180px of nothing beside it,
 * while Resources and Open source stayed one line — three groups of three
 * different shapes, which read as an accident rather than as an index. With the
 * full width available every group's links fit on one line, so all three become
 * the same two-line block on the same left edge.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--lp-hairline)]">
      <div className="lp-container py-8">
        <div className="lp-grid gap-y-4 lg:gap-y-6">
          <div className="col-span-12 lg:col-span-4">
            <Brand />
            {/* Desktop only: on a phone this sentence lands ~100px under the
                closing band, which already says it. */}
            <p className="lp-small mt-3 hidden max-w-[34ch] text-muted-foreground lg:block">
              A shared, searchable index of the skills your team already trusts.
            </p>
          </div>

          {columns.map((column) => (
            <nav
              aria-labelledby={column.id}
              className={`col-span-12 flex flex-col gap-2 ${column.span}`}
              key={column.id}
            >
              <h2 className="lp-label text-muted-foreground" id={column.id}>
                {column.heading}
              </h2>
              <ul className="lp-small flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-2">

                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* No separator glyph: the row wraps to two lines on a phone and a
            stranded middot is worse than a gap. */}
        <p className="lp-code mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--lp-hairline)] pt-4 text-muted-foreground">
          <a
            className={linkClass}
            href={`${repoUrl}/blob/main/LICENSE`}
            rel="noreferrer"
            target="_blank"
          >
            MIT licence
          </a>
          <a
            className={`inline-flex items-center gap-2 ${linkClass}`}
            href={repoUrl}
            rel="noreferrer"
            target="_blank"
          >
            <GitHubMark />
            {repoLabel}
          </a>
        </p>
      </div>
    </footer>
  )
}
