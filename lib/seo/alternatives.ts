import type { OgTemplateContent } from "@/lib/og/template"
import { guidePaths } from "@/lib/seo/guides/types"
import { pricingPath } from "@/lib/seo/pricing-schema"

export const alternativesIndexPath = "/alternatives"

export const alternativePaths = {
  githubRepo: "/alternatives/github-repo",
  skillsSh: "/alternatives/skills-sh",
  smithery: "/alternatives/smithery",
} as const

export type AlternativePath =
  (typeof alternativePaths)[keyof typeof alternativePaths]

export type AlternativeSlug =
  AlternativePath extends `/alternatives/${infer Slug}` ? Slug : never

/** One value per alternative page, used as the analytics location prefix. */
export type AlternativeCtaLocation =
  | "alternatives_github_repo"
  | "alternatives_skills_sh"
  | "alternatives_smithery"

/**
 * The two CTA placements on an alternative page, kept in sync with the
 * landing_cta_clicked union. Guides split guide_inline from guide_closing for
 * the same reason, so the placement stays readable in PostHog.
 */
export type AlternativeCtaPlacement =
  `${AlternativeCtaLocation}_${"header" | "closing"}`

export interface AlternativeSource {
  /** Stable key referenced by comparison rows. */
  id: string
  label: string
  href: string
  note: string
}

export interface AlternativeComparisonRow {
  dimension: string
  skillsBoard: string
  alternative: string
  /** Source ids that back the alternative column of this row. */
  sourceIds?: readonly string[]
}

export interface AlternativeFaqEntry {
  question: string
  answer: string
}

export interface AlternativeSection {
  title: string
  intro: string
  points: readonly string[]
}

export interface AlternativeRelatedLink {
  label: string
  href: string
  description: string
}

export interface AlternativeDefinition {
  path: AlternativePath
  ctaLocation: AlternativeCtaLocation
  /** What the reader is comparing against, used in cards and breadcrumbs. */
  subject: string
  subjectHref: string
  eyebrow: string
  title: string
  seoTitle: string
  socialTitle: string
  description: string
  cardSummary: string
  ogAlt: string
  og: OgTemplateContent
  publishedAt: string
  modifiedAt: string
  /** Scannable positioning, two or three sentences. */
  summary: readonly string[]
  reasons: AlternativeSection
  comparison: {
    title: string
    caption: string
    rows: readonly AlternativeComparisonRow[]
  }
  alternativeWins: AlternativeSection
  skillsBoardWins: AlternativeSection
  moveOver: {
    title: string
    intro: string
    steps: readonly string[]
  }
  faq: readonly AlternativeFaqEntry[]
  sources: readonly AlternativeSource[]
  related: readonly AlternativeRelatedLink[]
}

