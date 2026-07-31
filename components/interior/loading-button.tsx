"use client"

/**
 * LoadingButton — "Label to state without layout shift"
 *
 * Ported from https://www.interior.dev/docs/loading-button. API as documented:
 * onAction / children / pendingLabel / successLabel / errorLabel / resetAfter /
 * disabled / onError.
 *
 * The button reserves the widest of its four labels up front, so the state
 * machine never resizes the control. Sync throws and rejected promises both
 * settle into the error state; anything else settles into success.
 */

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CheckIcon, CircleXIcon, Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

type ActionState = "idle" | "pending" | "success" | "error"

interface LoadingButtonProps {
  /** Runs on click. Rejections settle the button into its error state. */
  onAction: () => unknown
  children: string
  pendingLabel?: string
  successLabel?: string
  errorLabel?: string
  resetAfter?: number
  disabled?: boolean
  /** Receives the rejection. The button reports the state; reporting the error is the caller's job. */
  onError?: (error: unknown) => void
  className?: string
}

export function LoadingButton({
  onAction,
  children,
  pendingLabel,
  successLabel = "Done",
  errorLabel = "Try again",
  resetAfter = 1400,
  disabled = false,
  onError,
  className,
}: LoadingButtonProps) {
  const reduced = useReducedMotion()
  const [state, setState] = useState<ActionState>("idle")
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    if (state !== "success" && state !== "error") return
    const timer = window.setTimeout(() => setState("idle"), resetAfter)
    return () => window.clearTimeout(timer)
  }, [state, resetAfter])

  async function run() {
    if (state === "pending") return
    setState("pending")
    try {
      await onAction()
      if (alive.current) setState("success")
    } catch (error) {
      if (alive.current) setState("error")
      onError?.(error)
    }
  }

  const labels = [children, pendingLabel ?? children, successLabel, errorLabel]
  const label =
    state === "pending"
      ? pendingLabel ?? children
      : state === "success"
        ? successLabel
        : state === "error"
          ? errorLabel
          : children

  return (
    <button
      type="button"
      disabled={disabled || state === "pending"}
      aria-busy={state === "pending"}
      onClick={run}
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5",
        "text-[13px] font-medium outline-none transition-colors",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-70",
        state === "error" && "bg-destructive hover:bg-destructive",
        className
      )}
    >
      {/* Reserves the widest label so the control never resizes mid-flight. */}
      <span aria-hidden className="pointer-events-none invisible flex flex-col">
        {labels.map((entry, index) => (
          <span key={index} className="h-0 overflow-hidden whitespace-nowrap">
            {entry}
          </span>
        ))}
        <span className="whitespace-nowrap">
          {labels.reduce((a, b) => (b.length > a.length ? b : a))}
        </span>
      </span>

      <span className="absolute inset-0 flex items-center justify-center gap-1.5">
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={state}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -3 }}
            transition={{ duration: reduced ? 0.1 : 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            {state === "pending" ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : state === "success" ? (
              <CheckIcon className="size-3.5" strokeWidth={3} />
            ) : state === "error" ? (
              <CircleXIcon className="size-3.5" strokeWidth={2.5} />
            ) : null}
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  )
}
