import type { AnalyticsCapturedEventProperties } from "@/analytics/posthog/events"

type McpEntryEventProperties = AnalyticsCapturedEventProperties<"mcp_entry_clicked">

export function mcpEntryEventProperties(
  signedIn: boolean,
  location: McpEntryEventProperties["location"],
  destination: McpEntryEventProperties["destination"],
): McpEntryEventProperties {
  return {
    destination,
    location,
    visitor_state: signedIn ? "signed_in" : "anonymous",
  }
}
