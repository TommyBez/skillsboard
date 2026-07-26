"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

import {
  qualifiedPublicVisitorDefinitionV1,
  resolvePublicLandingSurface,
} from "@/analytics/posthog/measurement-contract"
import { captureAnalyticsEvent } from "@/lib/analytics-client"

export function QualifiedPublicVisitor() {
  const pathname = usePathname()
  const qualified = useRef(false)
  const remaining = useRef<number>(
    qualifiedPublicVisitorDefinitionV1.qualification.minimumVisibleMilliseconds,
  )
  const firstEligibleSurface =
    useRef<ReturnType<typeof resolvePublicLandingSurface>>(null)
  const visibleSince = useRef<number | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const definition = qualifiedPublicVisitorDefinitionV1
    const landingSurface = resolvePublicLandingSurface(pathname)
    if (
      qualified.current ||
      window.location.hostname !== definition.productionHost ||
      !landingSurface
    ) {
      return
    }
    const measuredLandingSurface = firstEligibleSurface.current ?? landingSurface
    firstEligibleSurface.current = measuredLandingSurface

    const qualify = () => {
      if (qualified.current) return
      qualified.current = true
      timeout.current = undefined
      document.removeEventListener("visibilitychange", onVisibilityChange)
      captureAnalyticsEvent("qualified_public_visitor", {
        definition_version: definition.version,
        landing_surface: measuredLandingSurface,
        qualification_rule: "visible_15s",
      })
    }

    const schedule = () => {
      if (
        qualified.current ||
        document.visibilityState !== "visible" ||
        timeout.current
      ) {
        return
      }
      visibleSince.current = performance.now()
      timeout.current = setTimeout(qualify, remaining.current)
    }

    const pause = () => {
      if (qualified.current) return
      if (visibleSince.current !== null) {
        remaining.current = Math.max(
          0,
          remaining.current - (performance.now() - visibleSince.current),
        )
      }
      visibleSince.current = null
      if (timeout.current) clearTimeout(timeout.current)
      timeout.current = undefined
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
