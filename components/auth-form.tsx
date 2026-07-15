"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)
  const isSignUp = mode === "sign-up"

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError("")
    const email = String(formData.get("email"))
    const password = String(formData.get("password"))
    const result = isSignUp
      ? await authClient.signUp.email({ email, password, name: String(formData.get("name")) })
      : await authClient.signIn.email({ email, password })
    if (result.error) {
      setError(result.error.message ?? "Authentication failed")
      setIsPending(false)
      return
    }
    router.push("/library")
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        {isSignUp ? (
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" name="name" autoComplete="name" required />
          </Field>
        ) : null}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" minLength={8} autoComplete={isSignUp ? "new-password" : "current-password"} required />
          {isSignUp ? <FieldDescription>Use at least 8 characters.</FieldDescription> : null}
        </Field>
      </FieldGroup>
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      <Button type="submit" size="lg" disabled={isPending}>{isPending ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}</Button>
      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account?" : "New to Skillbase?"}{" "}
        <Link className="font-medium text-foreground underline-offset-4 hover:underline" href={isSignUp ? "/sign-in" : "/sign-up"}>{isSignUp ? "Sign in" : "Create an account"}</Link>
      </p>
    </form>
  )
}
