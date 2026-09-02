import type { OgTemplateContent } from "@/lib/og/template"
import {
  agentSkillsAdoptionPath,
} from "@/lib/seo/agent-skills-adoption/types"
import {
  allDatapoints,
  crawlerDatapoints,
  crawlWindow,
  datapointColumns,
  datapointRows,
  ecosystemDatapoints,
  searchDatapoints,
} from "@/lib/seo/agent-skills-adoption/datapoints"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { manageAiSkillsPath } from "@/lib/seo/manage-ai-skills/types"
import { pricingPath } from "@/lib/seo/pricing-schema"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export {
  agentSkillsAdoptionPath,
  type AgentSkillsAdoptionCtaPlacement,
  type AgentSkillsAdoptionPath,
} from "@/lib/seo/agent-skills-adoption/types"

export interface AgentSkillsAdoptionSource {
  /** Stable key referenced by the sections and datapoints it backs. */
  id: string
  label: string
  href: string
  note: string
}

export interface AgentSkillsAdoptionFaqEntry {
  question: string
  answer: string
}

export interface AgentSkillsAdoptionRelatedLink {
  label: string
  href: string
  description: string
}

/**
 * One contextual link out of a section, rendered as a sentence. The href union
 * is the set of internal destinations this page is allowed to point at, so a
 * path that does not exist fails the build instead of shipping as a dead link.
 */
export interface AgentSkillsAdoptionInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentSkillsSupportPath
    | typeof bestClaudeSkillsPath
    | typeof claudeSkillsPath
    | typeof manageAiSkillsPath
    | typeof pricingPath
    | typeof whereToFindClaudeSkillsPath
  trail: string
}

/** One table of figures, with the prose and the sources behind it. */
export interface AgentSkillsAdoptionTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  link: AgentSkillsAdoptionInlineLink
  sourceIds: readonly string[]
}

