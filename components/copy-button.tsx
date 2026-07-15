"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CopyButtonProps { value: string; label?: string }

export function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(value)
    setHasCopied(true)
    window.setTimeout(() => setHasCopied(false), 1600)
  }
  return <Button variant="outline" size="sm" onClick={copy}>{hasCopied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}{hasCopied ? "Copied" : label}</Button>
}
