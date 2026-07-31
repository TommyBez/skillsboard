"use client"

/**
 * PresenceAvatars — "Join and leave as a layout change"
 *
 * Ported from https://www.interior.dev/docs/presence-avatars. API as
 * documented: people / max / size / overlap / label / announceAfter /
 * onOverflowSelect.
 *
 * `id` is the identity that survives a re-render, `name` supplies the initials
 * and the spoken roster. Given `onOverflowSelect` the overflow chip becomes a
 * real button; omitted, it is decorative and hidden from assistive tech.
 */

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export interface PresencePerson {
  id: string
  name: string
  src?: string
}

interface PresenceAvatarsProps {
  people: readonly PresencePerson[]
  max?: number
  size?: number
  overlap?: number
  label?: string
  announceAfter?: number
  onOverflowSelect?: (hidden: PresencePerson[]) => void
  className?: string
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function PresenceAvatars({
  people,
  max = 5,
  size = 28,
  overlap = 9,
  label = "People here",
  announceAfter = 900,
  onOverflowSelect,
  className,
}: PresenceAvatarsProps) {
  const reduced = useReducedMotion()
  const visible = people.slice(0, max)
  const hidden = people.slice(max)
  const [roster, setRoster] = useState("")

  // Announce the settled roster, not every arrival.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRoster(`${label}: ${people.map((person) => person.name).join(", ")}`)
    }, announceAfter)
    return () => window.clearTimeout(timer)
  }, [people, label, announceAfter])

  const spring = reduced
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 560, damping: 42 }

  return (
    <div className={cn("flex items-center", className)}>
      <div aria-hidden className="flex items-center">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((person, index) => (
            <motion.span
              key={person.id}
              layout={!reduced}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              transition={spring}
              title={person.name}
              style={{
                width: size,
                height: size,
                marginLeft: index === 0 ? 0 : -overlap,
                zIndex: visible.length - index,
              }}
              className="grid shrink-0 place-items-center rounded-full border-2 border-background bg-surface-ink text-[10px] font-semibold uppercase text-surface-ink-foreground"
            >
              {person.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={person.src}
                  alt=""
                  className="size-full rounded-full object-cover"
                />
              ) : (
                initials(person.name)
              )}
            </motion.span>
          ))}
        </AnimatePresence>

        {hidden.length > 0 ? (
          <motion.span
            layout={!reduced}
            transition={spring}
            style={{ width: size, height: size, marginLeft: -overlap }}
            className="grid shrink-0 place-items-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold tabular-nums text-muted-foreground"
          >
            {onOverflowSelect ? (
              <button
                type="button"
                aria-label={`Show ${hidden.length} more`}
                onClick={() => onOverflowSelect([...hidden])}
                className="grid size-full place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                +{hidden.length}
              </button>
            ) : (
              `+${hidden.length}`
            )}
          </motion.span>
        ) : null}
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {roster}
      </span>
    </div>
  )
}
