"use client"

import { useLayoutEffect } from "react"

/** The one reveal on the page: §7.5 of refs/direction.md, values from §7.2. */
const REVEAL_DURATION = 420
const REVEAL_EASING = "cubic-bezier(0.23, 1, 0.32, 1)"
const REVEAL_OFFSET = "10px"
const REVEAL_STAGGER = 80
/** Cap the cascade so a long section never turns into slow motion. */
const REVEAL_STAGGER_MAX = 300

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function isElement(node: Element): node is HTMLElement {
  return node instanceof HTMLElement
}

/**
 * Progressive-enhancement orchestrator for the landing page. The page is
 * finished without it — every section renders complete at zero scroll with
 * JavaScript off — so this file may only add, never complete. It drives:
 *
 * - `data-scrolled` on the root (header fill and hairline)
 * - `--scroll-progress` (the 1px header progress hairline)
 * - one-shot entrance reveals for elements marked `data-reveal`
 *
 * It deliberately drives no hover, focus or press state. Those live in CSS,
 * where reversing a 160ms transition mid-flight costs proportionally less than
 * 160ms instead of snapping — measured on the reference at 91.66ms out of
 * 200ms (refs/motion-spec.md §5).
 */
export function LandingMotionController() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(
      "[data-landing-motion-root]"
    )

    if (!root) {
      return
    }

    const cleanups: Array<() => void> = []
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY

      if (y > 12) {
        root.dataset.scrolled = "true"
      } else {
        delete root.dataset.scrolled
      }

      // The progress hairline stays in the document under reduced motion, it
      // simply never moves (§7.7).
      if (reducedMotion) {
        return
      }

      const scrollSpan =
        document.documentElement.scrollHeight - window.innerHeight
      root.style.setProperty(
        "--scroll-progress",
        scrollSpan > 0 ? clamp01(y / scrollSpan).toFixed(4) : "0"
      )
    }

    const requestUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update)
      }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    cleanups.push(() => {
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
    })

    update()

    if (reducedMotion || !("IntersectionObserver" in window)) {
      return () => {
        cleanups.forEach((cleanup) => cleanup())
        delete root.dataset.scrolled
        root.style.removeProperty("--scroll-progress")
      }
    }

    /* -----------------------------------------------------------------
       Scroll reveal. Opt in with `data-reveal` on the element that should
       enter, or `data-reveal="children"` on a parent to stagger its direct
       children. Fires once per element, ever.
    ----------------------------------------------------------------- */

    const pending = new Set<HTMLElement>()
    const running = new Set<Animation>()

    const settle = (el: HTMLElement) => {
      // Strip everything we added, including will-change — most reveal
      // implementations leave compositor layers pinned on every node they
      // ever touched. Suppress the element's own transition across the swap
      // so removing the inline values cannot itself animate, then hand it
      // back a frame later.
      const ownTransition = el.style.transition
      el.style.transition = "none"
      el.style.removeProperty("opacity")
      el.style.removeProperty("transform")
      el.style.removeProperty("will-change")
      el.dataset.rvDone = "1"
      window.requestAnimationFrame(() => {
        el.style.transition = ownTransition
      })
    }

    const play = (el: HTMLElement, delay: number) => {
      pending.delete(el)
      el.style.willChange = "opacity, transform"

      const animation = el.animate(
        [
          { opacity: "0", transform: `translateY(${REVEAL_OFFSET})` },
          { opacity: "1", transform: "translateY(0)" },
        ],
        {
          duration: REVEAL_DURATION,
          delay,
          easing: REVEAL_EASING,
          fill: "both",
        }
      )

      running.add(animation)
      animation.onfinish = () => {
        running.delete(animation)
        settle(el)
        // The filled end state and the resting state are identical, so
        // dropping the animation here is invisible.
        animation.cancel()
      }
    }

    const targetsOf = (host: HTMLElement) =>
      host.dataset.reveal === "children" || "motionGroup" in host.dataset
        ? Array.from(host.children).filter(isElement)
        : [host]

    const hosts = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal], [data-motion-group]")
    )
    const targets = new Map<HTMLElement, HTMLElement[]>()

    hosts.forEach((host) => {
      const children = targetsOf(host)
      targets.set(host, children)
      children.forEach((el) => {
        pending.add(el)
        el.style.opacity = "0"
        el.style.transform = `translateY(${REVEAL_OFFSET})`
      })
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }
          const host = entry.target as HTMLElement
          observer.unobserve(host)
          targets.get(host)?.forEach((el, index) => {
            play(el, Math.min(index * REVEAL_STAGGER, REVEAL_STAGGER_MAX))
          })
        })
      },
      { threshold: 0, rootMargin: "0px 0px -5% 0px" }
    )

    hosts.forEach((host) => observer.observe(host))

    // Tab away mid-reveal and come back to a settled page rather than a
    // queue that replays itself.
    const onVisibility = () => {
      running.forEach((animation) => animation.finish())
    }
    document.addEventListener("visibilitychange", onVisibility)

    cleanups.push(() => {
      document.removeEventListener("visibilitychange", onVisibility)
      observer.disconnect()
      running.forEach((animation) => animation.cancel())
      running.clear()
      pending.forEach((el) => {
        el.style.removeProperty("opacity")
        el.style.removeProperty("transform")
        el.style.removeProperty("will-change")
      })
      pending.clear()
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
      delete root.dataset.scrolled
      root.style.removeProperty("--scroll-progress")
    }
  }, [])

  return null
}
