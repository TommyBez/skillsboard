<wizard-report>
# PostHog post-wizard report

The wizard has completed a full PostHog integration for SkillsBoard — a Next.js 16 App Router application using `better-auth` for authentication and Drizzle ORM for data access. PostHog is initialized on the client via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), and a reverse proxy is configured in `next.config.ts` to route PostHog requests through `/ingest` to avoid ad blockers. A shared `lib/posthog-server.ts` helper provides the `posthog-node` client for all server-side captures. User identification is performed client-side in `components/auth-form.tsx` immediately after a successful sign-in or sign-up, and `posthog.reset()` is called server-side on sign-out. All server-side events (skill lifecycle, organization creation, invitation flows, and ZIP downloads) use `posthog-node` with `flushAt: 1` and `flushInterval: 0` so events flush before each short-lived handler exits.

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `user_signed_up` | User successfully created a new account via email and password. | `components/auth-form.tsx` |
| `user_signed_in` | User successfully signed in to an existing account via email and password. | `components/auth-form.tsx` |
| `user_signed_out` | User signed out of the app. | `app/actions/auth.ts` |
| `team_created` | User created a new team library during onboarding. | `app/actions/organizations.ts` |
| `team_member_invited` | Admin or owner generated a team invitation link and triggered an invitation email. | `app/actions/organizations.ts` |
| `invitation_accepted` | User accepted a team invitation and joined the organization. | `app/actions/organizations.ts` |
| `skill_saved` | User saved a skill to their team library from a GitHub repository URL. | `app/actions/skills.ts` |
| `skill_deleted` | User removed a skill from their team library. | `app/actions/skills.ts` |
| `skill_note_updated` | User updated the note on a skill they added to the library. | `app/actions/skills.ts` |
| `skill_refreshed` | User refreshed a skill's GitHub metadata to pull the latest stars and description. | `app/actions/skills.ts` |
| `skill_downloaded` | User downloaded a skill as a ZIP archive from the library. | `app/api/skills/[skillId]/download/route.ts` |

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
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs. Consider calling `posthog.identify()` on page load when a session already exists (e.g. from a layout or a client component that reads the session).

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
</wizard-report>
