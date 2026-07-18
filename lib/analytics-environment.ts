export function getAnalyticsDeploymentEnvironment() {
  return process.env.NEXT_PUBLIC_ANALYTICS_ENVIRONMENT ?? "unknown"
}
