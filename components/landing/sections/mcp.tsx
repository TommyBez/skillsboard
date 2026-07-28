import { ShieldCheckIcon } from "lucide-react"
import type { ReactNode } from "react"

import shared from "@/components/landing/landing-shared.module.css"
import { McpSchematic } from "@/components/landing/mcp-schematic"
import styles from "@/components/landing/sections/mcp.module.css"

/**
 * MCP — the signature routing chapter. `actions` carries the
 * session-dependent connect CTA from the page.
 */
export function Mcp({ actions }: { actions: ReactNode }) {
  return (
    <section
      id="mcp"
      aria-labelledby="mcp-heading"
      className={`${styles.mcpChapter} scroll-mt-14 border-b border-border/70`}
      data-mcp-chapter
      data-chapter-target="mcp"
    >
      <div className={styles.mcpSticky}>
        <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 md:px-10 md:py-24 lg:grid-cols-[minmax(19rem,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16 lg:py-0">
          <div className="w-full">
            <p className={`${shared.chapterMark} uppercase`} data-decode="">
              MCP access
            </p>
            <h2
              id="mcp-heading"
              className="mt-5 max-w-[16ch] text-balance text-4xl font-semibold leading-[1.0] tracking-display md:text-6xl"
            >
              Bring your team&apos;s skills into your agent.
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Connect Skills Board through MCP. Your agent can search the
              shared library, retrieve install commands, and save new
              skills it discovers.
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
            <div className="mt-7">{actions}</div>
          </div>

          <McpSchematic />
        </div>
      </div>
    </section>
  )
}
