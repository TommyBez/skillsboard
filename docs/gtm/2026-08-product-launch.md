# Skills Board coordinated product launch

Working checklist for the campaign. Campaign identity, message, product loop, and selection rules are owned by `.agents/skills/skillsboard-pulse/references/launch-campaign.md` — keep those fields there and do not restate them here.

## Audience

The first audience is hands-on leads and experienced agent users in teams of roughly 5–25 people that already use at least two AI agents. This remains a testable ICP hypothesis, not an established market fact.

The launch speaks to two connected roles:

- The person repeatedly asked which skill to use and where to find it.
- The teammate who needs the recommendation but uses a different agent or setup.

## Launch goals

These are internal campaign targets, not public proof points.

### Outcome targets by August 25

- 10 new team libraries attributed to the launch campaign.
- 6 of those teams save a first recommended skill.
- 3 of those teams have an invitation accepted.
- 2 of those teams complete the full 14-day activation path: first skill saved, invitation accepted, and a non-creator selects a usage path.

### Learning targets

- Identify the launch message that drives the most team-library creations.
- Record at least five structured objections or points of confusion from relevant users.
- Determine where the path loses the most teams: signup, team creation, first skill, invitation, or teammate reuse.

No visitor, customer, testimonial, or performance number becomes a public claim without the publication gates in `.agents/product-marketing.md`.

## Offer and call to action

Skills Board is free forever and open source. The launch offer is the product itself, not a temporary discount or artificial scarcity.

Every launch asset uses one primary call to action:

> Create your team library

Secondary calls to action may show the open-source repository or explain MCP, but must not compete with team-library creation.

## Product state and launch framing

Skills Board is already publicly available with self-serve signup. August 11 is its first coordinated GTM launch and public introduction, not its release date, general-availability date, or first day online. Public copy must not imply that the application was unavailable before launch day.

The existing homepage remains the only canonical product landing page. There is no separate launch route or duplicate conversion surface.

## Homepage

The homepage carries no launch treatment. The gated variant — a PostHog-controlled
flag in `lib/launch.ts`, a Vercel Flags precompute rewrite in `proxy.ts`, and the
two precomputed pages under `app/variants/home/[code]` — has been removed, along
with the launch banner, the embedded demo loop, and the `launch_demo` CTA
location. `/` is served directly by `app/page.tsx` with a single set of metadata.

Launch coverage on owned surfaces runs through the channel packages instead: the
demo videos are distributed on social and Product Hunt, not embedded on the
landing page.

## ORB channel plan

### Owned

- Product landing page, carrying launch campaign attribution.
- A 60-second paced launch demo for Product Hunt, README, direct sharing, and high-intent evaluation, plus a 31-second accelerated cut for social distribution.
- Consent-compliant product email to eligible subscribers.
- In-product activation prompts for first skill, invite, and teammate reuse.
- PostHog launch dashboard and daily launch log.

### Rented

- Italian LinkedIn founder post centered on the product demonstration.
- English X launch thread centered on the same product loop.
- Product Hunt listing and maker comment if the exact official operation and account identity are available.
- One tailored Show HN post if the community fit and posting terms are satisfied.
- Relevant community posts written natively for each community, never copied indiscriminately.

### Borrowed

- Direct, personal sharing with existing professional relationships who already use multiple agents.
- Replies and contributions in relevant communities where Skills Board genuinely solves the discussed problem.
- Optional launch amplification from collaborators only when based on a real relationship; no scripted engagement or mass outreach.

An unavailable channel does not pause independent launch lanes.

The privacy-safe channel copy, campaign-link matrix, Product Hunt and Show HN human handoffs, email draft, and destination-specific community brief live in `docs/gtm/2026-08-launch-channel-packages.md`.

## Five-phase schedule

### 1. Internal launch — July 27–31

