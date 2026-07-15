# Product Marketing Context

*Last updated: July 15, 2026*

## Product Overview
**One-liner:** Skills Board is the shared library where a team collects the AI skills it recommends, so every teammate can find them and choose the usage path that fits their agent setup.

**What it does:** A team saves skills it considers useful in one searchable library. Teammates can see what the team recommends, understand where each skill comes from, and choose the most suitable way to use its latest source: open the repository, copy an install command, or download the skill as a ZIP.

**Product category:** Shared AI skill library for teams

**Product type:** Free hosted SaaS with open-source code

**Business model:** The hosted product is free forever. The code is open source and can be self-hosted, although self-hosting is not the primary value proposition.

**Core product contract:**
- A saved skill is a team recommendation, not a formal security review, approval, or compatibility certification.
- Skills Board points to the latest version available from the saved source. It does not pin or preserve historical versions.
- Teammates choose how to use a skill: original source, install command, or ZIP download.
- A ZIP contains the latest skill files available from the source at download time. It does not guarantee installation in every agent.
- MCP is an optional advanced access method. It is not the primary product narrative.

## Target Audience
**Target companies:** Small and mid-sized teams that already use AI agents in their work, especially teams whose members use a mix of Claude, Codex, Cursor, and other agent tools.

**Decision-makers:** Hands-on team leads, product leaders, design leaders, engineering leaders, AI enablement leads, and individual contributors who help their teammates adopt useful skills.

**Primary use case:** Give the whole team one place to find the skills the team recommends and choose an appropriate usage path for their agent or setup.

**Jobs to be done:**
- Stop answering the same questions about which skill to use and where to find it.
- Collect useful recommendations before they disappear into chats, bookmarks, or personal setups.
- Help teammates search for a skill by task, problem, or team-specific tag.
- Let each teammate choose the source, command, or ZIP that fits their setup.
- Keep every saved entry connected to the latest version from its source.

**Use cases:**
- A teammate needs a skill for a task and searches the team library instead of asking around.
- Someone finds a useful skill and adds it so the whole team can find it later.
- Teammates using different agents get the same recommendation but choose different ways to use it.
- A teammate opens the original source for context, copies a compatible install command, or downloads the latest skill files as a ZIP.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Experienced skill user | Sharing useful discoveries without repeating the same guidance | Colleagues keep asking which skills to use and where to find them | Add a recommendation once so the team can find it later |
| Teammate | Finding a useful skill without learning every public catalog | Recommendations are scattered and may assume a different agent setup | Search the team library and choose a suitable way to use the skill |
| Team lead | Helping the team reuse good practices across different tools | Useful knowledge stays with individuals and adoption is inconsistent | A shared collection of recommended skills without forcing one agent |
| Technical teammate | Understanding and controlling what gets installed | One-click abstractions can hide the source or assume compatibility | Keep the original source visible and offer files or commands without claiming universal support |

## Problems & Pain Points
**Core problem:** Knowledge about useful AI skills is concentrated in a few people. Team members repeatedly ask which skills to use and where to find them, while different agent setups make a single installation path impractical.

**Why alternatives fall short:**
- Public catalogs help people discover what exists, but do not show what their own team recommends.
- GitHub hosts the source, but does not provide a team-curated library organized around the team's needs.
- Slack, chat, bookmarks, and internal documents preserve recommendations temporarily, but they are difficult to search and reuse.
- Agent-specific marketplaces and installation flows assume the whole team uses the same tool.

**What it costs them:** Repeated questions, repeated searches, missed recommendations, duplicated evaluation, and avoidable friction when teammates use different agents.

**Emotional tension:** People know someone on the team has probably already found something useful, but they still have to ask again or search from scratch.

## Competitive Landscape
**Direct:** Team skill libraries and internal AI enablement catalogs. These may add enterprise complexity, target only engineering, or assume a controlled agent stack.

**Secondary:** Public skill catalogs help with broad discovery, but do not capture the team's own recommendations.

**Secondary:** GitHub repositories provide the canonical source, but not the team's selection, organization, or usage choices.

**Indirect:** Slack messages, internal docs, and bookmarks are familiar, but recommendations become fragmented and stale.

**Indirect:** Agent-specific marketplaces simplify one tool's workflow, but do not serve teammates who use different agents.

## Differentiation
**Key differentiators:**
- A team-curated library of recommended skills
- Organization-scoped access for teammates
- Search and team-specific tags
- Original source visible for every saved skill
- Multiple usage paths: source, install command, and ZIP download
- Latest source version instead of a pinned or detached copy
- Neutrality toward the agent each teammate prefers
- Optional authenticated read-only MCP access for advanced workflows
- Free hosted product with open-source code

**How we do it differently:** Skills Board starts with the team's judgment. Public catalogs and repositories remain useful inputs, while Skills Board records what the team recommends and makes those recommendations easy for everyone to find and use.

