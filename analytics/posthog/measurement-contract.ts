export const qualifiedPublicVisitorDefinitionV1 = {
  attribution: {
    applicationOwnedState: false,
    identity: "PostHog native identity and session stitching",
    outcomeEvent: "team_created",
    outcomeUnit: "unique properties.team_id",
    sourceProperties:
      "PostHog-native first-touch, referrer, and UTM properties after official schema or connector verification",
    touchpoint: "first qualified_public_visitor in the 30 days before team_created",
    windowDays: 30,
  },
  event: "qualified_public_visitor",
  exclusions: [
    "non-production hosts",
    "localhost and preview traffic",
    "authenticated application routes",
    "invitation and authentication routes",
    "internal and test activity excluded by production Tracking QA",
  ],
  productionHost: "www.skillsboard.sh",
  qualification: {
    criterion: "15 seconds of foreground-visible time on an eligible public page",
    minimumVisibleMilliseconds: 15_000,
    excludesConversionEvents: ["landing_cta_clicked", "signup_form_submitted", "team_created"],
  },
  unit: "unique PostHog distinct_id",
  version: 1,
} as const

export type PublicLandingSurface = "guide" | "home" | "resources"

export function resolvePublicLandingSurface(pathname: string): PublicLandingSurface | null {
  if (pathname === "/") return "home"
  if (pathname === "/resources" || pathname.startsWith("/resources/")) return "resources"
  if (pathname.startsWith("/guides/")) return "guide"
  return null
}
