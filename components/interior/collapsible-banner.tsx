"use client"

/**
 * CollapsibleBanner — "Folds to its title, or lets go entirely"
 *
 * Ported from https://www.interior.dev/docs/collapsible-banner. API as
 * documented: title / description / children / action / icon / dismissible /
 * state / defaultState / onStateChange / onDismiss / dismissedMessage.
 *
 * Three states, not two: expanded, folded to its title, and gone. Folding is
 * the middle ground a prompt needs when it is still relevant but no longer
 * worth the room.
 */

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type BannerState = "expanded" | "collapsed" | "dismissed"

interface CollapsibleBannerProps {
  title: string
  description?: string
  children?: React.ReactNode
  action?: React.ReactNode
  icon?: React.ReactNode
  dismissible?: boolean
  state?: BannerState
  defaultState?: BannerState
  onStateChange?: (state: BannerState) => void
  onDismiss?: () => void
  dismissedMessage?: string
  className?: string
}

export function CollapsibleBanner({
  title,
  description,
  children,
  action,
  icon,
  dismissible = true,
  state,
  defaultState = "expanded",
  onStateChange,
  onDismiss,
  dismissedMessage,
  className,
}: CollapsibleBannerProps) {
  const reduced = useReducedMotion()
  const [uncontrolled, setUncontrolled] = useState<BannerState>(defaultState)
  const current = state ?? uncontrolled

  function move(next: BannerState) {
    if (state === undefined) setUncontrolled(next)
    onStateChange?.(next)
    if (next === "dismissed") onDismiss?.()
  }

  if (current === "dismissed") {
    return dismissedMessage ? (
      <p role="status" className="text-[12px] text-muted-foreground">
        {dismissedMessage}
      </p>
    ) : null
  }

  const isExpanded = current === "expanded"

  return (
    <motion.aside
      layout={!reduced}
      transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
    >
      <div className="flex items-start gap-2.5 p-3">
        {icon ? <span className="mt-px shrink-0">{icon}</span> : null}

        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => move(isExpanded ? "collapsed" : "expanded")}
          className="flex flex-1 items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <span className="flex-1 text-sm font-medium">{title}</span>
          <motion.span
            aria-hidden
            className="flex shrink-0 text-muted-foreground"
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <ChevronDownIcon className="size-3.5" />
          </motion.span>
        </button>

        {dismissible ? (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => move("dismissed")}
            className="grid size-5 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon className="size-3.5" />
          </button>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            key="body"
            initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0.1 } : { duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 px-3 pb-3">
              {description ? (
                <p className="text-[13px] text-muted-foreground">{description}</p>
              ) : null}
              {children}
              {action}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.aside>
  )
}
