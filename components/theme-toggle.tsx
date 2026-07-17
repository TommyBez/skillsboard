"use client"

import { useEffect, useState } from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
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
  const Icon = current === "system" ? MonitorIcon : resolvedTheme === "dark" ? MoonIcon : SunIcon
  const label = mounted
    ? `Theme: ${current}. Switch to ${next}.`
    : "Toggle color theme"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn("size-10 rounded-xl border-border bg-card/65", className)}
      aria-label={label}
      title={mounted ? `Theme: ${current}` : "Theme"}
      disabled={!mounted}
      onClick={() => setTheme(next)}
    >
      <Icon className="size-4" aria-hidden="true" />
    </Button>
  )
}
