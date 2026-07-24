import type { ReactNode } from "react"
import { Loader2Icon } from "lucide-react"

interface ButtonPendingContentProps {
  pending: boolean
  pendingLabel: ReactNode
  children: ReactNode
}

/** Spinner + pending label for async buttons without changing the shared Button API. */
export function ButtonPendingContent({
  pending,
  pendingLabel,
  children,
}: ButtonPendingContentProps) {
  if (!pending) return children

  return (
    <>
      <Loader2Icon className="size-4 animate-spin" data-icon="inline-start" aria-hidden="true" />
      {pendingLabel}
    </>
  )
}
