import styles from "@/components/landing/sections/mcp.module.css"

/** The three MCP tools this section claims, named as the server names them. */
const agentActions = [
  { name: "Search the library", tool: "search_skills" },
  { name: "Return the command", tool: "get_skill_command" },
  { name: "Save a new skill", tool: "add_skill" },
] as const

/**
 * Gateway → agent, drawn at rest. The wires used to draw themselves from
 * scroll progress, which meant the honest resting state of this figure was
 * three unfinished strokes and a column of ghost text.
 */
export function McpSchematic() {
  return (
    <figure
      className={styles.schematic}
      aria-label="An MCP-compatible agent calling the Skills Board tools"
    >
      <div className={styles.schemaGrid}>
        <div className={styles.gateway}>
          {/* y=4/54/104 are the centres of the three fixed-height rows; the
              box is centred on the same axis, so the endpoints land on a row
              centre at every viewport width. */}
          <svg
            className={styles.wires}
            viewBox="0 0 160 108"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M80 54h38V4h42" className={styles.wire} />
            <path d="M80 54H160" className={styles.wire} />
            <path d="M80 54h38v50h42" className={styles.wire} />
          </svg>
          <span className={styles.node}>
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className={styles.nodeMark}
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M3 3h26v7H11v4h14l4 4v11H3v-7h18v-4H7l-4-4V3Z"
                fill="currentColor"
              />
            </svg>
            <span className="lp-label">MCP</span>
          </span>
        </div>

        <div className={styles.agent}>
          <p className={`${styles.agentLabel} lp-label`}>Inside your agent</p>
          <ul className={styles.agentActions}>
            {agentActions.map((action) => (
              <li key={action.tool} className={styles.agentAction}>
                <span className="lp-h1">{action.name}</span>
                <span className={`${styles.agentActionTool} lp-code`}>
                  {action.tool}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <figcaption className={`${styles.caption} lp-small`}>
        The agent reads and adds to the same library. It cannot edit or delete
        what your team saved.
      </figcaption>
    </figure>
  )
}
