"use client"

/**
 * WizardSteps — "Transition knows forward from back"
 *
 * Ported from https://www.interior.dev/docs/wizard-steps. API as documented:
 * steps / index / defaultIndex / onComplete / height / backLabel / nextLabel /
 * label.
 *
 * The direction of travel is state, not a guess: going back reverses the
 * transition, so a mis-step reads as a retreat rather than more progress.
 */

import { useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export interface WizardStep {
  id: string
  label: string
  content: React.ReactNode
}

interface WizardStepsProps {
  steps: readonly WizardStep[]
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  onComplete?: () => void
  height?: number
  backLabel?: string
  nextLabel?: string
  label: string
  className?: string
}

export function WizardSteps({
  steps,
  index,
  defaultIndex = 0,
  onIndexChange,
  onComplete,
  height,
  backLabel = "Back",
  nextLabel = "Next",
  label,
  className,
}: WizardStepsProps) {
  const reduced = useReducedMotion()
  const [uncontrolled, setUncontrolled] = useState(defaultIndex)
  const current = index ?? uncontrolled
  const previous = useRef(current)
  const direction = current >= previous.current ? 1 : -1
  previous.current = current

  function go(next: number) {
    if (next < 0) return
    if (next >= steps.length) {
      onComplete?.()
      return
    }
    if (index === undefined) setUncontrolled(next)
    onIndexChange?.(next)
  }

  const offset = reduced ? 0 : 24

  return (
    <div className={cn("flex flex-col gap-4", className)} aria-label={label}>
      <ol className="flex items-center gap-1.5" aria-label={`${label} steps`}>
        {steps.map((step, stepIndex) => (
          <li key={step.id} className="flex flex-1 items-center gap-1.5">
            <motion.span
              aria-hidden
              className={cn(
                "h-[3px] flex-1 rounded-full",
                stepIndex <= current ? "bg-primary" : "bg-border"
              )}
              initial={false}
              animate={{ opacity: stepIndex <= current ? 1 : 1 }}
              transition={{ duration: reduced ? 0 : 0.24 }}
            />
            <span className="sr-only">
              {step.label}
              {stepIndex === current ? " (current)" : ""}
            </span>
          </li>
        ))}
      </ol>

      <div
        className="relative overflow-hidden"
        style={height ? { height } : undefined}
      >
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={steps[current]?.id ?? current}
            custom={direction}
            initial={{ opacity: 0, x: direction * offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -offset }}
            transition={{
              duration: reduced ? 0.1 : 0.24,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            {steps[current]?.content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={current === 0}
          onClick={() => go(current - 1)}
          className="rounded-md border border-border px-3 py-1.5 text-[13px] font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
        >
          {backLabel}
        </button>
        <button
          type="button"
          onClick={() => go(current + 1)}
          className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
