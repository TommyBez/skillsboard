"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightIcon } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
  returnTo?: string
}

export function AuthForm({ mode, returnTo = "/library" }: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)
  const isSignUp = mode === "sign-up"

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError("")
    const email = String(formData.get("email"))
    const password = String(formData.get("password"))
    const fallbackError = isSignUp
        ? "We couldn’t create your account. Check your details and try again."
        : "We couldn’t sign you in. Check your email and password, then try again."

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ email, password, name: String(formData.get("name")) })
        : await authClient.signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message ?? fallbackError)
        return
      }
      const redirectUrl = result.data && "url" in result.data && typeof result.data.url === "string"
        ? result.data.url
        : null
      if (redirectUrl) {
        window.location.assign(redirectUrl)
        return
      }
      router.push(returnTo)
      router.refresh()
    } catch {
      setError(fallbackError)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">
      <FieldGroup className="gap-4">
        {isSignUp ? (
          <Field>
            <FieldLabel
              htmlFor="name"
              className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Your name
            </FieldLabel>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              className="h-12 rounded-[16px] border-border bg-background px-4 text-base shadow-none focus-visible:border-primary"
              required
            />
          </Field>
        ) : null}
        <Field>
          <FieldLabel
            htmlFor="email"
            className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Email
          </FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="h-12 rounded-[16px] border-border bg-background px-4 text-base shadow-none focus-visible:border-primary"
            required
          />
        </Field>
        <Field>
          <FieldLabel
            htmlFor="password"
            className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Password
          </FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="h-12 rounded-[16px] border-border bg-background px-4 text-base shadow-none focus-visible:border-primary"
            required
          />
          {isSignUp ? <FieldDescription className="text-xs">Use at least 8 characters.</FieldDescription> : null}
        </Field>
      </FieldGroup>
      {error ? (
        <p className="rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="h-12 w-full rounded-[16px] px-6" disabled={isPending}>
        {isPending ? (isSignUp ? "Creating account…" : "Signing in…") : isSignUp ? "Create free account" : "Sign in"}
        {!isPending ? <ArrowRightIcon data-icon="inline-end" /> : null}
      </Button>
      {isSignUp ? <p className="-mt-2 text-center text-xs text-muted-foreground">No credit card required.</p> : null}
      <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account?" : "New to Skills Board?"}{" "}
        <Link
          className="font-medium text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary"
          href={`${isSignUp ? "/sign-in" : "/sign-up"}${returnTo !== "/library" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  )
}
