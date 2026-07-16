import Link from "next/link"
import { LibraryBigIcon, LogOutIcon, SearchIcon, SettingsIcon, SlidersHorizontalIcon } from "lucide-react"

import { AppNavLink } from "@/components/app-nav-link"
import { Brand } from "@/components/brand"
import { CreateOrganizationDialog } from "@/components/create-organization-dialog"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import { SignOutForm } from "@/components/sign-out-form"

interface AppHeaderProps {
  user: { name: string; email: string }
  organizations: { id: string; name: string }[]
  activeId: string
}

export function AppHeader({ user, organizations, activeId }: AppHeaderProps) {
  const initials = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
          <Brand />

          <nav className="ml-3 hidden items-center gap-1 rounded-xl border border-border bg-card/65 p-1 md:flex" aria-label="Product navigation">
            <AppNavLink href="/library">Library</AppNavLink>
            <AppNavLink href="/discover">Find skills</AppNavLink>
          </nav>

          <div className="ml-auto flex min-w-0 items-center gap-2">
            <div className="flex items-center gap-1.5">
              <OrganizationSwitcher organizations={organizations} activeId={activeId} />
              <CreateOrganizationDialog />
            </div>
            <details className="group relative">
              <summary
                aria-label="User menu"
                className="flex size-10 cursor-pointer list-none items-center justify-center rounded-xl border border-border bg-card/65 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring group-open:bg-muted [&::-webkit-details-marker]:hidden"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-foreground font-mono text-[0.7rem] text-background">
                  {initials}
                </span>
              </summary>
              <div className="absolute right-0 top-12 z-40 min-w-64 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[0_18px_48px_hsl(var(--shadow-color)/0.18)]">
                <div className="p-3">
                  <span className="block font-semibold">{user.name}</span>
                  <span className="mt-0.5 block truncate font-normal text-muted-foreground">{user.email}</span>
                </div>
                <nav className="border-t border-border p-1" aria-label="Account settings">
                  <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted" href="/settings/organization">
                    <SettingsIcon className="size-4" aria-hidden="true" />Team access
                  </Link>
                  <Link className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted" href="/settings/mcp">
                    <SlidersHorizontalIcon className="size-4" aria-hidden="true" />MCP setup
                  </Link>
                </nav>
                <div className="border-t border-border p-1">
                  <SignOutForm>
                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted" type="submit">
                      <LogOutIcon className="size-4" aria-hidden="true" />Sign out
                    </button>
                  </SignOutForm>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-center gap-1 rounded-2xl border border-border bg-background/92 p-1.5 shadow-[0_18px_48px_hsl(var(--shadow-color)/0.2)] backdrop-blur-xl md:hidden" aria-label="Mobile product navigation">
        <AppNavLink href="/library" mobile><LibraryBigIcon className="mr-1.5 size-4" aria-hidden="true" />Library</AppNavLink>
        <AppNavLink href="/discover" mobile><SearchIcon className="mr-1.5 size-4" aria-hidden="true" />Find skills</AppNavLink>
      </nav>
    </>
  )
}
