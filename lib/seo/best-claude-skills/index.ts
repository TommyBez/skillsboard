import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { alternativePaths } from "@/lib/seo/alternatives"
import { anthropicSkillsPath } from "@/lib/seo/anthropic-skills/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { type ComparePath, comparePaths } from "@/lib/seo/compare/types"
import { coworkSkillsPath } from "@/lib/seo/cowork-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export {
  bestClaudeSkillsPath,
  type BestClaudeSkillsCtaPlacement,
  type BestClaudeSkillsPath,
} from "@/lib/seo/best-claude-skills/types"

export interface BestClaudeSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface BestClaudeSkillsFaqEntry {
  question: string
  answer: string
}

export interface BestClaudeSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/**
 * One contextual link out of a section, rendered as a sentence. Same contract
 * as a guide's inline link, widened by the comparison paths, so an internal
 * path that does not exist fails the build instead of shipping as a dead link.
 */
export interface BestClaudeSkillsInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | ComparePath
    | typeof agentSkillsPath
    | typeof anthropicSkillsPath
    | typeof claudeSkillsPath
    | typeof coworkSkillsPath
    | typeof whereToFindClaudeSkillsPath
  trail: string
}

/** One entry of the register: a skill we opened, in a three column row. */
export interface BestClaudeSkillsTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  link: BestClaudeSkillsInlineLink
  sourceIds: readonly string[]
}

