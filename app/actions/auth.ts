"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { capturePostHogEvent } from "@/lib/posthog-server"
import { safeReturnTo } from "@/lib/safe-return-to"
import { requireSession } from "@/lib/session"

export async function signOut(formData?: FormData) {
  const session = await requireSession()
  await auth.api.signOut({ headers: await headers() })
  await capturePostHogEvent({
    distinctId: session.user.id,
    event: "user_signed_out",
  })
  redirect(safeReturnTo(formData?.get("returnTo"), "/"))
}
