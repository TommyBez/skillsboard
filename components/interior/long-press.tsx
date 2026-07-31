"use client"

/**
 * LongPress — "Intent confirmed by time, and cancelled by everything else"
 *
 * Ported from https://www.interior.dev/docs/long-press. Exposes the hook and
 * the button, as documented: onLongPress / duration / moveTolerance / haptic /
 * onCancel / disabled.
 *
 * A press that drifts past `moveTolerance` is a scroll, not an intent, so it
 * cancels. This is the touch counterpart to HoldToConfirm.
 */

import { useCallback, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface UseLongPressOptions {
  onLongPress: () => void
  duration?: number
  moveTolerance?: number
  haptic?: boolean
  onCancel?: () => void
  disabled?: boolean
}

export function useLongPress({
  onLongPress,
  duration = 550,
  moveTolerance = 10,
  haptic = true,
  onCancel,
  disabled = false,
}: UseLongPressOptions) {
  const timer = useRef(0)
  const origin = useRef<{ x: number; y: number } | null>(null)
  const [pressing, setPressing] = useState(false)

  const cancel = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = 0
    origin.current = null
    setPressing((was) => {
      if (was) onCancel?.()
      return false
    })
  }, [onCancel])

  const start = useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return
      origin.current = { x: event.clientX, y: event.clientY }
      setPressing(true)
      timer.current = window.setTimeout(() => {
        timer.current = 0
        setPressing(false)
        if (haptic && "vibrate" in navigator) navigator.vibrate?.(8)
        onLongPress()
      }, duration)
    },
    [disabled, duration, haptic, onLongPress]
  )

  const track = useCallback(
    (event: React.PointerEvent) => {
      if (!origin.current) return
      const dx = event.clientX - origin.current.x
      const dy = event.clientY - origin.current.y
      if (Math.hypot(dx, dy) > moveTolerance) cancel()
    },
    [cancel, moveTolerance]
  )

  return {
    pressing,
    bind: {
      onPointerDown: start,
      onPointerMove: track,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
    },
  }
}

interface LongPressButtonProps extends UseLongPressOptions {
  children: React.ReactNode
  className?: string
}

export function LongPressButton({
  children,
  className,
  ...options
}: LongPressButtonProps) {
  const reduced = useReducedMotion()
  const { pressing, bind } = useLongPress(options)

  return (
    <motion.button
      type="button"
      disabled={options.disabled}
      {...bind}
      animate={{ scale: pressing && !reduced ? 0.96 : 1 }}
      transition={
        reduced
          ? { duration: 0 }
          : pressing
            ? { duration: (options.duration ?? 550) / 1000, ease: "linear" }
            : { type: "spring", stiffness: 600, damping: 28 }
      }
      style={{ touchAction: "none", WebkitTapHighlightColor: "transparent" }}
      className={cn("select-none outline-none", className)}
    >
      {children}
    </motion.button>
  )
}
