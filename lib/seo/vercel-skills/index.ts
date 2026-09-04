import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import { opencodeSkillsPath } from "@/lib/seo/opencode-skills/types"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { vercelSkillsPath } from "@/lib/seo/vercel-skills/types"

export {
  vercelSkillsPath,
  type VercelSkillsPath,
} from "@/lib/seo/vercel-skills/types"

export interface VercelSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface VercelSkillsFaqEntry {
  question: string
  answer: string
}

export interface VercelSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/**
 * One contextual link out of a section, rendered as a sentence. The href union
 * keeps an internal path that does not exist from shipping as a dead link.
 */
export interface VercelSkillsInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentSkillsSupportPath
    | typeof bestClaudeSkillsPath
    | typeof claudeSkillsPath
    | typeof codexSkillsPath
    | typeof opencodeSkillsPath
    | typeof whereToFindClaudeSkillsPath
  trail: string
}

export interface VercelSkillsTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  link: VercelSkillsInlineLink
  sourceIds: readonly string[]
}

export interface VercelSkillsDefinition {
  path: typeof vercelSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsPath
    | typeof bestClaudeSkillsPath
    | typeof opencodeSkillsPath
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
  meanings: VercelSkillsTableSection
  catalog: VercelSkillsTableSection
  names: VercelSkillsTableSection
  weight: VercelSkillsTableSection
  caution: VercelSkillsTableSection
  drift: VercelSkillsTableSection
  install: {
    title: string
    intro: string
    steps: readonly {
      title: string
      body: string
    }[]
    template: string
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
    link: VercelSkillsInlineLink
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
  faq: readonly VercelSkillsFaqEntry[]
  sources: readonly VercelSkillsSource[]
  related: readonly VercelSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const vercelSkills: VercelSkillsDefinition = {
  path: vercelSkillsPath,
  contentType: "article",
  topics: [
    "vercel skills",
    "vercel agent skills",
    "skill registry",
    "skill sharing",
  ],
  relatedGuidePaths: [
    bestClaudeSkillsPath,
    agentSkillsPath,
    guidePaths.chooseFirstTeamSkill,
  ],
  eyebrow: "Vercel Skills",
  title: "Vercel skills: the official collection, and everything else with that name",
  seoTitle:
    "Vercel Skills: The Official Collection, Explained | Skills Board",
  description:
    "Vercel skills means at least four different things. The nine Agent Skills in vercel-labs/agent-skills, a vercel skills CLI command, the npx skills tool Vercel builds, and Vercel's own docs directory. Every skill in the collection with its license and install count, the four whose folder name is not their skill name, what the README gets wrong about its own contents, and how a team keeps one answer per job.",
  intro: [
    "Start with the disambiguation, because this phrase carries at least four meanings and only one of them is a collection of skills you can install. There is vercel-labs/agent-skills, Vercel's official set of Agent Skills, which is what almost everybody means. There is vercel skills, an actual command in the Vercel CLI that recommends skills for the project you are standing in. There is npx skills, a separate Vercel project that installs skills from anybody's repository into any of dozens of agents. And there is the directory Vercel publishes in its own documentation, which reaches well past that one repository.",
    "If you came here for the skills a job at Vercel asks for, or for what you need to learn in order to use the Vercel platform, none of the below is about that. This page is about SKILL.md files: folders of instructions that a coding agent loads when a task matches, in the format defined at agentskills.io and read by Claude Code, Codex, Cursor, OpenCode, and a long list of others.",
    "The collection is real and heavily used. Nine skill folders, 30,287 stars on the repository, and just over two million installs counted across them on the skills.sh leaderboard. It is also less tidy than its popularity suggests. Four of the nine folders are named something other than the skill inside them, five of the nine declare no license and the repository has no license file to fall back on, the README documents eight skills of which two do not exist under the names it uses, and the public directory lists thirteen entries for a repository that holds nine.",
    "Everything below was read on August 21, 2026, from the GitHub API, the repository files themselves, skills.sh, vercel.com documentation, and the Agent Skills specification. The install numbers and the file counts come from those sources on that date, and one section reports what happened when we actually ran the installer against a clean project. Where nothing is documented, this page says so rather than filling the gap.",
  ],
  answer:
    "Vercel skills usually means vercel-labs/agent-skills, Vercel's official collection of Agent Skills: nine folders, each holding a SKILL.md that any agent reading the Agent Skills format can load. You install them with npx skills add vercel-labs/agent-skills. The same phrase is also a Vercel CLI command, vercel skills, which recommends skills for the project you are in.",
  answerNotes: [
    "Two repositories under the same owner are easy to confuse and are not the same thing. vercel-labs/agent-skills is content: nine skill folders and nothing else executable. vercel-labs/skills is the tool behind npx skills and the skills.sh directory, a CLI that installs skills from any repository into any of the agents it knows about. Only the second one carries a LICENSE file, and it is MIT.",
    "License is the first thing to check and the thing most write-ups skip. Four of the nine skills declare license MIT in their own frontmatter. The other five declare nothing, GitHub reports no license for the repository, and there is no license file anywhere in the tree. The README ends with a heading that says License and the word MIT under it, which is a README line rather than a file, and it is why our own register left those five out.",
    "Four of the nine folders do not share a name with the skill inside them. skills/react-best-practices holds a skill named vercel-react-best-practices, and the same is true for composition-patterns, react-native-skills, and react-view-transitions. The Agent Skills specification says the name must match the parent directory, the installer quietly fixes it for you, and a manual copy does not.",
    "This page covers that one repository in detail because it is the one the query means. Vercel publishes skills from other repositories too, and its documentation groups them into nine categories that include the AI SDK, commerce, workflow, and browser automation. The meanings table below names the ones the documentation points at.",
  ],
  answerSourceIds: [
    "vercel-agent-skills",
    "skills-cli",
    "vercel-docs-skills",
    "agentskills-spec",
  ],
  meanings: {
    title: "Four things called Vercel skills",
    intro:
      "The primary query is ambiguous, so this is the first table rather than a footnote. Only the first row is a collection you install. The rest are a command, a tool, a directory, and a set of other repositories, all published by the same company and all findable under the same two words.",
    columns: ["The name", "What it actually is", "Where it lives"],
    rows: [
      {
        label: "vercel-labs/agent-skills",
        cells: [
          "Vercel's official collection of Agent Skills, described in its own repository as exactly that. Nine skill folders today, created in December 2025, 30,287 stars and 2,708 forks when we read it. This is what the rest of this page is about.",
          "github.com/vercel-labs/agent-skills",
        ],
      },
      {
        label: "vercel skills",
        cells: [
          "A command in the Vercel CLI. Run with no arguments it detects the project framework and scans package.json for a curated set of notable dependencies, then recommends matching skills from the catalog. Pass a word and it searches the catalog for that word instead. It also takes a JSON output flag.",
          "vercel.com/docs/cli/skills",
        ],
      },
      {
        label: "npx skills",
        cells: [
          "The skills CLI, a separate Vercel project that adds, lists, finds, updates, and removes skills. It installs from GitHub, GitLab, any git URL, a local path, or a direct file URL, and its agent table maps sixty-nine rows of products, seventy-seven named agents in all, to the directories each one reads. Nothing about it is limited to Vercel's own skills.",
          "github.com/vercel-labs/skills",
        ],
      },
      {
        label: "skills.sh",
        cells: [
          "The public directory the same project publishes: install counts per skill, groupings a repository can configure with a file of its own, and third-party security audits. The collection's own repository page is the source of the install numbers quoted further down.",
          "skills.sh",
        ],
      },
      {
        label: "Vercel published skills",
        cells: [
          "A page in Vercel's documentation that calls itself the official directory of Vercel published skills and sorts them into nine category headings: React and Next.js, AI SDK, design and UI, browser automation, deployment, commerce, workflow, JSON Render, and utility. It states that skills work with 18 or more AI agents.",
          "vercel.com/docs/agent-resources/skills",
        ],
      },
      {
        label: "Other Vercel repositories",
        cells: [
          "The documentation and the directory both point at skills that live outside the main collection, including vercel/microfrontends, vercel-labs/next-skills, and vercel/turborepo. A skill published by Vercel is not the same claim as a skill in vercel-labs/agent-skills.",
          "Various",
        ],
      },
    ],
    notes: [
      "The two vercel-labs repositories are the pair most often blurred together. One is a collection of nine instruction folders. The other is a package you run, with telemetry, a lock file, an agent detection routine, and a supported-agent table longer than any client documentation we have read. Writing that the Vercel skills CLI ships the Vercel skills is technically true and useless, so this page keeps them apart by name throughout.",
      "The documentation page lists its nine categories as headings, and the entries under them did not render in a plain fetch of the page, so what we can report is the category structure and not the membership. The page carries a last updated date of June 30, 2026. Its sibling for the CLI command carries June 6, 2026.",
      "Nothing on the vercel.com side defines what qualifies a repository as Vercel published, and nothing published says whether the categories on the documentation page and the groupings on skills.sh are meant to agree. Both are treated here as separate views rather than as one canonical list.",
    ],
    link: {
      lead: "For what the SKILL.md format is before any vendor packages it, including the frontmatter fields and the optional folders beside the file, see",
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "vercel-agent-skills",
      "vercel-docs-cli-skills",
      "skills-cli",
      "skills-sh-repo",
      "vercel-docs-skills",
    ],
  },
  catalog: {
    title: "The nine skills in vercel-labs/agent-skills",
    intro:
      "One row per folder that holds a SKILL.md, named the way the installer and the directory name it, which is the frontmatter name rather than the folder. Ordered by install count on skills.sh, highest first. We opened every one of these files.",
    columns: ["Skill", "What it does", "License and installs"],
    rows: [
      {
        label: "vercel-react-best-practices",
        cells: [
          "React and Next.js performance rules from Vercel Engineering, ordered by impact across eight categories from eliminating waterfalls and bundle size at the top down to JavaScript micro-optimizations. The SKILL.md says seventy rules and the folder beside it holds seventy rule files, one per rule, plus a sections index and a template.",
          "MIT, declared in its own frontmatter. 650.4K installs.",
        ],
      },
      {
        label: "web-design-guidelines",
        cells: [
          "Reviews UI code against the Web Interface Guidelines and reports findings in a terse file and line format, covering accessibility, focus states, forms, animation, typography, images, performance, theming, touch, and locale. The SKILL.md is thirty-one lines and carries no rules of its own.",
          "No license field. 561.2K installs.",
        ],
      },
      {
        label: "vercel-composition-patterns",
        cells: [
          "React composition patterns that scale: compound components, lifting state, composing internals, choosing children over render props, and getting out of boolean prop proliferation, with the React 19 API changes folded in. Eight rule files sit beside the SKILL.md.",
          "MIT, declared in its own frontmatter. 298.3K installs.",
        ],
      },
      {
        label: "vercel-react-native-skills",
        cells: [
          "React Native and Expo practice for list performance, layout and safe areas, Reanimated and gestures, images, state, monorepo structure, and platform specifics. Thirty-six rule files beside the SKILL.md, with the long form of every rule in a single large companion file.",
          "MIT, declared in its own frontmatter. 191.6K installs.",
        ],
      },
      {
        label: "deploy-to-vercel",
        cells: [
          "Deploys a project to Vercel, always as a preview unless production is asked for. It gathers four facts first, then picks one of six documented routes depending on whether the project is linked and whether the CLI is authenticated, ending with an unauthenticated upload for sandboxed agents.",
          "No license field. 111.2K installs.",
        ],
      },
      {
        label: "vercel-react-view-transitions",
        cells: [
          "React's View Transition API in depth: the ViewTransition component, addTransitionType, the CSS pseudo-elements, shared element transitions, Web Animations API escapes, and the transitionTypes prop on next/link. Four reference files carry the recipes, the patterns, and the Next.js integration.",
          "MIT, declared in its own frontmatter. 102.1K installs.",
        ],
      },
      {
        label: "vercel-cli-with-tokens",
        cells: [
          "Drives the Vercel CLI with an access token instead of an interactive login: locating the token, choosing the team, linking, deploying, managing environment variables, reading build and runtime logs, and adding domains. One file, no folders.",
          "No license field. 84.6K installs.",
        ],
      },
      {
        label: "vercel-optimize",
        cells: [
          "Cost and performance auditing for a project already deployed. It collects Vercel metrics, usage, and project configuration first, investigates only the routes and files those metrics point at, and produces ranked recommendations with citations. The largest skill here by a wide margin.",
          "No license field. 54.5K installs.",
        ],
      },
      {
        label: "writing-guidelines",
        cells: [
          "Reviews documentation and prose against Vercel's writing handbook: voice, tone by content type, headings, lists, code samples, placeholders and units, typography, source formatting, pricing pages, and disclosure of AI use. Same thirty-one line shape as web-design-guidelines.",
          "No license field. 48.4K installs.",
        ],
      },
    ],
    notes: [
      "Four declare a license and five do not, in the same repository, on the same day, from the same publisher. There is no license file anywhere in the tree, and the GitHub API reports no license for the repository at all. The README closes with a heading that reads License and the single word MIT beneath it. Whether one line of a README covers five folders whose own frontmatter says nothing is a question for whoever signs off on dependencies where you work, and it is exactly why our own register of skills kept the four and dropped the five.",
      "The install numbers are useful and narrow. They come from the skills CLI reporting an add, they can be switched off with either of two environment variables, and they say nothing about whether a skill was ever loaded afterwards. They also drift between pages: the repository page and the skill page on skills.sh gave 650.4K and 648.2K for the same skill within the same hour, so treat every figure here as approximate and as a floor rather than a count.",
      "The collection ships a configuration file that groups eight of the nine into React, Vercel, and Design for its directory page, and tells the directory to put anything ungrouped at the bottom. writing-guidelines is the one skill missing from those groups, so it renders under Other skills beside four entries that no longer correspond to any file in the repository. The drift section below has the rest of that story.",
    ],
    link: {
      lead: "For these four Vercel skills placed beside the rest of what we opened, with the same license bar applied to every publisher, see",
      label: "The best Claude skills, and the bar we used",
      href: bestClaudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "vercel-agent-skills",
      "vercel-skills-config",
      "skills-sh-repo",
      "skills-sh-skill",
      "skills-cli",
    ],
  },
  names: {
    title: "The folder name is not always the skill name",
    intro:
      "This is the vendor-specific detail most likely to bite, and it is invisible until you copy a folder by hand. The specification requires the frontmatter name to match the parent directory. In this repository, four of the nine do not.",
    columns: ["Folder in the repository", "Name in the frontmatter", "Match"],
    rows: [
      {
        label: "skills/composition-patterns",
        cells: ["vercel-composition-patterns", "No"],
      },
      {
        label: "skills/react-best-practices",
        cells: ["vercel-react-best-practices", "No"],
      },
      {
        label: "skills/react-native-skills",
        cells: ["vercel-react-native-skills", "No"],
      },
      {
        label: "skills/react-view-transitions",
        cells: ["vercel-react-view-transitions", "No"],
      },
      {
        label: "skills/deploy-to-vercel",
        cells: ["deploy-to-vercel", "Yes"],
      },
      {
        label: "skills/vercel-cli-with-tokens",
        cells: ["vercel-cli-with-tokens", "Yes"],
      },
      {
        label: "skills/vercel-optimize",
        cells: ["vercel-optimize", "Yes"],
      },
      {
        label: "skills/web-design-guidelines",
        cells: ["web-design-guidelines", "Yes"],
      },
      {
        label: "skills/writing-guidelines",
        cells: ["writing-guidelines", "Yes"],
      },
    ],
    notes: [
      "The installer papers over it, which is why almost nobody notices. We ran npx skills add vercel-labs/agent-skills against an empty project on August 21, 2026 and watched it write .claude/skills/vercel-react-best-practices from skills/react-best-practices. The CLI takes the name out of the frontmatter, sanitizes it, and uses that for the directory it creates. The lock file it leaves behind records both: the installed name, and the skillPath the file came from.",
      "Copying by hand does not. The repository's own agent instructions tell you to run a recursive copy of skills/{skill-name} into your Claude Code skills folder, and for those four that produces a directory whose name disagrees with the frontmatter inside it. What each client does about that disagreement is its own business, and the specification is unambiguous that the two should match, so rename the folder when you copy rather than finding out.",
      "The same distinction shows up on the command line. The flag that installs one skill takes the frontmatter name, not the folder: vercel-react-best-practices works and react-best-practices does not. The README is written around folder names, using them for six of its eight section headings, so a reader who copies a heading straight into that flag gets nothing back.",
    ],
    link: {
      lead: "For the name and directory rules themselves, the character constraints, and the rest of the frontmatter the format defines, see",
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "vercel-agent-skills",
      "agentskills-spec",
      "skills-cli",
      "vercel-agent-skills-agents",
    ],
  },
  weight: {
    title: "What installing all nine actually costs",
    intro:
      "Numbers rather than adjectives. We installed the whole collection into an empty project on August 21, 2026 and measured what landed. The distinction that matters is between what every session pays and what only a matched task pays.",
    columns: ["Measure", "What we counted", "Why it matters"],
    rows: [
      {
        label: "Skill folders",
        cells: [
          "Nine",
          "One directory each, each with a SKILL.md at its root. The installer reported nine and the repository holds nine, which is the one count on this page where every source agrees.",
        ],
      },
      {
        label: "Files on disk",
        cells: [
          "302",
          "Spread very unevenly: two skills are a single file, and vercel-optimize alone is 156 of them.",
        ],
      },
      {
        label: "Disk used",
        cells: [
          "2.2 MB",
          "Almost all of it is Markdown that is never read unless a task matches. Disk is not context.",
        ],
      },
      {
        label: "Always-loaded description text",
        cells: [
          "Just under 3,000 characters across the nine",
          "This is the part every session pays for whether or not a skill is used, because names and descriptions are what the agent sees before it decides. The shortest is 184 characters and the longest is 664.",
        ],
      },
      {
        label: "Longest SKILL.md body",
        cells: [
          "346 lines, in vercel-cli-with-tokens",
          "Comfortably inside the 500-line ceiling the specification recommends, and so is every other one. The shortest two are 31 lines.",
        ],
      },
      {
        label: "Largest folder",
        cells: [
          "vercel-optimize, 156 files and 1.2 MB",
          "More than half the collection by size. None of it loads until the skill is activated, and even then only the SKILL.md body does.",
        ],
      },
      {
        label: "Smallest folders",
        cells: [
          "web-design-guidelines and writing-guidelines, one file each",
          "They hold no rules at all. Each fetches its rule set from a second repository at review time, which the next section covers.",
        ],
      },
    ],
    notes: [
      "Just under 3,000 characters of always-loaded description is a real number to hold on to, because it is per collection and it adds up. Nine skills is a modest number. A team that installs this collection, plus a first-party set, plus whatever a teammate found last week, is spending its startup budget on descriptions for skills nobody has used in a month. Uninstalling is the cheapest optimization available and it is the one nobody schedules.",
      "The size figures are the opposite lesson. 2.2 MB sounds heavy and is not, because the format is built around progressive disclosure: name and description at startup, the SKILL.md body on activation, and the files beside it only when the instructions send the agent to them. vercel-optimize is a good demonstration, being more than half the disk and one line of the startup listing.",
      "Five zip archives sit in skills/ beside the folders, and one more sits inside skills/deploy-to-vercel. None of them is a skill, none was installed, and the drift section below explains what they appear to be.",
    ],
    link: {
      lead: "For the same startup cost question asked of a client that publishes an actual budget for it, and what happens when the listing does not fit, see",
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      trail: ".",
    },
    sourceIds: ["vercel-agent-skills", "agentskills-spec", "skills-cli"],
  },
  caution: {
    title: "Five of the nine do more than hand over instructions",
    intro:
      "A skill is instructions plus files that run with whatever permissions the session already has, and the installer says so on the last line of a successful run. These five reach outside the folder, and each one is worth reading before a teammate runs it on a repository that matters.",
    columns: ["Skill", "What it reaches for", "What to settle first"],
    rows: [
      {
        label: "deploy-to-vercel, the fallback route",
        cells: [
          "When the CLI cannot be installed or authenticated, the bundled scripts package the working tree into a tarball and post it to a deploy endpoint. There are two endpoints and two scripts, one for the claude.ai sandbox and one for the Codex sandbox, and the upload carries no authentication. The response is a preview URL and a claim URL that transfers the deployment to a Vercel account.",
          "Whether posting a working tree to a hosted endpoint is acceptable in your repository, and which of the six routes the skill will actually pick on your machine before you find out live.",
        ],
      },
      {
        label: "deploy-to-vercel, the git route",
        cells: [
          "On a project that is already linked and has a git remote, the documented and preferred path is to stage everything, commit, and push, because the push is what triggers the deployment. The skill instructs the agent to ask for explicit approval first and never to push without it.",
          "That the approval prompt actually reaches a person in your setup, and that nobody runs this on a branch that deploys to production while thinking they asked for a preview.",
        ],
      },
      {
        label: "vercel-cli-with-tokens",
        cells: [
          "Works through four places a Vercel token might be. One of them is reading a .env file and looking for any variable whose value resembles a Vercel token, then exporting it. It is explicit that the token must be exported rather than passed as a flag, because a flag leaks into shell history and process listings.",
          "Whether your agent should be opening .env at all. The advice about flags is good and worth keeping either way; the file scan is the part to decide on deliberately.",
        ],
      },
      {
        label: "web-design-guidelines and writing-guidelines",
        cells: [
          "Neither carries rules. Each is a thirty-one line instruction to fetch a command.md from a second repository at review time and apply whatever it currently says. The two source repositories are vercel-labs/web-interface-guidelines and vercel-labs/writing-guidelines, and both of those do carry an MIT license file.",
          "That the machine doing the review has network access, and that a rule set which can change between two runs is acceptable for a review someone acts on. Neither skill declares the compatibility field the specification provides for exactly this kind of requirement.",
        ],
      },
      {
        label: "vercel-optimize",
        cells: [
          "Reads project metrics, usage, and billing through the Vercel CLI, then runs its own scanners across the repository. 156 files including a folder of Node scripts, a references library, and a curated list of documentation URLs it is allowed to cite.",
          "The largest read of the nine and the one whose behavior you cannot infer from the SKILL.md alone. It is also one of the five with no license, which is an awkward combination for the most capable skill in the set.",
        ],
      },
    ],
    notes: [
      "None of this is an accusation. It is the ordinary consequence of the format: a skill is text an agent obeys plus files an agent can run, and the difference between a rules document and a deployment tool is nothing the packaging enforces. The skills CLI prints the same warning on every successful install, telling you to review skills before use because they run with full agent permissions. That line is the honest summary of the entire ecosystem, not a note about Vercel.",
      "The two thin skills name WebFetch, which is a Claude Code tool name, in the instruction that fetches their rules. On an agent whose web tool is called something else, the sentence still reads as an instruction and the tool it names does not exist. That is a portability seam worth knowing about in a repository that is otherwise agnostic about which agent reads it.",
      "skills.sh publishes third-party security audits per skill and reported a pass from all three providers it lists for vercel-react-best-practices on the day we read it. An audit is a useful signal and it is not a read. For a skill that uploads your working tree or scans your .env, the fifteen minutes it takes to open the file is the actual control.",
    ],
    link: {
      lead: "For the scorecard we use to decide whether a skill like these belongs in a team library at all, see",
      label: "Choose the first AI agent skill for your team",
      href: guidePaths.chooseFirstTeamSkill,
      trail: ".",
    },
    sourceIds: [
      "vercel-agent-skills",
      "web-interface-guidelines",
      "writing-guidelines-repo",
      "agentskills-spec",
      "skills-cli",
      "skills-sh-skill",
    ],
  },
  drift: {
    title: "Where the repository disagrees with itself",
    intro:
      "The skills are current. The packaging around them is not, and a teammate meeting this collection for the first time reads the packaging. Every row below is the README, a metadata file, or the public directory saying something the files do not support.",
    columns: ["The claim", "Where it is made", "What the files say"],
    rows: [
      {
        label: "Eight skills",
        cells: [
          "The README, which gives each one a section",
          "Nine folders hold a SKILL.md. vercel-cli-with-tokens has no section at all, despite 84.6K installs.",
        ],
      },
      {
        label: "react-native-guidelines",
        cells: [
          "A README section heading",
          "No skill has that name. The folder is react-native-skills and the frontmatter name is vercel-react-native-skills, so the heading matches neither.",
        ],
      },
      {
        label: "vercel-deploy-claimable",
        cells: [
          "A README section heading",
          "The folder and the skill are both called deploy-to-vercel. The README also describes the claimable upload as the whole skill, while version 3.0.0 of the SKILL.md leads with the Vercel CLI and treats that upload as the last of six routes.",
        ],
      },
      {
        label: "40 or more rules",
        cells: [
          "The README and the metadata file, for react-best-practices",
          "The SKILL.md says seventy, and the rules folder holds seventy rule files beside a sections index and a template. Our own register already follows the file rather than the README on this one.",
        ],
      },
      {
        label: "16 rules across 7 sections",
        cells: [
          "The README, for the React Native skill",
          "The metadata file sitting in the same folder says 35 or more across thirteen categories, and the folder holds thirty-six rule files. Two different wrong numbers, four directory levels apart.",
        ],
      },
      {
        label: "Five zip archives",
        cells: [
          "Committed into skills/, beside the folders",
          "Snapshots committed between January and April 2026. Three are older than the SKILL.md they mirror, one of them by four months. A sixth archive sits inside skills/deploy-to-vercel. The installer ignores all of them.",
        ],
      },
      {
        label: "13 skills",
        cells: [
          "The collection's page on skills.sh",
          "Nine exist. Four of the listed entries are names the repository no longer uses, and one of those four still carries installs of its own.",
        ],
      },
    ],
    notes: [
      "There is a date behind most of this. The README was last touched on May 26, 2026, in the commit that added the writing-guidelines skill, and the repository has moved since: the most recent change to a SKILL.md landed on August 12, 2026. A README that is three months behind a collection this widely installed is a small thing that costs a lot, because the README is what a search result quotes and what a model summarizing the repository will repeat.",
      "The directory has the same problem in a different shape. Renaming a skill in the repository does not remove the old entry from skills.sh, so a rename leaves a ghost behind with its historic install count attached. Four ghosts sit in the ungrouped bucket beside writing-guidelines, which is a live skill that simply never got added to the groupings file. Nothing published says how an entry is retired.",
      "None of this makes the skills worse. Seventy rules are seventy rules whether or not the README counted them correctly, and vercel-react-best-practices is a genuinely good file. The lesson is narrower and it applies to every collection, not just this one: the frontmatter and the files are the contract, and everything wrapped around them is prose that ages.",
    ],
    link: {
      lead: "For the wider question of which places to trust when you go looking for skills at all, and what each of them screens for, see",
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "vercel-agent-skills",
      "vercel-skills-config",
      "skills-sh-repo",
      "skills-cli",
    ],
  },
  install: {
    title: "How to install Vercel skills, step by step",
    intro:
      "There is one supported path and it is a single command. The steps below are the decisions around it: what you are installing, where it lands, and the one case where copying by hand needs an extra move.",
    steps: [
      {
        title: "List before you install",
        body: "Adding the list flag prints every skill in the repository with its full description and installs nothing. That is nine names and nine descriptions, which is the fastest way to see what you would be adding and to get the exact spelling of the name you want.",
      },
      {
        title: "Decide whether you want all nine",
        body: "Most teams do not. The React set and the two review skills are useful almost everywhere. deploy-to-vercel, vercel-cli-with-tokens, and vercel-optimize only make sense if the person running the agent is expected to deploy or to audit spend, and they are the three that reach furthest outside the folder.",
      },
      {
        title: "Run the installer",
        body: "The command takes the repository shorthand. Add the skill flag with a frontmatter name to install one, the agent flag to target specific agents, the global flag to install to your home directory rather than the project, and the yes flag when you are scripting it. With no agent flag the CLI detects what you have installed and asks.",
      },
      {
        title: "Know which directory you just wrote to",
        body: "The directory depends on the agent. Claude Code gets .claude/skills, Codex, Cursor, Gemini CLI, Copilot, and OpenCode all get the neutral .agents/skills in a project, and each has its own global path. The CLI publishes the whole mapping, sixty-nine rows of it, in its own README.",
      },
      {
        title: "If you copy by hand, rename the folder",
        body: "Four of the nine folders are named differently from the skill inside them. A recursive copy of skills/react-best-practices produces a directory called react-best-practices holding a skill named vercel-react-best-practices, which is the mismatch the specification tells you to avoid. Name the destination after the frontmatter, the way the installer does.",
      },
      {
        title: "Check the lock file",
        body: "The CLI writes a skills-lock.json recording, for each installed skill, the source repository, the source type, the path the SKILL.md came from, and a content hash. That file is the only place the folder-to-name mapping is written down after the fact, and it is what the update command reads later.",
      },
      {
        title: "Read the SKILL.md before the first real run",
        body: "Especially the five in the section above. Reading nine files takes less time than one bad deployment, and the CLI itself ends every successful install by telling you to review skills before use because they run with full agent permissions.",
      },
      {
        title: "Turn telemetry off if you have to",
        body: "The CLI sends anonymous usage data, including repository and skill identifiers for repositories GitHub confirms are public. Either of two environment variables disables it entirely, and both are documented. This is also the reason the install counts on skills.sh are a floor rather than a total.",
      },
    ],
    template: `# print all nine with their descriptions, install nothing
npx skills add vercel-labs/agent-skills --list

# install the whole collection to the agents the CLI detects
npx skills add vercel-labs/agent-skills

# install one skill, named the way the frontmatter names it
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices

# install to one named agent, globally, without prompts
npx skills add vercel-labs/agent-skills -a claude-code -g -y

# install without sending usage data
DISABLE_TELEMETRY=1 npx skills add vercel-labs/agent-skills`,
    sourceIds: ["skills-cli", "vercel-agent-skills", "agentskills-spec"],
  },
  team: {
    title: "How a team keeps one answer per job once the collection is installed",
    intro:
      "Installing is solved. One command puts nine folders on one machine. What is not solved is the next teammate knowing that your team uses four of the nine, ignores three, and has an opinion about the fifth, because none of that fits anywhere in the repository or the CLI.",
    body: [
      "The distribution half is genuinely good here, and better than most vendors manage. One command, sixty-nine rows of agent targets, a lock file, an update command, a remove command, and a directory with install counts and third-party audits attached. If your only problem is getting files onto machines, stop reading and run the command.",
      "The selection half has no home. Which four of the nine your team decided to keep, why deploy-to-vercel is not one of them, that the two review skills fetch their rules live and somebody should re-check them quarterly, that the five unlicensed folders were cleared by your own counsel or were not: all of that is knowledge that currently lives in a thread. The lock file records what got installed, not what was chosen or why.",
      "This gets worse rather than better once a second collection arrives. The moment a team is running Vercel's nine alongside a first-party set and whatever a teammate found last week, the question stops being how to install and becomes which one to reach for. That question has no vendor answer, because every vendor mechanism assumes its own collection is the only one in the room.",
      "Skills Board is a web application where a team keeps, searches, and shares its AI skills. Each saved entry keeps the original source repository and path visible, so the folder-and-name mismatch above is right there rather than discovered later. Teammates search it by task or by a tag the team invented, and each of them picks the way of using the skill that suits the agent they actually run.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and the path it came from, which for this collection is the difference between skills/react-best-practices and a skill named vercel-react-best-practices. A teammate can read the SKILL.md, and the scripts beside it, before anything runs.",
      },
      {
        label: "Copy an install command",
        body: "The command is npx skills add for the saved source, which is the same CLI Vercel publishes and the same one this page has been describing. It is one option among several, for the teammates whose setup it fits.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files available from the source at download time, for anyone who would rather place the folder by hand. If you take this route with one of the four mismatched folders, name the destination after the frontmatter rather than the source directory.",
      },
      {
        label: "Connect over MCP",
        body: "Skills Board is reachable as a Streamable HTTP MCP server at https://www.skillsboard.sh/api/mcp, with browser sign-in and no API key to copy, so an agent can search the team library from inside a session.",
      },
    ],
    limits: [
      "A saved skill is a team's own choice, not a security review, an approval, or a license opinion. The five Vercel folders with no license field are still five folders with no license field after you save one.",
      "Skills Board follows the latest version available from the saved source. It does not pin or preserve historical versions, which matters more than usual for the two skills that fetch their rules from a third repository at review time.",
      "Saving a skill does not install it. The files still have to land in a directory the agent scans, by the CLI or by hand.",
      "An MCP connection cannot install or run a skill, and it cannot edit or delete saved team skills.",
      "Nothing here replaces reading the file. For five of these nine, reading the file is the control that matters.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    link: {
      lead: "The operational version of this, with one canonical source and a tested install path per agent, is in",
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      trail: ".",
    },
    sourceIds: ["skills-cli", "vercel-agent-skills", "skills-sh-repo"],
  },
  openQuestions: {
    title: "What is not documented",
    intro:
      "Six things nobody publishes an answer to, found while reading the repository, the CLI, the directory, and Vercel's documentation on August 21, 2026. Each is a place where a confident claim usually gets invented, so each is written down as a gap instead.",
    entries: [
      {
        title: "What license covers the five folders that declare none",
        body: "Four skills state MIT in their own frontmatter. Five state nothing, the repository has no license file anywhere in its tree, and the GitHub API reports no license for it. The README closes with a License heading and the word MIT. Whether that line reaches the five folders is not something the repository answers, and it is the single most consequential gap on this page.",
      },
      {
        title: "Whether the README is maintained at all",
        body: "It documents eight skills, names two of them things nothing is called, omits a ninth entirely, and gives a rule count that its own SKILL.md contradicts. Its last commit was May 26, 2026. There is no note saying it is generated, no note saying it is stale, and no process published for keeping it in step with the folders.",
      },
      {
        title: "What the committed zip archives are for",
        body: "Five sit in skills/ and one sits inside a skill folder. They were committed between January and April 2026, three are older than the file they mirror, and nothing in the repository, the agent instructions, or the workflow explains them. They are not what the installer uses, and no documentation names them.",
      },
      {
        title: "How skills.sh retires an entry",
        body: "The collection page lists thirteen entries for nine skills. Four are names the repository no longer uses, one of them still carrying its own install count. Nothing published says whether a rename creates a new entry, whether the old one ever disappears, or whether the total installs figure counts both.",
      },
      {
        title: "What the deploy endpoints keep",
        body: "The fallback route uploads a tarball of the working tree to one of two hosted endpoints with no authentication. Nothing in the skill, the scripts, or the repository says how long that upload is retained, who can reach it before the claim URL is used, or what happens to an unclaimed deployment.",
      },
      {
        title: "What makes a repository Vercel published",
        body: "The documentation calls itself the official directory of Vercel published skills and sorts them into nine categories that reach past this collection into microfrontends, Next.js, and Turborepo repositories. No criterion for inclusion is published, and the entries under those headings did not render in a plain fetch, so the membership is something we can point at rather than list.",
      },
    ],
    sourceIds: [
      "vercel-agent-skills",
      "skills-sh-repo",
      "vercel-docs-skills",
      "skills-cli",
    ],
  },
  faq: [
    {
      question: "What are Vercel skills?",
      answer:
        "Vercel skills usually means vercel-labs/agent-skills, Vercel's official collection of Agent Skills. It holds nine folders, each with a SKILL.md that a coding agent loads when a task matches its description. The same two words are also a Vercel CLI command that recommends skills for the project you are standing in.",
    },
    {
      question: "Where do I find Vercel's agent skills?",
      answer:
        "In the vercel-labs/agent-skills repository on GitHub, and on its skills.sh page, which adds install counts and third-party security audits. Vercel's documentation carries a wider directory of published skills across nine categories, pointing at other repositories including microfrontends, Next.js, and Turborepo alongside the main collection.",
    },
    {
      question: "How do I install Vercel skills?",
      answer:
        "Run npx skills add vercel-labs/agent-skills. Add the skill flag with a frontmatter name to install one rather than all nine, the agent flag to target specific agents, and the global flag to write to your home directory instead of the project. The list flag prints everything and installs nothing.",
    },
    {
      question: "What license do Vercel skills use?",
      answer:
        "Four of the nine declare MIT in their own frontmatter. The other five declare nothing, and vercel-labs/agent-skills carries no license file anywhere in its tree, so there is nothing to fall back on. The README closes with a License heading reading MIT, which is a README line rather than a file.",
    },
    {
      question: "What does the vercel skills command do?",
      answer:
        "It is a Vercel CLI command, separate from the collection. With no arguments it detects the project framework and scans package.json for a curated set of notable dependencies, then recommends matching skills from the catalog. Pass a keyword and it searches instead, and a JSON flag makes the output machine readable.",
    },
    {
      question: "Do Vercel skills work outside Claude Code?",
      answer:
        "Yes. They are ordinary Agent Skills, so any client that reads SKILL.md can load them, and the installer maps sixty-nine rows of products to the directories each one uses. Codex, Cursor, Gemini CLI, GitHub Copilot, and OpenCode all take the vendor-neutral .agents/skills path inside a project.",
    },
    {
      question: "How do vercel-labs/agent-skills and vercel-labs/skills differ?",
      answer:
        "The first is content: nine skill folders and nothing executable of its own. The second is the tool behind npx skills and the skills.sh directory, and it installs skills from anybody's repository into dozens of agents. Only the second carries a license file, and it is MIT. Write-ups routinely quote them as one thing.",
    },
    {
      question: "How does a team share Vercel skills?",
      answer:
        "Installing is one command, so the difficulty is the selection rather than the distribution. Which of the nine your team keeps, which it refuses, and why, has no home in the repository or in the CLI lock file. That is the layer Skills Board holds beside the source, the command, and the ZIP.",
    },
  ],
  sources: [
    {
      id: "vercel-agent-skills",
      label: "vercel-labs/agent-skills on GitHub",
      href: "https://github.com/vercel-labs/agent-skills",
      note: "The collection itself, read through the GitHub API on August 21, 2026: the repository tree with no license file and no license reported, 30,287 stars and 2,708 forks, the nine skill folders with their SKILL.md frontmatter, the metadata files, the committed archives, the per-file commit dates, and the README last touched on May 26, 2026.",
    },
    {
      id: "vercel-agent-skills-agents",
      label: "vercel-labs/agent-skills: AGENTS.md",
      href: "https://github.com/vercel-labs/agent-skills/blob/main/AGENTS.md",
      note: "The repository's own instructions for authoring a skill: the directory layout, the kebab-case folder convention, the script requirements, and the manual install recipe that copies a source folder straight into a Claude Code skills directory. The CLAUDE.md beside it is a nine-byte pointer at this file.",
    },
    {
      id: "vercel-skills-config",
      label: "vercel-labs/agent-skills: skills.sh.json",
      href: "https://github.com/vercel-labs/agent-skills/blob/main/skills.sh.json",
      note: "The directory configuration: three groupings named React, Vercel, and Design covering eight skills, the instruction to place anything ungrouped at the bottom, and the absence of writing-guidelines from every group.",
    },
    {
      id: "skills-cli",
      label: "vercel-labs/skills: the skills CLI",
      href: "https://github.com/vercel-labs/skills",
      note: "The tool behind npx skills, MIT with a license file, read on August 21, 2026. The add, list, find, update, init, and remove commands and their flags, the sixty-nine row agent target table, seventy-seven named agents across those rows, the installer that names the destination directory after the frontmatter, the skills-lock.json shape, the compatibility matrix, and the telemetry section with the two variables that disable it.",
    },
    {
      id: "skills-sh-repo",
      label: "skills.sh: vercel-labs/agent-skills",
      href: "https://skills.sh/vercel-labs/agent-skills",
      note: "The public directory page for the collection, fetched August 21, 2026. Thirteen listed entries against nine files, the three groupings and the ungrouped bucket, the per-skill install counts quoted throughout this page, and the 2.1M total.",
    },
    {
      id: "skills-sh-skill",
      label: "skills.sh: vercel-react-best-practices",
      href: "https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices",
      note: "One skill page, for the shape of the rest: the install command with the frontmatter name after the flag, the rendered SKILL.md, the install count that differed from the repository page by a couple of thousand on the same day, and the three third-party security audits with their results.",
    },
    {
      id: "vercel-docs-skills",
      label: "Vercel: Agent Skills",
      href: "https://vercel.com/docs/agent-resources/skills",
      note: "Vercel's own directory page, carrying a last updated date of June 30, 2026. The definition it uses, the install commands, the claim that skills work with 18 or more AI agents, the eve project detection, and the nine category headings whose entries did not render in a plain fetch.",
    },
    {
      id: "vercel-docs-cli-skills",
      label: "Vercel: the vercel skills command",
      href: "https://vercel.com/docs/cli/skills",
      note: "The CLI command that shares the name, last updated June 6, 2026. Framework detection, the package.json scan for notable dependencies, keyword search, and the JSON and format flags.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The format these files are written to. The six frontmatter fields and their constraints, the rule that the name must match the parent directory, the compatibility field and what it is for, the optional scripts, references, and assets folders, progressive disclosure, and the 500-line recommendation.",
    },
    {
      id: "web-interface-guidelines",
      label: "vercel-labs/web-interface-guidelines",
      href: "https://github.com/vercel-labs/web-interface-guidelines",
      note: "The second repository the web-design-guidelines skill fetches its rules from at review time. MIT with a license file, unlike the collection that points at it.",
    },
    {
      id: "writing-guidelines-repo",
      label: "vercel-labs/writing-guidelines",
      href: "https://github.com/vercel-labs/writing-guidelines",
      note: "The equivalent second repository behind the writing-guidelines skill, also MIT with a license file.",
    },
  ],
  related: [
    {
      label: "The best Claude skills, and the bar we used",
      href: bestClaudeSkillsPath,
      description:
        "The four licensed Vercel skills beside everything else we opened, and why the other five were left out.",
    },
    {
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      description:
        "The format underneath all nine, including the naming rule four of these folders break.",
    },
    {
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      description:
        "skills.sh beside the other places skills come from, and what each one screens for.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The client most of these installs land on, and what each Claude surface does with a skill.",
    },
    {
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      description:
        "The other target the installer writes .agents/skills for, and what it publishes about context cost.",
    },
    {
      label: "OpenCode skills: what they are and how to use them",
      href: opencodeSkillsPath,
      description:
        "The one client that can refuse to load a skill, and where its documentation disagrees with the CLI matrix.",
    },
    {
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      description:
        "Which products actually document reading the format, against a CLI table that lists far more.",
    },
    {
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description:
        "One canonical SKILL.md, and a tested install path for each agent your teammates run.",
    },
  ],
  og: {
    eyebrow: "Vercel Skills",
    title: [
      { text: "Nine skills, four licenses," },
      { text: "and a README that counts eight.", accent: true },
    ],
    description:
      "What Vercel skills means, every skill in vercel-labs/agent-skills with its license, what the packaging gets wrong, and how a team keeps one answer per job.",
    contextLabel: "skillsboard.sh/vercel-skills",
    chips: ["SKILL.md", "npx skills add", "vercel-labs/agent-skills"],
  },
  ogAlt:
    "Explainer on Vercel skills: the nine skills in vercel-labs/agent-skills, their licenses, and the other things that share the name.",
  publishedAt: "2026-08-21",
  modifiedAt: "2026-08-21",
}
