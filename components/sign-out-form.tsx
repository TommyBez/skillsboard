"use client"

import type { ReactNode } from "react"
import posthog from "posthog-js"

import { signOut } from "@/app/actions/auth"

interface SignOutFormProps {
  children: ReactNode
  returnTo?: string
  className?: string
}

export function SignOutForm({ children, returnTo, className }: SignOutFormProps) {
  return (
    <form
      className={className}
      action={async (formData) => {
        posthog.reset()
        await signOut(formData)
      }}
    >
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      {children}
    </form>
  )
}
