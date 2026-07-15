"use client"

import type { ReactNode } from "react"
import { LazyMotion, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"

const EASE = [0.16, 1, 0.3, 1] as const
const loadFeatures = () => import("@/components/motion/features").then((module) => module.default)

export function MotionRuntime({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures} strict>{children}</LazyMotion>
}

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion()
  return (
    <m.div
      data-motion-reveal
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduce ? { duration: 0, delay: 0 } : { duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </m.div>
  )
}

interface HeroEntranceProps {
  children: ReactNode
  className?: string
}

export function HeroEntrance({ children, className }: HeroEntranceProps) {
  const reduce = useReducedMotion()
  return (
    <m.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: reduce ? { staggerChildren: 0, delayChildren: 0 } : { staggerChildren: 0.08, delayChildren: 0.05 } },
      }}
    >
      {children}
    </m.div>
  )
}

export function HeroItem({ children, className }: HeroEntranceProps) {
  const reduce = useReducedMotion()

  return (
    <m.div
      data-motion-hero-item
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: reduce ? { duration: 0 } : { duration: 0.7, ease: EASE } },
      }}
    >
      {children}
    </m.div>
  )
}
