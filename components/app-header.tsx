import { CableIcon, FolderOpenIcon, LibraryBigIcon, SearchIcon } from "lucide-react"

import { AccountMenu } from "@/components/account-menu"
import { AppNavLink } from "@/components/app-nav-link"
import { Brand } from "@/components/brand"
import { CreateOrganizationDialog } from "@/components/create-organization-dialog"
import { MobileNavBar } from "@/components/mobile-nav-bar"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { mcpEntryEventProperties } from "@/lib/analytics-event-properties"

interface AppHeaderProps {
  user: { name: string; email: string }
  organizations: { id: string; name: string }[]
  activeId: string
}

export function AppHeader({ user, organizations, activeId }: AppHeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
          <Brand />

          <nav className="ml-3 hidden items-center gap-1 rounded-xl border border-border bg-card/65 p-1 md:flex" aria-label="Product navigation">
            <AppNavLink href="/library">Library</AppNavLink>
            <AppNavLink href="/collections">Collections</AppNavLink>
            <AppNavLink href="/discover">Find skills</AppNavLink>
            <AppNavLink
              href="/settings/mcp"
              analytics={{
                event: "mcp_entry_clicked",
                properties: mcpEntryEventProperties(true, "app_navigation", "/settings/mcp"),
              }}
            >
              Connect agent
            </AppNavLink>
          </nav>

          <div className="ml-auto flex min-w-0 items-center gap-2">
            <div className="flex items-center gap-1.5">
              <OrganizationSwitcher organizations={organizations} activeId={activeId} />
              <CreateOrganizationDialog />
            </div>
            <ThemeToggle />
            <AccountMenu user={user} />
          </div>
        </div>
      </header>

      <MobileNavBar>
        <AppNavLink href="/library" mobile><LibraryBigIcon className="mr-1.5 size-4" aria-hidden="true" />Library</AppNavLink>
        <AppNavLink href="/collections" mobile><FolderOpenIcon className="mr-1.5 size-4" aria-hidden="true" />Collections</AppNavLink>
        <AppNavLink href="/discover" mobile><SearchIcon className="mr-1.5 size-4" aria-hidden="true" />Find</AppNavLink>
        <AppNavLink
          href="/settings/mcp"
          mobile
          analytics={{
            event: "mcp_entry_clicked",
            properties: mcpEntryEventProperties(true, "app_navigation", "/settings/mcp"),
          }}
        >
          <CableIcon className="mr-1.5 size-4" aria-hidden="true" />Connect
        </AppNavLink>
      </MobileNavBar>
    </>
  )
}