- [ ] Verify production signup → create team → save skill → invite → accept → teammate usage path on desktop and mobile.
- [ ] Verify all launch-funnel events and campaign attribution in PostHog production project 225645.
- [x] Create a launch dashboard for landing CTA, signup, team creation, first skill, invite acceptance, and non-creator usage.
- [x] Verify the add → invite → accept → teammate reuse loop in Development with synthetic identities; keep Production verification as a separate required check.
- [x] Capture truthful demo data that contains no private customer information.
- [ ] Confirm support, privacy, terms, open-source, and contact links are current.
- [x] Record product limitations in the existing homepage FAQ and campaign assets: recommendations are not formal approval; versions are not pinned; compatibility is not universal.

### 2. Pre-launch — August 1–7

- [x] Produce the 60-second paced launch demo, 31-second accelerated cut, and 14-second homepage loop with synthetic identities and a public skill.
- [x] Complete desktop and mobile QA of the dormant single-homepage launch treatment.
- [x] Prepare a launch-specific 1200×630 OG image, video poster, and English video captions.
- [x] Prepare the Italian LinkedIn and English X variants in one private Typefully draft with the 31-second demo.
- [x] Prepare the Product Hunt listing, Show HN facts handoff, consented-email copy, campaign-link matrix, and destination-specific community brief schema.
- [ ] Complete exact Product Hunt eligibility/account readback and let the human maker write and publish every platform-required comment without engagement manipulation.
- [ ] Invite a small number of relevant existing contacts to privately test the launch path and report blockers.
- [ ] Fix only launch-blocking product or measurement defects; defer unrelated polish.

### 3. Final preparation — August 8–10

- [ ] Freeze public launch claims against current production reality.
- [ ] Review every asset for one promise, one product demonstration, and one primary CTA.
- [ ] Add campaign parameters consistently and test every link.
- [ ] Schedule eligible social and email assets through official connected providers.
- [ ] Prepare response templates for questions, objections, bugs, and unavailable provider lanes.
- [ ] Run the full production path once more and record any exact hard blocker or the successful preflight result.

### 4. Launch day — August 11, Europe/Rome

- **08:30:** final production and analytics smoke test.
- **09:00:** after the final production and analytics smoke test passes, confirm the homepage is serving normally; there is no launch-day toggle, and the already-live application remains available through its existing routes.
- **09:05:** Product Hunt listing goes live if the official capability and identity checks pass.
- **09:15:** publish the product demo on LinkedIn and X.
- **10:00:** send the consent-compliant product email.
- **11:00:** publish the first eligible community contribution and share personally with relevant existing contacts.
- **14:00:** review product errors, signup path, provider state, comments, and questions.
- **18:00:** publish or reply only where there is a product-specific follow-up; do not manufacture a second generic launch post.
- **20:00:** record day-one funnel counts, issues, qualitative feedback, and next-day actions.

### 5. Follow-through — August 12–September 8

- [ ] Reply to every substantive product question.
- [ ] Resolve launch-blocking defects through the normal repository PR process.
- [ ] Publish focused follow-ups based on distinct product proof: shared library, multi-agent use, invitation loop, source/command/ZIP, and MCP.
- [ ] Run structured interviews or surveys with launch users who have the appropriate consent.
- [ ] Report the 14-day activation cohort on August 25.
- [ ] Publish a retrospective only from validated, privacy-safe evidence.
- [ ] Convert the strongest product question into evergreen onboarding or documentation.

## Asset workstreams

| Workstream | Repository-pinned skill | Deliverable | Due | State |
| --- | --- | --- | --- | --- |
| Launch control | `launch` | This schedule, preflight checks, run of show | Jul 27 | Homepage treatment merged; final preflight and flag activation remain |
| Launch narrative | `copywriting`, `copy-editing` | Homepage treatment and channel message spine | Jul 31 | Homepage treatment merged; channel package prepared |
| Product demonstration | `video` | Short homepage loop, paced launch demo, and accelerated social cut | Aug 4 | Homepage loop preserved; reproducible Remotion-enhanced 60-second and 31-second cuts prepared in this PR |
| Landing conversion | `cro` | Launch-specific CTA hierarchy and friction review | Aug 4 | Dormant single-homepage treatment merged on `main` |
| Activation | `onboarding` | First skill and invite path improvements | Aug 5 | Not started |
| Measurement | `analytics` | Production launch dashboard and attribution QA | Aug 5 | Dashboard created; Production attribution QA remains |
| Social distribution | `social`, `typefully` | Italian LinkedIn and English X launch assets | Aug 7 | Private draft verified; final Remotion media replacement, readback, preflight, and scheduling remain |
| Email distribution | `emails`, `resend-connector` | Eligible product launch broadcast | Aug 7 | English template and application consent, preferences, suppression, unsubscribe, and webhook controls implemented in this PR; deployment, provider projection, and send readback remain |
| Community | `community-marketing`, `public-relations` | Product Hunt, Show HN, and native community packages | Aug 7 | Product Hunt and Show HN handoffs prepared; exact destination/provider execution remains |
| Learning | `customer-research` | Objection log, interview guide, launch retrospective | Aug 10 | Not started |

