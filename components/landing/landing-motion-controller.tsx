"use client"

import { useLayoutEffect } from "react"

const VIEWPORT_THRESHOLD = 0.25

export function LandingMotionController() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(
      "[data-landing-motion-root]"
    )

    if (
      !root ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const groups = Array.from(
      root.querySelectorAll<HTMLElement>("[data-motion-group]")
    )

    if (groups.length === 0) {
      return
    }

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

    return () => {
      observer.disconnect()
      groups.forEach((group) => group.removeAttribute("data-motion-state"))
      root.removeAttribute("data-motion-enabled")
    }
  }, [])

  return null
}
