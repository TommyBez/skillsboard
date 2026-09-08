import { alternativePaths } from "@/lib/seo/alternatives"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import type { ComparisonDefinition } from "@/lib/seo/compare/types"
import { comparePaths } from "@/lib/seo/compare/types"
import { guidePaths } from "@/lib/seo/guides/types"

const bothLayersTemplate = `.mcp.json
.claude/
  skills/
    incident-review/
      SKILL.md

# .mcp.json
{
  "mcpServers": {
    "notion": {
      "type": "http",
      "url": "https://mcp.notion.com/mcp"
    }
  }
}

# .claude/skills/incident-review/SKILL.md
---
name: incident-review
description: How this team writes an incident review. Use after an incident is resolved, when someone asks for a postmortem, or when a review document needs filling in.
---

Build the timeline before writing anything. Pull the incident notes from the
tools that are connected in this session, and if the tool you need is missing,
say which one and stop instead of reconstructing the timeline from memory.

Then write the review in this order: impact in one sentence, timeline with
timestamps, contributing causes, the changes we are making, and an owner and a
date for each change.
`

export const skillsVsMcp: ComparisonDefinition = {
  path: comparePaths.skillsVsMcp,
  subject: "Skills vs MCP",
  eyebrow: "Claude Skills vs MCP",
  title: "Claude skills vs MCP (Model Context Protocol)",
  seoTitle: "Claude Skills vs MCP: What Each One Is For | Skills Board",
  socialTitle: "Claude skills vs MCP, compared",
  description:
    "A skill is a folder of instructions an agent loads when your request matches its description. MCP is an open protocol for connecting an agent to systems it does not own. What each one is for, why they are not alternatives, and how a team ends up using both.",
  cardSummary:
    "The most common false choice in agent tooling. One packages what the agent should do, the other is the wire it uses to reach a system it does not own.",
  intro: [
    "The question comes up because both arrive the same way. You install a skill and you install an MCP server, both end up configured in the same repository, both make the agent better at something it could not do before, and both are talked about as ways to extend an AI coding agent. From the outside they look like two answers to one question.",
    "They are not. A skill is content: a folder with a SKILL.md file whose instructions the agent loads when your request matches its description. MCP is plumbing: an open protocol, built on JSON-RPC 2.0, that lets an agent connect to a program it does not own and call its tools, read its resources, and run its prompts.",
    "This page defines each one from its own specification, sets them side by side on the dimensions that actually differ, says when each is the wrong tool, and shows what a repository looks like with both. Where the first-party documentation is silent, this page says so rather than filling the gap. Every claim links to the page it came from, checked on the date above.",
  ],
  answer:
    "A skill is a folder of Markdown instructions that an agent loads into context when your request matches its description. MCP is an open protocol that connects an agent to external systems and exposes their tools, resources, and prompts. Skills change what the agent knows how to do. MCP changes what the agent can reach. Most real setups need both.",
  answerNotes: [
    "The sharpest way to see the split is what each one leans on the host for. A skill carries no connectivity of its own: on the Claude API, custom Skills run inside the code execution container with no network access and no runtime package installation, so a skill alone cannot call your issue tracker there. On a host that does hand the session a shell and a network, such as Claude Code, a skill can reach out through that shell, so the honest framing is per surface rather than per format. MCP carries little procedure: the protocol specification is about context exchange and, in the words of the architecture overview, does not dictate how AI applications use LLMs or manage the provided context. It is not none, either. Prompts are a documented server primitive, user-controlled templates a client usually surfaces as slash commands, and Claude Code loads each server's instructions at session start, truncated at 2KB. What a connected server does not decide is when the agent should reach for any of it, or in what order.",
    "Nobody first-party frames these as competitors. Anthropic's launch post for Agent Skills closed by saying the company would explore how Skills can complement MCP servers by teaching agents more complex workflows that involve external tools and software. The MCP project, for its part, runs a Skills Over MCP Working Group whose stated long-term goal is interoperable skill distribution across MCP servers and clients. The two formats are being pushed together, not apart.",
    "If you are choosing under time pressure: write the skill first. It is a file, it costs almost nothing until it is used, it works in every product that reads the Agent Skills standard, and you can tell whether it is any good by reading it. Add an MCP server at the point where you want that reach to be a reusable, typed, credential-aware integration rather than a shell command a single skill improvises, or where your host or your policy does not give the session the shell and the network in the first place. The two answers stack, and neither one closes the door on the other.",
  ],
  answerSourceIds: [
    "anthropic-agent-skills",
    "mcp-architecture",
    "mcp-server-concepts",
    "claude-code-mcp",
    "anthropic-skills-post",
    "mcp-skills-wg",
  ],
  sideBySide: {
    title: "Side by side",
    caption: "The dimensions on which a skill and an MCP server differ.",
    intro:
      "Eight dimensions where the two genuinely differ. Everything below comes from the Agent Skills specification, the MCP documentation, and the Claude Code and Claude Developer Platform pages for each, not from inference about how they behave.",
    columns: ["Dimension", "Claude skill", "MCP"],
    rows: [
      {
        label: "What it is",
        cells: [
          "A directory containing a SKILL.md file: YAML frontmatter with a name and a description, then Markdown instructions. The directory can also carry scripts, reference documents, and assets that load only when something reads them.",
          "An open protocol, not a file format. A host application creates one MCP client per server it connects to. The data layer is a JSON-RPC 2.0 exchange, the transport layer is either stdio for a local process or Streamable HTTP for a remote service.",
        ],
      },
      {
        label: "What it carries",
        cells: [
          "Procedure and context: what to do, in what order, with what conventions, plus any code you want run deterministically instead of generated.",
          "Three server primitives. Tools are functions the model can call, resources are read-only data the application pulls in, prompts are templates the user invokes. Elicitation lets a server ask the user for input. Sampling and logging are deprecated as of protocol version 2026-07-28.",
        ],
      },
      {
        label: "Where it lives",
        cells: [
          "In your repository or your home directory: .claude/skills/<name>/SKILL.md for the project, ~/.claude/skills/<name>/SKILL.md for you, a plugin's skills/ directory, or managed settings for an organization.",
          "As a connection entry, while the server itself runs elsewhere. Local scope and user scope live in ~/.claude.json, project scope lives in .mcp.json at the repository root. The server can be a local process or a remote HTTP service someone else operates.",
        ],
      },
      {
        label: "How it enters context",
        cells: [
          "Progressively. The name and description of every installed skill load at startup at roughly 100 tokens each, the SKILL.md body loads when the skill is triggered, and bundled files load only when read.",
          "Deferred, by default, in Claude Code. With tool search on, only tool names and server instructions load at session start and full definitions are fetched when Claude searches for them. Tool descriptions and server instructions are truncated at 2KB each.",
        ],
      },
      {
        label: "What triggers it",
        cells: [
          "The description. Claude matches your request against it and then reads the file. You can also invoke a skill yourself by typing /skill-name.",
          "The request mapping onto a tool's described capability, explicitly or implicitly. A server's prompts appear as commands named /mcp__servername__promptname, and its resources are pulled in with @ mentions.",
        ],
      },
      {
        label: "Who maintains it",
        cells: [
          "Whoever owns the procedure, by editing one Markdown file. Across levels, enterprise overrides personal and personal overrides project. Plugin skills are namespaced plugin-name:skill-name and cannot collide.",
          "The server author owns the tools and can change them mid-session through a list_changed notification. You own the connection entry. Precedence runs local, project, user, plugin servers, then claude.ai connectors, and the winning entry is used whole rather than merged.",
        ],
      },
      {
        label: "What you share with the team",
        cells: [
          "Commit .claude/skills/ to version control, ship the skill in a plugin, or deploy it through managed settings. Uploads to claude.ai and to the Skills API are separate copies: Anthropic documents that custom Skills do not sync across surfaces.",
          "Commit .mcp.json. Claude Code asks for approval in an interactive session before using a project-scoped server, and the file supports ${VAR} and ${VAR:-default} expansion so credentials stay out of version control.",
        ],
      },
      {
        label: "Trust boundary",
        cells: [
          "Text you can read in a minute, running with your session's permissions. The allowed-tools field pre-approves tools for the turn that invokes the skill, and Claude Code notes that workspace trust does not gate it, so review the frontmatter of skills you did not write.",
          "A program you usually cannot read, holding credentials. Streamable HTTP supports bearer tokens, API keys, and custom headers, and MCP recommends OAuth. Claude Code's own guidance is to verify you trust a server before connecting it, because servers that fetch external content carry prompt injection risk.",
        ],
      },
    ],
    notes: [
      "The context accounting is where most of the folklore lives, and it has moved. On the skills side the figure is documented and small: metadata for every installed skill loads at startup at roughly 100 tokens each. On the MCP side, Claude Code now defers tool definitions by default and loads only tool names and server instructions at session start, so adding servers costs far less context than it used to. Tool search needs a Claude 4.5 generation model or later and is off in some configurations. No first-party page publishes a per-server token figure, so treat any specific number you read elsewhere as version-dependent.",
      "Output is a different story, and it is the cost MCP actually imposes. Claude Code warns when a single MCP tool result exceeds 10,000 tokens and caps results at 25,000 tokens by default, raisable with MAX_MCP_OUTPUT_TOKENS. A skill has the mirror-image behavior: once invoked, the rendered SKILL.md content enters the conversation as one message and stays for the rest of the session, and after auto-compaction Claude Code re-attaches the most recent invocation of each skill, keeping the first 5,000 tokens of each within a combined 25,000-token budget.",
      "The two are converging in one place, which is worth knowing before you architect around today's split. The MCP project runs a Skills Over MCP Working Group, formed as an interest group in February 2026 and converted to a working group in April 2026, co-led by an MCP maintainer and an Anthropic core maintainer. Its current direction is SEP-2640, a Skills Extension built on the existing Resources primitive, listed as in review, alongside a registry skills.json proposal. None of that is accepted specification yet.",
      "The one first-party sentence that reads like a comparison is aimed at server authors, in the Claude Code tool search documentation: server instructions help Claude understand when to search for your tools, similar to how skills work. That similarity is real and narrow. Both a skill description and a server instruction are short pieces of text the model reads to decide whether to go and fetch the longer thing. Neither is the longer thing.",
    ],
    sourceIds: [
      "agentskills-spec",
      "mcp-architecture",
      "mcp-server-concepts",
      "claude-code-mcp",
      "claude-code-skills",
      "anthropic-agent-skills",
      "mcp-skills-wg",
    ],
  },
  leftCase: {
    eyebrowLabel: "Skills",
    title: "When a skill is the right tool",
    intro:
      "A skill is the right choice when the thing you are adding is knowledge rather than reach. Four cases where that holds, each traceable to something documented rather than to a preference.",
    cases: [
      {
        title: "The knowledge is yours and nobody else can ship it",
        body: "Your review conventions, your release checklist, the order in which your team writes a migration: no vendor is going to expose that as a tool, because it only exists in your organization. Anthropic's own framing for skills is an onboarding guide for a new hire, which is exactly the shape of knowledge that has no API.",
      },
      {
        title: "There is nothing to connect to",
        body: "Plenty of work involves no external system at all. Reformatting a document, applying a naming convention, walking a checklist against files already in the repository. A protocol adds nothing here: there is no boundary to cross, so a server would be a process you operate for the privilege of storing text.",
      },
      {
        title: "It has to work in more than one product",
        body: "SKILL.md follows the Agent Skills open standard published at agentskills.io, which maintains a showcase of agent products that read the same file. The portability is bounded: outside Claude Code only the six specification fields are accepted, and a file carrying a Claude Code extension fails to package or upload rather than being ignored. Within that boundary, one file serves several agents.",
      },
      {
        title: "The context budget matters more than the capability",
        body: "Progressive disclosure is the whole design. Roughly 100 tokens per installed skill at startup, the body only when the skill is triggered, bundled reference files only when something reads them. That is what makes it reasonable to install twenty skills and have nineteen of them cost nothing on a given day.",
      },
    ],
    counterweightTitle: "When a skill is the wrong tool",
    counterweight: [
      "It needs live data, or a write to a system of record, and it has to be portable. Through the Claude API, custom Skills run with no network access and no runtime package installation, so the skill cannot go and get the data at all. In Claude Code the picture is different: a skill can run Bash under your permission settings and inherits your machine's network access, so it can reach a system without any MCP server. What it cannot do is carry that reach with it, which is why a skill that works on your laptop is not evidence that it works anywhere else.",
      "You need to know exactly what ran with what arguments. A skill is prose the model may follow loosely. An MCP tool has a JSON Schema input, a defined tools/call operation, and, in clients that implement it, an approval dialog and an activity log. If the requirement is auditability, instructions are the wrong shape.",
      "The capability belongs to a product that changes without telling you. Server authors ship tool changes and clients refresh on a list_changed notification. A skill that hardcodes another product's API surface is stale the day that product ships a change, and nothing will notify you.",
    ],
    sourceIds: [
      "anthropic-agent-skills",
      "agentskills-spec",
      "anthropic-skills-post",
      "mcp-server-concepts",
      "claude-code-skills",
    ],
  },
  rightCase: {
    eyebrowLabel: "MCP",
    title: "When MCP is the right tool",
    intro:
      "MCP is the right choice when the agent has to reach across a boundary. Five cases, from the documented use cases and from what the protocol actually defines.",
    cases: [
      {
        title: "The agent has to reach a system it does not own",
        body: "Issue trackers, monitoring, databases, design files, mail. The use cases Claude Code documents for MCP are all of this shape: implement the feature described in a tracker ticket, check the error monitor, query the production database, update a template from a design. Instructions alone do not make the call, but on a host that gives the session a shell they can drive one, and in Claude Code a skill can shell out under your permission settings. What that improvised path does not give you is a reusable connection: the skill re-derives the API surface, carries its own credentials, and stops working on every surface where the shell or the network is absent. MCP is the standardized boundary for the same job, which is the reason to reach for it here rather than a rule that instructions cannot.",
      },
      {
        title: "You want typed operations with consent, not prose",
        body: "Tools are schema-defined interfaces, each performing one operation. The input side is the guarantee: every tool declares an inputSchema in JSON Schema, so the arguments are typed and validatable. The output side is weaker than the pitch suggests. outputSchema is optional in the specification, and a tool that omits it returns unstructured content with no declared shape, so a typed result is a property of the server you connected, not of MCP. Where a tool does declare one, servers must return structured results that conform to it and clients should validate them. The specification is explicit that tools may require user consent before execution, and it expects clients to offer approval dialogs, permission settings, and activity logs. That is a different guarantee than a paragraph asking the model to be careful.",
      },
      {
        title: "The connection needs credentials that are not on disk",
        body: "The Streamable HTTP transport supports standard HTTP authentication, including bearer tokens, API keys, and custom headers, and MCP recommends OAuth for obtaining tokens. Claude Code stores those tokens, refreshes them, and retries once when an authenticated request comes back with a 401 before flagging the server as needing re-authentication.",
      },
      {
        title: "Several people need the same connection",
        body: "A project-scoped server lives in .mcp.json at the repository root and is meant to be checked in, so everyone gets the same tools. Environment variable expansion keeps the secret itself out of the file, and the approval prompt in interactive sessions means a server arriving through a pull request does not silently connect on someone else's machine.",
      },
      {
        title: "The data should stay out of the conversation until it is needed",
        body: "The server decides what a resource returns and when, tool definitions are deferred until Claude searches for them, and output caps bound what a single call can dump into your context. A skill that inlined the same data would carry all of it for the rest of the session.",
      },
    ],
    counterweightTitle: "When MCP is the wrong tool",
    counterweight: [
      "What you actually have is a procedure. If nothing crosses a process boundary, the server is infrastructure you now have to run, monitor, and authorize, in exchange for text a file would have held.",
      "You need it where the connector cannot go. Anthropic's MCP connector for the Messages API is in beta behind the mcp-client-2025-11-20 header, supports only tool calls out of the MCP feature set, requires a publicly reachable HTTP server, cannot connect a local stdio server, and is not eligible for zero data retention. Those are real constraints on a request path, not theoretical ones.",
      "You have not read the server. Claude Code's documentation tells you to verify you trust each server before connecting, because a server that fetches external content can expose you to prompt injection. The same risk exists for a skill from a stranger, but a skill is a page of Markdown you can audit in a minute, and a server usually is not.",
      "You expect it to teach the agent your conventions. Server instructions are truncated at 2KB and exist to tell the model when to look for the server's tools. They are not the place to put how your team writes a migration, and they are not shared with the rest of your tooling.",
    ],
    sourceIds: [
      "claude-code-mcp",
      "mcp-server-concepts",
      "mcp-tools-spec",
      "mcp-architecture",
      "anthropic-mcp-connector",
    ],
  },
  together: {
    title: "Using both in the same repository",
    caption: "The two layers a repository ends up committing, and who owns each.",
    intro:
      "In practice the pair is a stack rather than a fork in the road. The MCP server makes the facts reachable and the actions callable, the skill says which ones matter, in what order, and what a good result looks like.",
    directions: {
      columns: ["Layer", "Lives in", "Answers", "Owned by"],
      rows: [
        {
          label: "Skill",
          cells: [
            ".claude/skills/<name>/SKILL.md, committed",
            "What we do, in what order, and what good looks like",
            "Whoever owns the procedure",
          ],
        },
        {
          label: "MCP server",
          cells: [
            ".mcp.json at the repository root, committed",
            "Where the facts live and which actions are callable",
            "The server author, plus whoever owns the connection entry",
          ],
        },
      ],
    },
    notes: [
      "Read as a stack, the failure modes are obvious in both directions. A connected agent with no procedure improvises: it has ten tools and no opinion about which three matter for an incident review. A well-written skill with nothing connected asks you to paste the data it cannot fetch. Neither is a smaller version of the other, and the repository above is the cheapest way to have both.",
      "One thing worth stating plainly, because its absence is easy to misread: the Claude Code skill frontmatter reference lists no field for declaring which MCP servers a skill needs. The binding is prose. The skill names the tools it expects and says what to do when they are missing, which is what the example above does. If a documented field appears later, this page will change.",
      "There is one documented artifact that packages both together. Adding a .claude-plugin/plugin.json to a skill folder loads it as a plugin, and a plugin can bundle agents, hooks, and MCP servers alongside the skill. That is the supported path when you want a capability and its connection to install as one unit rather than as two files a teammate has to remember to copy.",
      "The convention that survives contact with a real team is boring. One repository, two committed files, and one line in the README that says which skills the team settled on and why. Everything past that is a distribution problem rather than a format problem.",
    ],
    template: bothLayersTemplate,
    templateLanguage: "text",
    templateLabel: "A repository that commits both layers",
    templateCopy: {
      buttonLabel: "Copy example",
      ariaLabel: "Copy the repository example",
      copiedAriaLabel: "Repository example copied",
    },
    link: {
      lead: "Once two people depend on the same two files, the hard part stops being syntax:",
      label: "how to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      trail: " covers ownership, the distribution models, and keeping one agreed skill instead of five forks.",
    },
    sourceIds: ["claude-code-skills", "claude-code-mcp"],
  },
  team: {
    title: "What a team actually ends up needing",
    intro:
      "The comparison stops being interesting the moment more than one person is involved, because the question changes from which primitive to which copy. Four paths, ordered by cost. The first two need no product at all, and most teams should stay on them until they hurt.",
    paths: [
      {
        title: "A repository and a README",
        body: "Commit .claude/skills/ and .mcp.json, and write one README section naming the two or three skills your team stands behind and why. This is free, it is version controlled, it reviews like code, and for a team of three people in one repository it is the correct answer. Do this before evaluating anything else.",
      },
      {
        title: "The repository, plus somewhere the list survives",
        body: "The gap opens when the number of repositories exceeds the number of people who remember what is in them. Skills are discoverable only if you already have the checkout and know to look, neither format carries a reason for existing beyond its description, and nothing tells a new teammate which of the five forks of the same skill the team settled on. A shared document closes most of it.",
      },
      {
        title: "Skills Board as the team's web app",
        body: "Skills Board is a library of a team's AI skills: each entry keeps its source repository, the install command, and a note about why it is there, grouped into collections by project or use case. This path involves no protocol at all, it is a page in a browser. Free forever, MIT licensed, and open source, so the honest comparison for it is a shared document rather than a competitor.",
      },
      {
        title: "Skills Board as an authenticated MCP server",
        body: "The same library is also an MCP server, published in the official MCP registry as io.github.TommyBez/skillsboard and listed as active since 7 August 2026, reachable over Streamable HTTP at https://www.skillsboard.sh/api/mcp. Connect it with claude mcp add --transport http skills-board https://www.skillsboard.sh/api/mcp, authorize in the browser, and the agent can search the team library, return the install command for a saved skill, save a skill from a GitHub repository, and organize collections without leaving the session.",
      },
    ],
    notes: [
      "That last path is why this page is not a neutral survey, so here is the bias stated plainly. Skills Board is both halves of this comparison at once: the library is the skills side, the authenticated server is the MCP side, and they are one product because they answer the same question, which is what a teammate should install and where to get it. The registry entry and the source are both public and linked below.",
      "What the connection does not do is install anything for you. The server returns the source and the command; the install still happens on your machine, under your permissions, with the file landing in a directory you control. That is a deliberate limit rather than a missing feature, and it is the same reason the library keeps the original repository link on every entry.",
      "The counterweight: if your skills live in one repository everyone already has checked out, path one beats paths three and four, and adding a server would be the exact mistake this page warns about.",
    ],
    sourceIds: ["mcp-registry", "claude-code-mcp", "skills-board-repository"],
  },
  faq: [
    {
      question: "What is the difference between Claude skills and MCP?",
      answer:
        "A skill is a folder of Markdown instructions that the agent loads when your request matches its description. MCP is an open protocol connecting an agent to external systems and exposing their tools, resources, and prompts. Skills change what the agent knows how to do. MCP changes what it can reach.",
    },
    {
      question: "Are Agent Skills replacing MCP?",
      answer:
        "No first-party documentation says so. Anthropic's Agent Skills announcement said the company would explore how Skills complement MCP servers for workflows involving external tools, and the MCP project runs a Skills Over MCP Working Group aiming at skill distribution through MCP. They solve different problems and are converging rather than competing.",
    },
    {
      question: "Do skills use fewer tokens than MCP servers?",
      answer:
        "At startup an installed skill costs roughly 100 tokens for its name and description. Claude Code defers MCP tool definitions by default, loading only tool names and server instructions, so neither is expensive before use. No first-party source publishes a per-server token figure, so treat specific numbers with suspicion.",
    },
    {
      question: "Can a skill call an MCP tool?",
      answer:
        "In Claude Code a skill is instructions inside your session, so Claude can call any connected MCP tool while following it. Through the Claude API, custom Skills run in the code execution container with no network access, so reaching an external service there is the MCP connector's job rather than the skill's.",
    },
    {
      question: "Can an MCP server provide skills?",
      answer:
        "Not as a defined protocol feature today. The Skills Over MCP Working Group is reviewing SEP-2640, a Skills Extension built on the existing Resources primitive on the Extensions Track, plus a registry skills.json proposal. Until an SEP is accepted, a server serving skill files is doing something the specification does not define.",
    },
    {
      question: "Should a team set up skills or MCP first?",
      answer:
        "Skills, usually. A skill is a file teammates can read, costs almost nothing until it runs, and works in every product that reads the Agent Skills standard. Add an MCP server at the point where the agent has to reach a system you do not own, and commit .mcp.json so everyone gets the same connection.",
    },
  ],
  sources: [
    {
      id: "mcp-architecture",
      label: "Model Context Protocol: architecture overview",
      href: "https://modelcontextprotocol.io/docs/learn/architecture",
      note: "MCP as an open protocol with a host, client, and server, the JSON-RPC 2.0 data layer, the stdio and Streamable HTTP transports and their authentication options, the server and client primitives, the deprecation of sampling and logging as of protocol version 2026-07-28, and the scope note that MCP does not dictate how applications use models or manage context.",
    },
    {
      id: "mcp-server-concepts",
      label: "Model Context Protocol: understanding MCP servers",
      href: "https://modelcontextprotocol.io/docs/learn/server-concepts",
      note: "The three server features and who controls each, prompts as user-controlled templates surfaced as slash commands, JSON Schema validation of tool inputs, the tools/list and tools/call operations, the note that tools may require user consent, and the client-side controls the specification expects, including approval dialogs and activity logs.",
    },
    {
      id: "mcp-tools-spec",
      label: "Model Context Protocol specification: tools",
      href: "https://modelcontextprotocol.io/specification/2025-06-18/server/tools",
      note: "The tool definition fields, with inputSchema required and outputSchema optional, the structured and unstructured forms a tool result can take, the rule that a server must conform to an output schema when it declares one and that clients should validate against it, the consent expectations, and the list_changed notification.",
    },
    {
      id: "mcp-skills-wg",
      label: "Model Context Protocol: Skills Over MCP Working Group charter",
      href: "https://modelcontextprotocol.io/community/working-groups/skills-over-mcp",
      note: "The working group's mission, its origin in SEP-2076, its current direction in SEP-2640 as a Resources-based Skills Extension on the Extensions Track with an In Review status, the registry skills.json workstream, the coordination with the Agent Skills specification, and the changelog dates for the group's formation and conversion.",
    },
    {
      id: "claude-code-mcp",
      label: "Claude Code: connect Claude Code to tools via MCP",
      href: "https://code.claude.com/docs/en/mcp",
      note: "The documented MCP use cases, the four transports and the claude mcp add syntax, the three installation scopes and their precedence, project approval prompts, environment variable expansion in .mcp.json, tool search and what loads at session start, the 2KB truncation of tool descriptions and server instructions, the MCP output warning and limit, OAuth handling and 401 retry, and the prompt injection warning.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: extend Claude with skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "Where skills live and how name conflicts resolve, the full frontmatter reference and which fields are Claude Code extensions, the six fields accepted outside Claude Code, the allowed-tools grant and the note that workspace trust does not gate it, the skill content lifecycle and compaction budget, and the plugin.json note that lets a skill folder bundle agents, hooks, and MCP servers.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The directory structure, the six frontmatter fields and their constraints, the optional scripts, references, and assets directories, and the three progressive disclosure stages with the roughly 100 token metadata figure and the size guidance for the body.",
    },
    {
      id: "anthropic-agent-skills",
      label: "Anthropic: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "The three progressive disclosure levels, the surfaces custom Skills run on, the statement that Skills do not sync across surfaces, the sharing scope per surface, and the runtime constraints, including no network access and no runtime package installation for Skills on the Claude API.",
    },
    {
      id: "anthropic-mcp-connector",
      label: "Anthropic: MCP connector",
      href: "https://platform.claude.com/docs/en/agents-and-tools/mcp-connector",
      note: "Connecting to remote MCP servers from the Messages API without a separate client, the beta header, the limitation to tool calls out of the MCP feature set, the requirement for a publicly reachable HTTP server, the inability to connect local stdio servers, and the zero data retention exclusion.",
    },
    {
      id: "anthropic-skills-post",
      label:
        "Anthropic engineering: equipping agents for the real world with Agent Skills",
      href: "https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills",
      note: "The onboarding guide framing, progressive disclosure as the core design principle, code bundled in a skill as a deterministic alternative to generation, the security guidance on installing skills from untrusted sources, and the closing statement about exploring how Skills complement MCP servers.",
    },
    {
      id: "mcp-registry",
      label: "Official MCP registry entry for Skills Board",
      href: "https://registry.modelcontextprotocol.io/v0/servers?search=skillsboard",
      note: "The registry record for io.github.TommyBez/skillsboard, its active status with a status change date of 7 August 2026, and the streamable-http remote endpoint at https://www.skillsboard.sh/api/mcp.",
    },
    {
      id: "skills-board-repository",
      label: "Skills Board source repository",
      href: "https://github.com/TommyBez/skillsboard",
      note: "The MCP route and its registered tools for searching the team library, returning install commands, saving a skill from a GitHub repository, and managing collections, plus the OAuth protected resource metadata that gates them.",
    },
  ],
  related: [
    {
      label: "Claude skills vs subagents: when to use each",
      href: comparePaths.skillsVsSubagents,
      description:
        "The other pair that looks like a choice: instructions in your conversation against a separate run with its own context window.",
    },
    {
      label: "Use a shared AI skill library through MCP",
      href: guidePaths.sharedMcpSkillLibrary,
      description:
        "What a connected agent can and cannot do with a shared library, and how to verify the handoff.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The reference page for one half of this comparison: the format, the surfaces, and how a skill loads.",
    },
    {
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description:
        "One canonical SKILL.md, and a tested install path for each agent your teammates run.",
    },
    {
      label: "Skills Board vs a shared GitHub repository",
      href: alternativePaths.githubRepo,
      description:
        "What a repository of skill files already does well, and the question it leaves unanswered.",
    },
  ],
  editorialSubject: "skills and MCP",
  closing: {
    title: "The agent can reach everything. It still has to be told what matters.",
    body: "Skills Board is a web app for a team's AI skills, and an authenticated MCP server for the agents that read it. Free forever, MIT licensed, and open source.",
  },
  og: {
    eyebrow: "Claude Skills vs MCP",
    title: [
      { text: "Skills say what to do." },
      { text: "MCP says what to reach.", accent: true },
    ],
    description:
      "What each one is for, why they are not alternatives, and what a repository that uses both actually looks like.",
    contextLabel: "skillsboard.sh/compare",
    chips: ["SKILL.md", ".mcp.json", "JSON-RPC 2.0"],
  },
  ogAlt:
    "Comparison of Claude skills and the Model Context Protocol: what each one is for, and how they combine.",
  publishedAt: "2026-08-16",
  modifiedAt: "2026-08-16",
}
