"use client"

import { useState } from "react"
import { PlusIcon, UsersIcon } from "lucide-react"

import { CreateOrganizationForm } from "@/components/create-organization-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CreateOrganizationDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="size-10 shrink-0 rounded-xl border-border bg-card/65"
            aria-label="Create team library"
          />
        }
      >
        <PlusIcon className="size-4" />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-x-hidden overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border bg-muted/35 p-6 pr-14">
          <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UsersIcon className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle className="text-2xl font-semibold tracking-[-0.035em]">Create team library</DialogTitle>
          <DialogDescription className="max-w-md leading-relaxed">
            Name the shared place where your team will collect the skills it recommends.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <CreateOrganizationForm idPrefix="dialog-create-org" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
