import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { CheckCircle2Icon, MailXIcon } from "lucide-react"

import { LegalPageShell } from "@/components/legal-page-shell"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { isProductCommunicationsUnsubscribed } from "@/lib/email/email-preferences"
import {
  PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_COOKIE,
  verifyProductCommunicationsUnsubscribeToken,
} from "@/lib/email/email-privacy"

export const metadata: Metadata = {
  title: "Unsubscribe from product emails",
  description: "Stop optional Skills Board product communications without signing in.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
}

interface UnsubscribePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

async function UnsubscribeContent({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams
  const status = firstValue(params.status)
  const queryToken = firstValue(params.token)
  const confirmationToken = status === "success"
    ? (await cookies()).get(PRODUCT_COMMUNICATIONS_UNSUBSCRIBE_COOKIE)?.value ?? ""
    : ""
  const token = queryToken || confirmationToken
  const payload = token ? verifyProductCommunicationsUnsubscribeToken(token) : null
  const confirmedUnsubscribe = status === "success" && payload
    ? await isProductCommunicationsUnsubscribed({
        emailHash: payload.emailHash,
        userId: payload.userId,
      })
    : false

  if (confirmedUnsubscribe) {
    return (
      <LegalPageShell
        eyebrow="Email preferences"
        title="You are unsubscribed"
        description="You will not receive Skills Board product updates. Sign-in codes and team invitations are unchanged."
      >
        <section data-testid="unsubscribe-content" className="rounded-[16px] border border-primary/20 bg-primary/5 p-6">
          <CheckCircle2Icon className="size-8 text-primary" aria-hidden="true" />
          <h2 className="mt-5">Preference saved</h2>
          <p>
            The unsubscribe is effective immediately for future product communications. You can opt in again from Email
            preferences after signing in.
          </p>
          <Button className="mt-6" nativeButton={false} render={<Link href="/" />}>
            Return to Skills Board
          </Button>
        </section>
      </LegalPageShell>
    )
  }

  const hasError = status === "error" || status === "success"

  if (!payload || status === "invalid") {
    return (
      <LegalPageShell
        eyebrow="Email preferences"
        title="This link is not valid"
        description="The unsubscribe link is missing or invalid. No email preference was changed."
      >
        <section data-testid="unsubscribe-content" className="rounded-[16px] border border-border bg-card p-6">
          <MailXIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-5">Manage your preference another way</h2>
          <p>
            Sign in to update Email preferences, or contact us if you continue receiving product communications after
            asking to stop them.
          </p>
          <Button className="mt-6" nativeButton={false} render={<Link href="/settings/email" />}>
            Open Email preferences
          </Button>
        </section>
      </LegalPageShell>
    )
  }

  return (
    <LegalPageShell
      eyebrow="Email preferences"
      title="Unsubscribe from product emails"
      description="This stops optional product updates without requiring you to sign in."
    >
      <section data-testid="unsubscribe-content" className="rounded-[16px] border border-border bg-card p-6">
        <MailXIcon className="size-8 text-primary" aria-hidden="true" />
        <h2 className="mt-5">Stop product communications</h2>
        <p>
          You will no longer receive Skills Board product updates, launch news, practical guides, or research
          invitations. Transactional messages such as sign-in codes and team invitations are not affected.
        </p>
        {hasError ? (
          <p className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-destructive" role="alert">
            We could not save your preference. Please try again.
          </p>
        ) : null}
        <form
          action={`/api/email/unsubscribe?token=${encodeURIComponent(token)}&response=page`}
          method="post"
          className="mt-6"
        >
          <Button type="submit" size="lg">
            Unsubscribe from product emails
          </Button>
        </form>
      </section>
    </LegalPageShell>
  )
}

function UnsubscribeFallback() {
  return (
    <LegalPageShell
      eyebrow="Email preferences"
      title="Manage product emails"
      description="Loading your email preference securely."
    >
      <Skeleton className="h-64 rounded-[16px]" aria-label="Loading unsubscribe preference" />
    </LegalPageShell>
  )
}

export default function UnsubscribePage(props: UnsubscribePageProps) {
  return (
    <Suspense fallback={<UnsubscribeFallback />}>
      <UnsubscribeContent {...props} />
    </Suspense>
  )
}
