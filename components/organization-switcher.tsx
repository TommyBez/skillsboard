"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

import { setActiveOrganization } from "@/app/actions/organizations"

interface OrganizationOption { id: string; name: string }
interface OrganizationSwitcherProps { organizations: OrganizationOption[]; activeId: string }

export function OrganizationSwitcher({ organizations, activeId }: OrganizationSwitcherProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleValueChange(value: string) {
    if (!value || value === activeId) return
    startTransition(async () => {
      await setActiveOrganization(value)
      router.refresh()
    })
  }

  return (
    <select
      aria-label="Switch team library"
      className="h-10 w-32 truncate rounded-xl border border-border bg-card/65 px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-wait disabled:opacity-60 sm:w-44"
      value={activeId}
      disabled={isPending}
      onChange={(event) => handleValueChange(event.target.value)}
    >
      {organizations.map((organization) => (
        <option key={organization.id} value={organization.id}>{organization.name}</option>
      ))}
    </select>
  )
}
