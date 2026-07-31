"use client"

import type { ReactNode } from "react"
import { LazyMotion } from "motion/react"

const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default)

// m.* components render their server markup immediately and start animating
// once the deferred feature bundle lands.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>
}
