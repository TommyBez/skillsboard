import Link from "next/link"
import { BracesIcon } from "lucide-react"

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <BracesIcon className="size-4" aria-hidden="true" />
      </span>
      Skillbase
    </Link>
  )
}
