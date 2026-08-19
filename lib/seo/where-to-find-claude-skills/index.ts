import type { OgTemplateContent } from "@/lib/og/template"
import { alternativePaths } from "@/lib/seo/alternatives"
import { anthropicSkillsPath } from "@/lib/seo/anthropic-skills/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { comparePaths } from "@/lib/seo/compare/types"
import {
  type GuideInlineLink,
  guidePaths,
  type GuidePath,
} from "@/lib/seo/guides/types"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export {
  whereToFindClaudeSkillsPath,
  type WhereToFindClaudeSkillsCtaPlacement,
  type WhereToFindClaudeSkillsPath,
} from "@/lib/seo/where-to-find-claude-skills/types"

export interface WhereSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface WhereSkillsFaqEntry {
  question: string
  answer: string
}

export interface WhereSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/** One contextual link out of a section, rendered as a sentence. */
export type WhereSkillsInlineLink = GuideInlineLink

export interface WhereSkillsTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  sourceIds: readonly string[]
}

/** A named place, with what it is and what it is not. */
export interface WhereSkillsPlaceSection {
  title: string
  intro: string
  entries: readonly {
    name: string
    href: string
    body: string
  }[]
  notes: readonly string[]
  sourceIds: readonly string[]
}

export interface WhereToFindClaudeSkillsDefinition {
  path: typeof whereToFindClaudeSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof anthropicSkillsPath
    | typeof claudeSkillsPath
  )[]
  eyebrow: string
  title: string
  /** Full document title, including the brand suffix. */
  seoTitle: string
  description: string
  /** Scannable positioning above the fold. */
  intro: readonly string[]
  /** Answer-first definition, sized for extraction. */
  answer: string
  answerNotes: readonly string[]
  answerSourceIds: readonly string[]
  landscape: WhereSkillsTableSection & { link: WhereSkillsInlineLink }
  official: WhereSkillsPlaceSection & { link: WhereSkillsInlineLink }
  catalogs: WhereSkillsPlaceSection
  community: WhereSkillsPlaceSection & { link: WhereSkillsInlineLink }
  vetting: WhereSkillsTableSection & { link: WhereSkillsInlineLink }
  team: {
    title: string
    intro: string
    body: readonly string[]
    paths: readonly {
      label: string
      body: string
    }[]
    limits: readonly string[]
    link: WhereSkillsInlineLink
    sourceIds: readonly string[]
  }
  openQuestions: {
    title: string
    intro: string
    entries: readonly {
      title: string
      body: string
    }[]
    sourceIds: readonly string[]
  }
  faq: readonly WhereSkillsFaqEntry[]
  sources: readonly WhereSkillsSource[]
  related: readonly WhereSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const whereToFindClaudeSkills: WhereToFindClaudeSkillsDefinition = {
  path: whereToFindClaudeSkillsPath,
  contentType: "article",
  topics: [
    "claude skills",
    "skill discovery",
    "plugin marketplace",
    "skill catalogs",
  ],
  relatedGuidePaths: [
    claudeSkillsPath,
    guidePaths.installClaudeSkills,
    guidePaths.chooseFirstTeamSkill,
  ],
  eyebrow: "Where to find Claude skills",
  title: "Where to find Claude skills: marketplaces, directories, and repos",
  seoTitle:
    "Where to Find Claude Skills: Marketplaces, Directories, and Repos | Skills Board",
  description:
    "There is no Anthropic skills marketplace. What exists instead: the official Claude Code plugin marketplace, the claude.com plugin catalog, skills.sh, the anthropics/skills repository, awesome lists, and vendor repos, with what each one is and is not.",
  intro: [
    "People search for a Claude skills marketplace, and the thing that phrase names does not exist as a product. Anthropic runs a plugin marketplace, and the unit it distributes is a plugin that can contain skills. Everything else that people call a marketplace is either a public directory somebody else operates, a repository you clone, or a hand-curated list on GitHub. Each one screens something different, and some of them screen nothing at all.",
    "There is also a name collision worth clearing up before you go looking. Anthropic does operate something called the Claude Marketplace, and it has nothing to do with skills: it is where enterprises spend an existing Anthropic commitment on partner solutions from companies like Harvey, Snowflake, and GitLab. Landing there from a search for an Anthropic skills marketplace is a dead end.",
    "This page maps every place a Claude skill actually comes from today, checked on the date at the top: what each source publishes, how a skill gets from it onto your machine, what it verifies first, and the one thing none of them holds, which is the reason your team picked one skill over the other four.",
  ],
  answer:
    "There is no Anthropic skills marketplace. Anthropic runs a plugin marketplace, claude-plugins-official, which Claude Code adds automatically and which you can browse at claude.com/plugins, and the thing it installs is a plugin that can contain skills. Everything else is a repository or a directory: anthropics/skills, Vercel's skills.sh, the awesome lists, and vendor repos. The Claude API ships four pre-built skills of its own.",
  answerNotes: [
    "The distinction people trip over is the unit of distribution. Claude Code's documentation states that plugins extend it with skills, agents, hooks, and MCP servers, and that plugin marketplaces are catalogs that help you discover and install these extensions. You install a plugin, and its skills arrive with it under a plugin-name:skill-name namespace. There is no skill-level install command and no Anthropic catalog that lists skills on their own.",
    "Anthropic reserves the marketplace names agent-skills and anthropic-agent-skills so that no third party can present itself as an official Anthropic source. Reserving a name is not the same as shipping a product, and the documentation describes nothing published under either one.",
    "The channels that matter most in practice route around marketplaces entirely. You clone a repository, run one CLI command, copy a folder into a directory your agent scans, or upload a skill through the API. Most teams end up using at least two of those, which is why the question of where a given skill came from stops being obvious quite quickly.",
  ],
  answerSourceIds: [
    "claude-discover-plugins",
    "claude-plugin-marketplaces",
    "claude-skills-docs",
    "claude-plugins-catalog",
    "platform-skills-overview",
  ],
  landscape: {
    title: "Every place a Claude skill comes from",
    intro:
      "Six channels, and they are not variations on one thing. Read the middle column before the right one, because most of the confusion in this space is people assuming a directory is an installer or that a repository is a review process.",
    columns: ["Source", "What it actually is", "How a skill reaches you"],
    rows: [
      {
        label: "claude-plugins-official",
        cells: [
          "The official Anthropic plugin marketplace. Claude Code adds it automatically the first time you start it interactively. It is curated by Anthropic, and inclusion is at Anthropic's discretion.",
          "You install a plugin, not a skill: /plugin install name@claude-plugins-official, or the Discover tab inside /plugin. Its skills load under the plugin's namespace.",
        ],
      },
      {
        label: "claude.com/plugins",
        cells: [
          "The web view of that catalog, filterable by whether a plugin works with Claude Code or with Cowork. Listings carry install counts and an Anthropic verified badge, and there is a form to submit a plugin for review.",
          "You read it in a browser and install from Claude Code afterwards. The page is a directory, not an installer.",
        ],
      },
      {
        label: "claude-community",
        cells: [
          "The community marketplace at anthropics/claude-plugins-community: third-party plugins that passed Anthropic's automated validation and safety screening, each pinned to a specific commit SHA in the catalog.",
          "You add it manually with /plugin marketplace add anthropics/claude-plugins-community, then install with the claude-community name.",
        ],
      },
      {
        label: "anthropics/skills",
        cells: [
          "Anthropic's own public repository of Agent Skills: examples, the document skills behind Claude's file creation, the specification, and a template. It is not a catalog of other people's work.",
          "Clone it and copy a folder, or register the repository itself as a marketplace with /plugin marketplace add anthropics/skills and install whichever plugins its manifest defines.",
        ],
      },
      {
        label: "skills.sh",
        cells: [
          "Vercel's public directory, which calls itself the open directory for AI agent skills. It indexes every public skill that ships through its open CLI and ranks them by anonymous install telemetry.",
          "One command: npx skills add owner/repo, or a pack URL when you want several skills at once. The CLI is open source.",
        ],
      },
      {
        label: "GitHub, directly",
        cells: [
          "Vendor repositories and hand-curated awesome lists. This is where most skills actually live, because publishing one requires nothing more than a folder with a SKILL.md in it.",
          "Clone the repository, copy the folder into a directory your agent scans, or follow whatever install instructions the maintainer wrote.",
        ],
      },
    ],
    notes: [
      "The pattern behind the table is that Anthropic distributes bundles and everyone else distributes folders. That is not a criticism of either side, but it changes what you are agreeing to. Installing a plugin brings whatever else it carries, including hooks and MCP servers; copying a skill folder brings one SKILL.md and the files beside it, and nothing more.",
      "Nothing in the list is exclusive, which is why the same skill can look like four different things. Anthropic's own repository is simultaneously a git repository you can clone, a marketplace you can register in Claude Code, and an owner whose skills appear on the skills.sh leaderboard. Superpowers is an MIT-licensed repository with install instructions for more than a dozen agents, and it is also a listing on claude.com/plugins.",
      "One more source sits outside all of this. Claude Code loads skills you enabled on your claude.ai account into a reserved synced folder, and Cowork and cloud sessions load them without any local setup. Those skills did not come from a marketplace at all; they came from an account setting, which is worth knowing when a teammate has a skill you cannot find on disk.",
    ],
    link: {
      lead: "Once you have picked a source, the placement rules and the five documented install paths are in",
      label: "How to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      trail: ".",
    },
    sourceIds: [
      "claude-discover-plugins",
      "claude-skills-docs",
      "claude-plugins-catalog",
      "anthropic-skills-repo",
      "skills-sh",
      "superpowers",
    ],
  },
  official: {
    title: "What Anthropic actually operates",
    intro:
      "Four surfaces, plus one product with a confusingly similar name. None of them is a skills marketplace, and knowing which is which saves a lot of searching.",
    entries: [
      {
        name: "The official plugin marketplace and claude.com/plugins",
        href: "https://claude.com/plugins",
        body: "Claude Code adds claude-plugins-official automatically the first time you start it interactively, and you can add it by hand with /plugin marketplace add anthropics/claude-plugins-official if that fails. The web catalog invites you to browse plugins that bundle tools, skills, and integrations for one-click installation, filtered by whether each one works with Claude Code or Cowork. Listings show install counts and mark some entries Anthropic verified, and a submission form offers to review your plugin for the directory. The page served on the day we checked it rendered one hundred plugin cards, led by Frontend Design at 1,134,112 installs and Superpowers at 1,009,371. Anthropic publishes no total.",
      },
      {
        name: "The community marketplace",
        href: "https://github.com/anthropics/claude-plugins-community",
        body: "A separate catalog of third-party plugins that have passed Anthropic's automated validation and safety screening, with each plugin pinned to a specific commit SHA. Unlike the official one you add it yourself, and you install from it using the claude-community name. The in-app submission forms add plugins here rather than to the official marketplace. The repository itself is a read-only mirror, at 352 stars when we read the GitHub API today.",
      },
      {
        name: "anthropics/skills",
        href: "https://github.com/anthropics/skills",
        body: "Anthropic's public repository for Agent Skills, at 169,863 stars when we checked. It holds example skills across creative, technical, and enterprise tasks, the specification under spec, and a skill template. Many skills are Apache 2.0. The docx, pdf, pptx, and xlsx skills that power Claude's document capabilities are source-available rather than open source, published as a reference for more complex skills. Register it in Claude Code with /plugin marketplace add anthropics/skills and it exposes whatever its marketplace manifest defines under the name anthropic-agent-skills, which was document-skills, example-skills, claude-api, and claude-academy-guide when we last read the file. That manifest gains an entry whenever a skill ships, so read it rather than trusting a count.",
      },
      {
        name: "The Skills API and claude.ai",
        href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
        body: "Anthropic ships four pre-built skills for document work, PowerPoint, Excel, Word, and PDF, available on claude.ai and the Claude API. In the API you reference a skill_id in the container parameter alongside the code execution tool, and custom skills you upload work through the same shape. This is the one Anthropic surface where a skill is the unit rather than a plugin, and it is an API rather than anything you can browse.",
      },
      {
        name: "Claude Marketplace, which is something else entirely",
        href: "https://claude.com/platform/marketplace",
        body: "Anthropic does publish a page called Claude Marketplace, and it is not related to skills or plugins. It exists so enterprises can use an existing Anthropic commitment to pay for Claude-powered solutions from partners, and the entries are companies: Harvey, Snowflake, Lovable, GitLab, Base44, Hebbia, CodeRabbit, Legora, Augment, Rogo. If a search for an Anthropic skills marketplace sent you there, the page you wanted is claude.com/plugins.",
      },
    ],
    notes: [
      "Anthropic's own trust language is worth reading before you install anything from any of these. The plugin documentation states plainly that plugins and marketplaces are highly trusted components that can execute arbitrary code on your machine with your user privileges, that you should only install plugins and add marketplaces from sources you trust, and that Anthropic does not control what MCP servers, files, or other software are included in plugins and cannot verify that they work as intended.",
      "Reserved marketplace names are a small detail with a useful implication. Anthropic blocks third parties from registering names such as claude-plugins-official, claude-plugins-community, agent-skills, and anthropic-agent-skills, along with lookalikes like official-claude-plugins. So if you are told to add a marketplace whose name sounds official, the name itself is evidence of nothing, but a name in the reserved set could only have come from Anthropic.",
    ],
    link: {
      lead: "For the contents of the first two of those, every skill Anthropic publishes itself with what it does and how it is licensed, see",
      label: "Anthropic skills: every first-party skill and where it loads",
      href: anthropicSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "claude-discover-plugins",
      "claude-plugin-marketplaces",
      "claude-plugins-catalog",
      "claude-marketplace",
      "anthropic-skills-repo",
      "platform-skills-overview",
      "platform-skills-api",
    ],
  },
  catalogs: {
    title: "The public catalogs nobody at Anthropic runs",
    intro:
      "Two sites do most of the work here, and only one of them is a catalog. Both are useful for different reasons, and neither is a substitute for reading the file.",
    entries: [
      {
        name: "skills.sh",
        href: "https://www.skills.sh",
        body: "Vercel's directory, titled The Agent Skills Directory and described on its own about page as the open directory for AI agent skills. It indexes every public skill that ships through the open skills CLI and ranks them by anonymous, deduplicated install counts collected when users opt in, with deduplication running hourly. Installation is one command, npx skills add owner/repo, and it lists twenty agents the skills work with. The CLI, the ingestion pipeline, and the site are open source at vercel-labs/skills, 29,076 stars when we checked. On the day we looked, the leaderboard was led by find-skills, then grill-me, then Anthropic's own frontend-design.",
      },
      {
        name: "Skill packs on skills.sh",
        href: "https://vercel.com/changelog/skill-packs-are-now-available",
        body: "Announced on 7 August 2026, packs bundle several skills behind one URL. You can build a pack from community skills, your own local folders and zips, or public and private GitHub repositories, then install the whole thing with npx skills add followed by the pack URL and update it later with npx skills update. The caveat is published clearly and matters for teams: packs are unlisted, not access-controlled, so anyone with the pack URL can view and install it.",
      },
      {
        name: "agentskills.io",
        href: "https://agentskills.io",
        body: "Not a catalog, and often mistaken for one. It is the home of the Agent Skills standard itself: the specification, a quickstart, and a client showcase listing the agent products that read the format. The format was originally developed by Anthropic, released as an open standard, and the site says it has been adopted by a growing number of agent products. Go here to check whether a skill will load in something other than Claude, not to find skills.",
      },
    ],
    notes: [
      "The ranking signal on skills.sh is install telemetry, which answers a question worth being explicit about. It tells you what a lot of people installed, not what worked, not what is maintained, and not what suits your codebase. A leaderboard is a popularity measurement, and popularity is a discovery filter rather than a decision.",
      "skills.sh is also the only public directory in this list that says it screens. It states that every indexed skill goes through routine security audits performed by partner providers, and that skills failing every partner audit are excluded from the directory entirely. That is more than any awesome list offers and less than a review of the skill against your own threat model.",
    ],
    sourceIds: ["skills-sh", "skills-sh-packs", "agentskills-spec"],
  },
  community: {
    title: "GitHub, where most skills actually live",
    intro:
      "Publishing a skill takes a folder and a SKILL.md, so the long tail is on GitHub and always will be. Star counts below were read from the GitHub API on the date at the top of this page and will have moved since.",
    entries: [
      {
        name: "obra/superpowers",
        href: "https://github.com/obra/superpowers",
        body: "The largest single skills project we found, MIT licensed and at 273,004 stars today. It packages a complete software development methodology as composable skills: spec first, then a plan, then subagent-driven development with review, with strong opinions about red-green testing. Its README documents install paths for Claude Code, Antigravity, Codex App, Codex CLI, Cursor, Devin CLI, Factory Droid, Gemini CLI, GitHub Copilot CLI, Grok Build CLI, Kimi Code, OpenCode, Pi, and Hermes Agent. It also appears on claude.com/plugins with over a million installs.",
      },
      {
        name: "VoltAgent/awesome-agent-skills",
        href: "https://github.com/VoltAgent/awesome-agent-skills",
        body: "MIT licensed, 30,424 stars today, and explicit about its editorial line: hand-picked, not AI-slop generated. It organizes official skills published by engineering teams, naming Anthropic, Google Labs, Vercel, Stripe, Cloudflare, Netlify, Trail of Bits, Sentry, Expo, Hugging Face, and Figma among them, alongside community entries. Its own badge claims 1497 or more skills, which is a self-reported number rather than one anybody audits.",
      },
      {
        name: "ComposioHQ/awesome-claude-skills",
        href: "https://github.com/ComposioHQ/awesome-claude-skills",
        body: "The largest awesome list in this niche at 72,650 stars today, describing itself as a curated list of over a thousand production-ready Claude Skills and Plugins that also work across Codex, Cursor, Gemini CLI, and Antigravity. Worth reading with its commercial context in view: it is published by Composio, opens with a Composio banner, and its quickstart installs a Composio plugin. That does not make the list bad, but a curated list maintained by a vendor is an advertisement as well as a resource.",
      },
      {
        name: "The rest of the awesome lists",
        href: "https://github.com/search?q=awesome+claude+skills&type=repositories",
        body: "Several more compete for the same query, and their sizes and freshness differ enough to matter. When we searched the GitHub API today, hesreallyhim/awesome-claude-code sat at 52,462 stars with a broader Claude Code scope, travisvn/awesome-claude-skills at 14,682 with its last push in April, and BehiSecc/awesome-claude-skills at 9,976. Check the last commit date before trusting any of them, because a link list decays faster than the skills it links to.",
      },
    ],
    notes: [
      "Vendor repositories are the underrated part of this map. Many of the skills worth having are published by the team that maintains the tool the skill is about, and they never appear in a general catalog because their owners have no reason to submit them anywhere. If you want a skill for a specific framework or service, the first place to look is that project's own repository, not a directory.",
      "Anthropic's own guidance applies with the most force here, because a GitHub listing is not a review. A skill gives an agent new instructions and executable code, so audit every file in an unfamiliar one, including scripts and anything it fetches from an external URL, and treat the decision the way you would treat installing software from an unknown publisher.",
    ],
    link: {
      lead: "For the skills inside these repositories that cleared a stated bar, read folder by folder with the license on each one, see",
      label: "Best Claude skills: a register with the criteria behind it",
      href: bestClaudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "superpowers",
      "awesome-voltagent",
      "awesome-composio",
      "claude-discover-plugins",
      "claude-skills-docs",
    ],
  },
  vetting: {
    title: "What each source checks before it lists something",
    intro:
      "This is the column that decides how much reading you still have to do. Only two of these six do any screening at all, and neither of them screens for whether the skill is right for you.",
    columns: ["Source", "What it screens", "What it does not tell you"],
    rows: [
      {
        label: "Official marketplace",
        cells: [
          "Curated by Anthropic, and inclusion is at Anthropic's discretion. The catalog says every submission gets a basic automated review before it is listed, and that entries badged Anthropic verified have had additional review for quality and safety.",
          "Anthropic states that it does not control what MCP servers, files, or other software are included in plugins and cannot verify that they work as intended.",
        ],
      },
      {
        label: "Community marketplace",
        cells: [
          "Automated validation and safety screening, with each plugin pinned to a specific commit SHA so the catalog entry cannot silently change.",
          "Automated screening is not a code review, and a pinned SHA tells you the version is stable rather than that it is good.",
        ],
      },
      {
        label: "claude.com/plugins",
        cells: [
          "The same curation as the marketplace behind it, plus a submission form that promises a review before a plugin joins the directory.",
          "Install counts are the most visible signal on the page, and they measure adoption rather than quality or maintenance.",
        ],
      },
      {
        label: "skills.sh",
        cells: [
          "Routine security audits by partner providers. Skills failing every partner audit are excluded from the directory entirely.",
          "Ranking is anonymous install telemetry, so the leaderboard is a popularity chart. Passing an audit says nothing about fit.",
        ],
      },
      {
        label: "Awesome lists",
        cells: [
          "Nothing enforceable. A maintainer decided an entry belonged, on criteria they may or may not publish.",
          "Whether the linked skill still exists, still works, or was ever tested by the person who listed it.",
        ],
      },
      {
        label: "A plain GitHub repo",
        cells: [
          "Nothing at all. Anyone can publish a folder with a SKILL.md in it, and nothing sits between that and your machine.",
          "Everything. This is the case where reading the file is not optional, and where the stars measure attention rather than safety.",
        ],
      },
    ],
    notes: [
      "Read the table in one direction and it looks like an argument for the official marketplace. Read it in the other and it is an argument for reading files, because the strongest screening on offer still stops well short of the question that matters, which is whether this particular skill does the right thing on your codebase with your permissions.",
      "There is a practical order that follows from this. Discover anywhere, including the leaderboard and the awesome list, then open the SKILL.md and read the description, the instructions, and anything in the scripts folder before it ever lands in a directory your agent scans. Discovery and adoption are different decisions, and the sources above only help with the first one.",
    ],
    link: {
      lead: "For a scorecard that turns that second decision into something a team can repeat, see",
      label: "How to choose the first AI agent skill for your team",
      href: guidePaths.chooseFirstTeamSkill,
      trail: ".",
    },
    sourceIds: [
      "claude-discover-plugins",
      "claude-plugins-catalog",
      "claude-skills-docs",
      "skills-sh",
    ],
  },
  team: {
    title: "The thing none of these places holds",
    intro:
      "Every source above answers what exists. None of them answers which one your team uses, and that is the question that gets asked most often in practice.",
    body: [
      "A catalog ranks what everybody installs. A team needs the opposite: the small set somebody already read, tried on a real task, and decided to stand behind. That set is usually four or five skills, and it is almost never written down anywhere a new teammate can find it.",
      "The surfaces do not help, because none of them was built to. In Claude Code a skill lives in a personal folder, in one repository, or inside a plugin, and none of those locations records who chose it or why. On claude.ai, custom skills belong to the individual user rather than the organization. Through the API, uploaded skills are workspace-wide but carry no recommendation with them.",
      "So the recommendation lands in a chat thread or one person's memory, and the next teammate starts their search back at the leaderboard. Skills Board is a shared library for that layer specifically: the smaller set of skills your team recommends, in one searchable place, with the original source visible on every entry and no assumption about which agent a teammate runs.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and path it came from, so a teammate can read the SKILL.md before placing it anywhere.",
      },
      {
        label: "Copy an install command",
        body: "For the teammates whose setup the command fits. It is one option among several, not the only path.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files available from the source at download time, for anyone who would rather drop the folder into the directory their agent scans.",
      },
      {
        label: "Connect over MCP",
        body: "An MCP-compatible agent can search the same team library and retrieve install commands, and with the write scope save skills and organize collections.",
      },
    ],
    limits: [
      "A saved skill is a team recommendation, not a security review, an approval, or a compatibility certification.",
      "Skills Board is not a marketplace and does not host, rank, or distribute skills to the public. It points at the sources on this page.",
      "It follows the latest version available from the saved source, and does not pin or preserve historical versions.",
      "The MCP connection cannot install or run a skill inside an agent, and it cannot edit or delete saved team skills.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    link: {
      lead: "For the ownership side of the same problem, one recommendation and a named owner per skill, see",
      label: "How to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      trail: ".",
    },
    sourceIds: ["claude-skills-docs", "platform-skills-api", "skills-sh"],
  },
  openQuestions: {
    title: "What we could not verify",
    intro:
      "Some of the numbers in this space are published without a definition, and some claims people repeat are not documented anywhere. These are the gaps we hit while checking, written out rather than smoothed over.",
    entries: [
      {
        title: "No source publishes how many Claude skills exist",
        body: "Not Anthropic, not skills.sh, not any awesome list. The claude.com/plugins page we fetched rendered one hundred plugin cards with no total anywhere on it, and the skills.sh all-time leaderboard tab showed a figure of 1,236,590 with no label explaining what it counts. We have not used either as a count of anything, and neither should you.",
      },
      {
        title: "Skill counts on awesome lists are self-reported",
        body: "The badges advertising more than a thousand skills are written by the maintainers of those lists. Nobody audits them, the lists overlap heavily with each other, and a listing may point at a repository that has since moved or gone stale. Treat the number as marketing copy rather than as an inventory.",
      },
      {
        title: "Anthropic verified is a badge without published criteria",
        body: "The claude.com/plugins listings carry an Anthropic verified marker on some entries. The catalog does say what the badge means in outline: submissions get a basic automated review before they are listed, badged entries have had additional review for quality and safety, and Anthropic adds that there are limits to what it can review and that you should install only from developers you trust. What nobody publishes is the criteria that review applies, who applies them, or how often a badge is rechecked, so the badge tells you a review happened rather than what it found. The plugin documentation adds only that the official marketplace is curated by Anthropic and that inclusion is at Anthropic's discretion.",
      },
      {
        title: "The Agent Skills specification carries no version number",
        body: "The specification at agentskills.io defines the required and optional frontmatter fields, but publishes no version identifier or revision date on the page itself. So there is no way to say from the specification alone which revision a given client implements, or when a field's behavior last changed.",
      },
    ],
    sourceIds: [
      "claude-discover-plugins",
      "claude-plugins-catalog",
      "skills-sh",
      "agentskills-spec",
      "awesome-voltagent",
      "awesome-composio",
    ],
  },
  faq: [
    {
      question: "Is there an official Claude skills marketplace?",
      answer:
        "No. Anthropic operates a plugin marketplace called claude-plugins-official, added automatically by Claude Code and browsable at claude.com/plugins. It distributes plugins, and a plugin can contain skills. No Anthropic catalog lists skills on their own. The name agent-skills is reserved for Anthropic, but no documented product uses it.",
    },
    {
      question: "Where can I browse Claude skills in a directory?",
      answer:
        "Three places publish browsable listings. claude.com/plugins shows plugins with install counts and verified badges. skills.sh, run by Vercel, is a directory and leaderboard of agent skills ranked by install telemetry. Community awesome lists on GitHub are the third, curated by hand rather than by any operator.",
    },
    {
      question: "How do I install a skill from the Anthropic plugin marketplace?",
      answer:
        "You install the plugin that contains it. Run /plugin install name@claude-plugins-official in Claude Code, or open /plugin and use the Discover tab. If the marketplace is missing, add it with /plugin marketplace add anthropics/claude-plugins-official. Plugin skills are namespaced, so they appear as plugin-name:skill-name.",
    },
    {
      question: "What is skills.sh?",
      answer:
        "It is Vercel's public directory of agent skills, which describes itself as the open directory for AI agent skills. It indexes every public skill shipped through the open skills CLI, ranks them by anonymous install telemetry, and installs them with npx skills add owner/repo. Its CLI and ingestion pipeline are open source.",
    },
    {
      question: "Is anthropics/skills the official Claude skills directory?",
      answer:
        "It is Anthropic's public repository of Agent Skills, not a directory of other people's work. It holds example skills, the document skills behind Claude's file creation, the specification, and a template. You can register it as a Claude Code marketplace with /plugin marketplace add anthropics/skills.",
    },
    {
      question: "Are awesome-claude-skills lists safe to install from?",
      answer:
        "They are link collections, not review processes. A listing means a maintainer added an entry, and the skill counts they advertise are self-reported. Anthropic's guidance is to install only from sources you trust, because a skill gives an agent new instructions and executable code. Read every file first.",
    },
    {
      question: "What is the Claude Marketplace?",
      answer:
        "A different product, and a common wrong turn. Claude Marketplace at claude.com/platform/marketplace lets enterprises spend an existing Anthropic commitment on partner solutions such as Harvey, Snowflake, and GitLab. It lists companies, not skills or plugins. The plugin catalog is at claude.com/plugins instead.",
    },
    {
      question: "Where should a team keep the skills it recommends?",
      answer:
        "Not in a catalog, because a catalog ranks what everyone installs rather than what your team chose. Claude Code stores skills personally, per repository, or in a plugin, and none of those records the recommendation. Skills Board is a shared library for that layer, with the original source on every entry.",
    },
  ],
  sources: [
    {
      id: "claude-discover-plugins",
      label: "Claude Code: discover and install plugins",
      href: "https://code.claude.com/docs/en/discover-plugins",
      note: "That plugins extend Claude Code with skills, agents, hooks, and MCP servers, that claude-plugins-official is added automatically, the community and demo marketplaces, the claude.com/plugins catalog link, and the trust and security warnings.",
    },
    {
      id: "claude-plugin-marketplaces",
      label: "Claude Code: plugin marketplaces",
      href: "https://code.claude.com/docs/en/plugin-marketplaces",
      note: "What a marketplace is technically, the .claude-plugin/marketplace.json schema, the reserved Anthropic marketplace names including agent-skills, and the managed restrictions an organization can apply.",
    },
    {
      id: "claude-skills-docs",
      label: "Claude Code: skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "The four locations a skill can live in, the plugin-name:skill-name namespace, the claude.ai sync folder, and which frontmatter fields travel outside Claude Code.",
    },
    {
      id: "claude-plugins-catalog",
      label: "Plugins for Claude",
      href: "https://claude.com/plugins",
      note: "The public plugin catalog: the browse copy, the Claude Code and Cowork filters, install counts, the Anthropic verified badge, the submission form, and the hundred cards served on the day we checked.",
    },
    {
      id: "claude-marketplace",
      label: "Claude Marketplace",
      href: "https://claude.com/platform/marketplace",
      note: "That the product named Claude Marketplace sells partner solutions against an existing Anthropic commitment, and lists companies rather than skills or plugins.",
    },
    {
      id: "anthropic-skills-repo",
      label: "anthropics/skills on GitHub",
      href: "https://github.com/anthropics/skills",
      note: "What the repository contains, the Apache 2.0 and source-available split, the spec and template folders, and the marketplace manifest that defines the plugins the repository exposes.",
    },
    {
      id: "platform-skills-overview",
      label: "Claude Platform: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "The four pre-built document skills, where they are available, and that Anthropic's open-source skills live in the skills repository rather than in a catalog.",
    },
    {
      id: "platform-skills-api",
      label: "Claude Platform: using Agent Skills with the API",
      href: "https://platform.claude.com/docs/en/build-with-claude/skills-guide",
      note: "That API skills run through the code execution tool with a skill_id in the container parameter, and that Anthropic-managed and custom skills share the same integration shape.",
    },
    {
      id: "skills-sh",
      label: "skills.sh",
      href: "https://www.skills.sh",
      note: "The Agent Skills Directory framing, that Vercel operates it, the telemetry-based ranking with hourly deduplication, the npx skills add command, and the partner security audits that exclude failing skills.",
    },
    {
      id: "skills-sh-packs",
      label: "Vercel changelog: skill packs are now available",
      href: "https://vercel.com/changelog/skill-packs-are-now-available",
      note: "The 7 August 2026 release of packs, what a pack can bundle, the install and update commands, and that packs are unlisted rather than access-controlled.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "That the format was originally developed by Anthropic and released as an open standard, the required and optional frontmatter fields, and the absence of a published version identifier.",
    },
    {
      id: "superpowers",
      label: "obra/superpowers on GitHub",
      href: "https://github.com/obra/superpowers",
      note: "The MIT license, the methodology it packages, the fourteen agents its README documents install paths for, and the star count read from the GitHub API on the date at the top of this page.",
    },
    {
      id: "awesome-voltagent",
      label: "VoltAgent/awesome-agent-skills on GitHub",
      href: "https://github.com/VoltAgent/awesome-agent-skills",
      note: "The MIT license, the hand-picked editorial line, the engineering teams whose official skills it organizes, and the self-reported skill count on its badge.",
    },
    {
      id: "awesome-composio",
      label: "ComposioHQ/awesome-claude-skills on GitHub",
      href: "https://github.com/ComposioHQ/awesome-claude-skills",
      note: "The self-description as a curated list of over a thousand skills across several agents, and the Composio banner and plugin quickstart that make its commercial context explicit.",
    },
  ],
  related: [
    {
      label: "Best Claude skills: a register with the criteria behind it",
      href: bestClaudeSkillsPath,
      description:
        "Twenty-seven skills from these sources that cleared seven stated criteria, and the nine popular candidates that did not.",
    },
    {
      label: "Anthropic skills: every first-party skill and where it loads",
      href: anthropicSkillsPath,
      description:
        "The catalog behind the first two official sources above, skill by skill, with licenses.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The format itself: the frontmatter, where a skill loads from, and what each surface supports.",
    },
    {
      label: "How to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      description:
        "The five documented install paths, the directories on disk, and how to confirm a skill actually loaded.",
    },
    {
      label: "How to choose the first AI agent skill for your team",
      href: guidePaths.chooseFirstTeamSkill,
      description:
        "A scorecard, a source review, and a teammate test, for after discovery is done.",
    },
    {
      label: "Claude skills vs MCP: what each one is for",
      href: comparePaths.skillsVsMcp,
      description:
        "Why a plugin can carry both, and which of the two a given problem actually needs.",
    },
    {
      label: "Skills Board vs skills.sh",
      href: alternativePaths.skillsSh,
      description:
        "A public directory next to a team library, and which question each one answers.",
    },
    {
      label: "How to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      description:
        "Turning a skill that worked once into a recommendation the next teammate can find.",
    },
  ],
  og: {
    eyebrow: "Where to find Claude skills",
    title: [
      { text: "There is no skills marketplace." },
      { text: "Here is what exists instead.", accent: true },
    ],
    description:
      "The official plugin marketplace, the claude.com catalog, skills.sh, anthropics/skills, and the awesome lists, with what each one is and is not.",
    contextLabel: "skillsboard.sh/where-to-find-claude-skills",
    chips: ["Marketplaces", "Directories", "Repositories"],
  },
  ogAlt:
    "Map of where Claude skills come from: the official plugin marketplace, the claude.com catalog, skills.sh, anthropics/skills, and community repositories.",
  publishedAt: "2026-08-17",
  modifiedAt: "2026-08-17",
}
