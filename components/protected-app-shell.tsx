import { Suspense, type ReactNode } from "react"

import { AppHeader } from "@/components/app-header"
import { Brand } from "@/components/brand"
import { CommandMenu } from "@/components/command-menu"
import { CommandMenuIndex } from "@/components/command-menu-index"
import { ExistingUserEmailConsentPrompt } from "@/components/existing-user-email-consent-prompt"
import { PostHogIdentity } from "@/components/posthog-identity"
import { ThemeToggle } from "@/components/theme-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { getAppContext } from "@/lib/app-context"

async function AuthenticatedHeader() {
  const { session, organizations, activeId } = await getAppContext()
  return (
    <>
      <PostHogIdentity userId={session.user.id} />
      <AppHeader user={session.user} organizations={organizations} activeId={activeId} />
    </>
  )
}

function AppHeaderFallback() {
  // Mirrors the real header's stickiness and layout so nothing jumps or
  // grows when auth resolves — the nav placeholder holds the same slot the
  // nav pill will occupy.
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <Brand />
        <Skeleton className="ml-3 hidden h-11 w-[22rem] rounded-xl md:block" />
        <Skeleton className="ml-auto h-10 w-32 rounded-xl sm:w-44" />
        <ThemeToggle />
        <Skeleton className="size-10 rounded-xl" />
      </div>
    </header>
  )
}

export function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-canvas min-h-[100dvh] bg-background">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Suspense fallback={<AppHeaderFallback />}>
        <AuthenticatedHeader />
      </Suspense>
      <Suspense fallback={null}>
        <ExistingUserEmailConsentPrompt />
      </Suspense>
      <div id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </div>
      {/* Navigation and actions work from the first paint; the searchable
          skill/collection rows stream in with the index. */}
      <Suspense fallback={<CommandMenu />}>
        <CommandMenuIndex />
      </Suspense>
    </div>
  )
}
