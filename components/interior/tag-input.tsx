"use client"

/**
 * TagInput — "Enter adds, backspace highlights then removes"
 *
 * Ported from https://www.interior.dev/docs/tag-input. API as documented:
 * value / defaultValue / onChange / max / separators / allowDuplicates /
 * validate / label / placeholder.
 *
 * Backspace on an empty field highlights the last chip first and only removes
 * it on a second press, so a stray keystroke never silently destroys a tag.
 */

import { useId, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagInputProps {
  value?: readonly string[]
  defaultValue?: readonly string[]
  onChange?: (value: string[]) => void
  max?: number
  separators?: readonly string[]
  allowDuplicates?: boolean
  /** Return an error string to reject the entry, or null to accept it. */
  validate?: (tag: string, current: readonly string[]) => string | null
  label: string
  placeholder?: string
  name?: string
  disabled?: boolean
  describedBy?: string
  className?: string
}

export function TagInput({
  value,
  defaultValue = [],
  onChange,
  max = 12,
  separators = [",", "Enter", "Tab"],
  allowDuplicates = false,
  validate,
  label,
  placeholder = "Add a tag",
  name,
  disabled = false,
  describedBy,
  className,
}: TagInputProps) {
  const reduced = useReducedMotion()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uncontrolled, setUncontrolled] = useState<string[]>([...defaultValue])
  const tags = value ? [...value] : uncontrolled
  const [draft, setDraft] = useState("")
  const [armed, setArmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function commit(next: string[]) {
    if (value === undefined) setUncontrolled(next)
    onChange?.(next)
  }

  /**
   * Split incoming text on every single-character separator.
   *
   * Text arrives pasted, or typed and then committed on blur, and it routinely
   * contains commas — this field replaced a comma-separated one and its
   * placeholder still reads like a list. Taking such a string as one tag makes
   * the UI disagree with what is submitted: the hidden value is comma-joined,
   * so the server splits it back apart and stores more tags than the chips
   * ever showed.
   */
  function splitEntries(raw: string) {
    const marks = separators.filter((entry) => entry.length === 1)
    const pattern = marks.length
      ? new RegExp(`[${marks.map((m) => m.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")).join("")}]`)
      : null
    return (pattern ? raw.split(pattern) : [raw])
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  function add(raw: string) {
    const entries = splitEntries(raw)
    if (entries.length === 0) return

    const next = [...tags]
    let rejected: string | null = null

    for (const tag of entries) {
      if (next.length >= max) {
        rejected = `Up to ${max} tags`
        break
      }
      if (!allowDuplicates && next.includes(tag)) {
        rejected = "Already added"
        continue
      }
      const rejection = validate?.(tag, next)
      if (rejection) {
        rejected = rejection
        continue
      }
      next.push(tag)
    }

    setError(rejected)
    setDraft("")
    if (next.length !== tags.length) commit(next)
  }

  function remove(tag: string) {
    setError(null)
    commit(tags.filter((entry) => entry !== tag))
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (separators.includes(event.key)) {
      // Tab still moves focus when there is nothing to commit.
      if (event.key === "Tab" && !draft.trim()) return
      event.preventDefault()
      add(draft)
      setArmed(false)
      return
    }
    if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      if (armed) {
        remove(tags[tags.length - 1])
        setArmed(false)
      } else {
        setArmed(true)
      }
      return
    }
    setArmed(false)
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2 py-1.5",
          "transition-[border-color] duration-[var(--duration-press)]",
          "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
          error ? "border-destructive" : "border-input",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {tags.map((tag, index) => {
            const isArmed = armed && index === tags.length - 1
            return (
              <motion.span
                key={tag}
                layout={!reduced}
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.86 }}
                transition={
                  reduced
                    ? { duration: 0.1 }
                    : { type: "spring", stiffness: 620, damping: 40 }
                }
                className={cn(
                  "inline-flex items-center gap-1 rounded-[calc(var(--radius)*0.45)] px-1.5 py-0.5",
                  "text-[12px] font-medium transition-colors",
                  isArmed
                    ? "bg-destructive/15 text-destructive"
                    : "bg-muted text-foreground"
                )}
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    remove(tag)
                  }}
                  className="grid size-3.5 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                >
                  <XIcon className="size-3" />
                </button>
              </motion.span>
            )
          })}
        </AnimatePresence>

        <input
          ref={inputRef}
          id={inputId}
          value={draft}
          placeholder={tags.length >= max ? "" : placeholder}
          disabled={disabled || tags.length >= max}
          aria-describedby={error ? `${inputId}-error` : describedBy}
          onChange={(event) => {
            setDraft(event.target.value)
            setError(null)
            setArmed(false)
          }}
          onKeyDown={onKeyDown}
          onPaste={(event) => {
            const text = event.clipboardData.getData("text/plain")
            if (!text) return
            event.preventDefault()
            add(draft + text)
            setArmed(false)
          }}
          onBlur={() => {
            add(draft)
            setArmed(false)
          }}
          className="min-w-[6ch] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>

      {name ? <input type="hidden" name={name} value={tags.join(",")} /> : null}

      <div className="flex min-h-[18px] items-baseline justify-between gap-2">
        {error ? (
          <p id={`${inputId}-error`} role="alert" className="text-[12px] leading-[18px] text-destructive">
            {error}
          </p>
        ) : (
          <span />
        )}
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {tags.length} of {max}
        </span>
      </div>
    </div>
  )
}
