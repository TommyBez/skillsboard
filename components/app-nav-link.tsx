"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function AppNavLink({ href, children, mobile = false }: { href: string; children: ReactNode; mobile?: boolean }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center justify-center font-semibold transition-colors duration-150 ease-out",
        mobile
          ? "min-w-24 rounded-xl px-4 py-2.5 text-sm"
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
