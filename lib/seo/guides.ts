export const guidePaths = {
  sharedMcpSkillLibrary: "/guides/shared-mcp-skill-library-for-teams",
  aiSkillUseCases: "/guides/ai-skill-use-cases-for-teams",
  onboardNewTeammateSkills: "/guides/onboard-new-teammate-ai-skills-checklist",
  chooseFirstTeamSkill: "/guides/choose-first-ai-agent-skill-for-your-team",
  shareTeamSkills: "/guides/share-agent-skills-with-your-team",
  manageCrossAgentSkills: "/guides/manage-skills-across-claude-codex-cursor",
  aiCodingTeamOnboarding: "/guides/ai-coding-team-onboarding",
  aiCodingGuidelinesTemplate: "/guides/ai-coding-guidelines-template",
} as const

export type GuidePath = (typeof guidePaths)[keyof typeof guidePaths]

export interface GuideDefinition {
  path: GuidePath
  contentType: "guide"
  topics: readonly string[]
  eyebrow: string
  title: string
  description: string
  intro: string
  corePrinciple: string
  problem: string
  decisionTitle: string
  decisionIntro: string
  comparisonColumns: readonly string[]
  comparisonRows: readonly {
    label: string
    cells: readonly string[]
  }[]
  stepsTitle: string
  stepsIntro: string
  steps: readonly {
    title: string
    body: string
    output: string
  }[]
  templateTitle: string
  templateIntro: string
  templateFields: readonly {
    label: string
    value: string
  }[]
  copyTemplate?: string
  pitfallsTitle: string
  pitfalls: readonly {
    title: string
    body: string
  }[]
  checklist: readonly string[]
  sources: readonly {
    label: string
    href: string
    note: string
  }[]
  publishedAt: string
  modifiedAt: string
}

export const sharedMcpSkillLibraryGuide: GuideDefinition = {
  path: guidePaths.sharedMcpSkillLibrary,
  contentType: "guide",
  topics: ["MCP", "team operations", "skill sharing", "AI agent skills", "agent access"],
  eyebrow: "MCP team access",
  title: "How to use a shared AI skill library through MCP",
  description:
    "Connect an MCP-compatible agent to a shared team skill library, authorize access in the browser, search recommendations, and verify a useful handoff.",
  intro:
    "A shared skill library should remain useful when a teammate works inside an agent. MCP gives a compatible client an authenticated path to the same team recommendations, so the teammate can search the library, retrieve a command, and, with the required scope, contribute skills or organize collections without copying an API key.",
  corePrinciple:
    "Keep the team recommendation central. Use MCP as one authenticated access path.",
  problem:
    "Connecting an MCP server is not the same as sharing a useful skill. The connection still needs the correct team account, a current recommendation, an understood permission set, and a real retrieval test. It also needs an honest boundary: Skills Board exposes library tools, but it does not install or execute a skill, certify compatibility, or preserve a historical source version.",
  decisionTitle: "Use MCP for agent access, not as a universal installer",
  decisionIntro:
    "Choose MCP when the teammate's client supports Streamable HTTP and browser-based OAuth. Keep the web library, original source, compatible command, and ZIP available for teammates whose setup does not support that connection.",
  comparisonColumns: ["MCP task", "What the connection provides", "Boundary to keep visible"],
  comparisonRows: [
    {
      label: "Find team recommendations",
      cells: [
        "List or search the saved skills and collections visible to the account that authorized the connection.",
        "The result reflects that account's team memberships. It is not a public approval catalog or a security review.",
      ],
    },
    {
      label: "Choose a use path",
      cells: [
        "Retrieve a compatible install command for a saved skill while keeping its original source visible.",
        "Returning a command does not run it, install the skill, or prove that it works in every agent environment.",
      ],
    },
    {
      label: "Contribute and organize",
      cells: [
        "With the skills:write scope, save a skill from GitHub, create collections, and add or remove saved skills from collections.",
        "The connection cannot edit or delete saved team skills. A recommendation still needs team-owned review and context.",
      ],
    },
  ],
  stepsTitle: "A six-step MCP team-library test",
  stepsIntro:
    "Start with one existing team recommendation and one teammate. The goal is to prove that the teammate can reach the right library, understand the granted access, and retrieve a useful path without private setup guidance.",
  steps: [
    {
      title: "Prepare one real recommendation",
      body: "Confirm that the team library contains one skill for a repeated task. Check its title, tags, note, original source, and known limits before testing a new access path. MCP can expose the record, but it cannot repair unclear team context.",
      output: "One current recommendation with a clear task, source, owner, and expected result.",
    },
    {
      title: "Confirm the client can make the connection",
      body: "Open Skills Board Settings, choose MCP, and follow the instructions for the teammate's actual client. The hosted endpoint uses Streamable HTTP and browser-based OAuth. A client that accepts only a static API key or only the older SSE transport is not a compatible path.",
      output: "One supported client path and the Skills Board MCP endpoint from the signed-in product.",
    },
    {
      title: "Authorize the intended account and access",
      body: "Complete sign-in in the browser and read the consent screen before approving it. Confirm the Skills Board account, requested scopes, and team membership. Never copy access tokens into the handoff record or use a different teammate's session.",
      output: "An authenticated connection tied to the intended account and understood permission set.",
    },
    {
      title: "Verify the library before the task",
      body: "Ask the connected agent to list or search team skills using the task language or a known team tag. Check that the expected recommendation appears and that the source, note, and team context match the web library. An empty result can mean the wrong account or team membership, not an empty global catalog.",
      output: "One expected recommendation found through the connected agent and matched to the web library.",
    },
    {
      title: "Retrieve, inspect, and test one path",
      body: "Ask for the saved skill's install command, then inspect the original source and supporting files before using it. Run only a compatible path in the teammate's environment and compare the result with the task's acceptance criteria. Skills Board returns the path; the teammate and agent perform the installation or use.",
      output: "One retrieved path plus a pass, partial, or fail result from a safe fixture.",
    },
    {
      title: "Record limits and the fallback path",
      body: "If the team needs contribution or collection tools, confirm that the connection has skills:write before using them. Record what worked, which account and client were tested, and which web, source, command, or ZIP path teammates should use when MCP is unavailable.",
      output: "A small connection record with verified capabilities, known limits, owner, and fallback.",
    },
  ],
  templateTitle: "MCP team access verification record",
  templateIntro:
    "Keep this record free of tokens, authorization codes, and personal data. It should prove the team path without storing credentials or implying permanent compatibility.",
  templateFields: [
    {
      label: "Team and account",
      value: "The intended team library and the role of the account that authorized access.",
    },
    {
      label: "Client and transport",
      value: "The observed MCP client, environment, Streamable HTTP endpoint, and test date.",
    },
    {
      label: "Granted access",
      value: "The scopes shown during consent and whether write operations were intentionally included.",
    },
    {
      label: "Library proof",
      value: "The task query or tag used and the expected recommendation found in both MCP and the web library.",
    },
    {
      label: "Use-path proof",
      value: "The retrieved command, inspected source state, safe fixture, and observed result without storing credentials.",
    },
    {
      label: "Limits and fallback",
      value: "Unsupported operations, untested clients, alternative web or file path, owner, and review trigger.",
    },
  ],
  copyTemplate: `# MCP team library verification

Owner: [person or team]
Test date: [date]

## 1. Team and account
- Team library: [name]
- Account role: [role, not personal data]
- Membership confirmed: [yes/no]

## 2. Client and connection
- MCP client and environment: [observed setup]
- Endpoint copied from Skills Board Settings: [yes/no]
- Streamable HTTP supported: [yes/no]
- Browser sign-in completed: [yes/no]

## 3. Consent
- Requested scopes reviewed: [yes/no]
- skills:read present: [yes/no]
- skills:write intentionally present: [yes/no/not needed]
- No token or authorization code stored here: [confirmed]

## 4. Library proof
- Search task or tag: [query]
- Expected recommendation: [skill]
- MCP and web records match: [yes/no plus gap]

## 5. Use-path proof
- Original source inspected: [yes/no]
- Command retrieved: [yes/no]
- Safe fixture and expected result: [fixture and criteria]
- Result: [pass/partial/fail plus evidence]

## 6. Limits and fallback
- Unsupported or untested behavior: [limits]
- Fallback path: [web/source/compatible command/ZIP]
- Owner and review trigger: [owner and event]`,
  pitfallsTitle: "What breaks an MCP team handoff",
  pitfalls: [
    {
      title: "Treating connection as adoption",
      body: "A green connection proves transport and authorization. It does not prove that a teammate found the right recommendation or completed useful work.",
    },
    {
      title: "Using the wrong account",
      body: "The connection sees the libraries available to the approving account. Verify identity and membership before diagnosing missing skills or collections.",
    },
    {
      title: "Confusing a command with installation",
      body: "Skills Board can return a command, but the connected agent or teammate still decides whether that command fits the environment and whether to run it.",
    },
    {
      title: "Overstating write access",
      body: "The skills:write scope permits specific save and collection operations. It does not permit editing or deleting saved team skills, and it does not turn a recommendation into an approval.",
    },
  ],
  checklist: [
    "The test starts from one current team recommendation and a real task.",
    "The client supports Streamable HTTP and browser-based OAuth for this connection.",
    "The intended account, team membership, and requested scopes were reviewed.",
    "The teammate found the expected recommendation through MCP and matched it to the web library.",
    "The original source was inspected before a compatible use path was tested.",
    "The record names unsupported behavior, a non-MCP fallback, an owner, and a review trigger.",
  ],
  sources: [
    {
      label: "Skills Board: Open-source repository",
      href: "https://github.com/TommyBez/skillsboard",
      note: "Documents the OAuth-protected endpoint, team-library tools, write-scope boundary, source visibility, and alternative use paths implemented by Skills Board.",
    },
    {
      label: "Model Context Protocol: Authorization",
      href: "https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization",
      note: "Defines authorization for HTTP-based MCP connections, including OAuth discovery, access-token handling, and scope requirements.",
    },
    {
      label: "Model Context Protocol: Transports",
      href: "https://modelcontextprotocol.io/specification/2025-11-25/basic/transports",
      note: "Defines Streamable HTTP as a standard MCP transport and explains its single-endpoint request model.",
    },
    {
      label: "Anthropic: Connect Claude Code to tools via MCP",
      href: "https://code.claude.com/docs/en/mcp",
      note: "Documents remote HTTP server setup and browser authentication for OAuth-protected MCP connections in Claude Code.",
    },
  ],
  publishedAt: "2026-07-29",
  modifiedAt: "2026-07-29",
}

