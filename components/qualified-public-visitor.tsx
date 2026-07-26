"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import {
  qualifiedPublicVisitorDefinitionV1,
  resolvePublicLandingSurface,
} from "@/analytics/posthog/measurement-contract"
import { captureAnalyticsEvent } from "@/lib/analytics-client"

export function QualifiedPublicVisitor() {
  const pathname = usePathname()

  useEffect(() => {
    const definition = qualifiedPublicVisitorDefinitionV1
    const landingSurface = resolvePublicLandingSurface(pathname)
    if (window.location.hostname !== definition.productionHost || !landingSurface) return

    let remaining: number = definition.qualification.minimumVisibleMilliseconds
    let qualified = false
    let visibleSince = document.visibilityState === "visible" ? performance.now() : null
    let timeout: ReturnType<typeof setTimeout> | undefined

    const qualify = () => {
      if (qualified) return
      qualified = true
      timeout = undefined
      document.removeEventListener("visibilitychange", onVisibilityChange)
      captureAnalyticsEvent("qualified_public_visitor", {
        definition_version: definition.version,
        landing_surface: landingSurface,
        qualification_rule: "visible_15s",
      })
    }

    const schedule = () => {
      if (qualified || document.visibilityState !== "visible" || timeout) return
      visibleSince = performance.now()
      timeout = setTimeout(qualify, remaining)
    }

    const pause = () => {
      if (qualified) return
      if (visibleSince !== null) {
        remaining = Math.max(0, remaining - (performance.now() - visibleSince))
      }
      visibleSince = null
      if (timeout) clearTimeout(timeout)
      timeout = undefined
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") schedule()
      else pause()
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    schedule()
    return () => {
      pause()
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [pathname])

  return null
}
