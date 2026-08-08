"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { setPostHogCommittedPathname } from "@/lib/posthog-client"

export function PostHogRoutePrivacy() {
  const pathname = usePathname()

  useEffect(() => {
    setPostHogCommittedPathname(pathname)
  }, [pathname])

  return null
}
