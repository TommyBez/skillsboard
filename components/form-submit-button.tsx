"use client"

import type { ComponentProps, ReactNode } from "react"
import { useFormStatus } from "react-dom"

import { ButtonPendingContent } from "@/components/button-pending-content"
import { Button } from "@/components/ui/button"

type FormSubmitButtonProps = Omit<ComponentProps<typeof Button>, "type"> & {
  pendingLabel: ReactNode
  children: ReactNode
}

/** Submit control that reflects React 19 form-action pending state. */
export function FormSubmitButton({
  pendingLabel,
  children,
  disabled,
  ...props
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      <ButtonPendingContent pending={pending} pendingLabel={pendingLabel}>
        {children}
      </ButtonPendingContent>
    </Button>
  )
}

export function useFormPending() {
  return useFormStatus().pending
}
