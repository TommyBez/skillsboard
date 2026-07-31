"use client"

/**
 * ReadingProgress — "How much is left"
 *
 * Ported from https://www.interior.dev/docs/reading-progress. API as
 * documented: target / scroller / steps / words / wordsPerMinute / doneLabel.
 *
 * The bar reports traversal of the target element, not of the document, so a
 * long footer never reads as unread article.
 */

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface ReadingProgressProps {
  target: React.RefObject<HTMLElement | null>
  scroller?: React.RefObject<HTMLElement | null>
  /** Quantises the announced value so the live region does not narrate every pixel. */
  steps?: number
  words?: number
  wordsPerMinute?: number
  doneLabel?: string
  className?: string
}

export function ReadingProgress({
  target,
  scroller,
  steps = 10,
  words,
  wordsPerMinute = 220,
  doneLabel = "Done",
  className,
}: ReadingProgressProps) {
  const reduced = useReducedMotion()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const element = target.current
      if (!element) return
      const box = element.getBoundingClientRect()
      const viewport = scroller?.current
        ? scroller.current.getBoundingClientRect().height
        : window.innerHeight
      /* Measure the reading window, not the element's full travel across the
         viewport. 0 is the article's top at the top of the fold, 1 is its
         bottom at the bottom of the fold — so reaching the end of the text
         reads as finished. Dividing by height + viewport instead only hit 1
         once the article had scrolled entirely out of sight, which left the
         readout claiming unread minutes at the last paragraph.
         An article shorter than the fold is wholly visible, so it is done. */
      const scrollable = box.height - viewport
      const ratio = scrollable > 0 ? -box.top / scrollable : 1
      setProgress(Math.min(1, Math.max(0, ratio)))
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    const source: EventTarget = scroller?.current ?? window
    source.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      source.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [target, scroller])

  const quantised = Math.round(progress * steps) / steps
  const remainingWords = words ? Math.round(words * (1 - progress)) : null
  const minutesLeft =
    remainingWords === null ? null : Math.ceil(remainingWords / wordsPerMinute)

  const readout =
    minutesLeft === null
      ? `${Math.round(quantised * 100)}%`
      : minutesLeft <= 0
        ? doneLabel
        : `${minutesLeft} min left`

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(quantised * 100)}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: `${progress * 100}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.1, ease: "linear" }}
        />
      </div>
      {words ? (
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
          {readout}
        </span>
      ) : null}
    </div>
  )
}