const githubRepo: AlternativeDefinition = {
  path: alternativePaths.githubRepo,
  ctaLocation: "alternatives_github_repo",
  subject: "A shared GitHub repository",
  subjectHref: "https://github.com",
  eyebrow: "Alternative to the shared repo",
  title: "The shared GitHub repo, and the alternative to it",
  seoTitle:
    "Shared GitHub Repo Alternative for Team AI Skills | Skills Board",
  socialTitle: "Shared GitHub repo alternative for team AI skills",
  description:
    "Most teams start by keeping agent skills in one shared GitHub repository. Compare that setup with Skills Board, a searchable team library that keeps every saved skill tied to its original source.",
  cardSummary:
    "The default setup for engineering teams. Where it holds up, where a shared library fits better, and how to run both.",
  ogAlt:
    "Comparison of a shared GitHub repository and Skills Board for team AI skills.",
  og: {
    eyebrow: "Alternatives",
    title: [
      { text: "One repo, or one" },
      { text: "shared team library.", accent: true },
    ],
    description:
      "How a shared GitHub repository and Skills Board compare for the AI skills a team recommends.",
    contextLabel: "skillsboard.sh/alternatives",
    chips: ["GitHub repo", "Team library", "MCP"],
  },
  publishedAt: "2026-08-09",
  modifiedAt: "2026-08-09",
  summary: [
    "A shared repository is the honest default. It costs nothing, every change goes through review and history, and every engineer already knows how it works. When the skills belong to the codebase your team works in every day, committing them is the right call.",
    "Skills Board is for the other case: the skills your team recommends live in other people's repositories, teammates run different agents, and nobody wants to grep a file tree to find the thing someone recommended in chat last month.",
    "The two are compatible. Keep the repo for skills that belong to your code, and use the library for the recommendations that come from everywhere else.",
  ],
  reasons: {
    title: "Why teams start looking past the shared repo",
    intro:
      "The repo pattern holds up until the recommendations stop coming from inside your own codebase.",
    points: [
      "Most recommended skills live in someone else's repository, so the shared repo turns into a list of links or a folder of copies.",
      "A copy stops matching upstream the moment upstream changes, and nobody notices until a teammate hits a difference.",
      "In Claude Code, project skills load from the .claude/skills directory of the repository the agent starts in, so a recommendation does not follow a teammate into a different project.",
      "Finding a skill means repository search or a hand-maintained README index, rather than searching by task or by a tag your team invented.",
      "Teammates who are not in that repository every day, including designers, writers, and product folks, never see the recommendation at all.",
    ],
  },
  comparison: {
    title: "Side by side",
    caption:
      "How a shared GitHub repository and Skills Board handle the same job.",
    rows: [
      {
        dimension: "What it holds",
        skillsBoard:
          "Entries that record each skill's original repository and path.",
        alternative:
          "The skill files themselves, committed to your repository, plus links or copies of skills from elsewhere.",
        sourceIds: ["claude-skills"],
      },
      {
        dimension: "Version you get",
        skillsBoard:
          "The latest version available from the saved source. Skills Board does not pin or preserve historical versions.",
        alternative:
          "The exact commit in your repository, with full history, diffs, and the ability to pin.",
        sourceIds: ["claude-skills"],
      },
      {
        dimension: "Finding a skill",
        skillsBoard:
          "Search across the team library, plus tags your team defines.",
        alternative:
          "Repository search, a README index, or an awesome-style curated list.",
        sourceIds: ["awesome"],
      },
      {
        dimension: "Reach for a teammate",
        skillsBoard:
          "One organization-scoped library, available whatever project the teammate is working on.",
        alternative:
          "Project skills load from .claude/skills in the repository where the agent starts and in parent directories up to the repository root.",
        sourceIds: ["claude-skills"],
      },
      {
        dimension: "Ways to use a saved skill",
        skillsBoard:
          "Open the original source, copy an install command, download a ZIP of the latest files, or connect a compatible agent over an authenticated MCP endpoint.",
        alternative:
          "Clone or pull the repository, or copy the files into the agent's own skills directory.",
        sourceIds: ["claude-skills"],
      },
      {
        dimension: "Review and history",
        skillsBoard:
          "A saved skill is a team recommendation, not a formal review, approval, or compatibility certification.",
        alternative:
          "Pull requests, required reviewers, and code owners, on the plans that include them.",
        sourceIds: ["gh-pricing"],
      },
      {
        dimension: "Access",
        skillsBoard:
          "Organization-scoped library, teammates join by invitation.",
        alternative: "GitHub repository and organization permissions.",
        sourceIds: ["gh-pricing"],
      },
      {
        dimension: "Cost",
        skillsBoard:
          "Free forever for the hosted product. MIT licensed and open source.",
        alternative:
          "The GitHub Free plan lists unlimited public and private repositories at $0 per month.",
        sourceIds: ["gh-pricing"],
      },
    ],
  },
  alternativeWins: {
    title: "When the shared repo is the better choice",
    intro:
      "Plenty of teams should keep committing skills and stop reading here.",
    points: [
      "The skills describe one codebase and belong next to it, so they should ship and version with the code.",
      "You want every edit to a skill reviewed in a pull request and kept in history.",
      "You need a pinned version. Skills Board follows the latest version available from the saved source.",
      "Everyone on the team works in the same repository with the same agent, so scope is not a problem.",
      "The skill contents cannot leave infrastructure you control. Skills Board is MIT licensed and can be self-hosted, but the hosted product stores your library.",
    ],
  },
  skillsBoardWins: {
    title: "When a shared library fits better",
    intro: "The signals that the repo has stopped being the right container.",
    points: [
      "The skills your team recommends come from many repositories rather than one.",
      "Teammates use different agents, so one install path does not cover everyone.",
      "People search by task or by a team tag, not by file path.",
      "You want a compatible agent to search the same team list over MCP instead of asking a person.",
      "You want teammates who never open a pull request to still find the recommendation.",
    ],
  },
  moveOver: {
    title: "Running both without duplicating work",
    intro:
      "Nothing needs to be deleted. This is the shortest path to a searchable list.",
    steps: [
      "List what the shared repo currently recommends, and note the original repository and path for anything that came from outside.",
      "Create a team library and save those skills from their original sources.",
      "Add the tags your team actually searches by, such as the workflow or the surface the skill belongs to.",
      "Invite your teammates. Each one picks the source link, the install command, or the ZIP that fits their agent.",
      "Keep committing the skills that belong to your codebase. They stay in the repo where they make sense.",
    ],
  },
  faq: [
    {
      question:
        "Do I have to stop keeping AI skills in a GitHub repository?",
      answer:
        "No. Skills that describe your own codebase belong in that codebase. Skills Board is for the recommendations that come from other repositories, where a copy would drift and a link would get lost.",
    },
    {
      question: "Does Skills Board store a copy of the skill files?",
      answer:
        "Skills Board records the original repository and path, and retrieves the latest files available from that source. A ZIP download contains the latest files available at download time.",
    },
    {
      question: "Can I pin a skill to a specific version?",
      answer:
        "No. Skills Board follows the latest version available from the saved source and does not pin or preserve historical versions. A repository with commit history is the better fit when a pinned version matters.",
    },
    {
      question: "Is Skills Board open source?",
      answer:
        "Yes. Skills Board is MIT licensed and the code is public on GitHub. The hosted product is free forever, and teams that want to run their own instance can.",
    },
  ],
  sources: [
    {
      id: "claude-skills",
      label: "Claude Code documentation, Skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "Skill locations, project skills committed to version control, and where skills load from.",
    },
    {
      id: "gh-pricing",
      label: "GitHub pricing",
      href: "https://github.com/pricing",
      note: "Free plan at $0 per month with unlimited public and private repositories, and the plans that include code owners and required reviewers.",
    },
    {
      id: "awesome",
      label: "Awesome lists on GitHub",
      href: "https://github.com/sindresorhus/awesome",
      note: "The curated README pattern teams copy when they build an internal skills index.",
    },
  ],
  related: [
    {
      label: "Share agent skills with your team",
      href: guidePaths.shareTeamSkills,
      description: "The practical steps behind a first shared library.",
    },
    {
      label: "Manage skills across Claude, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description: "What changes when teammates run different agents.",
    },
    {
      label: "Pricing",
      href: pricingPath,
      description: "Free forever, with the open-source code on GitHub.",
    },
  ],
}

