"use client"

import type { ComponentProps, ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { LogOutIcon } from "lucide-react"
import posthog from "posthog-js"

import { signOut } from "@/app/actions/auth"
import { ButtonPendingContent } from "@/components/button-pending-content"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

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

export function SignOutButton({
  pendingLabel = "Signing out…",
  children = "Try another account",
  ...props
}: Omit<ComponentProps<typeof Button>, "type" | "children"> & {
  pendingLabel?: string
  children?: ReactNode
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      aria-busy={pending || undefined}
    >
      <ButtonPendingContent pending={pending} pendingLabel={pendingLabel}>
        {children}
      </ButtonPendingContent>
    </Button>
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
