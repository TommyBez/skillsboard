"use client"

/**
 * ProgressBar — "Indeterminate handing over to determinate"
 *
 * Ported from https://www.interior.dev/docs/progress-bar. API as documented:
 * value / max / segments / ceiling / crawl / label / pendingLabel /
 * completeLabel.
 *
 * With no value the bar crawls toward `ceiling` and stops there, so it never
 * claims progress it does not have. The first real value takes over from
 * wherever the crawl reached rather than snapping back to zero.
 */

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  /** Omit for indeterminate. Providing it hands the bar over to real progress. */
  value?: number
  max?: number
  segments?: number
  ceiling?: number
  crawl?: number
  label: string
  pendingLabel?: string
  completeLabel?: string
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  segments,
  ceiling = 0.9,
  crawl = 2600,
  label,
  pendingLabel = "Working",
  completeLabel = "Complete",
  className,
}: ProgressBarProps) {
  const reduced = useReducedMotion()
  const [crawled, setCrawled] = useState(0)
  const isDeterminate = value !== undefined

  // The crawl decelerates toward the ceiling and never reaches it.
  useEffect(() => {
    if (isDeterminate) return
    const start = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      const elapsed = (now - start) / crawl
      setCrawled(ceiling * (1 - Math.exp(-elapsed * 2.2)))
      frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [isDeterminate, ceiling, crawl])

  const ratio = isDeterminate
    ? Math.min(1, Math.max(0, value / max))
    : crawled
  const complete = isDeterminate && ratio >= 1
  const percent = Math.round(ratio * 100)

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isDeterminate ? percent : undefined}
        aria-valuetext={isDeterminate ? `${percent}%` : pendingLabel}
        className="relative h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            complete ? "bg-primary" : "bg-primary/85"
          )}
          animate={{ width: `${ratio * 100}%` }}
          transition={
            reduced
              ? { duration: 0 }
              : isDeterminate
                ? { type: "spring", stiffness: 180, damping: 30 }
                : { duration: 0.1, ease: "linear" }
          }
        />
        {segments ? (
          <div aria-hidden className="absolute inset-0 flex">
            {Array.from({ length: segments - 1 }, (_, index) => (
              <span
                key={index}
                className="flex-1 border-r border-background/70"
              />
            ))}
            <span className="flex-1" />
          </div>
        ) : null}
      </div>
      <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {complete ? completeLabel : isDeterminate ? `${percent}%` : pendingLabel}
      </p>
    </div>
  )
}
