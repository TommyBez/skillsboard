"use client"

/**
 * ValueFlash — "Marks what just changed"
 *
 * Ported from https://www.interior.dev/docs/value-flash, wired to this app's
 * tokens instead of the library's stone palette. API kept as documented.
 *
 * A change of *identity*, not of render, is what marks the number. The live
 * region is announced on a delay so a screen reader hears one settled figure
 * rather than every intermediate tick.
 */

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const RISE = 6

export function useValueFlash(value: number, hold = 900) {
  const previous = useRef(value)
  const [direction, setDirection] = useState<"up" | "down" | null>(null)

  useEffect(() => {
    if (value === previous.current) return
    setDirection(value > previous.current ? "up" : "down")
    previous.current = value
    const timer = window.setTimeout(() => setDirection(null), hold)
    return () => window.clearTimeout(timer)
  }, [value, hold])

  return direction
}

interface ValueFlashProps {
  /** The number to watch. A change of identity, not of render, is what marks it. */
  value: number
  format?: (value: number) => string
  /** Prefixes the live-region announcement, so a screen reader hears which figure moved. */
  label: string
  hold?: number
  announceAfter?: number
  className?: string
}

export function ValueFlash({
  value,
  format = String,
  label,
  hold = 900,
  announceAfter = 700,
  className,
}: ValueFlashProps) {
  const reduced = useReducedMotion()
  const direction = useValueFlash(value, hold)
  const [announced, setAnnounced] = useState<string>("")

  useEffect(() => {
    const timer = window.setTimeout(
      () => setAnnounced(`${label} ${format(value)}`),
      announceAfter
    )
    return () => window.clearTimeout(timer)
  }, [value, label, format, announceAfter])

  const text = format(value)

  return (
    <span className={cn("relative inline-flex tabular-nums", className)}>
      {/* The box never moves: the outgoing digit is absolutely positioned. */}
      <span aria-hidden className="relative inline-flex overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={text}
            initial={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: direction === "down" ? -RISE : RISE }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: direction === "down" ? RISE : -RISE }
            }
            transition={{
              duration: reduced ? 0.12 : 0.26,
              ease: [0.23, 1, 0.32, 1],
            }}
            className={cn(
              "inline-block transition-colors",
              direction && !reduced && "text-primary"
            )}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {announced}
      </span>
    </span>
  )
}
