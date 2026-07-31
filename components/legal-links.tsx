import Link from "next/link"

import { cn } from "@/lib/utils"

const links = [
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
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn("transition-colors hover:text-foreground", linkClassName)}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
