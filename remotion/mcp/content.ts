/**
 * Every string the two MCP videos put on screen.
 *
 * The facts come out of this repository rather than out of a script: the config
 * block is `plugin/mcp.json` verbatim, the endpoint is the one
 * `getMcpResource()` returns in production, the scopes are the ones
 * `app/api/[transport]/route.ts` checks before a write, and every tool name is
 * registered in that route and listed on `/connect`. Only the example team, the
 * teammate, and the example skill are invented, and none of them carries a
 * product claim.
 */

export const brand = {
  wordmark: "Skills Board",
  /** The category phrase, verbatim, as the marketing context pins it. */
  category: "the agent-native skills registry for teams",
  domain: "www.skillsboard.sh",
  licence: "Free forever. MIT.",
} as const;

/** `plugin/mcp.json`, line for line. */
export const configLines = [
  "{",
  '  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",',
  '  "mcpServers": {',
  '    "skills-board": {',
  '      "type": "streamable-http",',
  '      "url": "https://www.skillsboard.sh/api/mcp"',
  "    }",
  "  }",
  "}",
] as const;

/** The line the highlight lands on once the block is on screen. */
export const CONFIG_URL_LINE = 5;

export const setup = {
  hook: {
    lines: [
      ["Your", "team's", "AI", "skills"],
      ["are", "not", "in", "your", "agent."],
    ],
    accentWord: "not",
    sub: "Paste the config. Approve access.",
  },
  config: {
    step: "Step 1",
    heading: "Add the MCP server to your client",
    file: "mcp.json",
    caption: "Streamable HTTP, and no API key to copy.",
  },
  consent: {
    step: "Step 2",
    heading: "Approve access in the browser",
    client: "Claude Code",
    title: "Claude Code wants to reach your team libraries",
    scopes: [
      { name: "skills:read", detail: "List and search team skills and collections" },
      { name: "skills:write", detail: "Save skills and organize collections" },
    ],
    approve: "Approve",
    granted: "Access granted",
    footer: "You sign in through your browser.",
  },
  tools: {
    step: "Done",
    heading: "13 tools in your client",
    caption: "Nine read. Four write, once skills:write is granted.",
    writeBadge: "write",
  },
} as const;

/** The 13 tools `app/api/[transport]/route.ts` registers, in registration order. */
export const tools = [
  { name: "list_skills", write: false },
  { name: "search_skills", write: false },
  { name: "get_skill_command", write: false },
  { name: "discover_skills", write: false },
  { name: "discover_repository_skills", write: false },
  { name: "add_skill", write: true },
  { name: "list_collections", write: false },
  { name: "search_collections", write: false },
  { name: "get_collection_skills", write: false },
  { name: "get_collection_install_command", write: false },
  { name: "create_collection", write: true },
  { name: "add_skill_to_collection", write: true },
  { name: "remove_skill_from_collection", write: true },
] as const;

/**
 * The example skill, its team, and the teammate who saved it are invented. The
 * tool name, its argument shape, and the endpoint printed in the client header
 * are the real ones.
 */
export const agentRun = {
  client: "Claude Code",
  server: "skills-board",
  endpoint: "www.skillsboard.sh/api/mcp",
  prompt: "draft the release notes for v2.4 the way our team does them",
  call: 'search_skills({ query: "release notes" })',
  hit: {
    source: "github.com/northwind/agent-skills",
    title: "release-notes",
    description: "Turn merged pull requests into release notes grouped by user impact.",
    tags: ["release", "docs"],
    savedBy: "Marta R.",
    team: "Northwind",
  },
  note: "Group by user impact. Link the pull request on every entry.",
  applyLine: "Skills Board carries the note your teammate saved.",
  output: {
    title: "## v2.4",
    rows: [
      "Faster team library search · #1841",
      "Collections in the sidebar · #1836",
      "ZIP download fixed on Safari · #1852",
    ],
    done: "release notes drafted",
  },
  reach: {
    line: "The same saved skill, from every MCP client.",
    clients: ["Claude Code", "Claude Desktop", "Cursor", "VS Code"],
  },
} as const;
