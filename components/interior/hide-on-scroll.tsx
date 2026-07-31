"use client"

/**
 * HideOnScroll — "Toolbar yields to the content"
 *
 * Ported from https://www.interior.dev/docs/hide-on-scroll. API as documented:
 * bar / children / barHeight / hideAfter / revealAfter / topGuard / pinned /
 * maxHeight / label / onHiddenChange.
 *
 * Direction alone is too twitchy: the bar only yields after `hideAfter` px of
 * sustained downward travel, and comes back after `revealAfter` px upward.
 * Inside `topGuard` of the start it is always shown.
 */

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { cn } from "@/lib/utils"

interface HideOnScrollProps {
  /** The bar that yields. Rendered fixed to the bottom of the viewport. */
  bar: React.ReactNode
  children?: React.ReactNode
  barHeight?: number
  hideAfter?: number
  revealAfter?: number
  topGuard?: number
  pinned?: boolean
  label?: string
  onHiddenChange?: (hidden: boolean) => void
  className?: string
}

export function HideOnScroll({
  bar,
  children,
  barHeight = 56,
  hideAfter = 64,
  revealAfter = 24,
  topGuard = 80,
  pinned = false,
  label,
  onHiddenChange,
  className,
}: HideOnScrollProps) {
  const reduced = useReducedMotion()
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const travel = useRef(0)

  useEffect(() => {
    if (pinned) {
      setHidden(false)
      return
    }
    let frame = 0

    const measure = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY.current
      lastY.current = y

      if (y < topGuard) {
        travel.current = 0
        setHidden(false)
        return
      }
      // Accumulate travel in one direction; a reversal resets the tally.
      if ((travel.current > 0) !== (delta > 0)) travel.current = 0
      travel.current += delta

      if (travel.current > hideAfter) setHidden(true)
      else if (travel.current < -revealAfter) setHidden(false)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    lastY.current = window.scrollY
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
    }
  }, [pinned, hideAfter, revealAfter, topGuard])

  useEffect(() => {
    onHiddenChange?.(hidden)
  }, [hidden, onHiddenChange])

  return (
    <>
      {children}
      <m.div
        aria-label={label}
        aria-hidden={hidden || undefined}
        initial={false}
        animate={{ y: hidden && !reduced ? barHeight : 0, opacity: hidden ? 0 : 1 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.24, ease: [0.32, 0.72, 0, 1] }
        }
        style={{ pointerEvents: hidden ? "none" : undefined }}
        className={cn("fixed inset-x-0 bottom-0 z-30", className)}
      >
        {bar}
      </m.div>
    </>
  )
}
