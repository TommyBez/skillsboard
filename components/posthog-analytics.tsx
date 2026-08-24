"use client"

import { useLayoutEffect, type ReactNode } from "react"
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

  // Scope and identity layout effects in the preceding route subtree settle
  // first; this still runs before any descendant passive analytics effect.
  useLayoutEffect(() => {
    schedulePostHogPageView(pathname)
  }, [pathname])

  return null
}
