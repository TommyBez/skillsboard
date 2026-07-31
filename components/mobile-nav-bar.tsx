"use client"

/**
 * The mobile bottom nav, which now yields while you read.
 *
 * It is fixed to the bottom of every app screen, so on a phone it permanently
 * costs a strip of viewport on the one form factor with the least of it.
 * HideOnScroll lets it slide out on sustained downward travel and brings it
 * back as soon as you scroll up, which is where you would reach for it anyway.
 */

import { HideOnScroll } from "@/components/interior/hide-on-scroll"

export function MobileNavBar({ children }: { children: React.ReactNode }) {
  return (
    <HideOnScroll
      barHeight={72}
      label="Mobile product navigation"
      className="md:hidden"
      bar={
        <nav
          className="mx-3 mb-3 flex items-center justify-center gap-1 rounded-2xl border border-border bg-background/92 p-1.5 shadow-[0_18px_48px_hsl(var(--shadow-color)/0.2)] backdrop-blur-xl"
          aria-label="Mobile product navigation"
        >
          {children}
        </nav>
      }
    />
  )
}
