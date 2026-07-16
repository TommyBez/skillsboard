"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { getPostHogClient } from "@/lib/posthog-server"
import { safeReturnTo } from "@/lib/safe-return-to"
import { requireSession } from "@/lib/session"

export async function signOut(formData?: FormData) {
  const session = await requireSession()
  const posthog = getPostHogClient()
  posthog.capture({
    distinctId: session.user.id,
    event: "user_signed_out",
  })
  await posthog.shutdown()
  await auth.api.signOut({ headers: await headers() })
  redirect(safeReturnTo(formData?.get("returnTo"), "/"))
}