export const aiSkillUseCasesGuide: GuideDefinition = {
  path: guidePaths.aiSkillUseCases,
  contentType: "guide",
  topics: ["AI agent skills", "team workflows", "use cases", "team operations", "AI coding tools"],
  eyebrow: "Team skill use cases",
  title: "AI agent skill use cases for teams: 8 repeatable workflows",
  description:
    "Explore eight practical AI agent skill use cases for teams, with clear triggers, safe inputs, reviewable outputs, human checks, and stop boundaries.",
  intro:
    "The most useful agent skills do not start as clever prompts. They start as recurring team workflows with recognizable inputs, a result someone can review, and enough stable guidance to help a second person repeat the work. These eight use cases show what that pattern looks like across engineering, product, research, design, and go-to-market work.",
  corePrinciple:
    "A skill-worthy use case repeats, starts from known inputs, and ends in a reviewable result.",
  problem:
    "Teams often collect broad ideas such as research assistant, coding helper, or marketing agent. Those labels hide the trigger, context, output, and human decision that make a workflow reusable. A useful use case is narrower: it names when the work starts, which approved sources the agent can use, what it must produce, and where a person must review or stop it.",
  decisionTitle: "Separate reusable workflows from one-off requests and human decisions",
  decisionIntro:
    "Use a skill when the procedure will recur and the output can be checked. Use a one-off prompt for temporary exploration. Keep consequential decisions with an authorized person even when a skill prepares evidence or a draft.",
  comparisonColumns: ["Work type", "Good fit", "Boundary"],
  comparisonRows: [
    {
      label: "Reusable skill",
      cells: [
        "A repeated trigger, bounded approved inputs, stable steps, a reviewable output, and a known reviewer.",
        "The skill prepares or verifies work; it does not erase permissions, source review, or human accountability.",
      ],
    },
    {
      label: "One-off prompt",
      cells: [
        "A temporary question, exploratory draft, or unusual task whose procedure is unlikely to repeat.",
        "Do not force a permanent workflow around an exception or store private context merely to make it reusable.",
      ],
    },
    {
      label: "Human-owned decision",
      cells: [
        "Approval, hiring, legal judgment, production access, customer commitments, or another accountable decision.",
        "A skill may organize evidence, but the authorized person keeps the decision and its consequences.",
      ],
    },
  ],
  stepsTitle: "Eight practical team skill use cases",
  stepsIntro:
    "Treat these as workflow patterns, not claims that a particular public skill is available or approved. For each one, define the team's own sources, constraints, fixture, and reviewer before recommending an implementation.",
  steps: [
    {
      title: "Pull-request preflight",
      body: "Trigger the workflow when a focused change is ready for review. Give it the diff, repository instructions, and approved check commands. Ask for a concise summary of scope, failed checks, risky assumptions, and missing evidence, while keeping approval and merge with the reviewer.",
      output: "A review packet with changed behavior, check results, risks, and unresolved questions tied to repository evidence.",
    },
    {
      title: "Release-note drafting",
      body: "Start from merged changes, issue references, and the product's approved language. Produce a customer-safe draft that separates shipped behavior from internal implementation and flags anything unsupported by the source. A product owner reviews claims before publication.",
      output: "A scoped changelog draft with source links, audience language, and unsupported claims called out.",
    },
    {
      title: "Bug triage and reproduction planning",
      body: "Use an authorized report, relevant logs, and known environment details to extract observed behavior, expected behavior, reproduction steps, and missing information. Do not let the workflow invent a root cause or expose private diagnostics outside the approved context.",
      output: "A reproducible issue brief that separates observations, hypotheses, unknowns, and the next safe diagnostic step.",
    },
    {
      title: "Source-backed research synthesis",
      body: "Give the workflow a bounded question and an approved source set or search boundary. Require citations near each material claim, separate source facts from inference, preserve contradictions, and state what remains unproven instead of smoothing uncertainty away.",
      output: "A decision-ready research brief with attributable evidence, competing interpretations, and explicit unknowns.",
    },
    {
      title: "Customer-feedback triage",
      body: "Use only feedback the team is authorized to process, with personal or sensitive information removed when it is not needed. Group comments by the underlying job or friction, retain traceable evidence, and leave product priority and individual follow-up to the responsible team.",
      output: "A privacy-safe theme map with evidence counts, representative paraphrases, contradictions, and no invented customer conclusions.",
    },
    {
      title: "Product-spec completeness review",
      body: "Provide the current spec, product contract, dependencies, and acceptance format. Ask the workflow to find missing states, conflicting requirements, unowned decisions, and verification gaps. It should produce questions and checks, not silently choose product behavior.",
      output: "A structured gap review covering states, dependencies, acceptance criteria, owners, and open decisions.",
    },
    {
      title: "Design and accessibility review",
      body: "Supply the relevant interface, design-system rules, supported breakpoint, and named accessibility criteria. Ask for observable issues, evidence, severity, and a suggested check. A designer or engineer confirms context and owns any final design change.",
      output: "An evidence-based review list with affected elements, applicable rules, severity, and verification steps.",
    },
    {
      title: "Content and launch QA",
      body: "Start from a draft plus the current product-truth, brand, channel, and legal sources. Check claims, links, dates, voice, consent-sensitive language, and channel limits. Return corrections and unresolved approvals without publishing or inventing proof.",
      output: "A source-linked QA report with corrected copy, unsupported claims removed, and owner decisions still visible.",
    },
  ],
  templateTitle: "A compact team skill use-case brief",
  templateIntro:
    "Use one row per recurring workflow. Keep it small enough to compare across the team, and do not include secrets, unnecessary personal data, or unapproved customer material.",
  templateFields: [
    {
      label: "Trigger",
      value: "The recurring event that starts the workflow and how often it happens.",
    },
    {
      label: "Approved inputs",
      value: "The minimum authoritative sources, safe fixture, and data boundary the workflow needs.",
    },
    {
      label: "Reviewable output",
      value: "The exact artifact, format, and observable conditions for a useful result.",
    },
    {
      label: "Human checkpoint",
      value: "The person or role that verifies, approves, publishes, merges, sends, or decides.",
    },
    {
      label: "Stop boundary",
      value: "The permission, uncertainty, sensitive data, or consequential decision that ends autonomous work.",
    },
    {
      label: "Team recommendation",
      value: "The reviewed source, tested environment, owner, limits, and event that triggers another review.",
    },
  ],
  copyTemplate: `# Team skill use-case brief

Owner: [person or team]
Review date: [date]

## Workflow
- Use case: [specific repeated task]
- Trigger: [event that starts it]
- Frequency: [how often it occurs]
- Current friction: [failure, delay, or repeated effort]

## Approved inputs
- Authoritative sources: [files, URLs, systems, or records]
- Safe fixture: [representative input]
- Data that must not be used: [boundary]

## Reviewable output
- Artifact and format: [expected result]
- Acceptance checks: [observable conditions]
- Evidence required: [citations, commands, screenshots only when authorized, or logs]

## Human checkpoint
- Reviewer: [person or role]
- Decision they retain: [approval, merge, publication, send, or other effect]

## Stop boundary
- Stop when: [permission, requirement, sensitive data, or consequential decision is unclear]
- Escalate to: [owner]

## Recommendation record
- Canonical source: [URL and reviewed source state]
- Tested environment: [observed agent and setup]
- Known limits: [unsupported or untested behavior]
- Review trigger: [source, tool, policy, or workflow change]`,
  pitfallsTitle: "What weakens a use-case library",
  pitfalls: [
    {
      title: "Listing vague agent roles",
      body: "Researcher, coding assistant, and marketer are categories, not repeatable workflows. Name the trigger, source, output, and reviewer for each use case.",
    },
    {
      title: "Turning examples into availability claims",
      body: "A useful workflow pattern does not prove that a matching public skill exists, passed review, or works in the team's environment.",
    },
    {
      title: "Using sensitive data by default",
      body: "Customer feedback, logs, incidents, and internal research may contain protected material. Minimize, redact, or keep it outside the workflow when authorization is absent.",
    },
    {
      title: "Automating the accountable decision",
      body: "A skill can prepare evidence and drafts. It should not silently own approval, hiring, legal judgment, production access, publication, or customer commitments.",
    },
  ],
  checklist: [
    "Every use case has a recurring trigger and a bounded, team-relevant outcome.",
    "Approved sources and prohibited data are explicit before the workflow runs.",
    "The output has observable checks and a named human reviewer.",
    "The stop boundary preserves permissions and consequential decisions.",
    "Examples are presented as patterns, not as catalog availability or compatibility claims.",
    "A saved team recommendation records the reviewed source, tested setup, limits, owner, and review trigger.",
  ],
  sources: [
    {
      label: "OpenAI: Using skills",
      href: "https://openai.com/academy/skills/",
      note: "Introduces skills as reusable workflows and starts skill creation from a repeatable task with a clear input and output.",
    },
    {
      label: "Anthropic: Agent Skills in the SDK",
      href: "https://code.claude.com/docs/en/agent-sdk/skills",
      note: "Documents SKILL.md, supporting resources, discovery, and the environment in which a reusable skill runs.",
    },
    {
      label: "GitHub: About agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "Describes Agent Skills as folders of instructions, scripts, and resources that improve repeatable specialized tasks.",
    },
    {
      label: "Google Cloud and DORA: AI Capabilities Model",
      href: "https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model",
      note: "Connects stronger AI-assisted outcomes with clear policy, versioned work, user focus, and small, reviewable batches.",
    },
  ],
  publishedAt: "2026-07-29",
  modifiedAt: "2026-07-29",
}

