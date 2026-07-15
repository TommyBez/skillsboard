"use client"

import { useRouter } from "next/navigation"

import { setActiveOrganization } from "@/app/actions/organizations"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OrganizationOption { id: string; name: string }
interface OrganizationSwitcherProps { organizations: OrganizationOption[]; activeId: string }

export function OrganizationSwitcher({ organizations, activeId }: OrganizationSwitcherProps) {
  const router = useRouter()
  async function handleValueChange(value: string | null) {
    if (!value) return
    await setActiveOrganization(value)
    router.refresh()
  }
  return <Select value={activeId} onValueChange={handleValueChange}><SelectTrigger aria-label="Switch active organization" className="h-10 w-32 rounded-xl bg-card/65 sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{organizations.map((organization) => <SelectItem key={organization.id} value={organization.id}>{organization.name}</SelectItem>)}</SelectGroup></SelectContent></Select>
}
