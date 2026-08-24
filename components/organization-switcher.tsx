"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDownIcon } from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import { syncPostHogTeam } from "@/lib/posthog-client"

interface OrganizationOption { id: string; name: string }
interface OrganizationSwitcherProps { organizations: OrganizationOption[]; activeId: string }

export function OrganizationSwitcher({ organizations, activeId }: OrganizationSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleValueChange(value: string) {
    if (!value || value === activeId) return
    startTransition(async () => {
      try {
        const result = await authClient.organization.setActive({ organizationId: value })
        if (result.error) throw new Error(result.error.message)

        await syncPostHogTeam(value)
        router.refresh()
      } catch {
        toast.error("We couldn’t switch team libraries. Try again.")
      }
    })
  }

  return (
    // min-w-0 lets the switcher give up width on very narrow phones (the
    // select truncates) instead of forcing the header row past the viewport.
    <div className="relative w-32 min-w-0 sm:w-44">
      <select
        aria-label="Switch team library"
        className="h-10 w-full appearance-none truncate rounded-xl border border-border bg-card/65 pl-3 pr-9 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-wait disabled:opacity-60"
        value={activeId}
        disabled={isPending}
        onChange={(event) => handleValueChange(event.target.value)}
      >
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>{organization.name}</option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