export const onboardNewTeammateSkillsGuide: GuideDefinition = {
  path: guidePaths.onboardNewTeammateSkills,
  contentType: "guide",
  topics: [
    "team onboarding",
    "AI agent skills",
    "skill sharing",
    "AI coding tools",
    "mixed-agent teams",
  ],
  eyebrow: "New teammate handoff",
  title: "AI skills onboarding checklist for a new teammate",
  description:
    "Use this AI skills onboarding checklist to help a new teammate find one team-recommended skill, choose a suitable path, and verify it on a real task.",
  intro:
    "Onboarding a new teammate to AI skills should not begin with a catalog tour or a folder of setup notes. Give them one real task, one recommendation the team already uses, and enough context to choose a suitable path. The handoff works when they can find, inspect, and use the skill without private guidance.",
  corePrinciple:
    "Give one teammate one real task and let them complete the handoff themselves.",
  problem:
    "An invitation, copied command, or installed file proves access, not useful onboarding. The teammate still needs to know which problem the skill addresses, why the team recommends it, where its latest source lives, and what a good result looks like. A bounded handoff makes each of those decisions visible and tests whether the recommendation works without the original author filling in missing context.",
  decisionTitle: "Choose a handoff that ends in independent use",
  decisionIntro:
    "A useful handoff gives the teammate enough context to make a real choice without doing the task for them. Use one existing recommendation, one representative fixture, and one observable result instead of treating account access or installation as completion.",
  comparisonColumns: ["Handoff model", "What the teammate receives", "Main risk"],
  comparisonRows: [
    {
      label: "Links in chat",
      cells: [
        "A direct link and a short explanation from an experienced teammate.",
        "The context disappears into conversation, and the next person has to ask again.",
      ],
    },
    {
      label: "Agent setup tour",
      cells: [
        "A working configuration and a walkthrough for one agent environment.",
        "Setup becomes the goal, and the handoff may not transfer to a teammate using another agent.",
      ],
    },
    {
      label: "Library-led handoff",
      cells: [
        "One findable recommendation, its visible source, available use paths, and a real test task.",
        "It requires a bounded first task and an honest result instead of a quick access check.",
      ],
    },
  ],
  stepsTitle: "A six-step new teammate handoff",
  stepsIntro:
    "Assume the team library and at least one recommendation already exist. The new teammate should make the important discovery and usage decisions while an owner supplies the task, boundaries, and review criteria.",
  steps: [
    {
      title: "Choose one real first task",
      body: "Pick a task the teammate will actually encounter soon, with a clear input and reviewable output. Keep the first task narrow, free of sensitive data, and small enough to complete in one session. Define the acceptable result before introducing the skill.",
      output: "One task brief with a trigger, safe fixture, expected result, and reviewer.",
    },
    {
      title: "Prepare one team recommendation",
      body: "Choose one skill the team already recommends for that task. Confirm that its description, tags, original source, notes, and available use paths are current. Explain why it was selected without presenting the recommendation as a security review or compatibility guarantee.",
      output: "One complete, searchable recommendation tied to the first task.",
    },
    {
      title: "Invite the teammate and set the boundary",
      body: "Invite the teammate to the team library and explain the task, expected result, and human review point. Make the product contract explicit: Skills Board points to the latest source, and the teammate still needs to inspect that source and choose a path that fits their setup.",
      output: "Confirmed library access plus a short brief covering purpose, limits, and review.",
    },
    {
      title: "Ask them to find and inspect the skill",
      body: "Give the teammate the task language or expected tag, then let them search the library instead of sending a private deep link. Ask them to open the original source and review SKILL.md, supporting files, required tools, permissions, and data paths before use.",
      output: "An independently found recommendation with the relevant source and limits identified.",
    },
    {
      title: "Let them choose and test a use path",
      body: "The teammate chooses the original source, a compatible install command, the latest files as a ZIP, or authenticated MCP access when available for their setup. They run the same safe fixture and compare the result with the acceptance criteria.",
      output: "One observed use path and a pass, partial, or fail result from the fixture.",
    },
    {
      title: "Record the result and next step",
      body: "Capture the path and environment used, what the teammate could complete without help, and where the recommendation or setup was unclear. Keep, revise, or replace the recommendation, then name the owner and the source, agent, or workflow change that should trigger another review.",
      output: "A handoff decision with evidence, an owner, and a review trigger.",
    },
  ],
  templateTitle: "New teammate AI skills handoff checklist",
  templateIntro:
    "Use one copy per teammate and first workflow. Record only the context needed to improve the handoff, and keep personal or sensitive information out of the checklist.",
  templateFields: [
    {
      label: "First task",
      value: "The trigger, safe fixture, expected output, and person who will review the result.",
    },
    {
      label: "Team recommendation",
      value: "The skill, why the team recommends it, its search tags, source, and known limits.",
    },
    {
      label: "Access and boundary",
      value: "Library access, allowed data and tools, human review point, and explicit stop conditions.",
    },
    {
      label: "Independent discovery",
      value: "The task language used to search and whether the teammate found the recommendation without a private link.",
    },
    {
      label: "Use path and fixture",
      value: "The source, compatible command, ZIP, or MCP path chosen, plus the observed fixture result.",
    },
    {
      label: "Outcome and owner",
      value: "Keep, revise, or replace, with gaps, next action, owner, and review trigger.",
    },
  ],
  copyTemplate: `# New teammate AI skills handoff

Owner: [person or team]
Teammate role: [role, not personal data]
Handoff date: [date]

## 1. First task
- Trigger: [when this task starts]
- Safe fixture: [representative, non-sensitive input]
- Expected output: [observable result]
- Reviewer: [person or role]

## 2. Team recommendation
- Skill: [name]
- Why the team recommends it: [specific task fit]
- Search terms or tags: [terms the teammate should try]
- Original source: [canonical URL]
- Known limits: [what is untested or unsupported]

## 3. Access and boundary
- Team library access confirmed: [yes/no]
- Allowed tools and data: [scope]
- Human review point: [decision before use]
- Stop when: [permission, data, or requirement is unclear]
- Reminder: a saved skill is a team recommendation, not a security review or compatibility guarantee.

## 4. Independent discovery and review
- Found without a private link: [yes/no]
- Source files inspected: [SKILL.md, scripts, references, templates]
- Required permissions and data paths understood: [yes/no plus notes]
- Latest-source behavior understood: [yes/no]

## 5. Use path and fixture
- Path chosen: [source / compatible command / ZIP / MCP]
- Agent and environment: [observed setup]
- Acceptance criteria: [pass conditions]
- Result: [pass / partial / fail plus evidence]

## 6. Outcome and follow-up
- What worked without help: [evidence]
- What was unclear: [gap]
- Decision: [keep / revise / replace]
- Next action and owner: [action]
- Review again when: [source, agent, permissions, or workflow changes]`,
  pitfallsTitle: "What weakens a new teammate handoff",
  pitfalls: [
    {
      title: "Showing the whole catalog",
      body: "A long list shifts the work of choosing onto the newest person. Start with one real task and one recommendation the team can explain.",
    },
    {
      title: "Completing the handoff for them",
      body: "A deep link, copied setup, and guided run can hide gaps in search terms, source notes, and instructions. Let the teammate complete the important steps.",
    },
    {
      title: "Treating recommendation as approval",
      body: "A saved skill records the team’s choice. It does not certify security, guarantee compatibility, or preserve the exact upstream version someone used before.",
    },
    {
      title: "Stopping at installation",
      body: "A command completing or a ZIP downloading does not prove useful work. End the handoff with a representative task and a reviewed result.",
    },
  ],
  checklist: [
    "The handoff starts with one real task, safe fixture, expected result, and reviewer.",
    "One team recommendation has current tags, notes, source, use paths, and known limits.",
    "The teammate has library access and understands the data, tool, and human review boundaries.",
    "The teammate found the recommendation by task or tag and inspected its original source.",
    "The teammate chose a suitable use path and ran the fixture in their actual environment.",
    "The team recorded the result, remaining gap, decision, owner, and review trigger.",
  ],
  sources: [
    {
      label: "Skills Board: Open-source repository",
      href: "https://github.com/TommyBez/skillsboard",
      note: "Documents the team library, source visibility, available handoff paths, recommendation limits, and optional MCP access implemented by Skills Board.",
    },
    {
      label: "OpenAI: Using skills",
      href: "https://openai.com/academy/skills/",
      note: "Introduces skills as reusable workflows and starts skill design from a repeatable task with a clear input and output.",
    },
    {
      label: "Anthropic: Agent Skills in the SDK",
      href: "https://code.claude.com/docs/en/agent-sdk/skills",
      note: "Documents SKILL.md, supporting files, skill discovery, and the environment in which a skill runs.",
    },
    {
      label: "GitHub: About agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "Describes the open Agent Skills standard and the repository and personal locations supported by Copilot coding agent.",
    },
  ],
  publishedAt: "2026-07-29",
  modifiedAt: "2026-07-29",
}

