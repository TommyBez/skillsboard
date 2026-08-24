<wizard-report>
# PostHog post-wizard report

The wizard has completed a PostHog integration for SkillsBoard — a Next.js 16 App Router application using `better-auth` for authentication and Drizzle ORM for data access. The canonical Next.js `instrumentation-client.ts` entry starts the lazy PostHog singleton globally, and a reverse proxy is configured in `next.config.ts` to route requests through `/ingest`. Identity-scoped layouts independently call `identify(userId)` and `register({ team_id })` when their existing user and team context is available. PostHog owns pageview capture natively through `capture_pageview: "history_change"`, so the application does not emit `$pageview` itself. A shared lazy singleton in `lib/posthog-server.ts` queues server-side captures and gives their background flushes to Next.js `after`, so mutations and MCP responses do not wait for analytics. Sign-out resets the client identity. The canonical typed event and property contract lives in `analytics/posthog/events.ts` and drives browser and server capture types.

The full-funnel instrumentation pass adds a narrow URL sanitizer for PostHog, Session Replay, and Vercel Analytics. It removes hashes and non-UTM query parameters and replaces invitation capability paths with `/invite/[redacted]`, while retaining canonical pageviews for signup, sign-in, consent, and invitation journeys. PostHog autocapture, exception capture, and project-configured Session Replay remain available, while Do Not Track is honored; only replay network bodies and headers plus the rendered invitation-link result are excluded because they can contain live credentials. Analytics ingestion is disabled outside Vercel production.

The browser initializes PostHog only when the Production-scoped `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` exists. The server SDK uses its native `disabled` option outside Vercel production.

