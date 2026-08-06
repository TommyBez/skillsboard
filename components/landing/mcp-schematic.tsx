
/** Three representative tools, with the real MCP tool each action maps to. */
const mcpTools = [
  {
    name: "Search team skills",
    tool: "search_skills",
    arg: "(query: string)",
    ret: "\u2192 skill[]",
  },
  {
    name: "Search team collections",
    tool: "search_collections",
    arg: "(query: string)",
    ret: "\u2192 collection[]",
  },
  {
    name: "Get install commands",
    tool: "get_skill_command",
    arg: "(skillId: uuid)",
    ret: "\u2192 string",
  },
] as const

/** Decorative library rows echoing the hero dossiers. Visual examples only. */
const libraryRows = [
  { name: "code-review", tag: "eng" },
  { name: "pdf-extraction", tag: "ops" },
  { name: "brand-voice", tag: "brand" },
  { name: "sql-migrations", tag: "data" },
  { name: "release-notes", tag: "docs" },
] as const

/*
 * Wire segments. The wire box spans library-panel edge → agent-port line and
 * is exactly two action rows tall, so x 0% is the library edge, 50% the node
 * centre, 100% the ports, and y 0/50/100% are the three action-row centres.
 * Geometry lives in the stylesheet; this is only the draw order.
 */
const WIRES = [
  { key: "lp-mcp-w-trunk", axis: "x", leg: "lp-mcp-leg-trunk" },
  { key: "lp-mcp-w-spur", axis: "x", leg: "lp-mcp-leg-spur" },
  { key: "lp-mcp-w-bus-up", axis: "y", leg: "lp-mcp-leg-bus" },
  { key: "lp-mcp-w-bus-down", axis: "y" },
  { key: "lp-mcp-w-feed-a", axis: "x", leg: "lp-mcp-leg-feed" },
  { key: "lp-mcp-w-feed-b", axis: "x" },
  { key: "lp-mcp-w-feed-c", axis: "x" },
] as const

/**
 * Routing schematic: team library → MCP gateway → agent actions.
 * Desktop draws the signal path from scroll progress (--mcp-p); small screens
 * run a vertical route revealed on visibility. Both rest fully drawn.
 */
export function McpSchematic() {
  return (
    <figure
      className="lp-mcp-schematic"
      aria-label="Skills Board connects a shared team library to an MCP-compatible agent"
      data-motion-group="mcp"
      data-motion-state="pending"
    >
      <div className="lp-mcp-schematic-grid">
        <div className="lp-mcp-lib-col">
          <p className="lp-mcp-col-label lp-mcp-col-label-lib">
            Team library
          </p>

          <div className="lp-mcp-library-panel">
            <div className="lp-mcp-library-head">
              {/* Capped so the title stays on one line for as long as the
                  panel is wide enough to hold it — otherwise it is one line at
                  1440 and two at 1920. */}
              <p className="text-[clamp(0.95rem,1.09vw,1.02rem)] font-[650] leading-[1.22] tracking-[-0.022em] text-balance">
                Skills your team recommends
              </p>
            </div>
            <ul aria-hidden="true">
              {libraryRows.map((row, i) => (
                <li
                  key={row.name}
                  className="lp-mcp-schema-row"
                  data-row={i + 1}
                >
                  <span className="min-w-0 flex-1 truncate text-[0.85rem] font-semibold tracking-[-0.015em]">{row.name}</span>
                  <span className="lp-mcp-schema-row-tag">{row.tag}</span>
                </li>
              ))}
            </ul>
            <span className="lp-mcp-library-bus" aria-hidden="true" />
          </div>
        </div>

        <div className="lp-mcp-schema-gateway">
          <span
            className="lp-mcp-conduit lp-mcp-conduit-in"
            aria-hidden="true"
          />

          <div className="lp-mcp-schema-wire-box" aria-hidden="true">
            {WIRES.map((wire) => (
              <span
                key={wire.key}
                className={`lp-mcp-wire ${wire.key}`}
                data-axis={wire.axis}
              >
                {"leg" in wire ? (
                  <span
                    className={`lp-mcp-packet-track ${wire.leg}`}
                  >
                    <span className="lp-mcp-packet-dot" />
                  </span>
                ) : null}
              </span>
            ))}

            <span className="lp-mcp-junction lp-mcp-junction-up" />
            <span className="lp-mcp-junction lp-mcp-junction-mid" />
            <span className="lp-mcp-junction lp-mcp-junction-down" />
          </div>

          <span className="lp-mcp-schema-node">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className="lp-mcp-schema-node-mark"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z"
                fill="currentColor"
              />
            </svg>
            <span className="lp-mcp-schema-node-label">MCP</span>
            <span className="lp-mcp-node-flash" aria-hidden="true" />
          </span>

          <span
            className="lp-mcp-conduit lp-mcp-conduit-out"
            aria-hidden="true"
          />
        </div>

        <div className="lp-mcp-agent-col">
          <p className="lp-mcp-col-label lp-mcp-col-label-agent">
            Inside your agent
          </p>

          <ul
            className="lp-mcp-agent-actions"
            aria-label="Available MCP actions"
          >
            {mcpTools.map((tool, i) => (
              <li
                key={tool.name}
                className="lp-mcp-agent-action"
                data-action={i + 1}
              >
                <span className="lp-mcp-action-port" aria-hidden="true" />
                <span className="[grid-area:name] text-[clamp(1rem,1.21vw,1.18rem)] font-[650] leading-[1.15] tracking-[-0.025em] text-balance">{tool.name}</span>
                <span className="lp-mcp-action-tool" aria-hidden="true">
                  {tool.tool}
                  <span className="lp-mcp-action-arg">{tool.arg}</span>
                </span>
                <span className="lp-mcp-action-state" aria-hidden="true">
                  <span data-state="off">idle</span>
                  <span data-state="on">ready</span>
                </span>
                <span className="lp-mcp-action-ret" aria-hidden="true">
                  {tool.ret}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="lp-mcp-hop-measure" aria-hidden="true">
          <span className="lp-mcp-hop-rule" />
          <span className="mr-[-0.241em]">one hop</span>
          <span className="lp-mcp-hop-rule" />
        </p>
      </div>

      <figcaption className="lp-mcp-schema-caption">
        <span className="lp-mcp-schema-caption-text text-pretty">
          Representative actions are shown here. Choose Claude, Cursor, VS Code,
          or another MCP-compatible client; the same library remains available
          in Skills Board.
        </span>
      </figcaption>
    </figure>
  )
}
