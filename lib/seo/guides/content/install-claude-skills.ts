import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import { guidePaths, type GuideDefinition } from "@/lib/seo/guides/types"

export const installClaudeSkillsGuide: GuideDefinition = {
  path: guidePaths.installClaudeSkills,
  contentType: "guide",
  topics: ["claude skills", "claude code", "installation", "skill sharing"],
  relatedGuidePaths: [
    claudeSkillsPath,
    guidePaths.manageCrossAgentSkills,
    guidePaths.shareTeamSkills,
    codexSkillsPath,
  ],
  eyebrow: "Install and verify",
  title: "How to install Claude skills in Claude Code",
  seoTitle: "How to Install Claude Skills in Claude Code | Skills Board",
  description:
    "Where Claude Code stores skills on disk, every documented way to install one, and how to confirm it loaded. Checked against Anthropic documentation on 16 August 2026.",
  intro:
    "Claude Code loads skills from folders on your computer, so installing one means putting a SKILL.md folder in a directory Claude Code already reads, then checking that it appears. This guide covers the documented locations, the documented install paths, and the verification step. Every command and path here was checked against the linked documentation on 16 August 2026.",
  answer:
    "Claude Code reads skills from the filesystem. Put the folder at ~/.claude/skills/<skill-name>/SKILL.md to use the skill in every project, or at .claude/skills/<skill-name>/SKILL.md to scope it to one repository and commit it with the code. A plugin, enterprise managed settings, and a claude.ai sync run are the other documented sources. Run /skills to confirm Claude Code sees it.",
  answerLink: {
    lead: "For what a skill actually is, the frontmatter fields in full, and the surfaces beyond Claude Code that read the same folder, see",
    label: "Claude skills: what they are and how to use them",
    href: claudeSkillsPath,
    trail: ".",
  },
  citations: {
    answer: ["claude-code-skills"],
    problem: ["claude-code-skills"],
    decision: ["claude-code-skills"],
    steps: {
      0: ["anthropic-overview"],
      1: ["claude-code-skills"],
      2: ["claude-code-skills", "agentskills-spec"],
      3: ["claude-code-skills"],
      4: ["claude-code-discover-plugins", "claude-code-plugins", "anthropic-skills-repo"],
      5: ["claude-code-skills"],
      6: ["claude-code-skills"],
    },
  },
  corePrinciple:
    "Installing a skill is a file placed at a chosen scope, followed by a check that Claude Code read it.",
  problem:
    "The searches behind this page ask for a command: add skills to Claude Code, install Claude skills, where are Claude skills stored. Anthropic documents no CLI subcommand that installs a bare skill folder, so people copy folders into a directory Claude Code does not read, or into the right directory at a scope that another copy overrides, and then have no way to tell whether anything loaded. Knowing the documented locations and the one verification step removes both failures.",
  decisionTitle: "Choose the scope before you copy the folder",
  decisionIntro:
    "Where the folder goes decides who gets the skill. Claude Code documents four locations, plus a synced directory it fills from your claude.ai account. When the same skill name exists at more than one level, enterprise overrides personal and personal overrides project, and a skill at any of those levels overrides a skill synced from claude.ai.",
  comparisonColumns: ["Scope", "Documented path", "Who gets it", "Choose it when"],
  comparisonRows: [
    {
      label: "Personal",
      cells: [
        "~/.claude/skills/<skill-name>/SKILL.md",
        "You, across all your projects.",
        "The skill is part of how you work rather than part of a codebase.",
      ],
    },
    {
      label: "Project",
      cells: [
        ".claude/skills/<skill-name>/SKILL.md",
        "Anyone working in that repository, once the folder is committed.",
        "The skill belongs to the codebase and should arrive with a clone.",
      ],
    },
    {
      label: "Plugin",
      cells: [
        "<plugin>/skills/<skill-name>/SKILL.md",
        "Everyone who installs and enables the plugin.",
        "You are distributing several skills, or skills together with agents, hooks, and MCP servers.",
      ],
    },
    {
      label: "Enterprise",
      cells: [
        "Managed settings, as documented for your platform.",
        "Every user in the organization.",
        "The organization needs the skill present without each person installing it.",
      ],
    },
    {
      label: "claude.ai sync",
      cells: [
        "~/.claude/skills/synced/",
        "Your own account, after a non-interactive run with CLAUDE_CODE_SYNC_SKILLS set.",
        "You already enabled the skill on claude.ai and want it in local sessions too.",
      ],
    },
  ],
  stepsTitle: "Install a skill and confirm Claude Code loaded it",
  stepsIntro:
    "The manual path is worth learning first, because the plugin path and the sync path produce the same result: a SKILL.md folder in a directory Claude Code reads. Commands below are quoted from the documentation cited beside each step.",
  steps: [
    {
      title: "Read the skill before you install it",
      body: "Anthropic's guidance is to use skills only from sources you trust, because a skill gives an agent new instructions and executable code, and a malicious one can direct the agent to call tools in ways its stated purpose does not suggest. Review SKILL.md, every bundled script, and anything the skill fetches from an external URL. Treat the decision the way you would treat installing software.",
      output: "A skill you have read in full, from a source you are willing to run.",
    },
    {
      title: "Create the skill directory at the scope you chose",
      body: "For a personal skill the documentation creates the folder directly, with mkdir -p ~/.claude/skills/summarize-changes. For a project skill, create .claude/skills/<skill-name>/ inside the repository instead. The directory name becomes the command you type, so that example is invoked as /summarize-changes.",
      output: "One folder named after the skill, at one scope.",
    },
    {
      title: "Put SKILL.md inside the folder",
      body: "SKILL.md is the entry point and the only required file. It opens with YAML frontmatter and continues with the Markdown instructions Claude follows. Claude Code treats every frontmatter field as optional and recommends description, because that is the text it matches a request against. The Agent Skills specification is stricter: name and description are required, and name has to match the parent directory name, stay within 64 characters, and use lowercase letters, numbers, and single hyphens. Optional scripts, references, and assets sit beside SKILL.md and load only when the task reaches them.",
      output: "A folder whose SKILL.md says what the skill does and when to use it.",
    },
    {
      title: "Commit it when the whole team works in that repository",
      body: "Project skills load from .claude/skills/ in the directory where you start Claude Code and in every parent directory up to the repository root, so starting in a subdirectory still picks up skills defined at the root. Skills in nested .claude/skills/ directories below your starting directory are not loaded at startup: they load the first time Claude reads or edits a file inside that subdirectory. To load skills from a directory outside that path at startup, pass it with --add-dir.",
      output: "A skill that arrives with a clone instead of a paste.",
    },
    {
      title: "Or install a plugin that bundles the skills",
      body: "Add a marketplace with /plugin marketplace add owner/repo, then install from it with /plugin install plugin-name@marketplace-name. Anthropic's public skills repository is registered with /plugin marketplace add anthropics/skills. Plugin skills live in the plugin's skills/ directory and are namespaced by the plugin, so a skill named review inside my-plugin is invoked as /my-plugin:review. When the install summary says to run /reload-plugins, run it to activate the plugin in the current session.",
      output: "Several skills installed and updated through one source.",
    },
    {
      title: "Verify that Claude Code sees the skill",
      body: "Run /skills to open the menu of what is loaded, and ask what skills are available as a second check inside the session. The Skills row in /context reports the size of the skill listing the model actually receives, and /doctor estimates its context cost. Claude Code watches skill directories, so adding, editing, or removing a skill under ~/.claude/skills/, the project .claude/skills/, or a .claude/skills/ inside an --add-dir directory is picked up within the session, without a restart. Creating a top-level skills directory that did not exist when the session started does need a restart.",
      output: "The skill listed by name, before anyone relies on it.",
    },
    {
      title: "Invoke it, and decide who is allowed to",
      body: "A skill is available as a slash command named after its directory, and Claude can also load it on its own when a request matches the description. Set disable-model-invocation: true when only you should trigger it, which is the sensible default for anything that deploys, commits, or sends a message. Set user-invocable: false for background knowledge that only Claude should reach for.",
      output: "A skill that runs when you expect it and stays quiet when you do not.",
    },
  ],
  stepsLink: {
    lead: "Teammates who run a different agent need their own install path for the same folder, which is the subject of",
    label: "manage skills across Claude Code, Codex, and Cursor",
    href: guidePaths.manageCrossAgentSkills,
    trail: ".",
  },
  team: {
    title: "What a team still has to hand over",
    intro:
      "None of the locations above records the part teammates keep asking about: which skill to use for this task, and why this one. A personal folder is invisible to everyone else, a repository only reaches the people working in it, and a plugin distributes files rather than a recommendation. Skills Board is a shared library for that layer. It is free and MIT licensed, and it gives a teammate four ways to act on a saved entry.",
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and path it came from, so a teammate can read SKILL.md before creating any directory.",
      },
      {
        label: "Copy an install command",
        body: "For the teammates whose setup the command fits, without claiming it fits everyone.",
      },
      {
        label: "Download a ZIP",
        body: "The latest skill files available from the source at download time, for anyone who would rather place the folder themselves.",
      },
      {
        label: "Connect an agent over MCP",
        body: "An authenticated endpoint lets a compatible agent search the same library and retrieve install commands. Sign-in happens in the browser, with no API key to copy.",
      },
    ],
    limits: [
      "A saved skill is a team recommendation, not a security review, an approval, or a compatibility certification.",
      "Skills Board follows the latest version available from the saved source. It does not pin or preserve historical versions.",
      "It does not create directories, place files, or run skills inside your agent. The steps above stay yours to run.",
    ],
  },
  templateTitle: "The install note worth keeping",
  templateIntro:
    "Write this once per skill, beside the recommendation. It answers the questions the next person would otherwise ask in chat, and it records when the path was last checked, because product behavior changes.",
  templateFields: [
    {
      label: "Skill and source",
      value: "The skill name plus the repository and path the folder came from.",
    },
    {
      label: "Scope",
      value: "Personal, project, plugin, or managed, and the reason that scope was chosen.",
    },
    {
      label: "Install path",
      value: "The exact directory the folder goes in, written out rather than described.",
    },
    {
      label: "Verification",
      value: "The command that proves it loaded, and the output the reader should see.",
    },
    {
      label: "Reviewed at",
      value: "Who checked the path, on what date, against which documentation page.",
    },
    {
      label: "Re-review trigger",
      value: "The source changed, the skill failed a run, or the documented locations changed.",
    },
  ],
  copyTemplate: `Skill: <skill-name>
Source: <repository URL and path to the skill folder>
Scope: personal (~/.claude/skills/<skill-name>/) or project (.claude/skills/<skill-name>/)

Install
  1. Read SKILL.md and every bundled script at the source.
  2. mkdir -p ~/.claude/skills/<skill-name>
  3. Copy SKILL.md and any scripts, references, and assets into that folder.

Verify
  1. Run /skills and confirm <skill-name> is listed.
  2. Invoke /<skill-name> and confirm the expected output.

Reviewed by: <name>, <date>
Re-review when: the source changes, a run fails, or the documented skill locations change.`,
  pitfallsTitle: "Where installs go wrong",
  pitfalls: [
    {
      title: "Waiting for an install command",
      body: "Anthropic documents no CLI subcommand that installs a bare skill folder. The documented paths are a directory you create, a plugin you install, managed settings, and the claude.ai sync run. A catalog can ship its own installer, and that installer is documented by the catalog rather than by Anthropic.",
    },
    {
      title: "Installing the same name at two scopes",
      body: "When a skill name exists at more than one level, enterprise overrides personal and personal overrides project. A forgotten copy in ~/.claude/skills/ quietly wins over the one your team committed to the repository.",
    },
    {
      title: "Expecting a nested project skill at startup",
      body: "Skills in .claude/skills/ directories below your starting directory load only after Claude reads or edits a file inside that subdirectory. Until then they do not appear in autocomplete and cannot be invoked by name.",
    },
    {
      title: "Naming a folder synced",
      body: "The folder name synced is reserved in the enterprise, personal, and project skill locations, in any capitalization, because Claude Code writes skills downloaded from claude.ai there. A skill you author at that name is skipped.",
    },
    {
      title: "Leaving malformed frontmatter in place",
      body: "If the YAML is malformed, Claude Code loads the skill body with empty metadata. The slash command still works, but Claude has no description to match against, so the skill never triggers on its own. Run with --debug to see the parse error.",
    },
    {
      title: "Assuming a personal skill follows you everywhere",
      body: "Cowork sessions and cloud sessions do not read ~/.claude/skills/ on your machine. They load the skills enabled for your claude.ai account, and cloud sessions additionally load project skills committed to the cloned repository.",
    },
  ],
  checklist: [
    "The skill came from a source you were willing to read in full.",
    "The folder sits at one scope, and you can say why that scope.",
    "SKILL.md stays inside the specification fields if the folder also has to load outside Claude Code.",
    "Running /skills in a fresh session lists the skill by name.",
    "Invoking the skill produced the output you expected, not a near miss.",
    "The next teammate can find the source, the scope, and the verification step without asking you.",
  ],
  faq: [
    {
      question: "Where are Claude skills stored?",
      answer:
        "Claude Code documents four locations: ~/.claude/skills/<skill-name>/SKILL.md for personal skills, .claude/skills/<skill-name>/SKILL.md for a project, a skills directory inside a plugin, and enterprise managed settings. Skills you enable on claude.ai are downloaded into ~/.claude/skills/synced/ during a run with CLAUDE_CODE_SYNC_SKILLS set. A symlink at any of those paths is followed too.",
    },
    {
      question: "How do I add a skill to Claude Code without a plugin?",
      answer:
        "Create the directory, then write the file. The documentation creates a personal skill with mkdir -p ~/.claude/skills/summarize-changes and saves SKILL.md inside that folder. For a project skill, use .claude/skills/<skill-name>/ and commit it with the code. The directory name becomes the slash command you type.",
    },
    {
      question: "Do I have to restart Claude Code after adding a skill?",
      answer:
        "Usually not. Claude Code watches skill directories, so a skill added, edited, or removed under ~/.claude/skills/, the project .claude/skills/, or a .claude/skills/ inside an --add-dir directory is picked up within the session. Restart when you create a top-level skills directory that did not exist at startup.",
    },
    {
      question: "Why does my skill not show up?",
      answer:
        "Check the scope, then the frontmatter. A skill with the same name at a higher level wins, a nested project skill loads only after Claude touches a file in its directory, and malformed YAML loads the body with empty metadata so nothing matches your request. Run with --debug to see parse errors.",
    },
    {
      question: "Can I install a skill for a whole team in one step?",
      answer:
        "Not through the skill format itself. Anthropic documents three distribution scopes: commit the folder to the repository's .claude/skills/, ship a skills directory inside a plugin, or deploy through managed settings. Each one is set up separately, and each teammate still ends up with skill files on disk.",
    },
    {
      question: "Are Claude Code skills the same as claude.ai skills?",
      answer:
        "Same file format, separate installs. Anthropic documents that custom skills do not sync across surfaces: a claude.ai upload is not available through the API, an API skill is not on claude.ai, and Claude Code skills are filesystem based. Claude Code can download the ones you enabled on claude.ai into a synced folder.",
    },
  ],
  sources: [
    {
      id: "claude-code-skills",
      label: "Claude Code: skills documentation",
      href: "https://code.claude.com/docs/en/skills",
      note: "The four skill locations and their exact paths, the name conflict precedence, project and nested discovery, --add-dir, the reserved synced folder, live change detection, the /skills, /context, /doctor, and --debug checks, and the invocation control fields. Checked 16 August 2026.",
    },
    {
      id: "anthropic-overview",
      label: "Anthropic: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "Progressive disclosure and its token costs, the sharing scope of each surface, the statement that custom skills do not sync across surfaces, and the security guidance on installing skills from sources you do not trust. Checked 16 August 2026.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The required name and description fields, the name constraints including the match with the parent directory name, the optional scripts, references, and assets directories, and the length guidance for SKILL.md. Checked 16 August 2026.",
    },
    {
      id: "claude-code-plugins",
      label: "Claude Code: plugins",
      href: "https://code.claude.com/docs/en/plugins",
      note: "The skills/ directory inside a plugin, the plugin-name:skill-name namespace, and the /reload-plugins step reported by the install summary. Checked 16 August 2026.",
    },
    {
      id: "claude-code-discover-plugins",
      label: "Claude Code: discover and install plugins",
      href: "https://code.claude.com/docs/en/discover-plugins",
      note: "The /plugin marketplace add command and its accepted sources, and the /plugin install plugin-name@marketplace-name syntax. Checked 16 August 2026.",
    },
    {
      id: "anthropic-skills-repo",
      label: "anthropics/skills on GitHub",
      href: "https://github.com/anthropics/skills",
      note: "Anthropic's public Agent Skills repository, the marketplace command it publishes, and the licensing note separating the Apache 2.0 skills from the source-available document skills. Checked 16 August 2026.",
    },
  ],
  og: {
    variant: "ink",
    eyebrow: "Guide · Install and verify",
    title: [
      { text: "Install a Claude skill," },
      { text: "then prove it loaded.", accent: true },
    ],
    description:
      "The documented skill locations in Claude Code, the install paths, and the check that says it worked.",
    contextLabel: "skillsboard.sh/guides",
    titleSize: 76,
    chips: ["~/.claude/skills", ".claude/skills"],
  },
  ogAlt:
    "Skills Board guide: how to install Claude skills in Claude Code and verify they loaded.",
  publishedAt: "2026-08-16",
  modifiedAt: "2026-08-16",
}