export const chooseFirstTeamSkillGuide: GuideDefinition = {
  path: guidePaths.chooseFirstTeamSkill,
  contentType: "guide",
  topics: ["team operations", "skill selection", "AI agent skills", "team onboarding"],
  eyebrow: "First team skill",
  title: "How to choose the first AI agent skill for your team",
  description:
    "Evaluate AI agent skills with a selection scorecard, source review, disqualifier check, and teammate test before your team recommends one.",
  intro:
    "The best first skill is not the most impressive one in a catalog. It is the smallest repeatable workflow your team can inspect, test, and hand to a second teammate with a clear expected result. This guide turns that choice into an observable team decision.",
  corePrinciple:
    "Choose the repeated problem first. Validate the skill with a second teammate.",
  problem:
    "Popularity, novelty, and agent compatibility can help you discover candidates, but none proves that a skill solves your team’s problem. A useful first choice connects one recurring task to one inspectable source, one representative test, and one independent teammate handoff. That gives the team evidence it can use before expanding the library.",
  decisionTitle: "Choose the problem before the skill",
  decisionIntro:
    "Use popularity and agent support as filters, not as the decision. Set the scoring rule before reviewing candidates: no disqualifier and at least 8 of 10 points across problem fit, source inspectability, required access, reproducibility, and team setup.",
  comparisonColumns: ["Starting point", "What it optimizes", "Main risk"],
  comparisonRows: [
    {
      label: "Most popular skill",
      cells: [
        "Fast discovery and social proof from other users.",
        "Popularity may reflect a different workflow, risk profile, or team context.",
      ],
    },
    {
      label: "Agent-first choice",
      cells: [
        "A convenient setup path for the tool the selector already uses.",
        "The team may choose around one tool instead of the shared problem and expected result.",
      ],
    },
    {
      label: "Repeated problem first",
      cells: [
        "A measurable improvement to a task the team already performs.",
        "It requires a small test and honest review before the recommendation is shared.",
      ],
    },
  ],
  stepsTitle: "A six-step selection test",
  stepsIntro:
    "Compare no more than three candidates for one real task. Reject unsafe or uninspectable options first, score the remainder, and hand only the winner to a teammate who did not select it.",
  steps: [
    {
      title: "Name one repeated problem",
      body: "Pick a task that already recurs, costs attention, and has a recognizable output. Write down the current approach and the failure you want the skill to prevent. Avoid broad goals such as ‘improve engineering’ that cannot be tested in one sitting.",
      output: "One sentence naming the trigger, current friction, and expected result.",
    },
    {
      title: "Build a shortlist of three or fewer",
      body: "Find candidates through trusted sources, catalogs, or teammate suggestions, then stop at three. Record each canonical source and claimed use case. A short list forces a real comparison and prevents popularity from becoming the default decision.",
      output: "A bounded candidate list tied to the same problem and expected result.",
    },
    {
      title: "Apply the disqualifier gate",
      body: "Read SKILL.md and every referenced script, template, example, and external tool. Reject a candidate when the source cannot be inspected, required access exceeds the task, data handling is unacceptable, or the instructions conceal a dependency the team cannot authorize.",
      output: "A pass or reject decision with the exact disqualifier, if any.",
    },
    {
      title: "Score the surviving candidates",
      body: "Give each candidate 0, 1, or 2 points for problem fit, source inspectability, least required access, reproducibility, and fit with the team’s actual setup. Use the rule set before comparison: a candidate needs at least 8 of 10 and no disqualifier.",
      output: "A comparable score with one sentence of evidence for every dimension.",
    },
    {
      title: "Run the winner on one fixture",
      body: "Use an input that resembles the team’s real work and define the acceptable output before running the skill. Record the exact commit or tag reviewed, the review date, the agent, and the setup. Skills Board surfaces the latest upstream files, so an upstream change requires another review.",
      output: "A before-and-after example with an observable pass or fail result and reviewed source state.",
    },
    {
      title: "Save and test the team handoff",
      body: "Save the winner in Skills Board with the visible source, score, review date, truthful recommendation, and search tag. Invite a second teammate and ask them to choose the source, compatible install command, or ZIP path for their setup. Keep the recommendation only if they can find it and reproduce the expected result.",
      output: "One searchable recommendation plus an independent keep, revise, or reject result.",
    },
  ],
  templateTitle: "First-skill selection scorecard",
  templateIntro:
    "Score evidence, not enthusiasm. A candidate is ready to recommend only when the source is inspectable, the fixture passes, and another teammate can reproduce the path.",
  templateFields: [
    {
      label: "Repeated problem",
      value: "The task trigger, current friction, frequency, and expected output.",
    },
    {
      label: "Candidate source",
      value: "The canonical URL, reviewed commit or tag, review date, and exact instructions, scripts, permissions, and data paths inspected.",
    },
    {
      label: "Disqualifier gate",
      value: "Inspectable source, acceptable access and data handling, authorized dependencies, and no concealed setup requirement.",
    },
    {
      label: "Selection score",
      value: "0 to 2 points each for problem fit, inspectability, least access, reproducibility, and team setup, with an 8 of 10 threshold.",
    },
    {
      label: "Fixture and handoff",
      value: "The test input and result, invited teammate, access path chosen, and whether they reproduced it without private context.",
    },
    {
      label: "Decision",
      value: "Keep, revise, or reject, with an owner and the event that should trigger another review.",
    },
  ],
  copyTemplate: `# First AI agent skill scorecard

## Repeated problem
- Trigger: [when this task starts]
- Current friction: [time, inconsistency, or failure]
- Expected output: [observable result]
- Frequency: [how often the team does it]

## Candidate source
- Skill: [name]
- Canonical source: [URL]
- Reviewed commit or tag: [source state]
- Review date: [date]
- Instructions and supporting files reviewed: [yes/no plus notes]
- Scripts, permissions, and data paths reviewed: [yes/no plus notes]

## Disqualifier gate
- Complete source is inspectable: [yes/no]
- Required access fits the task: [yes/no]
- Data handling is acceptable: [yes/no]
- External dependencies are authorized and visible: [yes/no]
- Result: [pass/reject plus evidence]

## Selection score
- Problem fit: [0/1/2 plus evidence]
- Source inspectability: [0/1/2 plus evidence]
- Least required access: [0/1/2 plus evidence]
- Reproducibility: [0/1/2 plus evidence]
- Team setup fit: [0/1/2 plus evidence]
- Total: [0-10; threshold is 8 with no disqualifier]

## Representative fixture
- Test input: [realistic, non-sensitive example]
- Acceptable result: [pass criteria]
- Agent and setup tested: [observed path only]
- Result: [pass/fail plus evidence]

## Team recommendation
- Why we recommend it: [specific reason]
- What remains untested: [limits]
- Upstream note: Skills Board surfaces the latest source files; re-review after changes.
- Search tag: [term a teammate will use]
- Owner: [person or team]

## Independent handoff
- Teammate invited: [name or role]
- Path chosen: [source, compatible command, or ZIP]
- Could they find and run it without private context? [yes/no]
- Second result: [pass/fail plus evidence]

## Decision
[Keep / revise / reject]
Review again when: [source, agent, permissions, or workflow changes]`,
  pitfallsTitle: "What weakens the first choice",
  pitfalls: [
    {
      title: "Starting from the leaderboard",
      body: "A leaderboard is useful for building the shortlist, but it cannot define your team’s repeated problem, clear a disqualifier, or supply an acceptable result.",
    },
    {
      title: "Reviewing only SKILL.md",
      body: "Supporting scripts, examples, templates, permissions, and external tools can change the behavior and risk score of the workflow.",
    },
    {
      title: "Letting the selector run both tests",
      body: "The author remembers context that the recommendation may not contain. A second teammate exposes missing setup and unclear language.",
    },
    {
      title: "Treating a save as certification",
      body: "The team recommendation makes a choice visible. It does not certify security, guarantee compatibility, or freeze the upstream source.",
    },
  ],
  checklist: [
    "The candidate solves one repeated problem with an observable expected result.",
    "The shortlist contains no more than three candidates for the same expected result.",
    "The complete source passed every disqualifier and the candidate scored at least 8 of 10.",
    "The test recorded a representative fixture, reviewed source state, date, and actual agent path.",
    "The Skills Board note explains the score, recommendation, limits, and upstream re-review trigger.",
    "A second teammate found the recommendation and reproduced it, or the candidate was revised or rejected.",
  ],
  sources: [
    {
      label: "OpenAI: Using skills",
      href: "https://openai.com/academy/skills/",
      note: "Introduces skills as reusable workflows and starts skill creation from a repeatable task with a clear input and output.",
    },
    {
      label: "Anthropic: Agent Skills in the SDK",
      href: "https://code.claude.com/docs/en/agent-sdk/skills",
      note: "Documents the SKILL.md structure, supporting files, discovery, and progressive loading used by Claude Agent SDK.",
    },
    {
      label: "GitHub: Add agent skills",
      href: "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills",
      note: "Documents skill folders, SKILL.md requirements, supporting resources, and repository-level sharing for Copilot coding agent.",
    },
  ],
  publishedAt: "2026-07-28",
  modifiedAt: "2026-07-28",
}

