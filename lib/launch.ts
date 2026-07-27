export const launchPath = "/launch" as const

// Keep the announcement reviewable in local and preview deployments without
// exposing it on Production before the coordinated launch.
export const launchIsPublic = false
