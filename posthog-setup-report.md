<wizard-report>
# PostHog post-wizard report

The wizard has completed a PostHog integration for SkillsBoard — a Next.js 16 App Router application using `better-auth` for authentication and Drizzle ORM for data access. PostHog is initialized on the client via `instrumentation-client.ts`, and a reverse proxy is configured in `next.config.ts` to route requests through `/ingest`. A shared `lib/posthog-server.ts` helper provides the `posthog-node` client for server-side captures. User identification is performed client-side after successful auth and for returning protected-app visitors, while sign-out resets the client identity. Server events use `flushAt: 1` and `flushInterval: 0` so events flush before short-lived handlers exit.

The full-funnel hardening pass adds a global allowlist-based URL and property sanitizer, drops pageviews on invite/auth/consent routes in both PostHog and Vercel Analytics, disables generic autocapture, exception capture, and session replay, respects Do Not Track, and adds `analytics_schema_version` plus one build-time `deployment_environment` value to client and server events. Automatic PostHog pageviews remain enabled on non-sensitive routes.

The client `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and ingestion host only send events; they do not authorize analytics queries. GTM pulse reads require a separate server/local-only Personal API Key with minimum `Query Read`, the PostHog project ID, and the regional API host.

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `landing_cta_clicked` | Anonymous or returning visitor selected the landing primary CTA, with semantic placement. | `app/page.tsx`, `components/tracked-link.tsx` |
| `signup_form_submitted` | A signup form was submitted, distinguished between a new-team path and a team invitation. | `components/auth-form.tsx` |
| `user_signed_up` | User successfully created a new account via email and password. | `components/auth-form.tsx` |
| `user_signed_in` | User successfully signed in to an existing account via email and password. | `components/auth-form.tsx` |
| `user_signed_out` | User signed out of the app. | `app/actions/auth.ts` |
| `team_created` | User created a new team library, distinguished by `creation_surface=onboarding|in_app`. | `app/actions/organizations.ts` |
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

## GTM pulse read contract

1. Run `pnpm gtm:pulse:data` before the weekly pulse.
2. Consume only `.agents/loops/skillsboard-gtm-pulse-data.json`; never reconstruct metrics from dashboard screenshots, repository state, or ad hoc queries.
3. Require a fresh, schema-valid artifact with top-level `status=ready`. Otherwise emit only Tracking QA and do not route an action.
4. Preserve `data_status=available|unavailable|broken` per query. A valid zero is `available`; missing credentials, definitions, or sources are `unavailable`; a failed, stale, partial, or malformed result is `broken`. Never infer a missing value.

The runner requires `POSTHOG_PERSONAL_API_KEY` (`Query Read` only), `POSTHOG_PROJECT_ID`, and `POSTHOG_API_HOST`. Optional `POSTHOG_DEPLOYMENT_ENVIRONMENT` selects `production` (default), `preview`, or `development`. These values are server/local-only: do not prefix them with `NEXT_PUBLIC_`, expose them to browser code, print the key, or write it to the JSON artifact.

The pulse must not be described as live until these credentials target the intended production project, the runner succeeds, the artifact schema and freshness checks pass, and a dry run consumes the artifact without inference.

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
- [x] Sensitive route pageviews are dropped and remaining URLs/properties are allowlist-sanitized before client analytics events are sent.
- [x] Generic autocapture and session replay are disabled; explicit semantic events remain.
- [ ] Define analytics consent, opt-out, retention, deletion, and internal-user exclusion policy before treating the production scorecard as launch-ready.
- [x] Define and live-parse versioned team-level HogQL for Activation and `AAT-28` state transitions; API execution still waits on the read-only key.
- [ ] Configure the server/local-only PostHog query variables, validate `pnpm gtm:pulse:data` against production, and complete one artifact-only dry run before calling the GTM pulse live.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
</wizard-report>
