"use client"

/**
 * LoadMore — "Sentinel that loads before you hit the end"
 *
 * Ported from https://www.interior.dev/docs/load-more. API as documented:
 * onLoad / hasMore / auto / rootRef / rootMargin / maxAutoLoads / steps /
 * expected / labels / onError.
 *
 * `maxAutoLoads` is the part this app's existing sentinel is missing: after N
 * automatic pages the component hands control back to a real button, so a
 * bottomless list cannot keep fetching while someone scrolls past it.
 */

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadMoreLabels {
  idle?: string
  pending?: string
  error?: string
  done?: string
}

interface LoadMoreProps {
  onLoad: () => Promise<unknown> | unknown
  hasMore: boolean
  auto?: boolean
  rootRef?: React.RefObject<HTMLElement | null>
  rootMargin?: string
  maxAutoLoads?: number
  expected?: number
  labels?: LoadMoreLabels
  onError?: (error: unknown) => void
  className?: string
}

export function LoadMore({
  onLoad,
  hasMore,
  auto = true,
  rootRef,
  rootMargin = "320px 0px",
  maxAutoLoads = 4,
  expected,
  labels,
  onError,
  className,
}: LoadMoreProps) {
  const reduced = useReducedMotion()
  const sentinel = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<"idle" | "pending" | "error">("idle")
  const [autoLoads, setAutoLoads] = useState(0)
  const running = useRef(false)

  const text = {
    idle: labels?.idle ?? "Load more",
    pending: labels?.pending ?? "Loading",
    error: labels?.error ?? "Try again",
    done: labels?.done ?? "That's everything",
  }

  async function run(fromSentinel: boolean) {
    if (running.current || !hasMore) return
    running.current = true
    setState("pending")
    try {
      await onLoad()
      setState("idle")
      if (fromSentinel) setAutoLoads((count) => count + 1)
    } catch (error) {
      setState("error")
      onError?.(error)
    } finally {
      running.current = false
    }
  }

  const autoArmed = auto && autoLoads < maxAutoLoads && state !== "error"

  useEffect(() => {
    if (!autoArmed || !hasMore) return
    const node = sentinel.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void run(true)
      },
      { root: rootRef?.current ?? null, rootMargin }
    )
    observer.observe(node)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoArmed, hasMore, rootMargin, rootRef])

  if (!hasMore) {
    return (
      <p role="status" className={cn("py-4 text-center text-[12px] text-muted-foreground", className)}>
        {text.done}
      </p>
    )
  }

  return (
    <div className={cn("flex flex-col items-center gap-2 py-4", className)}>
      <div ref={sentinel} aria-hidden className="h-px w-full" />

      {state === "pending" && autoArmed ? (
        <motion.span
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground"
          role="status"
        >
          <Loader2Icon className="size-3.5 animate-spin" />
          {text.pending}
          {expected ? ` ${expected} more` : null}
        </motion.span>
      ) : (
        <button
          type="button"
          disabled={state === "pending"}
          onClick={() => void run(false)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium outline-none transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
            state === "error"
              ? "border-destructive/40 text-destructive"
              : "border-border hover:bg-muted"
          )}
        >
          {state === "pending" ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : null}
          {state === "pending" ? text.pending : state === "error" ? text.error : text.idle}
        </button>
      )}
    </div>
  )
}
