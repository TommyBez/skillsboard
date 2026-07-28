import type { ReactNode } from "react"

import shared from "@/components/landing/landing-shared.module.css"
import { LaunchDemoLoop } from "@/components/landing/launch-demo-loop"
import styles from "@/components/landing/sections/workflow.module.css"

const flowSteps = [
  {
    title: "Save the skill",
    copy: "Paste a GitHub skill URL you want the team to reuse. Skills Board keeps the name, description, and install command tied to it.",
  },
  {
    title: "Find it later",
    copy: "One searchable library for the whole team—no more scrolling chat history for that one link somebody posted.",
  },
  {
    title: "Use it your way",
    copy: "Open the source, copy the install command, download a ZIP, or let your agent fetch it over MCP.",
  },
] as const

/** Gated launch treatment: the current-product walkthrough loop. */
function LaunchDemo({ actions }: { actions: ReactNode }) {
  return (
    <div
      id="launch-demo"
      className="surface-shadow mt-12 grid scroll-mt-28 overflow-hidden border border-border bg-card lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]"
    >
      <LaunchDemoLoop />
      <div className="flex flex-col justify-center border-t border-border p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-10">
        <p className={`${shared.chapterMark} uppercase`}>
          Current product · synthetic demo data
        </p>
        <h3 className="mt-5 max-w-[14ch] text-balance text-3xl font-semibold leading-none tracking-display md:text-4xl">
          One teammate saves it. The next finds it.
        </h3>
        <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
          Skills Board is already available. This short walkthrough shows the current add → share → find loop using synthetic identities and a public skill.
        </p>
        <div className="mt-7">{actions}</div>
      </div>
    </div>
  )
}

/**
 * Workflow — three moves, indexed like a manual. `launchActions` carries the
 * session-dependent CTA for the gated demo block from the page.
 */
export function Workflow({
  showLaunchDemo,
  launchActions,
}: {
  showLaunchDemo: boolean
  launchActions: ReactNode
}) {
  return (
    <section
      id="flow"
      aria-labelledby="flow-heading"
      className={`${styles.flowSection} scroll-mt-14`}
      data-chapter-target="flow"
    >
      <div
        className="relative mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-24"
        data-motion-group="flow"
      >
        <div className={styles.flowHead}>
          <p className={`${shared.chapterMark} uppercase`} data-decode="">
            How it works
          </p>
          <h2
            id="flow-heading"
            className="mt-5 max-w-[18ch] text-balance text-4xl font-semibold leading-[1.0] tracking-display md:text-6xl"
          >
            Save once. Find fast. Use it your way.
          </h2>
        </div>

        {showLaunchDemo ? <LaunchDemo actions={launchActions} /> : null}

        <ol className={styles.flowRows}>
          {flowSteps.map((step) => (
            <li key={step.title} className={styles.flowRow}>
              <h3 className={styles.flowTitle}>{step.title}</h3>
              <p className={styles.flowCopy}>{step.copy}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
