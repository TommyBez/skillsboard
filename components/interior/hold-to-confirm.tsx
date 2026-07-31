"use client"

/**
 * HoldToConfirm — "A guard rail in front of destructive actions"
 *
 * Ported from https://www.interior.dev/docs/hold-to-confirm. API as documented:
 * onConfirm / children / onAbort / confirmLabel / duration / resetAfter /
 * steps / releaseRate / disabled.
 *
 * A click never reaches onConfirm — only a hold that runs to full duration.
 * Releasing early rewinds faster than it filled (releaseRate), so an aborted
 * attempt reads as undone rather than paused.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface HoldToConfirmProps {
  /** Fires once, only when the hold reaches full duration. A click never reaches it. */
  onConfirm: () => void
  /** The resting label. It stays the button's accessible name in every state. */
  children: React.ReactNode
  onAbort?: () => void
  confirmLabel?: string
  duration?: number
  resetAfter?: number
  steps?: number
  releaseRate?: number
  disabled?: boolean
  className?: string
}

export function HoldToConfirm({
  onConfirm,
  children,
  onAbort,
  confirmLabel = "Confirmed",
  duration = 1800,
  resetAfter = 1600,
  steps = 20,
  releaseRate = 2.5,
  disabled = false,
  className,
}: HoldToConfirmProps) {
  const reduced = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const holding = useRef(false)
  const frame = useRef(0)
  const last = useRef(0)

  const stop = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = 0
  }, [])

  useEffect(() => stop, [stop])

  useEffect(() => {
    if (!confirmed) return
    const timer = window.setTimeout(() => {
      setConfirmed(false)
      setProgress(0)
    }, resetAfter)
    return () => window.clearTimeout(timer)
  }, [confirmed, resetAfter])

  const tick = useCallback(
    (now: number) => {
      const delta = now - last.current
      last.current = now
      setProgress((current) => {
        const rate = delta / duration
        const next = holding.current
          ? current + rate
          : current - rate * releaseRate

        if (next >= 1) {
          holding.current = false
          stop()
          setConfirmed(true)
          onConfirm()
          return 1
        }
        if (next <= 0) {
          stop()
          return 0
        }
        frame.current = requestAnimationFrame(tick)
        return next
      })
    },
    [duration, releaseRate, onConfirm, stop]
  )

  function start() {
    if (disabled || confirmed) return
    holding.current = true
    if (frame.current) return
    last.current = performance.now()
    frame.current = requestAnimationFrame(tick)
  }

  function release() {
    if (!holding.current) return
    holding.current = false
    onAbort?.()
    if (!frame.current) {
      last.current = performance.now()
      frame.current = requestAnimationFrame(tick)
    }
  }

  // Quantised so the fill reads as a set of stops rather than a smear.
  const quantised = Math.round(progress * steps) / steps

  return (
    <button
      type="button"
      disabled={disabled}
      aria-live="polite"
      onPointerDown={start}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault()
          start()
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") release()
      }}
      onContextMenu={(event) => event.preventDefault()}
      style={{ touchAction: "none", WebkitTapHighlightColor: "transparent" }}
      className={cn(
        "relative isolate inline-flex select-none items-center justify-center gap-2 overflow-hidden",
        "rounded-md border border-destructive/40 px-3 py-1.5 text-[13px] font-medium",
        "text-destructive outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-destructive/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        confirmed && "border-destructive text-destructive",
        className
      )}
    >
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 -z-10 bg-destructive/15"
        animate={{ width: `${quantised * 100}%` }}
        transition={
          reduced ? { duration: 0 } : { duration: 0.08, ease: "linear" }
        }
      />
      <span>{confirmed ? confirmLabel : children}</span>
    </button>
  )
}