export const shareTeamSkillsGuide: GuideDefinition = {
  path: guidePaths.shareTeamSkills,
  contentType: "guide",
  topics: ["team operations", "skill sharing", "governance", "mixed-agent teams"],
  eyebrow: "Team skill operations",
  title: "How to share AI agent skills with your team",
  description:
    "A practical workflow to share AI agent skills across a team, set ownership, compare distribution models, and keep one trusted recommendation library.",
  intro:
    "Sharing a skill is easy. Making it trustworthy, discoverable, and reusable by the next teammate is the real job. This guide gives you a lightweight operating model that works whether your team uses one agent or several.",
  corePrinciple:
    "One canonical source. One visible recommendation. Explicit setup for every agent path.",
  problem:
    "A link in chat answers “where is the file?” once. It does not say who owns the skill, what problem it solves, which agents were tested, or whether the team should still use it. Treat the skill artifact, its distribution path, and the team recommendation as three separate layers.",
  decisionTitle: "Choose the sharing model that matches your team",
  decisionIntro:
    "Most teams need a combination: a versioned source for the artifact and a shared catalog for discovery and recommendation. Vendor-native sharing is useful when everyone works in the same managed environment.",
  comparisonColumns: ["Sharing model", "Best fit", "Trade-off"],
  comparisonRows: [
    {
      label: "Vendor-native sharing",
      cells: [
        "One managed agent environment with central administration.",
        "Simple inside that environment, but the recommendation can fragment when the team adds another agent.",
      ],
    },
    {
      label: "Versioned repository",
      cells: [
        "Teams that already review operational files in Git.",
        "Strong history and ownership, but installation and discovery still need a documented workflow.",
      ],
    },
    {
      label: "Shared recommendation library",
      cells: [
        "Mixed-agent teams that need one place to decide which skill to use.",
        "Improves discovery and context; it does not automatically provision the skill into every agent.",
      ],
    },
  ],
  stepsTitle: "A six-step sharing workflow",
  stepsIntro:
    "Keep the first rollout small. One useful skill with a clear owner teaches you more than a large directory nobody is responsible for.",
  steps: [
    {
      title: "Start with a repeated team problem",
      body: "Name the recurring task, the expected output, and the failure the skill should prevent. A skill called “release notes” is weaker than one that consistently turns merged pull requests into a customer-safe changelog.",
      output: "One sentence describing the trigger, workflow, and expected result.",
    },
    {
      title: "Keep one canonical source",
      body: "Store the SKILL.md file and its supporting resources in one versioned location. Share links to that source instead of copying the files into chat, docs, and private folders.",
      output: "A canonical repository URL with visible history and ownership.",
    },
    {
      title: "Review the artifact before recommending it",
      body: "Check the instructions, bundled scripts, tool permissions, data handling, and final verification steps. Treat an externally sourced skill like code or automation—not like a harmless prompt snippet.",
      output: "A named reviewer and a recorded review date.",
    },
    {
      title: "Publish a minimal recommendation record",
      body: "Record what the skill is for, why the team recommends it, its source, install or access path, tested agents, owner, and current status. Keep operational notes next to the recommendation rather than in a separate chat thread.",
      output: "A searchable team record that points back to the canonical source.",
    },
    {
      title: "Test the actual team paths",
      body: "Install or open the skill using the paths your teammates will use. Verify at least one representative task per supported agent and document any agent-specific setup instead of claiming universal compatibility.",
      output: "A small compatibility note based on observed behavior.",
    },
    {
      title: "Review, update, or retire",
      body: "Give every recommendation an owner and a review trigger. Source changes, tool changes, repeated failures, or a better replacement should start a new review—not leave two competing copies in circulation.",
      output: "An active, needs-review, or retired lifecycle state.",
    },
  ],
  templateTitle: "The minimum useful skill record",
  templateIntro:
    "This record is deliberately small enough to maintain. Add fields only when they change a decision or reduce rollout risk.",
  templateFields: [
    { label: "Problem", value: "The repeated task this skill helps the team complete." },
    { label: "Recommendation", value: "Why the team prefers this skill over the current alternative." },
    { label: "Canonical source", value: "The repository path or source URL for the reviewed artifact." },
    { label: "Use paths", value: "Source, install command, ZIP, MCP, or agent-specific instructions that actually exist." },
    { label: "Compatibility", value: "Agents and environments the team has tested—never an assumed universal claim." },
    { label: "Owner and status", value: "The person responsible plus active, needs-review, or retired." },
  ],
  pitfallsTitle: "What usually breaks",
  pitfalls: [
    {
      title: "Copying instead of linking",
      body: "Every copied SKILL.md becomes a possible fork. Keep one canonical source and let recommendation records point to it.",
    },
    {
      title: "Calling availability approval",
      body: "A skill appearing in a marketplace or repository does not mean your team has reviewed its scripts, permissions, or output quality.",
    },
    {
      title: "Ignoring mixed-agent reality",
      body: "A portable format helps, but discovery, invocation, installation, and administration can still differ by agent and version.",
    },
    {
      title: "Growing the catalog without owners",
      body: "More entries create more ambiguity when nobody is accountable for reviewing changes or retiring stale recommendations.",
    },
  ],
  checklist: [
    "The skill solves a repeated team problem with a concrete expected output.",
    "One canonical source is versioned and accessible to the intended teammates.",
    "Scripts, permissions, and data handling were reviewed before recommendation.",
    "The recommendation says which agents were actually tested.",
    "The record has an owner, status, and review trigger.",
    "The next teammate can find and use it without searching chat history.",
  ],
  sources: [
    {
      label: "OpenAI: Using skills",
      href: "https://openai.com/academy/skills/",
      note: "Defines skills as reusable workflows and SKILL.md as a portable, versionable playbook.",
    },
    {
      label: "Anthropic: Extend Claude with skills",
      href: "https://code.claude.com/docs/en/slash-commands",
      note: "Documents skill structure, discovery, sharing, invocation, and supporting resources in Claude Code.",
    },
    {
      label: "GitHub: About agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "Describes the open Agent Skills standard and repository or personal skill locations supported by Copilot.",
    },
  ],
  publishedAt: "2026-07-22",
  modifiedAt: "2026-07-22",
}

