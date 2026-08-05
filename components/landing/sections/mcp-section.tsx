import { ShieldCheckIcon } from "lucide-react"

import { HomeMcpActions } from "@/components/landing/landing-ctas"
import { McpSchematic } from "@/components/landing/mcp-schematic"
import { chapterMark } from "@/components/landing/styles"

/** MCP — the signature routing chapter. */
export function McpSection() {
  return (
    <section
      id="mcp"
      aria-labelledby="mcp-heading"
      className="lp-mcp-chapter scroll-mt-14"
      data-mcp-chapter
      data-chapter-target="mcp"
    >
      <div className="lp-mcp-sticky">
        <div className="lp-mcp-frame">
          <div className="lp-mcp-frame-top">
            <span className="lp-mcp-frame-index" aria-hidden="true">
              03
            </span>
            <p
              className={`${chapterMark} min-w-0 flex-1 uppercase`}
              data-decode=""
            >
              MCP access
            </p>
            <p className="lp-mcp-readout" aria-hidden="true">
              <span className="lp-mcp-readout-key">signal</span>
              <span className="lp-mcp-readout-sep" />
              <span className="lp-mcp-readout-stack">
                <span data-phase="0">standby</span>
                <span data-phase="1">indexing</span>
                <span data-phase="2">linking</span>
                <span data-phase="3">routing</span>
                <span data-phase="4">live</span>
              </span>
            </p>
          </div>

          <div className="lp-mcp-frame-body">
            <div className="lp-mcp-copy-col">
              <div className="min-w-0 self-center">
                <h2
                  id="mcp-heading"
                  className="lp-mcp-copy-heading text-4xl font-semibold leading-[1.02] tracking-display md:text-5xl lg:text-[clamp(2.6rem,3.55vw,3.4rem)]"
                >
                  Bring your team’s skills into your agent.
                </h2>
                <p
                  className="max-w-[17.8em] mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:text-[1.0625rem]"
                >
                  Connect Skills Board through MCP. Your agent can search the
                  shared library, retrieve install commands, and save new skills
                  it discovers.
                </p>
                <div
                  className="lp-mcp-copy-shield mt-5 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
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
                  <HomeMcpActions />
                </div>
              </div>

              {/* Decorative annotation: the connection this chapter describes,
                  stated once, at the tier the type scale was missing. */}
              <div className="lp-mcp-endpoint" aria-hidden="true">
                <p className="lp-mcp-endpoint-head">
                  <span>endpoint</span>
                </p>
                <p className="lp-mcp-endpoint-value">/api/mcp</p>
                <p className="lp-mcp-endpoint-meta">
                  streamable http · oauth 2.1 · browser
                </p>
              </div>
            </div>

            <div className="lp-mcp-frame-spine" aria-hidden="true" />

            <McpSchematic />
          </div>
        </div>
      </div>
    </section>
  )
}
