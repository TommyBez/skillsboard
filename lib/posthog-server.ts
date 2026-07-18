import "server-only"

import { after } from "next/server"
import { PostHog } from "posthog-node"

import {
  ANALYTICS_SCHEMA_VERSION,
  type AnalyticsEventCapture,
  type NonTeamScopedCapturableAnalyticsEventName,
  type TeamScopedCapturableAnalyticsEventName,
} from "@/analytics/posthog/events"
import { getAnalyticsDeploymentEnvironment } from "@/lib/analytics-environment"

type PostHogEvent<EventName extends NonTeamScopedCapturableAnalyticsEventName> =
  AnalyticsEventCapture<EventName> & {
    distinctId: string
  }

type PostHogTeamEvent<EventName extends TeamScopedCapturableAnalyticsEventName> =
  AnalyticsEventCapture<EventName> & {
    distinctId: string
    teamId: string
  }

let posthogClient: PostHog | undefined

function getPostHogClient() {
  if (!posthogClient) {
    const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? ""
    posthogClient = new PostHog(token, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      disabled: !token,
      waitUntil: after,
    })
  }

  return posthogClient
}

/**
 * Product analytics is diagnostic and must never turn a successful mutation
 * into a user-visible failure.
 */
function captureEvent({
  distinctId,
  event,
  properties,
}: {
  distinctId: string
  event: string
  properties?: Record<string, unknown>
}) {
  try {
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId,
      event,
      properties: {
        ...properties,
        analytics_schema_version: ANALYTICS_SCHEMA_VERSION,
        deployment_environment: getAnalyticsDeploymentEnvironment(),
      },
    })
  } catch (error) {
    console.error("Unable to capture PostHog event", {
      event,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

export function capturePostHogEvent<
  EventName extends NonTeamScopedCapturableAnalyticsEventName,
>({
  distinctId,
  event,
  properties,
}: PostHogEvent<EventName>) {
  captureEvent({ distinctId, event, properties })
}

/**
 * Keep team-scoped events queryable without requiring PostHog's paid Groups
 * add-on. If Groups is enabled later, this stable team ID can become its key.
 */
export function captureTeamEvent<
  EventName extends TeamScopedCapturableAnalyticsEventName,
>({
  distinctId,
  event,
  properties,
  teamId,
}: PostHogTeamEvent<EventName>) {
  captureEvent({
    distinctId,
    event,
    properties: {
      ...properties,
      team_id: teamId,
    },
  })
}
