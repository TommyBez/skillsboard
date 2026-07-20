import styles from "@/components/landing/landing-motion.module.css"

const mcpTools = [
  "Search team skills",
  "Find saved recommendations",
  "Get install commands",
] as const

/** Decorative library rows echoing the hero dossiers. Visual examples only. */
const libraryRows = [
  { idx: "001", name: "code-review" },
  { idx: "002", name: "pdf-extraction" },
  { idx: "003", name: "brand-voice" },
  { idx: "004", name: "sql-migrations" },
  { idx: "005", name: "release-notes" },
] as const

/**
 * Routing schematic: team library → MCP gateway → agent actions.
 * Desktop draws the signal paths from scroll progress (--mcp-p);
 * small screens run a vertical route revealed on visibility.
 */
export function McpSchematic() {
  return (
    <figure
      className={styles.schematic}
      aria-label="Skills Board connects a shared team library to an MCP-compatible agent"
      data-motion-group="mcp"
    >
      <div className={styles.schematicGrid}>
        <div className={styles.schemaStack}>
          <p className={styles.schemaEyebrow}>Team library</p>
          <p className={styles.schemaStackTitle}>Skills your team recommends</p>
          <ul className={styles.schemaRows} aria-hidden="true">
            {libraryRows.map((row) => (
              <li key={row.idx} className={styles.schemaRow}>
                <span className={styles.schemaRowIdx}>{row.idx}</span>
                <span className={styles.schemaRowName}>{row.name}</span>
                <span className={styles.schemaRowTick} />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.schemaGateway}>
          <svg
            className={styles.schemaWires}
            viewBox="0 0 160 320"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M0 160H56"
              className={styles.schemaTrunk}
              pathLength={1}
            />
            <path
              d="M104 160h14V100h42"
              className={`${styles.schemaBranch} ${styles.schemaBranchA}`}
              pathLength={1}
            />
            <path
              d="M104 160h56"
              className={`${styles.schemaBranch} ${styles.schemaBranchB}`}
              pathLength={1}
            />
            <path
              d="M104 160h14v90h42"
              className={`${styles.schemaBranch} ${styles.schemaBranchC}`}
              pathLength={1}
            />
            <path
              d="M0 160H56M104 160h56"
              className={styles.schemaPulse}
              pathLength={1}
            />
          </svg>
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
          </span>
        </div>

        <div className={styles.schemaAgent}>
          <p className={styles.schemaAgentLabel}>Inside your agent</p>
          <ul className={styles.agentActions} aria-label="Available MCP actions">
            {mcpTools.map((tool, i) => (
              <li key={tool} className={styles.agentAction} data-action={i + 1}>
                <span className={styles.agentActionIdx} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.agentActionName}>{tool}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <figcaption className={styles.schemaCaption}>
        Choose Claude, Cursor, VS Code, or another MCP-compatible client. The
        same library remains available in Skills Board.
      </figcaption>
    </figure>
  )
}
