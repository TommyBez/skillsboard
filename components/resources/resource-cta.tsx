"use client"

import { ArrowRightIcon } from "lucide-react"

import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"
import { TrackedLink } from "@/components/tracked-link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import type { GuidePath } from "@/lib/seo/guides"
import { resourcePaths } from "@/lib/seo/resources"

type ResourceLandingPath = GuidePath | typeof resourcePaths.index
type ResourceCtaLocation = "guide_inline" | "guide_closing" | "resources_closing"

function ctaProperties(
  landingPath: ResourceLandingPath,
  signedIn: boolean,
  location: ResourceCtaLocation,
): AnalyticsCapturedEventProperties<"landing_cta_clicked"> {
  return {
    destination: signedIn ? "/library" : "/sign-up",
    landing_path: landingPath,
    location,
    visitor_state: signedIn ? "signed_in" : "anonymous",
  }
}

export function ResourceCta({
  landingPath,
  location,
}: {
  landingPath: ResourceLandingPath
  location: ResourceCtaLocation
}) {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <Skeleton className="h-11 w-56 rounded-[3px]" aria-busy="true" />
  }

  const signedIn = Boolean(session?.user)
  const href = signedIn ? "/library" : "/sign-up"

  return (
    <Button
      size="lg"
      className="rounded-[3px]"
      nativeButton={false}
      render={(
        <TrackedLink
          href={href}
          analytics={{
            event: "landing_cta_clicked",
            properties: ctaProperties(landingPath, signedIn, location),
          }}
        />
      )}
    >
      {signedIn ? "Open your team library" : "Create your team library"}
      <ArrowRightIcon data-icon="inline-end" />
    </Button>
  )
}
