# PostHog analytics control plane

**Node:** `analytics.control_plane`

Use only the official authenticated PostHog plugin for production project `225645`. Verify project identity and manage only exact Pulse-owned assets. Never substitute private endpoints, keys, custom clients, screenshots, repository guesses, or database proxies.

Read/write analytics assets directly through the parent using the exact routed operation. Official provider confirmation is required only for account authorization, binding terms, spend, or an irreversible destructive action. A missing discovery helper, SDK doctor, dashboard, insight, event, property, historical window, cohort, or diagnostic does not block product, SEO, social, community, repository, or another provider action.

Production analysis filters `properties.$host = 'www.skillsboard.sh'`, excludes internal/test traffic, sanitizes URLs, and uses event `properties.team_id` for team behavior. These rules protect truthful reporting and privacy; they do not authorize inactivity.

Flags, experiments, surveys, dashboards, insights, and definitions may be created or updated whenever their exact routed provider operation exists and the effect is authorized. There is no read-only-to-shadow-to-enabled lifecycle, asset cap, WIP gate, maturity requirement, exposure wait, preregistration gate, or measurement-health prerequisite.

Do not publish a metric claim unless its definition, window, denominator, exclusions, and source are truthful. Broken or missing measurement is reported as `measurement_failure` for the metric only and triggers instrumentation work rather than blocking other action.

Persist only project/asset IDs, definitions, hashes, relevant measurement results, and privacy status. Expected authorized metadata and browser-safe `phc_` tokens are not incidents.
