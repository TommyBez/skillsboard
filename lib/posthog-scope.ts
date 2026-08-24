"use client"

import type posthogJs from "posthog-js"

import { sanitizeAnalyticsUrl } from "@/lib/analytics-url-privacy"
import {
  hasPostHogStarted,
  posthogReady,
  posthogWhenStarted,
} from "@/lib/posthog-client"
import {
  applyPostHogScope,
  type DesiredPostHogScope,
} from "@/lib/posthog-scope-state"

type PostHogClient = typeof posthogJs
export type PostHogScopeRequirement = "team" | "user"

interface PostHogIdentityScope {
  teamId?: string
  userId: string
}

interface PendingPageView {
  pathname: string
  url: string
}

const scopeRequirements = new Map<symbol, PostHogScopeRequirement>()
const identityScopes = new Map<symbol, PostHogIdentityScope>()
const registryWaiters = new Set<() => void>()

let applicationQueue: Promise<void> = Promise.resolve()
let pageViewCapturePromise: Promise<void> | null = null
let pendingPageView: PendingPageView | null = null
let lastCapturedPathname: string | null = null
let startupScheduled = false

function currentRequirement(): PostHogScopeRequirement | "anonymous" {
  let requirement: PostHogScopeRequirement | "anonymous" = "anonymous"
  for (const candidate of scopeRequirements.values()) {
    if (candidate === "team") return "team"
    requirement = "user"
  }
  return requirement
}

function latestIdentity(requirement: PostHogScopeRequirement) {
  const identities = [...identityScopes.values()].reverse()
  return requirement === "team"
    ? identities.find((identity) => identity.teamId)
    : identities[0]
}

function desiredScope(): DesiredPostHogScope | null {
  const requirement = currentRequirement()
  if (requirement === "anonymous") {
    // A just-completed sign-in can register its user synchronously before the
    // destination layout streams in. Public routes otherwise keep the SDK's
    // existing identified person without inventing a new identity.
    const identity = [...identityScopes.values()].at(-1)
    return { teamId: null, userId: identity?.userId ?? null }
  }

  const identity = latestIdentity(requirement)
  if (!identity) return null

  return {
    teamId: requirement === "team" ? identity.teamId ?? null : null,
    userId: identity.userId,
  }
}

function sameScope(left: DesiredPostHogScope | null, right: DesiredPostHogScope | null) {
  return left?.teamId === right?.teamId && left?.userId === right?.userId
}

function announceRegistryChange() {
  for (const resolve of registryWaiters) resolve()
  registryWaiters.clear()

  // A team switch or a move back to a public/account route must update an
  // already-running SDK even when the pathname (and therefore pageview) stays
  // the same. This never starts the lazy SDK on its own.
  if (hasPostHogStarted()) {
    void posthogReadyForAnalyticsScope({ start: false })
  }
}

function waitForDesiredScope(): Promise<DesiredPostHogScope> {
  const desired = desiredScope()
  if (desired) return Promise.resolve(desired)

  return new Promise((resolve) => {
    const retry = () => {
      const next = desiredScope()
      if (next) resolve(next)
      else registryWaiters.add(retry)
    }
    registryWaiters.add(retry)
  })
}

function applyScope(posthog: PostHogClient, expected: DesiredPostHogScope) {
  let applied = false
  const operation = applicationQueue.then(() => {
    const latest = desiredScope()
    if (!latest || !sameScope(latest, expected)) return
    applyPostHogScope(posthog, latest)
    applied = true
  })

  applicationQueue = operation.then(
    () => undefined,
    () => undefined,
  )

  return operation.then(() => applied)
}

export async function posthogReadyForAnalyticsScope({
  start = true,
}: { start?: boolean } = {}): Promise<PostHogClient | null> {
  while (true) {
    const expected = await waitForDesiredScope()
    const posthog = await (start ? posthogReady() : posthogWhenStarted())
    if (!posthog) return null

    const applied = await applyScope(posthog, expected)
    if (applied && sameScope(desiredScope(), expected)) return posthog
  }
}

export function registerPostHogScopeRequirement(requirement: PostHogScopeRequirement) {
  const registration = Symbol(requirement)
  scopeRequirements.set(registration, requirement)
  announceRegistryChange()

  return () => {
    scopeRequirements.delete(registration)
    announceRegistryChange()
  }
}

export function registerPostHogIdentity(identity: PostHogIdentityScope) {
  const registration = Symbol(identity.userId)
  identityScopes.set(registration, identity)
  announceRegistryChange()

  return () => {
    identityScopes.delete(registration)
    announceRegistryChange()
  }
}

function scheduleStartup() {
  if (startupScheduled) return
  startupScheduled = true

  const start = () => void posthogReadyForAnalyticsScope()
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(start, { timeout: 2000 })
  } else {
    window.setTimeout(start, 800)
  }
}

function capturePendingPageView(): Promise<void> {
  if (pageViewCapturePromise) return pageViewCapturePromise

  pageViewCapturePromise = (async () => {
    while (pendingPageView) {
      const requested = pendingPageView
      const posthog = await posthogReadyForAnalyticsScope({ start: false })

      if (pendingPageView !== requested) continue
      if (window.location.pathname !== requested.pathname) {
        pendingPageView = {
          pathname: window.location.pathname,
          url: sanitizeAnalyticsUrl(window.location.href),
        }
        continue
      }
      pendingPageView = null
      if (!posthog) continue

      posthog.capture("$pageview", {
        $current_url: requested.url,
        $pathname: requested.pathname,
      })
      lastCapturedPathname = requested.pathname
    }
  })().finally(() => {
    pageViewCapturePromise = null
    if (pendingPageView) void capturePendingPageView()
  })

  return pageViewCapturePromise
}

/** Ensures the canonical route view is queued before a user's page action. */
export async function posthogReadyForAnalyticsCapture() {
  const posthog = await posthogReadyForAnalyticsScope()
  if (!posthog) return null
  await capturePendingPageView()
  return posthog
}

/** Applies the user returned by OTP before its sign-in/up event is captured. */
export async function identifyPostHogUser(userId: string) {
  const unregister = registerPostHogIdentity({ userId })
  try {
    return await posthogReadyForAnalyticsCapture()
  } finally {
    unregister()
  }
}

export function schedulePostHogPageView(pathname: string) {
  if (lastCapturedPathname === pathname && !pendingPageView) return

  pendingPageView = {
    pathname,
    url: sanitizeAnalyticsUrl(window.location.href),
  }
  scheduleStartup()
  void capturePendingPageView()
}
