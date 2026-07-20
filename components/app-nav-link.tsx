"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import {
  createAnalyticsClickHandler,
  type ClientAnalyticsEvent,
} from "@/lib/analytics-client"
import { cn } from "@/lib/utils"

export function AppNavLink({
  href,
  children,
  mobile = false,
  analytics,
}: {
  href: string
  children: ReactNode
  mobile?: boolean
  analytics?: ClientAnalyticsEvent
}) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      onClick={createAnalyticsClickHandler(analytics)}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center justify-center font-semibold transition-colors duration-150 ease-out",
        mobile
          ? "min-w-0 flex-1 rounded-xl px-2 py-2.5 text-sm"
          : "h-9 rounded-lg px-3 text-sm",
        isActive
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  )
}
