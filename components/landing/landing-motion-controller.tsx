"use client"

import { useLayoutEffect } from "react"

const VIEWPORT_THRESHOLD = 0.25
const PARALLAX_MAX = 1

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

/** Scroll progress through a tall sticky chapter (same math as MCP). */
function chapterProgress(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const span = el.offsetHeight - window.innerHeight
  if (span > 80) {
    return clamp01(-rect.top / span)
  }
  return rect.top < window.innerHeight * 0.5 ? 1 : 0
}

/**
 * Progressive-enhancement orchestrator for the landing page. The page is
 * complete without it: routing diagrams render fully drawn and compositions
 * rest in their static state. With JS and full motion preferences, this
 * controller drives:
 *
 * - `data-scrolled` on the root (header command-strip background)
 * - `--route-progress` (hero sticky chapter: dossiers filing into the library)
 * - `--mcp-progress` (MCP sticky chapter: signal path drawing)
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

      const scrollSpan =
        document.documentElement.scrollHeight - window.innerHeight
      root.style.setProperty(
        "--scroll-progress",
        scrollSpan > 0 ? clamp01(y / scrollSpan).toFixed(4) : "0"
      )

      if (hero) {
        root.style.setProperty(
          "--route-progress",
          chapterProgress(hero).toFixed(4)
        )
      }

      if (mcp) {
        root.style.setProperty(
          "--mcp-progress",
          chapterProgress(mcp).toFixed(4)
        )
      }
    }

    const requestUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update)
      }
    }

    // Enable tall sticky chapters before the first progress measure so hero/MCP
    // heights include their scroll runways (otherwise progress clamps to 1).
    if (!reducedMotion) {
      root.dataset.motionEnabled = "true"
    }

    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    cleanups.push(() => {
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
      root.removeAttribute("data-motion-enabled")
    })

    // Measure after layout applies the motion-enabled chapter heights.
    requestAnimationFrame(() => {
      requestAnimationFrame(update)
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

    // Chapter rail: aria-current follows whichever chapter crosses the middle
    // of the viewport. Navigation state, not motion — runs regardless of the
    // reduced-motion preference.
    const railLinks = Array.from(
      root.querySelectorAll<HTMLElement>("[data-rail-link]")
    )
    const chapters = Array.from(
      root.querySelectorAll<HTMLElement>("[data-chapter-target]")
    )

    if (
      railLinks.length &&
      chapters.length &&
      "IntersectionObserver" in window
    ) {
      const setCurrentChapter = (name: string) => {
        railLinks.forEach((link) => {
          if (link.dataset.railLink === name) {
            link.setAttribute("aria-current", "true")
          } else {
            link.removeAttribute("aria-current")
          }
        })
      }

      const chapterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return
            }
            const target = entry.target as HTMLElement
            setCurrentChapter(target.dataset.chapterTarget ?? "")
          })
        },
        { rootMargin: "-46% 0px -46% 0px", threshold: 0 }
      )

      chapters.forEach((chapter) => chapterObserver.observe(chapter))
      cleanups.push(() => chapterObserver.disconnect())
    }

    if (!reducedMotion && "IntersectionObserver" in window) {
      const groups = Array.from(
        root.querySelectorAll<HTMLElement>("[data-motion-group]")
      )

      groups.forEach((group) => {
        group.dataset.motionState = "pending"
      })

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
      })

      // Decode effect: mono chapter marks scramble into place once, the
      // first time they enter the viewport. The SSR text is the final text,
      // so the page never depends on this running.
      const decodeTargets = Array.from(
        root.querySelectorAll<HTMLElement>("[data-decode]")
      )

      if (decodeTargets.length) {
        const DECODE_CHARS = "ABCDEFGHJKMNPQRSTVWXYZ0123456789#/<>*"
        const DECODE_DURATION = 620
        const decodeFrames = new Set<number>()
        const finalTexts = new Map<HTMLElement, string>()

        const runDecode = (el: HTMLElement) => {
          const finalText = finalTexts.get(el) ?? ""
          const start = performance.now()

          const step = (now: number) => {
            const p = clamp01((now - start) / DECODE_DURATION)
            const reveal = Math.floor(p * finalText.length)
            let out = finalText.slice(0, reveal)
            for (let i = reveal; i < finalText.length; i++) {
              out +=
                finalText[i] === " "
                  ? " "
                  : DECODE_CHARS[
                      Math.floor(Math.random() * DECODE_CHARS.length)
                    ]
            }
            el.textContent = p < 1 ? out : finalText
            if (p < 1) {
              decodeFrames.add(window.requestAnimationFrame(step))
            }
          }

          decodeFrames.add(window.requestAnimationFrame(step))
        }

        decodeTargets.forEach((el) => {
          finalTexts.set(el, el.textContent ?? "")
        })

        const decodeObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) {
                return
              }
              const el = entry.target as HTMLElement
              decodeObserver.unobserve(el)
              runDecode(el)
            })
          },
          { threshold: 0.5 }
        )

        decodeTargets.forEach((el) => decodeObserver.observe(el))
        cleanups.push(() => {
          decodeObserver.disconnect()
          decodeFrames.forEach((id) => window.cancelAnimationFrame(id))
          finalTexts.forEach((text, el) => {
            el.textContent = text
          })
        })
      }

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

      // Magnetic CTAs: primary actions lean a few pixels toward the pointer
      // while hovered, then settle back. Pointer-fine only, tightly capped.
      if (finePointer) {
        const magnets = Array.from(
          root.querySelectorAll<HTMLElement>("[data-magnetic]")
        )

        magnets.forEach((el) => {
          const onMagnetMove = (event: PointerEvent) => {
            const rect = el.getBoundingClientRect()
            const dx = event.clientX - (rect.left + rect.width / 2)
            const dy = event.clientY - (rect.top + rect.height / 2)
            el.style.setProperty(
              "--mx",
              Math.max(-6, Math.min(6, dx * 0.12)).toFixed(2)
            )
            el.style.setProperty(
              "--my",
              Math.max(-4, Math.min(4, dy * 0.2)).toFixed(2)
            )
          }
          const onMagnetLeave = () => {
            el.style.setProperty("--mx", "0")
            el.style.setProperty("--my", "0")
          }

          el.addEventListener("pointermove", onMagnetMove, { passive: true })
          el.addEventListener("pointerleave", onMagnetLeave)
          cleanups.push(() => {
            el.removeEventListener("pointermove", onMagnetMove)
            el.removeEventListener("pointerleave", onMagnetLeave)
            el.style.removeProperty("--mx")
            el.style.removeProperty("--my")
          })
        })
      }
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup())
      delete root.dataset.scrolled
      delete root.dataset.pageHidden
      root.style.removeProperty("--route-progress")
      root.style.removeProperty("--mcp-progress")
      root.style.removeProperty("--scroll-progress")
    }
  }, [])

  return null
}
