"use client"

/**
 * IconMorph — "Play/pause, menu/close as one mechanism"
 *
 * Ported from https://www.interior.dev/docs/icon-morph. API kept close to the
 * documented shape: preset / shapes / mode / labels / active / defaultActive /
 * semantics / showLabel / size / strokeWidth.
 *
 * Two icons that mean two halves of one toggle should share a control, not
 * replace each other. The outgoing glyph rotates out as the incoming rotates
 * in, so the swap reads as one mechanism turning over.
 */

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface IconMorphProps {
  /** The two glyphs, inactive first. */
  shapes: readonly [React.ReactNode, React.ReactNode]
  /** Accessible names for each state, inactive first. */
  labels: readonly [string, string]
  mode?: "toggle" | "display"
  active?: boolean
  defaultActive?: boolean
  onActiveChange?: (active: boolean) => void
  /** "button" announces a control; "status" announces a state. */
  semantics?: "button" | "status"
  showLabel?: boolean
  size?: number
  disabled?: boolean
  className?: string
}

export function IconMorph({
  shapes,
  labels,
  mode = "toggle",
  active,
  defaultActive = false,
  onActiveChange,
  semantics = "button",
  showLabel = false,
  size = 34,
  disabled = false,
  className,
}: IconMorphProps) {
  const reduced = useReducedMotion()
  const [uncontrolled, setUncontrolled] = useState(defaultActive)
  const isActive = active ?? uncontrolled
  const label = labels[isActive ? 1 : 0]

  function toggle() {
    if (mode !== "toggle" || disabled) return
    const next = !isActive
    if (active === undefined) setUncontrolled(next)
    onActiveChange?.(next)
  }

  const glyph = (
    <span className="relative grid place-items-center" style={{ width: size, height: size }}>
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={isActive ? "on" : "off"}
          initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: -70, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: 70, scale: 0.7 }}
          transition={{
            duration: reduced ? 0.1 : 0.2,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="absolute grid place-items-center"
        >
          {shapes[isActive ? 1 : 0]}
        </motion.span>
      </AnimatePresence>
    </span>
  )

  if (mode === "display") {
    return (
      <span
        role={semantics === "status" ? "status" : undefined}
        aria-label={label}
        className={cn("inline-flex items-center gap-1.5", className)}
      >
        {glyph}
        {showLabel ? <span className="text-[13px]">{label}</span> : null}
      </span>
    )
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={isActive}
      aria-label={showLabel ? undefined : label}
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md outline-none transition-colors",
        "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {glyph}
      {showLabel ? <span className="pr-2 text-[13px]">{label}</span> : null}
    </button>
  )
}
