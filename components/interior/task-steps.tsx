"use client"

/**
 * TaskSteps — "The system narrates its work"
 *
 * Ported from https://www.interior.dev/docs/task-steps. API as documented:
 * steps / current / failed / label.
 *
 * Everything before `current` is done; at `steps.length` the run is complete.
 * `meta` is a right-aligned mono aside revealed when its step completes, which
 * gives a duration or a count somewhere to land without reflowing the row.
 */

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CheckIcon, CircleXIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TaskStep {
  id: string
  label: string
  meta?: string
}

interface TaskStepsProps {
  steps: readonly TaskStep[]
  /** Index of the step running now. Everything before it is done. */
  current: number
  failed?: boolean
  label?: string
  className?: string
}

export function TaskSteps({
  steps,
  current,
  failed = false,
  label = "Task progress",
  className,
}: TaskStepsProps) {
  const reduced = useReducedMotion()

  return (
    <ol
      aria-label={label}
      role="list"
      className={cn("flex flex-col gap-0.5", className)}
    >
      {steps.map((step, index) => {
        const isDone = index < current
        const isActive = index === current && !failed
        const isFailed = index === current && failed
        const isPending = index > current

        return (
          <li
            key={step.id}
            className="flex items-center gap-2.5 py-1"
            aria-current={isActive ? "step" : undefined}
          >
            <span
              aria-hidden
              className={cn(
                "grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors",
                isDone && "border-primary bg-primary text-primary-foreground",
                isActive && "border-primary",
                isFailed && "border-destructive bg-destructive text-background",
                isPending && "border-border"
              )}
            >
              {isDone ? (
                <motion.span
                  initial={reduced ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: reduced ? 0.1 : 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="flex"
                >
                  <CheckIcon className="size-3" strokeWidth={3} />
                </motion.span>
              ) : isFailed ? (
                <CircleXIcon className="size-3" strokeWidth={3} />
              ) : isActive ? (
                // The one moving part: the step that is running right now.
                <motion.span
                  className="size-[7px] rounded-full bg-primary"
                  animate={reduced ? { opacity: 1 } : { opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
            </span>

            <span
              className={cn(
                "flex-1 text-[13px] transition-colors",
                isPending && "text-muted-foreground",
                isFailed && "text-destructive",
                (isDone || isActive) && "text-foreground"
              )}
            >
              {step.label}
            </span>

            <AnimatePresence initial={false}>
              {isDone && step.meta ? (
                <motion.span
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0.1 : 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground"
                >
                  {step.meta}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </li>
        )
      })}
    </ol>
  )
}
