import styles from "@/components/landing/styles/mcp.module.css"

/** The three tools this chapter promises, with the real MCP tool they map to. */
const mcpTools = [
  { name: "Search team skills", tool: "search_skills", arg: "(query)" },
  { name: "Find saved recommendations", tool: "search_collections", arg: "(query)" },
  { name: "Get install commands", tool: "get_skill_command", arg: "(skillId)" },
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
  { key: "wTrunk", axis: "x", leg: "legTrunk" },
  { key: "wSpur", axis: "x", leg: "legSpur" },
  { key: "wBusUp", axis: "y", leg: "legBus" },
  { key: "wBusDown", axis: "y" },
  { key: "wFeedA", axis: "x", leg: "legFeed" },
  { key: "wFeedB", axis: "x" },
  { key: "wFeedC", axis: "x" },
] as const

/**
 * Routing schematic: team library → MCP gateway → agent actions.
 * Desktop draws the signal path from scroll progress (--mcp-p); small screens
 * run a vertical route revealed on visibility. Both rest fully drawn.
 */
export function McpSchematic() {
  return (
    <figure
      className={styles.schematic}
      aria-label="Skills Board connects a shared team library to an MCP-compatible agent"
      data-motion-group="mcp"
    >
      <div className={styles.schematicGrid}>
        <div className={styles.libCol}>
          <p className={`${styles.colLabel} ${styles.colLabelLib}`}>
            Team library
          </p>

          <div className={styles.libraryPanel}>
            <div className={styles.libraryHead}>
              <p className={styles.schemaStackTitle}>
                Skills your team recommends
              </p>
            </div>
            <ul aria-hidden="true">
              {libraryRows.map((row, i) => (
                <li
                  key={row.name}
                  className={styles.schemaRow}
                  data-row={i + 1}
                >
                  <span className={styles.schemaRowIndex}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.schemaRowName}>{row.name}</span>
                  <span className={styles.schemaRowTag}>{row.tag}</span>
                  <span className={styles.schemaRowTick} />
                </li>
              ))}
            </ul>
            <span className={styles.libraryBus} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.schemaGateway}>
          <span
            className={`${styles.conduit} ${styles.conduitIn}`}
            aria-hidden="true"
          />

          <div className={styles.schemaWireBox} aria-hidden="true">
            {WIRES.map((wire) => (
              <span
                key={wire.key}
                className={`${styles.wire} ${styles[wire.key]}`}
                data-axis={wire.axis}
              >
                {"leg" in wire ? (
                  <span
                    className={`${styles.packetTrack} ${styles[wire.leg]}`}
                  >
                    <span className={styles.packetDot} />
                  </span>
                ) : null}
              </span>
            ))}

            <span className={`${styles.junction} ${styles.junctionUp}`} />
            <span className={`${styles.junction} ${styles.junctionMid}`} />
            <span className={`${styles.junction} ${styles.junctionDown}`} />
          </div>

          <span className={styles.schemaNode}>
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className={styles.schemaNodeMark}
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z"
                fill="currentColor"
              />
            </svg>
            <span className={styles.schemaNodeLabel}>MCP</span>
            <span className={styles.nodeFlash} aria-hidden="true" />
          </span>

          <span
            className={`${styles.conduit} ${styles.conduitOut}`}
            aria-hidden="true"
          />
        </div>

        <div className={styles.agentCol}>
          <p className={`${styles.colLabel} ${styles.colLabelAgent}`}>
            Inside your agent
          </p>

          <ul
            className={styles.agentActions}
            aria-label="Available MCP actions"
          >
            {mcpTools.map((tool, i) => (
              <li
                key={tool.name}
                className={styles.agentAction}
                data-action={i + 1}
              >
                <span className={styles.actionPort} aria-hidden="true" />
                <span className={styles.actionIndex} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.agentActionName}>{tool.name}</span>
                <span className={styles.actionTool} aria-hidden="true">
                  {tool.tool}
                  <span className={styles.actionArg}>{tool.arg}</span>
                </span>
                <span className={styles.actionState} aria-hidden="true">
                  <span data-state="off">idle</span>
                  <span data-state="on">ready</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.hopMeasure} aria-hidden="true">
          <span className={styles.hopRule} />
          <span>one hop</span>
          <span className={styles.hopRule} />
        </p>
      </div>

      <figcaption className={styles.schemaCaption}>
        <span className={`${styles.schemaCaptionText} text-pretty`}>
          Choose Claude, Cursor, VS Code, or another MCP-compatible client. The
          same library remains available in Skills Board.
        </span>
      </figcaption>
    </figure>
  )
}