Each specialist skill is loaded only when its workstream begins and only after the Pulse resolver selects it where the provider contract requires that routing.

## Measurement contract

The launch funnel is:

1. `landing_cta_clicked`
2. `signup_form_submitted`
3. `user_signed_up`
4. `team_created`
5. first `skill_saved`
6. `team_member_invited`
7. `invitation_accepted`
8. non-creator `skill_usage_path_selected` or `skill_downloaded`

Reporting must separate:

- launch-attributed traffic from total production traffic;
- newly created teams from existing teams;
- creator activity from non-creator reuse;
- product conversion from SEO page consumption;
- provider unavailability from zero user response.

The Pulse records results daily during launch week and at the 14-day activation mark. Missing measurement remains missing; it is never replaced by repository inference.

## Launch preflight

These checks keep public claims truthful and make failures actionable. They do not create a readiness phase, score, or whole-campaign gate. Each lawful, physically available lane continues independently; only the exact action affected by a closed contract blocker stops.

- Exercise the production product loop end to end and route any defect as product work.
- Keep public claims byte-for-byte consistent with shipped product reality and the product marketing contract.
- Observe the primary CTA and launch funnel in production; missing measurement creates instrumentation work without stopping independent launch work.
- Use privacy-safe demo data and accurately represent current behavior.
- Verify each provider immediately before its exact effect and preserve independent lanes when another provider is unavailable.
- Monitor launch-day product errors and questions while continuing compatible actions.

Product Hunt, Show HN, email, or another individual provider lane may be unavailable without cancelling the whole launch. Cash spend, overage, missing legal consent, identity ambiguity, binding-platform restrictions, or owner approval immediately before merging an exact PR/head SHA remain hard boundaries.

## Launch content selection

The already-scheduled July 27 post remains a historical provider fact. Estimate each launch candidate's contribution to the governing `AAT-28` objective using these properties:

1. It explicitly names or visibly demonstrates Skills Board.
2. It maps to one distinct product proof or launch phase.
3. It is a distinct provider effect rather than an exact duplicate.
4. It has a measurable role in the launch funnel or a documented learning objective.

These properties inform expected contribution, time to effect, and confidence; they are not an editorial, cooldown, WIP, evidence, readiness, or output gate. Launch membership creates no automatic precedence over SEO, social, or another positive compatible candidate. Every due item enters the finite `pulse.scheduler` snapshot with directed prerequisites kept separate from explicit cross-lane conflicts; exact provider-effect deduplication remains mandatory but is not the only possible collision. Generic AI-coding guidance may support the launch when it creates a clear bridge to a product problem.

## Ownership and decision boundaries

Codex and the Pulse execute the routed, zero-cost workstreams, produce assets, verify providers, schedule eligible communications, and report evidence. Tommaso is required only at a genuine owner boundary, especially approval immediately before merging an exact repository PR/head SHA or where identity, law, consent, privacy, binding terms, or spend require it.

The remaining planning inventory is production journey QA, measurement QA, channel packages, the exact PR merge, final provider preflight, homepage-treatment flag activation, and launch execution. Sequence and dates inform rank only. A directed prerequisite exists only for the exact effect that physically or truthfully depends on an asset, provider preflight, flag state, observation window, or owner approval immediately before its exact PR merge.
