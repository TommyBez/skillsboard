# Product Marketing Context

*Last updated: August 22, 2026*

## Product Overview
**One-liner:** Skills Board is the web app where a team keeps and shares its AI skills, so every teammate can find and reuse them.

**Never describe the product as "a shared library" on its own.** Skills Board is a web app teams sign in to; the shared library is what a team builds inside it.

**Official category phrase (approved by Tommy, August 22, 2026):** "Skills Board, the agent-native skills registry for teams." This is the permanent subtitle and the category vocabulary every future piece of copy inherits. It goes verbatim in the canonical positions: the home `<title>`, the Open Graph and Twitter titles, the hero line under the headline, the opening line of `public/llms.txt` and of the home Markdown twin at `/index.md`, the README tagline, and the JSON-LD descriptions. Everywhere else the copy stays natural: the phrase is a position, not a keyword to repeat.

**Never say a team "recommends" its skills (directive from Tommy, Slack, August 22, 2026).** The phrase "AI skills your team recommends" reads as cacophony, and the endorsement it names is redundant: nobody shares a skill with their team that they think is useless. Drop recommend, recommends, recommended, and recommendation wherever they describe a team's own skills, on every public surface: page titles and meta descriptions, Open Graph and Twitter cards, JSON-LD, `public/llms.txt`, the README, `package.json`, landing and SEO pages, guides, the app UI, auth and onboarding screens, email, and the published `team-skill-library` skill. The approved replacements are:
- Second person: "your team's AI skills", as in "Keep your team's AI skills in one place".
- Third person: "the web app where a team keeps and shares its AI skills".
- The category subtitle is unaffected. "Skills Board, the agent-native skills registry for teams" stays verbatim.

