"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRightIcon } from "lucide-react"
import posthog from "posthog-js"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface AuthFormProps {
  mode: "sign-in" | "sign-up"
  returnTo?: string
  /** Resume OAuth/MCP authorize after login (full-page navigation). */
  continueHref?: string | null
  /** Query string preserved when switching between sign-in and sign-up. */
  preserveQuery?: string | null
  /** Development-only: any 6-digit code is accepted and no email is sent. */
  acceptAnyOtp?: boolean
}

const RESEND_COOLDOWN_SECONDS = 60
const OTP_LENGTH = 6

const otpSlotClassName =
  "size-11 rounded-[14px] border border-border bg-background text-base first:rounded-[14px] first:border-l last:rounded-[14px] data-[active=true]:border-primary data-[active=true]:ring-primary/30 sm:size-12"

export function AuthForm({
  mode,
  returnTo = "/library",
  continueHref = null,
  preserveQuery = null,
  acceptAnyOtp = false,
}: AuthFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const isSignUp = mode === "sign-up"
  const alternateHref = (() => {
    const path = isSignUp ? "/sign-in" : "/sign-up"
    if (preserveQuery) return `${path}?${preserveQuery}`
    if (returnTo !== "/library") return `${path}?returnTo=${encodeURIComponent(returnTo)}`
    return path
  })()

  useEffect(() => {
    if (resendIn <= 0) return
    const timer = window.setTimeout(() => setResendIn((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendIn])

  async function sendOtp(nextEmail: string) {
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: nextEmail,
      type: "sign-in",
    })
    if (result.error) {
      throw new Error(
        result.error.message ??
          (acceptAnyOtp
            ? "We couldn’t start sign-in. Try again."
            : "We couldn’t send a sign-in code. Try again."),
      )
    }
    setResendIn(RESEND_COOLDOWN_SECONDS)
  }

  async function handleEmailSubmit(formData: FormData) {
    setIsPending(true)
    setError("")
    const nextEmail = String(formData.get("email")).trim().toLowerCase()
    const nextName = isSignUp ? String(formData.get("name")).trim() : name

    try {
      await sendOtp(nextEmail)
      setEmail(nextEmail)
      if (isSignUp) setName(nextName)
      setOtp("")
      setStep("otp")
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : acceptAnyOtp
            ? "We couldn’t start sign-in. Try again."
            : "We couldn’t send a sign-in code. Try again.",
      )
    } finally {
      setIsPending(false)
    }
  }

  async function verifyOtp(nextOtp: string) {
    setIsPending(true)
    setError("")

    try {
      const result = await authClient.signIn.emailOtp({
        email,
        otp: nextOtp,
        ...(isSignUp && name ? { name } : {}),
      })
      if (result.error) {
        setError(result.error.message ?? "That code didn’t work. Request a new one and try again.")
        return
      }
      const userId =
        result.data && "user" in result.data && result.data.user && typeof result.data.user === "object" && "id" in result.data.user
          ? String(result.data.user.id)
          : null
      if (userId) {
        posthog.identify(userId)
      }
      posthog.capture(isSignUp ? "user_signed_up" : "user_signed_in")
      if (continueHref) {
        window.location.assign(continueHref)
        return
      }
      router.push(returnTo)
      router.refresh()
    } catch {
      setError("That code didn’t work. Request a new one and try again.")
    } finally {
      setIsPending(false)
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (otp.length !== OTP_LENGTH || isPending) return
    await verifyOtp(otp)
  }

  async function handleResend() {
    if (resendIn > 0 || isPending) return
    setIsPending(true)
    setError("")
    try {
      await sendOtp(email)
      setOtp("")
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : acceptAnyOtp
            ? "We couldn’t start sign-in. Try again."
            : "We couldn’t send a sign-in code. Try again.",
      )
    } finally {
      setIsPending(false)
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel
              htmlFor="otp"
              className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              One-time code
            </FieldLabel>
            <InputOTP
              id="otp"
              name="otp"
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={setOtp}
              disabled={isPending}
              autoFocus
              containerClassName="w-full justify-between gap-1.5 sm:gap-2"
            >
              <InputOTPGroup className="w-full justify-between gap-1.5 sm:gap-2">
                {Array.from({ length: OTP_LENGTH }, (_, index) => (
                  <InputOTPSlot key={index} index={index} className={otpSlotClassName} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription className="text-xs">
              {acceptAnyOtp ? (
                <>
                  Development mode: enter any {OTP_LENGTH}-digit code for{" "}
                  <span className="font-medium text-foreground">{email}</span>. No email is sent.
                </>
              ) : (
                <>
                  Enter the {OTP_LENGTH}-digit code we sent to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                </>
              )}
            </FieldDescription>
          </Field>
        </FieldGroup>
        {error ? (
          <p className="rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="h-12 w-full rounded-[16px] px-6" disabled={isPending || otp.length !== OTP_LENGTH}>
          {isPending ? "Verifying…" : isSignUp ? "Verify and create account" : "Verify and sign in"}
          {!isPending ? <ArrowRightIcon data-icon="inline-end" /> : null}
        </Button>
        <div className="flex flex-col gap-2 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          {!acceptAnyOtp ? (
            <button
              type="button"
              className="font-medium text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
              onClick={handleResend}
              disabled={isPending || resendIn > 0}
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
            </button>
          ) : null}
          <button
            type="button"
            className="font-medium text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary"
            onClick={() => {
              setStep("email")
              setOtp("")
              setError("")
            }}
          >
            Use a different email
          </button>
        </div>
      </form>
    )
  }

  return (
    <form action={handleEmailSubmit} className="flex flex-col gap-5">
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
              value={name}
              onChange={(event) => setName(event.target.value)}
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 rounded-[16px] border-border bg-background px-4 text-base shadow-none focus-visible:border-primary"
            required
          />
          <FieldDescription className="text-xs">
            {acceptAnyOtp
              ? "Development mode: continue with any 6-digit code. No email is sent."
              : "We’ll email you a one-time code. No password needed."}
          </FieldDescription>
        </Field>
      </FieldGroup>
      {error ? (
        <p className="rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="h-12 w-full rounded-[16px] px-6" disabled={isPending}>
        {isPending ? "Starting…" : acceptAnyOtp ? "Continue" : "Email me a code"}
        {!isPending ? <ArrowRightIcon data-icon="inline-end" /> : null}
      </Button>
      {isSignUp ? <p className="-mt-2 text-center text-xs text-muted-foreground">No credit card required.</p> : null}
      <p className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account?" : "New to Skills Board?"}{" "}
        <Link
          className="font-medium text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary"
          href={alternateHref}
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  )
}
