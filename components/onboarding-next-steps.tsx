import { ArrowRightIcon, CableIcon, PlusIcon, UserPlusIcon } from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { OnboardingInviteStep } from "@/components/onboarding-invite-step"
import { TrackedLink } from "@/components/tracked-link"
import { Button } from "@/components/ui/button"
import { mcpEntryEventProperties } from "@/lib/analytics-event-properties"
import { claudeCodeInstallSnippet, pluginInstall } from "@/lib/plugin-install"

interface OnboardingNextStepsProps {
  /** Members cannot create invitations, so they are told who can instead. */
  canInvite: boolean
  mcpUrl: string
  teamId: string
}

function StepCard({
  children,
  description,
  icon,
  marker,
  title,
}: {
  children: React.ReactNode
  description: string
  icon: React.ReactNode
  marker: string
  title: string
}) {
  return (
    <section className="flex flex-col overflow-hidden rounded-[16px] border bg-card">
      <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center gap-3">
          <span
            className="flex size-9 items-center justify-center rounded-[10px] bg-accent text-accent-foreground"
            aria-hidden="true"
          >
            {icon}
          </span>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {marker}
          </p>
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-5 flex flex-1 flex-col justify-end gap-4">{children}</div>
      </div>
    </section>
  )
}

function Snippet({
  analytics,
  ariaLabel,
  code,
  copyAriaLabel,
}: {
  analytics: React.ComponentProps<typeof CopyButton>["analytics"]
  ariaLabel: string
  code: string
  copyAriaLabel: string
}) {
  return (
    <div className="overflow-hidden rounded-[12px] border">
      <pre
        aria-label={ariaLabel}
        className="overflow-x-auto bg-foreground p-4 font-mono text-xs leading-5 text-background"
        tabIndex={0}
      >
        <code>{code}</code>
      </pre>
      <div className="flex justify-end bg-muted/30 px-3 py-2">
        <CopyButton value={code} label="Copy" compact ariaLabel={copyAriaLabel} analytics={analytics} />
      </div>
    </div>
  )
}

/**
 * The first screen of a team that exists but holds nothing yet.
 *
 * Connecting an agent leads, because that is where these skills are used, and
 * it was reachable only from a settings page before. Inviting a teammate sits
 * beside it rather than behind a first saved skill: a library one person can
 * reach is not a team library, and the ask reads the same on day zero.
 */
export function OnboardingNextSteps({ canInvite, mcpUrl, teamId }: OnboardingNextStepsProps) {
  return (
    <div data-testid="start-content" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <StepCard
        icon={<CableIcon className="size-4" />}
        marker="Start here"
        title="Connect your agent"
        description="Your library answers from inside Claude Code, Claude Desktop, Cursor, VS Code, and any other MCP client. Install the plugin, or paste the endpoint into the client you already use."
      >
        <Snippet
          analytics={{ event: "plugin_install_copied", properties: { location: "onboarding" } }}
          ariaLabel={`Plugin install commands for ${pluginInstall.name}`}
          code={claudeCodeInstallSnippet}
          copyAriaLabel="Copy the plugin install commands"
        />
        <Snippet
          analytics={{ event: "mcp_config_copied", properties: { client: "generic", team_id: teamId } }}
          ariaLabel="MCP endpoint"
          code={mcpUrl}
          copyAriaLabel="Copy the MCP endpoint"
        />
        <Button
          variant="outline"
          className="w-fit"
          nativeButton={false}
          render={(
            <TrackedLink
              href="/connect"
              analytics={{
                event: "mcp_entry_clicked",
                properties: mcpEntryEventProperties("onboarding", "/connect"),
              }}
            />
          )}
        >
          Open the setup guide
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </StepCard>

      <StepCard
        icon={<PlusIcon className="size-4" />}
        marker="Fill it"
        title="Add your first skill"
        description="Save a skill from a GitHub repository so the library has something to hand back. Once your agent is connected, it can save skills for you too."
      >
        <Button
          className="w-fit"
          nativeButton={false}
          render={(
            <TrackedLink
              href="/library"
              analytics={{
                event: "onboarding_step_clicked",
                properties: { step: "first_skill", team_id: teamId },
              }}
            />
          )}
        >
          Go to your library
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </StepCard>

      <StepCard
        icon={<UserPlusIcon className="size-4" />}
        marker="Share it"
        title="Invite your team"
        description={
          canInvite
            ? "Send one invitation now. Your teammate gets the same skills from their own agent setup, and the invite link works in Slack or a chat."
            : "This library is worth more with the rest of the team in it. A team admin can send the invitations."
        }
      >
        {canInvite ? <OnboardingInviteStep teamId={teamId} /> : null}
      </StepCard>
    </div>
  )
}
