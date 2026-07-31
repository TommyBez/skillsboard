"use client"

/**
 * ShowMore — "Height animates, text does not reflow"
 *
 * Ported from https://www.interior.dev/docs/show-more. API as documented:
 * children / lines / maxHeight / expanded / defaultExpanded / moreLabel / label.
 *
 * The clamp is released before the measure, so the text never re-wraps mid
 * animation — only the container's height moves.
 */

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShowMoreProps {
  children: React.ReactNode
  lines?: number
  maxHeight?: number
  expanded?: boolean
  defaultExpanded?: boolean
  moreLabel?: string
  lessLabel?: string
  label?: string
  className?: string
}

export function ShowMore({
  children,
  lines = 3,
  maxHeight,
  expanded,
  defaultExpanded = false,
  moreLabel = "Show more",
  lessLabel = "Show less",
  label = "Show more",
  className,
}: ShowMoreProps) {
  const reduced = useReducedMotion()
  const contentRef = useRef<HTMLDivElement>(null)
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded)
  const isOpen = expanded ?? uncontrolled
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null)
  const [fullHeight, setFullHeight] = useState<number | null>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const element = contentRef.current
    if (!element) return

    const measure = () => {
      const style = getComputedStyle(element)
      const lineHeight = Number.parseFloat(style.lineHeight) || 20
      const clamp = maxHeight ?? lines * lineHeight
      const natural = element.scrollHeight
      setCollapsedHeight(clamp)
      setFullHeight(natural)
      setOverflows(natural > clamp + 1)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [lines, maxHeight, children])

  const height = isOpen ? fullHeight : collapsedHeight

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <motion.div
        className="relative w-full overflow-hidden"
        animate={height === null ? undefined : { height }}
        initial={false}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.26, ease: [0.23, 1, 0.32, 1] }
        }
      >
        <div ref={contentRef}>{children}</div>
        {/* The fade only exists while there is something hidden behind it. */}
        {overflows && !isOpen ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-card to-transparent"
          />
        ) : null}
      </motion.div>

      {overflows ? (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={label}
          onClick={() => {
            if (expanded === undefined) setUncontrolled((open) => !open)
          }}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {isOpen ? lessLabel : moreLabel}
          <motion.span
            aria-hidden
            className="flex"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <ChevronDownIcon className="size-3" />
          </motion.span>
        </button>
      ) : null}
    </div>
  )
}
