import Link from "next/link"
import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getDeploymentEnvironment } from "@/lib/auth-environment"
import { getOAuthAuthorizeContinuePath, getOAuthQueryString } from "@/lib/oauth-continue"
import { safeReturnTo } from "@/lib/safe-return-to"
import { getSession } from "@/lib/session"

interface AuthEntryProps {
  mode: "sign-in" | "sign-up"
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function AuthEntry({ mode, searchParams }: AuthEntryProps) {
  const [session, params] = await Promise.all([getSession(), searchParams])
  const oauthContinue = getOAuthAuthorizeContinuePath(params)
  const oauthQuery = getOAuthQueryString(params)
  const returnTo = safeReturnTo(typeof params.returnTo === "string" ? params.returnTo : undefined)

  if (session?.user) {
    if (oauthContinue) redirect(oauthContinue)
    if (returnTo === "/library") redirect("/library")
    return (
      <div className="grid gap-5 border-t border-border pt-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          You’re signed in as <span className="font-medium text-foreground">{session.user.email}</span>.
        </p>
        <Button size="lg" className="h-12 rounded-[16px]" nativeButton={false} render={<Link href={returnTo} />}>
          Continue to invitation
        </Button>
      </div>
    )
  }

  return (
    <AuthForm
      mode={mode}
      returnTo={returnTo}
      continueHref={oauthContinue}
      preserveQuery={oauthQuery}
      acceptAnyOtp={getDeploymentEnvironment() === "development"}
    />
  )
}

export function AuthEntryFallback({ mode }: Pick<AuthEntryProps, "mode">) {
  return (
    <div className="grid gap-4" aria-label={mode === "sign-up" ? "Loading account creation form" : "Loading sign in form"}>
      {mode === "sign-up" ? <Skeleton className="h-20 rounded-[16px]" /> : null}
      <Skeleton className="h-20 rounded-[16px]" />
      <Skeleton className="h-12 rounded-[16px]" />
    </div>
  )
}
