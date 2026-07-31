"use client"

/**
 * ScrollSpy — "The section you are actually in"
 *
 * Ported from https://www.interior.dev/docs/scroll-spy. API as documented:
 * sections / offset / root / onChange / label.
 *
 * The active section is the last one whose top has crossed the offset line, so
 * a short trailing section still reads as current instead of snapping back.
 */

import { useEffect, useState } from "react"
import { useReducedMotion } from "motion/react"
import * as m from "motion/react-m"
import { cn } from "@/lib/utils"

export interface ScrollSpySection {
  id: string
  label: string
}

interface ScrollSpyProps {
  sections: readonly ScrollSpySection[]
  offset?: number
  root?: React.RefObject<HTMLElement | null>
  onChange?: (id: string) => void
  label: string
  className?: string
}

/** The tracking half on its own, for callers that render their own nav. */
export function useScrollSpy(
  sections: readonly ScrollSpySection[],
  offset = 96,
  root?: React.RefObject<HTMLElement | null>
) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "")

  useEffect(() => {
    if (sections.length === 0) return
    const scroller = root?.current ?? null
    let frame = 0

    const measure = () => {
      frame = 0
      const line = (scroller?.getBoundingClientRect().top ?? 0) + offset
      let current = sections[0].id
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (!element) continue
        if (element.getBoundingClientRect().top <= line) current = section.id
      }
      setActive((previous) => (previous === current ? previous : current))
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    const target: EventTarget = scroller ?? window
    target.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      target.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [sections, offset, root])

  return active
}

export function ScrollSpy({
  sections,
  offset = 96,
  root,
  onChange,
  label,
  className,
}: ScrollSpyProps) {
  const reduced = useReducedMotion()
  const active = useScrollSpy(sections, offset, root)

  useEffect(() => {
    if (active) onChange?.(active)
  }, [active, onChange])

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex flex-col gap-0.5">
        {sections.map((section) => {
          const isActive = section.id === active
          return (
            <li key={section.id} className="relative">
              {isActive ? (
                <m.span
                  layoutId={`scroll-spy-${label}`}
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[2px] rounded-full bg-primary"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 42 }
                  }
                />
              ) : null}
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "block py-1.5 pl-3 text-sm transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {section.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
