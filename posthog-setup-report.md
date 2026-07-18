<wizard-report>
# PostHog post-wizard report

The wizard has completed a PostHog integration for SkillsBoard — a Next.js 16 App Router application using `better-auth` for authentication and Drizzle ORM for data access. PostHog is initialized on the client via `instrumentation-client.ts`, and a reverse proxy is configured in `next.config.ts` to route requests through `/ingest`. A shared lazy singleton in `lib/posthog-server.ts` queues server-side captures and gives their background flushes to Next.js `after`, so mutations and MCP responses do not wait for analytics. User identification is performed client-side after successful auth and for returning protected-app visitors, while sign-out resets the client identity. The canonical event and property contract lives in `analytics/posthog/event-manifest.mjs` and drives TypeScript capture types plus scorecard validation.

The full-funnel instrumentation pass adds a narrow URL sanitizer for PostHog, Session Replay, and Vercel Analytics. It removes hashes and non-UTM query parameters and replaces invitation capability paths with `/invite/[redacted]`, while retaining canonical pageviews for signup, sign-in, consent, and invitation journeys. PostHog autocapture, exception capture, and project-configured Session Replay remain available, while Do Not Track is honored; only replay network bodies and headers plus the rendered invitation-link result are excluded because they can contain live credentials. Client and server events also receive `analytics_schema_version` plus one build-time `deployment_environment` value.

