# Skills Board launch channel packages

Prepared for the August 11, 2026 coordinated launch. Product truth, campaign identity, and the launch schedule remain authoritative in `.agents/product-marketing.md`, `.agents/skills/skillsboard-pulse/references/launch-campaign.md`, and `docs/gtm/2026-08-product-launch.md`.

This file contains privacy-safe copy and human handoff material. It does not authorize a provider effect, identify recipients or supporters, or prove platform eligibility. Every exact publication, schedule, or send still requires current official-provider identity, binding-platform, consent, suppression, quota, link, and duplicate-effect readback.

## Message spine

- Problem: useful AI skill recommendations disappear into chats, bookmarks, and individual setups.
- Product: Skills Board is the shared library where a team collects the AI skills it recommends so every teammate can find and reuse them.
- Demonstration: one teammate adds a useful skill; another finds it and chooses the original source, a compatible install command, a ZIP, or a connected agent.
- Primary call to action: **Create your team library**.
- Canonical destination: `https://www.skillsboard.sh/`.
- Product boundaries: a saved skill is a team recommendation, not formal approval, a security review, a pinned version, or a universal compatibility guarantee.
- Public proof: no customer, testimonial, or production metric is approved for launch copy.

## Campaign links

| Channel | Canonical campaign URL |
| --- | --- |
| LinkedIn | `https://www.skillsboard.sh/?utm_source=linkedin&utm_medium=social&utm_campaign=product_launch_2026_08` |
| X | `https://www.skillsboard.sh/?utm_source=x&utm_medium=social&utm_campaign=product_launch_2026_08` |
| Product Hunt | `https://www.skillsboard.sh/?utm_source=product_hunt&utm_medium=referral&utm_campaign=product_launch_2026_08&utm_content=launch_listing` |
| Show HN | `https://www.skillsboard.sh/?utm_source=hacker_news&utm_medium=community&utm_campaign=product_launch_2026_08&utm_content=show_hn` |
| Product email | `https://www.skillsboard.sh/?utm_source=product_email&utm_medium=email&utm_campaign=product_launch_2026_08&utm_content=launch_announcement` |

A native community contribution receives a destination-specific `utm_source` only after the exact community, identity, and current rules are verified. Do not use one generic community URL across unrelated destinations.

## LinkedIn and X

The official Typefully resource is draft `10084598` in social set `266935`:

- one natural Italian LinkedIn post and one English four-post X thread;
- the same shipped add → find → use product demonstration;
- the final Remotion 31-second cut attached to both platforms as media `41c7f571-b728-498d-a70d-1e19a0af1264`, with SHA-256 `cbb3728a5ec8cedfde33236429515ecfb38b537d5520b8ad342aa4d14ec3f911`;
- exact channel URLs from the campaign-link table;
- scheduled for August 11 at 09:15 Europe/Rome (`2026-08-11T07:15:00Z`) and unpublished at the July 29 official readback.

Do not duplicate or overwrite the copy in this repository. User edits in Typefully are authoritative. The final `public/launch/skills-board-product-demo.mp4` is attached and the eligible X and LinkedIn platforms are scheduled for 09:15 Europe/Rome on August 11. Immediately before publication, reread the exact draft and bind the current account, social set, copy, media, timing, quota, schedule ID, parent/reply IDs, and publication state; fail closed if any value differs.

## Product Hunt package

### Listing copy

**Name**

Skills Board

**Tagline**

Keep your team’s AI skill recommendations in one place

**Short description**

Skills Board gives teams one searchable library for the AI skills they recommend. Add a skill once, keep its original source visible, and let teammates find it later by task or tag. Each person can open the source, copy a compatible install command, or download the latest skill files as a ZIP. Compatible agents can connect through authenticated, scope-controlled MCP. The hosted product is free forever, and the code is open source.

**Primary call to action**

Create your team library

### Gallery and media order

