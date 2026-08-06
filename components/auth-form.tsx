"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { ArrowRightIcon, Loader2Icon } from "lucide-react"
import { saveSignupProductCommunicationsConsent } from "@/app/actions/email-preferences"
import { authClient } from "@/lib/auth-client"
import { captureAnalyticsEvent } from "@/lib/analytics-client"
import { posthogReady } from "@/lib/posthog-client"
import { ButtonPendingContent } from "@/components/button-pending-content"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { PRODUCT_COMMUNICATIONS_DISCLOSURE } from "@/lib/email/product-communications"

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
const NEW_USER_WINDOW_MS = 2 * 60 * 1000

const otpSlotClassName =
  "size-11 rounded-[14px] border border-border bg-background text-base first:rounded-[14px] first:border-l last:rounded-[14px] data-[active=true]:border-primary data-[active=true]:ring-primary/30 sm:size-12"

function emailLocalPart(value: string): string {
  const local = value.split("@")[0]?.trim()
  return local || value
}

function isNewlyCreatedUser(user: { createdAt?: unknown } | null | undefined): boolean {
  if (!user?.createdAt) return false
  const createdAtMs = new Date(user.createdAt as string | Date).getTime()
  if (Number.isNaN(createdAtMs)) return false
  return Date.now() - createdAtMs < NEW_USER_WINDOW_MS
}

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
  const [productCommunications, setProductCommunications] = useState(false)
  const [error, setError] = useState("")
  const [pendingAction, setPendingAction] = useState<"email" | "verify" | "resend" | null>(null)
  const [resendIn, setResendIn] = useState(0)
  const isPending = pendingAction !== null
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
    setPendingAction("email")
    setError("")
    const nextEmail = String(formData.get("email")).trim().toLowerCase()
    const nextName = isSignUp ? String(formData.get("name")).trim() : name

    if (isSignUp) {
      captureAnalyticsEvent("signup_form_submitted", {
        method: "email_otp",
        signup_context: returnTo.startsWith("/invite/") ? "team_invitation" : "new_team",
      })
    }

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
      setPendingAction(null)
    }
  }

  function handleEmailFormSubmit(event: FormEvent<HTMLFormElement>) {
    // Avoid React 19 form actions so pending useState updates paint immediately.
    event.preventDefault()
    void handleEmailSubmit(new FormData(event.currentTarget))
  }

  async function verifyOtp(nextOtp: string) {
    setPendingAction("verify")
    setError("")

    try {
      const displayName = name.trim() || emailLocalPart(email)
      const result = await authClient.signIn.emailOtp({
        email,
        otp: nextOtp,
        name: displayName,
        ...(isSignUp
          ? { skillsboardProductCommunicationsChoice: productCommunications }
          : {}),
      })
      if (result.error) {
        setError(result.error.message ?? "That code didn’t work. Request a new one and try again.")
        return
      }
      const user =
        result.data && "user" in result.data && result.data.user && typeof result.data.user === "object"
          ? result.data.user
          : null
      const userId = user && "id" in user ? String(user.id) : null
      if (userId) {
        // Chained ahead of the captures below on the same promise, so the
        // identify always lands before them.
        void posthogReady().then((posthog) => posthog?.identify(userId))
      }
      // Both pages share signIn.emailOtp; emit based on whether the account was just created.
      if (isNewlyCreatedUser(user)) {
        captureAnalyticsEvent("user_signed_up", {
          method: "email_otp",
          signup_context: returnTo.startsWith("/invite/") ? "team_invitation" : "new_team",
        })
      } else {
        captureAnalyticsEvent("user_signed_in", { method: "email_otp" })
      }

      if (isSignUp && productCommunications) {
        try {
          // Best-effort: the account is already created at this point, and a
          // failed save simply leaves product emails off — the user can opt in
          // anytime from /settings/email.
          await saveSignupProductCommunicationsConsent()
        } catch {
          // Swallow: signup must not report failure for an optional preference.
        }
      }

      if (continueHref) {
        window.location.assign(continueHref)
        return
      }
      router.push(returnTo)
      router.refresh()
    } catch {
      setError("That code didn’t work. Request a new one and try again.")
    } finally {
      setPendingAction(null)
    }
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (otp.length !== OTP_LENGTH || isPending) return
    await verifyOtp(otp)
  }

  async function handleResend() {
    if (resendIn > 0 || isPending) return
    setPendingAction("resend")
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
      setPendingAction(null)
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
              pattern={REGEXP_ONLY_DIGITS}
              inputMode="numeric"
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
        {isSignUp && productCommunications ? (
          <p className="rounded-[16px] border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Because you selected product emails, verifying this code will also confirm that optional preference. You can
            turn it off anytime in Email preferences.
          </p>
        ) : null}
        {error ? (
          <p className="rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {isSignUp ? (
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            By creating your account, you agree to the{" "}
            <Link className="font-medium text-foreground underline underline-offset-4 hover:text-primary" href="/terms">
              Terms
            </Link>{" "}
            and acknowledge the{" "}
            <Link className="font-medium text-foreground underline underline-offset-4 hover:text-primary" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-[16px] px-6"
          disabled={isPending || otp.length !== OTP_LENGTH}
          aria-busy={pendingAction === "verify" || undefined}
        >
          <ButtonPendingContent pending={pendingAction === "verify"} pendingLabel="Verifying…">
            {isSignUp ? "Verify and create account" : "Verify and sign in"}
            <ArrowRightIcon data-icon="inline-end" />
          </ButtonPendingContent>
        </Button>
        <div className="flex flex-col gap-2 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          {!acceptAnyOtp ? (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 font-medium text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
              onClick={handleResend}
              disabled={isPending || resendIn > 0}
              aria-busy={pendingAction === "resend" || undefined}
            >
              {pendingAction === "resend" ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" aria-hidden="true" />
                  Sending…
                </>
              ) : resendIn > 0 ? (
                `Resend code in ${resendIn}s`
              ) : (
                "Resend code"
              )}
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
    <form onSubmit={handleEmailFormSubmit} className="flex flex-col gap-5">
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
        {isSignUp ? (
          <Field
            orientation="horizontal"
            className="items-start rounded-[16px] border border-border bg-muted/20 p-4"
          >
            <Checkbox
              id="product-communications"
              checked={productCommunications}
              onCheckedChange={setProductCommunications}
              disabled={isPending}
              aria-describedby="product-communications-description"
              className="mt-0.5"
            />
            <div className="min-w-0">
              <label htmlFor="product-communications" className="cursor-pointer text-sm font-medium text-foreground">
                Product emails (optional)
              </label>
              <p id="product-communications-description" className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {PRODUCT_COMMUNICATIONS_DISCLOSURE}{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
                >
                  Privacy details
                </Link>
              </p>
            </div>
          </Field>
        ) : null}
      </FieldGroup>
      {error ? (
        <p className="rounded-[16px] border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {isSignUp ? (
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to the{" "}
          <Link className="font-medium text-foreground underline underline-offset-4 hover:text-primary" href="/terms">
            Terms
          </Link>{" "}
          and acknowledge the{" "}
          <Link className="font-medium text-foreground underline underline-offset-4 hover:text-primary" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-[16px] px-6"
        disabled={isPending}
        aria-busy={pendingAction === "email" || undefined}
      >
        <ButtonPendingContent pending={pendingAction === "email"} pendingLabel="Starting…">
          {acceptAnyOtp ? "Continue" : "Email me a code"}
          <ArrowRightIcon data-icon="inline-end" />
        </ButtonPendingContent>
      </Button>
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
