"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CopyButtonProps { value: string; label?: string; compact?: boolean; ariaLabel?: string; copiedAriaLabel?: string }

export function CopyButton({ value, label = "Copy", compact = false, ariaLabel, copiedAriaLabel }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(value)
    setHasCopied(true)
    window.setTimeout(() => setHasCopied(false), 1600)
  }
  return <Button aria-label={hasCopied ? copiedAriaLabel : ariaLabel} variant="outline" size="sm" className={compact ? "h-7 border-transparent bg-card px-2" : undefined} onClick={copy}>{hasCopied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}{hasCopied ? "Copied" : label}</Button>
}
