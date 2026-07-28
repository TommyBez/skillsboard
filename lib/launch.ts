import "server-only"

import { createPostHogAdapter } from "@flags-sdk/posthog"
import type { Adapter } from "flags"
import { cacheLife } from "next/cache"
import { flag } from "flags/next"

const launchTreatmentFlagKey = "homepage-launch-treatment"

type LaunchTreatmentEntities = {
  distinctId: string
}

function launchTreatmentOverride(): boolean | undefined {
  if (process.env.LAUNCH_TREATMENT_OVERRIDE === "true") {
    return true
  }

  if (process.env.LAUNCH_TREATMENT_OVERRIDE === "false") {
    return false
  }

  return undefined
}

const postHogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ?? ""
const postHogLaunchAdapter: Adapter<boolean, LaunchTreatmentEntities> = postHogToken
  ? createPostHogAdapter({
      postHogKey: postHogToken,
      postHogOptions: {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        disableGeoip: true,
        requestTimeout: 1_500,
      },
    }).isFeatureEnabled({ sendFeatureFlagEvents: false })
  : {
      decide({ defaultValue }) {
        return typeof defaultValue === "boolean" ? defaultValue : false
      },
    }

// Skills Board is already publicly available. This flag controls only the
// temporary homepage treatment for the coordinated GTM launch. PostHog is the
// default authority; the explicit environment override exists for local and
// preview review. Missing configuration or provider failures fail closed.
const launchTreatmentFlag = flag<boolean, LaunchTreatmentEntities>({
  key: launchTreatmentFlagKey,
  description: "Show the temporary coordinated-launch treatment on the homepage.",
  defaultValue: false,
  options: [
    { label: "Standard homepage", value: false },
    { label: "Launch treatment", value: true },
  ],
  adapter: postHogLaunchAdapter,
})

async function cachedLaunchTreatmentDecision() {
  "use cache"
  cacheLife({ stale: 15, revalidate: 15, expire: 60 })

  return launchTreatmentFlag.run({
    // The treatment is a global launch switch, not a per-person experiment.
    identify: { distinctId: "skillsboard-public-homepage" },
    // A synthetic request avoids reading request headers or cookies, keeping the
    // global homepage variant compatible with Next.js Cache Components.
    request: new Request("https://skillsboard.sh/"),
  })
}

export async function launchTreatmentIsVisible() {
  return launchTreatmentOverride() ?? cachedLaunchTreatmentDecision()
}
