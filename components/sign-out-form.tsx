"use client"

import type { ComponentProps, ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { LogOutIcon } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { ButtonPendingContent } from "@/components/button-pending-content"
import { FormSubmitButton } from "@/components/form-submit-button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { loadPostHog } from "@/lib/posthog-browser"

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
        try {
          const posthog = await loadPostHog()
          posthog.reset()
        } catch {
          // Analytics must not block sign-out.
        }
        await signOut(formData)
      }}
    >
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      {children}
    </form>
  )
}

export function SignOutButton({
  pendingLabel = "Signing out…",
  children = "Try another account",
  ...props
}: Omit<ComponentProps<typeof FormSubmitButton>, "type" | "pendingLabel" | "children"> & {
  pendingLabel?: string
  children?: ReactNode
}) {
  return (
    <FormSubmitButton pendingLabel={pendingLabel} {...props}>
      {children}
    </FormSubmitButton>
  )
}

export function SignOutMenuItem() {
  const { pending } = useFormStatus()

  return (
    <DropdownMenuItem
      className="w-full gap-2 rounded-lg px-3 py-2 text-sm font-medium"
      disabled={pending}
      nativeButton
      render={<button type="submit" disabled={pending} aria-busy={pending || undefined} />}
    >
      <ButtonPendingContent pending={pending} pendingLabel="Signing out…">
        <LogOutIcon className="size-4" aria-hidden="true" />
        Sign out
      </ButtonPendingContent>
    </DropdownMenuItem>
  )
}
