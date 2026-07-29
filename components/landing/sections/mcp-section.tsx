import { ShieldCheckIcon } from "lucide-react"
import { Suspense } from "react"

import { HomeCtaFallback, HomeMcpActions } from "@/components/landing/landing-ctas"
import { McpSchematic } from "@/components/landing/mcp-schematic"
import base from "@/components/landing/styles/base.module.css"
import styles from "@/components/landing/styles/mcp.module.css"

/** MCP — the signature routing chapter. */
export function McpSection() {
  return (
    <section
      id="mcp"
      aria-labelledby="mcp-heading"
      className={`${styles.mcpChapter} scroll-mt-14`}
      data-mcp-chapter
      data-chapter-target="mcp"
    >
      <div className={styles.mcpSticky}>
        <div className={styles.frame}>
          <div className={styles.frameTop}>
            <span className={styles.frameIndex} aria-hidden="true">
              03
            </span>
            <p
              className={`${base.chapterMark} ${styles.frameMark} uppercase`}
              data-decode=""
            >
              MCP access
            </p>
            <p className={styles.readout} aria-hidden="true">
              <span className={styles.readoutKey}>signal</span>
              <span className={styles.readoutSep} />
              <span className={styles.readoutStack}>
                <span data-phase="0">standby</span>
                <span data-phase="1">indexing</span>
                <span data-phase="2">linking</span>
                <span data-phase="3">routing</span>
                <span data-phase="4">live</span>
              </span>
            </p>
          </div>

          <div className={styles.frameBody}>
            <div className={styles.copyCol}>
              <div className={styles.copyBody}>
                <h2
                  id="mcp-heading"
                  className={`${styles.copyHeading} text-4xl font-semibold leading-[1.02] tracking-display md:text-5xl lg:text-[clamp(2.6rem,3.55vw,3.4rem)]`}
                >
                  Bring your team’s skills into your agent.
                </h2>
                <p
                  className={`${styles.copyLede} mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-[1.0625rem]`}
                >
                  Connect Skills Board through MCP. Your agent can search the
                  shared library, retrieve install commands, and save new skills
                  it discovers.
                </p>
                <div
                  className={`${styles.copyShield} mt-5 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground`}
                >
                  <ShieldCheckIcon
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <p>
                    Sign in securely through your browser—there’s no API
                    key to copy.
                  </p>
                </div>
                <div className="mt-7">
                  <Suspense fallback={<HomeCtaFallback />}>
                    <HomeMcpActions />
                  </Suspense>
                </div>

                {/* The step after the button, in the chapter's instrument
                    voice. It is one library-row module tall, so the copy
                    column's last object is measured by the diagram's unit. */}
                <div className={styles.connect} aria-hidden="true">
                  <p className={styles.connectHead}>
                    <span>add the server</span>
                    <span className={styles.connectClient}>claude code</span>
                  </p>
                  <p className={styles.connectLine}>
                    <span className={styles.connectPrompt}>$</span>
                    <span className={styles.connectCmd}>
                      claude mcp add --transport http skills-board
                    </span>
                  </p>
                </div>
              </div>

              {/* Decorative annotation: the connection this chapter describes,
                  stated once, at the tier the type scale was missing. */}
              <div className={styles.endpoint} aria-hidden="true">
                <p className={styles.endpointHead}>
                  <span>endpoint</span>
                  <span className={styles.endpointCount}>12 tools</span>
                </p>
                <p className={styles.endpointValue}>/api/mcp</p>
                <p className={styles.endpointMeta}>
                  streamable http · oauth 2.1 · browser
                </p>
              </div>
            </div>

            <div className={styles.frameSpine} aria-hidden="true" />

            <McpSchematic />
          </div>
        </div>
      </div>
    </section>
  )
}
