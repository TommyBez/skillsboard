"use client"

/**
 * The guide's chapter rail, now aware of where the reader actually is.
 *
 * Two interior.dev behaviours land here:
 *   ScrollSpy        — https://www.interior.dev/docs/scroll-spy
 *   ReadingProgress  — https://www.interior.dev/docs/reading-progress
 *
 * The rail previously rendered hash anchors with no active state, so on an
 * eight-chapter guide nothing ever told you which chapter you were in.
 */

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { useScrollSpy } from "@/components/interior/scroll-spy"
import { ReadingProgress } from "@/components/interior/reading-progress"
import { cn } from "@/lib/utils"

export interface GuideChapter {
  href: string
  label: string
}

export function GuideChapterNav({
  chapters,
  contentId,
  words,
}: {
  chapters: readonly GuideChapter[]
  /** Element whose traversal the progress bar reports. */
  contentId: string
  words?: number
}) {
  const reduced = useReducedMotion()
  const contentRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)

  const sections = chapters.map((chapter) => ({
    id: chapter.href.replace("#", ""),
    label: chapter.label,
  }))
  const active = useScrollSpy(sections, 120)

  useEffect(() => {
    contentRef.current = document.getElementById(contentId)
    setMounted(true)
  }, [contentId])

  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        In this guide
      </p>

      <nav aria-label="Guide chapters" className="relative border-l border-border">
        {chapters.map((chapter) => {
          const id = chapter.href.replace("#", "")
          const isActive = mounted && id === active
          return (
            <a
              key={chapter.href}
              href={chapter.href}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "relative block px-4 py-2 text-sm transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="guide-chapter-marker"
                  aria-hidden
                  className="absolute inset-y-0 -left-px w-px bg-primary"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 520, damping: 44 }
                  }
                />
              ) : null}
              {chapter.label}
            </a>
          )
        })}
      </nav>

      {mounted ? (
        <ReadingProgress target={contentRef} words={words} className="pl-4" />
      ) : null}
    </div>
  )
}
