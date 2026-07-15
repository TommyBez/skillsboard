import Link from "next/link"
import { LibraryBigIcon, LogOutIcon, SearchIcon, SettingsIcon, SlidersHorizontalIcon } from "lucide-react"

import { AppNavLink } from "@/components/app-nav-link"
import { Brand } from "@/components/brand"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
            <AppNavLink href="/discover">Discover</AppNavLink>
          </nav>

          <div className="ml-auto flex min-w-0 items-center gap-2">
            <OrganizationSwitcher organizations={organizations} activeId={activeId} />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label="User menu" />}>
                <Avatar className="size-8">
                  <AvatarFallback className="bg-foreground font-mono text-[0.7rem] text-background">{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-64">
                <DropdownMenuLabel className="p-3">
                  <span className="block font-semibold">{user.name}</span>
                  <span className="mt-0.5 block truncate font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem nativeButton={false} render={<Link href="/settings/organization" />}>
                    <SettingsIcon />Team settings
                  </DropdownMenuItem>
                  <DropdownMenuItem nativeButton={false} render={<Link href="/settings/mcp" />}>
                    <SlidersHorizontalIcon />MCP setup
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem nativeButton={false} render={<Link href="/api/auth/sign-out" aria-label="Sign out" />}>
                    <LogOutIcon />Sign out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-center gap-1 rounded-2xl border border-border bg-background/92 p-1.5 shadow-[0_18px_48px_hsl(var(--shadow-color)/0.2)] backdrop-blur-xl md:hidden" aria-label="Mobile product navigation">
        <AppNavLink href="/library" mobile><LibraryBigIcon className="mr-1.5 size-4" aria-hidden="true" />Library</AppNavLink>
        <AppNavLink href="/discover" mobile><SearchIcon className="mr-1.5 size-4" aria-hidden="true" />Discover</AppNavLink>
      </nav>
    </>
  )
}
