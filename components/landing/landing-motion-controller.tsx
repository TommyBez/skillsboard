"use client"

import { useLayoutEffect } from "react"

const VIEWPORT_THRESHOLD = 0.25
const PARALLAX_MAX = 1

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

/**
 * Progressive-enhancement orchestrator for the landing page. The page is
 * complete without it: routing diagrams render fully drawn and compositions
 * rest in their static state. With JS and full motion preferences, this
 * controller drives:
 *
 * - `data-scrolled` on the root (header command-strip background)
 * - `--route-progress` (hero dossiers converging from chaos into the stack)
 * - `--mcp-progress` (signal path drawing through the MCP chapter)
 * - `--px` / `--py` pointer parallax on the hero board (capped, pointer-fine)
 * - `data-page-hidden` (pauses ambient pulses when the tab is not visible)
 * - `data-motion-state` viewport reveals for below-the-fold groups
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

    const hero = root.querySelector<HTMLElement>("[data-hero-scene]")
    const mcp = root.querySelector<HTMLElement>("[data-mcp-chapter]")

    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY

      if (y > 12) {
        root.dataset.scrolled = "true"
      } else {
        delete root.dataset.scrolled
      }

      if (reducedMotion) {
        return
      }

      if (hero) {
        const height = hero.offsetHeight || 1
        const progress = clamp01(y / (height * 0.5))
        root.style.setProperty("--route-progress", progress.toFixed(4))
      }

      if (mcp) {
        const rect = mcp.getBoundingClientRect()
        const span = mcp.offsetHeight - window.innerHeight
        const progress =
          span > 80
            ? clamp01(-rect.top / span)
            : rect.top < window.innerHeight * 0.5
              ? 1
              : 0
        root.style.setProperty("--mcp-progress", progress.toFixed(4))
      }
    }

    const requestUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update)
      }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    update()
    cleanups.push(() => {
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
    })

    const onVisibility = () => {
      if (document.hidden) {
        root.dataset.pageHidden = "true"
      } else {
        delete root.dataset.pageHidden
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    onVisibility()
    cleanups.push(() =>
      document.removeEventListener("visibilitychange", onVisibility)
    )

    // Pause the hero's ambient routing pulse once the hero leaves the viewport.
    if (hero && "IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            delete root.dataset.heroOffscreen
          } else {
            root.dataset.heroOffscreen = "true"
          }
        })
      })
      heroObserver.observe(hero)
      cleanups.push(() => {
        heroObserver.disconnect()
        delete root.dataset.heroOffscreen
      })
    }

    if (!reducedMotion && "IntersectionObserver" in window) {
      const groups = Array.from(
        root.querySelectorAll<HTMLElement>("[data-motion-group]")
      )

      groups.forEach((group) => {
        group.dataset.motionState = "pending"
      })
      root.dataset.motionEnabled = "true"

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              !entry.isIntersecting ||
              entry.intersectionRatio < VIEWPORT_THRESHOLD
            ) {
              return
            }

            const group = entry.target as HTMLElement
            group.dataset.motionState = "visible"
            observer.unobserve(group)
          })
        },
        {
          threshold: VIEWPORT_THRESHOLD,
          rootMargin: "0px 0px -8% 0px",
        }
      )

      groups.forEach((group) => observer.observe(group))
      cleanups.push(() => {
        observer.disconnect()
        groups.forEach((group) => group.removeAttribute("data-motion-state"))
        root.removeAttribute("data-motion-enabled")
      })

      // Pointer parallax on the hero board: a few pixels of depth at most,
      // pointer-fine only, smoothed by a CSS transition on the card layer.
      const board = root.querySelector<HTMLElement>("[data-hero-board]")
      const finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
      ).matches

      if (hero && board && finePointer) {
        const onPointerMove = (event: PointerEvent) => {
          const rect = board.getBoundingClientRect()
          const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2
          const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2
          board.style.setProperty(
            "--px",
            Math.max(-PARALLAX_MAX, Math.min(PARALLAX_MAX, nx)).toFixed(3)
          )
          board.style.setProperty(
            "--py",
            Math.max(-PARALLAX_MAX, Math.min(PARALLAX_MAX, ny)).toFixed(3)
          )
        }
        const onPointerLeave = () => {
          board.style.setProperty("--px", "0")
          board.style.setProperty("--py", "0")
        }

        hero.addEventListener("pointermove", onPointerMove, { passive: true })
        hero.addEventListener("pointerleave", onPointerLeave)
        cleanups.push(() => {
          hero.removeEventListener("pointermove", onPointerMove)
          hero.removeEventListener("pointerleave", onPointerLeave)
        })
      }
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup())
      delete root.dataset.scrolled
      delete root.dataset.pageHidden
      root.style.removeProperty("--route-progress")
      root.style.removeProperty("--mcp-progress")
    }
  }, [])

  return null
}