**Why that's better:** The team shares one set of recommendations without requiring everyone to adopt the same agent or installation workflow.

**Why customers choose us:** They want to share useful skills across the team, reduce repeated questions, and let every teammate use the setup that suits them.

## Objections
| Objection | Response |
|-----------|----------|
| We already use a public skill catalog. | Keep using it for discovery. Skills Board captures the smaller set your own team recommends. |
| We can put these links in a document. | A document stores links. Skills Board makes recommendations searchable and keeps the source, command, and ZIP choices together. |
| We do not all use the same agent. | That is expected. Each teammate can choose the source, a compatible command, or the latest files as a ZIP. |
| Does every skill work with every agent? | No. Skills Board preserves choice and source visibility, but does not certify universal compatibility. |
| Has every saved skill been reviewed or verified? | A saved skill is a team recommendation, not a formal security or quality certification. Teams should inspect the source and apply their own standards. |
| Will I get the exact version someone on my team used? | Skills Board follows the latest version from the saved source. It does not pin historical versions. |
| We do not want another paid tool. | The hosted product is free forever and the code is open source. |

**Anti-persona:** Teams that do not use reusable AI skills, organizations that need formal security approval and version governance, or companies looking for a universal installer that guarantees compatibility across every agent.

## Switching Dynamics
**Push:** Recommendations keep getting repeated in conversations and lost across personal bookmarks or setups.

**Pull:** One searchable place containing the skills the team recommends, with more than one way to use each skill.

**Habit:** Asking the most experienced teammate or pasting links into chat feels faster in the moment.

**Anxiety:** The library could become another catalog to maintain, a saved recommendation could be mistaken for a formal approval, or an install method might not work with a teammate's agent.

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
- "One shared library. Different agents."

**Words to use:** recommended by your team, shared skill library, find the right skill, use your preferred agent, choose how to use it, original source, copy the command, download the ZIP, latest source, free forever, open source

**Words to avoid:** skill champion, GitHub-backed, approved skill, verified skill, trusted skill, universal compatibility, works with every agent, automatically synchronized, agent capability platform, AI-native knowledge infrastructure, enterprise governance, unlock, supercharge, revolutionize

**Glossary:**
| Term | Meaning |
|------|---------|
| Skill | A reusable set of instructions and supporting files for an AI agent. |
| Team library | The organization-scoped collection of skills teammates have chosen to recommend and share. |
| Recommended skill | A skill deliberately added to the team library. This is not a formal approval, security review, or compatibility guarantee. |
| Original source | The repository and path from which Skills Board retrieves the skill's latest available files. |
| Install command | A command a teammate can copy when it is compatible with their setup. |
| ZIP download | An archive of the latest skill files available from the original source at download time. |
| MCP | An optional advanced way for compatible agents to access the library through authenticated read-only tools. |
| Public skill catalog | A discovery source that can help people find skills before adding selected ones to the team library. |

## Brand Voice
**Tone:** Confident, practical, and approachable

**Style:** Direct, concise, and grounded in a familiar team interaction. Lead with the repeated question and the shared recommendation. Explain technical delivery choices only when they help someone use a skill.

**Personality:** Useful, open, credible, tool-neutral

## Message Hierarchy
1. Your team already has useful skill recommendations. Put them somewhere everyone can find.
2. A shared library saves team members from asking the same questions and searching from scratch.
3. Teammates can use different agents and still draw from the same recommendations.
4. Each skill offers practical usage choices: original source, install command, or latest files as a ZIP.
5. Search, tags, membership, open source, and MCP support the promise but should not lead the story.

**Core narrative:**
1. A teammate needs a skill for a task.
2. Someone on the team has already added a useful recommendation.
3. The teammate finds it in the shared library.
4. They open the source, copy a compatible command, or download the latest files as a ZIP.
5. They follow the option that is compatible with their agent and setup.

## Proof Points
**Metrics:** None approved yet.

**Customers:** None approved for public use yet.

**Testimonials:** None approved yet.

**Value themes:**
| Theme | Product evidence |
|-------|------------------|
| Recommended by the team | Organization libraries and deliberate skill saving |
| Easy to find again | Search and team-specific tags |
| More than one path for different setups | Original source, install command, and ZIP download choices |
| Connected to the latest source | Repository-backed retrieval without version pinning |
| Shared with the team | Team membership and invitations |
| Advanced access when needed | Authenticated read-only MCP tools |
| Open access | Hosted product free forever and open-source code |

## Goals
**Business goal:** Make Skills Board the default place teams use to share AI skill recommendations across different agent setups.

**Conversion action:** Create a team library.

**Activation path:** Create an account -> create a team library -> add the first recommended skill -> invite a teammate -> open the source, copy a command, or download the ZIP.

**Current metrics:** Not established.