export const manageCrossAgentSkillsGuide: GuideDefinition = {
  path: guidePaths.manageCrossAgentSkills,
  contentType: "guide",
  topics: ["team operations", "skill sharing", "compatibility", "mixed-agent teams"],
  eyebrow: "Cross-agent operations",
  title: "Manage skills across Claude Code, Codex, and Cursor",
  description:
    "Use one source of truth to manage SKILL.md workflows across Claude Code, Codex, and Cursor without confusing portability with automatic synchronization.",
  intro:
    "Claude Code, Codex, and Cursor can all work with reusable skills, but “supported” does not mean “kept in sync.” A durable team setup separates the shared skill source from each agent’s installation and discovery rules.",
  corePrinciple:
    "One canonical source. One visible recommendation. Explicit setup for every agent path.",
  problem:
    "Mixed-agent teams usually fail in one of two ways: they maintain three unrelated skill collections, or they assume one folder will behave identically everywhere. The safer model is one canonical artifact, one team recommendation record, and a thin, tested adapter for each agent surface.",
  decisionTitle: "Standardize the layers, not every implementation detail",
  decisionIntro:
    "The common layer is the skill’s purpose, source, owner, and SKILL.md workflow. Agent-specific installation, discovery, invocation, and administrative controls remain explicit adapters that your team verifies against current vendor documentation.",
  comparisonColumns: ["Layer", "Team standard", "Agent-specific adapter"],
  comparisonRows: [
    {
      label: "Skill artifact",
      cells: [
        "One canonical SKILL.md plus versioned scripts, templates, and references.",
        "Confirm which bundled resources and extensions each agent supports before rollout.",
      ],
    },
    {
      label: "Discovery",
      cells: [
        "One shared recommendation record explains when the skill should be used.",
        "Claude Code, Codex, and Cursor can expose skills differently by product, version, workspace, or project.",
      ],
    },
    {
      label: "Installation",
      cells: [
        "Keep the reviewed source and intended version stable.",
        "Document the current supported install or access path for each agent instead of inventing a universal command.",
      ],
    },
    {
      label: "Invocation",
      cells: [
        "Use the same task fixture and expected output in compatibility tests.",
        "Record whether the skill is selected automatically, invoked explicitly, or constrained by local settings.",
      ],
    },
    {
      label: "Updates",
      cells: [
        "Review changes at the canonical source and publish one new recommendation state.",
        "Refresh or reinstall through each tested agent path; portability alone does not perform this step.",
      ],
    },
  ],
  stepsTitle: "A cross-agent rollout that stays understandable",
  stepsIntro:
    "Pilot one skill across the three agents before generalizing the process. The goal is to expose differences early and keep them in a small compatibility record.",
  steps: [
    {
      title: "Choose one representative workflow",
      body: "Pick a skill with a clear input and reviewable output, such as release-note drafting or a code-review checklist. Avoid a first pilot that depends on many private tools or broad write permissions.",
      output: "One narrow workflow and one reusable test fixture.",
    },
    {
      title: "Normalize the portable core",
      body: "Keep purpose, trigger, inputs, procedure, output format, and final checks in SKILL.md. Put templates, examples, and scripts beside it so the source remains inspectable and versioned.",
      output: "A canonical skill directory with a stable source URL.",
    },
    {
      title: "Create three small setup notes",
      body: "For Claude Code, Codex, and Cursor, link the current official instructions and record only the settings or locations your team actually uses. Do not duplicate the full skill to create the notes.",
      output: "One concise adapter note per agent and environment.",
    },
    {
      title: "Run the same fixture in every agent",
      body: "Use the same input, expected sections, and pass/fail checks. Record meaningful differences in discovery, permissions, tool access, output, and invocation behavior.",
      output: "A compatibility matrix based on observed results.",
    },
    {
      title: "Publish the team recommendation",
      body: "Point teammates to the canonical source, explain the recommended use case, and expose only the agent paths that passed. A shared library makes this discoverable without pretending to be a universal installer.",
      output: "One searchable recommendation with tested use paths.",
    },
    {
      title: "Update source first, adapters second",
      body: "Review changes at the canonical source, repeat the fixture, then refresh each agent path. If one agent fails, mark that path needs-review rather than forking the skill silently.",
      output: "One version history and explicit per-agent lifecycle states.",
    },
  ],
  templateTitle: "The compatibility record",
  templateIntro:
    "Keep this beside the recommendation. It records evidence, not a timeless promise: agent behavior and supported setup paths can change.",
  templateFields: [
    { label: "Canonical version", value: "Commit, tag, or reviewed source state used in the test." },
    { label: "Agent and environment", value: "Claude Code, Codex, or Cursor plus the relevant workspace, CLI, editor, or project context." },
    { label: "Setup path", value: "The official installation or access instructions the tester followed." },
    { label: "Invocation", value: "Automatic selection, explicit invocation, or another observed trigger." },
    { label: "Fixture result", value: "Pass, partial, or fail against the same expected output and checks." },
    { label: "Reviewed at", value: "Date, owner, and reason to retest after a source or agent change." },
  ],
  pitfallsTitle: "Cross-agent shortcuts to avoid",
  pitfalls: [
    {
      title: "Assuming format means synchronization",
      body: "A shared SKILL.md reduces duplication, but it does not automatically install, update, or enable the skill in every agent environment.",
    },
    {
      title: "Maintaining three canonical copies",
      body: "Agent folders should consume or reference the reviewed source. If each copy evolves independently, the team no longer knows which behavior it approved.",
    },
    {
      title: "Publishing untested compatibility badges",
      body: "Support claims should name the tested environment and date. A vendor announcing skill support is not evidence that your specific scripts and permissions work there.",
    },
    {
      title: "Hiding agent-specific differences",
      body: "Different discovery and invocation rules are normal. Small adapter notes are cheaper and clearer than forcing a misleading universal setup.",
    },
  ],
  checklist: [
    "One canonical skill source is shared across all three agent paths.",
    "The portable workflow is separated from agent-specific setup notes.",
    "Every compatibility claim names an observed environment and review date.",
    "The same fixture and pass/fail checks were used for each agent.",
    "A failed agent path can be paused without forking the canonical skill.",
    "The team can discover the recommendation without knowing its install location in advance.",
  ],
  sources: [
    {
      label: "OpenAI: Skills in ChatGPT",
      href: "https://help.openai.com/en/articles/20001066",
      note: "Explains the reusable and shareable skill model, the open standard, and support across OpenAI products including Codex.",
    },
    {
      label: "Anthropic: Extend Claude with skills",
      href: "https://code.claude.com/docs/en/slash-commands",
      note: "Documents Claude Code skill files, project and personal discovery, invocation controls, and sharing patterns.",
    },
    {
      label: "Cursor 2.4: Skills support",
      href: "https://cursor.com/changelog/2-4",
      note: "Announces Agent Skills in Cursor editor and CLI, using SKILL.md files with instructions, scripts, and commands.",
    },
    {
      label: "GitHub: About agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "Confirms Agent Skills as an open standard used across multiple AI systems and documents shared repository locations.",
    },
  ],
  publishedAt: "2026-07-22",
  modifiedAt: "2026-07-22",
}

