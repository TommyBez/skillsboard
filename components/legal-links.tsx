import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * The legal pages, in one list.
 *
 * Exported because the grouped marketing footer folds them into its Company
 * column instead of trailing them after the nav as a second row, and the two
 * places must not name different pages.
 */
export const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
] as const

interface LegalLinksProps {
  ariaLabel?: string
  className?: string
  linkClassName?: string
}

export function LegalLinks({
  ariaLabel = "Legal",
  className,
  linkClassName,
}: LegalLinksProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}
    >
      {legalLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center px-2 transition-colors hover:text-foreground",
            linkClassName,
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
