"use client"

import Link from "next/link"
import { LogOutIcon, SettingsIcon, SlidersHorizontalIcon } from "lucide-react"

import { SignOutForm } from "@/components/sign-out-form"
import { TrackedLink } from "@/components/tracked-link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { mcpEntryEventProperties } from "@/lib/analytics-event-properties"

interface AccountMenuProps {
  user: { name: string; email: string }
}

export function AccountMenu({ user }: AccountMenuProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User menu"
        className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-card/65 transition-[transform,background-color] duration-[var(--duration-press)] ease-[var(--ease-out)] hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] data-popup-open:bg-muted"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-foreground font-mono text-[0.7rem] text-background">
          {initials}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="account-menu-content w-auto min-w-64 overflow-hidden rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-[0_18px_48px_hsl(var(--shadow-color)/0.18)] ring-0 duration-[var(--duration-popover)]"
      >
        <div className="p-3">
          <span className="block font-semibold">{user.name}</span>
          <span className="mt-0.5 block truncate font-normal text-muted-foreground">{user.email}</span>
        </div>
        <nav className="border-t border-border p-1" aria-label="Account settings">
          <DropdownMenuItem
            className="gap-2 rounded-lg px-3 py-2 text-sm font-medium"
            nativeButton={false}
            render={<Link href="/settings/organization" />}
          >
            <SettingsIcon className="size-4" aria-hidden="true" />
            Team access
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 rounded-lg px-3 py-2 text-sm font-medium"
            nativeButton={false}
            render={(
              <TrackedLink
                href="/settings/mcp"
                analytics={{
                  event: "mcp_entry_clicked",
                  properties: mcpEntryEventProperties(true, "account_menu", "/settings/mcp"),
                }}
              />
            )}
          >
            <SlidersHorizontalIcon className="size-4" aria-hidden="true" />
            Connect an agent
          </DropdownMenuItem>
        </nav>
        <div className="border-t border-border p-1">
          <SignOutForm>
            <DropdownMenuItem
              className="w-full gap-2 rounded-lg px-3 py-2 text-sm font-medium"
              nativeButton
              render={<button type="submit" />}
            >
              <LogOutIcon className="size-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </SignOutForm>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
