import "server-only"

import { after } from "next/server"
import { PostHog } from "posthog-node"

import {
  type AnalyticsEventCapture,
  type NonTeamScopedCapturableAnalyticsEventName,
  type TeamScopedCapturableAnalyticsEventName,
} from "@/analytics/posthog/events"

type ServerEvent<EventName extends NonTeamScopedCapturableAnalyticsEventName> =
  AnalyticsEventCapture<EventName> & {
    distinctId: string
  }

type ServerTeamEvent<EventName extends TeamScopedCapturableAnalyticsEventName> =
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
      disabled: !token || process.env.VERCEL_ENV !== "production",
      waitUntil: after,
    })
  }

  return posthogClient
}

function enqueueEvent({
  distinctId,
  event,
  properties,
}: {
  distinctId: string
  event: string
  properties?: Record<string, unknown>
}) {
  try {
    getPostHogClient().capture({
      distinctId,
      event,
      properties,
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
>(capture: ServerEvent<EventName>) {
  enqueueEvent(capture)
}

export function captureTeamEvent<
  EventName extends TeamScopedCapturableAnalyticsEventName,
>({ distinctId, event, properties, teamId }: ServerTeamEvent<EventName>) {
  enqueueEvent({
    distinctId,
    event,
    properties: {
      ...properties,
      team_id: teamId,
    },
  })
}
