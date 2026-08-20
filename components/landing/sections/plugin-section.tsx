import { CopyButton } from "@/components/copy-button"
import { claudeCodeInstallSnippet, pluginInstall } from "@/lib/plugin-install"

/**
 * Plugin band: the short route out of the MCP chapter.
 *
 * Deliberately outside the chapter grammar, like the updates band lower down:
 * no index, no measure rule, no `data-chapter-target`. The page numbers six
 * chapters and a seventh mark would renumber the argument to add an install
 * path. It carries the page measure and gutters so the card sits on the same
 * column as the header wordmark and the colophon.
 *
 * It follows the MCP chapter because that is where a reader has just been told
 * an agent can search the library: the plugin is the same connection with the
 * configuration already written.
 *
 * The copy stays client neutral on purpose. The directory carries an Agent
 * Plugins manifest, so Claude Code is one client that can install it rather
 * than the only one, and the two snippets are labelled as two clients rather
 * than as two steps.
 */
export function PluginSection() {
  return (
    <section
      id="plugin"
      aria-labelledby="plugin-heading"
      className="relative scroll-mt-14"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-16 md:px-10 md:pt-20">
        <div className="mx-auto max-w-3xl rounded-[3px] border border-border bg-card p-6 text-left md:p-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Official plugin
          </p>
          <h2
            id="plugin-heading"
            className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            One plugin install, in whichever client your team runs
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Skills Board is a web app where a team keeps the skills it
            recommends. The official plugin brings that library into an agent:
            it carries the MCP connection and one skill that explains how to
            search the library. The directory follows the Agent Plugins
            standard, so any client that supports it installs the same plugin.
            Install it, then sign in through your browser.
          </p>

          <div className="mt-6 overflow-hidden rounded-[3px] border border-border bg-[var(--surface-ink)] text-[var(--surface-ink-foreground)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                For example, in Claude Code
              </p>
              <CopyButton
                value={claudeCodeInstallSnippet}
                label="Copy commands"
                ariaLabel="Copy the plugin install commands"
                copiedAriaLabel="Plugin install commands copied"
                analytics={{
                  event: "plugin_install_copied",
                  properties: { location: "landing" },
                }}
                className="border-white/20 bg-white/10 text-[var(--surface-ink-foreground)] hover:border-white/35 hover:bg-white/15 hover:text-[var(--surface-ink-foreground)]"
              />
            </div>
            <pre
              aria-label="Plugin install commands"
              className="overflow-x-auto px-5 py-4 font-mono text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              tabIndex={0}
            >
              <code>{claudeCodeInstallSnippet}</code>
            </pre>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            In any other client the plugins CLI supports, the same directory
            installs with{" "}
            <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">
              {pluginInstall.cliCommand}
            </code>
            . Connecting still asks you to sign in to Skills Board and approve the
            scopes in your client.
          </p>
        </div>
      </div>
    </section>
  )
}
