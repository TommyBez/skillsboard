"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { safeReturnTo } from "@/lib/safe-return-to"
import { requireSession } from "@/lib/session"

export async function signOut(formData?: FormData) {
  await requireSession()
  await auth.api.signOut({ headers: await headers() })
  redirect(safeReturnTo(formData?.get("returnTo"), "/"))
}
