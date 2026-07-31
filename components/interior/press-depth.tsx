"use client"

/**
 * PressDepth — "The feeling that the press landed"
 *
 * Ported from https://www.interior.dev/docs/press-depth. Exposes both the
 * wrapper component and the `usePressDepth` hook, as documented.
 *
 * The press goes down fast and comes back slower — that asymmetry is what
 * reads as a physical button rather than a scaling rectangle. Keyboard
 * activation routes through the same visual state as pointer activation.
 */

import { useCallback, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export function usePressDepth() {
  const [pressed, setPressed] = useState(false)

  const down = useCallback(() => setPressed(true), [])
  const up = useCallback(() => setPressed(false), [])

  return {
    pressed,
    bind: {
      onPointerDown: down,
      onPointerUp: up,
      onPointerLeave: up,
      onPointerCancel: up,
      onKeyDown: (event: React.KeyboardEvent) => {
        if (event.key === " " || event.key === "Enter") down()
      },
      onKeyUp: (event: React.KeyboardEvent) => {
        if (event.key === " " || event.key === "Enter") up()
      },
      onBlur: up,
    },
  }
}

interface PressDepthProps {
  children: React.ReactNode
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  className?: string
}

export function PressDepth({
  children,
  disabled = false,
  type = "button",
  onClick,
  className,
}: PressDepthProps) {
  const reduced = useReducedMotion()
  const { pressed, bind } = usePressDepth()

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      {...bind}
      animate={{ scale: pressed && !disabled && !reduced ? 0.97 : 1 }}
      transition={
        reduced
          ? { duration: 0 }
          : pressed
            ? { duration: 0.08, ease: "easeOut" }
            : { type: "spring", stiffness: 620, damping: 26 }
      }
      style={{ WebkitTapHighlightColor: "transparent" }}
      className={cn("select-none outline-none", className)}
    >
      {children}
    </motion.button>
  )
}