const skillsSh: AlternativeDefinition = {
  path: alternativePaths.skillsSh,
  ctaLocation: "alternatives_skills_sh",
  subject: "skills.sh",
  subjectHref: "https://www.skills.sh",
  eyebrow: "Skills Board vs skills.sh",
  title: "Skills Board vs skills.sh",
  seoTitle: "skills.sh Alternative for Team Skill Libraries | Skills Board",
  socialTitle: "Skills Board vs skills.sh",
  description:
    "skills.sh is a public directory of agent skills with a leaderboard, packs, and a CLI. Compare it with Skills Board, the organization-scoped library for the smaller set of skills your own team recommends.",
  cardSummary:
    "A public directory with a leaderboard and packs, next to a private team library. Where each one belongs.",
  ogAlt: "Comparison of skills.sh and Skills Board for team AI skills.",
  og: {
    eyebrow: "Alternatives",
    title: [
      { text: "A public directory," },
      { text: "and your team's list.", accent: true },
    ],
    description:
      "How skills.sh and Skills Board compare for discovering skills and recording what your team recommends.",
    contextLabel: "skillsboard.sh/alternatives",
    chips: ["Directory", "Team library", "MCP"],
  },
  publishedAt: "2026-08-09",
  modifiedAt: "2026-08-09",
  summary: [
    "skills.sh is a public directory. It ranks skills by install count, installs any of them with npx skills add, and offers packs that bundle public skills, private files, and repository skills behind a single install command.",
    "Skills Board is the organization-scoped list of skills your own team decided to recommend, with search, team tags, the original source for every entry, and an authenticated MCP endpoint a compatible agent can query.",
    "These are different jobs, and they compose. Skills Board reads the public skills.sh catalog in Discover, so you can browse there and save what your team recommends here.",
  ],
  reasons: {
    title: "What sends people looking for something else",
    intro:
      "A directory answers what exists. It does not answer what your team recommends.",
    points: [
      "Leaderboard position is aggregate install count, not a judgement about whether a skill suits your team.",
      "A pack is unlisted rather than access-controlled, so anyone holding the URL can view and install it.",
      "Creating and managing packs requires signing in with Vercel, which not every team has.",
      "The directory has no place to record why your team picked one skill over the other four that do the same thing.",
      "Teammates who do not work from a CLI need somewhere to look that is not an install command.",
    ],
  },
  comparison: {
    title: "Side by side",
    caption:
      "Both are useful. This is which one answers which question.",
    rows: [
      {
        dimension: "What it is",
        skillsBoard:
          "An organization-scoped library of the skills your team recommends.",
        alternative:
          "A public directory of agent skills, described on its own site as the Agent Skills Directory, with topics, an official set, and security audits.",
        sourceIds: ["skills-home"],
      },
      {
        dimension: "How something gets listed",
        skillsBoard:
          "A teammate deliberately saves it to the team library.",
        alternative:
          "Skills appear on the leaderboard automatically through anonymous telemetry when people run npx skills add.",
        sourceIds: ["skills-faq"],
      },
      {
        dimension: "Grouping a set of skills",
        skillsBoard:
          "Collections inside your team library, plus team-defined tags.",
        alternative:
          "Packs, described as unlisted collections that can combine public skills, private files, and skills from GitHub repositories you can access.",
        sourceIds: ["skills-packs"],
      },
      {
        dimension: "Who can see the set",
        skillsBoard: "The teammates you invite to the organization.",
        alternative:
          "Packs are unlisted, not access-controlled: anyone with the pack URL can view and install it.",
        sourceIds: ["skills-packs"],
      },
      {
        dimension: "Account needed to create one",
        skillsBoard: "A free Skills Board account.",
        alternative: "Sign in with Vercel to own and manage packs.",
        sourceIds: ["skills-packs"],
      },
      {
        dimension: "Ways to use a skill",
        skillsBoard:
          "Original source, install command, ZIP of the latest files, or an authenticated MCP endpoint for a compatible agent.",
        alternative:
          "The skills CLI, with npx skills add owner/repo for a skill and npx skills add a pack URL for a pack.",
        sourceIds: ["skills-docs", "skills-packs"],
      },
      {
        dimension: "Programmatic access",
        skillsBoard:
          "An authenticated MCP endpoint, listed on the Official MCP Registry as io.github.TommyBez/skillsboard, with browser sign-in and no API key to copy.",
        alternative:
          "A REST API under /api/v1, authenticated with a Vercel project OIDC token.",
        sourceIds: ["skills-api"],
      },
      {
        dimension: "Safety posture",
        skillsBoard:
          "A saved skill is a team recommendation, not a formal security review, approval, or compatibility certification.",
        alternative:
          "Routine security audits with partner results per skill, alongside its own note that it cannot guarantee the quality or security of every listed skill.",
        sourceIds: ["skills-docs", "skills-api"],
      },
      {
        dimension: "Openness and cost",
        skillsBoard: "Free forever, MIT licensed, code public on GitHub.",
        alternative:
          "The skills CLI that powers the leaderboard is open source at github.com/vercel-labs/skills.",
        sourceIds: ["skills-docs"],
      },
    ],
  },
  alternativeWins: {
    title: "When skills.sh is the better choice",
    intro: "Reach for the directory when the question is about the ecosystem.",
    points: [
      "You are surveying what exists and want popularity signal. The leaderboard is built from aggregate install counts from the CLI.",
      "You want third-party audit results before installing a public skill. skills.sh publishes partner audit results per skill.",
      "You want one install command that works for anyone holding the link, including people outside your company, since installing a pack does not require a sign-in.",
      "Your whole team lives in the CLI and installs from it, so a browsable list is not what is missing.",
      "You are already a Vercel team and packs fit your existing accounts.",
    ],
  },
  skillsBoardWins: {
    title: "When a team library fits better",
    intro:
      "Skills Board starts from your team's judgement rather than the ecosystem's.",
    points: [
      "Your list is much smaller than the directory because it is only what your team recommends.",
      "You want the set scoped to invited teammates rather than reachable by anyone with a URL.",
      "You want to search by task and by tags your team invented, not by install count.",
      "You want a compatible agent to query the same team list over an authenticated MCP endpoint.",
      "You want the original source visible on every entry so a teammate can read it before using it.",
    ],
  },
  moveOver: {
    title: "Using both together",
    intro:
      "Skills Board reads the public skills.sh catalog in Discover, so this is additive.",
    steps: [
      "Keep browsing skills.sh for discovery, audits, and popularity signal.",
      "Create a team library and save the skills your team actually recommends, each one from its original source.",
      "Search the public catalog from inside Skills Board's Discover and save straight from there.",
      "Add team tags and a short note explaining why the skill made the list.",
      "Invite teammates, or connect a compatible agent over MCP so it can search the same list.",
    ],
  },
  faq: [
    {
      question: "Is Skills Board a replacement for skills.sh?",
      answer:
        "No. skills.sh is a public directory for discovering what exists across the ecosystem. Skills Board records the smaller set your own team recommends. Skills Board reads the public skills.sh catalog in Discover, so teams commonly use both.",
    },
    {
      question: "Is a Skills Board team library public?",
      answer:
        "No. A team library is scoped to your organization and teammates join by invitation.",
    },
    {
      question: "What can a connected agent do through Skills Board's MCP?",
      answer:
        "With the granted scopes, a compatible agent can list and search team skills and collections, retrieve install commands, discover public and repository skills, save new skills, and organize collections. It cannot edit or delete saved team skills, install them, or run them.",
    },
    {
      question: "What does Skills Board cost?",
      answer:
        "The hosted product is free forever, with no trial, credit card, or paid tier. The code is MIT licensed and open source.",
    },
  ],
  sources: [
    {
      id: "skills-home",
      label: "skills.sh homepage",
      href: "https://www.skills.sh",
      note: "The Agent Skills Directory, the leaderboard, topics, official set, and security audits.",
    },
    {
      id: "skills-docs",
      label: "skills.sh documentation",
      href: "https://www.skills.sh/docs",
      note: "The install command, how the leaderboard is ranked, routine security audits, the quality and security note, and the open-source CLI.",
    },
    {
      id: "skills-packs",
      label: "skills.sh packs documentation",
      href: "https://www.skills.sh/docs/packs",
      note: "Packs as unlisted collections, Vercel sign-in to manage them, and the note that packs are not access-controlled.",
    },
    {
      id: "skills-faq",
      label: "skills.sh FAQ",
      href: "https://www.skills.sh/docs/faq",
      note: "How skills reach the leaderboard through anonymous telemetry, and that installing a pack needs only the URL.",
    },
    {
      id: "skills-api",
      label: "skills.sh API reference",
      href: "https://www.skills.sh/docs/api",
      note: "Endpoints under /api/v1, Vercel OIDC authentication, and the per-skill security audit endpoint.",
    },
  ],
  related: [
    {
      label: "A shared MCP skill library for teams",
      href: guidePaths.sharedMcpSkillLibrary,
      description: "What an agent can actually do with the team library.",
    },
    {
      label: "Choose your team's first AI agent skill",
      href: guidePaths.chooseFirstTeamSkill,
      description: "Turning a directory find into a team recommendation.",
    },
    {
      label: "Pricing",
      href: pricingPath,
      description: "Free forever, with the open-source code on GitHub.",
    },
  ],
}