1. `app/icon.svg` — product icon.
2. `public/launch/skills-board-launch-og.jpg` — shared-library promise.
3. `public/launch/skills-board-product-demo-poster.jpg` — full-canvas find-and-use product proof from the final master.
4. `public/launch/skills-board-product-demo-product-hunt.mp4` — 46-second Product Hunt cut: hook, positioning, save flow, the recommendation card, search, handoff paths, collections, the MCP agent beat, and CTA, with matching `public/launch/skills-board-product-demo-product-hunt.vtt` captions.
5. `public/launch/skills-board-product-demo.mp4` — 30-second social cut built from the same scenes and product truth, ending on the MCP beat, with `public/launch/skills-board-product-demo.vtt` captions for social distribution.

Videos, posters, and the manifest are render outputs, not committed files. Run `pnpm video:render:launch` before assembling a package, pull the posters from the resulting masters (`remotion still` on the same composition, or a frame grab off the mp4), then regenerate the manifest. The Remotion compositions and the caption sidecars are the only committed inputs.

### Video source and reproducible renders

Both launch cuts are generated from shared Remotion scenes in `remotion/product-demo/` at 1440×900 and 30 fps. There is no screen recording in either cut: every product surface is re-authored as a Remotion component against the app's own tokens (`app/globals.css`), so the videos are pure code and reproduce byte-for-byte from source.

- `pnpm video:render:product-hunt` renders exactly 1,366 frames / 45.5 seconds.
- `pnpm video:render:social` renders exactly 900 frames / 30 seconds.
- `pnpm video:render:team-loop` renders the 420-frame / 14-second team loop (`public/launch/skills-board-team-loop.mp4`), built from the same scenes: save → share → find, with both ends fading to the page background so the loop seam is invisible.
- `pnpm video:render:launch` renders all three outputs.

