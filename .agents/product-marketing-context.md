# Product Marketing Context

*Last updated: July 15, 2026*

## Product Overview
**One-liner:** Skills Board is the free, open-source team library for curating and sharing the skills used by people and AI agents.

**What it does:** Skills Board gives AI-native product teams one trusted place to collect reusable agent skills. Teams can discover skills through skills.sh, save GitHub-backed references, copy installation commands, manage access by organization, and expose approved skills to agents through authenticated MCP.

**Product category:** Team skill registry / AI-native knowledge infrastructure

**Product type:** Free hosted SaaS with open-source code

**Business model:** The hosted platform is free. The code is open source and can be self-hosted, although self-hosting is not the primary value proposition.

## Target Audience
**Target companies:** AI-native product teams, initially small and mid-sized teams actively using agents across product development.

**Decision-makers:** Product leaders, design leaders, engineering leaders, AI enablement leads, and hands-on team leads.

**Primary use case:** Maintain one trusted, team-approved library of reusable agent skills.

**Jobs to be done:**
- Find useful skills without losing them in bookmarks or chat threads.
- Curate which skills the team should use.
- Keep skill references connected to their GitHub source.
- Install approved skills with a ready-to-copy CLI command.
- Give authenticated agents access through MCP.

**Use cases:**
- Curate reusable workflows across product, design, and engineering.
- Standardize agent setups across teammates.
- Move useful discoveries from skills.sh into a team collection.
- Give MCP-compatible agents access to approved skills.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Product | Repeatable AI workflows | Useful instructions and skills are scattered | Shared workflows the whole team can reuse |
| Design | Consistency and quality | Design guidance lives in personal setups | A discoverable library of approved design skills |
| Engineering | Reliability and maintenance | Skill references drift across machines and agents | GitHub-backed skills with ready-to-use install commands |
| Team lead | Adoption and visibility | No shared view of what agents use | One organization-scoped source of truth |

## Problems & Pain Points
**Core problem:** Teams are adopting reusable AI skills faster than they can organize them. Skills end up spread across skills.sh, GitHub links, READMEs, Slack messages, internal docs, and local agent configuration.

**Why alternatives fall short:**
- skills.sh supports public discovery but not a private, curated team collection.
- GitHub bookmarks and documents preserve links but do not create an installable, agent-accessible registry.
- Local agent configuration works individually but drifts between teammates.
- Wikis and Slack are easy to add to but difficult to maintain and use operationally.

**What it costs them:** Repeated discovery, inconsistent agent setups, stale references, duplicated work, and uncertainty about which skills the team trusts.

**Emotional tension:** Teams know useful workflows exist, but cannot confidently tell whether everyone and every agent is using the same ones.

## Competitive Landscape
**Direct:** Team skill registries and internal AI enablement catalogs — often add enterprise complexity or target engineering alone.

**Secondary:** skills.sh — useful for discovery, but does not provide a curated team library.

**Secondary:** GitHub links, READMEs, bookmarks, and internal docs — preserve knowledge but do not turn it into a searchable, installable registry.

**Indirect:** Local agent configuration — gives individuals control but creates drift across the team.

## Differentiation
**Key differentiators:**
- Organization-scoped shared libraries
- GitHub-backed skill references
- Built-in skills.sh discovery
- Ready-to-copy `npx skills add` commands
- Authenticated MCP access for agents
- Designed for product, design, and engineering together
- Free hosted platform with open-source code

**How we do it differently:** Skills Board sits between public discovery and team adoption. Teams discover skills publicly, curate the useful ones into an organization library, install them through existing CLI conventions, and expose approved skills through MCP.

**Why that's better:** Teams keep using the open skill ecosystem while gaining a shared source of truth. There is no proprietary skill format and no need to replace GitHub or skills.sh.

**Why customers choose us:** One current, searchable team library without adding a paid governance platform or maintaining a custom internal catalog.

## Objections
| Objection | Response |
|-----------|----------|
| We already use skills.sh. | skills.sh helps you discover. Skills Board helps your team decide what to keep and use. |
| A GitHub document is enough. | A document cannot provide team search, ready-to-copy install commands, organization access, or authenticated MCP tools. |
| We do not want another paid tool. | Skills Board is free and open source. |
| Skills will become stale. | Saved entries point to their GitHub source instead of storing detached copies. |

**Anti-persona:** Teams that do not use reusable AI skills or agents, and organizations seeking a heavyweight enterprise governance suite with compliance reporting.

## Switching Dynamics
**Push:** Skill links and local configurations keep multiplying.

**Pull:** One current, searchable library shared by the whole product team.

**Habit:** Bookmarks, docs, and copied configuration already feel good enough.

**Anxiety:** Another platform could add maintenance, lock teams into a proprietary format, or restrict an open ecosystem.

## Customer Language
**How they describe the problem:**
- "Where did we save that skill?"
- "Which version is the team using?"
- "Can you send me the command for that one?"
- "I found a useful skill, but everyone has a different agent setup."

**How they describe us:**
- "One place for the skills our team actually uses."
- "A shared skill library for the whole product team."
- "The layer between skills.sh and our agents."

**Words to use:** team skill library, one trusted library, team-approved skills, product team, connected to GitHub, ready to install, available through MCP, free, open source

**Words to avoid:** agent capability platform, AI orchestration layer, enterprise governance, unlock, supercharge, revolutionize, automatically synchronized

**Glossary:**
| Term | Meaning |
|------|---------|
| Skill | A reusable set of instructions or capabilities for an AI agent, referenced from a GitHub repository. |
| Team library | The organization-scoped collection of skills a team has chosen to keep and use. |
| Approved skill | A skill deliberately saved to a team library; not a formal compliance certification. |
| MCP | Model Context Protocol, used to give compatible agents authenticated access to Skills Board tools. |
| skills.sh | The public skill discovery catalog integrated into Skills Board. |

## Brand Voice
**Tone:** Confident, technical, and practical

**Style:** Direct, concise, product-led, and specific. Demonstrate concrete workflows instead of making broad productivity claims.

**Personality:** Opinionated, useful, open, credible

## Proof Points
**Metrics:** None approved yet.

**Customers:** None approved for public use yet.

**Testimonials:** None approved yet.

**Value themes:**
| Theme | Proof |
|-------|-------|
| Shared by the team | Organization libraries and membership |
| Connected to the ecosystem | GitHub-backed references and skills.sh discovery |
| Ready to use | Copyable CLI installation commands |
| Available to agents | Authenticated MCP tools |
| Open access | Free hosted platform and open-source code |

## Goals
**Business goal:** Make Skills Board the default shared skill registry for AI-native product teams.

**Conversion action:** Create a team library.

**Activation path:** Create account → create organization → save the first skill → invite teammates or connect MCP.

**Current metrics:** Not established.