"Recommend" is still correct when it carries a different meaning, and those uses stay: a technical recommendation inside a guide ("the specification recommends keeping SKILL.md under 500 lines"), a quotation from a third-party source (the Agent Skills specification's recommended directory names), or a description of somebody else's product behavior (a CLI that recommends skills for the project you are in).


Two facts license the wording, and neither is a new claim:
- "Agent-native" is measured, not asserted. Two external scanners rated the live site: is-agentic.com 100/100, and isitagentready.com 87/100 at Level 5.
- "Registry" names where a team keeps and shares its AI skills. For a saved skill it never implies version pinning: Skills Board follows the latest version at the saved source by design, and wherever the subject comes up that stays the honest answer. A published collection release is the one surface where a version is fixed, because it records the source commit of every skill it packages.

**What it does:** A team saves skills it considers useful in one searchable library. Teammates can see what the team keeps, understand where each skill comes from, and choose the most suitable way to use its latest source: open the repository, copy an install command, or download the skill as a ZIP.

**Product category:** Agent-native skills registry for teams

**Product type:** Free hosted SaaS with open-source code

**Business model:** The hosted product is free forever. The code is open source and can be self-hosted, although self-hosting is not the primary value proposition.

**Core product contract:**
- A saved skill is a team's own choice, not a formal security review, approval, or compatibility certification.
- A saved skill points to the latest version available from its source. Skills Board does not pin or preserve historical versions of saved skills.
- Teammates choose how to use a skill: original source, install command, or ZIP download.
- A ZIP of a saved skill contains the latest skill files available from the source at download time. It does not guarantee installation in every agent.
- A published collection release is the exception to the latest source rule: it records the source commit of every skill it packages and keeps serving that packaged revision until the team publishes a new one.
- MCP is a first-class authenticated way to access and contribute to the shared library from a compatible agent. With the granted scopes, it can list and search team skills and collections, retrieve install commands, discover public and repository skills, save new skills, create collections, and add or remove saved skills from collections. It cannot edit or delete saved team skills, install them in the agent, or execute them.

## Target Audience
**Target companies:** Small and mid-sized teams that already use AI agents in their work, especially teams whose members use a mix of Claude, Codex, Cursor, and other agent tools.

**Current testable ICP hypothesis:** Teams of roughly 5–25 people inside 10–150 person companies that already use at least two AI coding or work agents. This is a working hypothesis to review against production evidence, not an established market fact.

**Decision-makers:** Hands-on team leads, product leaders, design leaders, engineering leaders, AI enablement leads, and individual contributors who help their teammates adopt useful skills.

**Primary use case:** Give the whole team one place to collect, find, and reuse its AI skills.

**Likely triggers:** A second agent enters the workflow, several reusable skills accumulate, teammates repeatedly ask where a skill lives, a new teammate is onboarded, or an AI guild or enablement function forms.

**Jobs to be done:**
- Stop answering the same questions about which skill to use and where to find it.
- Collect useful skills before they disappear into chats, bookmarks, or personal setups.
- Help teammates search for a skill by task, problem, or team-specific tag.
- Let each teammate choose the source, command, or ZIP that fits their setup.
- Connect a compatible agent so it can search the team library, retrieve install commands, and, when authorized, save skills and organize collections directly.
- Keep every saved entry connected to the latest version from its source.

**Use cases:**
- A teammate needs a skill for a task and searches the team library instead of asking around.
- Someone finds a useful skill and adds it so the whole team can find it later.
- Teammates using different agents get the same skill but choose different ways to use it.
- A teammate opens the original source for context, copies a compatible install command, or downloads the latest skill files as a ZIP.
- A teammate connects an MCP-compatible agent, signs in through the browser, and searches the same team library without copying an API key.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Experienced skill user | Sharing useful discoveries without repeating the same guidance | Colleagues keep asking which skills to use and where to find them | Add a skill once so the team can find it later |
| Teammate | Finding a useful skill without learning every public catalog | Skills are scattered and may assume a different agent setup | Search the team library and choose a suitable way to use the skill |
| Team lead | Helping the team reuse good practices across different tools | Useful knowledge stays with individuals and adoption is inconsistent | One place for the team's skills without forcing one agent |
| Technical teammate | Understanding and controlling what gets installed | One-click abstractions can hide the source or assume compatibility | Keep the original source visible and offer files or commands without claiming universal support |

## Problems & Pain Points
**Core problem:** Knowledge about useful AI skills is concentrated in a few people. Team members repeatedly ask which skills to use and where to find them, while different agent setups make a single installation path impractical.

**Why alternatives fall short:**
- Public catalogs help people discover what exists, but do not show what their own team uses.
- GitHub hosts the source, but does not provide a team-curated library organized around the team's needs.
- Slack, chat, bookmarks, and internal documents preserve those skills temporarily, but they are difficult to search and reuse.
- Agent-specific marketplaces and installation flows assume the whole team uses the same tool.

**What it costs them:** Repeated questions, repeated searches, skills nobody finds again, duplicated evaluation, and avoidable friction when teammates use different agents.

**Emotional tension:** People know someone on the team has probably already found something useful, but they still have to ask again or search from scratch.

## Competitive Landscape
**Direct:** Team skill libraries and internal AI enablement catalogs. These may add enterprise complexity, target only engineering, or assume a controlled agent stack.

**Secondary:** Public skill catalogs help with broad discovery, but do not capture the team's own set.

**Secondary:** GitHub repositories provide the canonical source, but not the team's selection, organization, or usage choices.

**Indirect:** Slack messages, internal docs, and bookmarks are familiar, but the team's set becomes fragmented and stale.

**Indirect:** Agent-specific marketplaces simplify one tool's workflow, but do not serve teammates who use different agents.

## Differentiation
**Key differentiators:**
- A team-curated library of the skills a team actually uses
- Organization-scoped access for teammates
- Search and team-specific tags
- Original source visible for every saved skill
- Multiple usage paths: source, install command, and ZIP download
- Latest source version instead of a pinned or detached copy
- Neutrality toward the agent each teammate prefers
- Authenticated, scope-controlled MCP access from compatible agents, with browser-based sign-in and no API key to copy
- Free hosted product with open-source code

**How we do it differently:** Skills Board starts with the team's judgment. Public catalogs and repositories remain useful inputs, while Skills Board records what the team settled on and makes it available both in the product and directly inside compatible agents through MCP.

**Why that's better:** The team shares one set of skills without requiring everyone to adopt the same agent or installation workflow.

**Why customers choose us:** They want to share useful skills across the team, reduce repeated questions, and let every teammate use the setup that suits them.

## Objections
| Objection | Response |
|-----------|----------|
| We already use a public skill catalog. | Keep using it for discovery. Skills Board captures the smaller set your own team settled on. |
| We can put these links in a document. | A document stores links. Skills Board makes those skills searchable and keeps the source, command, and ZIP choices together. |
| We do not all use the same agent. | That is expected. Each teammate can choose the source, a compatible command, or the latest files as a ZIP. |
| Does every skill work with every agent? | No. Skills Board preserves choice and source visibility, but does not certify universal compatibility. |
| Has every saved skill been reviewed or verified? | A saved skill is a team's own choice, not a formal security or quality certification. Teams should inspect the source and apply their own standards. |
| Will I get the exact version someone on my team used? | A saved skill follows the latest version from its source and does not pin historical versions. A published collection release does record the source commit of every skill it packages. |
| We do not want another paid tool. | The hosted product is free forever and the code is open source. |

**Anti-persona:** Teams that do not use reusable AI skills, organizations that need formal security approval and version governance, or companies looking for a universal installer that guarantees compatibility across every agent.

## Switching Dynamics
**Push:** The same skills keep getting re-explained in conversations and lost across personal bookmarks or setups.

**Pull:** One searchable place containing the team's AI skills, with more than one way to use each skill.

**Habit:** Asking the most experienced teammate or pasting links into chat feels faster in the moment.

**Anxiety:** The library could become another catalog to maintain, a saved skill could be mistaken for a formal approval, or an install method might not work with a teammate's agent.

## Customer Language
**How they describe the problem:**
- "I miei colleghi mi chiedono spesso quali skills usare e dove trovarle."
- "Non tutti usiamo gli stessi agenti. Alcuni usano Claude, altri Codex, altri Cursor."
- "Which skill should I use for this?"
- "Where can I find the skill you recommended?"

**How they describe the solution:**
- "Un posto dove raccogliere le skills che il team ritiene valide."
- "Tutti i membri del team possono attingere da lì per installarle negli agent che utilizzano."
- "Ognuno può scegliere la maniera più congeniale per utilizzare la skill."
- "Your team's skills. All in one place."

**Words to use:** agent-native skills registry for teams, your team's AI skills, keeps and shares its AI skills, all in one place, connect your agent, search from your agent, scope-controlled MCP access, sign in through your browser, no API key to copy, find the right skill, choose how to use it, original source, copy the command, download the ZIP, latest source, free forever, open source

**Words to avoid:** the AI skills your team recommends, skills your team recommends, recommended by your team, team recommendation, recommended skill, skill champion, GitHub-backed, approved skill, verified skill, trusted skill, universal compatibility, works with every agent, automatically synchronized, agent capability platform, AI-native knowledge infrastructure, enterprise governance, unlock, supercharge, revolutionize

**Glossary:**

| Term | Meaning |
|------|---------|
| Skill | A reusable set of instructions and supporting files for an AI agent. |
| Team library | The organization-scoped collection of skills teammates have chosen to keep and share. |
| Saved skill | A skill deliberately added to the team library. This is not a formal approval, security review, or compatibility guarantee. |
| Original source | The repository and path from which Skills Board retrieves the skill's latest available files. |
| Install command | A command a teammate can copy when it is compatible with their setup. |
| ZIP download | An archive of the latest skill files available from the original source at download time. |
| MCP | An authenticated connection that lets compatible agents read the shared library and, with the granted scopes, save skills and organize collections after browser-based authorization. It does not install or execute skills in the agent. |
| Public skill catalog | A discovery source that can help people find skills before adding selected ones to the team library. |

## Brand Voice
**Tone:** Confident, practical, and approachable

**Style:** Direct, concise, and grounded in a familiar team interaction. Lead with the repeated question and the shared answer. Explain technical delivery choices only when they help someone use a skill.

**Personality:** Useful, open, credible, tool-neutral

## Publication and communication contract

- Publish only verified, already shipped product reality. A capability claim requires the current production deployment and product readback to prove it. Never turn a hypothesis, draft, experiment, private prototype, or unmerged pull request into a public capability claim.
- Do not invent founder anecdotes, customer stories, personal reading, roadmap commitments, timelines, or ETAs. First-person copy may describe only documented actions, motivations, and results.
- The connected personal social account may discuss only Skills Board and its shipped features. LinkedIn copy is Italian; X and every email category are English.
- Proactive founder-voice email uses `Tommaso from Skills Board <tommaso@skillsboard.sh>` only after consent, suppression, unsubscribe, identity, provider, public-postal-identity, and explicit send authorization are verified. Account setup service email is the one category where the opt-in consent check is replaced by qualification under the service category defined below. Suppression, unsubscribe, identity, provider, and explicit send authorization stay mandatory for it too. A public postal identity is not required for that category, because the CAN SPAM postal rule covers commercial messages and service email is a relationship message; it stays required for marketing broadcasts. Transactional email keeps a separate operational identity.
- Product updates, newsletters, and structured product-research invitations share the `product_communications` consent topic. Optional in-app surveys follow their own non-blocking research/opt-out contract and do not require that email consent. The topic never authorizes personal qualitative follow-up.
- Account setup service email is a separate, narrow category: only the welcome message and the first skill reminder, sent to the team creator within 14 days of team creation, capped at 3 proactive emails per person ever, each carrying a visible unsubscribe, with every suppression honored. Its basis is the setup of the account the user just created, not marketing consent. Later activation messages, such as inviting a teammate or connecting an agent, stay under `product_communications` and require opt-in consent. Service email never becomes a newsletter, a digest, or a re-engagement channel, and it never goes to `emailSubscriber` addresses.
- Paid advertising is policy-ineligible while Skills Board has no revenue line. Reconsidering it requires a merged strategy change that establishes a revenue model.
- Public proof points remain unavailable until the underlying metric is production-validated or the attributable person or customer has granted publication consent. A public metric also requires its exact definition, window, denominator, privacy-safe aggregation, and authorization under the policy that owns it.
- A material change to the product contract, ICP, JTBD, positioning, or durable communication policy is delivered through the normal repository review process.
- This document controls product truth, audience hypotheses, positioning, claims, language, and voice. It does not authorize sending, publishing, targeting, provider writes, or repository merges; each external effect requires explicit authorization and its applicable legal, consent, privacy, identity, platform, and spend checks.

## Message Hierarchy
1. Your team already has useful AI skills. Put them somewhere everyone can find.
2. One searchable library saves team members from asking the same questions and searching from scratch.
3. Connect a compatible agent through MCP so it can search the same library, retrieve install commands, and, when authorized, contribute skills and organize collections directly.
4. Teammates can use different agents and still draw from the same team library.
5. Original source, install command, ZIP, search, tags, membership, and open source provide practical alternatives and support the promise.

**Core narrative:**
1. A teammate needs a skill for a task.
2. Someone on the team has already added a useful skill.
3. The teammate finds it in the team library.
4. They either ask their connected agent to search the library or use Skills Board directly.
5. They retrieve a compatible command, open the source, or download the latest files as a ZIP.

## Proof Points
**Metrics:** No production metric is validated for public claims yet.

**Customers:** No attributable customer has recorded consent for public use yet.

**Testimonials:** No testimonial has recorded publication consent yet.

**Value themes:**
| Theme | Product evidence |
|-------|------------------|
| Chosen by the team | Organization libraries and deliberate skill saving |
| Easy to find again | Search and team-specific tags |
| More than one path for different setups | Original source, install command, and ZIP download choices |
| Connected to the latest source | Repository-backed retrieval without version pinning |
| Shared with the team | Team membership and invitations |
| Available inside the agent | Authenticated, scope-controlled MCP tools with browser-based authorization |
| Open access | Hosted product free forever and open-source code |

## Goals
**Business goal:** Make Skills Board the default web app teams use to collect and reuse their AI skills.

**Conversion action:** Create a team library.

**Onboarding and individual value path:** Create an account -> create a team library -> add the first skill -> invite a teammate or connect an agent through MCP -> search the library -> retrieve a command, open the source, or download the ZIP.

**Team activation metric:** Within 14 days of team creation, save the first skill, have an invitation accepted, and have a non-creator select a usage path.

**Current metrics:** Not established.
