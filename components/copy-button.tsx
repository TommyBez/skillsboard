"use client"

import { useState } from "react"
import { CheckIcon, CircleXIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CopyButtonProps {
  value: string
  label?: string
  compact?: boolean
  iconOnly?: boolean
  ariaLabel?: string
  copiedAriaLabel?: string
}

async function writeToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return
  } catch {
    const textarea = document.createElement("textarea")
    textarea.value = value
    textarea.setAttribute("readonly", "")
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.append(textarea)
    textarea.select()
    const copied = document.execCommand("copy")
    textarea.remove()
    if (!copied) throw new Error("Clipboard access is unavailable")
  }
}

export function CopyButton({
  value,
  label = "Copy",
  compact = false,
  iconOnly = false,
  ariaLabel,
  copiedAriaLabel,
}: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle")

  async function copy() {
    try {
      await writeToClipboard(value)
      setStatus("copied")
    } catch {
      setStatus("failed")
    }
    window.setTimeout(() => setStatus("idle"), 1600)
  }

  const hasCopied = status === "copied"
  const hasFailed = status === "failed"
  const currentAriaLabel = hasCopied
    ? copiedAriaLabel ?? ariaLabel ?? "Copied"
    : hasFailed
      ? "Copy failed. Select and copy the text manually."
      : ariaLabel ?? label

  return (
    <Button
      aria-label={currentAriaLabel}
      variant="outline"
      size={iconOnly ? "icon-sm" : "sm"}
      className={compact ? "h-7 border-transparent bg-card px-2" : undefined}
      onClick={copy}
    >
      {hasCopied ? (
        <CheckIcon key="copied" data-icon="inline-start" className="copy-success-icon" />
      ) : hasFailed ? (
        <CircleXIcon key="failed" data-icon="inline-start" className="text-destructive" />
      ) : (
        <CopyIcon key="idle" data-icon="inline-start" />
      )}
      {iconOnly ? null : hasCopied ? "Copied" : hasFailed ? "Copy failed" : label}
    </Button>
  )
}
