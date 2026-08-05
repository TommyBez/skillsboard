import type { Metadata } from "next"
import { Suspense, type ReactNode } from "react"

import { AccountMenu } from "@/components/account-menu"
import { Brand } from "@/components/brand"
import { PostHogIdentity } from "@/components/posthog-identity"
import { ThemeToggle } from "@/components/theme-toggle"
import { Skeleton } from "@/components/ui/skeleton"
import { requireSession } from "@/lib/session"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

async function AuthenticatedAccountHeader() {
  const session = await requireSession("/settings/email")

  return (
    <>
      <PostHogIdentity userId={session.user.id} />
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
          <Brand />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AccountMenu user={session.user} />
          </div>
        </div>
      </header>
    </>
  )
}

function AccountHeaderFallback() {
  return (
    <header className="border-b border-border/80 bg-background/90">
      <div className="mx-auto flex h-[4.5rem] max-w-[1440px] items-center gap-3 px-4 md:px-6 lg:px-8">
        <Brand />
        <ThemeToggle className="ml-auto" />
        <Skeleton className="size-10 rounded-xl" />
      </div>
    </header>
  )
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-canvas min-h-[100dvh] bg-background">
      <Suspense fallback={<AccountHeaderFallback />}>
        <AuthenticatedAccountHeader />
      </Suspense>
      {children}
    </div>
  )
}
