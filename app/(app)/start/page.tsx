import { Suspense } from "react"
import type { Metadata } from "next"

import { OnboardingNextSteps } from "@/components/onboarding-next-steps"
import { Skeleton } from "@/components/ui/skeleton"
import { getAppContext } from "@/lib/app-context"
import { getMcpResource } from "@/lib/auth-environment"
import { isOrganizationAdmin } from "@/lib/session"

export const metadata: Metadata = {
  title: "Start here",
}

async function StartHeading() {
  await getAppContext()

  return (
    <>
      <h1
        data-testid="start-shell"
        className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl"
      >
        Your team library is ready
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Three things to do now, in any order. Connecting your agent comes first because that is where your team&apos;s
        AI skills get used, and inviting a teammate is open at the same time rather than later.
      </p>
    </>
  )
}

function StartHeadingFallback() {
  return (
    <>
      <Skeleton className="mt-4 h-14 w-full max-w-xl rounded-xl sm:h-16 lg:h-[4.5rem]" />
      <Skeleton className="mt-5 h-16 max-w-2xl rounded-xl" />
    </>
  )
}

async function StartSteps() {
  const { role } = await getAppContext()

  return (
    <OnboardingNextSteps
      canInvite={isOrganizationAdmin(role)}
      mcpUrl={getMcpResource()}
    />
  )
}

function StartStepsFallback() {
  return (
    <div
      className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      role="status"
      aria-label="Loading your first steps"
    >
      <Skeleton className="h-[26rem] rounded-[16px]" />
      <Skeleton className="h-[26rem] rounded-[16px]" />
      <Skeleton className="h-[26rem] rounded-[16px]" />
    </div>
  )
}

/**
 * Where a new team lands, in place of an empty library.
 *
 * The three things that make this product work are offered at once, with the
 * agent connection first: it used to live in a settings page, which is the last
 * place a new account looks, and the invitation used to wait behind a first
 * saved skill.
 *
 * The heading is part of the same team page as the steps. Painting it first
 * and resolving the team in a child is what flashed "Your team library is
 * ready" at accounts that had just been created and still had no team.
 */
export default function StartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-28 md:px-6 md:py-12">
      <header className="border-b pb-10">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">First run</p>
        <Suspense fallback={<StartHeadingFallback />}>
          <StartHeading />
        </Suspense>
      </header>

      <div className="mt-8">
        <Suspense fallback={<StartStepsFallback />}>
          <StartSteps />
        </Suspense>
      </div>
    </main>
  )
}
