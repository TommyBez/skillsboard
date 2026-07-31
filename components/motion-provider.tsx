"use client"

import type { ReactNode } from "react"
import { LazyMotion, domMax } from "motion/react"

// Static features: m.* components hydrate in a single pass instead of
// re-rendering when a deferred feature bundle lands (that second pass showed
// up as a main-thread stall on card-heavy pages). domMax still drops the
// motion proxy's extra weight relative to importing `motion` directly, and
// includes the layout-animation support that collapsible-banner,
// command-palette, and presence-avatars rely on.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>
}