The launch compositions use the repository-pinned Remotion and Remocn motion system. Each scene holds one or two real product components rather than a full screenshot: the save dialog, the skill card with its team note and example prompt, the library search, the collection cards, and the agent panel. One accent (the app's primary green) carries the whole film, and the single dark scene is the MCP beat. Both cuts are designed for silent-first comprehension and retain exact VTT sidecars.

`node scripts/write-video-manifest.mjs` writes `public/launch/skills-board-video-manifest.json` after a render, recording the composition source, dimensions, frame counts, durations, output bytes, and SHA-256 values used for final asset readback. Like the renders themselves, the manifest is generated per render rather than committed.

### Human-only maker and comment brief

Product Hunt publication, scheduling, maker comments, and replies remain a human action while the exact official callable operation is absent and the platform requires a real personal account. Do not use browser automation and do not generate or AI-edit a maker comment or reply.

Facts the human maker may address in their own words:

- the repeated team problem: which skill to use and where to find the recommendation;
- why the shared team library leads the product and MCP remains a supporting access path;
- how the demo uses synthetic identities and a public skill, not customer data;
- how teammates can keep different agent setups and choose source, command, ZIP, or MCP;
- the recommendation, latest-source, and compatibility boundaries;
- that the hosted product is free forever and the code is open source.

Never request or incentivize upvotes, coordinate artificial engagement, mass-message strangers, or describe leaderboard rank as the campaign goal. Recheck current Product Hunt launch and relaunch eligibility before the human publishes.

## Show HN handoff

### Title options

- `Show HN: Skills Board – a shared AI skill library for teams`
- `Show HN: Put your team’s recommended AI skills in one searchable library`
- `Show HN: An open-source shared skill library for teams using multiple agents`

### Verified facts for the human submission

- Skills Board is live and directly usable with self-serve signup.
- A team can save recommended skills, search its shared library, invite teammates, and choose source, compatible command, ZIP, or authenticated MCP access.
- The source remains visible; Skills Board follows the latest available source rather than pinning historical versions.
- A saved recommendation is not formal approval, a security review, or universal compatibility certification.
- The hosted product is free forever and the code is open source.
- The 31-second synthetic-data cut condenses the source → context → save → find → use story into focused beats; the 60-second Product Hunt cut adds the complete five-shot proof sequence, usage-path context, and team-library payoff.

Final submission text, publication, and every comment remain human. Do not generate or AI-edit HN comments, solicit votes or submissions, automate a personal account, or repost a weak submission. Immediately before a human submission, verify that the product and tracked destination are live, the project has not already been submitted, the current Show HN rules allow the exact unit, and the human maker can remain available for discussion.

## Consented product email

This copy is prepared but no recipient-bearing action is authorized by preparation alone.

**Subject**

A shared home for your team’s AI skills

**Preheader**

Save a recommendation once, then let teammates find and use it in the way that fits.

**Body**

Which skill should I use? Where can I find it?

Those questions are easy to answer once and surprisingly easy to repeat. Skills Board gives your team one searchable library for the AI skills it recommends.

One teammate adds a useful skill. Another finds it by task or tag. Each person can open the original source, copy a compatible install command, download the latest skill files as a ZIP, or connect a compatible agent through authenticated MCP.

Skills Board does not decide whether a skill is approved or compatible with every setup. It keeps the recommendation and source visible so your team can make that choice.

The hosted product is free forever, and the code is open source.

**CTA:** Create your team library

Tommaso<br>
Skills Board

`[Provider-managed unsubscribe]`<br>
`[Verified public postal identity]`

The CTA uses the product-email campaign URL above. Proactive sender identity is `Tommaso from Skills Board <tommaso@skillsboard.sh>` only after its authority gates pass. Send only through the official selected email provider to addresses with current `product_communications` consent, after exact sender identity, suppression, complaint, hard-bounce, unsubscribe, recipient, public-postal-identity, and duplicate-delivery checks. Replace both footer placeholders with provider-verified values before sending. No eligible audience is inferred from repository data.

## Native community preparation

No generic cross-community post is prepared. A community contribution becomes actionable only for one exact destination whose current rules, operating identity, allowed links, AI disclosure, and official operation are verified.

For each selected destination, create one native brief containing:

1. exact community and current authoritative rules URL;
2. the audience problem being answered independently of the product link;
3. one useful standalone explanation or demonstration;
4. the truthful Skills Board bridge and destination-specific campaign URL;
5. required AI or automation disclosure;
6. prohibited promotion, reply, and engagement behavior;
7. official operation and exact account identity;
8. public URL readback or explicit human-completion evidence;
9. qualified discussion, referral, and team-library creation as outcomes.

Product Hunt and Show HN use their separate human-only handoffs above. Do not substitute browser automation, a personal community account, a private API, or a generic repost.

## Final channel preflight

Immediately before each exact effect:

- reread shipped product reality and the channel asset;
- verify the canonical destination and exact UTM parameters return the expected homepage;
- verify the demo and all attached media are privacy-safe and current;
- verify the Product Hunt primary demo remains 60–90 seconds and every duration label matches the selected asset;
- verify provider account, platform, permissions, quota, and binding rules;
- verify consent, suppression, unsubscribe, and recipient identity for email;
- verify the resource is not already scheduled, published, or ambiguously issued;
- bind the exact copy/media hash, provider resource ID, timing, and applicable parent or reply IDs;
- read back the exact effect after issuance before any retry.

## Package status

| Package | Prepared state | Remaining exact boundary |
| --- | --- | --- |
| LinkedIn and X | Official Typefully draft reconciled; final Remotion media attached and X/LinkedIn scheduled for August 11 at 09:15 Europe/Rome | Reread the immutable publication envelope immediately before publication; fail closed on any mismatch |
| Product Hunt | Listing copy, Remotion-enhanced 60-second master, asset order, and human facts brief prepared | Current platform eligibility, personal account, and human publication/comments |
| Show HN | Title options and human facts brief prepared | Current rules, prior-submission check, maker availability, and human publication/comments |
| Product email | English copy prepared | Eligible consent/suppression projection, official provider route, unsubscribe, and send readback |
| Native community | Destination-specific brief schema prepared | Exact allowlisted destination, current rules, identity, and official operation |
