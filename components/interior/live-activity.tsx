"use client"

/**
 * LiveActivity — "The system's ongoing work, worn as a small object"
 *
 * Ported from https://www.interior.dev/docs/live-activity. API as documented:
 * activity / onDismiss / width / dismissLabel.
 *
 * Background work that outlives the click that started it needs somewhere to
 * live that is not a toast. The pill stays until the work resolves, then
 * settles into its terminal state before letting go.
 */

import { useEffect } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CheckIcon, CircleXIcon, Loader2Icon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Activity {
  id: string
  title: string
  detail?: string
  status: "pending" | "success" | "error"
}

interface LiveActivityProps {
  activity: Activity | null
  onDismiss: () => void
  width?: number
  dismissLabel?: string
  /** Auto-dismiss delay once the activity reaches a terminal state. */
  settleAfter?: number
  className?: string
}

export function LiveActivity({
  activity,
  onDismiss,
  width = 280,
  dismissLabel = "Dismiss",
  settleAfter = 2600,
  className,
}: LiveActivityProps) {
  const reduced = useReducedMotion()
  const settled = activity && activity.status !== "pending"

  useEffect(() => {
    if (!settled) return
    const timer = window.setTimeout(onDismiss, settleAfter)
    return () => window.clearTimeout(timer)
  }, [settled, settleAfter, onDismiss])

  return (
    <AnimatePresence>
      {activity ? (
        <motion.div
          key={activity.id}
          role="status"
          aria-live="polite"
          style={{ width }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
          transition={
            reduced
              ? { duration: 0.12 }
              : { type: "spring", stiffness: 460, damping: 38 }
          }
          className={cn(
            "pointer-events-auto flex items-center gap-2.5 rounded-full border border-border bg-popover px-3 py-2 shadow-lg",
            className
          )}
        >
          <span aria-hidden className="grid size-5 shrink-0 place-items-center">
            {activity.status === "pending" ? (
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            ) : activity.status === "success" ? (
              <motion.span
                initial={reduced ? false : { scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 620, damping: 24 }}
                className="grid size-4 place-items-center rounded-full bg-primary text-primary-foreground"
              >
                <CheckIcon className="size-2.5" strokeWidth={3.5} />
              </motion.span>
            ) : (
              <CircleXIcon className="size-4 text-destructive" />
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">
              {activity.title}
            </span>
            {activity.detail ? (
              <span className="block truncate text-[11px] text-muted-foreground">
                {activity.detail}
              </span>
            ) : null}
          </span>

          <button
            type="button"
            aria-label={dismissLabel}
            onClick={onDismiss}
            className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon className="size-3.5" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
