import "server-only"

import { createPostHogAdapter } from "@flags-sdk/posthog"
import type { Adapter, Identify } from "flags"
import { dedupe, flag } from "flags/next"

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

const identifyLaunchTreatment = dedupe(async () => ({
  // The treatment is a global launch switch, not a per-person experiment.
  distinctId: "skillsboard-public-homepage",
})) satisfies Identify<LaunchTreatmentEntities>

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

const launchTreatmentAdapter: Adapter<boolean, LaunchTreatmentEntities> = {
  ...postHogLaunchAdapter,
  async decide(params) {
    const override = launchTreatmentOverride()

    if (override !== undefined) {
      return override
    }

    return postHogLaunchAdapter.decide(params)
  },
}

// Skills Board is already publicly available. This flag controls only the
// temporary homepage treatment for the coordinated GTM launch. Proxy evaluates
// it once, then rewrites to a precomputed static variant of the canonical page.
export const launchTreatmentIsVisible = flag<boolean, LaunchTreatmentEntities>({
  key: launchTreatmentFlagKey,
  description: "Show the temporary coordinated-launch treatment on the homepage.",
  origin: "https://eu.posthog.com/project/225645/feature_flags/237551",
  defaultValue: false,
  options: [
    { label: "Standard homepage", value: false },
    { label: "Launch treatment", value: true },
  ],
  adapter: launchTreatmentAdapter,
  identify: identifyLaunchTreatment,
})

export const homepageFlags = [launchTreatmentIsVisible] as const
