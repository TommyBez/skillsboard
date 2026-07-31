"use client"

/**
 * StickyHeader — "Condenses as you go down"
 *
 * Ported from https://www.interior.dev/docs/sticky-header. API as documented:
 * title / children / subtitle / leading / actions / expandedHeight /
 * compactHeight / maxHeight.
 *
 * The header interpolates between two fixed heights over the first
 * (expanded - compact) pixels of scroll, so the condense finishes early and
 * the rest of the page scrolls against a stable chrome.
 */

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface StickyHeaderProps {
  title: React.ReactNode
  children?: React.ReactNode
  subtitle?: React.ReactNode
  leading?: React.ReactNode
  actions?: React.ReactNode
  expandedHeight?: number
  compactHeight?: number
  className?: string
}

export function StickyHeader({
  title,
  children,
  subtitle,
  leading,
  actions,
  expandedHeight = 96,
  compactHeight = 56,
  className,
}: StickyHeaderProps) {
  const reduced = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const range = Math.max(1, expandedHeight - compactHeight)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      setProgress(Math.min(1, Math.max(0, window.scrollY / range)))
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
    }
  }, [range])

  const settled = reduced ? 0 : progress
  const height = expandedHeight - settled * range

  return (
    <motion.header
      data-compact={progress > 0.6 ? "" : undefined}
      style={{ height }}
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl",
        className
      )}
    >
      {leading}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <motion.div
          style={{
            // Type settles from display size down to a compact label.
            fontSize: `${18 - settled * 3}px`,
          }}
          className="truncate font-semibold leading-tight tracking-tight"
        >
          {title}
        </motion.div>
        {subtitle ? (
          <motion.div
            style={{ opacity: 1 - settled, height: settled >= 1 ? 0 : "auto" }}
            className="truncate text-[12px] text-muted-foreground"
          >
            {subtitle}
          </motion.div>
        ) : null}
      </div>
      {actions}
      {children}
    </motion.header>
  )
}
