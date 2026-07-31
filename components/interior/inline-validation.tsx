"use client"

/**
 * InlineValidation — "Error message that does not shove the form"
 *
 * Ported from https://www.interior.dev/docs/inline-validation. API as
 * documented: label / value / onChange / validate / hint / debounce /
 * reserveLines / type / required / disabled / id.
 *
 * `reserveLines` holds room for the message before there is a message, so an
 * error appearing never pushes the rest of the form down the page.
 */

import { useEffect, useId, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const LINE_HEIGHT = 18

interface InlineValidationProps {
  label: string
  value: string
  onChange: (value: string) => void
  /** Return an error string, or null when the value is acceptable. */
  validate?: (value: string) => string | null
  hint?: string
  debounce?: number
  reserveLines?: number
  type?: React.HTMLInputTypeAttribute
  required?: boolean
  disabled?: boolean
  id?: string
  placeholder?: string
  className?: string
}

export function InlineValidation({
  label,
  value,
  onChange,
  validate,
  hint,
  debounce = 400,
  reserveLines = 1,
  type = "text",
  required = false,
  disabled = false,
  id,
  placeholder,
  className,
}: InlineValidationProps) {
  const reduced = useReducedMotion()
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  // Validate on a debounce so the message does not chase every keystroke.
  useEffect(() => {
    if (!validate || !touched) return
    const timer = window.setTimeout(() => setError(validate(value)), debounce)
    return () => window.clearTimeout(timer)
  }, [value, validate, debounce, touched])

  const message = error ?? hint ?? null

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          setTouched(true)
          if (validate) setError(validate(value))
        }}
        className={cn(
          "h-9 rounded-md border bg-transparent px-3 text-sm outline-none",
          "transition-[border-color,box-shadow] duration-[var(--duration-press)]",
          "focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive" : "border-input focus-visible:border-ring"
        )}
      />
      {/* The reserved gutter. It exists whether or not there is a message. */}
      <div
        style={{ minHeight: reserveLines * LINE_HEIGHT }}
        className="relative"
      >
        <AnimatePresence initial={false} mode="wait">
          {message ? (
            <motion.p
              key={message}
              id={messageId}
              role={error ? "alert" : undefined}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reduced ? 0.1 : 0.18,
                ease: [0.23, 1, 0.32, 1],
              }}
              className={cn(
                "text-[12px] leading-[18px]",
                error ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {message}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
