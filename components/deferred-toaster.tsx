"use client"

import { useEffect, useState } from "react"

type ToasterComponent = (typeof import("@/components/ui/sonner"))["Toaster"]

/**
 * Mounts the toast stack once the browser is idle. Toasts are never part of
 * the first paint, so sonner's bundle has no business on the critical path.
 * Plain import() rather than next/dynamic on purpose: next/dynamic registers
 * its chunks with the Flight renderer, which preloads them during the initial
 * page load — the exact critical-window download this component exists to
 * avoid. A dynamic import inside useEffect stays invisible to the server
 * render, so the chunk only fetches when the idle callback fires.
 */
export function DeferredToaster() {
  const [Toaster, setToaster] = useState<ToasterComponent | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = () => {
      void import("@/components/ui/sonner")
        .then((sonner) => {
          if (!cancelled) setToaster(() => sonner.Toaster)
        })
        .catch(() => {
          // Chunk load failed; leave the toast stack unmounted.
        })
    }
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: 1500 })
      return () => {
        cancelled = true
        window.cancelIdleCallback(id)
      }
    }
    const id = window.setTimeout(load, 500)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [])

  return Toaster ? <Toaster /> : null
}
