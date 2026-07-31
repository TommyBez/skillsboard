"use client"

/**
 * A Link that routes plain left-clicks through the page's filter transition,
 * so the results slot can dim while the next server render streams in.
 * Modifier clicks and middle clicks fall through to the browser — open in a
 * new tab must keep working, which is why these stay real anchors.
 */

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ComponentProps, MouseEvent } from "react"

import { useFilterPending } from "@/components/pending-filters"

export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  const router = useRouter()
  const { startTransition } = useFilterPending()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    startTransition(() => {
      router.push(typeof href === "string" ? href : href.toString(), { scroll: false })
    })
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
