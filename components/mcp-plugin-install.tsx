import { CopyButton } from "@/components/copy-button"
import { claudeCodeInstallSnippet, pluginInstall } from "@/lib/plugin-install"

/**
 * The shortest setup on the connection page.
 *
 * The plugin ships the same server entry the guide below prints, so installing
 * it replaces the config step for Claude Code users. It stands above the client
 * guide for that reason, and it stops where the guide takes over: the sign in
 * step is identical either way, so it is stated there once.
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
          Plugin
        </p>
        <h2 id="mcp-plugin-heading" className="mt-2 text-2xl font-semibold tracking-tight">
          Start with the plugin
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The official Skills Board plugin carries this MCP server entry, so
          installing it registers <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">{pluginInstall.name}</code> for you.
          Run both commands in Claude Code, then sign in as the guide below
          describes.
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
          Clients the plugins CLI supports can install the same directory with{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">
            {pluginInstall.cliCommand}
          </code>
          .
        </p>
      </div>
    </section>
  )
}
