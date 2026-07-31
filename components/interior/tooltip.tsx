"use client"

/**
 * Tooltip / TooltipGroup — "Delayed once, instant after that"
 *
 * The timing model is from https://www.interior.dev/docs/tooltip-group. The
 * positioning, collision handling and dismissal come from Base UI, which this
 * app already depends on — the audit's verdict was to keep the audited
 * primitive and borrow only the shared-delay behaviour.
 *
 * The first tooltip in a group waits; while the group stays warm the next one
 * opens immediately, so scanning a toolbar does not mean waiting once per icon.
 */

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface TooltipGroupProps {
  children: React.ReactNode
  /** How long the first tooltip waits before opening. */
  delay?: number
  /** How long the group stays warm after one closes. */
  closeDelay?: number
}

export function TooltipGroup({
  children,
  delay = 600,
  closeDelay = 300,
}: TooltipGroupProps) {
  return (
    <TooltipPrimitive.Provider delay={delay} closeDelay={closeDelay}>
      {children}
    </TooltipPrimitive.Provider>
  )
}

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  side = "top",
  sideOffset = 6,
  className,
}: TooltipProps) {
  const reduced = useReducedMotion()

  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger render={children as React.ReactElement} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
          <TooltipPrimitive.Popup
            render={
              <motion.div
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: reduced ? 0.1 : 0.14,
                  ease: [0.23, 1, 0.32, 1],
                }}
              />
            }
            className={cn(
              "z-50 rounded-md bg-surface-ink px-2 py-1 text-[12px] font-medium text-surface-ink-foreground shadow-md",
              className
            )}
          >
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
