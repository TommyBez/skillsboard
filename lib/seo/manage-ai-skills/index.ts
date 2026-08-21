import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { coworkSkillsPath } from "@/lib/seo/cowork-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { manageAiSkillsPath } from "@/lib/seo/manage-ai-skills/types"
import { pricingPath } from "@/lib/seo/pricing-schema"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export {
  manageAiSkillsPath,
  type ManageAiSkillsCtaPlacement,
  type ManageAiSkillsPath,
} from "@/lib/seo/manage-ai-skills/types"

export interface ManageAiSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface ManageAiSkillsFaqEntry {
  question: string
  answer: string
}

export interface ManageAiSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/**
 * One contextual link out of a section, rendered as a sentence. The href union
 * is the set of internal destinations this page is allowed to point at, so a
 * path that does not exist fails the build instead of shipping as a dead link.
 */
export interface ManageAiSkillsInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentSkillsSupportPath
    | typeof bestClaudeSkillsPath
    | typeof coworkSkillsPath
    | typeof pricingPath
    | typeof whereToFindClaudeSkillsPath
  trail: string
}

/** One table with the prose and the sources that back every row in it. */
export interface ManageAiSkillsTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  link: ManageAiSkillsInlineLink
  sourceIds: readonly string[]
}

export interface ManageAiSkillsDefinition {
  path: typeof manageAiSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentSkillsSupportPath
    | typeof coworkSkillsPath
    | typeof whereToFindClaudeSkillsPath
  )[]
  eyebrow: string
  title: string
  /** Full document title, including the brand suffix. */
  seoTitle: string
  description: string
  /** Scannable positioning above the fold. */
  intro: readonly string[]
  /** Answer-first summary, sized for extraction. */
  answer: string
  answerNotes: readonly string[]
  answerSourceIds: readonly string[]
  scatter: ManageAiSkillsTableSection
  mechanisms: ManageAiSkillsTableSection
  requirements: {
    title: string
    intro: string
    rules: readonly {
      label: string
      body: string
    }[]
    notes: readonly string[]
    link: ManageAiSkillsInlineLink
    sourceIds: readonly string[]
  }
  channels: ManageAiSkillsTableSection
  team: {
    title: string
    intro: string
    body: readonly string[]
    options: readonly {
      label: string
      body: string
    }[]
    limits: readonly string[]
    link: ManageAiSkillsInlineLink
    sourceIds: readonly string[]
  }
  notDocumented: {
    title: string
    intro: string
    entries: readonly {
      title: string
      body: string
    }[]
    sourceIds: readonly string[]
  }
  faq: readonly ManageAiSkillsFaqEntry[]
  sources: readonly ManageAiSkillsSource[]
  related: readonly ManageAiSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const manageAiSkills: ManageAiSkillsDefinition = {
  path: manageAiSkillsPath,
  contentType: "article",
  topics: [
    "team skill library",
    "skill distribution",
    "cross-agent sharing",
    "team governance",
  ],
  relatedGuidePaths: [
    guidePaths.shareTeamSkills,
    guidePaths.manageCrossAgentSkills,
    agentSkillsSupportPath,
    coworkSkillsPath,
  ],
  eyebrow: "Manage AI Skills",
  title: "How to manage AI skills across an organization",
  seoTitle: "How to Manage AI Skills Across an Organization | Skills Board",
  description:
    "Skills scatter across personal folders, repositories, and accounts, and every vendor mechanism for distributing them stops at that vendor's own products. What each one covers, what a team has to solve itself, and how to keep one recommendation everyone can find. Sources checked on August 21, 2026.",
  intro: [
    "The question sounds like a tooling question and is not one. A team lead notices that four people run four versions of the same code review skill, that the useful one somebody wrote in June sits in a personal folder nobody else can list, and that a new hire has no way to find out what the team actually recommends. Nothing is broken. There is simply no place where the answer lives.",
    "Every agent vendor has shipped something for this, and each one is scoped to its own products. Anthropic documents organization provisioning for claude.ai and Cowork, managed settings for Claude Code, and workspace-wide uploads for the Claude API, while stating in the same documentation that custom skills do not sync between those three. OpenAI documents a shared machine location and plugins for anything wider. Cursor documents project and user directories and no organization mechanism at all.",
    "So the answer is in two halves. Distribution is per vendor, it is documented, and this page maps it row by row with the date each source was fetched. Selection, meaning which skills your team decided are worth using and who stands behind each one, is covered by none of those mechanisms, and that is the half teams solve with a chat thread.",
  ],
  answer:
    "Managing AI skills across an organization means solving two separate problems. Distribution is per vendor: Claude Code reads managed settings and plugins, claude.ai and Cowork have owner provisioning on Team and Enterprise plans, the Claude API shares skills workspace-wide, and Codex reads a shared machine location plus plugins. Selection is solved by none of them, because none records which skills the team recommends or who chose them. A team library covers the second half and stays neutral about the first.",
  answerNotes: [
    "One mechanism is never enough, and Anthropic's own documentation says why. Custom skills do not sync across surfaces: a skill uploaded to claude.ai is not available through the API, an API skill is not on claude.ai, and Claude Code skills are filesystem-based and separate from both. The enterprise guidance draws the conclusion and tells organizations to keep skill source files in Git as the single source of truth and to build their own synchronization across surfaces.",
    "That is inside one vendor. A team where some people use Claude Code, some Codex, and some Cursor multiplies it by three, because none of the three reads the others' distribution channels. The one thing they share is a file format, and a format tells a teammate how to read a skill, not which one to read.",
    "Selection is the half nobody documents. A directory records a path. A provisioned skill records that an owner uploaded a ZIP. Neither records who read the skill, who ran it on a real task, or why it beat the four alternatives on a public leaderboard. That is the record a new teammate is looking for.",
  ],
  answerSourceIds: [
    "anthropic-skills-overview",
    "anthropic-skills-enterprise",
    "claude-code-skills",
  ],
  scatter: {
    title: "Where AI skills actually live in an organization today",
    intro:
      "Before the mechanisms, the symptoms. These are the five places a skill ends up in a team that has not decided anything yet, with what each place shows a colleague and what it never records.",
    columns: ["Where the skill sits", "Who can see it", "What it never records"],
    rows: [
      {
        label: "A personal folder",
        cells: [
          "One person. Claude Code documents a personal level applying to all of that user's projects, and Codex documents a home location the same way, for skills relevant to a user across any repository.",
          "That the skill exists at all, as far as anyone else is concerned. There is no listing a colleague can read, so it is discoverable only by asking the person who wrote it.",
        ],
      },
      {
        label: "A project repository",
        cells: [
          "Everyone who has cloned it. Claude Code names committing a project skills directory to version control as the first way to share skills, and Codex scans its neutral directory from the working directory up to the repository root.",
          "Anything about a teammate who has not cloned that repository, or about a skill that is not tied to one codebase. A repository is a good home for a deploy skill and a poor one for a writing skill.",
        ],
      },
      {
        label: "A personal claude.ai account",
        cells: [
          "One person by default. Anthropic documents claude.ai custom skills as individual to each user, with each team member uploading separately unless an owner turns on the provisioning or sharing paths below.",
          "Any connection to the repository the skill came from, and any presence on a filesystem, since custom skills do not sync between claude.ai, the API, and Claude Code.",
        ],
      },
      {
        label: "A chat thread",
        cells: [
          "Whoever was in the channel that day. This is where most recommendations actually are, and no vendor documentation covers it because no vendor built it.",
          "Everything, in practice. The link survives, the reason does not, and a search six weeks later returns three messages recommending three different things.",
        ],
      },
      {
        label: "A public directory",
        cells: [
          "Anyone. Public catalogs and repositories are genuinely useful for discovery, and hold far more skills than a team will ever use.",
          "Your team's choice. A leaderboard ranks by installs across everybody, which is a different question from which skill the two people here who tried it would recommend.",
        ],
      },
    ],
    notes: [
      "Every place solves either visibility or portability and never both. A repository is visible to the people who cloned it and portable nowhere else. A personal folder is portable to every project on one machine and visible to nobody.",
      "This is not a failure of the format. The Agent Skills specification defines what goes inside a skill folder and deliberately does not define where the folder lives, which is why location is a per-product fact you look up. The client showcase listed forty-six products on the day we checked, and forty-six products means forty-six answers to where the file goes.",
    ],
    link: {
      lead: "For the discovery side of this table, meaning the catalogs and repositories skills come from in the first place, see",
      label: "where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "claude-code-skills",
      "codex-skills",
      "anthropic-skills-overview",
      "agentskills-spec",
      "agentskills-clients",
    ],
  },
  mechanisms: {
    title: "What each vendor's organization-level mechanism actually covers",
    intro:
      "Eight documented mechanisms, read on August 21, 2026 from the vendor pages listed at the bottom. The middle column is what the vendor says it does. The right column is where it stops, which is the column that decides whether you still need something else.",
    columns: ["Mechanism", "What the vendor documents", "Where it stops"],
    rows: [
      {
        label: "Claude Code managed settings",
        cells: [
          "An enterprise skill level deployed organization-wide through managed settings, available to all users. Removing one means an administrator deleting the skill directory inside the managed settings directory, illustrated as /etc/claude-code/.claude/skills/ on Linux.",
          "At the machine. It is a file an administrator places on managed devices, so it needs whatever already puts files there. It reaches Claude Code only, and an enterprise skill overrides both personal and project ones, a strong default for something a team means as a suggestion.",
        ],
      },
      {
        label: "Claude Code plugins",
        cells: [
          "A skills directory inside a plugin, listed alongside project commits and managed settings as one of the three documented ways to share skills. Plugin skills load under a plugin-name and skill-name namespace, so they cannot collide with the other levels.",
          "At installation. A plugin is a package and a marketplace a distribution point, but somebody still installs it, and its skills load only where the plugin is enabled. It also carries more than skills, which is overhead when you only wanted the skill.",
        ],
      },
      {
        label: "claude.ai owner provisioning",
        cells: [
          "Organization-wide skill management on Team and Enterprise plans. An owner uploads a ZIP containing a SKILL.md under Organization settings, then Skills, and it reaches every user immediately, enabled by default and individually toggleable.",
          "At the vendor and at the plan. It covers claude.ai and Cowork, needs code execution and skills enabled first, and is documented for Team and Enterprise plans. Scoping to one department is not done here: the documented path is bundling skills into a plugin and assigning that plugin to a group.",
        ],
      },
      {
        label: "claude.ai member sharing",
        cells: [
          "Three independent toggles an owner controls: sharing with named colleagues, sharing with a group, and publishing to the organization directory anyone can install from. Recipients get a view-only copy that updates when the author updates it.",
          "Off by default for the group and organization toggles. The documentation is explicit that publishing to the directory has no approval step once the toggle is on, and names the alternative: leave it off and have members submit skills to an owner instead.",
        ],
      },
      {
        label: "Claude API Skills",
        cells: [
          "Workspace-wide distribution. Skills uploaded through the Skills API are available to all workspace members, referenced by identifier alongside the code execution tool, with versions that can be pinned in production.",
          "At the workspace, and at the request. Anthropic documents a maximum of twenty skills per API request and advises pinning, because omitting a version means any new upload changes what production agents run. Usage analytics are documented as not currently available through the Skills API.",
        ],
      },
      {
        label: "Codex admin location",
        cells: [
          "A shared system location at /etc/codex/skills, described as skills checked into the machine or container in a shared location, for SDK scripts, automation, and default admin skills available to each user on the machine.",
          "At the machine again, and explicitly at authoring. The Codex documentation says these locations are for authoring and local discovery, and that distributing reusable skills beyond a single repository is what plugins are for.",
        ],
      },
      {
        label: "ChatGPT and Codex plugins",
        cells: [
          "Distribution of reusable skills and connectors through a plugin directory shared by ChatGPT and Codex, working in Chat and Work across web, desktop, and mobile, in Codex in the desktop app, and through the Codex CLI.",
          "Inside OpenAI's products. The documentation frames it as designing the workflow as a skill, then packaging it as a plugin when you want other people to install it, so the unit of sharing becomes the package rather than the recommendation.",
        ],
      },
      {
        label: "Cursor",
        cells: [
          "Four native directories at project and user scope, four compatibility directories belonging to Claude and Codex, and recursive discovery that lets subdirectories group skills by category, team, or domain.",
          "Before the organization. On the day we checked, the Cursor skills documentation called the category folder purely organizational and named no organization-level or administrator-level distribution mechanism. Committing to the repository is the documented team path.",
        ],
      },
    ],
    notes: [
      "Read the right column as a whole and a shape appears. Every documented mechanism is one of three things: a file placed on a machine, a package somebody installs, or an upload confined to one vendor's hosted surfaces. None carries a recommendation and none crosses a vendor boundary, which are exactly the two properties a mixed-agent team needs.",
      "One contradiction sits inside a single vendor's documentation, and it is worth flagging rather than resolving. The Agent Skills overview states that claude.ai does not support centralized admin management or org-wide distribution of custom skills. The Claude Help Center article on provisioning, fetched the same day, documents exactly that. Both pages are Anthropic's. We treat the help center as operative because it is the more specific, and record that the overview has not been updated to match.",
      "Anthropic also publishes a page for the organizational side of this problem: a risk indicator table, an eight-step review checklist, a rule that a skill's author should not be its reviewer, a lifecycle from plan through deprecation, and an internal registry recording purpose, owner, version, dependencies, and evaluation status per skill.",
    ],
    link: {
      lead: "For the claude.ai and Cowork half of this table covered surface by surface, including what a session loads at the start, see",
      label: "Claude Cowork skills",
      href: coworkSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "claude-code-skills",
      "anthropic-skills-overview",
      "anthropic-skills-enterprise",
      "claude-provision-skills",
      "claude-use-skills",
      "codex-skills",
      "cursor-skills",
    ],
  },
  requirements: {
    title: "Five things centralizing has to do",
    intro:
      "A team that has read the table above usually reaches for a document, which fails for a nameable reason: a document stores links and answers no question. These five are what separates a place recommendations survive in from a page nobody opens twice.",
    rules: [
      {
        label: "1. One list, and it says who recommends what",
        body: "The unit is the recommendation, not the file. A saved entry has to say that this team put it there, which makes the list deliberately smaller than any public catalog. Anthropic's enterprise guidance asks for an internal registry recording purpose, owner, version, dependencies, and evaluation status per skill, which is the same idea reached from the compliance direction.",
      },
      {
        label: "2. The original source stays visible on every entry",
        body: "A teammate about to hand an agent new instructions and executable code should be able to read the SKILL.md and anything in scripts first. Anthropic's guidance is to use skills only from sources you trust, and its review checklist starts with reading all of the skill directory content. A channel that hides the source makes that first step impossible.",
      },
      {
        label: "3. More than one way to actually use it",
        body: "Eight of the eleven clients on our support matrix read a folder on disk and three never do, so an organization with a mixed toolchain cannot standardize on one install path without excluding somebody. The requirement is not a universal installer, which does not exist, but a per-teammate choice between the source, a command, and the files.",
      },
      {
        label: "4. Searchable by the words a person would use",
        body: "The question is which skill do we use for this task, not what is this skill called. That means search across the description, the note somebody added, the example prompt, and the team's own tags, rather than a filename match. This is the requirement a folder in a repository structurally cannot meet, because a directory listing indexes names.",
      },
      {
        label: "5. A stated review cadence, and honesty about what a save means",
        body: "A saved entry is a recommendation, not a security review, an approval, or a compatibility certification, and saying so is part of the mechanism rather than a disclaimer bolted on. Anthropic's enterprise page treats every skill update as a new deployment requiring full security review, a heavier bar than most teams meet, and knowing which bar you apply beats claiming the heavier one.",
      },
    ],
    notes: [
      "None of the five requires a product. A team of six with one repository and one agent can meet all five with a README and some discipline, and should. They bite when the repositories exceed one, the agents exceed one, or a teammate joins who was not in the room for the decisions.",
      "The requirement most teams skip is the fifth, and it decides whether the list is still true in three months. A page of skills nobody has re-read is worse than no page, because it looks authoritative. Put a date on it and write down what a save does and does not certify.",
    ],
    link: {
      lead: "The ownership version of these five, written as a workflow with a named owner per skill rather than as criteria, is",
      label: "our guide to sharing AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      trail: ".",
    },
    sourceIds: [
      "anthropic-skills-enterprise",
      "anthropic-skills-overview",
      "skillsboard-repo",
    ],
  },
  channels: {
    title: "The delivery channels a mixed-agent team needs",
    intro:
      "Requirement three said more than one way. This is what that looks like on Skills Board, which is a web application where a team keeps, searches, and shares the AI skills it recommends. Every channel below is in the open-source repository today.",
    columns: ["Channel", "The teammate it fits", "What it does not do"],
    rows: [
      {
        label: "Original GitHub source",
        cells: [
          "The reviewer. Every saved entry records the repository, the owner, the name, and the path inside it, so the SKILL.md and anything in scripts can be read before a file lands on a machine.",
          "It installs nothing and freezes nothing. Reading the source tells you what is there now, which is the point, and the source can change tomorrow.",
        ],
      },
      {
        label: "Install command",
        cells: [
          "The teammate whose client the command fits. Skills Board builds it from the saved repository URL and skill name, in the form npx skills add followed by the repository URL and the skill name.",
          "It does not fit every client, and nothing here claims it does. It is one option next to the others rather than the path.",
        ],
      },
      {
        label: "ZIP download",
        cells: [
          "Anyone on a surface with no folder to commit to, which on our support matrix is three of the eleven documented clients, including claude.ai where Anthropic documents skills arriving as a ZIP upload.",
          "It holds the latest files available from the source at download time. It does not guarantee installation in every client, and it is a snapshot rather than a subscription.",
        ],
      },
      {
        label: "Authenticated MCP endpoint",
        cells: [
          "The teammate who asks the question inside the agent. The endpoint is OAuth-protected with browser sign-in rather than a copied key, and with skills:read a compatible client can list and search saved skills and collections and retrieve install commands. With skills:write it can save a skill and organize collections.",
          "It cannot install a skill, execute one, or edit or delete a saved team skill. It answers the question and hands back a command; the teammate still runs it.",
        ],
      },
      {
        label: "The official plugin",
        cells: [
          "The teammate who would rather install a package once. The repository doubles as the marketplace, and the plugin ships the MCP server configuration plus one skill explaining how to use a team library from an agent, with an Agent Plugins manifest and a Claude Code manifest side by side.",
          "It is an alternative to the manual MCP setup rather than a step after it, and installing it signs nobody in. Connecting still means signing in and approving the requested scopes in the client.",
        ],
      },
      {
        label: "Published collection",
        cells: [
          "The group that wants a set rather than an entry. A collection groups saved skills, and publishing it produces a page at a share URL with a one-command installer in the form npx skills add followed by the collection URL and a wildcard skill argument.",
          "The page is unlisted and marked noindex, which is not access-controlled: anyone with the URL can install it. A package holds at most twenty-five skills, and a superseded release is kept for twenty-four hours before cleanup rather than forever.",
        ],
      },
    ],
    notes: [
      "The list has six rows because of the support matrix. Standardizing on one delivery path means choosing which teammates get served, and where somebody is on Claude Code, somebody on Codex, and somebody in a browser with no terminal, that choice always excludes a person.",
      "One nuance worth stating precisely, because it cuts against the usual pitch. A saved entry follows the latest version available from its source and pins no history. A published collection release is the exception: it records the commit each skill came from and a digest of the packaged files, so the installer serves that release rather than whatever the repository looks like today.",
    ],
    link: {
      lead: "For which clients read a folder at all, which is what decides whether a command or a ZIP is the right channel for a teammate, see",
      label: "the Agent Skills support matrix",
      href: agentSkillsSupportPath,
      trail: ".",
    },
    sourceIds: [
      "skillsboard-repo",
      "agent-skills-support-page",
      "anthropic-skills-overview",
    ],
  },
  team: {
    title: "Where Skills Board fits, and where it does not",
    intro:
      "Two honest sentences before the pitch. Skills Board replaces no mechanism in the second table, and it cannot put a file on a teammate's machine. It covers the half those mechanisms leave open.",
    body: [
      "Skills Board is a web application where a team keeps, searches, and shares the AI skills it recommends. A library is scoped to an organization, teammates are invited into it, and each saved entry records the GitHub repository and path it came from plus the team's own tags, a note, and example prompts. Search runs across the title, description, note, example prompts, and tags, which is the sentence a teammate would actually type.",
      "That is deliberately the selection half. If a skill has to reach every managed laptop, managed settings does that and Skills Board does not. If every claude.ai member needs it enabled by default, owner provisioning does that and Skills Board does not. What none of them does is tell the person who joined last month which two skills this team stands behind for code review, who put them there, and where to read them first.",
      "The two layers compose rather than compete. Keep the record of what the team recommends in one place, hand the reviewer the source, the Claude Code user a command, the browser user a ZIP, and still provision the three skills that belong on every machine through the vendor mechanism built for it. The record is what makes that decision explicable six months later.",
    ],
    options: [
      {
        label: "Start with one library",
        body: "Create a team library, save the first skill from its GitHub repository, and invite the teammate who keeps asking. Organization-scoped access keeps the library available to its members rather than the public.",
      },
      {
        label: "Add the words your team uses",
        body: "Team-specific tags, a note explaining why this one, and an example prompt. These are the fields search reads, and they are the difference between a list and an answer.",
      },
      {
        label: "Let each teammate pick a channel",
        body: "Original source, install command, or ZIP download, chosen per person rather than mandated per team. The support matrix is why this is a choice and not an oversight.",
      },
      {
        label: "Connect the agents that can search",
        body: "The authenticated MCP endpoint, or the official plugin that configures it, so which skill do we use gets answered in the session where it was asked.",
      },
    ],
    limits: [
      "A saved skill is a team recommendation. It is not a security review, an approval, or a compatibility certification, and no channel here turns it into one.",
      "Skills Board is not an administration control plane. It cannot deploy a skill to a machine, enforce a policy, block an install, or report what a teammate ran. The vendor mechanisms above are where those live.",
      "A library entry follows the latest version available from its saved source and pins no history. A published collection release is the exception, and the only place a commit is recorded.",
      "The MCP connection cannot install or execute a skill in an agent, and cannot edit or delete saved team skills.",
      "A published collection page is unlisted and marked noindex, not access-controlled. Anyone holding the share URL can install it, so treat the URL as the secret.",
      "The hosted product is free forever, with no trial and no paid tier, and the code is MIT licensed for any team that would rather run it themselves.",
    ],
    link: {
      lead: "The full terms of that last line, including what self-hosting changes, are on",
      label: "the pricing page",
      href: pricingPath,
      trail: ".",
    },
    sourceIds: ["skillsboard-repo", "skillsboard-pricing"],
  },
  notDocumented: {
    title: "What no vendor documents",
    intro:
      "Five gaps we hit while checking the sources on this page. Each is an absence in the public record on August 21, 2026, written out rather than filled in with a guess.",
    entries: [
      {
        title: "No mechanism crosses a vendor boundary",
        body: "Every organization-level distribution path in the second table belongs to one vendor and reaches that vendor's products. No vendor documents reading another vendor's organization channel, and Anthropic states the limit inside its own product line: custom skills do not sync across claude.ai, the API, and Claude Code, and each surface requires separate uploads and management. A team with three agents therefore runs three processes or invents a fourth.",
      },
      {
        title: "Two Anthropic pages disagree about claude.ai",
        body: "The Agent Skills overview says claude.ai does not support centralized admin management or org-wide distribution of custom skills. The Claude Help Center article on provisioning documents owner provisioning to every user, an organization directory, and group targeting through plugins. Both were fetched on the same day. We treat the help center as operative because it is the more specific, and record the disagreement rather than quietly picking a side.",
      },
      {
        title: "Nobody publishes usage",
        body: "Anthropic states that usage analytics are not currently available through the Skills API and suggests application-level logging instead. We found no vendor publishing a documented way to see which skills teammates actually invoked, on any surface. So the question of whether a provisioned skill is used, which is the question that decides whether to keep it, has no documented answer from the tooling.",
      },
      {
        title: "Cursor documents no organization mechanism for skills",
        body: "The Cursor skills documentation lists four native directories, four compatibility directories, and recursive discovery in which a category folder is purely organizational and a skill's identity comes from the folder holding SKILL.md. On the day we checked it named no administrator-level, team-level, or organization-level distribution path. That is an absence in the documentation, not a tested claim about the product.",
      },
      {
        title: "No format carries a recommendation",
        body: "The Agent Skills specification defines a name, a description, and four optional fields, none of which express who recommends a skill, for which team, or on what evidence. No vendor extends the frontmatter with an owner or an endorsement field either. The record of why a skill is in your set is therefore something an organization keeps outside the file, whether that is a registry, a wiki page, or a library.",
      },
    ],
    sourceIds: [
      "anthropic-skills-overview",
      "anthropic-skills-enterprise",
      "claude-provision-skills",
      "claude-code-skills",
      "codex-skills",
      "cursor-skills",
      "agentskills-spec",
    ],
  },
  faq: [
    {
      question: "How do you manage AI skills across an organization?",
      answer:
        "Split it in two. Distribution is per vendor: managed settings or plugins for Claude Code, owner provisioning for claude.ai and Cowork, the Skills API for a workspace, a shared machine location or plugins for Codex. Selection is covered by none of them, so a team keeps its own record of what it recommends.",
    },
    {
      question: "Is there one tool to manage AI skills across an organisation?",
      answer:
        "Not for distribution. Every documented organization-level mechanism belongs to one vendor and reaches only that vendor's products, and Anthropic states that custom skills do not sync even between its own three surfaces. A team library can hold one recommendation for everyone, but a teammate still installs through their own client.",
    },
    {
      question: "How do you share AI agent skills with a team?",
      answer:
        "Commit the skill to a repository the team clones, package it as a plugin, or provision it through the vendor surface everyone uses. Then record the recommendation somewhere searchable, because none of those three says who chose the skill or why, which is what the next teammate needs.",
    },
    {
      question: "How do you share Claude skills with your team?",
      answer:
        "Claude Code documents three paths: commit the project skills directory to version control, ship a skills directory inside a plugin, or deploy organization-wide through managed settings. On claude.ai and Cowork, Team and Enterprise owners can provision a skill to everyone, and members can share one with colleagues, a group, or the organization directory.",
    },
    {
      question: "Do skills sync between Claude Code, claude.ai, and the API?",
      answer:
        "No. Anthropic documents that custom skills do not sync across surfaces: a claude.ai upload is not on the API, an API skill is not on claude.ai, and Claude Code skills are filesystem-based and separate from both. The enterprise guidance recommends keeping the source files in Git and building your own synchronization.",
    },
    {
      question: "How do you manage skills for a team on different agents?",
      answer:
        "Keep one record of the recommendation and more than one way to use it. Claude Code, Codex, and Cursor read different directories and none reads the others' distribution channels, so a single install path always excludes somebody. Offer the source, a command, and the files, and let each teammate choose.",
    },
    {
      question: "Who should own AI skills in an organization?",
      answer:
        "Anthropic's enterprise guidance names the pieces: an internal registry recording purpose, owner, version, dependencies, and evaluation status per skill, plus separation of duties so a skill's author is not its reviewer. Smaller teams rarely need that whole apparatus, but the owner field is the part worth copying first.",
    },
    {
      question: "Can Skills Board deploy a skill to my whole organization?",
      answer:
        "No, and it does not try to. Skills Board is a web application where a team keeps, searches, and shares the AI skills it recommends, with the source, an install command, a ZIP, and an MCP endpoint per entry. Pushing a file to every machine is what managed settings and provisioning are for.",
    },
  ],
  sources: [
    {
      id: "claude-code-skills",
      label: "Claude Code: extend Claude with skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "The four skill levels and their precedence, the enterprise level deployed through managed settings, plugin namespacing, and the three documented ways to share skills.",
    },
    {
      id: "anthropic-skills-overview",
      label: "Anthropic: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "That custom skills do not sync across surfaces, the per-surface sharing scope, the claim that claude.ai has no centralized admin management, and the guidance on skills from sources you do not control.",
    },
    {
      id: "anthropic-skills-enterprise",
      label: "Anthropic: Skills for enterprise",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise",
      note: "The review checklist, separation of duties between author and reviewer, the internal registry fields, the twenty-skill limit per API request, and that usage analytics are unavailable through the Skills API.",
    },
    {
      id: "claude-provision-skills",
      label: "Claude Help Center: provision and manage skills for your organization",
      href: "https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization",
      note: "Organization-wide skill management on Team and Enterprise plans, the ZIP upload, immediate provisioning enabled by default, group targeting through plugins, and the sharing toggles that are off by default.",
    },
    {
      id: "claude-use-skills",
      label: "Claude Help Center: using skills in Claude",
      href: "https://support.claude.com/en/articles/12512180-using-skills-in-claude",
      note: "The personal, shared, and organization sections of a member's skills list, and that shared skills are view-only and update when the author updates them.",
    },
    {
      id: "codex-skills",
      label: "OpenAI: build skills for ChatGPT and Codex",
      href: "https://developers.openai.com/codex/skills",
      note: "The repository, user, admin, and system scan locations, that they are for authoring and local discovery, and plugins as the way to distribute beyond one repository.",
    },
    {
      id: "cursor-skills",
      label: "Cursor: skills",
      href: "https://cursor.com/docs/skills",
      note: "The four native and four compatibility directories, and the category folder described as purely organizational. No organization-level mechanism appears on the page.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The two required frontmatter fields and four optional ones, and the absence of any field expressing ownership or where a skill folder lives.",
    },
    {
      id: "agentskills-clients",
      label: "Agent Skills: client showcase",
      href: "https://agentskills.io/clients",
      note: "The self-nominated list of agent products supporting the format, holding forty-six entries on the date at the top of this page.",
    },
    {
      id: "skillsboard-repo",
      label: "Skills Board on GitHub",
      href: "https://github.com/TommyBez/skillsboard",
      note: "The shipped surface behind the channel table: team libraries, tags and notes, install commands, ZIP download, the MCP endpoint and its scopes, the plugin, and published collections.",
    },
    {
      id: "skillsboard-pricing",
      label: "Skills Board pricing",
      href: "https://www.skillsboard.sh/pricing",
      note: "That the hosted product is free forever with no trial and no paid tier, and the code can be self-hosted.",
    },
    {
      id: "agent-skills-support-page",
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: "https://www.skillsboard.sh/agent-skills-support",
      note: "Our matrix of the eleven clients whose documentation states they read SKILL.md, and the three that read no filesystem path.",
    },
  ],
  related: [
    {
      label: "How to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      description:
        "The ownership workflow: one named owner per recommendation, and the distribution models compared.",
    },
    {
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description:
        "One source of truth for a mixed-agent team, without assuming anything synchronizes on its own.",
    },
    {
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      description:
        "Eleven clients with vendor documentation, the directories each names, and the three that read no folder.",
    },
    {
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      description:
        "What the specification defines, and why it says nothing about where a skill folder lives.",
    },
    {
      label: "Claude Cowork skills",
      href: coworkSkillsPath,
      description:
        "The surface where provisioning and account sync decide what a session can load.",
    },
    {
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      description:
        "The catalogs and repositories a recommendation comes from, and what each one screens for.",
    },
    {
      label: "Best Claude skills: a register with the criteria behind it",
      href: bestClaudeSkillsPath,
      description:
        "What a stated selection bar looks like, including the popular candidates it rejects.",
    },
    {
      label: "Skills Board pricing",
      href: pricingPath,
      description:
        "Free forever, no trial, no paid tier, and the open-source code behind the hosted product.",
    },
  ],
  og: {
    eyebrow: "Manage AI Skills",
    title: [
      { text: "Every vendor solves distribution." },
      { text: "None solves selection.", accent: true },
    ],
    description:
      "What each organization-level mechanism covers, where it stops, and the half of the problem a team keeps itself.",
    contextLabel: "skillsboard.sh/manage-ai-skills",
    chips: ["Distribution", "Selection", "Checked 2026-08-21"],
  },
  ogAlt:
    "Guide to managing AI skills across an organization: the vendor distribution mechanisms, where each one stops, and the recommendation layer none of them covers.",
  publishedAt: "2026-08-21",
  modifiedAt: "2026-08-21",
}
