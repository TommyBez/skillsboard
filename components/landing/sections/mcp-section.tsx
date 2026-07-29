import { ShieldCheckIcon } from "lucide-react"
import { Suspense } from "react"

import { HomeCtaFallback, HomeMcpActions } from "@/components/landing/landing-ctas"
import { McpSchematic } from "@/components/landing/mcp-schematic"
import base from "@/components/landing/styles/base.module.css"
import styles from "@/components/landing/styles/mcp.module.css"

/** Decorative annotation for the copy column — a legend for the diagram. */
const specs = [
  { key: "endpoint", value: "/api/mcp" },
  { key: "transport", value: "streamable http" },
  { key: "auth", value: "oauth 2.1 · browser" },
  { key: "tools", value: "12 registered" },
] as const

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
              <span className={styles.readoutStack}>
                <span data-phase="0">standby</span>
                <span data-phase="1">indexing</span>
                <span data-phase="2">linking</span>
                <span data-phase="3">routing</span>
                <span data-phase="4">live</span>
              </span>
              <span className={styles.readoutBar} />
            </p>
          </div>

          <div className={styles.frameBody}>
            <div className={styles.copyCol}>
              <div className={styles.copyBody}>
                <h2
                  id="mcp-heading"
                  className="max-w-[16ch] text-balance text-4xl font-semibold leading-[1.02] tracking-display md:text-5xl lg:text-[clamp(2.6rem,3.6vw,3.4rem)]"
                >
                  Bring your team&apos;s skills into your agent.
                </h2>
                <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:text-[1.0625rem]">
                  Connect Skills Board through MCP. Your agent can search the
                  shared library, retrieve install commands, and save new skills
                  it discovers.
                </p>
                <div className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <ShieldCheckIcon
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <p>
                    Sign in securely through your browser—there&apos;s no API key
                    to copy.
                  </p>
                </div>
                <div className="mt-7">
                  <Suspense fallback={<HomeCtaFallback />}>
                    <HomeMcpActions />
                  </Suspense>
                </div>
              </div>

              <dl className={styles.specs} aria-hidden="true">
                {specs.map((spec, i) => (
                  <div
                    key={spec.key}
                    className={styles.specRow}
                    data-spec={i + 1}
                  >
                    <dt className={styles.specKey}>{spec.key}</dt>
                    <dd className={styles.specValue}>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <McpSchematic />
          </div>
        </div>
      </div>
    </section>
  )
}
