"use client"

import { useEffect, useLayoutEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import {
  registerPostHogScopeRequirement,
  schedulePostHogPageView,
  type PostHogScopeRequirement,
} from "@/lib/posthog-scope"

export function PostHogScopeBoundary({
  children,
  scope,
}: {
  children: ReactNode
  scope: PostHogScopeRequirement
}) {
  useLayoutEffect(() => registerPostHogScopeRequirement(scope), [scope])
  return children
}

/** The only browser route-view producer. Query-only library state is separate. */
export function PostHogPageView() {
  const pathname = usePathname()

  useEffect(() => {
    schedulePostHogPageView(pathname)
  }, [pathname])

  return null
}