export const aiCodingTeamOnboardingGuide: GuideDefinition = {
  path: guidePaths.aiCodingTeamOnboarding,
  contentType: "guide",
  topics: ["team onboarding", "AI coding tools", "workflow standardization", "mixed-agent teams"],
  eyebrow: "AI coding operations",
  title: "How to onboard your engineering team to AI coding tools",
  description:
    "A practical AI coding team onboarding plan: choose one workflow, provide trusted context, set review gates, and measure adoption before expanding tool access.",
  intro:
    "Buying seats is not an onboarding strategy. Teams adopt AI coding tools when they can use them on a real task, with trusted context, clear review boundaries, and a visible definition of success. This guide turns an individual experiment into a repeatable team rollout.",
  corePrinciple:
    "Standardize one useful workflow before standardizing a tool.",
  problem:
    "Most rollouts start with access and end with uneven habits: a few people build elaborate personal setups, others stop after weak first results, and nobody can explain which context or review step made the difference. The fix is to onboard around one repeated engineering workflow, not a generic tour of features.",
  decisionTitle: "Choose the smallest rollout that can teach you something",
  decisionIntro:
    "A workflow-first pilot creates comparable evidence without forcing every engineer into the same tool. Start with a recurring, reviewable task and make the context, quality bar, and human approval point explicit.",
  comparisonColumns: ["Rollout model", "What it optimizes", "Main risk"],
  comparisonRows: [
    {
      label: "Company-wide tool launch",
      cells: [
        "Fast account provisioning and a visible launch date.",
        "Seats look like adoption while workflows, context, and review practices remain undefined.",
      ],
    },
    {
      label: "Unstructured experimentation",
      cells: [
        "Individual freedom and rapid discovery by enthusiasts.",
        "Useful techniques stay private and results cannot be compared across the team.",
      ],
    },
    {
      label: "Workflow-first pilot",
      cells: [
        "One repeated task, shared context, and a measurable quality bar.",
        "It feels narrower at first, but produces reusable evidence for the next rollout.",
      ],
    },
  ],
  stepsTitle: "A six-step AI coding onboarding plan",
  stepsIntro:
    "Run the first cycle with a small group and one workflow. The goal is not maximum usage; it is a team playbook that another engineer can follow and improve.",
  steps: [
    {
      title: "Choose one repeated engineering task",
      body: "Pick work that happens often and has a reviewable output, such as writing a focused test, preparing a migration plan, explaining an unfamiliar module, or drafting release notes. Avoid a first pilot that requires broad production access.",
      output: "One task with a clear trigger, input, expected result, and owner.",
    },
    {
      title: "Capture the current baseline",
      body: "Run or review the task without the new workflow. Record the time, rework, common failure modes, and reviewer effort that matter to your team. A lightweight baseline is enough; invented precision is not.",
      output: "A before snapshot with one speed measure and one quality measure.",
    },
    {
      title: "Prepare a trusted context pack",
      body: "Give the agent only the conventions, examples, architecture notes, and constraints needed for the task. Keep the source versioned and remove secrets or stale instructions before the pilot.",
      output: "A small, reviewable context set with a named owner.",
    },
    {
      title: "Run the same fixture across the pilot",
      body: "Use a representative input and the same acceptance checks for each participant or tool. Let people vary their interaction, but preserve the task and review criteria so the team can compare outcomes.",
      output: "Comparable attempts with observed tool, context, and review differences.",
    },
    {
      title: "Turn the winning path into a playbook",
      body: "Write down when to use the workflow, the required context, the steps that mattered, the human review gate, and the failures that should stop execution. Keep it short enough to run again next week.",
      output: "A reusable team playbook linked to its canonical context and examples.",
    },
    {
      title: "Expand only after a second person succeeds",
      body: "Ask someone who did not design the pilot to run the playbook. If they cannot reproduce the result, repair the instructions before adding more tools, people, or workflows.",
      output: "A reproduced result, an explicit revision, or a decision to stop the rollout.",
    },
  ],
  templateTitle: "The minimum useful onboarding record",
  templateIntro:
    "Use this record for every pilot. It keeps the team focused on a workflow people can reproduce instead of a collection of disconnected tips.",
  templateFields: [
    { label: "Workflow", value: "The repeated task, trigger, input, and expected output." },
    { label: "Baseline", value: "Current time, rework, reviewer effort, and the most costly failure." },
    { label: "Context pack", value: "Versioned conventions, examples, constraints, and their owner." },
    { label: "Tool path", value: "The agent, environment, permissions, and setup actually tested." },
    { label: "Review gate", value: "The human decision that must happen before the output is used." },
    { label: "Success measure", value: "One adoption signal and one quality signal for the next cycle." },
  ],
  pitfallsTitle: "What makes AI coding onboarding stall",
  pitfalls: [
    {
      title: "Measuring seats instead of useful work",
      body: "Provisioning and logins show access. They do not show that a teammate completed a real workflow with an acceptable result.",
    },
    {
      title: "Teaching prompts without context",
      body: "A clever prompt cannot compensate for missing conventions, examples, architecture boundaries, or a clear definition of done.",
    },
    {
      title: "Optimizing only for speed",
      body: "Faster drafts can increase reviewer effort or defects. Pair a speed measure with a quality or rework measure.",
    },
    {
      title: "Keeping the best workflow personal",
      body: "If the playbook, context, and owner live only in one engineer’s setup, the team has not created an operating capability.",
    },
  ],
  checklist: [
    "The pilot starts from a repeated task, not a generic product demo.",
    "The current workflow has a lightweight speed and quality baseline.",
    "Context is versioned, scoped to the task, and free of secrets.",
    "Every participant uses the same fixture and acceptance checks.",
    "The playbook names its owner, review gate, and stop conditions.",
    "A second person reproduced the workflow before the rollout expanded.",
  ],
  sources: [
    {
      label: "IBM: Standardize AI code generation across a development team",
      href: "https://www.ibm.com/think/insights/standardize-ai-code-generation-across-your-development-team",
      note: "Discusses moving from individual AI coding use to shared team standards, context, governance, and reusable practices.",
    },
    {
      label: "LinkedIn Engineering: Contextual agent playbooks and tools",
      href: "https://www.linkedin.com/blog/engineering/ai/contextual-agent-playbooks-and-tools-how-linkedin-gave-ai-coding-agents-organizational-context",
      note: "Describes how organizational context and repeatable playbooks make coding agents more useful inside an engineering environment.",
    },
    {
      label: "OpenAI: Workspace agents in ChatGPT",
      href: "https://openai.com/index/introducing-workspace-agents-in-chatgpt/",
      note: "Shows the shift from personal AI use toward shared, governed agent workflows connected to team knowledge and tools.",
    },
  ],
  publishedAt: "2026-07-27",
  modifiedAt: "2026-07-27",
}

