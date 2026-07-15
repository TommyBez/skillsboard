import { Suspense, type ReactNode } from "react"

import { AppHeader } from "@/components/app-header"
import { Brand } from "@/components/brand"
import { Skeleton } from "@/components/ui/skeleton"
import { getAppContext } from "@/lib/app-context"

async function AuthenticatedHeader() {
  const { session, organizations, activeId } = await getAppContext()
  return <AppHeader user={session.user} organizations={organizations} activeId={activeId} />
}

function AppHeaderFallback() {
  return (
    <header className="border-b border-border/80 bg-background/90">
      <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <Brand />
        <Skeleton className="ml-auto h-10 w-32 rounded-xl sm:w-44" />
        <Skeleton className="size-10 rounded-xl" />
      </div>
    </header>
  )
}

export function ProtectedAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-canvas min-h-[100dvh] bg-background">
      <Suspense fallback={<AppHeaderFallback />}>
        <AuthenticatedHeader />
      </Suspense>
      {children}
    </div>
  )
}
