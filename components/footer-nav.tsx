import Link from "next/link"

import { legalLinks } from "@/components/legal-links"
import { cn } from "@/lib/utils"
import { alternativesIndexPath } from "@/lib/seo/alternatives"
import { compareIndexPath } from "@/lib/seo/compare/types"
import { pricingPath } from "@/lib/seo/pricing-schema"
import { resourcePaths } from "@/lib/seo/resources"
import { skillCreatorPath } from "@/lib/seo/skill-creator/types"

export interface FooterNavLink {
  readonly href: string
  readonly label: string
}

export interface FooterNavGroup {
  readonly title: string
  readonly links: readonly FooterNavLink[]
}

/**
 * The marketing footer's links, grouped.
 *
 * One definition for both colophons. The landing footer and the resource
 * footer used to keep their own inline lists, which is how they drifted into
 * naming different sets of pages, and a flat row of eight tracked caps is what
 * that drift looked like once every page was in it. Three groups keep the same
 * set at depth 1 and give the row somewhere to break.
 *
 * `faqAnchor` is the one difference between the two surfaces: `#faq` is a
 * section of the home page, so it is only offered where that section exists.
 * Everything else is a route and reads from the path constants, so a rename
 * moves both footers at once.
 */
export function footerNavGroups(
  options: { readonly faqAnchor?: boolean } = {},
): readonly FooterNavGroup[] {
  const { faqAnchor = false } = options

  return [
    {
      title: "Product",
      links: [
        { href: pricingPath, label: "Pricing" },
        ...(faqAnchor ? [{ href: "#faq", label: "FAQ" }] : []),
        { href: "/developers", label: "Developers" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: resourcePaths.index, label: "Resources" },
        { href: compareIndexPath, label: "Compare" },
        { href: alternativesIndexPath, label: "Alternatives" },
        { href: skillCreatorPath, label: "Skill creator" },
      ],
    },
    {
      title: "Company",
      links: [{ href: resourcePaths.about, label: "About" }, ...legalLinks],
    },
  ]
}

interface FooterNavColumnsProps {
  /** Names the landmark. The two footers label theirs differently. */
  readonly ariaLabel: string
  readonly faqAnchor?: boolean
  readonly className?: string
  readonly titleClassName?: string
  readonly linkClassName?: string
}

/**
 * The grouped colophon nav, rendered once and typed twice.
 *
 * Both footers pass their own type scale, so the landing keeps its tracked
 * caps and the resource pages keep theirs, while the grouping and the markup
 * stay in one place.
 *
 * The grid starts at one column and only splits at `sm`, so the groups stack
 * on a phone instead of being squeezed into thirds. Each column carries
 * `min-w-0` so a long label shrinks its own cell rather than pushing the grid
 * wider than the page.
 */
export function FooterNavColumns({
  ariaLabel,
  faqAnchor = false,
  className,
  titleClassName,
  linkClassName,
}: FooterNavColumnsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "grid w-full grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-3",
        className,
      )}
    >
      {footerNavGroups({ faqAnchor }).map((group) => (
        <div key={group.title} className="min-w-0">
          <h2 className={titleClassName}>{group.title}</h2>
          <ul className="mt-1 flex flex-col items-start">
            {group.links.map((link) => (
              <li key={link.href} className="min-w-0">
                {link.href.startsWith("#") ? (
                  <a href={link.href} className={linkClassName}>
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className={linkClassName}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
