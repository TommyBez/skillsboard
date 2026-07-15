"use client"

import { useRef } from "react"

import { cn } from "@/lib/utils"

export function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklch, var(--primary) 14%, transparent), transparent 70%)",
        }}
      />
      {children}
    </div>
  )
}