export const aiCodingGuidelinesTemplateGuide: GuideDefinition = {
  path: guidePaths.aiCodingGuidelinesTemplate,
  contentType: "guide",
  topics: [
    "AI coding tools",
    "workflow standardization",
    "team operations",
    "agent instructions",
  ],
  eyebrow: "AI coding standards",
  title: "AI coding guidelines template for engineering teams",
  description:
    "Use this AI coding guidelines template to define allowed work, trusted context, verification, human handoffs, and ownership for a team using coding agents.",
  intro:
    "A useful AI coding policy should make everyday engineering decisions easier. It should tell people and agents which work is appropriate, which context is authoritative, how output is verified, and when a human must take over. This template gives a small team a practical starting point without pretending one file can replace security, privacy, or legal review.",
  corePrinciple:
    "Keep universal rules short. Put detailed procedures in focused, testable playbooks.",
  problem:
    "Teams often jump from individual experimentation to one large policy document. The document mixes security boundaries, coding style, tool setup, prompts, and review advice until nobody knows which rule applies to the task in front of them. A layered model works better: stable boundaries for every workflow, repository or path instructions for local context, and focused playbooks for repeated tasks.",
  decisionTitle: "Separate guidance from enforcement",
  decisionIntro:
    "An instruction can shape behavior, but it does not guarantee compliance. Put conventions in readable guidance, encode objective invariants in automated checks, and use real permissions or sandboxing when an action must be impossible.",
  comparisonColumns: ["Layer", "Use it for", "What it cannot do alone"],
  comparisonRows: [
    {
      label: "Markdown instructions",
      cells: [
        "Purpose, conventions, trusted context, commands, examples, and task-specific guidance.",
        "Prevent a forbidden tool call, data transfer, or destructive action with certainty.",
      ],
    },
    {
      label: "Automated checks",
      cells: [
        "Tests, linters, type checks, policy checks, and other objective repository invariants.",
        "Judge requirements, intent, or risks that the team has not encoded into the check.",
      ],
    },
    {
      label: "Access controls",
      cells: [
        "Tool permissions, protected branches, sandbox boundaries, secrets, and production access.",
        "Teach the agent how to complete an allowed workflow well or verify its output quality.",
      ],
    },
  ],
  stepsTitle: "Build the guidelines in six passes",
  stepsIntro:
    "Start from a real workflow and the failures you need to prevent. The first version should be short enough to test this week and explicit enough that a teammate can tell when to stop.",
  steps: [
    {
      title: "Set the non-negotiable boundaries",
      body: "List prohibited data, destinations, credentials, production actions, and legal or security decisions. Name the approved escalation path. Do not hide these boundaries inside a general style guide.",
      output: "A short boundary section reviewed by the people who own security, privacy, and production access.",
    },
    {
      title: "Separate guidance by scope",
      body: "Keep rules that apply everywhere at the organization or repository level. Put directory-specific architecture notes near the relevant code, and move detailed task procedures into focused playbooks or skills.",
      output: "A small map showing which instruction source owns each kind of decision.",
    },
    {
      title: "Define the task contract",
      body: "For each repeated workflow, state the trigger, required inputs, expected output, allowed tools, and definition of done. A task contract is more actionable than a collection of prompt tips.",
      output: "One repeatable task with observable inputs, outputs, and stop conditions.",
    },
    {
      title: "Name authoritative context",
      body: "Point to the current architecture notes, conventions, examples, commands, and source files the agent should trust. Prefer links and scoped references over copying large documents into every instruction file.",
      output: "A minimal context pack with a canonical source and owner.",
    },
    {
      title: "Make verification and handoff explicit",
      body: "List the checks the agent can run, the evidence it must report, and the decisions a human still owns. Require a stop when permissions, requirements, sensitive data, or destructive effects are unclear.",
      output: "A verification checklist plus an unambiguous human handoff rule.",
    },
    {
      title: "Test, publish, and assign an owner",
      body: "Run the same representative fixture with the intended tools and a teammate who did not write the guidelines. Fix ambiguous instructions, publish the working version, and define the events that trigger review.",
      output: "A reproducible result, named owner, review date, and change trigger.",
    },
  ],
  templateTitle: "A copyable AI coding guidelines template",
  templateIntro:
    "Replace the brackets with your team’s reality. Delete sections that do not change a decision, and link repeated procedures to focused playbooks instead of expanding this file indefinitely.",
  templateFields: [
    {
      label: "Purpose and scope",
      value: "Who and which repositories or workflows these guidelines cover.",
    },
    {
      label: "Allowed work",
      value: "Tasks agents may perform and the permissions each task can use.",
    },
    {
      label: "Data boundaries",
      value:
        "Secrets, personal data, customer data, and destinations that are prohibited or restricted.",
    },
    {
      label: "Authoritative context",
      value: "Canonical conventions, architecture notes, commands, examples, and owners.",
    },
    {
      label: "Verification and handoff",
      value: "Required checks, evidence, stop conditions, and decisions reserved for humans.",
    },
    {
      label: "Ownership",
      value: "Maintainer, review date, and events that require the guidelines to be tested again.",
    },
  ],
  copyTemplate: `# AI-assisted development guidelines

Owner: [team or person]
Applies to: [repositories, paths, and workflows]
Last reviewed: [date]

## 1. Allowed work
- Agents may: [approved tasks]
- Agents may use: [approved tools and access]
- A human must approve: [decisions or effects]

## 2. Data and access boundaries
- Never provide: [secrets, personal data, customer data]
- Never send data to: [prohibited destinations]
- Stop when: [permission or identity is unclear]

## 3. Authoritative context
- Repository guidance: [canonical file or URL]
- Architecture and conventions: [canonical sources]
- Commands and fixtures: [tested sources]

## 4. Working rules
- Inspect the relevant code and instructions before editing.
- Keep changes inside the requested scope.
- Do not invent requirements, APIs, metrics, or compatibility claims.
- Report assumptions and conflicts before they affect the result.

## 5. Verification
- Run: [tests, type checks, linters, or review fixture]
- Confirm: [security, privacy, performance, or product checks]
- Report: [evidence required with the handoff]

## 6. Stop and hand off
Stop when the task requires [production access, destructive action,
unclear authority, sensitive data, or another team-owned decision].
Escalate to: [role or team]

## 7. Reusable workflows
For each repeated task, link one focused playbook or skill with its
trigger, inputs, output, tools, checks, canonical source, and owner.

## 8. Review triggers
Test these guidelines again when [tool, model, repository architecture,
permissions, regulation, or repeated failure] changes.`,
  pitfallsTitle: "What makes guidelines fail",
  pitfalls: [
    {
      title: "Turning policy into security theater",
      body: "A long list of warnings is not a control. Bind sensitive actions to real permissions, protected data paths, verification, and a named escalation owner.",
    },
    {
      title: "Loading every rule into every task",
      body: "Universal instructions should stay short. Path-specific context and task-specific playbooks reduce noise and make conflicts easier to find.",
    },
    {
      title: "Assuming one file works in every agent",
      body: "Instruction locations and supported features vary by product and surface. Keep the team rule canonical, then document and test each actual agent path.",
    },
    {
      title: "Publishing rules nobody has reproduced",
      body: "A plausible guideline is still a hypothesis. Run a representative fixture and ask a second person to follow it before treating it as the team workflow.",
    },
  ],
  checklist: [
    "The guidelines name their owner, scope, and review trigger.",
    "Sensitive data, access, and prohibited actions are explicit.",
    "Organization, repository, path, and task guidance are kept separate.",
    "Each repeated workflow has a trigger, expected output, and stop condition.",
    "Verification requires observable checks and a truthful handoff.",
    "A second teammate reproduced the workflow with the intended agent path.",
  ],
  sources: [
    {
      label: "GitHub: Support for custom instruction types",
      href: "https://docs.github.com/en/copilot/reference/custom-instructions-support",
      note: "Maps repository-wide, path-specific, agent, organization, and personal instruction support across Copilot surfaces.",
    },
    {
      label: "Anthropic: How Claude remembers your project",
      href: "https://code.claude.com/docs/en/memory",
      note: "Separates repository guidance from enforceable controls and documents scoped instruction files and modular rules.",
    },
    {
      label: "Google Cloud and DORA: AI Capabilities Model",
      href: "https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model",
      note: "Reports organizational capabilities associated with stronger AI-assisted software outcomes, including clear policy, small batches, and version control.",
    },
    {
      label: "OpenAI: Harness engineering",
      href: "https://openai.com/index/harness-engineering/",
      note: "Shows a small repository entrypoint, progressively disclosed guidance, and automated checks for important invariants.",
    },
    {
      label: "GitHub: Review AI-generated code",
      href: "https://docs.github.com/en/enterprise-cloud@latest/copilot/tutorials/review-ai-generated-code",
      note: "Recommends human review together with tests, static analysis, security checks, and validation against project requirements.",
    },
  ],
  publishedAt: "2026-07-27",
  modifiedAt: "2026-07-27",
}

/**
 * Rough word count for a guide, used to drive the reading-progress readout.
 * Prose fields only — headings and link labels are excluded, because they are
 * scanned rather than read and would inflate the estimate.
 */
export function estimateGuideWordCount(guide: GuideDefinition): number {
  const prose: string[] = [
    guide.intro,
    guide.corePrinciple,
    guide.problem,
    guide.decisionIntro,
    guide.stepsIntro,
    guide.templateIntro,
    ...guide.comparisonRows.flatMap((row) => [...row.cells]),
    ...guide.steps.flatMap((step) => [step.body, step.output]),
    ...guide.templateFields.map((field) => field.value),
    ...guide.pitfalls.map((pitfall) => pitfall.body),
    ...guide.checklist,
    ...guide.sources.map((source) => source.note),
  ]

  return prose.reduce(
    (total, entry) => total + entry.trim().split(/\s+/).filter(Boolean).length,
    0
  )
}
