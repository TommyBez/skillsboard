"use client"

import { useEffect } from "react"

/**
 * Closes the page frame at the bottom.
 *
 * The frame's vertical rails are drawn in the document (see `.frameRail`), so
 * their top end lands on the header rule by construction. Their bottom end
 * cannot: the rail is a child of the landing root, and the root ends *below*
 * the footer rule, so `bottom: 0` runs the rails past the corner they are
 * supposed to turn and out to the end of the page.
 *
 * This publishes the one number CSS cannot derive — the distance from the
 * bottom of the landing root to the top of the footer, which is exactly where
 * the footer rule sits — as `--lp-frame-end`. The rails subtract it and the
 * rectangle closes.
 *
 * It is layout, not motion: no scroll listener, no per-frame work. A
 * `ResizeObserver` on the root and the footer re-measures only when the page
 * actually changes height, and the write is coalesced into one animation
 * frame. Without script `--lp-frame-end` keeps its `0px` default, which is the
 * behaviour the page shipped with rather than a broken state.
 */
export function FrameExtent() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(
      "[data-landing-motion-root]",
    )
    const footer = root?.querySelector<HTMLElement>("footer")
    if (!root || !footer) return

    let frame = 0

    const measure = () => {
      frame = 0
      // `footer.offsetTop` is measured against the root, which is the nearest
      // positioned ancestor; `offsetHeight` is the root's border box. Both are
      // integers, so the rail's end lands on a whole pixel.
      const end = Math.max(0, root.offsetHeight - footer.offsetTop)
      root.style.setProperty("--lp-frame-end", `${end}px`)
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()

    const observer = new ResizeObserver(schedule)
    observer.observe(root)
    observer.observe(footer)
    window.addEventListener("resize", schedule)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", schedule)
      if (frame) cancelAnimationFrame(frame)
      root.style.removeProperty("--lp-frame-end")
    }
  }, [])

  return null
}