The client `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and ingestion host only send events; they do not authorize analytics queries. The GTM pulse now uses the authenticated official PostHog connector as its primary read/write control plane. A server/local-only Personal API Key with minimum `Query Read` remains available only for the fallback scorecard runner.

On 2026-07-17, a project-restricted `Query Read` key was configured locally and `pnpm gtm:pulse:data` completed against production project `225645`. All four aggregate queries returned execution-level `data_status=available`; the generated artifact passed explicit per-query output schemas, freshness, and secret-leak checks. Retention still reports stage-level `measurement_status=unavailable` until historical activation is reconciled. The artifact-only dry run correctly routed Tracking QA rather than a growth action because the current production sample still contains pre-v2 analytics: five required event types report `schema_mismatch` and six are missing.

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `landing_cta_clicked` | Anonymous or returning visitor selected the landing primary CTA, with semantic placement. | `app/page.tsx`, `components/tracked-link.tsx` |
| `signup_form_submitted` | A signup form was submitted, distinguished between a new-team path and a team invitation. | `components/auth-form.tsx` |
| `user_signed_up` | User successfully created a new account via email OTP. | `components/auth-form.tsx` |
| `user_signed_in` | User successfully signed in to an existing account via email OTP. | `components/auth-form.tsx` |
| `user_signed_out` | User signed out of the app. | `app/actions/auth.ts` |
| `team_created` | User created a new team library, distinguished by `creation_surface=onboarding\|in_app`. | `app/actions/organizations.ts` |
| `team_member_invited` | Admin or owner generated a team invitation link and triggered an invitation email. | `app/actions/organizations.ts` |
| `invitation_accepted` | User accepted a team invitation and joined the organization. | `app/actions/organizations.ts` |
| `skill_saved` | User saved a skill to their team library from a GitHub repository URL. | `app/actions/skills.ts` |
| `skill_deleted` | User removed a skill from their team library. | `app/actions/skills.ts` |
| `skill_note_updated` | User updated the note on a skill they added to the library. | `app/actions/skills.ts` |
| `skill_refreshed` | User refreshed a skill's GitHub metadata to pull the latest stars and description. | `app/actions/skills.ts` |
| `skill_downloaded` | User downloaded a skill as a ZIP archive from the library. | `app/api/skills/[skillId]/download/route.ts` |
| `skill_usage_path_selected` | User selected the source or command path in the library, or requested a command through MCP. | `components/skill-dossier.tsx`, `app/api/[transport]/route.ts` |
| `team_invite_prompt_viewed` | A single-member team with at least one skill saw the contextual invite prompt. | `components/invite-teammate-prompt.tsx` |
| `team_invite_prompt_clicked` | User opened team settings from the contextual invite prompt. | `components/invite-teammate-prompt.tsx` |
| `team_library_viewed` | An identified user entered a mounted library route state, with team, skill-count, and filter-state context; search/tag navigation is tracked and same-route skill mutations are deduplicated while mounted. | `components/team-library-analytics.tsx` |

All team-scoped events include a stable `team_id` property. Usage-path events also include `actor_is_skill_creator` so shared value can be distinguished from a creator reusing their own recommendation. Invitation emails, invitation IDs, team names, and full repository URLs are not sent in custom event properties.

## Full-funnel query rules

- Acquisition ends at anonymous signup intent; signup completion begins Activation.
- Raw traffic and intent are instrumented, but qualified visitors and source-to-activation attribution remain unavailable until their rules and team-level query are implemented.
- `signup_context=team_invitation` is team expansion and must not count as new-team Acquisition.
- Team creation distinguishes `creation_surface=onboarding|in_app`.
- Define a `team_value_action` action that unions `skill_usage_path_selected` and `skill_downloaded` with `actor_is_skill_creator=false`.
- Activation, `AAT-28`, retained, reactivated, and lost are cross-user metrics. Query them with HogQL grouped by `properties.team_id`; do not use a standard PostHog funnel grouped by `distinct_id`.
- Revenue is not instrumented because the hosted product is free forever. Sustainability combines aggregate infrastructure cost and founder-time inputs outside user-event analytics.

## GTM pulse PostHog contract

1. Discover the official connector's live capabilities and verify production project `225645` before any write.
2. Reconcile one Pulse-owned GTM dashboard and versioned stage/Tracking QA insights. Persist stable logical keys, ownership markers, definition hashes, and live PostHog IDs so retries reuse resources.
3. Use the currently exposed actions, embedded query filters, insights, dashboards, feature flags, experiments, surveys, and feature-flag scheduled changes for routed hypotheses. Cohort writes, annotations, and standalone filter resources are unsupported; never fall back to private APIs. Read live state before every transition and never mutate an unowned resource.
4. Preserve `data_status=available|unavailable|broken`. A valid zero is `available`; missing capabilities or definitions are `unavailable`; failed, stale, partial, or malformed results are `broken`. Stage-level measurement status still determines routability, and missing data is never inferred.
5. If the connector is unavailable, run `pnpm gtm:pulse:data` and consume the fresh schema-valid `.agents/loops/skillsboard-gtm-pulse-data.json` as read-only fallback evidence. Compare sources only when metric key, semantic version, and definition hash match; fallback data cannot authorize an action without live monitoring and rollback. Never reconstruct metrics from screenshots or repository/database guesses.

The fallback runner requires `POSTHOG_PERSONAL_API_KEY` (`Query Read` only), `POSTHOG_PROJECT_ID`, and `POSTHOG_API_HOST`. Optional `POSTHOG_DEPLOYMENT_ENVIRONMENT` selects `production` (default), `preview`, or `development`. These values are server/local-only: do not prefix them with `NEXT_PUBLIC_`, expose them to browser code, print the key, or write it to the JSON artifact.

The historical API path is validated. Growth actions still fail closed on metrics that have not passed production Tracking QA, including internal/test exclusion; the pulse may autonomously repair Pulse-owned PostHog assets or open a repository PR for verified instrumentation defects.

## Next steps

We've built some insights and a dashboard to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard:** [Analytics basics (wizard)](https://eu.posthog.com/project/225645/dashboard/825324)
- **Insight:** [New signups (wizard)](https://eu.posthog.com/project/225645/insights/sDN522Ks)
- **Insight:** [Skills saved per day (wizard)](https://eu.posthog.com/project/225645/insights/3Em9flQ9)
- **Insight:** [Signup to skill saved funnel (wizard)](https://eu.posthog.com/project/225645/insights/VMapGC47)
- **Insight:** [Skill downloads per day (wizard)](https://eu.posthog.com/project/225645/insights/wqFGLTr5)
- **Insight:** [Team growth (wizard)](https://eu.posthog.com/project/225645/insights/ixUpFGQU)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify in PostHog Error Tracking.
- [x] Returning signed-in visitors call `posthog.identify()` from the protected app shell.
- [x] Automatic analytics URLs are canonicalized before they are sent, while funnel pageviews and SDK-owned properties remain intact.
- [x] Autocapture, exception capture, and project-configured Session Replay remain available alongside explicit semantic events.
- [ ] Define analytics consent, opt-out, retention, deletion, and internal-user exclusion policy before treating each dependent production metric as decision-ready.
- [x] Define, live-parse, and API-execute versioned team-level HogQL for Activation and `AAT-28` state transitions; Retention now fails closed as `unavailable` until historical activation milestones are reconciled.
- [x] Configure server/local-only PostHog query fallback, validate `pnpm gtm:pulse:data` against production, and complete an artifact-only dry run; the affected metrics correctly remain in Tracking QA until their schema-v2 events are deployed and healthy, while independent stages may continue.
- [ ] Run connector capability discovery in a fresh Codex task, verify project `225645`, and reconcile the canonical Pulse dashboard and insight IDs.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
</wizard-report>
