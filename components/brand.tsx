import Link from "next/link"
import { BracesIcon } from "lucide-react"

export function Brand() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5 whitespace-nowrap font-semibold tracking-[-0.03em]" aria-label="Skills Board home">
      <span className="flex size-9 items-center justify-center rounded-xl border border-primary/35 bg-primary text-primary-foreground shadow-[inset_0_1px_0_color-mix(in_oklch,var(--primary-foreground)_28%,transparent)] transition-transform duration-150 ease-out group-active:scale-[0.96]">
        <BracesIcon className="size-4.5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="text-base">Skills Board</span>
    </Link>
  )
}