const smithery: AlternativeDefinition = {
  path: alternativePaths.smithery,
  ctaLocation: "alternatives_smithery",
  subject: "Smithery",
  subjectHref: "https://smithery.ai",
  eyebrow: "Skills Board vs Smithery",
  title: "Skills Board vs Smithery",
  seoTitle: "Smithery Alternative for Team AI Skill Libraries | Skills Board",
  socialTitle: "Skills Board vs Smithery",
  description:
    "Smithery is a public registry for MCP servers and skills with managed connections and auth. Compare it with Skills Board, a free, MIT-licensed library for the AI skills your own team recommends.",
  cardSummary:
    "A public registry with managed connections, next to a team-curated library. Two different problems.",
  ogAlt: "Comparison of Smithery and Skills Board for team AI skills.",
  og: {
    eyebrow: "Alternatives",
    title: [
      { text: "A public registry," },
      { text: "and a team library.", accent: true },
    ],
    description:
      "How Smithery and Skills Board compare for connecting agents and for recording what your team recommends.",
    contextLabel: "skillsboard.sh/alternatives",
    chips: ["Registry", "Team library", "MCP"],
  },
  publishedAt: "2026-08-09",
  modifiedAt: "2026-08-09",
  summary: [
    "Smithery is a public registry. It lists MCP servers and a browsable skills catalog, and it takes over the connection plumbing so an agent can reach a service without you wiring up OAuth and credentials.",
    "Skills Board does one narrower thing: it holds the skills your own team decided to recommend, scoped to the people you invite, with the original source visible on every entry.",
    "If your problem is connecting agents to third-party services, Smithery covers ground Skills Board does not. If your problem is that teammates cannot find what your team already recommends, that is the library.",
  ],
  reasons: {
    title: "Where the registry model stops answering the question",
    intro:
      "A public catalog is organised around what is published, not around what your team chose.",
    points: [
      "A large public listing tells you what exists, not which of those entries your colleagues actually use.",
      "Install counts rank the ecosystem's behaviour, not your team's.",
      "Publishing and distribution are the registry's centre of gravity, so there is nowhere to record the small set your team standardised on.",
      "Teammates using different agents still need a way to reach the same recommendation without adopting the same runtime.",
      "Nothing captures the note explaining why your team picked one skill and not the near-identical one next to it.",
    ],
  },
  comparison: {
    title: "Side by side",
    caption: "Two products with different centres of gravity.",
    rows: [
      {
        dimension: "Primary object",
        skillsBoard:
          "The skills your team recommends, saved from their original repository and path.",
        alternative:
          "MCP servers and skills published to a public registry, browsable at smithery.ai/servers and smithery.ai/skills.",
        sourceIds: ["smithery-home", "smithery-skills"],
      },
      {
        dimension: "Scope of the catalog",
        skillsBoard: "Your team's list, as short as your team keeps it.",
        alternative:
          "A public registry whose homepage invites you to browse more than 14,000 MCPs, plus a paginated public skills catalog.",
        sourceIds: ["smithery-home", "smithery-skills"],
      },
      {
        dimension: "Who curates",
        skillsBoard: "Your teammates, by saving what they recommend.",
        alternative:
          "Publishers, with skill pages showing publisher namespaces, badges, and install counts.",
        sourceIds: ["smithery-skills"],
      },
      {
        dimension: "Access",
        skillsBoard:
          "Organization-scoped library, teammates join by invitation.",
        alternative: "A public catalog anyone can browse.",
        sourceIds: ["smithery-skills"],
      },
      {
        dimension: "What the connection does",
        skillsBoard:
          "An authenticated MCP endpoint for reading the team library and, with the granted scopes, saving skills and organizing collections. It does not install or run skills.",
        alternative:
          "Managed connections to services: when a request needs auth, Smithery handles OAuth flows, credential injection, and retries automatically.",
        sourceIds: ["smithery-home"],
      },
      {
        dimension: "Ways to use a skill",
        skillsBoard:
          "Original source, install command, ZIP of the latest files, or a connected agent over MCP.",
        alternative:
          "The Smithery CLI, with commands such as npx smithery mcp add and npx smithery tool call.",
        sourceIds: ["smithery-home"],
      },
      {
        dimension: "Openness",
        skillsBoard:
          "MIT licensed, code public at github.com/TommyBez/skillsboard.",
        alternative:
          "Smithery Connect is powered by agent.pw, described on the homepage as its open-source agent vault.",
        sourceIds: ["smithery-home"],
      },
      {
        dimension: "Cost",
        skillsBoard:
          "Free forever for the hosted product. No trial, credit card, or paid tier.",
        alternative: "Smithery publishes plans on its pricing page.",
        sourceIds: ["smithery-pricing"],
      },
    ],
  },
  alternativeWins: {
    title: "When Smithery is the better choice",
    intro: "There is a clear set of jobs where the registry is the right tool.",
    points: [
      "Your problem is connecting agents to third-party services, and you want OAuth, credentials, and retries handled for you.",
      "You want the same connected accounts reused across chats, workflows, and different harnesses.",
      "You are publishing an MCP server and want distribution plus usage observability.",
      "You want to browse a large public registry of MCP servers rather than a short curated list.",
      "The bottleneck is authentication plumbing, not knowing which skill your colleagues recommend.",
    ],
  },
  skillsBoardWins: {
    title: "When a team library fits better",
    intro: "The library exists for a smaller, more human problem.",
    points: [
      "Teammates keep asking which skill to use and where the one you recommended lives.",
      "Your team runs a mix of agents, so one runtime or one install path does not cover everyone.",
      "You want the list scoped to invited teammates rather than published publicly.",
      "You want the original source visible on every entry, so people can read a skill before using it.",
      "You want free forever and MIT licensed, with the option to self-host the same code.",
    ],
  },
  moveOver: {
    title: "Running both",
    intro:
      "These sit at different layers, so most teams that need both simply keep both.",
    steps: [
      "Keep Smithery for the service connections your agents depend on.",
      "Create a Skills Board team library and save the skills your team recommends, each from its original source.",
      "Tag them the way your team searches, and add the note explaining why the skill made the list.",
      "Invite teammates so everyone starts from the same recommendation.",
      "Connect a compatible agent to Skills Board over MCP so it can search the team list without leaving the agent.",
    ],
  },
  faq: [
    {
      question: "Can I use Skills Board and Smithery together?",
      answer:
        "Yes. They solve different problems. Smithery focuses on connecting agents to services and on publishing to a public registry. Skills Board records the skills your own team recommends and makes them searchable for teammates and for a connected agent.",
    },
    {
      question: "Is Skills Board an MCP server?",
      answer:
        "Skills Board exposes an authenticated MCP endpoint and is listed on the Official MCP Registry as io.github.TommyBez/skillsboard. A compatible agent authorizes through the browser, so there is no API key to copy.",
    },
    {
      question: "Does Skills Board host or run skills?",
      answer:
        "No. It records the original repository and path, and offers the source link, an install command, or a ZIP of the latest files available at download time. It does not install or execute skills.",
    },
    {
      question: "What does Skills Board cost?",
      answer:
        "The hosted product is free forever, with no trial, credit card, or paid tier. The code is MIT licensed and open source.",
    },
  ],
  sources: [
    {
      id: "smithery-home",
      label: "Smithery homepage",
      href: "https://smithery.ai",
      note: "Connecting agents to tools and services, the count of browsable MCPs, managed auth and credential injection, the CLI, and agent.pw as the open-source vault.",
    },
    {
      id: "smithery-skills",
      label: "Smithery skills catalog",
      href: "https://smithery.ai/skills",
      note: "The public, paginated skills catalog with categories, publisher namespaces, badges, and install counts.",
    },
    {
      id: "smithery-pricing",
      label: "Smithery pricing",
      href: "https://smithery.ai/pricing",
      note: "The published plans page.",
    },
  ],
  related: [
    {
      label: "A shared MCP skill library for teams",
      href: guidePaths.sharedMcpSkillLibrary,
      description: "What a connected agent can do with the team library.",
    },
    {
      label: "Manage skills across Claude, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description: "Keeping one recommendation across mixed agent setups.",
    },
    {
      label: "Pricing",
      href: pricingPath,
      description: "Free forever, with the open-source code on GitHub.",
    },
  ],
}

