import { PostHog } from "posthog-node"

import {
  getAnalyticsDeploymentEnvironment,
  sanitizeAnalyticsValue,
} from "@/lib/posthog-client-privacy"

interface PostHogEvent {
  distinctId: string
  event: string
  properties?: Record<string, unknown>
}

interface PostHogTeamEvent extends PostHogEvent {
  teamId: string
}

export function getPostHogClient() {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? ""
  return new PostHog(token, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
    disabled: !token,
  })
}

/**
 * Product analytics is diagnostic and must never turn a successful mutation
 * into a user-visible failure.
 */
export async function capturePostHogEvent({
  distinctId,
  event,
  properties,
}: PostHogEvent) {
  try {
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId,
      event,
      properties: {
        ...sanitizeAnalyticsValue(properties ?? {}),
        analytics_schema_version: 2,
        deployment_environment: getAnalyticsDeploymentEnvironment(),
      },
    })
    await posthog.shutdown()
  } catch (error) {
    console.error("Unable to capture PostHog event", { event, error })
  }
}

/**
 * Keep team-scoped events queryable without requiring PostHog's paid Groups
 * add-on. If Groups is enabled later, this stable team ID can become its key.
 */
export function captureTeamEvent({
  distinctId,
  event,
  properties,
  teamId,
}: PostHogTeamEvent) {
  return capturePostHogEvent({
    distinctId,
    event,
    properties: {
      ...properties,
      team_id: teamId,
    },
  })
}
