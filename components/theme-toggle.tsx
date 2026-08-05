"use client"

import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const modes = ["light", "dark", "system"] as const

/**
 * Which chrome the control is standing in.
 *
 * `app` is the product shell: 40px and `rounded-xl`, so it matches the nav pill
 * it sits beside in the app header. `marketing` is the landing command strip and
 * the guides / resources header: 3px corners, a rule-weight edge, a field of its
 * own, the CTA cluster's hover-and-press, and the title printed under the
 * control on hover. Size is the caller's, because each header's controls are
 * sized to each other — see `app/styles/theme-toggle.css`.
 */
export type ThemeToggleChrome = "app" | "marketing"

const chromeClassName: Record<ThemeToggleChrome, string> = {
  app: "relative size-10 rounded-xl border-border bg-card/65",
  marketing: "theme-toggle-marketing relative rounded-[3px]",
}

type Mode = (typeof modes)[number]

function isMode(value: string | undefined): value is Mode {
  return value === "light" || value === "dark" || value === "system"
}

export function ThemeToggle({
  chrome = "app",
  className,
}: {
  chrome?: ThemeToggleChrome
  className?: string
}) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const current: Mode = isMode(theme) ? theme : "system"
  const next = modes[(modes.indexOf(current) + 1) % modes.length]
  // Show the theme the visitor is actually looking at. A monitor glyph is the
  // conventional mark for "system", but on its own it reads as an unexplained
  // icon — it names where the setting came from, not what it produced.
  //
  // Following the system is carried by the accessible name and the tooltip
  // rather than by a mark: three separate design reviews read a corner dot here
  // as a notification badge or a rendering artefact, and a control this small
  // cannot afford a second element competing with its glyph.
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
      className={cn(chromeClassName[chrome], className)}
      aria-label={label}
      title={mounted ? `Theme: ${current}` : "Theme"}
      disabled={!mounted}
      onClick={() => setTheme(next)}
    >
      <Icon key={current} className="theme-toggle-icon size-4" aria-hidden="true" />
    </Button>
  )
}