export interface BestClaudeSkillsDefinition {
  path: typeof bestClaudeSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsPath
    | typeof anthropicSkillsPath
    | typeof claudeSkillsPath
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
  /** Answer-first summary of the selection, sized for extraction. */
  answer: string
  answerNotes: readonly string[]
  answerSourceIds: readonly string[]
  method: {
    title: string
    intro: string
    criteria: readonly {
      label: string
      body: string
    }[]
    notes: readonly string[]
    link: BestClaudeSkillsInlineLink
    sourceIds: readonly string[]
  }
  engineering: BestClaudeSkillsTableSection
  interfaces: BestClaudeSkillsTableSection
  delivery: BestClaudeSkillsTableSection
  authoring: BestClaudeSkillsTableSection
  dropped: {
    title: string
    intro: string
    entries: readonly {
      title: string
      body: string
    }[]
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
  team: {
    title: string
    intro: string
    body: readonly string[]
    paths: readonly {
      label: string
      body: string
    }[]
    limits: readonly string[]
    link: BestClaudeSkillsInlineLink
    sourceIds: readonly string[]
  }
  faq: readonly BestClaudeSkillsFaqEntry[]
  sources: readonly BestClaudeSkillsSource[]
  related: readonly BestClaudeSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const bestClaudeSkills: BestClaudeSkillsDefinition = {
  path: bestClaudeSkillsPath,
  contentType: "article",
  topics: [
    "best claude skills",
    "claude skills list",
    "claude code skills",
    "skill selection",
  ],
  relatedGuidePaths: [
    anthropicSkillsPath,
    whereToFindClaudeSkillsPath,
    claudeSkillsPath,
    guidePaths.chooseFirstTeamSkill,
  ],
  eyebrow: "Best Claude Skills",
  title: "Best Claude skills: a register with the criteria behind it",
  seoTitle:
    "Best Claude Skills: A Register With the Criteria Behind It | Skills Board",
  description:
    "Twenty-seven Claude skills that cleared a stated bar, grouped by the job they do, each read from its own SKILL.md on August 19, 2026. Includes the seven criteria we applied, what every entry is licensed under, and the nine popular things we dropped and why.",
  intro: [
    "Almost every list that answers this query is a pile of repository links. The links are usually real and the ordering is usually nothing: no stated bar, no sign that anybody opened the files, and no account of what was left out. This page is the other shape. It says what a skill had to clear, it lists the twenty-seven that cleared it, and it names the nine popular things we removed and the reason for each.",
    "Everything below was read on August 19, 2026 from the skill's own SKILL.md, its repository license file, and the GitHub API, not from a directory blurb or another list. Where a number appears it comes from a named source on that date, and where nothing is published we say so rather than fill the gap. The register is grouped by the job the skill does, because a ranked one to twenty-seven would imply a comparison nobody can make between a PDF toolkit and a debugging discipline.",
    "This page is a selection. It is not the map of where skills come from, which is what our page on where to find Claude skills is for, it is not a definition of the format, which lives on our Claude skills page, and it is not the first-party catalog, which lives on our Anthropic skills page. Nothing here repeats those.",
  ],
  answer:
    "There is no measured ranking of Claude skills, because nobody publishes per-skill quality data. What can be done honestly is a selection against a stated bar. Ours had seven criteria, the strictest being that we opened the SKILL.md and that the skill has a license we can name. Twenty-seven skills cleared it, from Anthropic, Vercel, Supabase, Prisma, NVIDIA, shadcn, Jesse Vincent, Matt Pocock, Emil Kowalski, Hassan El Mghari, and Ahmad Othman Ammar Adi.",
  answerNotes: [
    "The bar removed things that a popularity list would have kept. The caveman skill had 445.0K installs on the skills.sh leaderboard and 99,212 stars on the day we read it, and it is not here, because GitHub reports its license as NOASSERTION and we could not name the terms. Five of the nine skill folders Vercel publishes are not here either, for the same reason: their frontmatter states no license and the repository carries no license file anywhere in its tree.",
    "The bar also let in things a popularity list would have missed. Prisma's nine skill folders sat at fifty-three repository stars when we read the API, next to obra/superpowers at 274,156. Stars measure a repository's attention, not a skill's usefulness, and a vendor writing down how its own product works is one of the few cases where the author is unambiguously the right one.",
    "One thing is worth saying before the list rather than after it. A skill hands an agent new instructions and, often, executable scripts. Reading the SKILL.md is the minimum, and it is what we did; it is not a security review, and this page is not one. Claude Code's own documentation is the reference for how a skill loads and what its frontmatter can ask for.",
  ],
  answerSourceIds: [
    "anthropic-skills-repo",
    "superpowers",
    "mattpocock-skills",
    "skills-sh-leaderboard",
  ],
  method: {
    title: "The seven things a skill had to clear",
    intro:
      "Read this before the register, because it is the part every other list of best Claude skills leaves out. These are pass or fail, applied in order, and the fourth and sixth are the ones that did most of the removing.",
    criteria: [
      {
        label: "1. We opened the SKILL.md",
        body: "Every description in the register below paraphrases the skill's own frontmatter and body, read from raw.githubusercontent.com on August 19, 2026. No entry is summarised from a README, a directory listing, or another list. Where a skill's README and its SKILL.md disagree, the register follows the SKILL.md and says so.",
      },
      {
        label: "2. One nameable job",
        body: "The skill folder describes a single procedure with a stated trigger, so it can be explained in a sentence and a reader can tell when it should fire. A folder that is really a table of contents for two hundred other folders is a source, and sources belong on a different page.",
      },
      {
        label: "3. A license we can name",
        body: "Either a license file we could open at the repository root or inside the skill folder, or a license field in the SKILL.md frontmatter. NOASSERTION, meaning GitHub found a license file it could not identify, does not clear this. Neither does an empty license field on a repository with no license file.",
      },
      {
        label: "4. Maintained within ninety days",
        body: "The repository received a push in the ninety days before August 19, 2026. This is a blunt instrument and we say so in the limits section: a repository can be pushed daily while one skill folder sits untouched, and no directory publishes a per-skill modification date a reader can check.",
      },
      {
        label: "5. A publisher you can identify",
        body: "A named company, or a named person with other public work under the same account. Every entry below names who ships it. Anonymity is not evidence of anything, but a skill is instructions an agent will follow, and knowing whose instructions they are is part of the decision.",
      },
      {
        label: "6. Public and free to install",
        body: "The files are readable in a public repository with no account, no waitlist, no form, and no paid tier gating the skill itself. If we could not read every file in the folder from a browser, the skill is not in the register.",
      },
      {
        label: "7. Portable enough to say where it runs",
        body: "The folder is a plain SKILL.md skill rather than a wrapper around one product's proprietary runner, so we can say which surfaces read it. That is a statement about the format, not a compatibility test, and the limits section keeps that distinction.",
      },
    ],
    notes: [
      "Popularity is not on the list, and that is deliberate. The one public install number in this space comes from skills.sh, whose FAQ says the leaderboard is anonymous telemetry from its own CLI, counting runs of npx skills add. It does not count a plugin install, a git clone, a copied folder, or a single invocation of the skill afterwards. It is a useful discovery signal and a poor quality signal, so we use it as colour in the notes and never as a reason to include something.",
      "Stars are not on the list either, for a sharper reason: GitHub counts stars per repository, and skills ship in folders. obra/superpowers holds fourteen skills behind one star count. anthropics/skills holds nineteen. Nothing tells you which folder earned the attention, so a list ordered by stars is ordering repositories while claiming to order skills.",
      "The register is grouped rather than ranked. Four groups, in the order most teams meet them: engineering workflow, interface work, documents and data, and skills for writing skills. Within a group the order is not a ranking either. If a page tells you the third best Claude skill, ask what it measured.",
    ],
    link: {
      lead: "For a scorecard that turns these criteria into something a team can repeat on a candidate we never saw, see",
      label: "How to choose the first AI agent skill for your team",
      href: guidePaths.chooseFirstTeamSkill,
      trail: ".",
    },
    sourceIds: [
      "skills-sh-faq",
      "skills-sh-leaderboard",
      "claude-code-skills",
      "anthropic-skills-repo",
    ],
  },
  engineering: {
    title: "Engineering workflow: the nine that changed how a session runs",
    intro:
      "This is the group the query best Claude Code skills is usually reaching for. What these nine have in common is that they constrain the agent rather than teach it a subject: each one puts a gate somewhere a session normally rushes.",
    columns: [
      "Skill",
      "What its SKILL.md says it does",
      "Publisher, license, where it runs",
    ],
    rows: [
      {
        label: "brainstorming",
        cells: [
          "Refuses to start building until the idea has become a design. Its description makes it mandatory before any creative work, and the file carries a hard gate: no implementation skill, no code, no scaffolding until the agent has said what it intends and a person has approved it. It classifies the request first and says the classification out loud, then takes a short or long path to the design.",
          "Jesse Vincent, in obra/superpowers. MIT at the repository root and MIT again in the plugin manifest. The README documents install paths for fourteen harnesses, Claude Code, Codex, Cursor, and Gemini CLI among them. 274,156 stars and a push the day we read it.",
        ],
      },
      {
        label: "test-driven-development",
        cells: [
          "States one rule and refuses to bend it: no production code without a failing test first. If code was written before the test, the file says delete it rather than keep it as reference or adapt it. It scopes itself to new features, bug fixes, refactors, and behaviour changes, and names throwaway prototypes, generated code, and config as the cases to raise with a person.",
          "Jesse Vincent, in obra/superpowers, MIT. The same skill appears on the skills.sh leaderboard at 202.1K CLI installs, which is the whole repository's fourth most installed folder rather than a quality reading.",
        ],
      },
      {
        label: "systematic-debugging",
        cells: [
          "Blocks fixes until a root cause exists. The file calls a symptom fix a failure and sets four phases the agent works through before proposing anything, with an explicit note that it applies hardest under time pressure, when a quick fix looks obvious, and when a previous fix did not hold.",
          "Jesse Vincent, in obra/superpowers, MIT. 230.0K installs on skills.sh on the day we read the leaderboard.",
        ],
      },
      {
        label: "verification-before-completion",
        cells: [
          "Fires before the agent claims anything is complete, fixed, or passing. It requires fresh verification output in the current message before a success claim, a commit, or a pull request. Included because unverified completion claims are the failure mode most agent sessions actually have.",
          "Jesse Vincent, in obra/superpowers, MIT. 182.7K installs on skills.sh.",
        ],
      },
      {
        label: "code-review",
        cells: [
          "Reviews the diff between HEAD and a point you name along two axes at once: whether the code follows the repository's documented standards, and whether it matches what the originating issue or spec asked for. It runs both reviews in parallel subagents and reports them side by side rather than merging them into one verdict.",
          "Matt Pocock, in mattpocock/skills. MIT at the repository root. Folders under skills/engineering, so any agent that scans a skills directory reads it. 223,471 stars and a push the day we read it.",
        ],
      },
      {
        label: "diagnosing-bugs",
        cells: [
          "A phased diagnosis loop for hard bugs and performance regressions, triggered when something is broken, throwing, failing, or slow. Notable for a redaction step written into the skill itself: because it has the agent show commands, outputs, and captured artifacts, it tells the agent to replace every secret before it does.",
          "Matt Pocock, in mattpocock/skills, MIT. It also tells the agent to read a CONTEXT.md if the repository has one, which is a small example of a skill deferring to project context instead of assuming it.",
        ],
      },
      {
        label: "research",
        cells: [
          "Sends a background agent to investigate a question against primary sources, official docs, source code, specs, and first-party APIs rather than a write-up of them, following every claim back to the source that owns it, and writes the findings to a Markdown file in the repository so the answer outlives the session.",
          "Matt Pocock, in mattpocock/skills, MIT. 332.3K installs on skills.sh when we read the leaderboard.",
        ],
      },
      {
        label: "planning-with-files",
        cells: [
          "Keeps the plan on disk instead of in the context window. It maintains task_plan.md, findings.md, and progress.md so a multi-step job survives a compaction or a /clear, and its frontmatter declares hooks that re-inject the plan on each user prompt and before tool calls. It also declares allowed-tools, so you can see what it wants before installing it.",
          "Ahmad Othman Ammar Adi, in OthmanAdi/planning-with-files, MIT. The repository ships the same skill under twelve agent-specific directories, .codex, .cursor, .gemini, and .opencode among them, plus five translations.",
        ],
      },
      {
        label: "webapp-testing",
        cells: [
          "Drives a local web application with Playwright to check frontend behaviour, capture screenshots, and read browser logs. It tells the agent to run its helper scripts with --help rather than read their source, on the grounds that a large script eats the context window the skill exists to save.",
          "Anthropic, in anthropics/skills. Apache 2.0 in the folder's own LICENSE.txt, which is unusual: almost nobody else licenses per folder. 135.9K installs on skills.sh.",
        ],
      },
    ],
    notes: [
      "Five of these nine come from one repository, and that is a finding rather than an oversight. obra/superpowers is not a bag of tips; it is one methodology split into skills that call each other, so brainstorming hands off to writing-plans, which hands off to subagent-driven-development, which calls requesting-code-review. Installing one of the five without the others gets you a gate with nothing behind it, and the repository's own using-superpowers skill exists to wire them together.",
      "Matt Pocock's three are the opposite shape and pair well with it: each is self-contained and assumes nothing about the rest of the folder. If you want one skill rather than a methodology, that is the collection to read first. Note that the repository also has a skills/in-progress directory whose contents we left out, because the author's own folder name says they are not finished.",
      "webapp-testing is the only Anthropic entry in this group, and it is here for a specific reason: it is the clearest published example of a skill that ships executable scripts and tells the agent how to treat them. If you are writing a skill with a scripts folder, read that file before you write yours.",
    ],
    link: {
      lead: "For where each of these lands on disk once you install it, and the difference between a personal, project, plugin, and managed install, see",
      label: "How to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      trail: ".",
    },
    sourceIds: [
      "superpowers",
      "mattpocock-skills",
      "planning-with-files",
      "anthropic-skills-repo",
    ],
  },
  interfaces: {
    title: "Interface work: the eight that make generated UI look made",
    intro:
      "The most crowded category and the one where a bad pick is most visible. Four of these eight come from Vercel, and there is a license story in that which the dropped section finishes.",
    columns: [
      "Skill",
      "What its SKILL.md says it does",
      "Publisher, license, where it runs",
    ],
    rows: [
      {
        label: "frontend-design",
        cells: [
          "Aesthetic direction for new or reshaped UI: palette, typography, and choices that do not read as templated defaults. The file frames the agent as the design lead at a small studio whose client has already rejected proposals for feeling generic, and asks for a deliberate point of view rather than a safe one.",
          "Anthropic, in anthropics/skills, Apache 2.0 in the folder. It sat third on the skills.sh all-time leaderboard at 794.6K CLI installs on August 19, 2026, the highest-placed first-party skill on that board.",
        ],
      },
      {
        label: "vercel-react-best-practices",
        cells: [
          "React and Next.js performance rules from Vercel's engineering team, ordered by impact across eight categories, from eliminating waterfalls and bundle size at the top down to JavaScript micro-optimizations. The repository README says it holds forty or more rules; the SKILL.md itself says seventy. We follow the file.",
          "Vercel, in vercel-labs/agent-skills. MIT, declared in the SKILL.md frontmatter, because the repository has no license file anywhere in its tree. 645.4K installs on skills.sh.",
        ],
      },
      {
        label: "vercel-composition-patterns",
        cells: [
          "Composition patterns for React components that have grown a boolean prop for every variation: compound components, lifting state, render props, context providers, and the React 19 API changes that affect them. Aimed at the refactor rather than the greenfield component.",
          "Vercel, in vercel-labs/agent-skills. MIT in the frontmatter, again with no repository license file behind it. 295.6K installs on skills.sh.",
        ],
      },
      {
        label: "vercel-react-view-transitions",
        cells: [
          "Implementing the browser's native view transitions in React: the ViewTransition component, addTransitionType, and the CSS view transition pseudo-elements, with the split between declaring what animates, triggering when, and controlling how in CSS. It notes that unsupported browsers skip the animation rather than break.",
          "Vercel, in vercel-labs/agent-skills, MIT in the frontmatter.",
        ],
      },
      {
        label: "vercel-react-native-skills",
        cells: [
          "React Native and Expo practice for mobile: list performance, animations, and native module work, with triggers written for tasks that mention React Native, Expo, mobile performance, or native platform APIs.",
          "Vercel, in vercel-labs/agent-skills, MIT in the frontmatter. 190.5K installs on skills.sh.",
        ],
      },
      {
        label: "hallmark",
        cells: [
          "A design skill aimed squarely at UI that looks generated. Its stated differentiator is structural variety rather than visual variety: two pages built with it should not share a layout skeleton. It covers greenfield pages, audits, redesigns, and extracting a design direction from a URL or a screenshot, and it says it is opinionated and short on purpose.",
          "Hassan El Mghari, in Nutlope/hallmark, MIT at the repository root. Written for Claude Code, Cursor, and Codex. 25,785 stars, last pushed August 6, 2026, inside the ninety-day window with room to spare.",
        ],
      },
      {
        label: "review-animations",
        cells: [
          "Reviews animation and motion code against one person's craft bar and nothing else. It declines general code review by design and points elsewhere when asked for it. Its frontmatter sets disable-model-invocation, so the agent cannot decide to run it: you invoke it, which is the right default for a skill whose output is an opinion.",
          "Emil Kowalski, in emilkowalski/skills, MIT. 108.1K installs on skills.sh. The same folder holds ten more motion and design skills under the same license.",
        ],
      },
      {
        label: "shadcn",
        cells: [
          "Adds, searches, fixes, styles, and composes shadcn/ui components, and supplies the project context, component docs, and usage examples an agent would otherwise guess at. It triggers on any project with a components.json, on registry and preset work, and on shadcn init.",
          "shadcn, in the shadcn-ui/ui repository, MIT. Its frontmatter is the one to copy: user-invocable is false, and allowed-tools is restricted to three specific shadcn CLI invocations rather than a blanket Bash permission.",
        ],
      },
    ],
    notes: [
      "Two entries here are worth reading as frontmatter examples rather than as design advice. shadcn narrows allowed-tools to three exact commands, and review-animations turns off model invocation entirely. Both are the author deciding, in the file, how much rope the agent gets. Most skills we read decide nothing and inherit whatever the session already allows.",
      "The Vercel four are the strongest case in this register for reading the license field rather than the repository. Nine skill folders sit in vercel-labs/agent-skills; four state MIT in their own frontmatter and five state nothing, and there is no license file anywhere in the tree to fall back on. Same publisher, same repository, same day, two different answers to the question of what you are allowed to do with the file.",
      "frontend-design placing third on a leaderboard of over a million tracked skills is the single strongest popularity signal in this register, and it still is not why it is here. It is here because we read it and it does one job well. The install number is context, and the limits section says exactly what that number can and cannot mean.",
    ],
    link: {
      lead: "For the first-party folder frontend-design belongs to, all nineteen skills in it with their licenses, and the three separate sets Anthropic ships, see",
      label: "Anthropic skills: every first-party skill and where it loads",
      href: anthropicSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "anthropic-skills-repo",
      "vercel-agent-skills",
      "hallmark",
      "emilkowalski-skills",
      "shadcn-ui",
      "skills-sh-leaderboard",
    ],
  },
  delivery: {
    title: "Documents and data: the five that touch real files",
    intro:
      "The group that produces something a colleague opens, and the group with the most license variation. Two of these five are not open source, and their own license file is explicit about it.",
    columns: [
      "Skill",
      "What its SKILL.md says it does",
      "Publisher, license, where it runs",
    ],
    rows: [
      {
        label: "pdf",
        cells: [
          "The broadest file-handling skill in the register: reading and extracting text and tables, merging, splitting, rotating, watermarking, creating, filling forms, encrypting and decrypting, extracting images, and running OCR over scans to make them searchable. Its description tells the agent to fire on any mention of a .pdf file.",
          "Anthropic, in anthropics/skills. Not open source. The folder's LICENSE.txt opens with all rights reserved and governs use by your agreement with Anthropic, and the frontmatter states the license as proprietary. 181.4K installs on skills.sh.",
        ],
      },
      {
        label: "docx",
        cells: [
          "Creating, reading, editing, and reorganising Word documents and templates: tables of contents, headings, page numbers, letterheads, image insertion and replacement, find and replace, and working with tracked changes and comments.",
          "Anthropic, in anthropics/skills, under the same proprietary folder license as pdf, pptx, and xlsx. 174.0K installs on skills.sh. Anthropic also runs equivalents as pre-built skill_ids on the API, which are a different artifact from these folders.",
        ],
      },
      {
        label: "supabase-postgres-best-practices",
        cells: [
          "Postgres practice maintained by Supabase for Postgres running anywhere, not only on Supabase. Its description tells the agent to load it before touching schema, column types, migrations, RLS policies, indexes, triggers, scheduled jobs, or pgvector, and again when diagnosing slow queries, high CPU, timeouts, locking, or connection exhaustion.",
          "Supabase, in supabase/agent-skills, MIT at the repository root. 357.3K installs on skills.sh, on a repository with 2,529 stars, which is a clean illustration of how badly stars and installs correlate.",
        ],
      },
      {
        label: "The Prisma set",
        cells: [
          "Nine folders covering the Prisma CLI, the client API, database and Postgres setup, compute, driver adapter implementation, the MongoDB upgrade, and the v7 upgrade. Vendor documentation restated as procedures an agent follows rather than pages it has to find and then interpret.",
          "Prisma, in prisma/skills, MIT. Fifty-three repository stars when we read the API, and prisma-database-setup alone at 205.3K installs on skills.sh. Included because the publisher is the team that maintains the product the skill is about.",
        ],
      },
      {
        label: "internal-comms",
        cells: [
          "Writing the recurring internal formats: 3P updates covering progress, plans, and problems, company newsletters, FAQ responses, status reports, leadership updates, incident reports, and project updates, each in a fixed house format.",
          "Anthropic, in anthropics/skills, Apache 2.0 in the folder. Included as the clearest published example of a skill that is nothing but one organisation's house style written down, which is the shape most internal team skills end up taking.",
        ],
      },
    ],
    notes: [
      "The license split inside a single Anthropic repository catches people out, so it is worth stating plainly. internal-comms and webapp-testing carry Apache 2.0 in their own folder. pdf and docx carry a proprietary license in theirs, one that governs use by your agreement with Anthropic and restricts what you may do with the materials outside Anthropic's services. Same repository, same day, and the difference only appears if you open the folder.",
      "supabase-postgres-best-practices and the Prisma set are the argument for looking at vendor repositories before looking at any directory. Neither would surface on a popularity-ordered list of Claude skills, both are maintained by the people who maintain the thing they describe, and neither has any reason to submit itself to a catalog.",
      "internal-comms is the one entry here we expect a reader to take as a template rather than an install. Most teams do not want Anthropic's internal formats; they want their own written down the same way, which is a much smaller job than it looks once you have seen the shape.",
    ],
    link: {
      lead: "For the four pre-built document skill_ids that share these names on the API and on claude.ai, and why the repository folder is not the same artifact, see",
      label: "Anthropic skills: every first-party skill and where it loads",
      href: anthropicSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "anthropic-pdf-license",
      "anthropic-skills-repo",
      "supabase-agent-skills",
      "prisma-skills",
      "skills-sh-leaderboard",
    ],
  },
  authoring: {
    title: "Skills about skills: the five for writing and checking them",
    intro:
      "The group that pays for itself fastest, because the first thing most teams want after installing two skills is to write a third. One of these five exists to read the other four before you install them.",
    columns: [
      "Skill",
      "What its SKILL.md says it does",
      "Publisher, license, where it runs",
    ],
    rows: [
      {
        label: "skill-creator",
        cells: [
          "Creating skills, editing existing ones, and measuring them: running evals against test prompts, benchmarking with variance analysis, and tuning a description for trigger accuracy. It ships an eval viewer script that generates a review of the runs for a person to read, which makes it the only skill in this register that arrives with a way to test itself.",
          "Anthropic, in anthropics/skills, Apache 2.0 in the folder. 356.4K installs on skills.sh. Claude Code's own documentation points at it for running evals on a skill you wrote.",
        ],
      },
      {
        label: "mcp-builder",
        cells: [
          "Building MCP servers in Python with FastMCP or in Node and TypeScript with the MCP SDK, across four phases starting from research and planning. It takes a position on the question most MCP servers get wrong, whether to mirror an API endpoint for endpoint or to ship higher-level workflow tools, and says to favour coverage when uncertain.",
          "Anthropic, in anthropics/skills, Apache 2.0 in the folder, and the license is named in the frontmatter as well.",
        ],
      },
      {
        label: "writing-skills",
        cells: [
          "Treats writing a skill as test-driven development applied to process documentation, and covers checking that a skill works before it is deployed. It also documents the cross-runtime directory, ~/.agents/skills/, that Codex, Copilot CLI, and Gemini CLI recognise alongside their own paths.",
          "Jesse Vincent, in obra/superpowers, MIT. Reads as the practical counterpart to skill-creator: one measures a skill, the other tells you how to write one worth measuring.",
        ],
      },
      {
        label: "writing-for-agents",
        cells: [
          "One reference for every document an agent reads: a skill, an AGENTS.md, a CLAUDE.md, or a doc reached by a pointer. Its argument is that the packaging differs and the writing does not, because the same levers make each one predictable. It carries a separate mechanics file for frontmatter, invocation choice, and router skills.",
          "Matt Pocock, in mattpocock/skills, MIT. The single most useful entry here if your team is about to write its first five skills and has not yet decided what belongs in a skill rather than in AGENTS.md.",
        ],
      },
      {
        label: "skill-inspector",
        cells: [
          "Decides whether a skill is safe to install. It runs the SkillSpector static scanner for known risk patterns, then a source-aware semantic review of intent, permission fit, hidden behaviour, and user control, and says explicitly not to rely on the numeric score alone, because a low score can miss semantic risk and a high one can be justified.",
          "NVIDIA, in NVIDIA/SkillSpector, Apache 2.0. The repository also ships a set of deliberately malicious test fixtures, which is the most useful reading in it if you want to know what a bad skill looks like.",
        ],
      },
    ],
    notes: [
      "skill-inspector is the entry we would install first, and the reasoning is uncomfortable rather than clever. Every other skill on this page is instructions an agent will follow and, in several cases, scripts it will run. Reading the file is what we did and it is the minimum; a scanner plus a semantic review is more than most teams will do by hand, and the skill's own advice not to trust its score is the part that makes it worth having.",
      "writing-skills and writing-for-agents disagree in useful ways, and reading both is better than picking one. The superpowers file is process-first and treats a skill as something you verify before deployment. The mattpocock file is writing-first and treats a skill as one member of a family of agent-facing documents. Teams tend to need the second question answered before the first.",
      "There is a gap in this group that nobody fills. skill-creator can benchmark a description for trigger accuracy, but none of the twenty-seven skills we read shipped an eval report next to its SKILL.md. The tooling to measure a skill is public; published measurements of specific skills are not.",
    ],
    link: {
      lead: "For what a skill actually is before you write one, the SKILL.md frontmatter fields, and what each Claude surface allows, see",
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "anthropic-skills-repo",
      "superpowers",
      "mattpocock-skills",
      "skillspector",
      "claude-code-skills",
    ],
  },
  dropped: {
    title: "What we dropped, and why",
    intro:
      "The half of a curated list that nobody publishes. Every item here would appear on a popularity-ordered list of best Claude skills, several near the top. Each one names the criterion it failed, so you can disagree with the criterion rather than with us.",
    entries: [
      {
        title: "caveman, the most popular thing we rejected",
        body: "Twenty-four skill folders, 99,212 stars, and 445.0K CLI installs on the skills.sh leaderboard when we read it, which put it ahead of every superpowers skill. GitHub reports its license as NOASSERTION, meaning it found a license file it could not identify as a known license. We could not state the terms, so it failed criterion three. This is the clearest case on the page of the bar overruling the popularity, and it is the one we expect readers to argue with.",
      },
      {
        title: "The five Vercel skills with no license",
        body: "deploy-to-vercel, vercel-optimize, web-design-guidelines, writing-guidelines, and vercel-cli-with-tokens. All are actively maintained, all are useful, and web-design-guidelines alone had 556.0K installs. None declares a license in its frontmatter, and vercel-labs/agent-skills has no license file anywhere in its tree, so there is nothing to read. Four sibling folders in the same repository do declare MIT, which is what makes the omission legible rather than an oversight we should paper over.",
      },
      {
        title: "The awesome lists, all of them",
        body: "VoltAgent/awesome-agent-skills is MIT and actively maintained and contains no SKILL.md at all, because it is an index of links. ComposioHQ/awesome-claude-skills carries 864 SKILL.md files vendored in from elsewhere under no repository license. travisvn/awesome-claude-skills was last pushed on April 28, 2026, more than three months before we checked. None of them is a skill, which is the point: they answer where to find skills, not which one to use.",
      },
      {
        title: "The mega-bundles we could not read",
        body: "alirezarezvani/claude-skills holds 798 SKILL.md files, K-Dense-AI/scientific-agent-skills holds 163, and mukul975/Anthropic-Cybersecurity-Skills advertises 817. All three are MIT or Apache and actively pushed. We read samples, not sets, and criterion one says we opened the file. A bundle is a source you shop from, and one entry standing in for hundreds of unread folders would be the exact failure this page exists to avoid.",
      },
      {
        title: "andrej-karpathy-skills, which is not a skill",
        body: "203,906 stars, and the repository is a single CLAUDE.md derived from one person's public observations about how to work with coding models. No SKILL.md, no license file, and no push since April 20, 2026. It is named here only because it ranks for skills queries and is a different artifact: a project instruction file, which our page comparing AGENTS.md and SKILL.md covers.",
      },
      {
        title: "graphify, which is a tool with a slash command",
        body: "Apache 2.0, 108,293 stars, and pushed the day we read it. It turns a codebase, its docs, SQL schemas, configs, and PDFs into a queryable knowledge graph, and it describes itself as a /graphify skill for Claude Code, Cursor, Codex, and Gemini CLI. There is no SKILL.md anywhere in its tree. It is a CLI plus a command, and criterion seven asks for a skill folder we can read.",
      },
      {
        title: "remotion's collection, for Vercel's reason",
        body: "remotion-dev/skills holds twelve skill folders, is maintained by the Remotion team, and was pushed the day before we checked. remotion-best-practices had 485.9K installs on skills.sh. The repository carries no license file and the frontmatter we read declares none, so there is nothing to name. It is on our list to revisit if that changes.",
      },
      {
        title: "Skills their own authors marked unfinished",
        body: "mattpocock/skills keeps a skills/in-progress directory holding claude-handoff, loop-me, setup-ts-deep-modules, and three writing skills. loop-me alone had 179.5K installs. They meet every criterion we set, and we left them out because the author put them in a folder called in-progress, which is a clearer signal about readiness than anything we could measure from outside.",
      },
      {
        title: "Two Anthropic skills we left out on judgment",
        body: "academy-guide and discernment-nudge clear all seven criteria. Both are shaped as instructions to check before finishing a reply, rather than as a procedure for a job you could name, so a register organised by job has nowhere honest to put them. That is our judgment and not a fault in the skills, and both are listed in the first-party catalog with everything else Anthropic ships.",
      },
    ],
    sourceIds: [
      "caveman",
      "vercel-agent-skills",
      "awesome-voltagent",
      "karpathy-skills",
      "graphify",
      "mattpocock-skills",
      "anthropic-skills-repo",
    ],
  },
  openQuestions: {
    title: "What is not documented about any of these",
    intro:
      "The honest boundary of this page. These are the things we would have used if anybody published them, and did not, so nothing below was estimated or filled in.",
    entries: [
      {
        title: "No usage number exists for any single skill",
        body: "GitHub publishes stars for a repository, not for a folder. obra/superpowers is one star count covering fourteen skills, anthropics/skills is one covering nineteen, and mattpocock/skills is one covering thirty-five. Nothing attributes a star to a folder, so no ordering by stars is an ordering of skills.",
      },
      {
        title: "The one public install count measures a CLI",
        body: "The skills.sh FAQ states that its leaderboard comes from anonymous telemetry collected when someone runs npx skills add, and that telemetry can be disabled. It therefore does not count a plugin install, a git clone, a copied folder, a marketplace install, or a single invocation afterwards. Every install figure on this page carries that limit.",
      },
      {
        title: "Nobody publishes eval results for their own skills",
        body: "Anthropic's skill-creator ships an eval harness and a viewer, and Claude Code documents running evals on a skill. None of the twenty-seven skills in this register shipped an eval report alongside its SKILL.md. There is public tooling to measure a skill and no public measurement of a specific one.",
      },
      {
        title: "Licenses sit at the repository level almost everywhere",
        body: "Anthropic is the only publisher here that puts a LICENSE file inside each skill folder, and it is also the one with two different licenses in the same repository. Everywhere else the license is the repository's, and no file states whether the author intended it to cover the skill contents or only the surrounding code.",
      },
      {
        title: "No skill declares which agent versions it works with",
        body: "None of the frontmatter we read carried a compatibility range against a Claude Code release, a Codex version, or anything else. Where this page says a skill runs somewhere, that is a statement about the Agent Skills format being portable, not a tested claim about that skill in that product.",
      },
      {
        title: "Maintenance is inferred from one repository-level date",
        body: "Our ninety-day rule uses the repository's last push, because that is what the GitHub API returns cheaply and consistently. A repository can be pushed daily while one skill folder sits untouched for a year. No directory we found publishes a per-skill modified date a reader can check at a glance.",
      },
      {
        title: "Trigger accuracy is unmeasured everywhere",
        body: "Several skills we read try to force invocation with wording like you must use this, an iron law, or a hard gate written into the file. Whether that phrasing changes how often a model actually loads the skill is not published by anyone, including the authors who chose to write it that way.",
      },
    ],
    sourceIds: [
      "skills-sh-faq",
      "skills-sh-leaderboard",
      "superpowers",
      "anthropic-skills-repo",
      "claude-code-skills",
    ],
  },
  team: {
    title: "A list is not a decision",
    intro:
      "Twenty-seven is more than any team should install. The useful output of a page like this is a shortlist of three or four your team agrees on, and somewhere those three or four stay visible after the person who found them moves on.",
    body: [
      "The pattern that fails is familiar and has nothing to do with the skills. Somebody reads a register, installs six, keeps two, and the two live in a personal ~/.claude/skills/ folder nobody else can see. A teammate asks which skill to use for a task, gets a link in chat, and the link is to whichever repository was top of a list that month. Six weeks later two people are running different versions of the same idea and neither knows.",
      "The fix is small and unglamorous. Pick a job your team does every week, choose one skill from this register that does it, and record the decision somewhere searchable with the source repository, the folder path, and the license visible. That is enough for the next teammate to open the SKILL.md and judge it themselves, which is the only part of this that does not transfer.",
      "Skills Board is where we keep that: a shared library of the skills a team recommends, with the original source one click from every entry, a compatible install command where one exists, and a ZIP of the latest source files. A saved skill is a team recommendation rather than an approval or a security review, which is exactly what a register like this one produces. It is free, MIT licensed, and open source.",
    ],
    paths: [
      {
        label: "Start from the job",
        body: "Pick the recurring task first, then the skill. Code review, plan writing, PDF handling, and Postgres migrations are four different jobs and four different groups above. A team that starts from the skill list installs the popular one and finds nothing changes.",
      },
      {
        label: "Read the file, not the entry",
        body: "Every description above is a paraphrase of somebody else's file, written by us on one day. Before a skill lands in a directory an agent scans, open its SKILL.md, its frontmatter, and anything in a scripts folder. skill-inspector automates the first pass of that.",
      },
      {
        label: "Record who chose it",
        body: "A skill with no named owner on your side decays the same way a link in chat does. One person per skill, visible next to it, is enough. The alternative is a library nobody prunes and a register nobody re-reads.",
      },
      {
        label: "Re-read the license on the day you adopt it",
        body: "Two of the five entries in the documents group are not open source, and five Vercel skills have no license at all. Those facts were read on one date and can change. The license is the field most likely to matter later and the one nobody checks twice.",
      },
    ],
    limits: [
      "This page is a reading, not an audit. We opened every SKILL.md in the register and every license we cite. We did not run the skills, measure their output, or review their scripts line by line, and no entry here should be read as a security assessment.",
      "Twenty-seven entries against a bar drawn on one date is a selection with a shelf life. The maintained test in particular is a snapshot: three of the repositories here were pushed the same day we read them, and a repository can go quiet the week after a page like this is published.",
      "Nothing on this page is sponsored, and no publisher in the register was contacted. Skills Board is not a party to any of these projects, and the one product recommendation on this page is our own, stated as such.",
    ],
    link: {
      lead: "For turning a shortlist into a recommendation a second teammate can act on, including who owns each entry, see",
      label: "How to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      trail: ".",
    },
    sourceIds: ["claude-code-skills", "skills-sh-leaderboard"],
  },
  faq: [
    {
      question: "What are the best Claude skills?",
      answer:
        "Nobody can rank them, because no per-skill quality data is published. Against a stated bar, twenty-seven cleared ours: nine engineering workflow skills, eight for interface work, five for documents and data, and five for writing and checking skills. Publishers include Anthropic, Vercel, Supabase, Prisma, NVIDIA, and shadcn.",
    },
    {
      question: "Which Claude skills are best for coding?",
      answer:
        "The nine in the engineering group, and they share a trait: each constrains the agent rather than teaching it a subject. test-driven-development refuses code before a failing test, systematic-debugging blocks fixes before a root cause, and verification-before-completion demands fresh output before any claim that work is done.",
    },
    {
      question: "Where is the best list of Claude skills on GitHub?",
      answer:
        "There is no single one, and the popular answers are indexes rather than skills. VoltAgent and Composio both maintain large awesome lists, and neither is a skill you install. For reading actual files, anthropics/skills, obra/superpowers, and mattpocock/skills carry the most substance per folder.",
    },
    {
      question: "Are the awesome Claude skills lists worth using?",
      answer:
        "For discovery, yes. For deciding, no. They rank nothing, state no criteria, and rarely show that anybody opened the files. One of the three biggest had not been pushed in over three months when we checked. Treat them as a search index and do the reading yourself afterwards.",
    },
    {
      question: "How did you pick the top Claude skills on this page?",
      answer:
        "Seven pass or fail criteria, applied on August 19, 2026. We opened each SKILL.md, required one nameable job, a license we could name, a repository push within ninety days, an identifiable publisher, free public access, and a plain skill folder. Popularity and star counts were deliberately excluded.",
    },
    {
      question: "Does the most installed Claude skill mean the best one?",
      answer:
        "No. The only public install figure comes from the skills.sh leaderboard, and its own FAQ says it counts runs of one CLI command. It misses plugin installs, clones, copied folders, and every invocation afterwards. It tells you what people downloaded, not what worked for them.",
    },
    {
      question: "Which Claude skill should a team install first?",
      answer:
        "Whichever one matches a task your team already repeats every week, which is a different answer per team. If you want a general first pick, skill-inspector reads other skills before you install them, and writing-for-agents settles what belongs in a skill rather than in AGENTS.md.",
    },
    {
      question: "How many Claude skills are in this list, and what got cut?",
      answer:
        "Twenty-seven are in, and nine groups of candidates were dropped. The cuts include the single most installed skill we looked at, five skills published by Vercel, every awesome list, three mega-bundles too large to read, and two Anthropic skills we removed on editorial judgment rather than on a rule.",
    },
  ],
  sources: [
    {
      id: "anthropic-skills-repo",
      label: "anthropics/skills on GitHub",
      href: "https://github.com/anthropics/skills",
      note: "The frontmatter and body of frontend-design, webapp-testing, internal-comms, skill-creator, mcp-builder, pdf, and docx, the per-folder LICENSE.txt files, the nineteen skill folders, and the repository metadata read through the GitHub API on August 19, 2026.",
    },
    {
      id: "anthropic-pdf-license",
      label: "The pdf skill license file",
      href: "https://github.com/anthropics/skills/blob/main/skills/pdf/LICENSE.txt",
      note: "The proprietary terms on the document skills: all rights reserved, use governed by your agreement with Anthropic, and the restrictions that separate these four folders from the Apache 2.0 skills in the same repository.",
    },
    {
      id: "superpowers",
      label: "obra/superpowers on GitHub",
      href: "https://github.com/obra/superpowers",
      note: "The SKILL.md files for brainstorming, test-driven-development, systematic-debugging, verification-before-completion, and writing-skills, the MIT license file, the plugin manifest naming Jesse Vincent and version 6.3.0, the fourteen documented install paths, and 274,156 stars on August 19, 2026.",
    },
    {
      id: "mattpocock-skills",
      label: "mattpocock/skills on GitHub",
      href: "https://github.com/mattpocock/skills",
      note: "The SKILL.md files for code-review, diagnosing-bugs, research, and writing-for-agents, the MIT license, the thirty-five skill folders including the in-progress directory we excluded, and 223,471 stars on August 19, 2026.",
    },
    {
      id: "vercel-agent-skills",
      label: "vercel-labs/agent-skills on GitHub",
      href: "https://github.com/vercel-labs/agent-skills",
      note: "The nine skill folders, the four that declare MIT in their frontmatter and the five that declare nothing, the absence of any license file in the repository tree, and the README description of each skill including the rule count that disagrees with the SKILL.md.",
    },
    {
      id: "hallmark",
      label: "Nutlope/hallmark on GitHub",
      href: "https://github.com/Nutlope/hallmark",
      note: "The hallmark SKILL.md, its stated focus on structural rather than visual variety, the MIT license file, and the repository metadata: 25,785 stars and a last push on August 6, 2026.",
    },
    {
      id: "emilkowalski-skills",
      label: "emilkowalski/skills on GitHub",
      href: "https://github.com/emilkowalski/skills",
      note: "The review-animations SKILL.md and its disable-model-invocation frontmatter, the eleven skill folders in the repository, and the MIT license.",
    },
    {
      id: "shadcn-ui",
      label: "The shadcn skill in shadcn-ui/ui",
      href: "https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md",
      note: "The shadcn SKILL.md, its user-invocable false setting, and the allowed-tools list restricting it to three specific shadcn CLI invocations.",
    },
    {
      id: "supabase-agent-skills",
      label: "supabase/agent-skills on GitHub",
      href: "https://github.com/supabase/agent-skills",
      note: "The supabase-postgres-best-practices SKILL.md and the list of operations it tells the agent to load before, the MIT license, and 2,529 stars on August 19, 2026.",
    },
    {
      id: "prisma-skills",
      label: "prisma/skills on GitHub",
      href: "https://github.com/prisma/skills",
      note: "The nine Prisma skill folders, the MIT license, and the repository metadata: fifty-three stars and a last push on August 4, 2026.",
    },
    {
      id: "planning-with-files",
      label: "OthmanAdi/planning-with-files on GitHub",
      href: "https://github.com/OthmanAdi/planning-with-files",
      note: "The planning-with-files SKILL.md, its hook declarations and allowed-tools list, the twelve agent-specific copies and five translations in the tree, and the MIT license.",
    },
    {
      id: "skillspector",
      label: "NVIDIA/SkillSpector on GitHub",
      href: "https://github.com/NVIDIA/SkillSpector",
      note: "The skill-inspector SKILL.md and its two review lines, its instruction not to rely on the numeric score alone, the malicious test fixtures in the repository, and the Apache 2.0 license.",
    },
    {
      id: "skills-sh-leaderboard",
      label: "skills.sh, the Agent Skills Directory",
      href: "https://www.skills.sh",
      note: "Every install figure quoted on this page, read from the all-time leaderboard on August 19, 2026, along with the placements we cite for frontend-design, tdd, and web-design-guidelines.",
    },
    {
      id: "skills-sh-faq",
      label: "skills.sh FAQ",
      href: "https://www.skills.sh/docs/faq",
      note: "That the leaderboard is powered by anonymous telemetry from the skills CLI, that it aggregates installation counts from npx skills add, that no personal data is collected, and that telemetry can be disabled.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: extend Claude with skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "That a skill body loads only when used, that Claude Code skills follow the Agent Skills open standard with product-specific extensions, the frontmatter reference including invocation control and pre-approved tools, and the guidance on running evals with skill-creator.",
    },
    {
      id: "caveman",
      label: "JuliusBrussee/caveman on GitHub",
      href: "https://github.com/JuliusBrussee/caveman",
      note: "The twenty-four skill folders, 99,212 stars, a last push on August 19, 2026, and the license the GitHub API reports as NOASSERTION, which is the reason it is in the dropped section rather than the register.",
    },
    {
      id: "awesome-voltagent",
      label: "VoltAgent/awesome-agent-skills on GitHub",
      href: "https://github.com/VoltAgent/awesome-agent-skills",
      note: "That the repository is MIT, actively pushed, and contains no SKILL.md file anywhere in its tree, which is what makes it an index rather than a skill. Read alongside the Composio and travisvn lists on the same day.",
    },
    {
      id: "karpathy-skills",
      label: "multica-ai/andrej-karpathy-skills on GitHub",
      href: "https://github.com/multica-ai/andrej-karpathy-skills",
      note: "That the repository is a single CLAUDE.md with no SKILL.md and no license file, its 203,906 stars, and its last push on April 20, 2026, which is outside the ninety-day maintenance window.",
    },
    {
      id: "graphify",
      label: "Graphify-Labs/graphify on GitHub",
      href: "https://github.com/Graphify-Labs/graphify",
      note: "That the repository describes itself as a /graphify skill for four agents while its tree contains no SKILL.md, its Apache 2.0 license, 108,293 stars, and a push on August 19, 2026.",
    },
  ],
  related: [
    {
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      description:
        "The marketplaces, directories, and repositories this selection was drawn from, and what each one screens before it lists something.",
    },
    {
      label: "Anthropic skills: every first-party skill and where it loads",
      href: anthropicSkillsPath,
      description:
        "The full first-party catalog behind the six Anthropic entries here, with the license on each folder.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The definitional page: the SKILL.md format, the frontmatter fields, and what each Claude surface allows.",
    },
    {
      label: "Agent Skills: the open standard for extending AI agents",
      href: agentSkillsPath,
      description:
        "Why a skill written for Claude loads in Codex and Cursor, and which frontmatter fields the standard actually defines.",
    },
    {
      label: "How to choose the first AI agent skill for your team",
      href: guidePaths.chooseFirstTeamSkill,
      description:
        "A scorecard, source review, and disqualifier list for judging a candidate this page never saw.",
    },
    {
      label: "How to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      description:
        "Where each of these lands on disk, and the personal, project, plugin, and managed install paths.",
    },
    {
      label: "Claude skills vs plugins",
      href: comparePaths.skillsVsPlugins,
      description:
        "Why several entries here ship as plugins, and what a plugin can carry that a skill folder cannot.",
    },
    {
      label: "Skills Board vs skills.sh",
      href: alternativePaths.skillsSh,
      description:
        "A public leaderboard next to a team library, and which question each one actually answers.",
    },
  ],
  og: {
    eyebrow: "Best Claude Skills",
    title: [
      { text: "Twenty-seven skills," },
      { text: "and the bar they cleared.", accent: true },
    ],
    description:
      "A register with stated criteria: we opened every SKILL.md, named every license, and listed the nine popular things we dropped and why.",
    contextLabel: "skillsboard.sh/best-claude-skills",
    chips: ["Criteria", "Register", "Dropped"],
  },
  ogAlt:
    "A curated register of twenty-seven Claude skills grouped by job, with the seven selection criteria applied and the candidates that were dropped.",
  publishedAt: "2026-08-19",
  modifiedAt: "2026-08-19",
}
