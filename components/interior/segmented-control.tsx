"use client"

/**
 * SegmentedControl — "Thumb slides, label inverts through it"
 *
 * Ported from https://www.interior.dev/docs/segmented-control. API as
 * documented: options / label / value / defaultValue / onValueChange.
 *
 * `label` is required, because an unlabelled group of radios announces nothing
 * about what it switches. Segments are equal width, sized to the widest label,
 * so the thumb travels a fixed grid and the row never reflows on selection.
 */

import { useId, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export interface SegmentedOption {
  value: string
  label: string
  disabled?: boolean
}

interface SegmentedControlProps {
  options: readonly SegmentedOption[]
  /** Accessible name for the radiogroup. Required. */
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function SegmentedControl({
  options,
  label,
  value,
  defaultValue,
  onValueChange,
  className,
}: SegmentedControlProps) {
  const reduced = useReducedMotion()
  const groupId = useId()
  const [uncontrolled, setUncontrolled] = useState(
    defaultValue ?? options[0]?.value ?? ""
  )
  const selected = value ?? uncontrolled

  function select(next: string) {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown"
    const backward = event.key === "ArrowLeft" || event.key === "ArrowUp"
    if (!forward && !backward) return
    event.preventDefault()
    const enabled = options.filter((option) => !option.disabled)
    const index = enabled.findIndex((option) => option.value === selected)
    const next =
      enabled[(index + (forward ? 1 : -1) + enabled.length) % enabled.length]
    if (next) select(next.value)
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-grid auto-cols-fr grid-flow-col gap-0.5 rounded-lg border border-border bg-muted/60 p-0.5",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === selected
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={option.disabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => select(option.value)}
            className={cn(
              "relative isolate rounded-[calc(var(--radius)*0.55)] px-3 py-1.5 text-center text-[13px] font-medium",
              "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isSelected
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isSelected ? (
              <motion.span
                layoutId={`segmented-${groupId}`}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-[calc(var(--radius)*0.55)] bg-primary"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 520, damping: 44, mass: 0.7 }
                }
              />
            ) : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