export interface AgentSkillsAdoptionDefinition {
  path: typeof agentSkillsAdoptionPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentSkillsSupportPath
    | typeof manageAiSkillsPath
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
  method: {
    title: string
    intro: string
    body: readonly string[]
    steps: readonly string[]
    sourceIds: readonly string[]
  }
  ecosystem: AgentSkillsAdoptionTableSection
  crawlers: AgentSkillsAdoptionTableSection
  search: AgentSkillsAdoptionTableSection
  notDocumented: {
    title: string
    intro: string
    entries: readonly {
      title: string
      body: string
    }[]
    sourceIds: readonly string[]
  }
  reuse: {
    title: string
    intro: string
    body: readonly string[]
    link: AgentSkillsAdoptionInlineLink
    sourceIds: readonly string[]
  }
  faq: readonly AgentSkillsAdoptionFaqEntry[]
  sources: readonly AgentSkillsAdoptionSource[]
  related: readonly AgentSkillsAdoptionRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const agentSkillsAdoption: AgentSkillsAdoptionDefinition = {
  path: agentSkillsAdoptionPath,
  contentType: "article",
  topics: [
    "agent skills",
    "adoption data",
    "AI crawlers",
    "search visibility",
    "statistics",
  ],
  relatedGuidePaths: [
    agentSkillsPath,
    agentSkillsSupportPath,
    whereToFindClaudeSkillsPath,
  ],
  eyebrow: "Adoption data",
  title: "Agent skills adoption: the numbers",
  seoTitle: "Agent Skills Adoption: The Numbers | Skills Board",
  description:
    "Dated figures on agent skills adoption, each with the source beside it: 46 clients on the official showcase, 1,297,018 skills on the skills.sh leaderboard, and server logs where AI crawlers read one site 5.9 times more often than Googlebot and bingbot.",
  intro: [
    "Nobody publishes a census of agent skills. There is no registry every skill has to enter, no vendor reporting installs, and no survey of how many teams have written one. What exists instead is a set of partial counts, each measuring something narrow, each reproducible if you say plainly what it measures.",
    "This page collects those counts and adds three we can measure ourselves: what AI crawlers do to a small site's server logs, what the Google Search Console beta report says about impressions inside AI answers, and how one site's organic impressions moved between July and August 2026. Every figure carries the source and the day it was read.",
  ],
  answer:
    "As of September 2, 2026, the Agent Skills client showcase lists 46 agent products, the reference repository anthropics/skills holds 19 skills and has not changed since August 18, and the public skills.sh directory lists 1,297,018 skills that have been installed at least once. On skillsboard.sh over the seven days to September 2, named AI crawlers made 690 requests for page content against 117 from Googlebot and bingbot combined, a ratio of 5.9 to 1.",
  answerNotes: [
    "Two of those four figures come from public pages anyone can open. The third is a leaderboard whose count depends on install telemetry, and the fourth is one site's server log. None of them is a measure of how many agent skills exist, and this page does not claim one.",
    "Skills Board is the agent-native skills registry for teams: a web application where a team keeps, searches, and shares its AI skills. The figures below come from running that site, so the search and crawler numbers describe a small site with a few dozen pages, not the market.",
  ],
  answerSourceIds: [
    "agentskills-clients",
    "anthropic-skills-repo",
    "skills-sh",
    "posthog-log-drain",
  ],
  method: {
    title: "How each figure was produced",
    intro:
      "Four methods, in descending order of how easily you can reproduce them.",
    body: [
      "Anything on this page that describes the wider ecosystem comes from a public page or a public repository, so a reader can open the same source and get the same number on the same day. Anything that describes traffic or search comes from instrumentation on skillsboard.sh, which nobody else can open, so the method is written out below in enough detail to judge it.",
      "The page is dated at the top and refreshed monthly. A figure that cannot be read on refresh day is removed rather than carried forward, and every figure lives in a single typed data module in the open-source repository, so a reader can check what changed between two refreshes by reading one file's history.",
    ],
    steps: [
      "Showcase and repository counts: fetch the published page or clone the repository, count, and record the commit or the fetch date. The anthropics/skills count is folders containing a SKILL.md under skills/, read at commit 5304866.",
      "Directory count: read the total the skills.sh all-time leaderboard prints beside its own tab label. The number is theirs, the reading is ours, and its limits are stated in the section below.",
      "Crawler counts: server-side request logs from skillsboard.sh, delivered from Vercel to PostHog as one event per page-route invocation, classified by user agent string. Requests to /api/mcp and to /.well-known paths are excluded because they are protocol handshakes. Known monitoring agents and a Codex client stuck in an authentication retry loop are excluded by name.",
      "Search counts: the Search Console Search Analytics API for the property, queried per calendar month with dataState set to all so provisional days are included. The AI-feature impressions come from the separate Generative AI performance report, which has no API and was read in the interface on August 31, 2026.",
    ],
    sourceIds: [
      "posthog-log-drain",
      "vercel-log-drains",
      "gsc-search-analytics",
      "gsc-ai-report",
      "skillsboard-repo",
    ],
  },
  ecosystem: {
    title: "What the public sources count",
    intro:
      "Four figures from three public sources, and none of them answers how many agent skills exist.",
    columns: [...datapointColumns],
    rows: datapointRows(ecosystemDatapoints),
    notes: [
      "The showcase count is the most stable of the three sources and the least informative about usage: a vendor appears once its own documentation says it reads SKILL.md, and it stays there whether one user or a million use the feature. It is a supply-side number about clients, not a demand-side number about skills.",
      "The leaderboard count is the opposite. It moves with real installs, which makes it the closest public proxy for how many skills are in circulation, and it is also the figure most likely to be misread. It counts a skill from the first time anyone installs it through the command line tool, so a skill that a team keeps private or shares by copying a folder never appears at all, and a fork of a popular skill appears as its own entry.",
      "The reference repository is worth watching precisely because it barely moves. Anthropic publishes 19 skills there and published the same 19 two weeks earlier. Growth in this format is happening in other people's repositories, which is why a directory built on install telemetry finds more than a million entries while the first-party catalog finds nineteen.",
    ],
    link: {
      lead: "The showcase entries are unpacked client by client in",
      label: "which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      trail: ", with the directories each vendor documents.",
    },
    sourceIds: [
      "agentskills-clients",
      "agentskills-spec",
      "anthropic-skills-repo",
      "skills-sh",
      "skills-sh-api",
    ],
  },
  crawlers: {
    title: "Who reads a site about agent skills",
    intro: `Server-side request logs for skillsboard.sh over the seven days to September 2, 2026 (${crawlWindow.start} to ${crawlWindow.end}, UTC), classified by user agent.`,
    columns: [...datapointColumns],
    rows: datapointRows(crawlerDatapoints),
    notes: [
      "The split is the point. On a site whose subject is agent skills, the crawlers that feed AI answers ask for pages roughly six times as often as the two crawlers that feed classic search results, and one of them, the agent OpenAI sends when a user asks a live question, out-reads Googlebot and bingbot together on its own.",
      "The same measurement a week earlier gave 9.3 to 1. Both numbers are real and they disagree, which is what a single week of a single small site buys you. Publish the window with the ratio or the ratio means nothing.",
      "The excluded row matters more than the included ones. A single misconfigured client generated 23,365 requests in the same seven days, all of them authentication retries against the MCP endpoint and none of them a page. Server logs are full of traffic that looks like interest and is not, and a crawler statistic that does not say what it threw away is not a statistic.",
      "The pages these crawlers ask for are the explainers rather than the product pages: the home page took 177 requests, the Codex explainer 74, the resources hub 54, and the Claude skills explainer 42.",
    ],
    link: {
      lead: "The pages they read most are the format explainers, starting with",
      label: "the Agent Skills standard itself",
      href: agentSkillsPath,
      trail: ".",
    },
    sourceIds: ["posthog-log-drain", "vercel-log-drains"],
  },
  search: {
    title: "What search demand looks like from one small site",
    intro:
      "Google Search Console for skillsboard.sh. Small absolute numbers, stated as such, with the shape left visible.",
    columns: [...datapointColumns],
    rows: datapointRows(searchDatapoints),
    notes: [
      "A site that goes from 98 impressions to 3,919 in a month has multiplied by 40 and is still a small site. The multiple is worth publishing because the denominator is published beside it; quoted alone it would be marketing.",
      "The AI-feature figure is the one with no public equivalent anywhere else, and it is also the weakest. Google's report covers AI Overviews and AI Mode, gives impressions and nothing else, and is in beta. It cannot tell you whether a single person clicked through, and the concentration in the last ten days of August could be a change in how the site is indexed or a change in how the report samples.",
      "One page took half of the AI-feature impressions. That is what a long tail looks like before it is long: one explainer page that answers a head question, and fifteen others sharing the remainder.",
    ],
    link: {
      lead: "The page taking half of those impressions explains",
      label: "what a Claude skill is and how to write one",
      href: claudeSkillsPath,
      trail: ".",
    },
    sourceIds: ["gsc-search-analytics", "gsc-ai-report"],
  },
  notDocumented: {
    title: "What none of this measures",
    intro:
      "Five questions a reader might expect this page to answer, and the reason it does not.",
    entries: [
      {
        title: "How many agent skills exist",
        body: "No source counts them. The skills.sh leaderboard counts skills installed at least once through its own command line tool, which excludes every skill kept inside a company, every skill shared as a copied folder, and every skill installed by pointing an agent at a repository directly. It also counts forks as separate entries. Treat 1,297,018 as a floor on installed-and-public skills and as no kind of answer to how many have been written.",
      },
      {
        title: "How many people use agent skills",
        body: "No vendor publishes it. Anthropic, OpenAI, Cursor, and the rest document that their products read SKILL.md and report nothing about how often. The client showcase counts products, not seats. Any figure you see for users of agent skills is currently either a vendor's private number or somebody's estimate, and this page has neither.",
      },
      {
        title: "Whether AI crawlers turn into readers",
        body: "The crawler figures count requests to a server, not people. A request from ChatGPT-User means somebody asked a question that caused a fetch, which is closer to a reader than a Googlebot request is, but the log cannot say whether the answer was used, cited, or seen. The Search Console AI report is the nearest thing to a citation signal and it has no click column, so the two halves of the question cannot be joined with anything we can measure.",
      },
      {
        title: "Whether any of this generalizes",
        body: "It should not be assumed to. The traffic and search figures come from one site of a few dozen pages, published in 2026, on a subject that AI crawlers have an obvious reason to fetch. A site about something else, or a larger site, would very likely see a different ratio. The reason to publish these anyway is that almost nobody publishes server-side crawler splits at all, and a small honest number beats an absent one.",
      },
      {
        title: "How many teams share skills with each other",
        body: "This is the question our own product exists for and the one we can say least about. We know what happens inside libraries on skillsboard.sh and will not publish user data to make a statistic. Nothing public measures it either: no vendor reports team-level skill sharing, and a repository of skills in a private organization is invisible to every counting method on this page.",
      },
    ],
    sourceIds: [
      "skills-sh",
      "skills-sh-api",
      "agentskills-clients",
      "posthog-log-drain",
      "gsc-ai-report",
    ],
  },
  reuse: {
    title: "Citing these figures",
    intro:
      "The numbers are free to reuse. The conditions are the ones that keep them useful.",
    body: [
      "Quote a figure with the date beside it and name what it counts. A crawler ratio without its window, or the leaderboard total presented as the number of agent skills that exist, is worse than no figure, and it is the misreading this page is written to prevent.",
      "Link to this page rather than copying the table, because the table changes. It is refreshed monthly, figures that stop being readable are removed rather than aged, and the data module behind it is in the open-source repository with its full history.",
      "If you need something this page does not have, ask. We hold server-side crawler logs for skillsboard.sh with no retention limit and can usually answer a narrow question about which agents read what.",
    ],
    link: {
      lead: "Skills Board is free forever and open source, and its terms are on",
      label: "the pricing page",
      href: pricingPath,
      trail: ".",
    },
    sourceIds: ["skillsboard-repo", "posthog-log-drain"],
  },
  faq: [
    {
      question: "How many agent skills are there?",
      answer:
        "No source counts them. The nearest public figure is the skills.sh leaderboard, which listed 1,297,018 skills on September 2, 2026, but it counts only skills installed at least once through its own command line tool and counts forks separately. Private and hand-copied skills are invisible to it.",
    },
    {
      question: "How many products support agent skills?",
      answer:
        "The Client Showcase published alongside the Agent Skills specification listed 46 agent products on September 2, 2026. Vendors list themselves there, so it reflects declared support rather than tested behavior, and it says nothing about how many people use the feature in each product.",
    },
    {
      question: "How many skills does Anthropic publish?",
      answer:
        "Nineteen, in the anthropics/skills repository, counted as folders containing a SKILL.md under the skills directory at commit 5304866 on September 2, 2026. A twentieth SKILL.md is a template scaffold. The same 19 were there on August 18, so the reference catalog is stable rather than growing.",
    },
    {
      question: "Do AI crawlers read more than Google on a skills site?",
      answer:
        "On skillsboard.sh over the seven days to September 2, 2026, eleven named AI crawlers made 690 requests for page content against 117 from Googlebot and bingbot combined. That is 5.9 to one. The same measurement a week earlier gave 9.3 to one, so treat it as one site's week rather than a rate.",
    },
    {
      question: "Which AI crawler reads the most?",
      answer:
        "ChatGPT-User, the agent OpenAI sends when a person asks something that needs a live page, made 322 of the 690 AI crawler requests in the seven days to September 2, 2026. PerplexityBot followed with 113, then OAI-SearchBot with 84 and Amazonbot with 73. Claude-User and GPTBot barely appear.",
    },
    {
      question: "Can I cite these agent skills statistics?",
      answer:
        "Yes, with attribution to Skills Board and the date beside the figure. Every number here names its source and the day it was read. Please link to this page instead of copying the table, because it is refreshed monthly and figures that stop being readable are removed rather than aged.",
    },
  ],
  sources: [
    {
      id: "agentskills-clients",
      label: "Agent Skills Client Showcase",
      href: "https://agentskills.io/clients",
      note: "The list of agent products that support the format, published with the specification. Counted on September 2, 2026.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The format the counted clients implement, and what a skill has to contain to be one.",
    },
    {
      id: "anthropic-skills-repo",
      label: "anthropics/skills on GitHub",
      href: "https://github.com/anthropics/skills",
      note: "Anthropic's reference repository. Counted at commit 5304866 on September 2, 2026.",
    },
    {
      id: "skills-sh",
      label: "skills.sh leaderboard",
      href: "https://www.skills.sh/",
      note: "The public directory run by Vercel. The all-time total printed beside its own tab label, read on September 2, 2026.",
    },
    {
      id: "skills-sh-api",
      label: "skills.sh API reference",
      href: "https://www.skills.sh/docs/api",
      note: "States that the leaderboard counts installs and flags forks and copies with an isDuplicate field, which is why the total is a floor rather than a census.",
    },
    {
      id: "posthog-log-drain",
      label: "PostHog Vercel log drain source",
      href: "https://posthog.com/docs/cdp/source_webhooks/source-vercel-log-drain",
      note: "How the server-side request logs behind the crawler figures are collected. One event per page-route invocation, so the counts are a floor.",
    },
    {
      id: "vercel-log-drains",
      label: "Vercel log drains",
      href: "https://vercel.com/docs/log-drains",
      note: "The delivery mechanism on the other side, and the reason these requests are visible at all when client-side analytics never sees a crawler.",
    },
    {
      id: "gsc-search-analytics",
      label: "Search Console Search Analytics API",
      href: "https://developers.google.com/webmaster-tools/v1/searchanalytics/query",
      note: "The method behind the monthly impression figures, queried with dataState set to all so provisional days are included.",
    },
    {
      id: "gsc-ai-report",
      label: "Search Console Generative AI performance report",
      href: "https://support.google.com/webmasters/answer/16984139",
      note: "Google's own description of the beta report: impressions in AI Overviews and AI Mode, no clicks, no queries, no API. Read in the interface on August 31, 2026.",
    },
    {
      id: "skillsboard-repo",
      label: "Skills Board source on GitHub",
      href: "https://github.com/TommyBez/skillsboard",
      note: "The open-source application these figures come from, including the data module that holds every number on this page.",
    },
  ],
  related: [
    {
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      description:
        "What the specification defines, which agents implement it, and where each one looks on disk.",
    },
    {
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      description:
        "The showcase entries as a compatibility matrix, with the directories each vendor documents.",
    },
    {
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      description:
        "The catalogs and repositories the counts on this page draw from, and what each one screens.",
    },
    {
      label: "Manage AI skills across your organization",
      href: manageAiSkillsPath,
      description:
        "What each vendor's distribution mechanism covers, and the selection layer none of them records.",
    },
    {
      label: "Best Claude skills: a curated register",
      href: bestClaudeSkillsPath,
      description:
        "A worked example of counting carefully: entries read one by one against stated criteria.",
    },
    {
      label: "How to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      description:
        "The frontmatter fields and description rules behind every skill any of these sources counts.",
    },
  ],
  og: {
    eyebrow: "Adoption data",
    title: [
      { text: "Agent skills adoption:" },
      { text: "the numbers", accent: true },
    ],
    description:
      "46 clients on the official showcase, 1,297,018 skills on the public leaderboard, and AI crawlers reading one site 5.9x more than Google and Bing.",
    contextLabel: "skillsboard.sh",
    chips: ["Sourced", "Dated", "Refreshed monthly"],
    footnote: "Data as of September 2, 2026",
    variant: "ink",
  },
  ogAlt:
    "Agent skills adoption: the numbers, a dated statistics page from Skills Board with the source beside every figure.",
  publishedAt: "2026-09-02",
  modifiedAt: "2026-09-02",
}

/** Guard: every datapoint has to point at a source the page lists. */
const sourceIds = new Set(agentSkillsAdoption.sources.map((source) => source.id))

for (const datapoint of allDatapoints) {
  if (!sourceIds.has(datapoint.sourceId)) {
    throw new Error(
      `Datapoint ${datapoint.id} cites an unknown source: ${datapoint.sourceId}`,
    )
  }
}

export { allDatapoints, crawlWindow }