The production baseline starts with the successful production deployment of this change. Events captured before that cutover may include development or Preview traffic and are not decision-ready without explicit reconciliation.

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `landing_cta_clicked` | Anonymous or returning visitor selected the landing primary CTA, with semantic placement. | `app/page.tsx`, `components/tracked-link.tsx` |
| `mcp_entry_clicked` | Visitor or signed-in user opened the MCP story or setup path, with the discovery surface and destination. | `app/page.tsx`, `components/app-header.tsx`, `components/account-menu.tsx`, `app/(app)/library/page.tsx` |
| `$pageview` | PostHog-native route view. Use `$pathname=/connect` for the MCP guide and `$pathname=/start` for first-run steps; after identity synchronization, authenticated views carry the active `team_id`. | `instrumentation-client.ts`, `lib/posthog-client.ts`, `components/posthog-identity.tsx` |
| `mcp_client_selected` | User selected one of the bounded client setup guides. | `components/mcp-setup-guide.tsx` |
| `mcp_config_copied` | Visitor successfully copied a client-specific or generic MCP configuration snippet. | `components/mcp-setup-guide.tsx`, `components/onboarding-next-steps.tsx` |
| `mcp_authorization_approved` | User approved MCP access in the OAuth consent flow. | `components/consent-form.tsx` |
| `mcp_authorization_denied` | User denied MCP access in the OAuth consent flow. | `components/consent-form.tsx` |
| `mcp_tool_used` | An authenticated MCP client called a Skills Board tool, with the bounded tool name and success state. | `app/api/[transport]/route.ts` |
| `signup_form_submitted` | A signup form was submitted, distinguished between a new-team path and a team invitation. | `components/auth-form.tsx` |
| `user_signed_up` | User successfully created a new account via email OTP. | `components/auth-form.tsx` |
| `user_signed_in` | User successfully signed in to an existing account via email OTP. | `components/auth-form.tsx` |
| `user_signed_out` | User signed out of the app. | `app/actions/auth.ts` |
| `team_created` | User created a new team library, distinguished by `creation_surface=onboarding\|in_app`. | `app/actions/organizations.ts` |
| `team_member_invited` | Admin or owner generated a team invitation link and triggered an invitation email, with the surface the form was rendered on. | `app/actions/organizations.ts` |
| `invitation_accepted` | User accepted a team invitation and joined the organization. | `app/actions/organizations.ts` |
| `skill_saved` | User saved a skill to their team library from a GitHub repository URL. | `app/actions/skills.ts` |
| `skill_deleted` | User removed a skill from their team library. | `app/actions/skills.ts` |
| `skill_note_updated` | User updated the note on a skill they added to the library. | `app/actions/skills.ts` |
| `skill_refreshed` | User refreshed a skill's GitHub metadata to pull the latest stars and description. | `app/actions/skills.ts` |
| `skill_downloaded` | User downloaded a skill as a ZIP archive from the library. | `app/api/skills/[skillId]/download/route.ts` |
| `skill_usage_path_selected` | User selected the source or command path in the library, or requested a command through MCP. | `components/skill-dossier.tsx`, `app/api/[transport]/route.ts` |
| `team_invite_prompt_viewed` | A single-member team saw the invite ask, distinguished by `trigger=first_skill_saved` (the step that opens the moment the team's first skill lands) or `trigger=library_revisit` (the library banner). | `components/first-skill-invite-step.tsx`, `components/invite-teammate-prompt.tsx` |
| `team_invite_prompt_clicked` | User acted on the invite ask: submitted the invitation form in the first-skill step, or opened team settings from the library banner. Same `trigger` split as the viewed event. | `components/first-skill-invite-step.tsx`, `components/invite-teammate-prompt.tsx` |
| `team_invite_link_copied` | User copied the invitation link to share it outside email, from the first-skill step or from team settings. | `components/invite-member-form.tsx` |
| `team_library_viewed` | An identified user entered a mounted library route state, with team, skill-count, and filter-state context; search/tag navigation is tracked and same-route skill mutations are deduplicated while mounted. | `components/team-library-analytics.tsx` |

The browser registers `team_id` as a PostHog super property beside user identification, so it is attached to pageviews, autocapture, exceptions, and subsequent custom browser events until the active team changes, sign-out resets identity, or a no-team state explicitly clears it. `PostHogIdentity` only synchronizes the resolved user and team. Team creation and invitation acceptance await the new team context before navigation; organization switching refreshes product state immediately and starts the PostHog update in the same client turn without allowing optional analytics to block the refresh. Because the global SDK bootstrap and the first authenticated identity effect are independent, a cold initial pageview can arrive before `team_id` is registered; the application accepts that narrow case instead of replacing PostHog's native pageview lifecycle with a custom coordinator. Server and MCP events remain stateless and receive the same property through the tested `withTeamAnalyticsScope` payload builder. This includes every `skill_saved` producer in `lib/save-skill.ts`; production observations must still be filtered to events ingested after the deployed producer change before classifying the property as missing. Skills Board assumes event capture is not duplicating until concrete contrary evidence exists. A duplicate investigation starts only from a reproducible repeated capture, a provider integrity alert, or an observed incompatible repeated business event; it is not routine Tracking QA. Usage-path events also include `actor_is_skill_creator` so shared value can be distinguished from a creator reusing their own recommendation. The three invite events carry the same property, read there as "this actor has put at least one skill in the library they are inviting someone into"; in the first-skill step it is always true, because reaching the step means the actor just saved that skill. MCP setup events use bounded client and surface enums; MCP searches, OAuth client names, queries, invitation emails, invitation IDs, team names, and full repository URLs are not sent in custom event properties.

## Full-funnel query rules

- Acquisition ends at anonymous signup intent; signup completion begins Activation.
- Measure acquisition with PostHog-native unique visitors, sessions, pageviews, and pageview duration on the exact production host `www.skillsboard.sh`, then use the real conversion events `landing_cta_clicked`, `signup_form_submitted`, `user_signed_up`, and `team_created`.
- There is no custom engaged or qualified visitor event and no application-defined attention threshold. Skills Board does not duplicate PostHog session, referrer, UTM, first-touch, or page-duration state in application events.
- Use PostHog-native session and acquisition properties when analyzing journeys to real conversion events. This contract does not define a custom source-to-new-team classifier, attribution cookie, or frozen source-to-team rule.
- For the MCP and first-run view denominators, use the legacy `mcp_setup_viewed` / `onboarding_steps_viewed` events only before this deployment's cutover and `$pageview` filtered to `/connect` / `/start` after it. Do not union the overlapping pre-cutover period without a date filter.
- `signup_context=team_invitation` is team expansion and must not count as new-team Acquisition.
- Team creation distinguishes `creation_surface=onboarding|in_app`.
- Define a `team_value_action` action that unions `skill_usage_path_selected` and `skill_downloaded` with `actor_is_skill_creator=false`.
- Activation, retention, reactivation, and loss are cross-user metrics. Query them with HogQL grouped by `properties.team_id`; do not use a standard PostHog funnel grouped by `distinct_id`.
- Revenue is not instrumented because the hosted product is free forever. Sustainability combines aggregate infrastructure cost and founder-time inputs outside user-event analytics.

## Next steps

We've built some insights and a dashboard to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard:** [Analytics basics (wizard)](https://eu.posthog.com/project/225645/dashboard/825324)
- **Insight:** [New signups (wizard)](https://eu.posthog.com/project/225645/insights/sDN522Ks)
- **Insight:** [Skills saved per day (wizard)](https://eu.posthog.com/project/225645/insights/3Em9flQ9)
- **Insight:** [Signup to skill saved funnel (wizard)](https://eu.posthog.com/project/225645/insights/VMapGC47)
- **Insight:** [Skill downloads per day (wizard)](https://eu.posthog.com/project/225645/insights/wqFGLTr5)
- **Insight:** [Team growth (wizard)](https://eu.posthog.com/project/225645/insights/ixUpFGQU)

## Verify before merging

- [x] Run a full production build and fix any lint or type errors introduced by the tracking cutover.
- [x] Run the test suite, including the route-tracking contract and removal of duplicate view events.
- [x] Document `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` as Production-only Vercel configuration.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify in PostHog Error Tracking.
- [x] Returning signed-in visitors call `posthog.identify()` from the protected app shell.
- [x] Analytics URLs are canonicalized by the shared `before_send` hook before PostHog sends native `$pageview` events, while funnel paths and SDK-owned properties remain intact.
- [x] Autocapture, exception capture, and project-configured Session Replay remain available alongside explicit semantic events.
- [ ] Define analytics consent, opt-out, retention, deletion, and internal-user exclusion policy before treating each dependent production metric as decision-ready.
- [x] Define team-level HogQL semantics for activation and retention state transitions; retention fails closed as `unavailable` until historical activation milestones are reconciled.
- [ ] Verify production project `225645` and the current dashboard and insight IDs in PostHog before relying on them.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
</wizard-report>
