import { guidePaths, type GuideDefinition } from "@/lib/seo/guides/types"

export const sharedMcpSkillLibraryGuide: GuideDefinition = {
  path: guidePaths.sharedMcpSkillLibrary,
  contentType: "guide",
  topics: ["MCP", "team operations", "skill sharing", "AI agent skills", "agent access"],
  relatedGuidePaths: [
    guidePaths.manageCrossAgentSkills,
    guidePaths.shareTeamSkills,
    guidePaths.onboardNewTeammateSkills,
  ],
  eyebrow: "MCP team access",
  title: "How to use a shared AI skill library through MCP",
  seoTitle: "Shared MCP Skill Library for Teams | Skills Board",
  description:
    "Connect an MCP-compatible agent to a shared team skill library, authorize access in the browser, search recommendations, and verify a useful handoff.",
  intro:
    "A shared skill library should remain useful when a teammate works inside an agent. MCP gives a compatible client an authenticated path to the same team recommendations, so the teammate can search the library, retrieve a command, and, with the required scope, contribute skills or organize collections without copying an API key.",
  answer:
    "Use MCP as an authenticated path to a shared skill library, not as a universal installer. Connect the intended account, verify its permissions, and retrieve a real recommendation. Keep the original source and non-MCP setup paths available.",
  citations: {
    answer: ["skills-board-repository", "mcp-authorization", "mcp-transports"],
    problem: ["skills-board-repository"],
    decision: ["mcp-authorization", "mcp-transports", "anthropic-mcp"],
    steps: {
      1: ["mcp-transports", "anthropic-mcp"],
      2: ["mcp-authorization", "anthropic-mcp"],
    },
  },
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
  stepsAreSequential: true,
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
      id: "skills-board-repository",
      label: "Skills Board: Open-source repository",
      href: "https://github.com/TommyBez/skillsboard",
      note: "Documents the OAuth-protected endpoint, team-library tools, write-scope boundary, source visibility, and alternative use paths implemented by Skills Board.",
    },
    {
      id: "mcp-authorization",
      label: "Model Context Protocol: Authorization",
      href: "https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization",
      note: "Defines authorization for HTTP-based MCP connections, including OAuth discovery, access-token handling, and scope requirements.",
    },
    {
      id: "mcp-transports",
      label: "Model Context Protocol: Transports",
      href: "https://modelcontextprotocol.io/specification/2025-11-25/basic/transports",
      note: "Defines Streamable HTTP as a standard MCP transport and explains its single-endpoint request model.",
    },
    {
      id: "anthropic-mcp",
      label: "Anthropic: Connect Claude Code to tools via MCP",
      href: "https://code.claude.com/docs/en/mcp",
      note: "Documents remote HTTP server setup and browser authentication for OAuth-protected MCP connections in Claude Code.",
    },
  ],
  og: {
    variant: "ink",
    eyebrow: "Guide · MCP team access",
    title: [
      { text: "Your team’s skill library," },
      { text: "inside your agent.", accent: true },
    ],
    description:
      "Connect through browser-based OAuth, search team recommendations, retrieve a command, and keep MCP’s limits visible.",
    contextLabel: "skillsboard.sh/guides",
    titleSize: 76,
    chips: ["MCP access test", "Scope-aware workflow"],
  },
  ogAlt: "Skills Board guide: use a shared AI skill library through MCP.",
  publishedAt: "2026-07-29",
  modifiedAt: "2026-08-06",
}
