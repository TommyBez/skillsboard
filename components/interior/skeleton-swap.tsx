"use client"

/**
 * SkeletonSwap — "Skeleton to content with zero layout shift"
 *
 * Ported from https://www.interior.dev/docs/skeleton-swap. API as documented.
 *
 * Two timings carry the whole idea:
 *   delay      — do not show a skeleton for a response that beats the eye.
 *   minVisible — once shown, do not flash it away.
 * `reserve` holds the box across the swap so the exchange costs no layout shift.
 */

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { cn } from "@/lib/utils"

interface SkeletonSwapProps {
  /** Flips to true when the real content is available. Everything else is timing around this one value. */
  ready: boolean
  /** The real content. Mount it only once the data exists; the component holds the box either way. */
  children: React.ReactNode
  lines?: number
  lineHeight?: number
  barHeight?: number
  reserve?: number
  delay?: number
  minVisible?: number
  label?: string
  skeleton?: React.ReactNode
  className?: string
}

export function SkeletonSwap({
  ready,
  children,
  lines = 3,
  lineHeight = 21,
  barHeight = 9,
  reserve,
  delay = 120,
  minVisible = 380,
  label,
  skeleton,
  className,
}: SkeletonSwapProps) {
  const reduced = useReducedMotion()
  const [showSkeleton, setShowSkeleton] = useState(false)
  const shownAt = useRef<number | null>(null)
  const [settled, setSettled] = useState(ready)

  // Arm the skeleton only if the wait outlasts `delay`.
  useEffect(() => {
    if (ready) return
    setSettled(false)
    const timer = window.setTimeout(() => {
      shownAt.current = performance.now()
      setShowSkeleton(true)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [ready, delay])

  // Once shown, keep it up for at least `minVisible` so it never flashes.
  useEffect(() => {
    if (!ready) return
    if (!showSkeleton) {
      setSettled(true)
      return
    }
    const elapsed = shownAt.current ? performance.now() - shownAt.current : 0
    const remaining = Math.max(0, minVisible - elapsed)
    const timer = window.setTimeout(() => {
      setShowSkeleton(false)
      shownAt.current = null
      setSettled(true)
    }, remaining)
    return () => window.clearTimeout(timer)
  }, [ready, showSkeleton, minVisible])

  const reservedHeight = reserve ?? lines * lineHeight
  const showing = !settled

  return (
    <div
      className={cn("relative", className)}
      style={showing ? { minHeight: reservedHeight } : undefined}
    >
      <AnimatePresence initial={false} mode="wait">
        {showing ? (
          <m.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: showSkeleton ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.08 : 0.16, ease: [0.23, 1, 0.32, 1] }}
            aria-hidden={!label}
            aria-label={label}
            role={label ? "status" : undefined}
          >
            {skeleton ?? (
              <div className="flex flex-col" style={{ gap: lineHeight - barHeight }}>
                {Array.from({ length: lines }, (_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-full bg-muted"
                    style={{
                      height: barHeight,
                      // The last line stops short, the way a paragraph does.
                      width: index === lines - 1 ? "62%" : "100%",
                    }}
                  />
                ))}
              </div>
            )}
          </m.div>
        ) : (
          <m.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0.08 : 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
