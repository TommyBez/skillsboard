"use client"

import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const modes = ["light", "dark", "system"] as const

type Mode = (typeof modes)[number]

function isMode(value: string | undefined): value is Mode {
  return value === "light" || value === "dark" || value === "system"
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const current: Mode = isMode(theme) ? theme : "system"
  const next = modes[(modes.indexOf(current) + 1) % modes.length]
  // Show the theme the visitor is actually looking at. A monitor glyph is the
  // conventional mark for "system", but on its own it reads as an unexplained
  // icon — it says where the setting comes from, not what it produced. Show
  // sun or moon for the resolved theme, and mark "following the system" with a
  // dot on the corner.
  //
  // The resolved theme is only knowable in the browser, so the first client
  // render has to match the server's: pick the glyph from it only once mounted.
  const Icon = mounted && resolvedTheme === "dark" ? MoonIcon : SunIcon
  const label = mounted
    ? `Theme: ${current}. Switch to ${next}.`
    : "Toggle color theme"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn("relative size-10 rounded-xl border-border bg-card/65", className)}
      aria-label={label}
      title={mounted ? `Theme: ${current}` : "Theme"}
      disabled={!mounted}
      onClick={() => setTheme(next)}
    >
      <Icon key={current} className="theme-toggle-icon size-4" aria-hidden="true" />
      {mounted && current === "system" ? (
        <span
          className="absolute right-1 top-1 size-1 rounded-full bg-primary"
          aria-hidden="true"
        />
      ) : null}
    </Button>
  )
}
