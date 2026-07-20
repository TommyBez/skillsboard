"use client"

import type { ReactNode } from "react"
import { useState } from "react"

import { CopyButton } from "@/components/copy-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { captureAnalyticsEvent } from "@/lib/analytics-client"

interface Step {
  text: ReactNode
  snippet?: string
}

interface ClientGuide {
  id: string
  analyticsId: McpClientAnalyticsId
  label: string
  steps: Step[]
}

type McpClientAnalyticsId = "claude_code" | "claude_desktop" | "cursor" | "other" | "vscode"

function InlineCode({ children }: { children: ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-foreground">{children}</code>
}

function Snippet({ code, client }: { code: string; client: McpClientAnalyticsId }) {
  return (
    <div className="mt-3 overflow-hidden rounded-[12px] border">
      <pre className="overflow-x-auto bg-foreground p-4 font-mono text-xs leading-5 text-background">
        <code>{code}</code>
      </pre>
      <div className="flex justify-end bg-muted/30 px-3 py-2">
        <CopyButton
          value={code}
          label="Copy"
          compact
          analytics={{ event: "mcp_config_copied", properties: { client } }}
        />
      </div>
    </div>
  )
}

function StepList({ steps, client }: { steps: Step[]; client: McpClientAnalyticsId }) {
  return (
    <ol className="space-y-6">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-4">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-semibold text-accent-foreground">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            {step.snippet ? <Snippet code={step.snippet} client={client} /> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

const troubleshooting = [
  {
    title: "The sign-in screen never opens",
    description:
      "Your client must support OAuth with dynamic client registration. Clients that only accept static API keys can't connect: there is no API key to paste.",
  },
  {
    title: "401 Unauthorized",
    description:
      "The access token expired or was never issued. Re-run your client's sign-in flow: /mcp in Claude Code, or the login prompt in Cursor and VS Code.",
  },
  {
    title: "The client connects but errors on requests",
    description:
      "Make sure the client uses the streamable HTTP transport. The SSE transport is not supported.",
  },
  {
    title: "Tools return no skills",
    description:
      "The connection sees the same libraries as the account that approved it. Check that you signed in with the account whose team libraries you expect.",
  },
]

export function McpSetupGuide({ mcpUrl, config }: { mcpUrl: string; config: string }) {
  const vscodeConfig = JSON.stringify(
    { servers: { "skills-board": { type: "http", url: mcpUrl } } },
    null,
    2,
  )

  const clients: ClientGuide[] = [
    {
      id: "claude-code",
      analyticsId: "claude_code",
      label: "Claude Code",
      steps: [
        {
          text: "Open a terminal and register the server with the Claude Code CLI.",
          snippet: `claude mcp add --transport http skills-board ${mcpUrl}`,
        },
        {
          text: (
            <>
              Inside Claude Code, run <InlineCode>/mcp</InlineCode> and select <InlineCode>skills-board</InlineCode> to
              sign in. Your browser opens the Skills Board consent screen.
            </>
          ),
        },
        {
          text: "Approve read-only access. The tools are available right away. Try asking Claude to list your saved skills.",
        },
      ],
    },
    {
      id: "claude-desktop",
      analyticsId: "claude_desktop",
      label: "Claude Desktop & claude.ai",
      steps: [
        {
          text: (
            <>
              Go to <strong className="font-medium text-foreground">Settings → Connectors</strong> and choose{" "}
              <strong className="font-medium text-foreground">Add custom connector</strong>.
            </>
          ),
        },
        {
          text: "Name it Skills Board and paste your MCP endpoint as the URL.",
          snippet: mcpUrl,
        },
        {
          text: (
            <>
              Click <strong className="font-medium text-foreground">Connect</strong> and approve the consent screen
              that opens in your browser.
            </>
          ),
        },
      ],
    },
    {
      id: "cursor",
      analyticsId: "cursor",
      label: "Cursor",
      steps: [
        {
          text: (
            <>
              Add the server to <InlineCode>.cursor/mcp.json</InlineCode> in your project, or{" "}
              <InlineCode>~/.cursor/mcp.json</InlineCode> to use it everywhere.
            </>
          ),
          snippet: config,
        },
        {
          text: (
            <>
              Open Cursor's MCP settings and click <strong className="font-medium text-foreground">Needs login</strong>{" "}
              next to <InlineCode>skills-board</InlineCode>.
            </>
          ),
        },
        {
          text: "Approve read-only access in the browser window that opens.",
        },
      ],
    },
    {
      id: "vscode",
      analyticsId: "vscode",
      label: "VS Code",
      steps: [
        {
          text: (
            <>
              Add the server to <InlineCode>.vscode/mcp.json</InlineCode> in your workspace.
            </>
          ),
          snippet: vscodeConfig,
        },
        {
          text: "The first time Copilot uses the server, VS Code prompts you to authorize it. Approve the consent screen in your browser.",
        },
      ],
    },
    {
      id: "other",
      analyticsId: "other",
      label: "Other clients",
      steps: [
        {
          text: "Any client that supports the streamable HTTP transport with OAuth works. Add this config. Most clients accept the standard mcpServers format.",
          snippet: config,
        },
        {
          text: "Authentication is discovered automatically from the endpoint, so there is nothing else to configure. Complete the sign-in flow when your client prompts you.",
        },
      ],
    },
  ]
  const [activeClient, setActiveClient] = useState(clients[0].id)

  function selectClient(value: string) {
    setActiveClient(value)
    const client = clients.find((item) => item.id === value)
    if (client) captureAnalyticsEvent("mcp_client_selected", { client: client.analyticsId })
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[16px] border bg-card">
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Setup guide</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Choose your agent</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Pick a client and follow its connection steps. You&apos;ll sign in securely through your browser—there&apos;s
            no API key to copy.
          </p>
        </div>

        <div className="border-t px-5 py-5 sm:px-6 sm:py-6">
          <Tabs value={activeClient} onValueChange={selectClient}>
            <TabsList className="max-w-full overflow-x-auto">
              {clients.map((client) => (
                <TabsTrigger key={client.id} value={client.id}>
                  {client.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {clients.map((client) => (
              <TabsContent key={client.id} value={client.id} className="pt-5">
                <StepList steps={client.steps} client={client.analyticsId} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="overflow-hidden rounded-[16px] border bg-card">
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Troubleshooting
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">If something doesn't work</h2>
        </div>

        <div className="border-t">
          {troubleshooting.map((item) => (
            <div key={item.title} className="border-b px-5 py-4 last:border-b-0 sm:px-6">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
