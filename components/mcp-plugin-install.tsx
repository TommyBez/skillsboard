import { CopyButton } from "@/components/copy-button"
import { claudeCodeInstallSnippet, pluginInstall } from "@/lib/plugin-install"

/**
 * One of the two ways to connect, not the first step of one way.
 *
 * The plugin ships the same server entry the guide below prints, so installing
 * it stands in for the manual configuration instead of preceding it. The page
 * puts an `or` between the two cards and both headings name the choice, because
 * the earlier draft read as step one of a sequence. Whichever path a reader
 * takes, the sign in at the end is the same, so this card states it too rather
 * than sending the reader down the manual guide to finish.
 */
export function McpPluginInstall() {
  return (
    <section
      aria-labelledby="mcp-plugin-heading"
      className="overflow-hidden rounded-[16px] border bg-card"
      data-testid="mcp-plugin-install"
    >
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          Option 1: the plugin
        </p>
        <h2 id="mcp-plugin-heading" className="mt-2 text-2xl font-semibold tracking-tight">
          Prefer a one-step setup? The plugin includes this MCP configuration
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The official Skills Board plugin already carries the{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">{pluginInstall.name}</code>{" "}
          server entry, so installing it replaces the manual setup in option 2.
          Do one or the other, not both. Claude Code is one client that installs
          it:
        </p>

        <div className="mt-4 overflow-hidden rounded-[12px] border">
          <pre
            aria-label="Plugin install commands"
            className="overflow-x-auto bg-foreground p-4 font-mono text-xs leading-5 text-background"
            tabIndex={0}
          >
            <code>{claudeCodeInstallSnippet}</code>
          </pre>
          <div className="flex justify-end bg-muted/30 px-3 py-2">
            <CopyButton
              value={claudeCodeInstallSnippet}
              label="Copy"
              compact
              ariaLabel="Copy the plugin install commands"
              copiedAriaLabel="Plugin install commands copied"
              analytics={{
                event: "plugin_install_copied",
                properties: { location: "mcp_settings" },
              }}
            />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          In any other client the plugins CLI supports, the same directory
          installs with{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">
            {pluginInstall.cliCommand}
          </code>
          . Either way, the last step is signing in through your browser when
          the client asks, and then you are done here.
        </p>
      </div>
    </section>
  )
}
