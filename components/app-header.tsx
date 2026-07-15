import Link from "next/link"
import { LogOutIcon, SettingsIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AppHeaderProps { user: { name: string; email: string }; organizations: { id: string; name: string }[]; activeId: string }

export function AppHeader({ user, organizations, activeId }: AppHeaderProps) {
  const initials = user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
  return <header className="sticky top-0 border-b bg-background/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6"><Brand /><nav className="ml-4 hidden items-center gap-1 md:flex"><Button variant="ghost" nativeButton={false} render={<Link href="/library" />}>Library</Button><Button variant="ghost" nativeButton={false} render={<Link href="/discover" />}>Discover</Button></nav><div className="ml-auto flex items-center gap-2"><OrganizationSwitcher organizations={organizations} activeId={activeId} /><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="User menu" />}><Avatar className="size-8"><AvatarFallback>{initials}</AvatarFallback></Avatar></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel><span className="block">{user.name}</span><span className="block font-normal text-muted-foreground">{user.email}</span></DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuItem nativeButton={false} render={<Link href="/settings/organization" />}><SettingsIcon />Team settings</DropdownMenuItem><DropdownMenuItem nativeButton={false} render={<Link href="/settings/mcp" />}>MCP setup</DropdownMenuItem></DropdownMenuGroup><DropdownMenuSeparator /><DropdownMenuGroup><DropdownMenuItem render={<a href="/api/auth/sign-out" />}><LogOutIcon />Sign out</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></div></div></header>
}
