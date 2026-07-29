import { KeyRoundIcon } from "lucide-react"
import type { ReactNode } from "react"

import { McpSchematic } from "@/components/landing/mcp-schematic"
import styles from "@/components/landing/sections/mcp.module.css"

/**
 * MCP — the library, seen from inside an agent. `actions` carries the
 * session-dependent connect CTA from the page.
 */
export function Mcp({ actions }: { actions: ReactNode }) {
  return (
    <section
      id="mcp"
      aria-labelledby="mcp-heading"
      className={`${styles.section} lp-section scroll-mt-14`}
    >
      <div className="lp-container">
        <div className={`${styles.row} lp-grid`} data-reveal="children">
          <div className={styles.copy}>
            <p className={`${styles.eyebrow} lp-label`}>MCP access</p>
            <h2 id="mcp-heading" className={`${styles.heading} lp-d2`}>
              Give your agent the same library.
            </h2>
            <p className={`${styles.lead} lp-lead`}>
              Connect over MCP once. Your agent then works from the skills your
              team already recommends.
            </p>
            <p className={`${styles.note} lp-small`}>
              <KeyRoundIcon className={styles.noteIcon} aria-hidden="true" />
              Sign in through your browser. There&apos;s no API key to copy.
            </p>
            <div className={styles.actions}>{actions}</div>
          </div>

          <McpSchematic />
        </div>
      </div>
    </section>
  )
}
