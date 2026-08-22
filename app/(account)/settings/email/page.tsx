import { cache, Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { EmailPreferencesForm } from "@/components/email-preferences-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getProductCommunicationsPreference } from "@/lib/email/email-preferences"
import { isPermanentDeliverySuppression } from "@/lib/email/product-communications"
import { requireSession, resolveActiveOrganization } from "@/lib/session"

export const metadata: Metadata = {
  title: "Email preferences",
}

function formatRecordedAt(value: Date | null): string | null {
  if (!value) return null
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value)
}

const loadEmailPreferencePage = cache(async () => {
  const session = await requireSession("/settings/email")
  const [preference, organizationContext] = await Promise.all([
    getProductCommunicationsPreference(session.user.id),
    resolveActiveOrganization(session),
  ])
  if (!preference) throw new Error("Unable to load email preferences")

  const permanentlyBlocked = preference.activeSuppressionReasons.some(isPermanentDeliverySuppression)
  const providerPaused = preference.subscribed
    && preference.activeSuppressionReasons.includes("provider_unsubscribe")
  const confirmationRequired = preference.subscribed
    && (preference.eligibilityReason === "email_changed"
      || preference.eligibilityReason === "notice_outdated")
  const status = permanentlyBlocked
    ? "Blocked" as const
    : providerPaused
      ? "Pending" as const
      : confirmationRequired
        ? "Confirm" as const
        : preference.effectiveSubscribed
          ? "On" as const
          : "Off" as const

  return {
    backHref: organizationContext.activeOrganization ? "/library" : "/onboarding",
    backLabel: organizationContext.activeOrganization ? "Back to library" : "Continue to onboarding",
    confirmationRequired,
    lastPreferenceChange: preference.subscribed
      ? formatRecordedAt(preference.consentedAt)
      : formatRecordedAt(preference.withdrawnAt),
    permanentlyBlocked,
    preference,
    providerPaused,
    status,
  }
})

async function EmailPreferenceBackLink() {
  const { backHref, backLabel } = await loadEmailPreferencePage()

  return (
    <Button variant="ghost" className="-ml-2 w-fit" nativeButton={false} render={<Link href={backHref} />}>
      <ArrowLeftIcon data-icon="inline-start" />
      {backLabel}
    </Button>
  )
}

async function EmailPreferenceStatusCard() {
  const { lastPreferenceChange, preference, status } = await loadEmailPreferencePage()

  return (
    <aside data-testid="email-settings-content" className="rounded-[16px] border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">Product emails</span>
        <Badge variant={status === "On" ? "default" : status === "Blocked" ? "destructive" : "outline"}>
          {status}
        </Badge>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {lastPreferenceChange
          ? `${preference.subscribed ? "Consent recorded" : "Not subscribed since"} ${lastPreferenceChange} UTC.`
          : "No product-email consent has been recorded."}
      </p>
    </aside>
  )
}

async function EmailPreferenceFormSection() {
  const {
    confirmationRequired,
    permanentlyBlocked,
    preference,
    providerPaused,
    status,
  } = await loadEmailPreferencePage()

  return (
    <EmailPreferencesForm
      email={preference.email}
      initiallySubscribed={preference.subscribed}
      confirmationRequired={confirmationRequired}
      confirmationReason={preference.eligibilityReason === "email_changed" ? "email_changed" : "notice_outdated"}
      permanentlyBlocked={permanentlyBlocked}
      providerPaused={providerPaused}
      statusLabel={status}
    />
  )
}

function BackLinkFallback() {
  return <Skeleton className="h-10 w-40 rounded-xl" aria-hidden="true" />
}

function StatusCardFallback() {
  return <Skeleton className="h-29 rounded-[16px]" aria-hidden="true" />
}

function FormFallback() {
  return (
    <div aria-label="Loading email preferences" role="status">
      <Skeleton className="h-80 rounded-[16px]" />
    </div>
  )
}

export default function EmailSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pt-8 pb-28 md:px-6 md:py-12">
      <Suspense fallback={<BackLinkFallback />}>
        <EmailPreferenceBackLink />
      </Suspense>

      <header className="mt-8 grid grid-cols-1 gap-8 border-b pb-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Communication</p>
          <h1 data-testid="email-settings-shell" className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            Email preferences
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Choose whether Skills Board may send product news. Essential sign-in and team emails are managed separately.
          </p>
        </div>

        <Suspense fallback={<StatusCardFallback />}>
          <EmailPreferenceStatusCard />
        </Suspense>
      </header>

      <Suspense fallback={<FormFallback />}>
        <EmailPreferenceFormSection />
      </Suspense>
    </main>
  )
}