/** Single registration point: pages, the index, JSON-LD, and the sitemap read this. */
export const alternatives = [githubRepo, skillsSh, smithery] as const

export const alternativesIndexModifiedAt = alternatives.reduce(
  (latest, entry) => (entry.modifiedAt > latest ? entry.modifiedAt : latest),
  "1970-01-01",
)

export const alternativesIndexDescription =
  "Honest comparisons between Skills Board and the other ways teams share AI skills: a shared GitHub repository, the skills.sh directory, and the Smithery registry."

export const alternativesIndexOg: OgTemplateContent = {
  eyebrow: "Alternatives",
  title: [
    { text: "Compare the ways" },
    { text: "teams share skills.", accent: true },
  ],
  description:
    "Skills Board next to a shared GitHub repository, skills.sh, and Smithery, including when each one is the better choice.",
  contextLabel: "skillsboard.sh/alternatives",
  chips: ["GitHub repo", "skills.sh", "Smithery"],
}

export const alternativesIndexOgAlt =
  "Skills Board alternatives, compared with a shared GitHub repository, skills.sh, and Smithery."

const alternativesByPath = new Map(
  alternatives.map((entry) => [entry.path, entry]),
)

export function getAlternative(path: AlternativePath): AlternativeDefinition {
  const entry = alternativesByPath.get(path)

  if (!entry) {
    throw new Error(`Missing alternative definition for ${path}`)
  }

  return entry
}
